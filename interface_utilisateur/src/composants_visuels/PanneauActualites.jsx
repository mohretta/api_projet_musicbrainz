import React, { useState, useEffect } from 'react';
import { getActualitesArtiste } from '../appels_api_backend/client_api';

const panelStyle = {
    background: 'var(--card-bg)',
    borderRadius: '1rem',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: 'var(--shadow)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.05)'
};

const liveDotStyle = {
    width: '10px',
    height: '10px',
    backgroundColor: '#ff3c3c',
    borderRadius: '50%',
    display: 'inline-block'
};

const PanneauActualites = ({ nomArtiste }) => {
    const [actualites, setActualites] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [ouvert, setOuvert] = useState(false); // État pour l'accordéon

    useEffect(() => {
        let isMounted = true;
        const fetchNews = async () => {
            setChargement(true);
            const data = await getActualitesArtiste(nomArtiste);
            if (isMounted) {
                setActualites(data);
                setChargement(false);
            }
        };
        fetchNews();
        return () => { isMounted = false; };
    }, [nomArtiste]);

    if (chargement) {
        return (
            <div className="news-panel" style={panelStyle}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'wait'}}>
                    <div className="live-dot pulse-animation"></div>
                    <h3 style={{margin: 0, fontSize: '1.2rem', fontFamily: "'Playfair Display', serif", fontStyle: 'italic'}}>Recherche des actualités...</h3>
                </div>
            </div>
        );
    }

    if (actualites.length === 0) {
        return null; // Ne rien afficher si pas d'actualités
    }

    return (
        <div className="news-panel" style={panelStyle}>
            {/* En-tête cliquable (Accordéon) */}
            <div 
                onClick={() => setOuvert(!ouvert)}
                style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: ouvert ? '1px solid rgba(255,255,255,0.1)' : 'none', 
                    paddingBottom: ouvert ? '10px' : '0',
                    transition: 'all 0.3s ease'
                }}
            >
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <div className="live-dot pulse-animation" style={liveDotStyle}></div>
                    <h3 style={{margin: 0, fontSize: '1.4rem', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', letterSpacing: '0.5px'}}>
                        À la une pour {nomArtiste}
                    </h3>
                </div>
                <div className="pulse-animation" style={{color: '#ff3c3c', fontSize: '1.2rem', transform: ouvert ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease'}}>
                    ▼
                </div>
            </div>
            
            {/* Liste déroulante des actualités */}
            {ouvert && (
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px', animation: 'slideDownAccordion 0.3s ease'}}>
                    {actualites.map((actu, index) => (
                        <a key={index} href={actu.lien} target="_blank" rel="noopener noreferrer" className="news-item">
                            <div style={{fontSize: '0.95rem', fontWeight: '500', marginBottom: '4px', lineHeight: '1.4'}}>
                                {actu.titre}
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.6}}>
                                <span>{actu.source}</span>
                                <span>{new Date(actu.date).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})}</span>
                            </div>
                        </a>
                    ))}
                </div>
            )}
            
            {/* Styles injectés pour l'animation et le hover */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes pulseLive {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 60, 60, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(255, 60, 60, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 60, 60, 0); }
                }
                .pulse-animation {
                    animation: pulseLive 2s infinite;
                }
                .news-item {
                    color: inherit;
                    text-decoration: none;
                    padding: 10px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid transparent;
                    transition: all 0.2s ease;
                }
                .news-item:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.2);
                    transform: translateX(4px);
                }
                [data-theme='light'] .news-item {
                    background: rgba(0, 0, 0, 0.03);
                }
                [data-theme='light'] .news-item:hover {
                    background: rgba(0, 0, 0, 0.06);
                    border-color: rgba(0, 0, 0, 0.1);
                }
            `}} />
        </div>
    );
};

export default PanneauActualites;
