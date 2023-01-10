const { fetch_exchange_rates } = require("../../scripts/fetchCurrencies");
const Coins = require("../crypto/coinsModel");

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const geckoSchema = new Schema(
  {
    _id: false,
    name: {
      type: String,
      required: true,
    },
    any: {},
  },
  { strict: false }
);

geckoSchema.statics.UpdateTrending = async function (currency) {

  // 1) find all the trending coins and save then in an array
  let trendingData = [];
  trendingData = await this.find({}).select("name");

  // 2) find all the exchange rates and save them in a variable
  const fetch_rates = await fetch_exchange_rates();
  const exchange_rates = fetch_rates[0].data;

  // 3) update the trending coins from trendingData array with the selected currency
  //    using the coin Model 
  for (const [key, value] of Object.entries(exchange_rates)) {
    if (currency.toUpperCase() === key) {
      const update = await Coins.updateMany(
        { id: trendingData.map((coin) => coin.name), },
        [
          {
            $set: {
              [`${currency}.id`]: "$data.id",
              [`${currency}.symbol`]: "$data.symbol",
              [`${currency}.name`]: "$data.name",
              [`${currency}.image`]: "$data.image",
              [`${currency}.market_cap_rank`]: "$data.market_cap_rank",
              [`${currency}.price_change_percentage_24h`]: "$data.price_change_percentage_24h",
              [`${currency}.market_cap_change_percentage_24h`]: "$data.market_cap_change_percentage_24h",
              [`${currency}.price_change_percentage_1h_in_currency`]: "$data.price_change_percentage_1h_in_currency",
              [`${currency}.price_change_percentage_1y_in_currency`]: "$data.price_change_percentage_1y_in_currency",
              [`${currency}.price_change_percentage_200d_in_currency`]: "$data.price_change_percentage_200d_in_currency",
              [`${currency}.price_change_percentage_30d_in_currency`]: "$data.price_change_percentage_30d_in_currency",
              [`${currency}.price_change_percentage_7d_in_currency`]: "$data.price_change_percentage_7d_in_currency",
              [`${currency}.current_price`]: {
                $multiply: ["$data.current_price", value],
              },
              [`${currency}.market_cap`]: {
                $multiply: ["$data.market_cap", value],
              },
              [`${currency}.total_volume`]: {
                $multiply: ["$data.total_volume", value],
              },
              [`${currency}.high_24h`]: {
                $multiply: ["$data.high_24h", value],
              },
              [`${currency}.low_24h`]: {
                $multiply: ["$data.low_24h", value],
              },
              [`${currency}.circulating_supply`]: {
                $multiply: ["$data.circulating_supply", value],
              },
              [`${currency}.total_supply`]: {
                $multiply: ["$data.total_supply", value],
              },
              [`${currency}.ath`]: {
                $multiply: ["$data.ath", value],
              },
              [`${currency}.atl`]: {
                $multiply: ["$data.atl", value],
              },
            },
          },
        ],
        { upsert: true, order: true, multi: true }
      );
    }
  }

  // 4) find method to return all the updated trending coins with the selected currrency
  const geckoData = await Coins.find({
    id: trendingData.map((coin) => coin.name),
  })
    .select([`${currency}`])
  return geckoData;
};

module.exports = mongoose.model("trendingCoins", geckoSchema);