const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const geckoSchema = new Schema(
  {
    _id: false,
    any: {},
  },
  { strict: false }
);

module.exports = mongoose.model("currencies", geckoSchema);