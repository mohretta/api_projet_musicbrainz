import React, { useState, useEffect } from 'react';

const BarreRecherche = ({ onSearch, onClear }) => {
    const [valeur, setValeur] = useState('');
    const [historique, setHistorique] = useState([]);

    useEffect(() => {
        const hist = JSON.parse(localStorage.getItem('historiqueRecherche') || '[]');
        setHistorique(hist);
    }, []);

    const sauvegarderRecherche = (rech) => {
        if (!rech.trim()) return;
        let hist = JSON.parse(localStorage.getItem('historiqueRecherche') || '[]');
        hist = hist.filter(h => h !== rech); // Enlever si existe déjà
        hist.unshift(rech); // Ajouter au début
        if (hist.length > 5) hist.pop(); // Garder 5 max
        localStorage.setItem('historiqueRecherche', JSON.stringify(hist));
        setHistorique(hist);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sauvegarderRecherche(valeur);
        onSearch(valeur);
    };

    const handleClear = () => {
        setValeur('');
        onClear();
    };

    const utiliserHistorique = (rech) => {
        setValeur(rech);
        sauvegarderRecherche(rech);
        onSearch(rech);
    };

    const supprimerDeHistorique = (e, rech) => {
        e.stopPropagation(); // Éviter de déclencher la recherche sur le clic
        let hist = JSON.parse(localStorage.getItem('historiqueRecherche') || '[]');
        hist = hist.filter(h => h !== rech);
        localStorage.setItem('historiqueRecherche', JSON.stringify(hist));
        setHistorique(hist);
    };

    return (
        <div className="search-wrapper">
            <form onSubmit={handleSubmit} className="premium-search-form">
                <input
                    type="text"
                    value={valeur}
                    onChange={(e) => setValeur(e.target.value)}
                    placeholder="Rechercher un artiste (ex: Eminem, Daft Punk)..."
                    className="premium-search-input"
                />
                <button type="submit" className="premium-search-btn" aria-label="Rechercher">
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
            </form>
            
            {historique.length > 0 && (
                <div className="premium-recent-tags">
                    <span className="recent-label">Récents :</span>
                    {historique.map((rec, idx) => (
                        <div key={idx} className="premium-history-pill" onClick={() => utiliserHistorique(rec)} role="button" tabIndex={0}>
                            <span>{rec}</span>
                            <span 
                                className="delete-history-btn" 
                                onClick={(e) => supprimerDeHistorique(e, rec)} 
                                title="Supprimer de l'historique"
                                role="button"
                                tabIndex={0}
                            >
                                ×
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BarreRecherche;
