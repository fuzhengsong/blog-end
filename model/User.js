
const mongoose = require('mongoose');
const UserSchema = require('../schema/user');

var UserModel = mongoose.model('Users', UserSchema);

module.exports = UserModel;