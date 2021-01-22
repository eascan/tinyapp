const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const { emailExists, passwordMatch, tokenExists, urlsForUser } = require("./helpers/userHelpers")

const users = { 
  "user@example.com": { 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur",
    token: "RandomString"
  },
  "user2@example.com": {
    email: "user2@example.com", 
    password: "dishwasher-funk",
    token: "Random3String"
  }
};

function generateRandomString() {
  const r = Math.random().toString(36).substring(7);
  return r;
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "email", userToken: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "email", userToken: "kJ56L" }
};

app.get("/", (req, res) => {
  const incomingEmail = req.session.userEmail;
  const userToken = req.session.userToken;

  if (emailExists(users, incomingEmail) && tokenExists(users, incomingEmail, userToken)) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  const incomingEmail = req.session.userEmail;
  const userToken = req.session.userToken;

  if (emailExists(users, incomingEmail) && tokenExists(users, incomingEmail, userToken)) {
    res.redirect("/urls");
  } else {
    const templateVars = { 
      message: req.session["messages"]
    }
    res.render("urls_login", templateVars)
  };
});

// Login to app, start new cookie session
app.post("/login", (req, res) => {
  const incomingEmail = req.body.email;
  const incomingPassword = req.body.password;
  if (emailExists(users, incomingEmail)) {
    if (passwordMatch(users, incomingEmail, incomingPassword)) {
      const randomID = generateRandomString();
      req.session["userEmail"] = incomingEmail;
      req.session["userToken"] = randomID;
      users[incomingEmail].token = randomID;
      res.redirect("/urls");
    } else {
      req.session["messages"] = "Incorrect password";
      res.redirect("/login");
    }
  } else {
    req.session["messages"] = "Incorrect email";
    res.redirect("/login");
  }
});

//main page, shows account URLS if logged in 
app.get("/urls", (req, res) => {
  const incomingEmail = req.session.userEmail;
  const userToken = req.session.userToken;
  let isLoggedIn = false;
  let urlPerUser;
  if (emailExists(users, incomingEmail) && tokenExists(users, incomingEmail, userToken)) {
    isLoggedIn = true;
    urlPerUser = urlsForUser(urlDatabase, incomingEmail);
  }

  const templateVars = { 
    userEmail: req.session["userEmail"],
    urls: urlPerUser,
    isLoggedIn,
    message: req.session["messages"]
  };
  req.session["messages"] = null;
  res.render("urls_index", templateVars);
});

// User wants to create a tiny url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session["userEmail"],
    userToken: req.session["userToken"]
  }
  res.redirect(`/urls/${shortURL}`);
});

//new URL submission page for logged-in users
app.get("/urls/new", (req, res) => {

  const incomingEmail = req.session.userEmail;
  const userToken = req.session.userToken;
  let isLoggedIn = false;
  if (emailExists(users, incomingEmail) && tokenExists(users, incomingEmail, userToken)) {
    isLoggedIn = true;
    const templateVars = { 
      userEmail: req.session["userEmail"],
      urls: urlDatabase,
      isLoggedIn,
      message: req.session["messages"]
    };
    req.session["messages"] = null;
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }

});

app.get("/register", (req, res) => {
  const incomingEmail = req.session.userEmail;
  const userToken = req.session.userToken;

  if (emailExists(users, incomingEmail) && tokenExists(users, incomingEmail, userToken)) {
    res.redirect("/urls");
  } else {
    res.render("urls_register");
  }
})

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  
  if (!userEmail || !userPassword) {
    res.status(400).send("Cannot leave fields empty");
    return;
  } else if (emailExists(users, userEmail)) {
    res.status(400).send("Email already exists");
    res.redirect("/register");
  } else {
    users[userEmail] = {
      email: userEmail,
      password: bcrypt.hashSync(userPassword, 10),
      token: generateRandomString(),
    }
    req.session["userEmail"] = userEmail;
    req.session["userToken"] = users[userEmail].token;
    res.redirect("/urls");
  }
})

// user wants to go to longURL through the new short one
app.get("/u/:shortURL", (req, res) => {
  const long = urlDatabase[req.params.shortURL].longURL;
  res.redirect(`${long}`);
});

// user wants to delete a url from list, only allows after login
app.post("/urls/:shortURL/delete", (req, res) => {
  const incomingEmail = req.session.userEmail;
  const userToken = req.session.userToken;

  if (emailExists(users, incomingEmail) && tokenExists(users, incomingEmail, userToken)) {
    const urlToDelete = req.params.shortURL;
    delete urlDatabase[urlToDelete];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
})

// cannot view short URL and edit it, only correct user can view their own short URLS
app.get("/urls/:shortURL", (req, res) => {
  const incomingEmail = req.session["userEmail"];
  const userToken = req.session.userToken;
  let isLoggedIn = false;
  if (emailExists(users, incomingEmail) && tokenExists(users, incomingEmail, userToken) && urlDatabase[req.params.shortURL].userID === incomingEmail) {
    isLoggedIn = true;
    const templateVars = { 
      shortURL: req.params.shortURL, 
      long: urlDatabase[req.params.shortURL].longURL,
      userEmail: req.session["userEmail"],
      isLoggedIn,
      message: req.session["messages"]
    };
    req.session["messages"];
    res.render("urls_show", templateVars);
  } else if (emailExists(users, incomingEmail) && tokenExists(users, incomingEmail, userToken) && urlDatabase[req.params.shortURL].userID !== incomingEmail) {
    res.redirect("/login");
  } else {
    req.session["messages"] = "Please login first";
    res.redirect("/login");
  }
});

//user wants to update URL in short URL
app.post("/urls/:id", (req, res) => {
  const incomingEmail = req.session.userEmail;
  const userToken = req.session.userToken;

  if (emailExists(users, incomingEmail) && tokenExists(users, incomingEmail, userToken)) {
    urlDatabase[req.params.id] = {
      longURL: req.body.id,
      userID: req.session["userEmail"],
      userToken: req.session["userToken"]
    }
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.post("/logout", (req, res) => {
  req.session["userEmail"] = null;
  req.session["userToken"] = null;
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});