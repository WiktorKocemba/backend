const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mysql = require("mysql2");

const app = express();

// Laczenie z baza danych

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Bylsobiekrol123",
  database: "test_db",
});

con.connect((err) => {
  if (err) {
    console.log(`Nie udalo sie polaczyc`);
  } else {
    console.log(`Udalo sie polaczyc z baza danych`);
  }
});

// Start express'a

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

// Strona glowna zalogowany uzytkownik

app.get("/", (req, res) => {
  const username = req.cookies.username;

  if (username) {
    res.render("home", { username });
  } else {
    res.redirect("login");
  }
});

// Strona logowania

app.get("/login", (req, res) => {
  const username = req.cookies.username;

  if (username) {
    res.redirect("/");
  } else {
    res.render("login");
  }
});

// Obsluga logowania

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  con.query(query, [username, password], (err, results) => {
    if (err) {
      console.log("Blad podczas zapytania");
    }

    if (results.length > 0) {
      res.cookie("username", username, { maxAge: 900000 });
      res.redirect("/");
    } else {
      res.send(
        `<h1>Bledna nazwa uzytkownika lub haslo</h1><a href="/">Sprobuj ponownie</a>`
      );
    }
  });
});

// Strona rejestracji

app.get("/register", (req, res) => {
  const username = req.cookies.username;

  if (username) {
    res.redirect("/");
  } else {
    res.render("register");
  }
});

// Obsluga rejestracji

app.post("/register", (req, res) => {
  const { username, password, email } = req.body;

  const query =
    "INSERT INTO users (username, password, email) VALUES (?, ?, ?)";
  con.query(query, [username, password, email], (err, results) => {
    if (err) {
      console.error("Blad");
      return;
    }

    res.redirect("/login");
  });
});

// Wylogowanie (jak sie uda zalogowac)

app.get("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/login");
});

// Uruchomienie serwera

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serwer dziala na porcie ${PORT}`);
});
