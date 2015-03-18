var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StationsSchema = new Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    stationId: String,
    name: String,
    terminalName: String,
    lat: String,
    long: String,
    installed: String,
    locked: String,
    installDate: String,
    removalDate: String,
    temporary: String,
    nbBikes: Number,
    nbEmptyDocks: Number,
    nbDocks: Number
});

module.exports = mongoose.model('Stations', StationsSchema);