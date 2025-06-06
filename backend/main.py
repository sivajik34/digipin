from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.digipin_service import router as digipin_router

app = FastAPI()

# Allow React frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:3000","https://courageous-paletas-7e8641.netlify.app","https://digipincode.com","https://www.digipincode.com","https://api.digipincode.com"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "DIGIPIN Backend Running"}

app.include_router(digipin_router)    
    

