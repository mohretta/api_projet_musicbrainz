# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from points_acces_api import artistes, albums, chansons, actualites, ia

app = FastAPI(
    title="API MusicBrainz",
    description="Une API REST moderne interagissant avec MusicBrainz pour une veille technologique.",
    version="1.0.0"
)

# Configuration CORS pour permettre au frontend React de communiquer avec ce backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En production, spécifiez l'URL du frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(artistes.router)
app.include_router(albums.router)
app.include_router(chansons.router)
app.include_router(actualites.router)
app.include_router(ia.router)

@app.get("/")
def racine():
    return {"message": "Bienvenue sur l'API Musicale (MusicBrainz). Allez sur /docs pour voir la documentation de l'API."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)