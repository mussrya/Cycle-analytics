// stationsAveragesHours.js
// Schema for the averages hours collection

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stationsAveragesHoursSchema = new Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    stationId: String,
    nbBikes: Number,
    nbEmptyDocks: Number,
    nbDocks: Number
});

var StationsAveragesHours = module.exports = mongoose.model('StationsAveragesHours', stationsAveragesHoursSchema);