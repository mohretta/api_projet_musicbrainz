# modeles_donnees/schemas.py
from pydantic import BaseModel
from typing import List, Optional

class LienWeb(BaseModel):
    type: str
    url: str

class Artiste(BaseModel):
    id: str
    nom: str
    type: Optional[str] = None
    pays: Optional[str] = None
    tags: Optional[List[str]] = []
    alias: Optional[List[str]] = []
    liens_web: Optional[List[LienWeb]] = []
    membres: Optional[List[str]] = []

class Album(BaseModel):
    id: str
    titre: str
    date_sortie: Optional[str] = None
    type: Optional[str] = None
    pochette_url: Optional[str] = None

class Chanson(BaseModel):
    id: str
    titre: str
    duree_ms: Optional[int] = None
