// app.js

// BASE SETUP
// Call the packages we need
var application_root = __dirname,
    express = require("express"),
    path = require("path"),
    mongoose = require('mongoose'),
    http = require('http'),
    parseString = require('xml2js').parseString;

// Set the port
var port = process.env.PORT || 8080;

// Create the express app
var app = express();

// Database connection
mongoose.connect('mongodb://localhost/cycleHire');

// Create the router
var router = express.Router();

// The counter that gets incrimented for the data capture run
var dataCounter = 0;

// Stores the timestamp within the XML request to ensure data is not replicated
var lastCallTimeStamp = 0;

// Import the model for the storing of data
var Stations = require('./models/stations.js');
var StationsLives = require('./models/stationsLives.js');
var StationsAveragesHourly = require('./models/stationsAveragesHours.js');

// Frontend API
// Allows for cross domain calls for development purposes
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Create the middleware which will be used in all requests & log activity to the console
router.use(function (req, res, next) {
    console.log(Date() + ' - ' + req.originalUrl);
    next(); // Run the next routes so it doesn't halt at this position
});

// Create the stationsActive route, this will get live data
router.route('/stationsActive')
    .get(function (req, res) {
        // search mongodb
        StationsLives.find({},
            function (err, station) {
                if (err) return handleError(err);
                res.json(JSON.stringify(station));
            });
    });

router.route('/station/:id')
    .get(function (req, res) {

        // search mongodb
        Stations.findOne({
                'stationId': req.params.id
            },
            function (err, station) {
                if (err) {
                    console.log(err)
                } else {
                    res.json(JSON.stringify(station));
                }
            });
    });

router.route('/stationLive/:id').get(function (req, res) {
    var oneHourAgo = new Date().getTime() - 3600000;

    // search mongodb
    Stations.aggregate({
            $match: {
                "stationId": req.params.id,
                "timestamp": {
                    $gte: new Date(oneHourAgo)
                }
            }
        },
        function (err, station) {
            if (err) {
                console.log(err)
            } else {
                res.json(JSON.stringify(station));
            }
        });
});

router.route('/stationHourly/:id').get(function (req, res) {

    // search mongodb
    StationsAveragesHourly.aggregate({
            $match: {
                "stationId": req.params.id
            }
        }, {
            $sort: {
                timestamp: 1
            }
        },
        function (err, station) {
            if (err) {
                console.log(err)
            } else {
                res.json(JSON.stringify(station));
            }
        });
});

// Pre-fix all API calls are with /api/v1 for future proofing of the API
app.use('/api/v1', router);

// Launch the server
app.listen(port);