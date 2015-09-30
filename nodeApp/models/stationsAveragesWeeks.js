// stationsAveragesWeeks.js
// Schema for the averages weeks collection

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stationsAveragesWeeksSchema = new Schema({
    stationId: String,
    times: [{
        day: String,
        morning: String,
        evening: String
    }]
});

var StationsAveragesWeeks = module.exports = mongoose.model('StationsAveragesWeeks', stationsAveragesWeeksSchema);