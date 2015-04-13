var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stationsBestTimesSchema = new Schema({
    stationId: String,
    times: [{
        day: String,
        morning: String,
        evening: String
    }]
});

var StationsBestTimes = module.exports = mongoose.model('StationsBestTimes', stationsBestTimesSchema);