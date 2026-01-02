from fastapi import FastAPI
from endpoints import system, planner, accounts, places
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()
from fastapi.staticfiles import StaticFiles
import os
from lib.file_ops import static_dir, ensure_dir

app = FastAPI(
    title="Itinera AI",
    description="Advanced AI-driven itinerary generation engine",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(system.router, prefix="/api/v1/itinera/system")
app.include_router(planner.router, prefix="/api/v1/itinera/planner")
app.include_router(accounts.router, prefix="/api/v1/itinera/accounts")
app.include_router(places.router, prefix="/api/v1/itinera/places")

# Mount static directory for generated images
ensure_dir(static_dir())
app.mount("/static", StaticFiles(directory=static_dir()), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
