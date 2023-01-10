const schedule = require("node-schedule");
const axios = require("axios");
const trendingCoins = require("../models/crypto/trendingCoinsModel");

const fetchTrending = async () => {
  schedule.scheduleJob("1 */24 * * *", async () => {
    //At minute 1 past every 24th hour.
    //Top-7 trending coins on CoinGecko as searched by users in the last 24 hours (Ordered by most popular first)
    const AxiosResponse = await axios.get(
      `https://api.coingecko.com/api/v3/search/trending`
    );
    // first delete all the 7 coins
    const deleteCoins = await trendingCoins.deleteMany({});

    //then insert the new 7 coins
    const data = AxiosResponse.data.coins;
    const insertCoins = data.map(async (coin) => {
      await trendingCoins.insertMany({ name: coin.item.id }, { order: true }); //fetch only the coins
    });
  });
};

// i use the delete and insert method because if some crypto are trending today and tomorrow
// its not, then the update method will keep the today crypto inside the db 
// I want only the 7 trending Crypto, not some of the previous days!

module.exports = { fetchTrending };
