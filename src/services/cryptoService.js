class CryptoService {
    /**
     * Génère une clé de chiffrement AES-GCM 256 bits
     */
    async generateKey() {
        return await window.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256,
            },
            true, // extractable pour permettre l'export vers QR code
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Chiffre un fichier avec AES-GCM
     */
    async encryptFile(file) {
        // ✅ Générer la clé et l'IV côté client uniquement
        const key = await this.generateKey();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        // Lire le fichier comme ArrayBuffer
        const fileBuffer = await file.arrayBuffer();
        
        // Chiffrer les données
        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            fileBuffer
        );

        // Créer un nouveau fichier chiffré
        const encryptedFile = new File(
            [encryptedData], 
            `encrypted_${file.name}`, 
            { type: 'application/octet-stream' }
        );

        // ✅ Retourner TOUT ce qui est nécessaire pour le déchiffrement
        return { 
            encryptedFile, 
            key, // À exporter pour le QR code
            iv   // À inclure dans le QR code
        };
    }

    /**
     * Exporte la clé en base64 pour le QR code
     */
    async exportKey(key) {
        const exported = await window.crypto.subtle.exportKey('raw', key);
        const keyArray = new Uint8Array(exported);
        return this.arrayBufferToBase64(keyArray);
    }

    /**
     * Déchiffre un fichier (pour le téléchargement)
     */
    async decryptFile(encryptedData, keyBase64, ivBase64) {
        const key = await this.importKey(keyBase64);
        const iv = this.base64ToUint8Array(ivBase64);
        
        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            encryptedData
        );
        
        return decryptedData;
    }

    /**
     * Importe une clé depuis base64 (pour le déchiffrement)
     */
    async importKey(base64Key) {
        const keyData = this.base64ToArrayBuffer(base64Key);
        return await window.crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'AES-GCM' },
            false,
            ['decrypt']
        );
    }

    // Méthodes utilitaires (inchangées)
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    uint8ArrayToBase64(uint8Array) {
        return btoa(String.fromCharCode(...uint8Array));
    }

    base64ToUint8Array(base64) {
        return new Uint8Array(this.base64ToArrayBuffer(base64));
    }
}

export default new CryptoService();