
const mongoose = require('mongoose');
const ArticleSchema = require('../schema/article');

var ArticleModel = mongoose.model('Articles', ArticleSchema);


module.exports = ArticleModel;