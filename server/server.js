require("./config/config");
require("./db");
const express = require("express");
const request = require("request");
const path = require("path");
const port = process.env.PORT || 3000;
const hbs = require("express-handlebars");
const app = express();

app.use("/css", express.static(__dirname + "/assets/"));
app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "layout",
    layoutDir: __dirname + "/views/"
  })
);
app.get("/", (req, res) => {
  res.render("index.hbs", {
    pageTitle: "Home page",

    welcome: "Welcome to home page"
  });
});
app.get("/inventory", (req, res) => {
  res.render("inventory.hbs", {
    pageTitle: "Home page",

    welcome: "Welcome to home page"
  });
});
app.get("/items", (req, res) => {
  request(
    "https://steamcommunity.com/inventory/76561198069559601/730/2?l=english&count=5000",
    (e, r, body) => {
      res.json(JSON.parse(body));
    }
  );
});

app.listen(port, () => {
  console.log(`Listen port : ${port}`);
});
