// appAPI.js
// Used to serve the site's API, this API is only used to return data for predefined DB queries

// Base setup
// Call the packages needed
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
var StationsAveragesDays = require('./models/stationsAveragesDays.js');

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

// API to return data for the /#/stations page
router.route('/stationsActive')
    .get(function (req, res) {
        // search mongodb
        StationsLives.find({},
            function (err, station) {
                if (err) return handleError(err);
                res.json(JSON.stringify(station));
            });
    });

// API to return the total number of slots available
router.route('/homeSlotsAvail').get(function (req, res) {

    StationsLives.aggregate({
            $group: {
                _id: null,
                "total": {
                    $sum: "$nbEmptyDocks"
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

// API to return the total number of bikes available
router.route('/homeBikesAvail').get(function (req, res) {

    StationsLives.aggregate({
            $group: {
                _id: null,
                "total": {
                    $sum: "$nbBikes"
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


// API to return data for bikes rented out today
router.route('/homeBikesTotalSlots').get(function (req, res) {

    var currentTime = new Date();
    var startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());

    // Search mongodb
    StationsLives.aggregate({
            $group: {
                _id: null,
                "totalSlotsAll": {
                    $sum: "$nbDocks"
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

// API to return data for the most popular station (based on station that had the most empty slots)
router.route('/homePopularStation').get(function (req, res) {
    var oneDayAgo = new Date().getTime() - 86400000;

    // Search mongodb
    Stations.aggregate({
            $match: {
                "timestamp": {
                    $gte: new Date(oneDayAgo)
                },
                "nbBikes": 0
            }
        }, {
            $group: {
                _id: "$stationId",
                count: {
                    $sum: 1
                },
                "name": {
                    "$addToSet": "$name"
                }
            }
        }, {
            $sort: {
                count: -1
            }
        }, {
            $limit: 1
        },
        function (err, station) {
            if (err) {
                console.log(err)
            } else {
                res.json(JSON.stringify(station));
            }
        });
});

// API to return data for a single station - last 60 minutes chart
router.route('/stationLiveOverview').get(function (req, res) {
    var oneHourAgo = new Date().getTime() - 3600000;

    // Search mongodb
    Stations.aggregate({
            $match: {
                "timestamp": {
                    $gte: new Date(oneHourAgo)
                }
            }
        }, {
            $group: {
                _id: "$timestamp",
                "totalBikes": {
                    $sum: "$nbBikes"
                },
                "totalSlots": {
                    $sum: "$nbEmptyDocks"
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

// API to return data for stations run out of bicycles
router.route('/homeEmptyBicycles').get(function (req, res) {
    var oneDayAgo = new Date().getTime() - 86400000;

    // Search mongodb
    Stations.aggregate({
            $match: {
                "timestamp": {
                    $gte: new Date(oneDayAgo)
                },
                "nbBikes": 0
            }
        }, {
            $group: {
                _id: "$stationId",
                count: {
                    $sum: 1
                },
                "name": {
                    "$addToSet": "$name"
                }
            }
        }, {
            $sort: {
                count: -1
            }
        }, {
            $limit: 10
        },
        function (err, station) {
            if (err) {
                console.log(err)
            } else {
                res.json(JSON.stringify(station));
            }
        });
});

// API to return data for stations run out of bicycles
router.route('/homeEmptySlots').get(function (req, res) {
    var oneDayAgo = new Date().getTime() - 86400000;

    // Search mongodb
    Stations.aggregate({
            $match: {
                "timestamp": {
                    $gte: new Date(oneDayAgo)
                },
                "nbEmptyDocks": 0
            }
        }, {
            $group: {
                _id: "$stationId",
                count: {
                    $sum: 1
                },
                "name": {
                    "$addToSet": "$name"
                }
            }
        }, {
            $sort: {
                count: -1
            }
        }, {
            $limit: 10
        },
        function (err, station) {
            if (err) {
                console.log(err)
            } else {
                res.json(JSON.stringify(station));
            }
        });
});

// API to return data for a single station - overview
router.route('/station/:id')
    .get(function (req, res) {

        // Search mongodb
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

// API to return data for a single station - last 60 minutes chart
router.route('/stationLive/:id').get(function (req, res) {
    var oneHourAgo = new Date().getTime() - 3600000;

    // Search mongodb
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

// API to return data for a single station - last 48 hours chart
router.route('/stationHourly/:id').get(function (req, res) {

    var fortyEightHoursAgo = new Date().getTime() - 172800000;

    // Search mongodb
    StationsAveragesHourly.aggregate({
            $match: {
                "stationId": req.params.id,
                "timestamp": {
                    $gte: new Date(fortyEightHoursAgo)
                }
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


router.route('/stationDaily/:id').get(function (req, res) {

    var twoWeeksAgo = new Date().getTime() - 2419200000;

    // Search mongodb
    StationsAveragesDays.aggregate({
            $match: {
                "stationId": req.params.id,
                "timestamp": {
                    $gte: new Date(twoWeeksAgo)
                }
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