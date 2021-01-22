const { assert } = require('chai');

const { emailExists, tokenExists, urlsForUser } = require('../helpers/userHelpers.js');

const testUsers = {
  "user@example.com": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur",
    token: "random1"
  },
  "user2@example.com": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk",
    token: "random2"
  }
};

const testDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "email1", userToken: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "email2", userToken: "kJ56L" }
};

describe('emailExists', function() {
  it('it should return true if email exists as a key in database', function() {
    const email = emailExists(testUsers, "user@example.com")
    const expectedOutput = true;
    assert.equal(email, expectedOutput)
  });

  it('it should return false if email does not exist as a key in database', function() {
    const email = emailExists(testUsers, "user3@example.com")
    const expectedOutput = false;
    assert.equal(email, expectedOutput);
  });

});

describe('emailExists', function() {
  it('it should return true if token exists as a value in database', function() {
    const  token = tokenExists(testUsers, "user@example.com", "random1")
    const expectedOutput = true;
    assert.equal(token, expectedOutput);
  })

  it('it should return false if current token does not exist as a value in database or does not match', function() {
    const  token = tokenExists(testUsers, "user@example.com", "random3")
    const expectedOutput = false;
    assert.equal(token, expectedOutput);
  })
});

