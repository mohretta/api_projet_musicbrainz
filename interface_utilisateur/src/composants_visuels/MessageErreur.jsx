import React from 'react';

const MessageErreur = ({ message }) => {
    return (
        <div className="error-message">
            <p>⚠️ {message}</p>
        </div>
    );
};

export default MessageErreur;
