from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.digipin_service import router as digipin_router
from database import database, engine, metadata
from fastapi_users import FastAPIUsers
from auth import fastapi_users, auth_backend, current_active_user
from models import User

app = FastAPI()

# Allow React frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:3000","https://courageous-paletas-7e8641.netlify.app","https://digipincode.com","https://www.digipincode.com","https://api.digipincode.com"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables if not exists (simple example, use Alembic for production)
metadata.create_all(bind=engine)

@app.on_event("startup")
async def on_startup():
    await database.connect()

@app.on_event("shutdown")
async def on_shutdown():
    await database.disconnect()

app.include_router(
    fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"]
)

app.include_router(
    fastapi_users.get_register_router(), prefix="/auth", tags=["auth"]
)

app.include_router(digipin_router)

@app.get("/")
async def root():
    return {"message": "DIGIPIN backend with auth"}

@app.get("/protected-route")
async def protected_route(user=Depends(current_active_user)):
    return {"message": f"Hello {user.email}"}
   
    

