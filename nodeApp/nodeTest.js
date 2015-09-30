// nodeTest.js
// Node testing file for live agile development

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

var endTime = new Date();
var startTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(), 06, 30);
var endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(), 09, 29);
var day = endTime.getDay();


var lookupMorning = {};
var lookupEvening = {};

// Search MongoDB for documents matching between the times 6:30-9:29AM

Stations.aggregate({
        $match: {
            "timestamp": {
                $gte: startTime,
                $lt: endTime,
            }
        }
    },
    function (err, station) {
        if (err) {
            console.log(err);
        } else {
            station.sort(function (a, b) {
                return parseFloat(a.nbBikes) - parseFloat(b.nbBikes);
            });

            for (var i = 0, len = station.length; i < len; i++) {
                lookupMorning[station[i].stationId] = station[i];
            }
        }
    });
/*
var startTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(), 16, 00);
var endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(), 18, 59);

Stations.aggregate({
        $match: {
            "timestamp": {
                $gte: startTime,
                $lt: endTime,
            }
        }
    },
    function (err, station) {
        if (err) {
            console.log(err);
        } else {
            station.sort(function (a, b) {
                return parseFloat(a.nbBikes) - parseFloat(b.nbBikes);
            });

            for (var i = 0, len = station.length; i < len; i++) {
                lookupAfternoon[station[i].stationId] = station[i];
            }
        }
    });
*/
 console.log('///////');
for (var i = 0; i < 900; i++) {
    if (lookupMorning[i]) {
        console.log('///////');
        console.log(lookupMorning[i]);
        console.log(lookupAfternoon[i]);
        
        console.log('///////');

    }
}
