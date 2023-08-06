var jwt = require('jwt-simple');
const User = require("../model/User");

async function CreateJwtToken(payload) {
    const id = payload.id;
    const email = payload.email;

    try {
        const userFromDatabase = await User.findOne({
            email: email,
            _id: id
        });

        if (userFromDatabase != null) {
            const secret = userFromDatabase.password + '-' + id;
            var token = jwt.encode(payload, secret);
            console.log("1: " + token);

            return token;
        } else {
            return null;
        }
    } catch (error) {
        console.log("Error while creating JWT Token. Error: " + error);
        return null;
    }
}

async function DecodeJwtToken(id, token) {
    try {
        const userFromDatabase = await User.findOne({
            _id: id
        });

        if (userFromDatabase != null) {
            const secret = userFromDatabase.password + '-' + id;
            var payload = await jwt.decode(token, secret);

            return payload;
        } else {
            return null;
        }
    } catch (error) {
        console.log("Error while trying to Decode JWT Token. Error: " + error);
        return null;
    }
}

module.exports = {
    CreateJwtToken,
    DecodeJwtToken
}