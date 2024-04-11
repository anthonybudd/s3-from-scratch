import Service from './Service';

class Bucket extends Service {
    index() {
        return this.axios.get(`/buckets`);
    }

    get(bucketID) {
        return this.axios.get(`/buckets/${bucketID}`);
    }

    create(bucket) {
        return this.axios.post(`/buckets`, bucket);
    }

    delete(bucketID) {
        return this.axios.delete(`/buckets/${bucketID}`);
    }
}

export default Bucket;
