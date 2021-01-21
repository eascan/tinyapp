const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

const { emailExists, passwordMatch, fetchUser, tokenExists } = require("./helpers/userHelpers")


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
}


function generateRandomString() {
  const r = Math.random().toString(36).substring(7);
  return r;
}



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/users", (req, res) => {
  res.send(users)
})

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/login", (req, res) => {
  const templateVars = { 
    message: req.cookies["messages"]
  }
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const incomingEmail = req.body.email;
  const incomingPassword = req.body.password;
  if (emailExists(users, incomingEmail)) {
    if (passwordMatch(users, incomingEmail, incomingPassword)) {
      const randomID = generateRandomString();
      res.cookie("userEmail", incomingEmail);
      res.cookie("userToken", randomID);
      users[incomingEmail].token = randomID;
      res.redirect("/urls");
    } else {
      res.cookie("messages", "Incorrect password")
      res.redirect("/login");
    }
  } else {
    res.cookie("messages", "Incorrect email");
    res.redirect("/login");
  }
})


app.get("/urls", (req, res) => {
  const incomingEmail = req.cookies.userEmail;
  const userToken = req.cookies.userToken;
  let isLoggedIn = false;
  if (emailExists(users, incomingEmail) && tokenExists(users, incomingEmail, userToken)) {
    isLoggedIn = true
  }

  const templateVars = { 
    userEmail: req.cookies["userEmail"],
    urls: urlDatabase,
    isLoggedIn,
    message: req.cookies["messages"]
  }
  res.clearCookie("messages");
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
});

//new URL submission page
app.get("/urls/new", (req, res) => {

  const incomingEmail = req.cookies.userEmail;
  const userToken = req.cookies.userToken;
  let isLoggedIn = false;
  if (emailExists(users, incomingEmail) && tokenExists(users, incomingEmail, userToken)) {
    isLoggedIn = true
  }

  const templateVars = { 
    userEmail: req.cookies["userEmail"],
    urls: urlDatabase,
    isLoggedIn,
    message: req.cookies["messages"]
  }
  res.clearCookie("messages");
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  res.render("urls_register");
})

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  
  if (!userEmail || !userPassword) {
    res.status(400).send("Cannot leave fields empty");
    return;
  } else if (users.hasOwnProperty(userEmail)) {
    res.status(400).send("Email already exists");
    res.redirect("/register");
  } else {
    users[userEmail] = {
      email: userEmail,
      password: userPassword,
      token: generateRandomString(),
    }
    res.cookie("userEmail", userEmail);
    res.cookie("userToken", users[userEmail].token);
    res.redirect("/urls");
  }
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(`${longURL}`);
});

// user wants to delete a url from list
app.post("/urls/:shortURL/delete", (req, res) => {
  
  const urlToDelete = req.params.shortURL;
  delete urlDatabase[urlToDelete];
  res.redirect('/urls');

})

app.get("/urls/:shortURL", (req, res) => {
  const incomingEmail = req.cookies.userEmail;
  const userToken = req.cookies.userToken;
  let isLoggedIn = false;
  if (emailExists(users, incomingEmail) && tokenExists(users, incomingEmail, userToken)) {
    isLoggedIn = true
  }

  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    userEmail: req.cookies["userEmail"],
    isLoggedIn,
    message: req.cookies["messages"]
  };
  res.clearCookie("messages");
  res.render("urls_show", templateVars);
});


//user wants to update URL in short URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.id
  res.redirect(`/urls/${req.params.id}`)
})

app.post("/logout", (req, res) => {
  res.clearCookie("userEmail");
  res.clearCookie("userToken")
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});