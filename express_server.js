const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post("/login", (req, res) => {
  const incomingUsername = req.body.username;
  res.cookie("username", incomingUsername);
  res.redirect("/urls");
  
})

app.get("/urls", (req, res) => {
  const isLoggedIn = req.cookies.username ? true : false;
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase,
    isLoggedIn
  }; // passing URL data to template
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  // console.log(shortURL)
  // console.log(req.body.longURL)
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
});

//new URL submission page
app.get("/urls/new", (req, res) => {
  const isLoggedIn = req.cookies.username ? true : false;
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase,
    isLoggedIn
  }
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  res.render("urls_register");
})

app.post("/register", (req, res) => {
  console.log(req.body)


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
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});


//user wants to update URL in short URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.id
  res.redirect(`/urls/${req.params.id}`)
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});