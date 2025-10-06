import React from 'react';
import { QRCodeSVG } from 'qrcode.react'

const QRCodeDisplay = ({ deposit, encryptionKey, iv }) => {
    // Données pour le QR Code de partage
    const shareData = {
        type: 'SHARE',
        depositId: deposit.id,
        key: encryptionKey,
        iv: iv,
        fileName: deposit.fileName,
        downloadUrl: `${window.location.origin}/download/${deposit.shareToken}`
    };

    // Données pour le QR Code de gestion
    const manageData = {
        type: 'MANAGE',
        depositId: deposit.id,
        manageToken: deposit.manageToken,
        manageUrl: `${window.location.origin}/manage/${deposit.manageToken}`
    };

    return (
        <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">QR Codes Générés</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* QR Code de Partage */}
                <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-600">
                        QR Code de Partage
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                        Scannez pour télécharger le fichier
                    </p>
                    <div className="flex justify-center">
                        <QRCodeSVG 
                            value={JSON.stringify(shareData)}
                            size={200}
                            level="M"
                        />
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                        <p>Token: {deposit.shareToken.substring(0, 15)}...</p>
                    </div>
                </div>

                {/* QR Code de Gestion */}
                <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 text-green-600">
                        QR Code de Gestion
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                        Scannez pour gérer le dépôt
                    </p>
                    <div className="flex justify-center">
                        <QRCodeSVG 
                            value={JSON.stringify(manageData)}
                            size={200}
                            level="M"
                        />
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                        <p>Token: {deposit.manageToken.substring(0, 15)}...</p>
                    </div>
                </div>
            </div>

            {/* Informations techniques (debug) */}
            <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-gray-500">
                    Informations techniques (développement)
                </summary>
                <div className="mt-2 p-2 bg-gray-100 rounded">
                    <p><strong>Deposit ID:</strong> {deposit.id}</p>
                    <p><strong>Clé (base64):</strong> {encryptionKey.substring(0, 30)}...</p>
                    <p><strong>IV (base64):</strong> {iv.substring(0, 20)}...</p>
                    <p><strong>Expiration:</strong> {new Date(deposit.expirationDate).toLocaleString()}</p>
                </div>
            </details>
        </div>
    );
};

export default QRCodeDisplay;