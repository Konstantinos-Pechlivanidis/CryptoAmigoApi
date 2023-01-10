const express = require("express");
const router = express.Router();
const apicache = require('apicache');
const requireAuth = require('../middleware/requireAuth');
const {
  getCoins,
  getTrendingCoins,
  getSingleCoin,
  getChart,
  getSearchCoin,
} = require("../controllers/cryptoController");



// Initialise the cache
let cache = apicache.middleware;

router.use(requireAuth);

router.get("/", cache('1 minute'), getCoins);
router.get("/trending", cache('2 minutes'), getTrendingCoins);
router.get("/search_coin", cache('2 minutes'), getSearchCoin);
router.get("/:id", cache('2 minutes'), getSingleCoin);
router.get("/:id/market_chart", cache('2 minutes'), getChart);


module.exports = router;
