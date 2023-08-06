const User = require("../model/User");
const bcrypt = require("bcrypt");
const EmailSender = require("../utility/EmailSender");
const JWT = require("../utility/JwtToken");

const createUser = async (req, res) => {

    const email = req.body.email;
    let password = req.body.password;


    try {
        const userResult = await User.find({ email: email.toString() });
        if (userResult.length == 0) {
            hashedPassword = await bcrypt.hash(password, 12);
            const newUser = await User.create({
                email: email,
                password: hashedPassword
            });

            res.status(201).send("Account created successfully!");

        } else {
            res.status(404).send("Invalid email address or it might be already used.");
        }

    } catch (err) {
        res.status(500).send("Failed to create an account. There was an internal error or the email might already be taken.");
    }
}



const loginUser = async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    try {
        // Try and find the user by email
        const userFromDatabase = await User.findOne({
            email: email
        });

        // If found confirm that the password is correct
        if (userFromDatabase != null) {
            await bcrypt.compare(password, userFromDatabase.password).then(response => {
                if (response) {
                    res.status(200).send("Valid credentials!");
                } else {
                    res.status(401).send("Invalid credentials1!");
                }
            }).catch(err => {
                res.status(401).send("Invalid credentials2!");
            })
        } else {
            res.status(401).send("Invalid credentials3!");
        }

    } catch (err) {
        res.status(401).send("Invalid credentials4!");
    }
}

const updateUser = async (req, res) => {

    const email = req.body.email;
    const operation = req.body.operation;
    const value = req.body.value;

    try {

        // Try and find the user by email
        const userFromDatabase = await User.findOne({
            email: email
        });
        console.log("1");

        // If found confirm that the password is correct
        if (userFromDatabase != null) {
            console.log("2");
            switch (operation) {
                case 'changePassword':
                    hashedPassword = await bcrypt.hash(value, 12);
                    User.updateOne({ _id: userFromDatabase._id }, { $set: { password: hashedPassword } })
                        .then(result => {
                            if (!result) {
                                res.status(404).send("Password could not be changed!");
                            } else {
                                res.status(200).send("Password changed successfully!");
                            }
                        })
                        .catch(err => {
                            res.status(500).send("Something went wrong...");
                        })
                    break;
                case 'changeEmail':
                    const userWithNewEmail = await User.findOne({
                        email: value
                    });

                    if (userWithNewEmail == null) {
                        User.updateOne({ _id: userFromDatabase._id }, { $set: { email: value } })
                            .then(result => {
                                if (!result) {
                                    res.status(404).send("Email could not be changed!");
                                } else {
                                    res.status(200).send("Email changed successfully!");
                                }
                            })
                            .catch(err => {
                                res.status(500).send("Something went wrong...");
                            })
                    } else {
                        res.status(409).send("Email could not be changed due to it already being used!");
                    }
                    break;
                default:
                    console.log("Default operation triggered.");
                    res.status(500).send("Ohhohh... There was no operation available.")

            }
        } else {
            res.status(404).send("Bad reguest!");
        }

    } catch (err) {
        res.status(404).send("Bad request!");
    }
}


const resetPasswordRequest = async (req, res) => {
    const email = req.body.email;

    const emailResult = EmailSender.SendForgotPasswordEmail(email);
    console.log("Result of reset password email send: " + emailResult);

    res.status(200).send("OK");
}


const resetPassword = async (req, res) => {
    const id = req.body.id;
    const token = req.body.token;
    const password = req.body.password;

    try {
        const payload = await JWT.DecodeJwtToken(id, token);
        console.log("Payload: " + payload);

        if (payload != null) {
            hashedPassword = await bcrypt.hash(password, 12);
            await User.updateOne({ _id: id }, { $set: { password: hashedPassword } })
                .then(result => {
                    if (!result) {
                        res.status(404).send("Password could not be changed!");
                    } else {
                        res.status(200).send("Password changed successfully!");
                    }
                })
                .catch(err => {
                    res.status(500).send("Something went wrong...");
                })

        } else {
            res.status(403).send("Forbidden!");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
}

module.exports = {
    loginUser,
    createUser,
    updateUser,
    resetPasswordRequest,
    resetPassword
}