const router = require('koa-router')();
const path = require('path');
const ArticleModel = require('../model/Article');
const TagsModel = require('../model/Tags');
const multerConfig = require('../config/multer');
const multer = require('koa-multer');
var storage = multer.diskStorage(multerConfig);
const upload = multer({storage: storage});
const _ = require('lodash');
const mongoose = require('mongoose');
/**
 * @api {post} /article/create 创建文章/编辑
 * @apiSampleRequest /article/create
 * @apiName articleCreate
 * @apiGroup Article
 *
 * @apiParam {String} id 文章id(可选，修改时传入)
 * @apiParam {String} title 文章标题
 * @apiParam {String[]} tags 文章标签
 * @apiParam {String} status 文章状态（'save', 'publish'）
 * @apiParam {String} content 文章内容
 *
 * @apiSuccess {Number} errno 0、成功 1、失败.
 * @apiSuccess {String} message  成功或者失败的信息
 * @apiSuccess {Object} data  用户信息
 * @apiSuccess {String} data.id  文章id
 *
 */
router.post('/api/article/create', async (ctx, next)=>{
  let requestData = ctx.request.body;
  if(requestData.title.trim() === ''){
    return ctx.body = {
      errno: 1,
      message: '标题不能为空'
    }
  }
  if(requestData.id){
    let updateOne = await ArticleModel.where({_id: requestData.id}).update({
      $set: {
        title: requestData.title,
        tags: requestData.tags,
        content: requestData.content,
        status: requestData.status,
        update_time: new Date()
      }
    });
    if(requestData.addTags.length){
      requestData.addTags.forEach(async item =>{
        await TagsModel.findOne({name: item}).update({
          $inc: {'articleCount': 1},
          $push: {'articleIds': requestData.id}
        })
      });
    }
    if(requestData.deleteTags.length){
      requestData.deleteTags.forEach(async item=>{
        await TagsModel.findOne({name: item}).update({
          $inc: {'articleCount': -1},
          $pull: {'articleIds': requestData.id}
        })
      })
    }
    ctx.body = {
      errno: 0,
      message: '',
      data: {
        id: requestData.id
      }
    }
  } else {
    // 创建文章
    var newArticle = new ArticleModel({
      title: requestData.title,
      tags: requestData.tags,
      content: requestData.content,
      status: requestData.status,
      create_time: new Date(),
      update_time: new Date()
    });
    await newArticle.save();

    requestData.tags.forEach(async item =>{
      await TagsModel.findOne({name: item}).update({
        $inc: {'articleCount': 1},
        $push: {'articleIds': newArticle._id}
      })
    });

    ctx.body = {
      errno: 0,
      message: '创建成功',
      data: {
        id: newArticle._id
      }
    }
  }

});


/**
 * @api {get} /article/list 文章列表
 * @apiSampleRequest /article/list
 * @apiName articleList
 * @apiGroup Article
 *
 *
 * @apiParam {Number} page 当前页(可选, default: 1)
 * @apiParam {Number} size 每页条数(可选, default: 15)
 * @apiParam {String} keyname 关键字搜索(可选)
 * @apiParam {String[]} tags 文章标签
 * @apiParam {String} status 文章状态（'save', 'publish', default: 'all'）
 *
 * @apiSuccess {Number} errno 0、成功 1、失败.
 * @apiSuccess {String} message  成功或者失败的信息
 * @apiSuccess {Object} data
 * @apiSuccess {Object[]} data.list  文章列表
 * @apiSuccess {Number} data.total  文章总条数
 *
 */

router.get('/api/article/list', async(ctx,next) =>{
  let query = ctx.query;
  if(_.isNumber(parseInt(query.page)) && _.isNumber(parseInt(query.size))){
    let page = parseInt(query.page) || 1;
    let size = parseInt(query.size) || 15;
    let postData = {
      page,
      size
    };
    if(query.tags){
      postData = _.extend({}, postData, {
        tags: query.tags
      })
    }
    let currentList = await ArticleModel.findAll(postData).exec();
    currentList = currentList.map(item =>{
      let matches = /\(([http|https].*)\)/.exec(item.content);
      let picture = matches && matches[1] || '';
      let index = item.content.indexOf('<!--more-->');
      if(index !== -1){
        item.isShowContinue = index < item.content.length;
        item.content = item.content.slice(0,index);
      }
      item.picture = picture;
      return item;
    });
    let total = await ArticleModel.getCount();
    ctx.body = {
      errno: 0,
      message: '',
      data: {
        list: currentList,
        total: total
      }
    }
  } else {
    ctx.body = {
      errno: 1,
      message: 'query can not be empty'
    }
  }

});

/**
 * @api {post} /article/delete 删除文章
 * @apiSampleRequest /article/delete
 * @apiName articleDelete
 * @apiGroup Article
 *
 *
 * @apiParam {String} _id 文章id

 *
 * @apiSuccess {Number} errno 0、成功 1、失败.
 * @apiSuccess {String} message  成功或者失败的信息
 *
 */

router.post('/api/article/delete', async(ctx, next)=>{
  let requestData = ctx.request.body;
  if(requestData.id){
    let deleteOne = await ArticleModel.findOneAndRemove({_id: requestData.id});
    let tags = deleteOne.tags.forEach(async item =>{
      await TagsModel.findOne({name: item}).update({
        $inc: {'articleCount': -1},
        $pull: {'articleIds': deleteOne._id}
      })
    });
    ctx.body = {
      errno: 0,
      message: ''
    }
  } else {
    ctx.body = {
      errno: 1,
      message: '未上传id'
    }
  }
});

/**
 * @api {get} /article/detail 文章详情
 * @apiSampleRequest /article/detail
 * @apiName articleDetail
 * @apiGroup Article
 *
 *
 * @apiParam {String} id 文章id

 *
 * @apiSuccess {Number} errno 0、成功 1、失败.
 * @apiSuccess {String} message  成功或者失败的信息
 * @apiSuccess {Object} data
 * @apiSuccess {Object} data.detail  文章详情
 * @apiSuccess {String} data.detail._id 文章id
 * @apiSuccess {String} data.detail.title  文章标题
 * @apiSuccess {String[]} data.detail.tags  文章标签
 * @apiSuccess {String} data.detail.content  文章内容
 *
 */

router.get('/api/article/detail', async(ctx,next)=>{
  try{
    let query = ctx.query;
    let id = query.id;
    var objectId = new mongoose.Types.ObjectId(id);
    let articleDetail = await ArticleModel.findById(objectId);
    let preArticle = await ArticleModel.find({_id: {$lt: objectId}}).sort({_id: -1 }).limit(1);
    let nextArticle = await ArticleModel.find({_id: {$gt: objectId}}).limit(1);

    let near = {};
    if(preArticle[0]){
      near.pre = {
        id: preArticle[0]._id,
        title: preArticle[0].title
      }
    }
    if(nextArticle[0]){
      near.next = {
        id: nextArticle[0]._id,
        title: nextArticle[0].title
      }
    }

    ctx.body = {
      errno: 0,
      message: '',
      data: {
        detail: articleDetail,
        near: near
      }
    }
  } catch(err){
    throw (err);
  }

});

/**
 * @api {get} /upload 图片上传
 * @apiSampleRequest /upload
 * @apiName upload
 * @apiGroup Article
 *
 *
 * @apiParam {blob} file 图片文件

 *
 * @apiSuccess {Number} errno 0、成功 1、失败.
 * @apiSuccess {String} message  成功或者失败的信息
 * @apiSuccess {Object} data
 * @apiSuccess {String} data.url 图片链接
 *
 */


router.post('/api/upload', upload.single('file'), (ctx, next)=>{
  let files = ctx.req.file;
  ctx.body = {
    errno: 0,
    message: '',
    data: {
      url:  ctx.origin + "/" + files.path.split(path.sep).join('/')
    }
  }

});

module.exports = router;