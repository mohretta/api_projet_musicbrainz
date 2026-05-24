import React, { useEffect, useState } from 'react';

const BoutonTheme = () => {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        // Forcer le mode sombre même si le navigateur avait mémorisé le mode clair
        let themeSauvegarde = localStorage.getItem('theme');
        if (!themeSauvegarde || themeSauvegarde === 'light') {
            themeSauvegarde = 'dark';
        }
        setTheme(themeSauvegarde);
        document.documentElement.setAttribute('data-theme', themeSauvegarde);
        localStorage.setItem('theme', themeSauvegarde);
    }, []);

    const toggleTheme = () => {
        const nouveauTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(nouveauTheme);
        localStorage.setItem('theme', nouveauTheme);
        document.documentElement.setAttribute('data-theme', nouveauTheme);
    };

    return (
        <button className="theme-btn" onClick={toggleTheme} aria-label="Changer de thème">
            {theme === 'light' ? '🌙' : '☀️'}
        </button>
    );
};

export default BoutonTheme;
