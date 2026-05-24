# points_acces_api/albums.py
from fastapi import APIRouter
from typing import List
from modeles_donnees.schemas import Album, Chanson
from logique_metier.service_musicbrainz import rechercher_album, recuperer_chansons_album

router = APIRouter(prefix="/api/albums", tags=["Albums"])

@router.get("/recherche", response_model=List[Album])
async def recherche_album_endpoint(titre: str):
    return await rechercher_album(titre)

@router.get("/{album_id}/chansons", response_model=List[Chanson])
async def chansons_album_endpoint(album_id: str):
    return await recuperer_chansons_album(album_id)
