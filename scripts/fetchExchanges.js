const schedule = require("node-schedule");
const axios = require("axios");
const Exchanges = require("../models/crypto/exchangesModel");

function delay(t, val) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(val);
    }, t);
  });
}

const fetchExchanges = async () => {
  let page = 1;
  let flag = false;

  schedule.scheduleJob("1 */12 * * *", async () => {
    // execute the function every day At minute 1 past every 12th hour.
    const AxiosResponse = await axios.get(
      `https://api.coingecko.com/api/v3/exchanges?per_page=250&page=${page}`
    );

    if (Object.keys(AxiosResponse.data).length === 0) {
      console.log("start again - Exchanges fetch array is empty");
      flag = true;
      page = 0;
    }

    if (flag === false) {
      const data = AxiosResponse.data;

      data.map(async (data) => {
        const result = await Exchanges.updateMany(
          { "data.id": data.id },
          {
            $set: {
              data,
            },
          },
          { upsert: true, order: true }
        );
      });
      await delay(600000);
    }
    page = page + 1;
  });
};

module.exports = { fetchExchanges };
