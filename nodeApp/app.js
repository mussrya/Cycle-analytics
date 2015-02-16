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
var Stations = require('./models/schema.js');

// Frontend API
// Create the middleware which will be used in all requests & log activity to the console
router.use(function (req, res, next) {
    console.log(Date() + ' - ' + req.originalUrl);
    next(); // Run the next routes so it doesn't halt at this position
});

// Create the stationsActive route, this will get live data
router.route('/stationsActive')
    .get(function (req, res) {
        res.json('response');
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
                    saveData(JSON.stringify(result.stations.station[0]));
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
    var stationSave = new Stations({
        timestamp: entryDate,
        stationId: '1',
        name: 'River Street , Clerkenwell',
        terminalName: '001023',
        lat: '51.52916347',
        long: '0.109970527',
        installed: 'true',
        locked: 'false',
        installDate: '1278947280000',
        removalDate: '',
        temporary: 'false',
        nbBikes: '4',
        nbEmptyDocks: '15',
        nbDocks: '19'
    });

    stationSave.save(function (err, thor) {
        if (err) return console.error(err);
    });

}

// Will call the captureData function every 30 seconds
setInterval(function () {
    //setTimeout(function () {
    getData();
}, 30000);

// Launch the server
app.listen(port);