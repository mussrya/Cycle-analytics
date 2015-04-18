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

var dayAverageEnd = new Date();
var dayAverageStart = dayAverageEnd.getTime() - 86400000;
dayAverageStart = new Date(dayAverageStart);

StationsAveragesHours.aggregate([
        {
            $match: {
                "timestamp": {
                    $gte: dayAverageStart,
                    $lt: dayAverageEnd
                }
            }
                },
        {
            $group: {
                _id: "$stationId",
                "name": {
                    "$addToSet": "$name"
                },
                nbBikes: {
                    $avg: "$nbBikes"
                },
                nbEmptyDocks: {
                    $avg: "$nbEmptyDocks"
                },
                nbDocks: {
                    $avg: "$nbDocks"
                },
                timestamp: {
                    "$addToSet": dayAverageStart
                }
            }

                }, {
            $sort: {
                ISODate: 1
            }
                }

            ],
    function (err, station) {
        if (err) {
            console.log(err)
        } else {

            for (var i = 0, len = station.length; i < len; i++) {
                var stationSave = new StationsAveragesDays({
                    timestamp: station[i].timestamp,
                    stationId: station[i]._id,
                    nbBikes: parseInt(station[i].nbBikes),
                    nbEmptyDocks: parseInt(station[i].nbEmptyDocks),
                    nbDocks: parseInt(station[i].nbDocks)
                });

                stationSave.save(function (err) {
                    if (err) return console.error('Error:' + err);
                });
            }
        }
    });