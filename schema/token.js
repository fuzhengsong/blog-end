const mongoose = require('mongoose');

var TokenSchema = new mongoose.Schema({
  id: String,
  token: String
});

module.exports = TokenSchema;