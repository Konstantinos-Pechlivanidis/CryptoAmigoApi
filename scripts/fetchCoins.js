const axios = require("axios");
const Coins = require("../models/crypto/coinsModel");

function delay(t, val) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(val);
    }, t);
  });
}

const fetch1 = async () => {
  let page = 1;

  while (true) {
    if (page > 10) {
      page = 1;
      continue;
    }

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=250&page=${page}&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d%2C200d%2C1y`
    );

    const data = response.data;

    data.map(async (data) => {
      const result = await Coins.updateMany(
        { id: data.id },
        {
          $set: {
            id: data.id,
            data,
          },
        },
        { upsert: true, order: true }
      );
    });
    await delay(15000);
    page = page + 1;
  }
};

const fetch2 = async () => {
  let page = 11;
  while (true) {
    if (page > 30) {
      page = 11;
      continue;
    }

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=250&page=${page}&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d%2C200d%2C1y`
    );

    const data = response.data;

    data.map(async (data) => {
      const result = await Coins.updateMany(
        { id: data.id },
        {
          $set: {
            id: data.id,
            data,
          },
        },
        { upsert: true, order: true }
      );
    });
    await delay(30000);
    page = page + 1;
  }
};

const fetch3 = async () => {
  let page = 31;
  while (true) {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=250&page=${page}&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d%2C200d%2C1y`
    );

    if (Object.keys(response.data).length === 0) {
      console.log("start again - data array is empty");
      page = 31;
      continue;
    }

    const data = response.data;

    data.map(async (data) => {
      const result = await Coins.updateMany(
        { id: data.id },
        {
          $set: {
            id: data.id,
            data,
          },
        },
        { upsert: true, order: true }
      );
    });
    await delay(35000);
    page = page + 1;
  }
};

const fetchCoins = async () => {
  // Promise.all([fetch1(), fetch2(), fetch3()]);
  Promise.allSettled([fetch1(), fetch2(), fetch3()]);
};

module.exports = { fetchCoins };
