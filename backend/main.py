from uuid import UUID

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from auth import auth_backend, current_active_user
from digipin_router import router as digipin_router
from digipin_user_router import router as user_digipin_router
from google_router import router as google_router
from models import User
from qr_router import router as qr_router
from schemas.user_schemas import UserRead, UserCreate, UserUpdate
from user_manager import get_user_manager
from fastapi_users import FastAPIUsers
from routes import proof
# Initialize FastAPI Users
fastapi_users = FastAPIUsers[User, UUID](
    get_user_manager,
    [auth_backend],
)

# Initialize FastAPI app
app = FastAPI()

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://courageous-paletas-7e8641.netlify.app",
        "https://digipincode.com",
        "https://www.digipincode.com",
        "https://api.digipincode.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def include_routers():
    # Auth routes
    app.include_router(
        fastapi_users.get_auth_router(auth_backend),
        prefix="/auth/jwt",
        tags=["auth"],
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

    # Application-specific routers
    app.include_router(digipin_router)
    app.include_router(qr_router)
    app.include_router(user_digipin_router)
    app.include_router(google_router)
    app.include_router(proof.router)


include_routers()


@app.get("/")
@limiter.limit("10/minute")
async def root(request: Request):
    return {"message": "DIGIPIN backend app"}


@app.get("/protected-route")
async def protected_route(user=Depends(current_active_user)):
    return {"message": f"Hello {user.email}"}
