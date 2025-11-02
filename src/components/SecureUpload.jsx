import React, { useState } from 'react';
import crypto from '../services/cryptoService';
import api from '../services/ApiService';
import QRCodeDisplay from './QRCodeDisplay';
import ManageInterface from './ManageInterface';

const SecureUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileSelect = (event) => {
        const file = event.target.files?.[0] || null;
        setSelectedFile(file);
        setError('');
        setUploadResult(null);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Veuillez sélectionner un fichier');
            return;
        }

        setIsUploading(true);
        setError('');

        try {
            // ✅ Étape 1: Chiffrer le fichier côté client
            console.log('1. Chiffrement du fichier côté client...');
            const { encryptedFile, key, iv } = await crypto.encryptFile(selectedFile);

            // ✅ Étape 2: Exporter la clé pour le QR code (NE JAMAIS ENVOYER AU SERVEUR)
            console.log('2. Préparation des données pour QR code...');
            const encryptionKey = await crypto.exportKey(key);
            const ivBase64 = crypto.uint8ArrayToBase64(iv);

            // ✅ Étape 3: Créer le dépôt sur le serveur (sans infos de chiffrement)
            console.log('3. Création du dépôt sur le serveur...');
            const deposit = await api.createDeposit({
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                mimeType: selectedFile.type || 'application/octet-stream',
            });

            // ✅ Étape 4: Upload du fichier chiffré (le serveur ne voit que des données binaires)
            console.log('4. Upload des données chiffrées...');
            await api.uploadEncryptedFile(deposit.id, encryptedFile);

            // ✅ Étape 5: Sauvegarder localement les infos pour les QR codes
            setUploadResult({
                deposit,
                encryptionKey, // ✅ Stocké uniquement côté client → QR code
                iv: ivBase64,  // ✅ Stocké uniquement côté client → QR code
            });

            console.log('✅ Upload terminé avec succès!');
            console.log('🔐 Clé de chiffrement:', encryptionKey.substring(0, 20) + '...');
            console.log('📦 Dépôt ID:', deposit.id);

        } catch (err) {
            console.error('❌ Erreur lors de l\'upload:', err);
            setError(`Erreur lors de l'upload: ${err.message || 'Erreur inconnue'}`);
        } finally {
            setIsUploading(false);
        }
    };

    // ... reste du composant inchangé

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">
                APIS - Upload Sécurisé
            </h1>

            {/* Zone de sélection de fichier */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionnez un fichier à uploader
                </label>
                <input
                    type="file"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                    disabled={isUploading}
                />
            </div>

            {/* Informations du fichier */}
            {selectedFile && (
                <div className="mb-4 p-4 bg-gray-50 rounded">
                    <p><strong>Fichier:</strong> {selectedFile.name}</p>
                    <p><strong>Taille:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>Type:</strong> {selectedFile.type || 'Inconnu'}</p>
                </div>
            )}

            {/* Bouton d'upload */}
            <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md 
                         hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                         transition-colors"
            >
                {isUploading ? 'Chiffrement et Upload en cours...' : 'Uploader et Chiffrer'}
            </button>

            {/* Message d'erreur */}
            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {/* Indicateur de progression */}
            {isUploading && (
                <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md">
                    <p>Chiffrement et upload en cours... Cette opération peut prendre quelques instants.</p>
                </div>
            )}

            {/* Résultat de l'upload avec QR Codes */}
            {uploadResult && (
                <div className="mt-6 p-4 bg-green-50 rounded-md">
                    <h3 className="text-lg font-semibold text-green-800 mb-4">
                        ✅ Fichier uploadé avec succès!
                    </h3>
                    
                    <QRCodeDisplay 
                        deposit={uploadResult.deposit}
                        encryptionKey={uploadResult.encryptionKey}
                        iv={uploadResult.iv}
                    />
{/* Dans le return, après les QR codes, ajoutez :*/}
{uploadResult && (
  <div style={{ marginTop: "20px" }}>
    <ManageInterface manageToken={uploadResult.deposit.manageToken} />
  </div>
)}
                </div>
            )}
        </div>
    );
};

export default SecureUpload;