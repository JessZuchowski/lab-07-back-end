'use strict';

//tells npom which things to install

//environment variables
require('dotenv').config();
const superagent = require('superagent');

//package dependencies
const express = require('express');
const cors = require('cors');

//app setup
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

//API routes will go here
//location API route
/*app.get('location', searchToLatLong)
app.get('/weather', getWeather);
*/

//path to location
app.get('/location', (request, response) => {
  console.log('request at 14', request.query);
  
  const locationData = searchToLatLong(request.query.data)
  console.log('location', request.query.data);
  response.send(locationData);
  //adding error response
  //response.status(500).send('Sorry, something went wrong');
});

//turn the server on so it will listen
app.listen(PORT, () =>console.log(`listening on PORT ${PORT}`));

//path to weather
app.get('/weather', (request, response)=>{
  console.log('hit the weather function');
  const weatherData = searchWeather(request.query.data)
  response.send(weatherData);
});

//error handler
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something has gone very wrong and you should turn back');
}

//TEST ROUTE
app.get('/testing', (request, response) =>{
  console.log('hit the test route');
  let testObject = {name: 'test route'}
  response.json(testObject);
})


//Helper functions

/*
function searchToLatLong(request, response) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`
  return superagent.get(url)
  .then(result =>{
    response.send(new Location(request.query.data, result.body.results[0]))
  })
  .catch(error => handleError(error, response));
}
*/


function searchToLatLong(query) {
  const geoData = require('./data/geo.json');
  const location = new Location(geoData);
  console.log('location at 35', location);
  location.search_query = query;
  console.log('geo data location ', location);
  return location;
}

/*
function Location(query, location) {
  console.log(location.body);
  this.search_query = query;
  this.formatted_query = location.formatted_address;
  this.latitude = location.geometry.location.lat;
  this.longitude = location.longitude.location.lng;
}
*/


function Location(data) {
  console.log('got to constructor');
  this.formatted_query = data.results[0].formatted_address;
  this.latitude = data.results[0].geometry.location.lat;
  this.longitude = data.results[0].geometry.location.lng;
}

/*
function getWeather(request, response){
  console.log(request.query);
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`
  return superagent.get(url)
   .then(weatherResults => {
     const weatherSummaries = weatherResults.body.daily.data.map(day =>{
       return new Weather(day);
     });
     response.send(weatherSummaries);
   })
   .catch(error => handleError(error, response));
}
*/
function searchWeather(query) {
  const weatherArray=[];
  const darkSkyData = require('./data/darksky.json');
  console.log(darkSkyData.daily);
  darkSkyData.daily.data.forEach(day =>{
    weatherArray.push(new Weather(day));
  })
  console.log('weather Array', weatherArray);
  weatherArray.search_query = query;
  return weatherArray;
}

/*
function Weather(day){
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}
*/
function Weather(weatherData){
  console.log('got to weather constructor');
  this.forecast = weatherData.summary;
  console.log('hi', this.forecast);
  let goodTime = weatherData.time;
  this.time= new Date(goodTime);
  console.log('hi', this.time);
}