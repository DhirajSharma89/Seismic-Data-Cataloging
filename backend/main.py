from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from routers import blocks, surveys, acquisition, acquisition_media
from routers import processing, processing_media
from routers import interpretation, interpretation_media
from routers import users
from routers import requisitions

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(blocks.router)
app.include_router(surveys.router)
app.include_router(acquisition.router)
app.include_router(acquisition_media.router)
app.include_router(processing.router)
app.include_router(processing_media.router)
app.include_router(interpretation.router)
app.include_router(interpretation_media.router)
app.include_router(users.router)
app.include_router(requisitions.router)

# ===== Serve React build =====
from fastapi.responses import RedirectResponse

@app.get("/")
async def root():
    return RedirectResponse(url="https://seismic-data-cataloging-4.onrender.com/")

@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    return RedirectResponse(url=f"https://seismic-data-cataloging-4.onrender.com/{full_path}")
