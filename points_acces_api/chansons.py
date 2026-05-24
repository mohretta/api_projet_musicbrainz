# points_acces_api/chansons.py
from fastapi import APIRouter
from typing import List
from modeles_donnees.schemas import Chanson
from logique_metier.service_musicbrainz import rechercher_chanson

router = APIRouter(prefix="/api/chansons", tags=["Chansons"])

@router.get("/recherche", response_model=List[Chanson])
async def recherche_chanson_endpoint(titre: str):
    return await rechercher_chanson(titre)
