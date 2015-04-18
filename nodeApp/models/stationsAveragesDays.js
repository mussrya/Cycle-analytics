var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stationsAveragesDaysSchema = new Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    stationId: String,
    nbBikes: Number,
    nbEmptyDocks: Number,
    nbDocks: Number
});

var StationsAveragesDays = module.exports = mongoose.model('StationsAveragesDays', stationsAveragesDaysSchema);