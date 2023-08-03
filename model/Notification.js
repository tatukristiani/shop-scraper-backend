const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    product: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
    },
    email: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model("Notification", notificationSchema);