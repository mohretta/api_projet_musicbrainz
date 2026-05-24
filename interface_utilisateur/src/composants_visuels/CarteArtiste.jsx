import React from 'react';
import BoutonFavori from './BoutonFavori';

const CarteArtiste = ({ artiste, onClick }) => {
    return (
        <div className="card" onClick={() => onClick && onClick(artiste)}>
            <div className="card-top-right">
                <BoutonFavori id={artiste.id} titre={artiste.nom} type="artiste" />
            </div>
            <h3 className="card-title">{artiste.nom}</h3>
            {artiste.pays && <span className="card-subtitle">Pays: {artiste.pays}</span>}
            {artiste.type && <span className="card-tag">{artiste.type}</span>}
        </div>
    );
};

export default CarteArtiste;
