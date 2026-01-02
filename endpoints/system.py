from fastapi import APIRouter

router = APIRouter(
    prefix="",
    tags=["system"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Itinera AI"}

@router.get("/detailed")
async def detailed_health_check():
    """Detailed health check with system information"""
    return {
        "status": "healthy",
        "service": "Itinera AI",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/v1/itinera/system/",
            "detailed_health": "/api/v1/itinera/system/detailed"
        }
    }
