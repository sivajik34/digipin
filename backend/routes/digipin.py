import httpx
from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ortools.constraint_solver import routing_enums_pb2, pywrapcp
from schemas.digipin_schemas import OptimizeRouteResponse,OptimizeRouteRequest,OptimizedRoute,RouteLocation

from schemas.digipin_schemas import (
    EncodeDigipinResponse, DecodeDigipinResponse, AddressResponse
)
from services.service_area_service import is_within_service_area
from database import get_db
from utils.digipin import is_valid_digipin,get_digipin,get_lat_lng_from_digipin,haversine

router = APIRouter()

@router.get("/api/digipin", response_model=EncodeDigipinResponse, tags=["DIGIPIN"])
async def get_digipin_by_lat_lng(
    lat: float = Query(..., ge=8, le=37, description="Latitude value (8 to 37 degrees)"),
    lng: float = Query(..., ge=68, le=98, description="Longitude value (68 to 98 degrees)")
):
    """
    Generate a DIGIPIN code for the given latitude and longitude.

    - **lat**: Latitude in degrees
    - **lng**: Longitude in degrees
    - **Returns**: Encoded DIGIPIN code
    """
    try:
        digipin = get_digipin(lat, lng)
        return {"digipin": digipin}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/latlng", response_model=DecodeDigipinResponse, tags=["DIGIPIN"])
async def get_latlng(
    digipin: str = Query(
        ...,
        min_length=1,
        max_length=14,
        description="DIGIPIN code (10 characters using F,C,J,K,L,M,P,T and digits 2–9)"
    )
):
    """
    Decode a DIGIPIN code into its latitude and longitude.

    - **digipin**: A valid 10-character DIGIPIN
    - **Returns**: Latitude and longitude as float values
    """
    clean_digipin = digipin.replace("-", "")
    if not is_valid_digipin(clean_digipin):
        raise HTTPException(
            status_code=400,
            detail="Invalid DIGIPIN: must be exactly 10 characters using only F,C,J,K,L,M,P,T and digits 2-9"
        )
    
    try:
        result = get_lat_lng_from_digipin(clean_digipin)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/api/address", response_model=AddressResponse, tags=["DIGIPIN"])
async def get_address_from_digipin(
    digipin: str = Query(..., description="DIGIPIN code to be decoded into address")
):
    """
    Get full address details from a DIGIPIN code using reverse geocoding.

    - **digipin**: A valid 10-character DIGIPIN
    - **Returns**: Address fields including full address, city, state, country, and pincode
    """
    clean_digipin = digipin.replace("-", "")
    if not is_valid_digipin(clean_digipin):
        raise HTTPException(status_code=400, detail="Invalid DIGIPIN")

    coords = get_lat_lng_from_digipin(clean_digipin)
    lat, lng = coords["latitude"], coords["longitude"]
    async with httpx.AsyncClient() as client:       

        reverse_res = await client.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={
                "lat": lat,
                "lon": lng,
                "format": "json",
                "addressdetails": 1,
            },
            headers={"User-Agent": "digipin-app"}
        )
        reverse_res.raise_for_status()
        data = reverse_res.json()
        address = data.get("address", {})

        return {
            "latitude": lat,
            "longitude": lng,
            "full_address": data.get("display_name"),
            "pincode": address.get("postcode"),
            "city": address.get("city") or address.get("town") or address.get("village"),
            "state": address.get("state"),
            "country": address.get("country"),
        }

@router.get("/api/digipin/validate", tags=["DIGIPIN"])
async def validate_digipin_service_area(
    digipin: str = Query(..., description="DIGIPIN to validate"),
    db: AsyncSession = Depends(get_db)
):
    clean_digipin = digipin.replace("-", "")
    if not is_valid_digipin(clean_digipin):
        raise HTTPException(status_code=400,detail="Invalid DIGIPIN: must be exactly 10 characters using only F,C,J,K,L,M,P,T and digits 2-9")
    coords = get_lat_lng_from_digipin(clean_digipin)
    is_valid = await is_within_service_area(db, coords["latitude"], coords["longitude"])
    return {
        "digipin": clean_digipin,
        "latitude": coords["latitude"],
        "longitude": coords["longitude"],
        "is_within_service_area": is_valid
    } 

@router.post("/api/optimize-route", response_model=OptimizeRouteResponse, tags=["DIGIPIN"])
async def optimize_route(req: OptimizeRouteRequest):
    all_points = [RouteLocation(digipin=req.depot, priority=1, time_window=(0, 9999))] + req.locations

    try:
        coords = [get_lat_lng_from_digipin(loc.digipin) for loc in all_points]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    distance_matrix = [[int(haversine(p1['latitude'], p1['longitude'], p2['latitude'], p2['longitude']))
                        for p2 in coords] for p1 in coords]

    manager = pywrapcp.RoutingIndexManager(len(distance_matrix), req.vehicles, 0)
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        """Returns the distance between the two nodes."""
        return distance_matrix[manager.IndexToNode(from_index)][manager.IndexToNode(to_index)]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # --- START MODIFICATIONS ---
    # Convert meters (from haversine) to minutes for travel time.
    # Assuming average speed of 30 km/h = 30000 meters / 60 minutes = 500 meters/minute
    # Also, add a fixed service time of 5 minutes per stop.
    def time_callback(from_index, to_index):
        """Returns the travel time in minutes between the two nodes, plus service time."""
        travel_distance_m = distance_matrix[manager.IndexToNode(from_index)][manager.IndexToNode(to_index)]
        travel_time_minutes = int(travel_distance_m / 500) # 500 meters/minute
        service_time_minutes = 5 # Fixed service time per stop
        return travel_time_minutes + service_time_minutes

    time_callback_index = routing.RegisterTransitCallback(time_callback)

    # Max slack (wait time) at a node, max cumulative time for the dimension.
    # Set maximum travel time for a vehicle to 8 hours (480 minutes)
    # 0 for `fix_start_cumul_to_zero` means the cumulative time at the depot starts at 0.
    # AddDimension returns a bool, GetDimensionOrDie returns the dimension object.
    routing.AddDimension(
        time_callback_index,
        30, # slack_max: allow vehicles to wait up to 30 minutes at a location if arriving early
        480, # capacity: total travel time plus service time for a vehicle cannot exceed 480 minutes (8 hours)
        False, # fix_start_cumul_to_zero: ensure the cumulative time at the depot (start node) is 0
        "Time"
    )
    time_dim = routing.GetDimensionOrDie("Time") # Retrieve the dimension object

    # Set time windows for each location. These values should now be in minutes.
    for idx, loc in enumerate(all_points):
        index = manager.NodeToIndex(idx)
        start, end = loc.time_window
        time_dim.CumulVar(index).SetRange(start, end)
        
    # Optional: Add a penalty for not visiting locations if you want to allow non-visits
    # based on priorities. The current setup will try hard to visit all unless impossible.
    for i, loc in enumerate(all_points[1:], 1): # Skip depot (index 0)
        # Higher priority (1) means lower penalty for non-visit (more critical to visit).
        # Lower priority (3) means higher penalty for non-visit (more flexible to skip).
        # Using a large penalty makes it unlikely to skip unless no other solution exists.
        penalty = (4 - loc.priority) * 1000000 # Increased penalty to strongly encourage visits
        routing.AddDisjunction([manager.NodeToIndex(i)], penalty)

    search_params = pywrapcp.DefaultRoutingSearchParameters()
    search_params.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC) # Use PATH_CHEAPEST_ARC for initial solution
    search_params.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH) # Use GUIDED_LOCAL_SEARCH for improvement
    search_params.time_limit.FromSeconds(30) # Increased time limit to 30 seconds for better solutions
    # --- END MODIFICATIONS ---

    solution = routing.SolveWithParameters(search_params)
    if not solution:
        raise HTTPException(status_code=400, detail="No solution found (consider adjusting time windows or capacities)")

    routes = []
    for v in range(req.vehicles):
        index = routing.Start(v)
        stops = []
        # Add the depot as the starting stop
        stops.append(all_points[manager.IndexToNode(index)].digipin) 
        
        while not routing.IsEnd(index):
            node_index = manager.IndexToNode(index)
            # Only add if it's not the starting depot again or the end depot
            if node_index != 0 or (node_index == 0 and len(stops) == 0): 
                stops.append(all_points[node_index].digipin)
            index = solution.Value(routing.NextVar(index))
        # Add the final depot stop if it's different from the initial one
        if all_points[manager.IndexToNode(index)].digipin != stops[-1]:
            stops.append(all_points[manager.IndexToNode(index)].digipin)
        
        # Ensure the route ends at the depot if it's not already there
        if len(stops) > 1 and stops[-1] != req.depot:
             stops.append(req.depot)

        # Filter out consecutive duplicate depot stops for cleaner routes
        final_stops = []
        for i, stop in enumerate(stops):
            if i == 0 or stop != final_stops[-1] or stop != req.depot:
                final_stops.append(stop)
            # Handle the case where the route might look like [depot, A, depot, depot]
            # If the last stop is a duplicate depot and not the *only* stop, remove it
            if i > 0 and stop == req.depot and final_stops[-2] == req.depot:
                 final_stops.pop() # Remove the redundant second depot

        routes.append(OptimizedRoute(vehicle_id=v, stops=final_stops))

    # Post-processing to remove empty routes or routes with only depot
    filtered_routes = []
    for route in routes:
        # A valid route should have at least the depot, then a location, then the depot again.
        # Or if only one stop, it must be the depot, but this means no locations were visited.
        # For this problem, we want to see actual stops.
        if len(route.stops) > 1 and (len(route.stops) > 2 or route.stops[0] != route.stops[1]):
            # Further refinement: if the route is just [depot, depot] and there were actual locations to visit,
            # this route isn't useful for carrying locations.
            # Only include if it contains more than just the depot and its return.
            if len(set(route.stops)) > 1 or (len(route.stops) == 2 and route.stops[0] == req.depot and route.stops[1] == req.depot and len(req.locations) == 0):
                 filtered_routes.append(route)
        elif len(route.stops) == 1 and route.stops[0] == req.depot and len(req.locations) == 0:
            # If there are no locations and only depot, include it as a valid empty route essentially
            filtered_routes.append(route)

    return OptimizeRouteResponse(routes=filtered_routes)

