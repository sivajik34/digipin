from fastapi_users import FastAPIUsers
from fastapi_users.authentication import BearerTransport, AuthenticationBackend, JWTStrategy
from backend.user_manager import get_user_db
from backend.models import User
from fastapi import Depends
from backend.config import SECRET,JWT_LIFETIME_SECONDS

bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=JWT_LIFETIME_SECONDS)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, int](
    get_user_db,
    [auth_backend],
)

current_active_user = fastapi_users.current_user(active=True)

