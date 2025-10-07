import React, { useState, useEffect } from 'react';

class ManageInterface extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            depositInfo: null,
            loading: true,
            message: ''
        };
    }

    componentDidMount() {
        if (this.props.manageToken) {
            this.fetchDepositInfo();
        }
    }

    fetchDepositInfo = async () => {
        try {
            this.setState({ loading: true });
            const response = await fetch(`http://localhost:8080/api/v1/manage/${this.props.manageToken}`);
            
            if (response.ok) {
                const text = await response.text();
                try {
                    const data = JSON.parse(text);
                    this.setState({ depositInfo: data });
                } catch {
                    this.setState({ 
                        depositInfo: { 
                            fileName: 'Fichier', 
                            expirationDate: new Date().toISOString() 
                        } 
                    });
                }
            } else {
                this.setState({ message: '❌ Dépôt non trouvé ou token invalide' });
            }
        } catch (error) {
            this.setState({ message: '❌ Erreur de connexion au serveur' });
        } finally {
            this.setState({ loading: false });
        }
    };

    renewDeposit = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/manage/${this.props.manageToken}/renew`, {
                method: 'POST'
            });
            
            if (response.ok) {
                this.setState({ message: '✅ Dépôt renouvelé avec succès !' });
                this.fetchDepositInfo();
            } else {
                this.setState({ message: '❌ Erreur lors du renouvellement' });
            }
        } catch (error) {
            this.setState({ message: '❌ Erreur de connexion' });
        }
    };

    deleteDeposit = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce dépôt ?')) {
            try {
                const response = await fetch(`http://localhost:8080/api/v1/manage/${this.props.manageToken}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    this.setState({ 
                        message: '✅ Dépôt supprimé avec succès !',
                        depositInfo: null 
                    });
                } else {
                    this.setState({ message: '❌ Erreur lors de la suppression' });
                }
            } catch (error) {
                this.setState({ message: '❌ Erreur de connexion' });
            }
        }
    };

    render() {
        const { manageToken } = this.props;
        const { depositInfo, loading, message } = this.state;

        if (!manageToken) {
            return (
                <div style={{ padding: "20px", textAlign: "center" }}>
                    <p style={{ color: "#666" }}>Aucun token de gestion fourni</p>
                </div>
            );
        }

        if (loading) {
            return (
                <div style={{ textAlign: "center", padding: "20px" }}>
                    <div style={{
                        animation: "spin 1s linear infinite",
                        borderRadius: "50%",
                        height: "48px",
                        width: "48px",
                        borderBottom: "2px solid #2563eb",
                        margin: "0 auto"
                    }}></div>
                    <p style={{ marginTop: "16px", color: "#666" }}>Chargement...</p>
                </div>
            );
        }

        return (
            <div style={{
                maxWidth: "500px",
                margin: "20px auto",
                padding: "24px",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
            }}>
                <h2 style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    marginBottom: "24px",
                    textAlign: "center",
                    color: "#2563eb"
                }}>
                    🛠️ Gestion du Dépôt
                </h2>

                {message && (
                    <div style={{
                        padding: "12px",
                        borderRadius: "6px",
                        marginBottom: "16px",
                        backgroundColor: message.includes('✅') ? "#dcfce7" : "#fee2e2",
                        color: message.includes('✅') ? "#166534" : "#dc2626"
                    }}>
                        {message}
                    </div>
                )}

                {depositInfo ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {/* Informations du dépôt */}
                        <div style={{
                            padding: "16px",
                            backgroundColor: "#dbeafe",
                            borderRadius: "6px"
                        }}>
                            <h3 style={{
                                fontWeight: "600",
                                color: "#1e40af",
                                marginBottom: "8px"
                            }}>📋 Informations</h3>
                            <p><strong>Fichier:</strong> {depositInfo.fileName || 'Non spécifié'}</p>
                            <p><strong>Token:</strong> {manageToken.substring(0, 20)}...</p>
                            {depositInfo.expirationDate && (
                                <p><strong>Expiration:</strong> {new Date(depositInfo.expirationDate).toLocaleString('fr-FR')}</p>
                            )}
                        </div>

                        {/* Actions de gestion */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <button
                                onClick={this.renewDeposit}
                                style={{
                                    width: "100%",
                                    backgroundColor: "#16a34a",
                                    color: "white",
                                    padding: "12px 16px",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px"
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = "#15803d"}
                                onMouseOut={(e) => e.target.style.backgroundColor = "#16a34a"}
                            >
                                🔄 Renouveler (7 jours supplémentaires)
                            </button>

                            <button
                                onClick={this.deleteDeposit}
                                style={{
                                    width: "100%",
                                    backgroundColor: "#dc2626",
                                    color: "white",
                                    padding: "12px 16px",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px"
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = "#b91c1c"}
                                onMouseOut={(e) => e.target.style.backgroundColor = "#dc2626"}
                            >
                                🗑️ Supprimer définitivement
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", color: "#666" }}>
                        <p>Aucune information disponible pour ce token.</p>
                    </div>
                )}
            </div>
        );
    }
}

export default ManageInterface;