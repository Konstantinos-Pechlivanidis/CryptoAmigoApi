const { fetch_exchange_rates } = require("../../scripts/fetchCurrencies");

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const geckoSchema = new Schema(
  {
    _id: false,
    id: {
      type: String,
      required: true,
    },
    user_ids: [
      {
        type: String,
      },
    ],
    any: {},
  },
  { strict: false, timestamps: true }
);

geckoSchema.statics.UpdateCoins = async function (currency, page) {
  // 1) find all the exchange rates and save them in a variable
  const fetch_rates = await fetch_exchange_rates();
  const exchange_rates = fetch_rates[0].data;

  // 2) update the coins with the selected currency
  //    using the coin Model
  for (const [key, value] of Object.entries(exchange_rates)) {
    if (currency.toUpperCase() === key) {
      const update = await this.updateMany(
        { "data.market_cap_rank": { $ne: null } },
        [
          {
            $set: {
              [`${currency}.id`]: "$data.id",
              [`${currency}.symbol`]: "$data.symbol",
              [`${currency}.name`]: "$data.name",
              [`${currency}.image`]: "$data.image",
              [`${currency}.market_cap_rank`]: "$data.market_cap_rank",
              [`${currency}.price_change_percentage_24h`]:
                "$data.price_change_percentage_24h",
              [`${currency}.market_cap_change_percentage_24h`]:
                "$data.market_cap_change_percentage_24h",
              [`${currency}.price_change_percentage_1h_in_currency`]:
                "$data.price_change_percentage_1h_in_currency",
              [`${currency}.price_change_percentage_1y_in_currency`]:
                "$data.price_change_percentage_1y_in_currency",
              [`${currency}.price_change_percentage_200d_in_currency`]:
                "$data.price_change_percentage_200d_in_currency",
              [`${currency}.price_change_percentage_30d_in_currency`]:
                "$data.price_change_percentage_30d_in_currency",
              [`${currency}.price_change_percentage_7d_in_currency`]:
                "$data.price_change_percentage_7d_in_currency",
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

  // 3) find method to return all the updated trending coins with the selected currency
  const coinsPerPage = 30;
  const geckoData = await this.find({
    [`${currency}.market_cap_rank`]: { $ne: null },
  })
    .sort({ [`${currency}.market_cap_rank`]: 1 })
    .skip(page * coinsPerPage)
    .limit(coinsPerPage)
    .select(`${currency}`);

  return geckoData;
};

geckoSchema.statics.UpdateSearch = async function (currency, query) {
  // 1) find all the exchange rates and save them in a variable
  const fetch_rates = await fetch_exchange_rates();
  const exchange_rates = fetch_rates[0].data;

  // 2) update the coins with the selected currency
  //    using the coin Model
  for (const [key, value] of Object.entries(exchange_rates)) {
    if (currency.toUpperCase() === key) {
      const update = await this.updateMany(
        {
          $or: [
            { "data.id": { $regex: query } },
            { "data.name": { $regex: query } },
            { "data.symbol": { $regex: query } },
          ],
        },
        [
          {
            $set: {
              [`${currency}.id`]: "$data.id",
              [`${currency}.symbol`]: "$data.symbol",
              [`${currency}.name`]: "$data.name",
              [`${currency}.image`]: "$data.image",
              [`${currency}.market_cap_rank`]: "$data.market_cap_rank",
              [`${currency}.price_change_percentage_24h`]:
                "$data.price_change_percentage_24h",
              [`${currency}.market_cap_change_percentage_24h`]:
                "$data.market_cap_change_percentage_24h",
              [`${currency}.price_change_percentage_1h_in_currency`]:
                "$data.price_change_percentage_1h_in_currency",
              [`${currency}.price_change_percentage_1y_in_currency`]:
                "$data.price_change_percentage_1y_in_currency",
              [`${currency}.price_change_percentage_200d_in_currency`]:
                "$data.price_change_percentage_200d_in_currency",
              [`${currency}.price_change_percentage_30d_in_currency`]:
                "$data.price_change_percentage_30d_in_currency",
              [`${currency}.price_change_percentage_7d_in_currency`]:
                "$data.price_change_percentage_7d_in_currency",
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

  // 3) find method to return all the updated trending coins with the selected currrency
  const geckoData = await this.find({
    $or: [
      { "data.id": { $regex: query } },
      { "data.name": { $regex: query } },
      { "data.symbol": { $regex: query } },
    ],
  })
    .select([`${currency}`])
    .sort({ [`${currency}.market_cap`]: -1 });
  // use market_cap because some coins have rank = null

  return geckoData;
};

geckoSchema.statics.UpdateWatchlist = async function (currency, _id) {
  // 1) find all the exchange rates and save them in a variable
  const fetch_rates = await fetch_exchange_rates();
  const exchange_rates = fetch_rates[0].data;

  // 2) update the coins with the selected currency
  //    using the coin Model
  for (const [key, value] of Object.entries(exchange_rates)) {
    if (currency.toUpperCase() === key) {
      const update = await this.updateMany(
        { user_ids: { $eq: _id } },
        [
          {
            $set: {
              [`${currency}.id`]: "$data.id",
              [`${currency}.symbol`]: "$data.symbol",
              [`${currency}.name`]: "$data.name",
              [`${currency}.image`]: "$data.image",
              [`${currency}.market_cap_rank`]: "$data.market_cap_rank",
              [`${currency}.price_change_percentage_24h`]:
                "$data.price_change_percentage_24h",
              [`${currency}.market_cap_change_percentage_24h`]:
                "$data.market_cap_change_percentage_24h",
              [`${currency}.price_change_percentage_1h_in_currency`]:
                "$data.price_change_percentage_1h_in_currency",
              [`${currency}.price_change_percentage_1y_in_currency`]:
                "$data.price_change_percentage_1y_in_currency",
              [`${currency}.price_change_percentage_200d_in_currency`]:
                "$data.price_change_percentage_200d_in_currency",
              [`${currency}.price_change_percentage_30d_in_currency`]:
                "$data.price_change_percentage_30d_in_currency",
              [`${currency}.price_change_percentage_7d_in_currency`]:
                "$data.price_change_percentage_7d_in_currency",
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

  // 3) find method to return all the updated coins with the selected currency
  const geckoData = await this.find({ user_ids: { $eq: _id } })
    .sort({ [`${currency}.market_cap_rank`]: 1 })
    .select([`${currency}`]);
  // use market_cap because some coins have rank = null

  return geckoData;
};

module.exports = mongoose.model("Coins", geckoSchema);
