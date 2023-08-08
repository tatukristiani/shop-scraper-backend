/* Allowed origins, localhost + netlify
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:4000',
    'https://keen-cassata-9a91f3.netlify.app'
];
*/

// Only Netlify + self
const allowedOrigins = [
    'https://keen-cassata-9a91f3.netlify.app',
    'https://shop-scraper-backend-9bdcee7fae35.herokuapp.com'
];

module.exports = allowedOrigins;