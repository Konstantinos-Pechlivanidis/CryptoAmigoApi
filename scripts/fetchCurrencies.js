require("dotenv").config();
const axios = require("axios");
const Currencies = require("../models/currency/currenciesModel");
const schedule = require("node-schedule");

const fetchCurrencies = async () => {
  schedule.scheduleJob("1 */2 * * *", async () => {
    // execute the function every day At minute 1 past every 2nd hour.
    const AxiosResponse = await axios.get(
      `https://api.apilayer.com/fixer/latest?base=EUR&apikey=${process.env.FIXER_IO_API_KEY}`
    );

    const data = AxiosResponse.data.rates;
    const result = await Currencies.updateMany(
      {},
      {
        $set: {data},
      },
      { upsert: true, order: true }
    );
  });
};


const fetch_exchange_rates = async () => {
  const data = await Currencies.find({}).select([
    "data.USD",
    "data.JPY",
    "data.GBP",
    "data.CAD",
    "data.AUD",
  ]);
  return data;
};

// how to use it
// (async () => {
//   const users = await fetch_exchange_rates()
//   console.log(users)
// })()

module.exports = { fetchCurrencies,fetch_exchange_rates };
