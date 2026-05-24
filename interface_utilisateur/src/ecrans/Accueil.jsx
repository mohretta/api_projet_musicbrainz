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

const Accueil = () => {
    const mode = 'artiste'; // Forcer la recherche sur artiste
    const [query, setQuery] = useState('');
    const [resultats, setResultats] = useState([]);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState(null);
    const [artisteSelectionne, setArtisteSelectionne] = useState(null);
    const [showTopNav, setShowTopNav] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const resultsRef = useRef(null);

    // Charger l'état au démarrage
    useEffect(() => {
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
    }, []);

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
        if (!chargement && !erreur && (resultats.length > 0 || artisteSelectionne)) {
            setTimeout(() => {
                if (resultsRef.current) {
                    const y = resultsRef.current.getBoundingClientRect().top + window.scrollY - 20;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 100);
        }
    }, [resultats, artisteSelectionne, chargement, erreur]);

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
            } else {
                // Succès : on cache la barre de recherche
                setShowTopNav(true);
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
        setShowTopNav(false);
    };

    const retourRecherche = () => {
        setArtisteSelectionne(null);
        setResultats([]);
        setShowTopNav(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="app-container">
            {/* Arrière-plan des guitares, uniquement affiché sur la page d'accueil (pas de résultats ni artiste) */}
            {!artisteSelectionne && <div className="default-bg" />}
            {!showTopNav && !artisteSelectionne && (
                <div className="landing-container">
                    <header className="header" style={{ justifyContent: 'center', position: 'relative', width: '100%' }}>
                        <h1 className="title" style={{ fontSize: '3rem', marginBottom: '2rem' }}>MusicBrainz Explore</h1>
                        <div style={{ position: 'absolute', right: '0', top: '0' }}>
                            <BoutonTheme />
                        </div>
                    </header>

                    <BarreRecherche 
                        onSearch={handleSearch} 
                        onClear={viderRecherche}
                    />
                </div>
            )}

            {(showTopNav || artisteSelectionne) && (
                <div className="top-navigation-fixed">
                    <button className="carousel-btn up-arrow-btn" onClick={retourRecherche} aria-label="Retour à la recherche" title="Nouvelle recherche">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                    </button>
                    <div style={{ position: 'fixed', right: '2rem', top: '2rem', zIndex: 1000 }}>
                        <BoutonTheme />
                    </div>
                </div>
            )}

            {chargement && <AnimationChargement />}
            {erreur && <MessageErreur message={erreur} />}

            {!chargement && !erreur && artisteSelectionne && (
                <DetailsArtiste 
                    artiste={artisteSelectionne} 
                    onRetour={() => setArtisteSelectionne(null)} 
                />
            )}

            {!chargement && !erreur && !artisteSelectionne && resultats.length > 0 && (
                <div className="results-grid">
                    {resultats.map((item) => (
                        <CarteArtiste key={item.id} artiste={item} onClick={setArtisteSelectionne} />
                    ))}
                </div>
            )}

            {/* Trademark Mahrane */}
            <div className="trademark">
                Mahrane <span style={{fontSize: '0.7em', verticalAlign: 'top'}}>©</span>
            </div>
        </div>
    );
};

export default Accueil;
