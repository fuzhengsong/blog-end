const mongoose = require('mongoose');
const TagsSchema = require('../schema/tags');

var TagsModel = mongoose.model('Tags', TagsSchema);

module.exports = TagsModel;