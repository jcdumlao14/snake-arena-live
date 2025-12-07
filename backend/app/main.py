from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, leaderboard, spectate

app = FastAPI(
    title="Snake Arena Online API",
    description="API for the Snake Arena Online multiplayer game",
    version="1.0.0",
)

# CORS Configuration
origins = [
    "http://localhost",
    "http://localhost:80",
    "http://localhost:3000",
    "http://localhost:5173", # Common vite port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(spectate.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to Snake Arena Online API"}

from app.database import engine, Base

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
