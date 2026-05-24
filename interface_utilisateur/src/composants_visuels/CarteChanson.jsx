import React from 'react';

const CarteChanson = ({ chanson }) => {
    const dureeFormat = chanson.duree_ms 
        ? `${Math.floor(chanson.duree_ms / 60000)}:${((chanson.duree_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}`
        : 'Inconnue';

    return (
        <div className="card">
            <h3 className="card-title">{chanson.titre}</h3>
            <span className="card-subtitle">Durée: {dureeFormat}</span>
            <span className="card-tag">Chanson</span>
        </div>
    );
};

export default CarteChanson;
