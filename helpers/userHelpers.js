// users is an object of objects
const emailExists = (users, email) => {
  if (users.hasOwnProperty(email)) {
    return true;
  } else {
    return false;
  }
}


const tokenExists = (users, email, userToken) => {
  if (users[email].token === userToken) {
    return true;
  } else {
    return false;
  }
}

const passwordMatch = (users, email, userPassword) => {
  if (users[email].password === userPassword) {
    return true;
  } else {
    return false;
  }
}


const fetchUser = (users, email) => {
  if (users[email]) {
    return users[email];
  } else {
    return {};
  }
}


module.exports = { emailExists, passwordMatch, fetchUser, tokenExists };