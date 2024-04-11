require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src');
const should = chai.should();

chai.use(chaiHttp);

const GROUP_ID = 'fdab7a99-2c38-444b-bcb3-f7cef61c275b';
const OTHER_GROUP_ID = '190c8a70-34d1-4281-a775-850058453704';

describe('Groups', () => {

    /**
     * GET  /api/v1/groups/:groupID
     * 
     */
    describe('GET  /api/v1/groups/:groupID', () => {

        it('Should return the group', (done) => {
            chai.request(server)
                .get(`/api/v1/groups/${GROUP_ID}`)
                .set({
                    'Authorization': `Bearer ${process.env.TEST_JWT}`,
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('id');
                    res.body.should.have.property('name');
                    done();
                });
        });

        it('Should reject bad group', (done) => {
            chai.request(server)
                .get(`/api/v1/groups/${OTHER_GROUP_ID}`)
                .set({
                    'Authorization': `Bearer ${process.env.TEST_JWT}`,
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });


    /**
     * POST /api/v1/groups/:groupID
     * 
     */
    describe('POST /api/v1/groups/:groupID', () => {

        it('Should update the group name', done => {
            chai.request(server)
                .post(`/api/v1/groups/${GROUP_ID}`)
                .set({
                    'Authorization': `Bearer ${process.env.TEST_JWT}`,
                })
                .send({
                    name: 'Test Group'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('id');
                    res.body.should.have.property('name');
                    res.body.name.should.equal('Test Group');
                    done();
                });
        });

        it('Should reject bad group', done => {
            chai.request(server)
                .post(`/api/v1/groups/${OTHER_GROUP_ID}`)
                .set({
                    'Authorization': `Bearer ${process.env.TEST_JWT}`,
                })
                .send({
                    name: 'Test Group'
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });


    /**
     * POST  /api/v1/groups/:groupID/users/add
     * 
     */
    describe('POST  /api/v1/groups/:groupID/users/add', () => {
        it('Should add user to the group', done => {
            chai.request(server)
                .post(`/api/v1/groups/${GROUP_ID}/users/add`)
                .set({
                    'Authorization': `Bearer ${process.env.TEST_JWT}`,
                })
                .send({
                    userID: 'd700932c-4a11-427f-9183-d6c4b69368f9',
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('userID');
                    res.body.should.have.property('groupID');
                    done();
                });
        });

        it('Should reject bad userID', done => {
            chai.request(server)
                .post(`/api/v1/groups/${GROUP_ID}/users/add`)
                .set({
                    'Authorization': `Bearer ${process.env.TEST_JWT}`,
                })
                .send({
                    userID: '00000000-0000-0000-0000-000000000000',
                })
                .end((err, res) => {
                    res.should.have.status(422);
                    done();
                });
        });
    });


    /**
     * DELETE  /api/v1/groups/:groupID/users/:userID
     * 
     */
    describe('DELETE  /api/v1/groups/:groupID/users/:userID', () => {
        it('Should remove user from the group', done => {
            chai.request(server)
                .delete(`/api/v1/groups/${GROUP_ID}/users/d700932c-4a11-427f-9183-d6c4b69368f9`)
                .set({
                    'Authorization': `Bearer ${process.env.TEST_JWT}`,
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('userID');
                    res.body.should.have.property('groupID');
                    done();
                });
        });
    });
});
