import React, { useEffect, useState, useRef } from 'react';
import { getAlbumsArtiste } from '../appels_api_backend/client_api';
import CarteAlbum from './CarteAlbum';
import AnimationChargement from './AnimationChargement';
import MessageErreur from './MessageErreur';
import BoutonFavori from './BoutonFavori';
import LecteurYoutube from './LecteurYoutube';
import PanneauActualites from './PanneauActualites';
import PanneauAnalyseIA from './PanneauAnalyseIA';

const DetailsArtiste = ({ artiste, onRetour, albumASelectionnerInitial, onAlbumSelectionneVisualise }) => {
    const [albums, setAlbums] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [albumPourLecture, setAlbumPourLecture] = useState(null);
    const [bgUrl, setBgUrl] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef(null);

    const handleScroll = () => {
        if (!carouselRef.current) return;
        const container = carouselRef.current;
        const center = container.scrollLeft + container.clientWidth / 2;
        let minDiff = Infinity;
        let newActive = 0;
        const children = container.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const childCenter = child.offsetLeft + child.clientWidth / 2;
            const diff = Math.abs(center - childCenter);
            if (diff < minDiff) {
                minDiff = diff;
                newActive = i;
            }
        }
        if (newActive !== activeIndex) {
            setActiveIndex(newActive);
        }
    };

    const scrollLeft = () => {
        if (carouselRef.current) carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    };

    const scrollRight = () => {
        if (carouselRef.current) carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    };

    const handleAlbumClick = (album) => {
        setAlbumPourLecture(album);
        // On fait glisser l'écran vers le bas pour voir le lecteur
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const data = await getAlbumsArtiste(artiste.id);
                setAlbums(data);
            } catch (err) {
                setErreur(err.message || "Erreur lors du chargement des albums");
            } finally {
                setChargement(false);
            }
        };
        fetchAlbums();

        // Récupérer l'image depuis Wikipedia (en utilisant la recherche générale pour être plus tolérant)
        const fetchWikipediaImage = async () => {
            try {
                // Recherche sur Wikipedia FR
                const url = `https://fr.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(artiste.nom)}&gsrlimit=1&prop=pageimages&format=json&pithumbsize=1500&origin=*`;
                const res = await fetch(url);
                const data = await res.json();
                
                if (data && data.query && data.query.pages) {
                    const pages = data.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pages[pageId].thumbnail) {
                        setBgUrl(pages[pageId].thumbnail.source);
                        return; // Succès, on s'arrête
                    }
                }
                
                // Si pas d'image en FR, on cherche sur Wikipedia EN (plus complet pour les artistes internationaux)
                const urlEn = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(artiste.nom)}&gsrlimit=1&prop=pageimages&format=json&pithumbsize=1500&origin=*`;
                const resEn = await fetch(urlEn);
                const dataEn = await resEn.json();
                
                if (dataEn && dataEn.query && dataEn.query.pages) {
                    const pagesEn = dataEn.query.pages;
                    const pageIdEn = Object.keys(pagesEn)[0];
                    if (pagesEn[pageIdEn].thumbnail) {
                        setBgUrl(pagesEn[pageIdEn].thumbnail.source);
                    }
                }
            } catch (err) {
                console.error("Erreur récupération image wikipedia", err);
            }
        };
        fetchWikipediaImage();
    }, [artiste.id, artiste.nom]);

    // Ouvrir automatiquement l'album favori sélectionné initialement et faire défiler jusqu'à sa tracklist
    useEffect(() => {
        if (albumASelectionnerInitial && albums.length > 0) {
            const albumCible = albums.find(a => a.id === albumASelectionnerInitial.id) || 
                               albums.find(a => a.titre.toLowerCase() === albumASelectionnerInitial.titre.toLowerCase());
            
            if (albumCible) {
                // Déclencher le clic pour ouvrir et charger les musiques
                handleAlbumClick(albumCible);
                
                // Signaler à l'accueil que l'album a été traité
                if (onAlbumSelectionneVisualise) {
                    onAlbumSelectionneVisualise();
                }
            }
        }
    }, [albums, albumASelectionnerInitial]);

    const getIconForUrl = (url) => {
        if (url.includes('wikipedia')) return '📚 Wikipédia';
        if (url.includes('youtube')) return '📺 YouTube';
        if (url.includes('instagram')) return '📸 Instagram';
        if (url.includes('twitter')) return '🐦 Twitter';
        return '🔗 Site Web';
    };

    return (
        <div className="artist-details">
            {bgUrl && (
                <div 
                    className="artist-bg"
                    style={{ backgroundImage: `url(${bgUrl})` }} 
                />
            )}
            
            <div className="artist-header">
                <div className="header-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {bgUrl && (
                            <img 
                                src={bgUrl} 
                                alt={artiste.nom} 
                                className="artist-mini-avatar"
                            />
                        )}
                        <h2 className="artist-name">{artiste.nom}</h2>
                    </div>
                    <BoutonFavori id={artiste.id} titre={artiste.nom} type="artiste" />
                </div>
                
                <div className="tags">
                    {artiste.pays && <span className="card-tag">{artiste.pays}</span>}
                    {artiste.type && <span className="card-tag">{artiste.type}</span>}
                    {artiste.tags && artiste.tags.map(t => (
                        <span key={t} className="card-tag tag-genre">#{t}</span>
                    ))}
                </div>

                {artiste.liens_web && artiste.liens_web.length > 0 && (
                    <div className="artist-links">
                        {artiste.liens_web.map((lien, i) => (
                            <a key={i} href={lien.url} target="_blank" rel="noopener noreferrer" className="artist-link">
                                {getIconForUrl(lien.url)}
                            </a>
                        ))}
                    </div>
                )}
                
                {artiste.alias && artiste.alias.length > 0 && (
                    <div className="artist-aliases">
                        <strong>Aussi connu sous :</strong> {artiste.alias.join(', ')}
                    </div>
                )}

                {artiste.membres && artiste.membres.length > 0 && (
                    <div className="artist-members">
                        <strong>Membres du groupe :</strong> {artiste.membres.join(', ')}
                    </div>
                )}
            </div>

            {/* Panneau Actualités Intégré */}
            <PanneauActualites nomArtiste={artiste.nom} />

            {/* Panneau d'Analyse IA par Gemini */}
            <PanneauAnalyseIA nomArtiste={artiste.nom} />

            <div className="albums-section">
                <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.5rem'}}>
                    <h3 className="albums-title">
                        <svg className="disc-icon" viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px', color: '#ec4899', verticalAlign: 'text-bottom'}}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="3"></circle>
                            <circle cx="12" cy="12" r="1" fill="#ec4899"></circle>
                        </svg>
                        <span className="premium-gradient-text">Discographie</span> 
                        <span className="albums-count">({albums.length} albums)</span>
                    </h3>
                </div>
                
                {chargement && <AnimationChargement />}
                {erreur && <MessageErreur message={erreur} />}
                
                {!chargement && !erreur && albums.length === 0 && (
                    <p>Aucun album trouvé pour cet artiste.</p>
                )}

                {!chargement && !erreur && albums.length > 0 && (
                    <div className="albums-carousel-container">
                        {/* Bouton retour positionné de manière relative au carousel pour s'adapter à l'ouverture des actualités */}
                        <button 
                            className="carousel-btn up-arrow-btn" 
                            onClick={onRetour} 
                            aria-label="Retour à la recherche" 
                            title="Nouvelle recherche"
                            style={{
                                position: 'absolute',
                                top: '-0.6rem',
                                left: '50%',
                                marginLeft: '-25px',
                                zIndex: 10,
                                transform: 'none'
                            }}
                        >
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                        </button>
                        <button className="carousel-btn prev-btn" onClick={scrollLeft} aria-label="Défiler à gauche">❮</button>
                        
                        <div className="albums-carousel" ref={carouselRef} onScroll={handleScroll}>
                            {albums.map((album, index) => {
                                let positionClass = '';
                                if (index === activeIndex) positionClass = 'active';
                                else if (index === activeIndex - 1) positionClass = 'prev-1';
                                else if (index === activeIndex + 1) positionClass = 'next-1';
                                else if (index === activeIndex - 2) positionClass = 'prev-2';
                                else if (index === activeIndex + 2) positionClass = 'next-2';
                                else positionClass = 'far';

                                return (
                                    <div key={album.id} className={`carousel-item ${positionClass}`}>
                                        <CarteAlbum 
                                            album={album} 
                                            onClick={handleAlbumClick} 
                                            artisteNom={artiste.nom}
                                            artisteId={artiste.id}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        
                        <button className="carousel-btn next-btn" onClick={scrollRight} aria-label="Défiler à droite">❯</button>
                    </div>
                )}

                {albumPourLecture && (
                    <LecteurYoutube 
                        artiste={artiste.nom} 
                        album={albumPourLecture} 
                        onClose={() => setAlbumPourLecture(null)} 
                    />
                )}
            </div>
        </div>
    );
};

export default DetailsArtiste;
