require('dotenv').config()
const express = require('express');
const bodyParser = require("body-parser");
const dns = require('dns');
const app = express();

//Use body-parser to Parse POST Requests
app.use(bodyParser.urlencoded({ extended: false }))

//prevent duplicata and store all URL
let urlDatabase = {};

//generate a random URL 
function generateRandomUrl() {
  let shortUrl;
  do {
    shortUrl = Math.floor(Math.random() * 100000);
  } while (urlDatabase[shortUrl]);
  return shortUrl;
}

//You can POST a URL to /api/shorturl and get a JSON response with original_url and short_url properties.
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  let hostname;

  try {
    const parsedUrl = new URL(originalUrl);
    hostname = parsedUrl.hostname;
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const shortUrl = generateUniqueShortUrl();
    urlDatabase[shortUrl] = originalUrl;

    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });
  });
});


//When you visit /api/shorturl/<short_url>, you will be redirected to the original URL.
app.get('/api/shorturl/:id', (req, res) => {
  const shortUrl = req.params.id;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).json({ error: 'No short URL found for the given input' });
  }
});

 module.exports = app;