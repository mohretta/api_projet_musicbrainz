import React, { useState } from 'react';
import BoutonFavori from './BoutonFavori';

const CarteAlbum = ({ album, onClick }) => {
    const [imgErreur, setImgErreur] = useState(false);

    return (
        <div className="card album-card" onClick={() => onClick && onClick(album)}>
            <div className="card-top-right">
                <BoutonFavori id={album.id} titre={album.titre} type="album" />
            </div>
            <div className="album-cover-container">
                {!imgErreur && album.pochette_url ? (
                    <img 
                        src={album.pochette_url} 
                        alt={`Pochette de ${album.titre}`} 
                        className="album-cover"
                        onError={() => setImgErreur(true)}
                    />
                ) : (
                    <div className="album-cover-fallback">
                        <span>🎵</span>
                    </div>
                )}
            </div>
            <h3 className="card-title">{album.titre}</h3>
            {album.date_sortie && <span className="card-subtitle">Sortie: {album.date_sortie}</span>}
            {album.type && <span className="card-tag">{album.type}</span>}
        </div>
    );
};

export default CarteAlbum;
