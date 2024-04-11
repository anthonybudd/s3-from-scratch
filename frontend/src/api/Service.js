import axios from 'axios';

class Service {
    constructor(JWT) {
        this.JWT = JWT;

        this.url = import.meta.env.VITE_API_URL || 'https://localhost:4431/api';

        this.axios = axios.create({
            baseURL: import.meta.env.VITE_API_URL || 'https://localhost:4431/api',
            headers: {
                Authorization: `Bearer ${JWT}`,
            }
        });
    }
}

export default Service;
