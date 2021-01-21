// users is an object of objects
const emailExists = (users, email) => {
  if (users.hasOwnProperty(email)) {
    return true;
  } else {
    return false;
  }
}

const passwordMatch = (users, email, password) => {
  if (users[email].password === password) {
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


module.exports = { emailExists, passwordMatch, fetchUser };