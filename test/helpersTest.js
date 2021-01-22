const { assert } = require('chai');

const { emailExists } = require('../helpers/userHelpers.js');

const testUsers = {
  "user@example.com": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2@example.com": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('emailExists', function() {
  it('it should return true if email exists as a key in database', function() {
    const user = emailExists(testUsers, "user@example.com")
    const expectedOutput = true;
    assert.equal(user, expectedOutput)
  });

  it('it should return false if email does not exist as a key in database', function() {
    const user = emailExists(testUsers, "user3@example.com")
    const expectedOutput = false;
    assert.equal(user, expectedOutput)
  });

});