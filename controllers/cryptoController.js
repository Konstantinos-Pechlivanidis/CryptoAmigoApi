const { id } = require("apicache");
const axios = require("axios");

const Coins = require("../models/crypto/coinsModel");
const trendingCoins = require("../models/crypto/trendingCoinsModel");
const Exchanges = require("../models/crypto/exchangesModel");

// Trading Page
const getCoins = async (request, response) => {
  //page=0 -> returns first 20 coins
  const page = request.query.page || 0;

  // "data" = eur -> saved directly from the coingecko fetch script
  // so data is eur, and if theres a currency -> changes
  // let -> so the value can be changed
  let currency = request.query.currency || "data";
  if (currency === "eur") currency = "data";

  try {
    const geckoData = await Coins.UpdateCoins(currency, page);
    response.status(200).json(geckoData);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};

// TradingPage
const getTrendingCoins = async (request, response) => {
  let currency = request.query.currency || "data";
  if (currency === "eur") currency = "data";
  try {
    const geckoData = await trendingCoins.UpdateTrending(currency);
    response.status(200).json(geckoData);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};

// SingleCoin Page
// no need for currency updates
const getSingleCoin = async (request, response) => {
  let id = request.params.id;
  try {
    const axiosResponse = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}?localization=false&community_data=false&developer_data=false`
    );
    response.status(200).json(axiosResponse.data);
  } catch (err) {
    response.status(500).json({ error: "Could not fetch the documents" });
  }
};

// singleCoin Page
const getChart = async (request, response) => {
  let id = request.params.id;
  let currency = request.query.currency;
  let days = request.query.days;

  try {
    const axiosResponse = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${currency}&days=${days}`
    );
    response.status(200).json(axiosResponse.data);
  } catch (err) {
    response.status(500).json({ error: "Could not fetch the documents" });
  }
};

//TradingPage
const getSearchCoin = async (request, response) => {
  const query = request.query.query;
  let currency = request.query.currency || "data";
  if (currency === "eur") currency = "data";
  try {
    const geckoData = await Coins.UpdateSearch(currency, query);
    response.status(200).json(geckoData);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};

// Watchlist Page
const postWatchlist = async (request, response) => {
  const { id } = request.body;
  const { _id } = request.user;

  const exists = await Coins.find({
    id: id,
    user_ids: { $eq: _id },
  }).select("_id");

  // find the coin by its id and check if the _id exists in user_ids array
  // if yes -> exists takes the coin _id data of the user_ids array
  // if not -> exists is an empty array
  if (exists.length === 0) {
    await Coins.findOneAndUpdate(
      { id: id },
      {
        $push: {
          user_ids: _id,
        },
      },
      { upsert: true, order: true }
    )
      .then((data) => response.status(200).json(data))
      .catch(() => {
        response.status(500).json({ error: "Could not fetch the documents" });
      });
  } else {
    response.status(201).json(`${id} is already in users watchlist`);
  }
};

// Watchlist Page
const getWatchlist = async (request, response) => {
  const { _id } = request.user;
  let currency = request.query.currency || "data";
  if (currency === "eur") currency = "data";
  try {
    const geckoData = await Coins.UpdateWatchlist(currency, _id);
    response.status(200).json(geckoData);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
};

// Watchlist Page
const deleteFromWatchlist = async (request, response) => {
  const { id } = request.params;
  const { _id } = request.user;

  const geckoData = await Coins.findOneAndUpdate(
    { "data.id": id },
    {
      $pull: {
        user_ids: _id,
      },
    }
  )
    .then((data) => response.status(201).json(data))
    .catch(() => {
      response.status(500).json({ error: "Could not fetch the documents" });
    });
};

// Exchanges Page
const getSingleExchange = async (request, response) => {
  let id = request.params.id;
  try {
    const axiosResponse = await axios.get(
      `https://api.coingecko.com/api/v3/exchanges/${id}`
    );
    response.status(200).json(axiosResponse.data);
  } catch (err) {
    response.status(500).json({ error: "Could not fetch the documents" });
  }
};

// Exchanges Page
const getExchanges = async (request, response) => {
  //page=0 -> returns first 20 coins
  const page = request.query.page || 0;
  const coinsPerPage = 20;

  const geckoData = await Exchanges.find({
    "data.trust_score_rank": { $ne: null },
  })
    .select("data")
    .sort({ "data.trust_score_rank": 1 })
    .skip(page * coinsPerPage)
    .limit(coinsPerPage)
    .then((data) => {
      response.status(200).json(data);
    })
    .catch(() => {
      response.status(500).json({ error: "Could not fetch the documents" });
    });
};

const getSearchExchange = async (request, response) => {
  const query = request.query.query;
  const geckoData = await Exchanges.find({
    $or: [{ "data.id": { $regex: query } }, { "data.name": { $regex: query } }],
  })
    .select("data")
    .then((data) => response.status(200).json(data))
    .catch(() => {
      response.status(500).json({ error: "Could not fetch the documents" });
    });
};

module.exports = {
  getCoins,
  getTrendingCoins,
  getSingleCoin,
  getChart,
  getSearchCoin,
  getExchanges,
  getSingleExchange,
  getSearchExchange,
  postWatchlist,
  getWatchlist,
  deleteFromWatchlist,
};
