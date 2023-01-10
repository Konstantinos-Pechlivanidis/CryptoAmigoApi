const express = require("express");
const router = express.Router();
const apicache = require('apicache');
const requireAuth = require('../middleware/requireAuth');
const {
  getExchanges,
  getSingleExchange,
  getSearchExchange,
} = require("../controllers/cryptoController");



// Initialise the cache
let cache = apicache.middleware;

router.use(requireAuth);

router.get("/" ,cache('5 minutes'), getExchanges);
router.get("/search_exchange" ,cache('5 minutes'), getSearchExchange);
router.get("/:id" ,cache('5 minutes'), getSingleExchange);

module.exports = router;
