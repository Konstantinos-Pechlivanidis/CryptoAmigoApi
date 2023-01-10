require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cryptoRoutes = require("./routes/cryptoRoutes");
const userRoutes = require("./routes/userRoutes");
const exchangesRoutes = require("./routes/exchangesRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const { fetchCoins } = require("./scripts/fetchCoins");
const { fetchTrending } = require("./scripts/fetchTrending");
const { fetchExchanges } = require("./scripts/fetchExchanges");
const { fetchCurrencies } = require("./scripts/fetchCurrencies");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// i can use them to router to specify which endpoints can have rateLimit and SlowdDown
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");

// express app
const app = express();

// middleware
app.use(express.json());
app.use(cors());

// swagger middleware
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// http://localhost:4000/api-docs/

// Rate Limit Middleware
// stop users from spamming my endpoints
const limiter = rateLimit({
  // the time i want the user to limit in miliseconds
  // i gave 1 minute
  windowMs: 1 * 60 * 1000,

  //how many requests the user can make in that time
  // i gave max 16 requests
  max: 16,
});
app.use(limiter);

const speedLimiter = slowDown({
  windowMs: 60 * 1000, // every 1 min
  delayAfter: 5, // after the 5 request made
  delayMs: 500, // slowDown every other by 500ms
});
app.use(speedLimiter);
// because of the direct fetches in some endpoints from Coingecko,
// speedLimiter will help my Web App not to crash because of spamming many endpoints!

app.set("trust proxy", 1);
// use the rate-limiter to the ip addresses that make the requests
// if i dont do this i will rate-limit the localhost because its behind the proxy
// opote kathe ena request ginetai ksexorista rate-limiting kai egw thelw ola ta request na ginontai mazi
// rate-limiting apo mia sygkekrimenh ip address

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// routes
app.use("/api/coins", cryptoRoutes);
app.use("/api/exchanges", exchangesRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/user", userRoutes);

// connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // listen to port
    app.listen(process.env.PORT, () => {
      console.log(
        "connected to db & listening for requests on port",
        process.env.PORT
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });

// auto-fetching the data from coingecko
fetchCoins();
fetchTrending();
fetchExchanges();
fetchCurrencies();
