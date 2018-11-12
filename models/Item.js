const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  itemid: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  icon: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  market_hash_name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
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
  ],
  count: {
    type: Number
  }
});
Item = mongoose.model("items", ItemSchema);

module.exports = Item;
