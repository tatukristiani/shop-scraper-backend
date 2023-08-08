const dotenv = require("dotenv").config();
const cron = require("node-cron");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConnection");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
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
app.use(cors());
app.use(cors(corsOptions)); // Cors options declare what origins are allowed.

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
