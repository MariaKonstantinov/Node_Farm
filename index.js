const fs = require("fs");
const http = require("http");
const url = require("url");

// SERVER

// the top-level code that is outside the callback functions gets executed just once we start the program, so it doesn't block the execution; so we will read the file just once, and simply send data to client when there is a request
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");

// parsing data into object
const dataObj = JSON.parse(data);

// each time a new request hits the server, this callback function is being executed
const server = http.createServer((req, res) => {
  const pathName = req.url;

  if (pathName === "/" || pathName === "/overview") {
    res.end("This is the OVERVIEW");
  } else if (pathName === "/product") {
    res.end("This is the PRODUCT");
  } else if (pathName === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });

    // api sending back response to client, needs to be a string, not an object
    res.end(data);
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "hello-world",
    });
    res.end("<h1>Page Not Found!</h1>");
  }
});

// then we are listening for incoming requets on the local host IP, on port 8000
server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
