import React, { useState } from 'react';
import crypto from '../services/cryptoService';

const FileDownloader = () => {
    const [qrData, setQrData] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState('');

    const handleQrScan = (scannedData) => {
        try {
            const data = JSON.parse(scannedData);
            if (data.type === 'SHARE') {
                setQrData(data);
                setError('');
            } else {
                setError('QR code invalide - utilisez un QR code de partage');
            }
        } catch (err) {
            setError('QR code invalide');
        }
    };

    const downloadAndDecrypt = async () => {
        if (!qrData) return;

        setIsDownloading(true);
        setError('');

        try {
            // ✅ Étape 1: Télécharger les données chiffrées
            const encryptedBlob = await downloadEncryptedFile(qrData.downloadUrl);
            
            // ✅ Étape 2: Déchiffrer côté client avec la clé du QR code
            const encryptedData = await encryptedBlob.arrayBuffer();
            const decryptedData = await crypto.decryptFile(
                encryptedData,
                qrData.key,
                qrData.iv
            );
            
            // ✅ Étape 3: Créer et télécharger le fichier déchiffré
            const decryptedBlob = new Blob([decryptedData]);
            const url = URL.createObjectURL(decryptedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = qrData.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (err) {
            setError(`Erreur lors du déchiffrement: ${err.message}`);
        } finally {
            setIsDownloading(false);
        }
    };

    const downloadEncryptedFile = async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erreur de téléchargement');
        return await response.blob();
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Télécharger un fichier</h2>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scan du QR code de partage
                </label>
                <input
                    type="text"
                    placeholder="Collez les données du QR code ici"
                    onChange={(e) => handleQrScan(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>

            {qrData && (
                <div className="mb-4 p-3 bg-blue-50 rounded">
                    <p><strong>Fichier:</strong> {qrData.fileName}</p>
                    <button
                        onClick={downloadAndDecrypt}
                        disabled={isDownloading}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded mt-2"
                    >
                        {isDownloading ? 'Déchiffrement...' : 'Télécharger et Déchiffrer'}
                    </button>
                </div>
            )}

            {error && <div className="text-red-600">{error}</div>}
        </div>
    );
};

export default FileDownloader;