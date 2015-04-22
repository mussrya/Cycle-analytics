// BASE SETUP
// Call the packages we need
var application_root = __dirname,
    express = require("express"),
    path = require("path"),
    mongoose = require('mongoose'),
    http = require('http'),
    parseString = require('xml2js').parseString;

// Set the port
var port = process.env.PORT || 8082;


// Create the express app
var app = express();
console.log(Date() + ' - Launching the server');


// Database connection
mongoose.connect('mongodb://localhost/cycleHire');
console.log(Date() + ' - Connecting to the DB');

// Create the router
var router = express.Router();

// The counter that gets incrimented for the data capture run
var dataCounter = 0;

// Stores the timestamp within the XML request to ensure data is not replicated
var lastCallTimeStamp = 0;

// Import the models for the storing of data
var Stations = require('./models/stations.js');
var StationsLives = require('./models/stationsLives.js');
var StationsBestTimes = require('./models/stationsBestTimes.js');
var StationsAveragesHours = require('./models/stationsAveragesHours.js');
var StationsAveragesDays = require('./models/stationsAveragesDays.js');
var StationsAveragesWeeks = require('./models/stationsAveragesWeeks.js');


var currentTime = new Date();
// Run hourly average
console.log(currentTime + ' - Running hourly average ETL function');


console.log(currentTime + ' - Running the daily average ETL function');

var currentTime = new Date();
var startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());

console.log(startTime);
console.log(currentTime);

// search mongodb
Stations.aggregate(
     {
        $match: {
            "timestamp": {
                $gte: startTime,
                $lt: currentTime,
                
            }
        }
    },
    {
        $group: {
            _id: null,
            "totalEmpty": {
                $sum: "$nbEmptyDocks"
            },
            "totalSlots": {
                $sum: "$nbDocks"
            },
            "totalBikes": {
                $sum: "$nbBikes"
            }
        }
    },
    function (err, station) {
        if (err) {
            console.log(err)
        } else {
           // res.json(JSON.stringify(station));
            console.log(JSON.stringify(station));
        }
    });
