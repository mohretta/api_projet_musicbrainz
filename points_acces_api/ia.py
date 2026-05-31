# points_acces_api/ia.py
from fastapi import APIRouter, HTTPException
import urllib.request
import urllib.parse
import urllib.error
import ssl
import json
import os

router = APIRouter()

@router.get("/api/ia/analyse/{nom_artiste}", tags=["IA"])
async def get_analyse_ia(nom_artiste: str):
    """
    Génère une présentation et des anecdotes exclusives pour un artiste via l'API gratuite Gemini 1.5 Flash.
    """
    # Récupérer la clé API depuis les variables d'environnement
    api_key = os.getenv("GEMINI_API_KEY", "")
    
    # Fallback 1 : essayer de récupérer depuis le fichier de configuration existant
    if not api_key:
        try:
            from configuration.parametres import GEMINI_API_KEY as config_key
            if config_key:
                api_key = config_key
        except Exception as conf_err:
            print(f"Erreur de chargement depuis parametres.py: {conf_err}")

    # Fallback 2 : essayer de lire un fichier .env à la racine
    if not api_key:
        try:
            if os.path.exists(".env"):
                with open(".env", "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#"):
                            parts = line.split("=", 1)
                            if len(parts) == 2 and parts[0].strip() == "GEMINI_API_KEY":
                                api_key = parts[1].strip().strip('"').strip("'")
                                break
        except Exception as env_err:
            print(f"Erreur de lecture du fichier .env: {env_err}")
            
    if not api_key:
        return {
            "error": True,
            "message": "Clé API Gemini non configurée. Veuillez configurer le fichier .env ou la variable d'environnement GEMINI_API_KEY."
        }
    
    try:
        # Prompt sophistiqué pour l'analyse musicale
        prompt = (
            f"Tu es un analyste musical d'élite et passionné. Génère une fiche d'analyse approfondie en français pour l'artiste '{nom_artiste}' "
            f"au format JSON avec exactement les clés suivantes :\n"
            f"- 'style_description': une description courte, vivante et captivante (environ 4 phrases) de son style unique, son univers et ses thèmes fétiches.\n"
            f"- 'impact': un paragraphe de 3 phrases expliquant pourquoi cet artiste est légendaire ou comment il a influencé son genre musical.\n"
            f"- 'anecdotes': un tableau de exactement 3 anecdotes secrètes, insolites ou croustillantes sur sa carrière.\n"
            f"- 'ia_conseil': une recommandation d'artistes ou de styles similaires à écouter absolument.\n"
            f"Renvoie uniquement le dictionnaire JSON."
        )
        
        # URL de l'API Gemini 2.5 Flash Lite stable (v1)
        url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key={api_key}"
        
        # Données de la requête compatibles avec toutes les versions de l'API stable v1
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        }
        
        req_body = json.dumps(payload).encode('utf-8')
        
        # Faire la requête POST avec urllib avec bypass de la validation SSL
        req = urllib.request.Request(
            url, 
            data=req_body, 
            headers={'Content-Type': 'application/json'}
        )
        
        context = ssl._create_unverified_context()
        with urllib.request.urlopen(req, context=context) as response:
            res_data = response.read().decode('utf-8')
            
        # Parser la réponse de Gemini
        gemini_response = json.loads(res_data)
        text_content = gemini_response['candidates'][0]['content']['parts'][0]['text']
        
        # Nettoyage robuste du texte retourné par l'IA (au cas où elle l'entoure de balises markdown ```json ... ```)
        raw_text = text_content.strip()
        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            if len(lines) >= 2:
                if lines[0].startswith("```") and lines[-1].startswith("```"):
                    raw_text = "\n".join(lines[1:-1]).strip()
        
        # Parser le JSON nettoyé
        try:
            analyse_json = json.loads(raw_text)
            return {
                "error": False,
                "data": analyse_json
            }
        except Exception as json_err:
            print(f"Erreur de parsing du JSON Gemini: {json_err}. Contenu brut: {text_content}")
            return {
                "error": True,
                "message": "Erreur lors du formatage de l'analyse.",
                "raw_text": text_content
            }
            
    except urllib.error.HTTPError as http_err:
        error_body = http_err.read().decode('utf-8')
        print(f"Erreur HTTP Gemini: {http_err.code} - {error_body}")
        try:
            google_error = json.loads(error_body)
            msg = google_error['error']['message']
        except Exception:
            msg = f"Erreur de l'API Google ({http_err.code}): {http_err.reason}"
        return {
            "error": True,
            "message": f"Erreur API Gemini : {msg}"
        }
    except urllib.error.URLError as url_err:
        print(f"Erreur de connexion Gemini: {url_err}")
        return {
            "error": True,
            "message": f"Erreur de connexion réseau : {url_err.reason}"
        }
    except Exception as e:
        print(f"Erreur appel Gemini: {e}")
        return {
            "error": True,
            "message": f"Erreur interne lors de l'appel à l'IA : {str(e)}"
        }
