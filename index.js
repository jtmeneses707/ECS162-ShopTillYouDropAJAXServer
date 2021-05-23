// A static server using Node and Express
const express = require("express");

const fetch = require("node-fetch");

const app = express();


// app.set('trust proxy', true);

// API key for accessing data from gov api.
const apiKey = "1Mv8QnLNFFMrQkMkN6AKDFYPACgTWR8CoXpzWpiS";



const otherApicall = `https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${apiKey}&school.name=University of California-Davis&fields=latest.cost`;


app.use(function(request, response, next) {
  console.log("got request", request.url);
  next();
})

// Initial end point for Shop 1 Layout.
// Sends the init. list of first 99 CA schools to the client. 
app.get("/api/get-school-overview", async function(req, res) {

  // API call for getting first 99 schools awarding degres in call
  const get99 = `https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${apiKey}&school.state=CA&school.degrees_awarded.predominant=3&fields=school.name&per_page=99`;
  console.log("Sending 99 schools.")
  let schools = await fetch(get99);
  schools = await schools.json();
  console.log("Schools: ", schools);
  res.json(schools);
});

// Gets data for a specific school. School name is a query param.
app.get("/api/get-school", async function(req, res) {
  const getSchool = `https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${apiKey}&school.name=${req.query.school}&fields=latest.cost`;
  console.log("Sending data for: " + req.query.school);
  let schoolData = await fetch(getSchool);
  schoolData = await schoolData.json();
  res.json(schoolData);
});





// Test query
app.get("/query/test", async function(req, res, next) {
  console.log("Trying to get API data");
  let t = await fetch(get99);
  t = await t.json();
  res.json(t);
  console.log(t);
});

app.get("/query/test1", async function(req, res, next) {
  let t = await fetch(otherApicall);
  t = await t.json();
  console.log(t);
});

app.use(function(request, response) {
  response.status(404);
  response.send("Cannot answer this request");
})



// listen for requests :)
const listener = app.listen(3000, () => {
  console.log("The static server is listening on port " + listener.address().port);
});



// DB idea: 

// front end gets req from api endpoint

// we handle it here

// look up in DB

// if cant find then send req to gov api, store in DB
