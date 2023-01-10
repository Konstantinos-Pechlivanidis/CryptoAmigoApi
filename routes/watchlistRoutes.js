const express = require("express");
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const {
  postWatchlist,
  getWatchlist,
  deleteFromWatchlist,
} = require("../controllers/cryptoController");


router.use(requireAuth);

router.post("/post_watchlist", postWatchlist);
router.get("/get_watchlist", getWatchlist);
router.delete("/delete_watchlist/:id", deleteFromWatchlist);

module.exports = router;
