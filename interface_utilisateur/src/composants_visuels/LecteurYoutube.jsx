import React, { useState, useEffect } from 'react';
import { getChansonsAlbum } from '../appels_api_backend/client_api';
import AnimationChargement from './AnimationChargement';

const LecteurYoutube = ({ artiste, album, onClose }) => {
    const [chansons, setChansons] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);

    useEffect(() => {
        const fetchChansons = async () => {
            try {
                setChargement(true);
                const data = await getChansonsAlbum(album.id);
                setChansons(data);
            } catch (err) {
                setErreur("Impossible de charger la liste des pistes.");
            } finally {
                setChargement(false);
            }
        };
        fetchChansons();
    }, [album.id]);

    const formatDuree = (ms) => {
        if (!ms) return "--:--";
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    };

    return (
        <div className="album-accordion-panel">
            <div className="youtube-header">
                <span style={{flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    💿 Tracklist : {album.titre}
                </span>
                <button className="close-btn" onClick={onClose} aria-label="Replier le panneau" title="Replier">
                    ⬆
                </button>
            </div>
            <div style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {chargement && <AnimationChargement />}
                {erreur && <div style={{color: 'red', textAlign: 'center'}}>{erreur}</div>}
                
                {!chargement && !erreur && chansons.length === 0 && (
                    <div style={{textAlign: 'center'}}>Aucune piste trouvée pour cet album.</div>
                )}

                {!chargement && !erreur && chansons.length > 0 && (
                    <div className="tracklist">
                        {chansons.map((chanson, index) => {
                            const query = encodeURIComponent(`${artiste} ${chanson.titre}`);
                            const youtubeMusicUrl = `https://music.youtube.com/search?q=${query}`;
                            
                            return (
                                <div key={chanson.id} className="track-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', borderBottom: '1px solid var(--card-border)'}}>
                                    <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                                        <span style={{color: 'var(--accent-color)', fontWeight: 'bold'}}>{index + 1}.</span>
                                        <span>{chanson.titre}</span>
                                    </div>
                                    <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                                        <span style={{opacity: 0.6, fontSize: '0.9rem'}}>{formatDuree(chanson.duree_ms)}</span>
                                        <a href={youtubeMusicUrl} target="_blank" rel="noopener noreferrer" className="btn-play" style={{display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', background: '#FF0000', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', transition: 'transform 0.2s'}}>
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                                <path d="M21.582 6.186a2.665 2.665 0 0 0-1.87-1.882C17.986 3.86 12 3.86 12 3.86s-5.986 0-7.712.444a2.66 2.66 0 0 0-1.87 1.882C2 7.926 2 12 2 12s0 4.074.448 5.814a2.66 2.66 0 0 0 1.87 1.882C6.014 20.14 12 20.14 12 20.14s5.986 0 7.712-.444a2.665 2.665 0 0 0 1.87-1.882C22 16.074 22 12 22 12s0-4.074-.418-5.814zM9.9 15.47V8.53L15.93 12 9.9 15.47z"/>
                                            </svg>
                                            Jouer
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LecteurYoutube;
