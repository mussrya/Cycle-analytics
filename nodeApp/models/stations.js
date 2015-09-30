// stations.js
// Schema for the main stations collection which stores all data

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stationsSchema = new Schema({
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

var Stations = module.exports = mongoose.model('Stations', stationsSchema);