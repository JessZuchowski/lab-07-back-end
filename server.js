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
app.get('/weather', searchWeather)
app.get('/meetups', searchMeetup);


//turn the server on so it will listen
app.listen(PORT, () =>console.log(`listening on PORT ${PORT}`));

//error handler - it is called and attached to the function for each route
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something has gone very wrong and you should turn back');
}

//TEST ROUTE - makes sure server is up
app.get('/testing', (request, response) =>{
  console.log('hit the test route');
  let testObject = {name: 'test route'}
  response.json(testObject);
})


//Helper functions

//for the rendered google maps
function searchToLatLong(request, response) {
  //Takes the google maps api link, replaces the query data with the user input, and the key with the geocode API variable
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`
  //uses superagent to asynchronyously access the URL while performing the other related maps functions
  return superagent.get(url)
    .then(result => {
      response.send(new Location(request.query.data, result.body.results[0]))
    })
    .catch(error => handleError(error, response));
}

//constructor for location. Takes in query and location, accesses it inside the google maps data object and pulls out info
function Location(query, location) {
  //console.log({location});
  this.search_query = query;
  this.formatted_query = location.formatted_address;
  this.latitude = location.geometry.location.lat;
  this.longitude = location.geometry.location.lng;
}

//Refactoring weather to use array.maps. Callback function for the /weather path

function searchWeather(request, response) {
  //gets url for API key and feeds into superagent
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`
  return superagent.get(url)
  // asynchronous call that renders weather results while superagent is contacting API
    .then(weatherResults => {
      //looking into weather results to map out new array of each day
      const weatherSummaries = weatherResults.body.daily.data.map(day => {
        return new Weather(day);
      })
      //sends weatherSummaries to search weather function
      response.send(weatherSummaries);
    })
    .catch(error => handleError(error, response));
}

//constructor for weather. Turns the milliseconds from the original weather data into userfriendly output
function Weather(day){
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}


//A function called searchMeetup. Callback function for /meetup path and corresponding constructor function using same structure as search weather function
//not fully working yet, but we think we're on the right track. Need to figure out what parameters to pass to the group_url to make it access the location
function searchMeetup(request, response) {
  console.log('You have reached the searchMeetup function')
  //const url = `https://api.meetup.com/find/upcoming_events?photo-host=public&page=20&sig_id=275550877&lon=${request.query.data.longitude}&${request.query.data.latitude}&sig=${process.env.MEETUP_API_KEY}`
  const url = `https://api.meetup.com/2/events?key=${process.env.MEETUP_API_KEY}&group_urlname=ny-tech&sign=true`

  console.log(url)
  return superagent.get(url)
    .then(meetupResults =>{
      const meetupSummaries = meetupResults.body.results.map(day => {
        return new Meetup(day);
      })
      response.send(meetupSummaries);
    })
    .catch(error => handleError(error, response));
}

function Meetup(link, name, creation_date, host){
  this.link = link;
  this.name = name;
  this.creation_date = creation_date;
  this.host = host;
}
