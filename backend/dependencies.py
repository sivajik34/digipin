from fastapi import Depends, HTTPException, status
from auth import fastapi_users
from models import User

current_active_user = fastapi_users.current_user(active=True)

async def get_current_admin_user(user: User = Depends(current_active_user)):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access only"
        )
    return user
