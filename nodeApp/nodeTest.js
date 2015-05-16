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
            // Sort the documents returned by nbBikes Desc
            station.sort(function (a, b) {
                return b.nbBikes - a.nbBikes;
            });

            // Create an array to store / check stationIds have already been saved
            var stationIds = [];
            
            // Create an array to push new results into
            var stationArray = [];

            // This loop is only storing one result per station (the one with the highest nbBikes value between 6:30-9:29AM)
            for (var i = 0; i < station.length; i++) {
                try {
                    if (stationIds.indexOf(station[i].stationId) == -1) {
                        // Save stationIds
                        stationIds.push(station[i].stationId);
                        
                        // Save station entry
                        stationArray.push(station[i]);
                    }
                } catch (err) {}
            }
        }
    });