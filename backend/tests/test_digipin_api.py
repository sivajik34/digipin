import pytest
from httpx import AsyncClient
from fastapi import status
import httpx
from main import app  # Adjust import based on your entry point


@pytest.mark.asyncio
async def test_get_digipin_by_lat_lng():
    async with AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/digipin", params={"lat": 17.385, "lng": 78.4867})
    assert response.status_code == status.HTTP_200_OK
    assert "digipin" in response.json()


@pytest.mark.asyncio
async def test_get_latlng_from_digipin():
    # Example valid digipin from previous encoding
    valid_digipin = "5J2-CTF-456L"  # Replace with actual one generated
    async with AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/latlng", params={"digipin": valid_digipin})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "latitude" in data and "longitude" in data


@pytest.mark.asyncio
async def test_validate_digipin(monkeypatch):
    async def fake_service_area(db, lat, lng):
        return True

    import digipin_router
    monkeypatch.setattr(digipin_router, "is_within_service_area", fake_service_area)

    async with AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/digipin/validate", params={"digipin": "425-FF5-8KMT"})
    assert response.status_code == 200
    assert response.json()["is_within_service_area"] is True


@pytest.mark.asyncio
async def test_get_address_from_digipin(monkeypatch):
    class MockResponse:
        status_code = 200
        def raise_for_status(self): pass
        def json(self):
            return {
                "display_name": "Someplace, Hyderabad",
                
                    "postcode": "500081",
                    "city": "Hyderabad",
                    "state": "Telangana",
                    "country": "India"
                
            }

    async def mock_get(*args, **kwargs):
        return MockResponse()

    import httpx
    monkeypatch.setattr(httpx.AsyncClient, "get", mock_get)

    async with AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/address", params={"digipin": "425-FF5-J535"})
    assert response.status_code == 200
    data = response.json()
    assert data["city"] == "Hyderabad"


@pytest.mark.asyncio
async def test_optimize_route_basic():
    request_data = {
        "depot": "5J2-CP3-J7L6",
        "vehicles": 1,
        "locations": [
            {"digipin": "5J2-CPJ-JCJF", "priority": 1, "time_window": [0, 9999]},
            {"digipin": "5CJ-7K3-FKFK", "priority": 2, "time_window": [0, 9999]}
        ]
    }
    async with AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/optimize-route", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert "routes" in data
    assert isinstance(data["routes"], list)
