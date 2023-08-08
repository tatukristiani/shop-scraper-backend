const axios = require("axios");
const cheerio = require("cheerio");

const getProducts = async (req, res) => {
    const query = req.query;
    const product = query.product.toLowerCase();
    const priceOfProduct = query.price;
    let products = [];
    let promises = [];

    console.log("Get Products, given product: " + product);

    for (let page = 1; page < 20; page++) {
        // Seuraava linkki toimii hakusanalla ja sivunumerolla. Myös asettaa tuotteet halvimmasta alkaen.
        let url2 = `https://www.tori.fi/koko_suomi?ca=18&q=${product}&sp=1&w=3&o=${page}`;
        promises.push(
            axios({
                method: 'get',
                url: url2,
                responseEncoding: 'latin1'
            }).then(response => {
                const html = response.data;
                const $ = cheerio.load(html);

                // Finds Title of the product and price for it.
                $(".item_row_flex", html).each(function () {
                    const title = $(this).find(".li-title").text();
                    const price = $(this).find(".list_price").text();
                    const link = $(this).attr("href");
                    const image = $(this).find(".item_image").attr("src");

                    //console.log("Title is " + title);
                    //console.log("Image is: " + image);
                    if (title.toLowerCase().includes(product) && parseInt(price) <= priceOfProduct) {
                        products.push({
                            title,
                            price,
                            link,
                            image
                        });
                    }
                })
            }));
    }

    await Promise.all(promises).then(() => {
        res.end(JSON.stringify(products));
    });

}


module.exports = {
    getProducts
}