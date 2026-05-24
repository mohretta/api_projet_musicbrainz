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

    return (
        <div className="search-container">
            <form onSubmit={handleSubmit} className="search-input-group">
                <input 
                    type="text" 
                    placeholder="Rechercher un artiste (ex: Eminem, Daft Punk)..."
                    value={valeur}
                    onChange={(e) => setValeur(e.target.value)}
                />
                {valeur && (
                    <button type="button" className="btn-secondary" onClick={handleClear}>
                        Vider
                    </button>
                )}
                <button type="submit" className="btn-primary">
                    Rechercher
                </button>
            </form>
            
            {historique.length > 0 && (
                <div className="search-history">
                    <span className="history-label">Récents :</span>
                    {historique.map((h, i) => (
                        <span key={i} className="history-pill" onClick={() => utiliserHistorique(h)}>
                            {h}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BarreRecherche;
