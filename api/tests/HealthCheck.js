const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src');
const should = chai.should();

chai.use(chaiHttp);

describe('DevOps', () => {
    describe('GET  /api/v1/_healthcheck', () => {
        it('Should return system status', (done) => {
            chai.request(server)
                .get('/api/v1/_healthcheck')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.status.should.equal('ok');
                    done();
                });
        });
    });
});
