const mongoose = require('mongoose');
const _ = require('lodash');

var ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'title is required']
  },
  tags: [String],
  picture: String,
  content: String,
  status: String,
  create_time: Date,
  update_time: Date,
  isShowContinue: Boolean
});

ArticleSchema.statics.getCount = function(keyname,tags,status){
  if(keyname){

  } else if(tags && tags.length){

  } else if(status){

  }else {
    return this.find().count();
  }
};

ArticleSchema.statics.findAll = function(data){
  let page = data.page;
  let size = data.size;
  if(data.tags){
    return this.find({"tags": data.tags}).skip((page-1) * size).limit(size).sort({update_time: 'desc'});
  } else {
    return this.find().skip((page-1) * size).limit(size).sort({update_time: 'desc'});
  }
};



module.exports = ArticleSchema;