const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PriceSchema = new Schema({
  itemid: {
    type: String
  },
  name: {
    type: String
  },
  prices: [
    {
      price: {
        type: String,
        deafult: "0.00"
      },
      volume: {
        type: String,
        deafult: "0"
      },
      date: {
        type: Date,
        default: Date.now()
      }
    }
  ]
});
Price = mongoose.model("prices", PriceSchema);

module.exports = Price;
