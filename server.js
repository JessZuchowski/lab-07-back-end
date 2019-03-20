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
app.get('/location', searchToLatLong)
app.get('/weather', searchWeather);
app.get('/meetup', searchMeetup);


//turn the server on so it will listen
app.listen(PORT, () =>console.log(`listening on PORT ${PORT}`));

//path to weather
// app.get('/weather', (request, response)=>{
//   console.log('hit the weather function');
//   const weatherData = searchWeather(request.query.data)
//   response.send(weatherData);
// });

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


function searchToLatLong(request, response) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`
  return superagent.get(url)
    .then(result => {
      response.send(new Location(request.query.data, result.body.results[0]))
    })
    .catch(error => handleError(error, response));
}

function Location(query, location) {
  console.log({location});
  this.search_query = query;
  this.formatted_query = location.formatted_address;
  this.latitude = location.geometry.location.lat;
  this.longitude = location.geometry.location.lng;
}

//Refactoring weather to use array.maps. Callback function for the /weather path

function searchWeather(request, response) {
  console.log(request.query);
  //gets url for API key and feeds into superagent
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`
  return superagent.get(url)
  // asynchronous call that renders weather results while superagent is contacting API
    .then(weatherResults => {
      //console logs array of weather results
      console.log(weatherResults.body.daily.data);
      //looking into weather results to map out new array of each day
      const weatherSummaries = weatherResults.body.daily.data.map(day => {
        return new Weather(day);
      })
      //sends weatherSummaries to search weather function
      response.send(weatherSummaries);
    })
    .catch(error => handleError(error, response));
}


function Weather(day){
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}


//A function called searchMeetup. Callback function for /meetup path and corresponding constructor function using same structure as search weather function
function searchMeetup(request, response) {
  const url = `https://api.meetup.com/2/events?key=${process.env.MEETUP_API_KEY}&group_urlname=ny-tech&sign=true`
  return superagent.get(url)
    .then(meetupResults =>{
      const meetupSummaries = meetupResults.body.results.venue.name.map(day => {
        return new Meetup(day);
      })
      response.send(meetupSummaries);
    })
    .catch(error => handleError(error, response));
}

function Meetup(day){
  this.venue = day.venue;
}
