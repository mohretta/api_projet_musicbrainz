import React, { useState, useEffect, useRef } from 'react';

const BoutonFavorisDropdown = ({ favoris, ouvrirFavori, supprimerFavori }) => {
    const [ouvert, setOuvert] = useState(false);
    const dropdownRef = useRef(null);

    // Fermer le menu si on clique à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOuvert(false);
            }
        };

        if (ouvert) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ouvert]);

    const hasFavorites = favoris && favoris.length > 0;

    return (
        <div className="favorites-dropdown-container" ref={dropdownRef}>
            <button 
                className={`theme-btn ${ouvert ? 'active' : ''}`} 
                onClick={() => setOuvert(!ouvert)} 
                aria-label="Mes favoris"
                title="Favoris"
                style={{ 
                    position: 'relative',
                    borderColor: ouvert ? '#ec4899' : '',
                    boxShadow: ouvert ? '0 0 10px rgba(236, 72, 153, 0.3)' : ''
                }}
            >
                <svg 
                    viewBox="0 0 24 24" 
                    width="20" 
                    height="20" 
                    stroke={hasFavorites ? "#ff4b72" : "currentColor"} 
                    strokeWidth="2" 
                    fill={hasFavorites ? "#ff4b72" : "none"} 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ 
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        transform: ouvert ? 'scale(1.1)' : 'scale(1)' 
                    }}
                >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                
                {/* Petit badge rouge avec le nombre de favoris si non vide */}
                {hasFavorites && (
                    <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)',
                        border: '1.5px solid var(--card-bg)'
                    }}>
                        {favoris.length}
                    </span>
                )}
            </button>

            {ouvert && (
                <div className="favorites-dropdown-menu">
                    <div className="favorites-dropdown-header">
                        Mes Favoris ({favoris.length})
                    </div>
                    {!hasFavorites ? (
                        <div className="favorites-dropdown-empty">
                            Aucun favori enregistré
                        </div>
                    ) : (
                        <div className="favorites-dropdown-list">
                            {favoris.map((fav) => (
                                <div 
                                    key={fav.id} 
                                    className="favorites-dropdown-item" 
                                    onClick={() => { ouvrirFavori(fav); setOuvert(false); }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <span className="fav-item-avatar">
                                        {fav.type === 'artiste' ? '👤' : '💿'}
                                    </span>
                                    <span className="fav-item-name" style={{ flex: 1, paddingLeft: '8px' }}>{fav.titre}</span>
                                    <span 
                                        className="fav-item-delete" 
                                        onClick={(e) => supprimerFavori(e, fav.id)} 
                                        title="Supprimer des favoris"
                                    >
                                        ×
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BoutonFavorisDropdown;
