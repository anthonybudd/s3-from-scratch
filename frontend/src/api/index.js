import Auth from './Auth';
import User from './User';
import Buckets from './Buckets';

class API {
    constructor(JWT) {
        this.setJWT(JWT);
    }

    setJWT(JWT) {
        this.JWT = JWT;
        this.auth = new Auth(JWT);
        this.user = new User(JWT);
        this.buckets = new Buckets(JWT);
    }

    getJWT() {
        return this.JWT;
    }
}

let instance;
if (!instance) instance = new API();
export default instance;
