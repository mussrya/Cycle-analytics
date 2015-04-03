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
var StationsLives = require('./models/stationsLive.js');
var StationsBestTimes = require('./models/stationsBestTimes.js');
var StationsAveragesHour = require('./models/stationsAveragesHour.js');
var StationsAveragesDay = require('./models/stationsAveragesDay.js');
var StationsAveragesWeek = require('./models/stationsAveragesWeek.js');


// Backend for capture & prcoessing
// The function which is called as part of the setInterval to capture and store data into the database
function getData() {
    dataCounter++;
    console.log(Date() + '- Getting data');
    var req = http.get('http://www.tfl.gov.uk/tfl/syndication/feeds/cycle-hire/livecyclehireupdates.xml', function (res) {
        // save the data
        var xml = '';
        res.on('data', function (chunk) {
            xml += chunk;
        });

        res.on('end', function () {
            console.log(Date() + '- Converting data to JSON');
            // Bug fix for incorrect white spacing
            xml = xml.replace("\ufeff", "");
            parseString(xml, function (err, result) {
                if (result.hasOwnProperty('stations')) {
                    if (lastCallTimeStamp != result.stations['$'].lastUpdate) {
                        lastCallTimeStamp = result.stations['$'].lastUpdate;
                        stationsRealTime = result.stations['station'];
                        // commented this out during testing
                        saveData(result.stations['station']);
                    } else {
                        console.log(Date() + ' - No new updates since last run');
                    }
                }
            });

            console.log(Date() + ' - Finished data capture run: ' + dataCounter);
        });

        res.on('error', function (err) {
            // error in processing
            console.log(err);
        });
    });

    req.on('error', function (err) {
        // error in receiving
    });
}

function saveData(station) {
    console.log(Date() + ' - Adding the data to the database');
    var entryDate = Date();

    // Remove StationsLive collection prior to importing new content
    StationsLives.remove({}, function () {
    });

    // Save data to database
    for (var i = 0, len = station.length; i < len; i++) {
        var stationSave = new Stations({
            timestamp: entryDate,
            stationId: station[i].id,
            name: station[i].name,
            terminalName: station[i].terminalName,
            lat: station[i].lat,
            long: station[i].long,
            installed: station[i].installed,
            locked: station[i].locked,
            installDate: station[i].installDate,
            removalDate: station[i].removalDate,
            temporary: station[i].temporary,
            nbBikes: parseInt(station[i].nbBikes),
            nbEmptyDocks: parseInt(station[i].nbEmptyDocks),
            nbDocks: parseInt(station[i].nbDocks)
        });

        stationSave.save(function (err) {
            if (err) return console.error('Error:'+err);
        });

        var stationSave = new StationsLives({
            timestamp: entryDate,
            stationId: station[i].id,
            name: station[i].name,
            terminalName: station[i].terminalName,
            lat: station[i].lat,
            long: station[i].long,
            installed: station[i].installed,
            locked: station[i].locked,
            installDate: station[i].installDate,
            removalDate: station[i].removalDate,
            temporary: station[i].temporary,
            nbBikes: parseInt(station[i].nbBikes),
            nbEmptyDocks: parseInt(station[i].nbEmptyDocks),
            nbDocks: parseInt(station[i].nbDocks)
        });

        stationSave.save(function (err) {
            if (err) return console.error('Error:'+err);
        });

    }
}

// Will call the getData function every 30 seconds
setInterval(function () {
    getData();
}, 30000);

// checkTime function which is used to run the ETL reports for hourly, daily and weekly averages as well as the cleanup of the previous day of live data
function checkTime() {
    var timeDifference = new Date().getTime() + 3600000;
    timeDifference = new Date(timeDifference);
    timeDifference = new Date(timeDifference.getFullYear(), timeDifference.getMonth(), timeDifference.getDate(), timeDifference.getHours());
    timeDifference = timeDifference.getTime() - new Date().getTime();
    setTimeout(function () {
        var currentTime = new Date();
        // Run hourly average
        console.log(currentTime + ' - Running hourly average ETL function');
        // If the hour is equal to midnight, then run the daily average function
        if (currentTime.getHours() == 0) {
            console.log(currentTime + ' - Running the daily average ETL function');
        } else if (currentTime.getHours == 2) {
            // If a new day has passed and the time is equal to 2am, then do cleanup of the previous day of data
            console.log(currentTime + ' - Running the daily cleanup function');
        } else {
            console.log(currentTime.getHours() + 'DEBUG PURPOSE');
        }

        // Call to re-run checkTime to run again in 1 hours time
        checkTime();
        console.log(Date() + ' - Re-running checkTime function');

    }, timeDifference);
}

// Initiate the checkTime function when node loads
checkTime();
console.log(Date() + ' - Running checkTime function for the first time');

// Launch the server
app.listen(port);