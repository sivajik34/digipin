from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from digipin_service import router as digipin_router

app = FastAPI()

# Allow React frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "DIGIPIN Backend Running"}

app.include_router(digipin_router)    
    

