const Notification = require("../model/Notification");

const createNotification = async (req, res) => {

    const product = req.body.product;
    const price = req.body.price;
    const active = req.body.active;
    const email = req.body.email;

    try {

        const newNotification = await Notification.create({
            product: product,
            price: price,
            active: active,
            email: email
        });

        res.send("Notification created successfully!");

    } catch (err) {
        res.status(400).send("Failed to add notification");
    }
}


const updateNotification = async (req, res) => {
    const id = req.params.id;

    Notification.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).send({ message: "Couldn't update Notification!" });
            } else {
                res.send(data);
            }
        })
        .catch(err => {
            res.status(500).send({ message: "Error: Notification update failed." });
        })
}

const getNotifications = async (req, res) => {
    const query = req.query;
    const email = query.email;

    Notification.find({ email: email })
        .then(notifications => {
            res.status(200).send(notifications);
        })
        .catch(err => {
            res.status(500).send({ message: err.message });
        })
}


const deleteNotification = async (req, res) => {
    const id = req.params.id;

    Notification.findByIdAndDelete(id).then(data => {
        if (!data) {
            res.status(404).send({ message: "Couldn't delete notification" });
        } else {
            res.send({ message: "Notification removed succesfully" });
        }
    }).catch(err => {
        res.status(500).send({ message: "Server error" });
    });
}

module.exports = {
    createNotification,
    updateNotification,
    getNotifications,
    deleteNotification
}