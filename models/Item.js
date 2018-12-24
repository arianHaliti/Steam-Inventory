const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ItemSchema = new Schema(
  {
    _id: {
      type: String,
      required: true
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
    type: {
      type: String
    },
    marketable: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },

    count: {
      type: Number
    }
  },
  { toJSON: { virtuals: true } }
);
ItemSchema.virtual("prices", {
  ref: "prices",
  localField: "_id",
  foreignField: "itemid"
});
Item = mongoose.model("items", ItemSchema);

module.exports = Item;
