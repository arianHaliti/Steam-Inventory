require("./config/config");
require("./db");

const _ = require("lodash");
const async = require("async");
const express = require("express");
const request = require("request");
const path = require("path");
const port = process.env.PORT || 3000;
const hbs = require("express-handlebars");
const app = express();

// Load Models
const Item = require("../models/Item");
const Price = require("../models/Price");

app.use("/css", express.static(path.join(__dirname, "/../assets/")));
console.log(__dirname + "/../assets/");
app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "layout",
    layoutDir: __dirname + "/views/",
    helpers: {
      calc: function(p1, p2) {
        if (!p1 || !p2) {
          return;
        }
        p1 = p1.replace(",", ".");
        p2 = p2.replace(",", ".");

        p1 = p1.slice(0, -1);
        p2 = p2.slice(0, -1);

        p1 = parseFloat(p1);
        p2 = parseFloat(p2);
        // console.log(p1, p2);
        let per = ((p1 - p2) / p1) * 100;
        per = per.toFixed(1);

        // console.log(per);
        return per;
      },
      classprice: (p1, p2) => {
        if (!p1 || !p2) {
          return;
        }
        p1 = p1.replace(",", ".").slice(0, -1);
        p2 = p2.replace(",", ".").slice(0, -1);
        // console.log(p1 - p2);
        return p1 - p2 >= 0 ? "greencalc" : "redcalc";
      },
      getPrice: id => {
        let item_price = "";
        return Price.findOne({ itemid: id })
          .then(price => {
            // console.log(price.prices[0].price);
            // console.log(price);
            if (price) item_price = price.prices[0].price;
            return item_price;
            // console.log(item_price);
            //  item_price;
          })

          .catch(e => {
            console.log("Something went wrong");
          });
        // console.log(item_price);
        // return item_price;
      }
    }
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
  Price.find({})
    .populate("itemid", ["icon", "name", "market_hash_name", "count"])
    .then(i => {
      // console.log(i);

      // console.log(p);
      res.render("inventory.hbs", {
        pageTitle: "Home page",

        welcome: "Welcome to home page",
        items: i
      });
    })
    .catch(e => {
      console.log("something went wrong");
    });
});
app.get("/items", (req, res, next) => {
  // request(
  //   "https://steamcommunity.com/inventory/76561198069559601/730/2?l=english&count=5000",
  //   (e, r, body) => {
  let body = require("../example.json");
  let assets = body.assets;
  let i = 0;
  let arr = [];
  // return res.send(assets.length + "");
  Item.deleteMany({}).then(() => {
    itemLoop();
  });
  function itemLoop() {
    Item.findOne({
      _id: assets[i].classid
    }).then(item => {
      // console.log(assets[i].classid);
      if (!item) {
        let desc = _.find(body.descriptions, { classid: assets[i].classid });
        let newItem = new Item({
          _id: assets[i].classid,
          icon: desc.icon_url_large || desc.icon_url,
          name: desc.name,
          marketable: desc.marketable,
          market_hash_name: desc.market_hash_name,
          description: desc.descriptions[0].value,
          type:
            desc.tags[1].category == "Weapon"
              ? desc.tags[4].localized_tag_name
              : desc.tags[2].localized_tag_name || "",
          count: _.filter(body.assets, { classid: assets[i].classid }).length
        });
        newItem
          .save()
          .then(item => {
            arr.push(item);
            console.log(i);
          })
          .catch(e => {
            console.log(`Something went wrong with `);
          });
      }
      i++;
      if (i < assets.length) {
        itemLoop();
      } else {
        return res.send(arr);
      }
    });
  }
  // itemLoop();
});
// });

// body.descriptions.forEach(element => {
//   Item.findOne({
//     name: element.market_hash_name
//   }).then(item => {
//     if (!item) {
//       saveItem(element, body)
//         .then(item => {
//           console.log(item);
//           callback(null, item);
//         })
//         .catch(e => {
//           console.log("Something went wrong");
//         });
//     }
//   });
// });
// let arr = [];
// let items = require("../example.json");
// let desc = _.find(items.descriptions, { classid: "2658260160" });
// let count = _.filter(items.assets, { classid: "3002907641" });
// async.each(
//   items.assets,
//   (element, callback) => {
//     Item.findOne(
//       {
//         itemid: element.classid
//       },
//       function(err, item) {
//         if (err) {
//           callback(err);
//         } else {
//           if (!item) {
//             saveItem(element, items)
//               .then(item => {
//                 console.log(item);
//                 callback(null, item);
//               })
//               .catch(e => {
//                 console.log("Something went wrong");
//               });
//           } else {
//             callback(null, item);
//           }
//           arr.push(item);
//         }
//       }
//     );
//   },
//   err => {
//     if (err) {
//       console.log("A element failed to process", err);
//       res.status(500).json(err);
//     } else {
//       console.log("All elements have been processed successfully");
//       // array with the results of each removeTodo job
//       res.send(arr);
//     }
//   }
// );

app.get("/prices", (req, res, next) => {
  Item.find().then(items => {
    let time = 5000;
    let size = items.length;
    console.log(items.length);
    var i = 0;
    myLoop();
    function myLoop() {
      setTimeout(function() {
        request(
          `https://steamcommunity.com/market/priceoverview/?currency=3&appid=730&market_hash_name=${
            items[i].market_hash_name
          }`,
          (e, r, body) => {
            Price.findOne({ itemid: items[i - 1]._id })
              .then(item => {
                if (!item) {
                  console.log(items[i - 1].market_hash_name);
                  let price = new Price({
                    itemid: items[i - 1]._id,
                    name: items[i - 1].market_hash_name,
                    prices: {
                      price: JSON.parse(body).lowest_price,
                      volume: JSON.parse(body).volume
                    }
                  });
                  price
                    .save()
                    .then(price => {
                      console.log(`Price saved for id: ${price.itemid}`);
                    })
                    .catch(e => console.log(e));
                } else {
                  let price = {
                    price: JSON.parse(body).lowest_price,
                    volume: JSON.parse(body).volume
                  };
                  item.prices.unshift(price);
                  item.save().then(item => {
                    console.log(items[i - 1].market_hash_name);
                    console.log(
                      `Price Updated price= ${
                        item.prices[0].price
                      } --- volume = ${item.prices[0].volume}`,
                      " index of  : " + i
                    );
                  });
                }
              })
              .catch(e => {
                console.log(e);
              });
          }
        );
        if (i < items.length) {
          myLoop();
          i++;
        } else {
          return;
        }
      }, time);
    }

    res.send({ time, items: size });
  });
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
