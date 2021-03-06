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
        res.json(JSON.stringify(stationsRealTime));
    });

router.route('/station/:id')
    .get(function (req, res) {

        // search mongodb
        Stations.findOne({
                'stationId': req.params.id
            },
            function (err, station) {
                if (err) return handleError(err);
                res.json(JSON.stringify(station));
            });
    });

router.route('/stationLive/:id').get(function (req, res) {
    var tenMinutesAgo = new Date().getTime() - 3600000;

    // search mongodb
    Stations.aggregate({
            $match: {
                "stationId": req.params.id,
                "timestamp": {
                    $gte: new Date(tenMinutesAgo)
                }
            }
        },
        function (err, station) {
            if (err) return handleError(err);
            res.json(JSON.stringify(station));
        });
});


// Pre-fix all API calls are with /api/v1 for future proofing of the API
app.use('/api/v1', router);

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
                        console.log(Date() + '- No new updates since last run');
                    }
                }
            });

            console.log(Date() + '- Finished data capture run: ' + dataCounter);
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
            nbBikes: parseInt(station[i].nbBikes),
            nbEmptyDocks: parseInt(station[i].nbEmptyDocks),
            nbDocks: parseInt(station[i].nbDocks)
        });
        stationSave.save(function (err, thor) {
            if (err) return console.error(err);
        });
    }
}

// Will call the getData function every 30 seconds
setInterval(function () {
    //setTimeout(function () {
    getData();
}, 30000);



// testing timer for the average hour function call
function checkTime() {
    var timeDifference = new Date().getTime() + 3600000;
    timeDifference = new Date(timeDifference);
    timeDifference = new Date(timeDifference.getFullYear(), timeDifference.getMonth(), timeDifference.getDate(), timeDifference.getHours());
    timeDifference = timeDifference.getTime() - new Date().getTime();
    setTimeout(function () {
        // run function
    }, timeDifference);
}

// Initiate the checkTime function
//checkTime();

// Average the mongoDB data every hour


// Average the mongoDB data every day
// Remove all data except for the last 2 hours to be safe

// Average the mongoDB data every week



// Launch the server
app.listen(port);