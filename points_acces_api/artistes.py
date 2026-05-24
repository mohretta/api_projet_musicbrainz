# points_acces_api/artistes.py
from fastapi import APIRouter
from typing import List
from modeles_donnees.schemas import Artiste, Album
from logique_metier.service_musicbrainz import rechercher_artiste, recuperer_details_artiste, recuperer_albums_artiste

router = APIRouter(prefix="/api/artistes", tags=["Artistes"])

@router.get("/recherche", response_model=List[Artiste])
async def recherche_artiste_endpoint(nom: str):
    return await rechercher_artiste(nom)

@router.get("/{artist_id}", response_model=Artiste)
async def details_artiste_endpoint(artist_id: str):
    return await recuperer_details_artiste(artist_id)

@router.get("/{artist_id}/albums", response_model=List[Album])
async def albums_artiste_endpoint(artist_id: str):
    return await recuperer_albums_artiste(artist_id)
