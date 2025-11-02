class CryptoService {
    /**
     * 🔐 Génère une clé AES-GCM 256 bits
     */
    async generateKey() {
        return await window.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256,
            },
            true, // ✅ extractable : pour pouvoir l'exporter dans le QR code
            ['encrypt', 'decrypt']
        );
    }

    /**
     * 📁 Chiffre un fichier avec AES-GCM
     */
    async encryptFile(file) {
        // ✅ Générer la clé et l’IV côté client uniquement
        const key = await this.generateKey();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        // Lire le fichier comme ArrayBuffer
        const fileBuffer = await file.arrayBuffer();

        // Chiffrer les données
        const encryptedBuffer = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            fileBuffer
        );

        // ✅ Utiliser un Blob pur (évite les corruptions)
        const encryptedFile = new File(
            [encryptedBuffer],
            `encrypted_${file.name}`,
            { type: 'application/octet-stream' }
        );
        return {
           encryptedFile,
            key,
            iv
        };
    }

    /**
     * 📤 Exporte une clé au format base64 pour le QR code
     */
    async exportKey(key) {
        const exported = await window.crypto.subtle.exportKey('raw', key);
        const keyArray = new Uint8Array(exported);
        return this.arrayBufferToBase64(keyArray);
    }

    /**
     * 🔓 Déchiffre un fichier téléchargé
     */
    async decryptFile(encryptedBuffer, keyBase64, ivBase64) {
        const key = await this.importKey(keyBase64);
        const iv = this.base64ToUint8Array(ivBase64);

        try {
            const decryptedBuffer = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv,
                },
                key,
                encryptedBuffer
            );

            return decryptedBuffer;
        } catch (e) {
            console.error('❌ Erreur de déchiffrement (clé ou iv incorrects)', e);
            throw new Error('Erreur de déchiffrement : la clé ou l’IV est invalide');
        }
    }

    /**
     * 🔑 Importe une clé depuis une chaîne base64
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

    // 📦 Méthodes utilitaires
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
