from fastapi import FastAPI,Depends
from fastapi.middleware.cors import CORSMiddleware
from backend.digipin_service import router as digipin_router
from backend.database import  metadata
from fastapi_users import FastAPIUsers
from fastapi_users.router import get_register_router
from backend.user_manager import get_user_manager
from backend.auth import fastapi_users, auth_backend, current_active_user
from backend.models import User
from backend.schemas import UserRead, UserCreate, UserUpdate
from uuid import UUID
from backend.qr_router import router as qr_router

fastapi_users = FastAPIUsers[User, UUID](
    get_user_manager,
    [auth_backend],
)

app = FastAPI()

# Allow React frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:3000","https://courageous-paletas-7e8641.netlify.app","https://digipincode.com","https://www.digipincode.com","https://api.digipincode.com"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(
    fastapi_users.get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"]
)

app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

app.include_router(digipin_router)
app.include_router(qr_router)

@app.get("/")
async def root():
    return {"message": "DIGIPIN backend with auth"}

@app.get("/protected-route")
async def protected_route(user=Depends(current_active_user)):
    return {"message": f"Hello {user.email}"}
   
    

