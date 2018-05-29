const mongoose = require('mongoose');

var TagsSchema = new mongoose.Schema({
  name: String,
  articleCount: Number,
  articleIds: [String]
});


module.exports = TagsSchema;