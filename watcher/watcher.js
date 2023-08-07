const axios = require("axios");
const dotenv = require("dotenv").config();
const Notification = require("../model/Notification");
const EmailSender = require("../utility/EmailSender");

const watcher = async () => {
    console.log("Watcher trying to find active notifications...");
    let notificationsList = [];
    await Notification.find({ active: true })
        .then(notifications => {
            for (let i = 0; i < notifications.length; i++) {
                notificationsList.push(notifications[i]);
            }
        })
        .catch(err => {
            console.log("ERROR during watcher run");
        })

    if (notificationsList.length > 0) {
        StartWatching(notificationsList);
    } else {
        console.log("No notification is active");
    }
}

// Starts the watching process.
function StartWatching(productNotifications) {
    console.log("Watcher started to find products...");
    checkNotificationsFromTori(productNotifications);
}

// Check every notification from database and tries to find products from tori.
async function checkNotificationsFromTori(productNotifications) {
    for (let index = 0; index < productNotifications.length; index++) {
        let productDataArray = await searchForProduct(productNotifications[index]);

        // Update notification active property to false if products were found & send an email
        if (productDataArray.length !== 0) {
            console.log("Watcher found products...");
            await Notification.findByIdAndUpdate(productNotifications[index]._id, { "active": false });
            await EmailSender.SendNotificationEmail(productDataArray, productNotifications[index].email)
                .then(result => console.log(result))
                .catch(error => console.log(error));
        }

    }
}

// Searches products from tori.
async function searchForProduct(productNotification) {
    const response = await axios.get(`${process.env.API_BASEURL}products?product=${productNotification.product}&price=${productNotification.price}`);
    const data = response.data;
    let links = [];

    if (data && data.length > 0) {
        console.log("Found result!");
        data.forEach(product => {
            links.push({ title: product.title, link: product.link, image: product.image });
        });
    }
    return links;
}


module.exports = watcher;