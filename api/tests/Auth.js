const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src');
const should = chai.should();
const faker = require('faker');

chai.use(chaiHttp);


describe('Auth', () => {

    /**
     * GET  api/v1/_authcheck
     * 
     */
    describe('GET /api/v1/_authcheck', () => {
        it('Should check auth status', (done) => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .send({
                    email: 'user@example.com',
                    password: 'Password@1234'
                })
                .end((err, res) => {

                    chai.request(server)
                        .get('/api/v1/_authcheck')
                        .set({
                            'Authorization': `Bearer ${res.body.accessToken}`,
                        })
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.have.property('id');
                            done(err);
                        });
                });
        });

        it('Should check bad headers', (done) => {
            chai.request(server)
                .get('/api/v1/_authcheck')
                .set({
                    'Authorization': 'Bearer xx.xx.xx',
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    done(err);
                });
        });
    });


    /**
     * POST  api/v1/auth/login
     * 
     */
    describe('POST /api/v1/auth/login', () => {
        it('Should return auth access token', (done) => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .send({
                    email: 'user@example.com',
                    password: 'Password@1234'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('accessToken');
                    done(err);
                });
        });

        it('Should reject absent password', (done) => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .send({
                    email: 'user@example.com',
                })
                .end((err, res) => {
                    res.should.have.status(422);
                    done(err);
                });
        });

        it('Should reject wrong password', (done) => {
            chai.request(server)
                .post('/api/v1/auth/login')
                .send({
                    email: 'user@example.com',
                    password: 'BAD_PASSWORD'
                })
                .end((err, res) => {
                    res.should.have.status(401);
                    done(err);
                });
        });
    });


    /**
     * POST  api/v1/auth/sign-up
     * 
     */
    describe('POST /api/v1/auth/sign-up', () => {

        it('Should create a new user', (done) => {
            chai.request(server)
                .post('/api/v1/auth/sign-up')
                .send({
                    email: faker.internet.email(),
                    password: 'Password@1234',
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    groupName: faker.company.bsBuzz(),
                    tos: '2020-03-20'
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('accessToken');
                    done(err);
                });
        });

        it('Should reject bad data', (done) => {
            chai.request(server)
                .post('/api/v1/auth/sign-up')
                .send({
                    email: faker.internet.email(),
                    firstName: faker.name.firstName(),
                })
                .end((err, res) => {
                    res.should.have.status(422);
                    done(err);
                });
        });

        it('Should reject bad email', (done) => {
            chai.request(server)
                .post('/api/v1/auth/sign-up')
                .send({
                    email: 'anthonybudd@',
                    password: 'password',
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    groupName: faker.company.bsBuzz()
                })
                .end((err, res) => {
                    res.should.have.status(422);
                    done(err);
                });
        });

        it('Should reject taken email', (done) => {
            chai.request(server)
                .post('/api/v1/auth/sign-up')
                .send({
                    email: 'user@example.com',
                    password: 'also_bad_password',
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    groupName: faker.company.bsBuzz()
                })
                .end((err, res) => {
                    res.should.have.status(422);
                    done(err);
                });
        });

        it('Should reject bad password', (done) => {
            chai.request(server)
                .post('/api/v1/auth/sign-up')
                .send({
                    email: 'user@example.com',
                    password: '12345',
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    groupName: faker.company.bsBuzz()
                })
                .end((err, res) => {
                    res.should.have.status(422);
                    done(err);
                });
        });
    });
});
