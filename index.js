// A static server using Node and Express
const express = require("express");

const app = express();

// app.set('trust proxy', true);

// API key for accessing data from gov College Data.
const apiKey = "1Mv8QnLNFFMrQkMkN6AKDFYPACgTWR8CoXpzWpiS";
// API call for getting first 99 schools awarding degres in call
const apiCall = `https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${apiKey}&school.state=CA&school.degrees_awarded.predominant=3&fields=school.name&per_page=99`;

const otherApicall = `https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${apiKey}&school.name=University of California-Davis&fields=latest.cost`;


app.use(function (request, response, next) {
  console.log("got request",request.url);
  next();
})

// Test query
app.get("/query/test", async function(req, res, next) {
  console.log("Trying to get API data");
  let t = await fetch(apiCall);
  t = await t.json();
  console.log(t);
});

app.get("/query/test1", async function(req, res, next) {
  let t = await fetch(otherApicall);
  t = await t.json();
  console.log(t);
});

app.use(function (request, response) {
  response.status(404);
  response.send("Cannot answer this request");
})



// listen for requests :)
const listener = app.listen(3000, () => {
  console.log("The static server is listening on port " + listener.address().port);
});


// front end gets req from api endpoint

// we handle it here

// look up in DB

// if cant find then send req to gov api, store in DB
