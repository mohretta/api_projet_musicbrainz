from fastapi import APIRouter, HTTPException
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET

router = APIRouter()

@router.get("/api/actualites/{nom_artiste}", tags=["Actualités"])
async def get_actualites(nom_artiste: str):
    """
    Récupère les dernières actualités pour un artiste donné via le flux RSS Google News.
    """
    try:
        # Encoder la recherche pour l'URL
        query = urllib.parse.quote(f"{nom_artiste} musique")
        # URL du flux RSS Google News en français
        url = f"https://news.google.com/rss/search?q={query}&hl=fr&gl=FR&ceid=FR:fr"
        
        # Faire la requête avec un User-Agent pour éviter le blocage
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            xml_data = response.read()
            
        # Parser le XML
        root = ET.fromstring(xml_data)
        articles = []
        
        # Récupérer les 4 premiers articles
        for item in root.findall('./channel/item')[:4]:
            title = item.find('title').text if item.find('title') is not None else "Nouvelle Actualité"
            link = item.find('link').text if item.find('link') is not None else "#"
            pubDate = item.find('pubDate').text if item.find('pubDate') is not None else ""
            source = item.find('source').text if item.find('source') is not None else "Actualité"
            
            # Nettoyer un peu le titre si la source y est attachée à la fin (ex: "Titre - Source")
            if " - " in title:
                title = title.rsplit(" - ", 1)[0]

            articles.append({
                "titre": title,
                "lien": link,
                "date": pubDate,
                "source": source
            })
            
        return articles
    except Exception as e:
        print(f"Erreur RSS: {e}")
        # En cas d'erreur, on retourne une liste vide au lieu de planter l'interface
        return []
