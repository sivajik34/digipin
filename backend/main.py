from fastapi import FastAPI,Depends
from fastapi.middleware.cors import CORSMiddleware
from backend.digipin_service import router as digipin_router
from backend.database import  metadata
from fastapi_users import FastAPIUsers
from fastapi_users.router import get_register_router
from backend.user_manager import get_user_manager
from backend.auth import fastapi_users, auth_backend, current_active_user
from backend.models import User
from backend.schemas.user_schemas import UserRead, UserCreate, UserUpdate
from uuid import UUID
from backend.qr_router import router as qr_router
from backend.digipin_user_router import router as user_digipin_router
from backend.google_router import router as google_router
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request

fastapi_users = FastAPIUsers[User, UUID](
    get_user_manager,
    [auth_backend],
)

app = FastAPI()
# After app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
app.include_router(user_digipin_router)
app.include_router(google_router)

@app.get("/")
@limiter.limit("10/minute")
async def root(request: Request):
    return {"message": "DIGIPIN backend with auth"}

@app.get("/protected-route")
async def protected_route(user=Depends(current_active_user)):
    return {"message": f"Hello {user.email}"}
   
    

