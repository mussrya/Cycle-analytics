// stationsBestTimes.js
// Schema for the best times to get a bicycle collection

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stationsBestTimesSchema = new Schema({
    stationId: String,
    day: String,
    times: [{
        morning: String,
        evening: String
    }]
});

var StationsBestTimes = module.exports = mongoose.model('StationsBestTimes', stationsBestTimesSchema);