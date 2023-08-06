const dotenv = require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const JWT = require("./JwtToken");
const User = require("../model/User");

const oAuth2Client = new OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// Product data contain objects -> {title: "title of product", link: "link to product page"}
/**
 * Tries to send an email about products that were found.
 * @param {object[]} productData  - Array of objects containing title (Title of the product), link (Link to the product page) and email to send the information.
 * @param {string} recipientEmail - Email address of the recipient.
 * @returns The result of the nodemailer sendMail() method or information about an error when it occurs.
 */
async function SendNotificationEmail(productData, recipientEmail) {
    const emailSubject = constructNotificationEmailSubject(productData);
    const emailBody = constructNotificationEmailBody(productData);

    return SendEmail(recipientEmail, emailSubject, emailBody);
}

async function SendForgotPasswordEmail(recipient) {
    const emailBody = await constructForgotPasswordBody(recipient);

    if (emailBody != null) {
        return await SendEmail(recipient, 'Reset Password - ShopScraper', emailBody);
    } else {
        return null;
    }
}

async function SendEmail(recipient, emailSubject, emailBody) {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.EMAIL_SENDER,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: accessToken
        }
    })

    const mailOptions = {
        from: "ShopScraper",
        to: recipient,
        subject: emailSubject,
        html: emailBody
    }

    await transport.sendMail(mailOptions)
        .then(result => {
            console.log(result);
            return `Email sent to ${recipient}`;
        }).catch(error => {
            console.log(error);
            return `Failed to send email to ${recipient}`;
        });
}


// ---------------------------- Notification Email Helper Methods ---------------------------------
function constructNotificationEmailSubject(productData) {
    return productData.length > 1 ? "SHOP Notification - Products Found!" : "SHOP Notification - Product found";
}

function constructNotificationEmailBody(productData) {
    let productDataStrings = "";
    for (let i = 0; i < productData.length; i++) {
        let string = productDataStrings.concat(`<br><img src="${productData[i].image}" /><br/><a href="${productData[i].link}">${productData[i].title}</a><br>`);
        productDataStrings = string;
    }

    const header = productData.length > 1 ? "Products were found with the price requirement!" : "Product was found with the price requirement!";

    const emailBody =
        '<h1>' + header + '</h1>' +
        '<br>' +
        productDataStrings +
        '<br>' +
        '<p>Products were found by ShopScraper</p>';

    return emailBody;
}


// ---------------------------- Forgot Password Email Helper Methods ---------------------------------
async function constructForgotPasswordBody(recipient) {

    try {
        // Try and find the user by email
        const userFromDatabase = await User.findOne({
            email: recipient
        });

        if (userFromDatabase != null) {
            const id = userFromDatabase.id;
            const payload = {
                id: id,
                email: recipient
            };

            const jwtToken = await JWT.CreateJwtToken(payload);

            if (jwtToken != null) {
                const emailBody =
                    '<h1>Hi! You recently send a request to reset your password.</h1>' +
                    '<br>' +
                    '<p>If this request was not made by you, we highly recommend to change your password as soon as possible!</p>' +
                    '<br>' +
                    `<p>Please click the following link to reset your password: <a href="${process.env.APPLICATION_BASE_URL}/reset-password/${id}/${jwtToken}">Click Here!</a></p>`;

                return emailBody;
            } else {
                return null;
            }

        } else {
            console.log("User not found from database!");
            return null;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}

module.exports = {
    SendEmail,
    SendNotificationEmail,
    SendForgotPasswordEmail
}