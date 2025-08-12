from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import blocks, surveys, acquisition, acquisition_media
from routers import processing, processing_media
from routers import interpretation, interpretation_media
from routers import users
from routers import requisitions 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only. Restrict in prod.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(blocks.router)
app.include_router(surveys.router)
app.include_router(acquisition.router)
app.include_router(acquisition_media.router)
app.include_router(processing.router)
app.include_router(processing_media.router)
app.include_router(interpretation.router)
app.include_router(interpretation_media.router)
app.include_router(users.router)
app.include_router(requisitions.router) # NEW: Include the requisitions router

