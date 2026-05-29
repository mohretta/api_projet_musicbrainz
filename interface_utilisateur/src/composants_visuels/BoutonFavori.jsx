import React, { useState, useEffect } from 'react';

const BoutonFavori = ({ id, titre, type, artisteNom, artisteId }) => {
    const [estFavori, setEstFavori] = useState(false);

    useEffect(() => {
        const favoris = JSON.parse(localStorage.getItem('favoris') || '[]');
        setEstFavori(favoris.some(f => f.id === id));
    }, [id]);

    const toggleFavori = (e) => {
        e.stopPropagation();
        let favoris = JSON.parse(localStorage.getItem('favoris') || '[]');
        if (estFavori) {
            favoris = favoris.filter(f => f.id !== id);
        } else {
            favoris.push({ id, titre, type, artisteNom, artisteId });
        }
        localStorage.setItem('favoris', JSON.stringify(favoris));
        setEstFavori(!estFavori);
    };

    return (
        <button className={`fav-btn ${estFavori ? 'active' : ''}`} onClick={toggleFavori} title="Favori">
            {estFavori ? '❤️' : '🤍'}
        </button>
    );
};

export default BoutonFavori;
