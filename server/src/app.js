const express    = require("express");
const bodyParser = require("body-parser");
const cors       = require("cors");
const dotenv     = require("dotenv");
const mongoose   = require("mongoose");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({ origin: "*" }));
app.use("/reports", require("./routes/reports"));

dotenv.config();

if (!process.env.JEST_WORKER_ID) {
    mongoose.connect(
        "mongodb+srv://admin:"             + process.env.MONGO_DB_ATLAS_PASSWORD +
        "@test-cluster.beami.mongodb.net/" + process.env.NODE_ENV +
        "?retryWrites=true&w=majority",
        {
            useNewUrlParser:    true,
            useUnifiedTopology: true
        }
    );
}

module.exports = app;
