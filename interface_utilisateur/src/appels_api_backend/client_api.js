export const API_BASE = "http://127.0.0.1:8000/api";

export const rechercherArtistes = async (nom) => {
    const res = await fetch(`${API_BASE}/artistes/recherche?nom=${encodeURIComponent(nom)}`);
    if (!res.ok) throw new Error("Erreur lors de la recherche d'artistes");
    return res.json();
};

export const rechercherAlbums = async (titre) => {
    const res = await fetch(`${API_BASE}/albums/recherche?titre=${encodeURIComponent(titre)}`);
    if (!res.ok) throw new Error("Erreur lors de la recherche d'albums");
    return res.json();
};

export const getActualitesArtiste = async (nomArtiste) => {
    try {
        const url = `${API_BASE}/actualites/${encodeURIComponent(nomArtiste)}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erreur backend pour actualités:", error);
        return [];
    }
};

export const rechercherChansons = async (titre) => {
    const res = await fetch(`${API_BASE}/chansons/recherche?titre=${encodeURIComponent(titre)}`);
    if (!res.ok) throw new Error("Erreur lors de la recherche de chansons");
    return res.json();
};

export const getAlbumsArtiste = async (artistId) => {
    const res = await fetch(`${API_BASE}/artistes/${artistId}/albums`);
    if (!res.ok) throw new Error("Erreur lors de la récupération des albums de l'artiste");
    return res.json();
};

export const getChansonsAlbum = async (albumId) => {
    const res = await fetch(`${API_BASE}/albums/${albumId}/chansons`);
    if (!res.ok) throw new Error("Erreur lors de la récupération de l'tracklist");
    return res.json();
};

export const getAnalyseIA = async (nomArtiste) => {
    const res = await fetch(`${API_BASE}/ia/analyse/${encodeURIComponent(nomArtiste)}`);
    if (!res.ok) throw new Error("Erreur lors de la récupération de l'analyse IA");
    return res.json();
};
