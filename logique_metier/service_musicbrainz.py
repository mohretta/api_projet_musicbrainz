# logique_metier/service_musicbrainz.py
import httpx
from configuration.parametres import MUSICBRAINZ_API_URL, USER_AGENT
from fastapi import HTTPException

async def faire_requete(endpoint: str, params: dict):
    headers = {"User-Agent": USER_AGENT, "Accept": "application/json"}
    params["fmt"] = "json"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{MUSICBRAINZ_API_URL}{endpoint}", params=params, headers=headers, timeout=10.0)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Ressource introuvable")
            raise HTTPException(status_code=response.status_code, detail="Erreur lors de l'appel à l'API MusicBrainz")
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail="Erreur réseau ou API indisponible")

async def rechercher_artiste(nom: str):
    data = await faire_requete("/artist/", {"query": f"artist:{nom}"})
    if not data or not data.get("artists"):
        return []
    return [{"id": a["id"], "nom": a["name"], "type": a.get("type"), "pays": a.get("country")} for a in data["artists"][:10]]

async def rechercher_album(titre: str):
    data = await faire_requete("/release-group/", {"query": f"releasegroup:{titre}"})
    if not data or not data.get("release-groups"):
        return []
    return [{"id": a["id"], "titre": a["title"], "type": a.get("primary-type"), "date_sortie": a.get("first-release-date"), "pochette_url": f"http://coverartarchive.org/release-group/{a['id']}/front-250"} for a in data["release-groups"][:10]]

async def rechercher_chanson(titre: str):
    data = await faire_requete("/recording/", {"query": f"recording:{titre}"})
    if not data or not data.get("recordings"):
        return []
    return [{"id": a["id"], "titre": a["title"], "duree_ms": a.get("length")} for a in data["recordings"][:10]]

async def recuperer_details_artiste(artist_id: str):
    data = await faire_requete(f"/artist/{artist_id}", {"inc": "url-rels+tags+aliases+artist-rels"})
    
    tags = [t["name"] for t in data.get("tags", [])][:5]
    alias = [a["name"] for a in data.get("aliases", [])][:5]
    
    liens_web = []
    for rel in data.get("relations", []):
        if rel.get("target-type") == "url" and "url" in rel:
            liens_web.append({"type": rel.get("type", "Lien"), "url": rel["url"]["resource"]})
            
    membres = []
    for rel in data.get("relations", []):
        if rel.get("target-type") == "artist" and rel.get("type") == "member of band" and "artist" in rel:
            membres.append(rel["artist"]["name"])

    return {
        "id": data["id"], 
        "nom": data["name"], 
        "type": data.get("type"), 
        "pays": data.get("country"),
        "tags": tags,
        "alias": alias,
        "liens_web": liens_web,
        "membres": membres
    }

async def recuperer_albums_artiste(artist_id: str):
    data = await faire_requete("/release-group/", {"artist": artist_id})
    if not data or not data.get("release-groups"):
        return []
    return [
        {
            "id": a["id"], 
            "titre": a["title"], 
            "type": a.get("primary-type"), 
            "date_sortie": a.get("first-release-date"),
            "pochette_url": f"http://coverartarchive.org/release-group/{a['id']}/front-250"
        } 
        for a in data["release-groups"][:20]
    ]

async def recuperer_chansons_album(album_id: str):
    # Appel pour récupérer les détails de l'album avec les pistes
    # Note: On utilise le release-group ID, donc on doit d'abord trouver un release
    # Mais si l'album_id est déjà un release, on peut utiliser /release/
    # En fait, notre `album_id` vient de `release-group`.
    # Il faut donc interroger /release?release-group={album_id}&inc=recordings
    data = await faire_requete("/release/", {"release-group": album_id, "inc": "recordings"})
    if not data or not data.get("releases") or len(data["releases"]) == 0:
        return []
    
    # Prendre le premier release (le plus représentatif)
    premier_release = data["releases"][0]
    media = premier_release.get("media", [])
    if not media:
        return []
        
    pistes = media[0].get("tracks", [])
    chansons = []
    for p in pistes:
        rec = p.get("recording", {})
        chansons.append({
            "id": rec.get("id", p.get("id")),
            "titre": rec.get("title", "Titre inconnu"),
            "duree_ms": rec.get("length")
        })
    return chansons
