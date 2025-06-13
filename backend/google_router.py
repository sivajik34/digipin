from fastapi import APIRouter, Depends, HTTPException
from google.oauth2 import id_token
from google.auth.transport import requests
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models import User
from database import get_async_session
from auth import create_jwt_token
from pydantic import BaseModel

class GoogleToken(BaseModel):
    token: str


router = APIRouter()

GOOGLE_CLIENT_ID = "616953302611-4iu6121c1j60b413cl75i80q60eakj8n.apps.googleusercontent.com"

@router.post("/auth/google")
async def login_with_google(data: GoogleToken, db: AsyncSession = Depends(get_async_session)):
    try:
        idinfo = id_token.verify_oauth2_token(
            data.token,
            requests.Request(),
            GOOGLE_CLIENT_ID,
        )
        print("Google token verified:", idinfo)
        email = idinfo["email"]

        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            user = User(email=email, hashed_password="", is_oauth=True)
            db.add(user)
            await db.commit()
            await db.refresh(user)

        jwt = await create_jwt_token(user)
        return {"access_token": jwt, "token_type": "bearer"}

    except Exception as e:
        print("Google token verification failed:", e)
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")