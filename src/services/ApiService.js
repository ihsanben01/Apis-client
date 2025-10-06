import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

class ApiService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
        });
    }

    /**
     * Crée un nouveau dépôt sur le serveur
     */
    async createDeposit(fileInfo) {
        const response = await this.client.post('/deposits', fileInfo);
        return response.data;
    }

    /**
     * Upload le fichier chiffré
     */
    async uploadEncryptedFile(depositId, encryptedFile) {
        const formData = new FormData();
        formData.append('file', encryptedFile);

        await this.client.post(`/files/${depositId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    /**
     * Récupère les informations d'un dépôt
     */
    async getDepositInfo(depositId) {
        const response = await this.client.get(`/deposits/${depositId}`);
        return response.data;
    }
}

// Export par défaut
export default new ApiService();// OU export nommé (choisissez une seule méthode)
// export const apiService = new ApiService();