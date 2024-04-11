import Service from './Service';

class Auth extends Service {
    login(data) {
        return this.axios.post('/auth/login', data);
    }
}

export default Auth;
