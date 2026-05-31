import React, { useState } from 'react';
import { getAnalyseIA } from '../appels_api_backend/client_api';

const cardStyle = {
    background: 'var(--card-bg)',
    borderRadius: '1.25rem',
    padding: '0.8rem 1.5rem', /* Alignement parfait avec le panneau actualités */
    marginBottom: '1.25rem',
    boxShadow: 'var(--shadow)', /* Même ombre pour uniformiser */
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.4s ease',
    position: 'relative',
    overflow: 'hidden'
};

const aiDotStyle = {
    width: '10px',
    height: '10px',
    backgroundColor: '#a855f7',
    borderRadius: '50%',
    display: 'inline-block',
    boxShadow: '0 0 8px #a855f7'
};

const PanneauAnalyseIA = ({ nomArtiste }) => {
    const [analyse, setAnalyse] = useState(null);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState(null);
    const [ouvert, setOuvert] = useState(false); // Accordéon (fermé par défaut, comme les actualités)

    const declencherAnalyse = async () => {
        setChargement(true);
        setErreur(null);
        try {
            const res = await getAnalyseIA(nomArtiste);
            if (res.error) {
                setErreur(res.message);
            } else {
                setAnalyse(res.data);
            }
        } catch (err) {
            setErreur("Erreur lors de la communication avec l'IA.");
        } finally {
            setChargement(false);
        }
    };

    return (
        <div style={cardStyle} className="ia-analysis-panel">
            {/* Effet lumineux d'arrière-plan */}
            <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(168, 85, 247, 0.1)',
                filter: 'blur(50px)',
                pointerEvents: 'none'
            }}></div>

            {/* En-tête cliquable (Format identique à l'actualité Google) */}
            <div 
                onClick={() => setOuvert(!ouvert)}
                style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: ouvert ? '1px solid rgba(255,255,255,0.1)' : 'none', 
                    paddingBottom: ouvert ? '10px' : '0',
                    transition: 'all 0.3s ease'
                }}
            >
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <div className="live-dot pulse-animation" style={aiDotStyle}></div>
                    <h3 className="news-title" style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                        <span className="premium-gradient-text">Analyse Profil par Gemini pour {nomArtiste}</span>
                    </h3>
                </div>
                <div className="pulse-animation" style={{
                    color: '#a855f7', 
                    fontSize: '1.2rem', 
                    transform: ouvert ? 'rotate(180deg)' : 'rotate(0deg)', 
                    transition: 'transform 0.3s ease'
                }}>
                    ▼
                </div>
            </div>

            {/* Contenu déroulant (visible si ouvert) */}
            {ouvert && (
                <div style={{ marginTop: '12px', animation: 'fadeIn 0.3s ease' }}>
                    {/* ÉTAT INITIAL : Pas encore d'analyse */}
                    {!analyse && !chargement && !erreur && (
                        <div style={{ textAlign: 'center', padding: '0.5rem 0.5rem' }}>
                            <p style={{ opacity: 0.7, fontSize: '0.9rem', marginBottom: '0.8rem', lineHeight: '1.5' }}>
                                Curieux d'en savoir plus ? Notre Intelligence Artificielle Gemini peut analyser en temps réel le style unique de <strong>{nomArtiste}</strong>, détailler son impact et dénicher des anecdotes croustillantes !
                            </p>
                            <button 
                                onClick={declencherAnalyse}
                                style={{
                                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1.4rem',
                                    borderRadius: '30px',
                                    fontSize: '0.88rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
                                    transition: 'all 0.3s ease',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(236, 72, 153, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(236, 72, 153, 0.3)';
                                }}
                            >
                                <span>🎙️ Lancer l'Analyse IA</span>
                            </button>
                        </div>
                    )}

                    {/* CHARGEMENT : Animation de scan */}
                    {chargement && (
                        <div style={{ textAlign: 'center', padding: '1rem 1rem' }}>
                            <div className="ia-scanner" style={{
                                width: '35px',
                                height: '35px',
                                borderRadius: '50%',
                                border: '3px solid rgba(168, 85, 247, 0.1)',
                                borderTopColor: '#a855f7',
                                margin: '0 auto 1rem',
                                animation: 'spin 1s infinite linear',
                                boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)'
                            }}></div>
                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500', opacity: 0.9, letterSpacing: '1px', textTransform: 'uppercase' }}>
                                Décodage de l'univers de {nomArtiste}...
                            </h4>
                            <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Calcul des ondes artistiques par Gemini</span>
                        </div>
                    )}

                    {/* ERREUR : Explication et tutoriel pour la clé API */}
                    {erreur && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '12px',
                            padding: '1.2rem',
                            lineHeight: '1.5'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                <span>⚠️ Clé API Absente</span>
                            </div>
                            {erreur.includes("non configurée") ? (
                                <div style={{ fontSize: '0.88rem' }}>
                                    <p style={{ margin: '0 0 1rem 0', opacity: 0.85 }}>
                                        Pour activer l'IA Gemini gratuite, vous devez configurer votre clé d'API. C'est très simple :
                                    </p>
                                    <ol style={{ margin: '0 0 1rem 0', paddingLeft: '1.2rem', opacity: 0.85 }}>
                                        <li style={{ marginBottom: '4px' }}>Obtenez une clé API gratuite en 30 secondes sur <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#ec4899', fontWeight: '600', textDecoration: 'underline' }}>Google AI Studio</a>.</li>
                                        <li style={{ marginBottom: '4px' }}>Collez votre clé dans le fichier de configuration de l'application :</li>
                                    </ol>
                                    <code style={{
                                        display: 'block',
                                        background: 'rgba(0,0,0,0.3)',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        fontFamily: 'monospace',
                                        fontSize: '0.8rem',
                                        color: '#f43f5e',
                                        marginBottom: '1rem',
                                        overflowX: 'auto',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        # Ouvrez configuration/parametres.py<br />
                                        GEMINI_API_KEY = "votre_clef_ici"
                                    </code>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Sauvegardez ensuite le fichier et rechargez la page !</span>
                                </div>
                            ) : (
                                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>{erreur}</p>
                            )}
                            <button 
                                onClick={declencherAnalyse}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    padding: '5px 12px',
                                    borderRadius: '15px',
                                    fontSize: '0.8rem',
                                    marginTop: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ec4899'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                            >
                                🔄 Réessayer
                            </button>
                        </div>
                    )}

                    {/* SUCCÈS : Affichage de l'analyse IA */}
                    {analyse && !chargement && !erreur && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', animation: 'fadeIn 0.5s ease', marginTop: '0.5rem' }}>
                            {/* Univers et Style */}
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5, color: '#ec4899' }}>
                                    🌌 L'Univers de l'Artiste
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', opacity: 0.85 }}>
                                    {analyse.style_description}
                                </p>
                            </div>

                            {/* Impact Culturel */}
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5, color: '#ec4899' }}>
                                    ⚡ Impact & Légende
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', opacity: 0.85 }}>
                                    {analyse.impact}
                                </p>
                            </div>

                            {/* Anecdotes Secrètes */}
                            <div>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5, color: '#ec4899' }}>
                                    🎬 Anecdotes Insolites
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {analyse.anecdotes.map((anec, idx) => (
                                        <div 
                                            key={idx}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.02)',
                                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                                borderRadius: '8px',
                                                padding: '7px 12px',
                                                fontSize: '0.88rem',
                                                lineHeight: '1.4',
                                                opacity: 0.85,
                                                display: 'flex',
                                                gap: '10px',
                                                alignItems: 'flex-start',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.2)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                            }}
                                        >
                                            <span style={{ fontWeight: 'bold', color: '#ec4899' }}>#{idx + 1}</span>
                                            <span>{anec}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Conseil Écoute IA */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
                                border: '1px solid rgba(236, 72, 153, 0.1)',
                                borderRadius: '10px',
                                padding: '8px 12px',
                                fontSize: '0.88rem',
                                lineHeight: '1.4'
                            }}>
                                <strong style={{ display: 'block', color: '#ec4899', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>
                                    🎧 Recommandations Gemini IA
                                </strong>
                                <span style={{ opacity: 0.85 }}>{analyse.ia_conseil}</span>
                            </div>

                            {/* Bouton de réinitialisation discret */}
                            <div style={{ textAlign: 'right', marginTop: '2px' }}>
                                <button 
                                    onClick={declencherAnalyse}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ec4899',
                                        fontSize: '0.78rem',
                                        cursor: 'pointer',
                                        opacity: 0.6,
                                        transition: 'opacity 0.2s',
                                        textDecoration: 'underline'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                                >
                                    🔄 Relancer l'analyse
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Style CSS injecté pour les animations */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            ` }} />
        </div>
    );
};

export default PanneauAnalyseIA;
