import React, { useState, useEffect, useRef } from 'react';
import { rechercherArtistes, rechercherAlbums, rechercherChansons } from '../appels_api_backend/client_api';
import BarreRecherche from '../composants_visuels/BarreRecherche';
import CarteArtiste from '../composants_visuels/CarteArtiste';
import CarteAlbum from '../composants_visuels/CarteAlbum';
import CarteChanson from '../composants_visuels/CarteChanson';
import AnimationChargement from '../composants_visuels/AnimationChargement';
import MessageErreur from '../composants_visuels/MessageErreur';
import BoutonTheme from '../composants_visuels/BoutonTheme';
import DetailsArtiste from '../composants_visuels/DetailsArtiste';
import BoutonFavorisDropdown from '../composants_visuels/BoutonFavorisDropdown';

const Accueil = () => {
    const mode = 'artiste'; // Forcer la recherche sur artiste
    const [query, setQuery] = useState('');
    const [resultats, setResultats] = useState([]);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState(null);
    const [artisteSelectionne, setArtisteSelectionne] = useState(null);
    const [showTopNav, setShowTopNav] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [artisteSurvole, setArtisteSurvole] = useState(null);
    const [isExiting, setIsExiting] = useState(false);
    const [favoris, setFavoris] = useState([]);
    const [albumASelectionner, setAlbumASelectionner] = useState(null);
    const resultsRef = useRef(null);

    const chargerFavoris = () => {
        const savedFavs = JSON.parse(localStorage.getItem('favoris') || '[]');
        setFavoris(savedFavs);
    };

    // Charger l'état au démarrage et précharger les médias lourds
    useEffect(() => {
        // Précharger l'image de la scène de théâtre
        const img = new Image();
        img.src = '/ecran_scene.png';

        const savedState = localStorage.getItem('appState');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.query) setQuery(parsed.query);
                if (parsed.resultats) setResultats(parsed.resultats);
                if (parsed.artisteSelectionne) setArtisteSelectionne(parsed.artisteSelectionne);
                if (parsed.showTopNav) setShowTopNav(parsed.showTopNav);
            } catch (e) {
                console.error("Erreur lecture state", e);
            }
        }
        setIsInitialized(true);
        chargerFavoris();
    }, []);

    // Recharger les favoris dès que l'écran actif change (ex: quand on revient de la page détails)
    useEffect(() => {
        chargerFavoris();
    }, [artisteSelectionne]);

    // Sauvegarder l'état à chaque changement
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('appState', JSON.stringify({
                query,
                resultats,
                artisteSelectionne,
                showTopNav
            }));
        }
    }, [query, resultats, artisteSelectionne, showTopNav, isInitialized]);

    useEffect(() => {
        if (!chargement && !erreur && artisteSelectionne) {
            setTimeout(() => {
                if (resultsRef.current) {
                    const y = resultsRef.current.getBoundingClientRect().top + window.scrollY - 20;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 100);
        }
    }, [artisteSelectionne, chargement, erreur]);

    const ouvrirFavori = async (favori) => {
        setChargement(true);
        setErreur(null);
        try {
            if (favori.type === 'artiste') {
                // Rechercher par nom pour récupérer l'artiste complet (avec tous ses détails pays, tags, etc.)
                const data = await rechercherArtistes(favori.titre);
                const artisteComplet = data.find(a => a.id === favori.id) || data[0];
                if (artisteComplet) {
                    setArtisteSelectionne(artisteComplet);
                } else {
                    setErreur("Artiste introuvable.");
                }
            } else if (favori.type === 'album') {
                // Si c'est un album, on charge l'artiste associé à l'album !
                const artisteNom = favori.artisteNom;
                const artisteId = favori.artisteId;
                
                if (artisteNom && artisteId) {
                    const data = await rechercherArtistes(artisteNom);
                    const artisteComplet = data.find(a => a.id === artisteId) || data[0];
                    if (artisteComplet) {
                        setArtisteSelectionne(artisteComplet);
                        setAlbumASelectionner(favori); // On stocke l'album pour l'ouvrir automatiquement
                    } else {
                        setErreur("Artiste de l'album introuvable.");
                    }
                } else {
                    // Fallback pour les anciens favoris d'albums : on cherche l'album pour trouver son artiste
                    const albumsData = await rechercherAlbums(favori.titre);
                    const albumComplet = albumsData.find(a => a.id === favori.id) || albumsData[0];
                    if (albumComplet && albumComplet.artiste) {
                        const data = await rechercherArtistes(albumComplet.artiste);
                        if (data && data.length > 0) {
                            setArtisteSelectionne(data[0]);
                            setAlbumASelectionner({ ...favori, id: albumComplet.id }); // On stocke l'album avec son bon id
                        } else {
                            setErreur("Artiste associé introuvable.");
                        }
                    } else {
                        setErreur("Informations de l'artiste introuvables pour cet album.");
                    }
                }
            }
        } catch (err) {
            setErreur(err.message || "Erreur lors du chargement du favori.");
        } finally {
            setChargement(false);
        }
    };

    const supprimerFavoriDepuisAccueil = (e, id) => {
        e.stopPropagation(); // Éviter d'ouvrir le favori
        let savedFavs = JSON.parse(localStorage.getItem('favoris') || '[]');
        savedFavs = savedFavs.filter(f => f.id !== id);
        localStorage.setItem('favoris', JSON.stringify(savedFavs));
        setFavoris(savedFavs);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = async (recherche) => {
        if (!recherche.trim()) {
            setResultats([]);
            return;
        }
        
        setChargement(true);
        setErreur(null);
        setQuery(recherche);

        try {
            let data = await rechercherArtistes(recherche);
            
            if (data.length === 0) {
                setErreur(`Aucun résultat trouvé pour "${recherche}"`);
            }
            setResultats(data);
        } catch (err) {
            setErreur(err.message || "Une erreur est survenue.");
        } finally {
            setChargement(false);
        }
    };

    const viderRecherche = () => {
        setQuery('');
        setResultats([]);
        setErreur(null);
        setArtisteSelectionne(null);
        setAlbumASelectionner(null);
    };

    const retourRecherche = () => {
        // Déclencher l'animation de sortie
        setIsExiting(true);
        setTimeout(() => {
            setArtisteSelectionne(null);
            setAlbumASelectionner(null);
            setShowTopNav(false);
            setIsExiting(false);
            window.scrollTo({ top: 0, behavior: 'instant' });
        }, 400); // 400ms pour l'animation
    };

    const retourAccueilZero = () => {
        setIsExiting(true);
        setTimeout(() => {
            setQuery('');
            setResultats([]);
            setArtisteSelectionne(null);
            setAlbumASelectionner(null);
            setShowTopNav(false);
            setIsExiting(false);
            window.scrollTo({ top: 0, behavior: 'instant' });
        }, 400);
    };

    return (
        <div className="app-container">
            {/* Arrière-plan des guitares, uniquement affiché sur la page d'accueil (pas de résultats ni artiste) */}
            {!artisteSelectionne && <div className="default-bg" />}
            {!showTopNav && (
                <div className={`landing-container ${artisteSelectionne && !isExiting ? 'fade-out-scale' : 'slide-in-top'}`}>
                    <header className="header" style={{ justifyContent: 'center', position: 'relative', width: '100%' }}>
                        <h1 className="title premium-logo" onClick={retourAccueilZero} style={{ fontSize: '3.5rem', marginBottom: '3rem', cursor: 'pointer' }} title="Retour à l'accueil">
                            <span className="equalizer-icon">
                                <span className="bar"></span><span className="bar"></span><span className="bar"></span>
                            </span>
                            MusicBrainz Explore
                        </h1>
                        <div style={{ position: 'absolute', right: '0', top: '0', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', zIndex: 100 }}>
                            <BoutonTheme />
                            <BoutonFavorisDropdown 
                                favoris={favoris} 
                                ouvrirFavori={ouvrirFavori} 
                                supprimerFavori={supprimerFavoriDepuisAccueil} 
                            />
                        </div>
                    </header>

                    <div style={{ position: 'relative', width: '100%', zIndex: 50 }}>
                        <BarreRecherche 
                            onSearch={handleSearch} 
                            onClear={viderRecherche}
                        />
                        
                        {(chargement || erreur || resultats.length > 0) && (
                            <div className="search-dropdown-container">
                                {/* Écran de Projection (Le grand rectangle noir) */}
                                <div className="stage-screen-projection">
                                    {chargement ? (
                                        <div className="projection-content loading-projection fade-in">
                                            <div className="projection-equalizer">
                                                <div className="projection-bar"></div>
                                                <div className="projection-bar"></div>
                                                <div className="projection-bar"></div>
                                                <div className="projection-bar"></div>
                                                <div className="projection-bar"></div>
                                            </div>
                                            <h2 className="projection-title-loading">RECHERCHE...</h2>
                                            <span className="projection-subtitle-loading">Exploration de la base</span>
                                        </div>
                                    ) : erreur ? (
                                        <div className="projection-content error-projection fade-in">
                                            <h2 className="projection-title-error">Oups !</h2>
                                            <span className="projection-subtitle-error">{erreur}</span>
                                        </div>
                                    ) : artisteSurvole ? (
                                        <div className="projection-content fade-in">
                                            <h2 className="projection-title">{artisteSurvole.nom}</h2>
                                            <span className="projection-subtitle">{artisteSurvole.type} - {artisteSurvole.pays || 'International'}</span>
                                        </div>
                                    ) : (
                                        <div className="projection-content empty">
                                            <span>Pointez un artiste...</span>
                                        </div>
                                    )}
                                </div>

                                <div className="search-dropdown-list-wrapper">
                                    {chargement ? (
                                        <div className="search-dropdown-content skeleton-loading">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="search-dropdown-item skeleton-item">
                                                    <div className="skeleton-text-group">
                                                        <div className="skeleton-title"></div>
                                                        <div className="skeleton-subtitle"></div>
                                                    </div>
                                                    <div className="skeleton-tag"></div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : erreur ? (
                                        <div className="search-dropdown-content empty-error">
                                            <div style={{opacity: 0.3, textAlign: 'center', padding: '3rem 1rem', fontSize: '0.9rem', fontStyle: 'italic'}}>Aucun résultat</div>
                                        </div>
                                    ) : (
                                        <div className="search-dropdown-content" onMouseLeave={() => setArtisteSurvole(null)}>
                                            {resultats.map((item) => (
                                                <div 
                                                    key={item.id} 
                                                    className={`search-dropdown-item ${artisteSurvole?.id === item.id ? 'hovered-item' : ''}`} 
                                                    onClick={() => setArtisteSelectionne(item)}
                                                    onMouseEnter={() => setArtisteSurvole(item)}
                                                >
                                                    <div>
                                                        <div className="search-dropdown-title">{item.nom}</div>
                                                        <div className="search-dropdown-subtitle">Pays : {item.pays || 'Inconnu'}</div>
                                                    </div>
                                                    <div className="search-dropdown-tag">{item.type || 'Inconnu'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {(showTopNav || artisteSelectionne) && (
                <div className={`top-navigation-fixed ${isExiting ? 'fade-out' : ''}`}>
                    <h1 className="title premium-logo" onClick={retourAccueilZero} style={{ margin: 0, fontSize: '1.8rem', cursor: 'pointer' }} title="Retour à l'accueil">
                        <span className="equalizer-icon">
                            <span className="bar"></span><span className="bar"></span><span className="bar"></span>
                        </span>
                        MusicBrainz Explore
                    </h1>
                    <div style={{ position: 'fixed', right: '2rem', top: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                        <BoutonTheme />
                        <BoutonFavorisDropdown 
                            favoris={favoris} 
                            ouvrirFavori={ouvrirFavori} 
                            supprimerFavori={supprimerFavoriDepuisAccueil} 
                        />
                    </div>
                </div>
            )}

            {artisteSelectionne && (
                <div className={`details-wrapper ${isExiting ? 'slide-out-bottom' : 'slide-in-bottom'}`}>
                    <DetailsArtiste 
                        artiste={artisteSelectionne} 
                        onRetour={retourRecherche} 
                        albumASelectionnerInitial={albumASelectionner}
                        onAlbumSelectionneVisualise={() => setAlbumASelectionner(null)}
                    />
                </div>
            )}



            {/* Trademark Mahrane */}
            <div className="trademark">
                Mahrane <span style={{fontSize: '0.6em', verticalAlign: 'top', WebkitTextFillColor: '#ec4899'}}>©</span>
            </div>
        </div>
    );
};

export default Accueil;
