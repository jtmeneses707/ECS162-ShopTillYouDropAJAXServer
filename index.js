// A static server using Node and Express
const express = require("express");
const fetch = require("node-fetch");
const app = express();

// app.set('trust proxy', true);

// API key for accessing data from gov api.
const apiKey = "1Mv8QnLNFFMrQkMkN6AKDFYPACgTWR8CoXpzWpiS";

app.use(function(request, response, next) {
  console.log("got request", request.url);
  next();
})

// Initial end point for Shop 1 Layout.
// Sends the init. list of first 99 CA schools in alpha. order to the client. 
app.get("/api/get-school-overview", async function(req, res) {
  // API call for getting first 99 schools awarding degres in call
  const get99 = `https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${apiKey}&school.state=CA&school.degrees_awarded.predominant=3&fields=school.name&per_page=99`;
  console.log("Retrieving 99 schools...")
  let schools = await fetch(get99);
  schools = await schools.json();
  console.log("SUCCESS: Schools; ", schools);
  res.json(schools);
});

// Gets data for a specific school. School name is a query param.
// Sends all info for school needed in shop 2. 
// Sends only cost based on in-state numbers. 
app.get("/api/get-school-cost", async function(req, res) {
  let schoolData = await getSchoolData(req.query.schoolName);
  // Total Cost Including Room, Board, Books and Fees, and Tuition
  let totalCost = Number(schoolData["latest.cost.attendance.academic_year"]);
  // Cost of tuition alone. 
  let tuition = Number(schoolData["latest.cost.tuition.in_state"]);
  // Get JSON data for location data.
  let schoolLocationData = await getSchoolLocation(req.query.schoolName);
  let city = schoolLocationData["school.city"];
  let state = schoolLocationData["school.state"];
  let location = `${schoolLocationData["school.city"]}, ${schoolLocationData["school.state"]}`;
  let data = {
    'tuition': tuition,
    'other': totalCost - tuition,
    'total': totalCost,
    'location': location
  }
  console.log("School data", data);
  // Send json of data containing tuition, total, and other costs.
  res.json(data);
});

// Gets discount amount based on family income for specific school.
// Param for income level range is sent with query.
app.get("/api/get-school-discount", async function(req, res) {
  console.log("Getting discount pricing for " + req.query.schoolName);
  let schoolData = await getSchoolData(req.query.schoolName);
  let schoolType = 'private';
  if (isPublic(req.query.schoolName)) {
    schoolType = 'public';
  }
  // Get cost by income level based on query param.
  // latest.cost.net_price.public.by_income_level
  let priceByIncome = schoolData[`latest.cost.net_price.${schoolType}.by_income_level.${req.query.range}`];
  let totalCost = Number(schoolData["latest.cost.attendance.academic_year"]);
  let tuition = Number(schoolData["latest.cost.tuition.in_state"]);
  let data = {
    'tuition': tuition,
    'other': totalCost - tuition,
    'total': totalCost,
    'discounted price': priceByIncome,
    'discount': priceByIncome - totalCost
  }
  console.log("Sending discount information", data);
  res.json(data);
});



// Helper functions

/**
 * Returns JSON data of a school's data from gov API. 
 * @param {string} schoolName
 */
async function getSchoolData(schoolName) {
  const getSchool = `https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${apiKey}&school.name=${schoolName}&fields=latest.cost`;
  console.log("Sending data for: " + schoolName);
  let schoolData = await fetch(getSchool);
  // Exclude meta data, get only data. 
  schoolData = await schoolData.json();
  // Get only JSON data, not array of JSON data. 
  schoolData = schoolData.results[0];
  console.log("Received data;", schoolData);
  return schoolData;
}

/**
 * Returns JSON form of school city and state.
 * @param {string} schoolName name.
 */
async function getSchoolLocation(schoolName) {
  // Asks for school location 
  const getSchoolLocation = `https://api.data.gov/ed/collegescorecard/v1/schools.json?api_key=${apiKey}&school.name=${schoolName}&fields=school`;
  console.log("Sending location for: " + schoolName);
  let schoolLocationData = await fetch(getSchoolLocation);
  schoolLocationData = await schoolLocationData.json();
  schoolLocationData = schoolLocationData.results[0];
  console.log("Received location,", schoolLocationData);
  return schoolLocationData;
}


/**
 * Returns a boolean for if a school is a CA public school.
 * @param {string} school
 * @return {bool}
 */
function isPublic(school) {
  return (school.includes("University of California") || school.includes("California State University"))
}

app.use(function(request, response) {
  response.status(404);
  response.send("ERROR 404: Cannot answer this request...");
})



// listen for requests :)
const listener = app.listen(3000, () => {
  console.log("The static server is listening on port " + listener.address().port);
});


// no need for DB...
// DB idea: 

// front end gets req from api endpoint

// we handle it here

// look up in DB

// if cant find then send req to gov api, store in DB
