import Service from './Service';

class Auth extends Service {
    login(data) {
        return this.axios.post('/auth/login', data);
    }

    signUp(data) {
        return this.axios.post('/auth/sign-up', data);
    }
}

export default Auth;
