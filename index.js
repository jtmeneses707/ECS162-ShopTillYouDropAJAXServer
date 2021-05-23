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
// Sends the init. list of first 99 CA schools in alpha. order to the client. 
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
// Sends all info for school needed in shop 2. 
// Sends only cost based on in-state numbers. 
app.get("/api/get-school-cost", async function(req, res) {
  let schoolData = await getSchoolData(req.query.school);
  // Total Cost Including Room, Board, Books and Fees, and Tuition
  let totalCost = Number(schoolData["latest.cost.attendance.academic_year"]);
  // Cost of tuition alone. 
  let tuition = Number(schoolData["latest.cost.tuition.in_state"]);
  let data = {
    'tuition': tuition,
    'other': totalCost - tuition,
    'total': totalCost
  }
  console.log("School data", data);
  // Send json of data containing tuition, total, and other costs.
  res.json(data);
  // console.log("Data Received: ", schoolData);
  // console.log("Cost: ", totalCost);
});

// Gets discount amount based on family income for specific school.
// Param for income level range is sent with query.
app.get("/api/get-school-discount", async function(req, res) {
  let schoolData = await getSchoolData(req.query.school);
  // Get cost by income level based on query param.
  // latest.cost.net_price.public.by_income_level
  let priceByIncome = schoolData[`latest.cost.net_price.public.by_income_level.${req.query.range}`];
  console.log(priceByIncome);
  let totalCost = Number(schoolData["latest.cost.attendance.academic_year"]);
  let tuition = Number(schoolData["latest.cost.tuition.in_state"]);
  res.json({
    'tuition': tuition,
    'other': totalCost - tuition,
    'total': totalCost,
    'discount': priceByIncome - totalCost
  });
});



// Helper functions

/**
 * Returns JSON data of a school's data from gov API. 
 * @param {string} school
 */
async function getSchoolData(school, ) {
  const getSchool = `https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${apiKey}&school.name=${school}&fields=latest.cost`;
  console.log("Sending data for: " + school);
  let schoolData = await fetch(getSchool);
  // Exclude meta data, get only data. 
  schoolData = await schoolData.json();
  // Get only JSON data, not array of JSON data. 
  schoolData = schoolData.results[0];
  return schoolData;
}


/**
 * Returns a boolean for if a school is a CA public school.
 * @param {string} school
 * @return {bool}
 */
function isPublic(school) {
  return (school.includes("University of Californa") || school.includes("California State University"))
}






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
