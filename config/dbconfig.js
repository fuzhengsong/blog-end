const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/blog');
var db = mongoose.connection;
db.on("open", function () {
    console.log("MongoDB connected success.")
});

db.on('error', function(){
    console.log('MongoDB connected fail.')
});

db.on("disconnected", function () {
    console.log("MongoDB connected disconnected.")
});

module.exports = db;

