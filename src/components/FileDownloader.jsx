import React, { useState } from "react";
import { QrReader } from "react-qr-reader";
import crypto from "../services/cryptoService";

const FileDownloader = () => {
    const [qrData, setQrData] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState("");

    // ✅ Étape 1: Fonction appelée dès qu’un QR est scanné
    const handleQrScan = async (result) => {
        if (!result) return;

        try {
            const data = JSON.parse(result?.text || result);
            console.log("✅ QR code scanné:", data);

            setQrData(data);
            setError("");

            // Appel automatique du téléchargement et déchiffrement
            await downloadAndDecrypt(data);
        } catch (err) {
            console.error("QR invalide:", err);
            setError("QR code invalide");
        }
    };

    // ✅ Étape 2: Télécharger et déchiffrer le fichier
    const downloadAndDecrypt = async (data) => {
        setIsDownloading(true);
        try {
            const response = await fetch(data.downloadUrl);
            if (!response.ok) throw new Error("Erreur de téléchargement");

            const encryptedBuffer = await response.arrayBuffer();

            // Déchiffrement avec la clé et IV du QR
            const decrypted = await crypto.decryptFile(
                encryptedBuffer,
                data.key,
                data.iv
            );

            const blob = new Blob([decrypted]);
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = data.fileName || "fichier_déchiffré";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            setError("Erreur de déchiffrement : " + err.message);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
            <h2 className="text-lg font-bold mb-4 text-center">
                📷 Scanner le QR code de partage
            </h2>

            {/* ✅ Le composant du scanner */}
            <QrReader
                constraints={{ facingMode: "environment" }}
                onResult={(result, error) => {
                    if (!!result) {
                        handleQrScan(result);
                    }
                }}
                style={{ width: "100%" }}
            />

            {isDownloading && <p className="text-blue-600 mt-4">Déchiffrement en cours...</p>}
            {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
    );
};

export default FileDownloader;
