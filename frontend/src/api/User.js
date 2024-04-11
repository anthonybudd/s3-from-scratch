import Service from './Service';

class User extends Service {
    get() {
        return this.axios.get('/user');
    }

    stats() {
        return this.axios.get(`/stats`);
    }
}

export default User;
