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

// Stores a "cached" version of the most up to date data to reduce DB requests
var stationsRealTime;

// Import the model for the storing of data
var Stations = require('./models/schema.js');

// Work on this more
var londonBikes = londonBikes || {};

// Frontend API
// Allows for cross domain calls for development purposes
app.all('*', function(req, res, next) {
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
        // look into not converting it to json without stringify
        res.json(JSON.stringify(stationsRealTime));
    });

// Pre-fix all API calls are with /api/v1 for future proofing of the API
app.use('/api/v1', router);

// Backend capture process
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
            parseString(xml, function (err, result) {
                if (lastCallTimeStamp != result.stations['$'].lastUpdate) {
                    lastCallTimeStamp = result.stations['$'].lastUpdate;
                    stationsRealTime = result.stations['station'];
                    saveData(result.stations['station']);
                } else {
                    console.log(Date() + '- No new updates since last run');
                }
            });

            console.log(Date() + '- Finished data capture run: ' + dataCounter);
        });

    });

    req.on('error', function (err) {
        // debug error
    });
}

function saveData(station) {
    console.log(Date() + '- Adding the data to the database');
    var entryDate = Date();
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
            nbBikes: station[i].nbBikes,
            nbEmptyDocks: station[i].nbEmptyDocks,
            nbDocks: station[i].nbDocks
        });
        stationSave.save(function (err, thor) {
            if (err) return console.error(err);
        });
    }
}

// Will call the captureData function every 30 seconds
//setInterval(function () {
    setTimeout(function () {
    getData();
}, 3000);

// Launch the server
app.listen(port);