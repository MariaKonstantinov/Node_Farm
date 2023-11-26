const fs = require("fs");
const http = require("http");
const path = require("path");
const url = require("url");

// SERVER

// universal function to replace placeholders with product templates; takes a template and a product; "product" is an arg that we pass to the function and "productName" is the name of the filed in JSON; we wrap it as a reg expression in "/" and add "g" to have it as global, so all placeholders will get replaced
const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);

  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);

  // condition for non-organic product (if the condition is false in boolean in JSON); "not-organic" is a css class
  if (!product.organic)
    output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic");
  return output;
};

// we can read the templates once in a sync way outside the callback function (same way we did with the (dev-data) below)
const tempOverview = fs.readFileSync(
  `${__dirname}/public/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/public/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/public/templates/template-product.html`,
  "utf-8"
);

// the top-level code that is outside the callback functions gets executed just once we start the program, so it doesn't block the execution; so we will read the file just once, and simply send data to client when there is a request
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");

// parsing data into object (dataObj is an array of 5 objects)
// we need to loop over this array and for each product replace the placeholder with a template with the actual data
const dataObj = JSON.parse(data);

// each time a new request hits the server, this callback function is being executed
const server = http.createServer((req, res) => {
  //const { query, pathname } = url.parse(req.url, true);
  const { query, pathname } = url.parse(req.url, true);

  // OVERVIEW PAGE -------------------------------------------->
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });

    // loop over the dataObj array with all products and in each iteration replace placeholders in template card with the current product which is "el"; in arrow functions if we don't have {} the value gets automatically returned without "return" keyword
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))

      // join elements into a string
      .join("");

    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);

    res.end(output);

    // PRODUCT PAGE -------------------------------------------->
  } else if (pathname === "/product") {
    res.writeHead(200, { "Content-type": "text/html" });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);

    res.end(output);

    // API -------------------------------------------->
  } else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });

    // api sending back response to client, needs to be a string, not an object
    res.end(data);

    // NOT FOUND
  } else {
    const filePath = path.join(__dirname, "public", req.url);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-type": "text/html" });
        res.end("<h1>Page Not Found!</h1>");
      } else {
        res.writeHead(200, { "Content-type": "text/html" });
        res.end(data);
      }
    });
  }
});

// then we are listening for incoming requets on the local host IP, on port 8000
server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
