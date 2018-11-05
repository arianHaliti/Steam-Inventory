require("./config/config");
require("./db");
const Item = require("../models/Item");
const _ = require("lodash");
const async = require("async");
const express = require("express");
const request = require("request");
const path = require("path");
const port = process.env.PORT || 3000;
const hbs = require("express-handlebars");
const app = express();

app.use("/css", express.static(path.join(__dirname, "/../assets/")));
console.log(__dirname + "/../assets/");
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
  let items = [];
  Item.find({}).then(i => {
    res.render("inventory.hbs", {
      pageTitle: "Home page",

      welcome: "Welcome to home page",
      items: i
    });
  });
});
app.get("/items", (req, res, next) => {
  // request(
  //   "https://steamcommunity.com/inventory/76561198069559601/730/2?l=english&count=5000",
  //   (e, r, body) => {
  //     res.json(JSON.parse(body));
  //   }
  // );
  let arr = [];
  let items = require("../example.json");
  // let desc = _.find(items.descriptions, { classid: "2658260160" });
  // let count = _.filter(items.assets, { classid: "3002907641" });
  async.each(
    items.assets,
    (element, callback) => {
      Item.findOne(
        {
          itemid: element.classid
        },
        function(err, item) {
          if (err) {
            callback(err);
          } else {
            if (!item) {
              saveItem(element, items)
                .then(item => {
                  console.log(item);
                  callback(null, item);
                })
                .catch(e => {
                  console.log("Something went wrong");
                });
            } else {
              callback(null, item);
            }
            arr.push(item);
          }
        }
      );
    },
    err => {
      if (err) {
        console.log("A element failed to process", err);
        res.status(500).json(err);
      } else {
        console.log("All elements have been processed successfully");
        // array with the results of each removeTodo job
        res.send(arr);
      }
    }
  );
});
app.get("/prices", (req, res, next) => {
  Item.find().then(items => {
    console.log(items.length);
    var i = 0;
    function myLoop() {
      setTimeout(function() {
        request(
          `https://steamcommunity.com/market/priceoverview/?currency=3&appid=730&market_hash_name=${
            items[i].market_hash_name
          }`,
          (e, r, body) => {
            console.log(
              JSON.parse(body).lowest_price,
              items[i].market_hash_name,
              JSON.parse(body).volume
            );
            Item.findOneAndUpdate(
              { itemid: items[i - 1].itemid },
              {
                $set: {
                  price: JSON.parse(body).lowest_price,
                  volume: JSON.parse(body).volume
                }
              }
            )
              .then(item => {
                if (!item) console.log("could not find item");
                else
                  console.log(
                    `Price Updated price= ${item.price} --- volume = ${
                      item.volume
                    }`
                  );
              })
              .catch(e => {
                res.status(400).send();
              });
          }
        );
        i++;
        if (i < items.length) {
          myLoop();
        } else {
          next();
        }
      }, 10000);
    }

    myLoop();
    res.send("Done");
  });

  // console.log(items);
  // name = [
  //   "Sticker | Dosia (Foil) | London 2018",
  //   "Sealed Graffiti | Mr. Teeth (Jungle Green)",
  //   "Sticker | Flash Gaming | Boston 2018",
  //   "Sealed Graffiti | Astralis | Atlanta 2017",
  //   "Sticker | ShahZaM (Foil) | London 2018"
  // ];

  // var loop = () => {
  //   setTimeout(() => {
  //     request(
  //       `https://steamcommunity.com/market/priceoverview/?currency=3&appid=730&market_hash_name=${
  //         name[i]
  //       }`,
  //       (e, r, body) => {
  //         console.log(JSON.parse(body), name[i]);
  //       }
  //     );
  //     loop();
  //   }, 10000);
  // };
  // loop();
});

function saveItem(element, items) {
  let desc = _.find(items.descriptions, { classid: element.classid });
  let newItem = new Item({
    itemid: element.classid,
    icon: desc.icon_url_large || desc.icon_url,
    name: desc.name,
    market_hash_name: desc.market_hash_name,
    description: desc.descriptions[0].value,
    count: _.filter(items.assets, { classid: element.classid }).length,
    volume: "0",
    price: "0.00E"
  });

  return newItem.save();
}
app.listen(port, () => {
  console.log(`Listen port : ${port}`);
});
