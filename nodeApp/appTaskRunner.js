// appTaskRunner.js
// Used to get, process and save data from the TFL public API (ETL)

// Base setup
// Call the packages we need
var application_root = __dirname,
    express = require("express"),
    path = require("path"),
    mongoose = require('mongoose'),
    http = require('http'),
    parseString = require('xml2js').parseString;

// Set the port
var port = process.env.PORT || 8081;

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

// Backend for get, process and saving of data
// The function which is called as part of the setInterval to capture and store data into the database
function getData() {
    dataCounter++;
    console.log(Date() + '- Getting data');
    var req = http.get('http://www.tfl.gov.uk/tfl/syndication/feeds/cycle-hire/livecyclehireupdates.xml', function (res) {
        // Convert from XML to JSON object
        var xml = '';
        res.on('data', function (chunk) {
            xml += chunk;
        });

        res.on('end', function () {
            console.log(Date() + '- Converting data to JSON');
            xml = xml.replace("\ufeff", "");
            parseString(xml, function (err, result) {
                try {
                    if (result.hasOwnProperty('stations')) {
                        if (lastCallTimeStamp != result.stations['$'].lastUpdate) {
                            lastCallTimeStamp = result.stations['$'].lastUpdate;
                            var stationsRealTime = result.stations['station'];
                            console.log('Calling the saveData function');
                            // Send the JSON object to the saveData function
                            saveData(result.stations['station']);
                        } else {
                            console.log(Date() + ' - No new updates since last run');
                        }
                    }
                } catch (e) {
                    console.log('Error saving the stations: ' + e);
                }
            });

            console.log(Date() + ' - Finished data capture run: ' + dataCounter);
        });
        res.on('error', function (err) {
            // Error in processing
            console.log('Error retrieving all of the XML content' + err);
        });
    });

    req.on('error', function (err) {
        console.log('Error requesting the XML data: ' + err);
    });
}

// Function to save the grabbed data from the TFL public API
function saveData(station) {
    console.log(Date() + ' - Adding the data to the collections');
    var entryDate = Date();

    // Remove StationsLive database collection prior to importing new content
    console.log(Date() + ' - Removing previous station data');
    StationsLives.remove({}, function () {});

    // Save data to main Stations collection
    console.log(Date() + ' - Saving data to the stations collection');
    for (var i = 0, len = station.length; i < len; i++) {
        var stationSave = new Stations({
            timestamp: entryDate,
            stationId: station[i].id,
            name: station[i].name,
            nbBikes: parseInt(station[i].nbBikes),
            nbEmptyDocks: parseInt(station[i].nbEmptyDocks),
            nbDocks: parseInt(station[i].nbDocks)
        });

        stationSave.save(function (err) {
            if (err) return console.error('Error saving data to the stations collection: ' + err);
        });

        // Save data to stationsLives collection
        console.log(Date() + ' - Saving data to the stationsLives collection');
        var stationSave = new StationsLives({
            timestamp: entryDate,
            stationId: station[i].id,
            name: station[i].name,
            nbBikes: parseInt(station[i].nbBikes),
            nbEmptyDocks: parseInt(station[i].nbEmptyDocks),
            nbDocks: parseInt(station[i].nbDocks)
        });

        stationSave.save(function (err) {
            if (err) return console.error('Error saving data to the stationsLives collection: ' + err);
        });

    }
}

// Calls the getData function every minute to get the TFL public API data
setInterval(function () {
    getData();
}, 60000);

// Function which is used to run the ETL reports for hourly, daily and weekly averages
function checkTime() {
    // Time calculations used to workout an older time
    var timeDifference = new Date().getTime() + 3600000;
    timeDifference = new Date(timeDifference);
    timeDifference = new Date(timeDifference.getFullYear(), timeDifference.getMonth(), timeDifference.getDate(), timeDifference.getHours());
    timeDifference = timeDifference.getTime() - new Date().getTime();
    setTimeout(function () {
        var currentTime = new Date();
        // Run hourly average
        console.log(currentTime + ' - Running hourly average ETL function');
        var hourAverageEnd = new Date();
        var hourAverageStart = hourAverageEnd.getTime() - 3600000;
        hourAverageStart = new Date(hourAverageStart);

        // Query the Stations collection
        console.log(Date() + ' - Searching mongodb');
        Stations.aggregate([
                {
                    $match: {
                        "timestamp": {
                            $gte: hourAverageStart,
                            $lt: hourAverageEnd
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
                            "$addToSet": hourAverageStart
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
                    console.log('Error querying the stations collection: ' + err)
                } else {
                    // Saves the data to the stationsAveragesHours collection
                    console.log(Date() + ' - Saving data to the stationsAveragesHours collection');
                    for (var i = 0, len = station.length; i < len; i++) {
                        var stationSave = new StationsAveragesHours({
                            timestamp: station[i].timestamp,
                            stationId: station[i]._id,
                            nbBikes: parseInt(station[i].nbBikes),
                            nbEmptyDocks: parseInt(station[i].nbEmptyDocks),
                            nbDocks: parseInt(station[i].nbDocks)
                        });

                        stationSave.save(function (err) {
                            if (err) return console.error('Error saving stationsAveragesHours collection: ' + err);
                        });
                    }
                }
            });

        // If the hour is equal to midnight, then run the daily average code
        if (currentTime.getHours() == 0) {
            console.log(currentTime + ' - Running the daily average ETL function');
            var dayAverageEnd = new Date();
            var dayAverageStart = dayAverageEnd.getTime() - 86400000;
            dayAverageStart = new Date(dayAverageStart);

            console.log(currentTime + ' - Querying the stationsAveragesHours collection');
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
                        console.log('Error querying the stationsAveragesHours collection: ' + err)
                    } else {
                        // Saves the data to the stationsAveragesDays collection
                        console.log(currentTime + ' - Saving to the stationsAveragesDays collection');
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
        } else if (currentTime.getHours() == 2) {
            // WIP - If a new day has passed and the time is equal to 2am, then do cleanup of the previous day of data
            console.log(currentTime + ' - Running the daily cleanup function');
        }

        // Call to re-run checkTime to run again in 1 hours time
        checkTime();
        console.log(Date() + ' - Re-running checkTime function');

    }, timeDifference);
}

// Initiate the checkTime function when node loads, commented out for test purposes
console.log(Date() + ' - Running checkTime function for the first time');
checkTime();

// Launch the server
app.listen(port);