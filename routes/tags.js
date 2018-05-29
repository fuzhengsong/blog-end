const router = require('koa-router')();
const TagsModel = require('../model/Tags');

/**
 * @api {get} /tags/list 标签列表
 * @apiSampleRequest /tags/list
 * @apiName tagsList
 * @apiGroup Tags
 *
 *
 * @apiSuccess {Number} errno 0、成功 1、失败.
 * @apiSuccess {String} message  成功或者失败的信息
 * @apiSuccess {Object} data
 * @apiSuccess {Object} data.list 标签列表
 * @apiSuccess {Object} data.total 标签总数
 *
 */

router.get('/api/tags/list', async(ctx, next) => {
  try{
    let tagsList = await TagsModel.find(null, {articleIds: 0});
    let count = tagsList.length;
    ctx.body = {
      errno: 0,
      message: '',
      data: {
        list: tagsList,
        total: count
      }
    }
  } catch(err){
    throw(err)
  }
});

/**
 * @api {post} /tags/add 标签列表
 * @apiSampleRequest /tags/add
 * @apiName tagsAdd
 * @apiGroup Tags
 *
 * @apiParam {String} name 标签名
 *
 *
 * @apiSuccess {Number} errno 0、成功 1、失败.
 * @apiSuccess {String} message  成功或者失败的信息
 * @apiSuccess {Object} data
 * @apiSuccess {Object} data.tag 标签对象
 * @apiSuccess {Object} data.tag.id 标签id
 * @apiSuccess {Object} data.tag.name 标签名
 * @apiSuccess {Object} data.tag.articleCount 标签内文章数量
 *
 */

router.post('/api/tags/add', async(ctx, next)=>{
  let requestData = ctx.request.body;
  let isExists = await TagsModel.findOne({name: requestData.name});
  console.log(isExists);
  if(isExists){
    ctx.body = {
      errno: 1,
      message: '标签已存在'
    }
  } else {
    let newTag = new TagsModel({
      name: requestData.name,
      articleCount: 0,
      articleIds: []
    });

    await newTag.save();
    ctx.body = {
      errno: 0,
      message: '',
      data: {
        tag: {
          id: newTag._id,
          name: newTag.name,
          articleCount: newTag.articleCount
        }
      }
    }
  }
});

router.post('/api/tags/delete', async(ctx)=>{
  let requestData = ctx.request.body;
  let id = requestData.id;
  let deleteOne = await TagsModel.findByIdAndRemove(id, {select: ['_id']}).exec();
  ctx.body = {
    errno: 0,
    message: '',
    data: {
      id: deleteOne._id
    }
  }
});
module.exports = router;
