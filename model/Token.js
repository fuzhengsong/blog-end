const mongoose = require('mongoose');
const TokenSchema = require('../schema/token');

var TokenModel = mongoose.model('Tokens', TokenSchema);

module.exports = TokenModel;