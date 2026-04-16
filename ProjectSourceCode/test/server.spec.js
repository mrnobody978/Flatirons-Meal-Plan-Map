// ********************** Initialize server **********************************

const server = require('../src/index.js'); //TODO: Make sure the path to your index.js is correctly added

// ********************** Import Libraries ***********************************

const chai = require('chai'); // Chai HTTP provides an interface for live integration testing of the API's.
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// *********************** TODO: WRITE 2 UNIT TESTCASES **************************

// ********************************************************************************

it('positive : /register', done => {
  chai
    .request(server)
    .post('/register')
    .send({ username: 'marietest' + Math.random(), password: 'password', password2: 'password' })
    .end((err, res) => {
      expect(res).to.have.status(200);
      // Since successful registration now redirects to /login, we check if we landed there
      expect(res.text).to.include('Log in'); 
      done();
    });
});

it('negative : /register. Checking password does not match', done => {
  chai
    .request(server)
    .post('/register')
    .send({ username: 'marietest', password: 'password', password2: 'badpassword' })
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.text).to.include('Passwords must match');
      done();
    })
})