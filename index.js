const dotenv = require("dotenv").config();
const cron = require("node-cron");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConnection");
const cors = require("cors");
const watcher = require("./watcher/watcher");
const PORT = 4000;

connectDB();

const app = express();

// built-in middleware to handle urlencoded form data
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

// built-in middleware for json
app.use(express.json());

// Cross Origin Resource Sharing
//app.use(cors());
/* Allowed origins, localhost + netlify
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:4000',
    'https://keen-cassata-9a91f3.netlify.app'
];
*/

// Add Access Control Allow Origin headers (Only Netlify)
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "https://keen-cassata-9a91f3.netlify.app");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

// Access Control Allow Origin headers (Localhost and Netlify)
/*
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", ["https://keen-cassata-9a91f3.netlify.app", "http://localhost:3000"]);
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
*/

app.use("/", require("./routes/root"));

// Routes for product related endpoints
app.use("/products", require("./routes/products"));

// Route for Notification related endpoints
app.use("/notifications", require("./routes/notifications"));

// Routes for account related endpoints
app.use("/account", require("./routes/account"));


// Connect to database and start listening on possible notifications
mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || PORT, () => {
        console.log(`Server running on Port: ${PORT}`);

        // Every 1 hour tries to find products of all enabled notifications and sends an email if any were found
        cron.schedule('* 0-23 * * *', () => watcher());

    })
});
