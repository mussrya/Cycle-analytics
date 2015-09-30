// stationsLives.js
// Schema for the live data collection which only shows the most recent data grab

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stationsLivesSchema = new Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    stationId: String,
    name: String,
    nbBikes: Number,
    nbEmptyDocks: Number,
    nbDocks: Number
});

var StationsLives = module.exports = mongoose.model('StationsLives', stationsLivesSchema);