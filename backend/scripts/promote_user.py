import asyncio
from uuid import UUID
from database import async_session_maker
from models import User

async def promote_to_admin(user_id: UUID):
    async with async_session_maker() as session:
        user = await session.get(User, user_id)
        if user:
            user.role = "admin"
            user.is_superuser = False
            await session.commit()
            print(f"✅ User {user.email} promoted to admin.")
        else:
            print("❌ User not found.")

if __name__ == "__main__":
    user_id_input = input("Enter user ID (UUID): ").strip()
    asyncio.run(promote_to_admin(UUID(user_id_input)))
