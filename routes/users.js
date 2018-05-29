const router = require('koa-router')();
const UserModel = require('../model/User');
const TokenModel = require('../model/Token');
const  bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('util');
const verify = util.promisify(jwt.verify);
const config = require('../config/config');

/**
 * @api {post} /user/register 用户注册
 * @apiSampleRequest /user/register
 * @apiName userRegister
 * @apiGroup User
 *
 * @apiParam {String} username 用户名.
 * @apiParam {String} password 用户密码.
 *
 * @apiSuccess {Number} errno 0、成功 1、失败.
 * @apiSuccess {String} message  成功或者失败的信息
 * @apiSuccess {String} token  注册成功后返回的用户token
 * @apiSuccess {Object} user  用户信息
 *
 */
router.post('/api/user/register', async(ctx, next) => {
  let requestData = ctx.request.body;
  return ctx.body = {
    errno: 1,
    message: '无法注册'
  };
  let username = requestData.username;
  let password = requestData.password;
  if (username === '') {
    ctx.body = {
      errno: 1,
      message: '用户名不能为空'
    }
  } else {
    let user = await UserModel.findOne({username: username});
    if (user) {
      ctx.body = {
        errno: 1,
        message: '用户名已存在'
      };
    } else {
      let hash = await bcrypt.hash(password, 10);
      let user = await UserModel.create({
        username: username,
        password: hash
      });
      let token = 'Bearer' + ' '+ jwt.sign({userInfo: user}, config.jwtSecret,{expiresIn: '1d'});
       dbToken = await TokenModel.create({
        id: user._id,
        token: token
      });
      ctx.body = {
        errno: 0,
        message: '注册成功',
        token,
        user: {username: user.username, id: user._id}
      };
    }
  }
});

/**
 * @api {post} /user/login 用户登录
 * @apiSampleRequest /user/login
 * @apiName userLogin
 * @apiGroup User
 *
 * @apiParam {String} username 用户名.
 * @apiParam {String} password 用户密码.
 *
 * @apiSuccess {Number} errno 0、成功 1、失败.
 * @apiSuccess {String} message  成功或者失败的信息
 * @apiSuccess {String} token  注册成功后返回的用户token
 * @apiSuccess {Object} user  用户信息
 *
 */

router.post('/api/user/login', async(ctx, next)=>{
  let requestData = ctx.request.body;
  let username = requestData.username;
  let password = requestData.password;
  if (username === '') {
    ctx.body = {
      errno: 1,
      message: '用户名不能为空'
    }
  } else {
    let user = await UserModel.findOne({username: username});
    if(user){
      let passwordHash = user.password;
      let isPasswordRight = await bcrypt.compare(password, passwordHash);
      // 如果验证通过，则生成token更新数据库
      let token;
      if(isPasswordRight){
        token = 'Bearer' + ' '+ jwt.sign({userInfo: user}, config.jwtSecret,{expiresIn: '1d'});
        let dbToken = await TokenModel.findOne({id: user._id});
        dbToken.update({$set: {token: token}}).exec();
      }
      ctx.body = isPasswordRight? {
        errno: 0,
        message: '登录成功',
        token,
        user: {username: user.username, id: user._id}

      }:{
        errno: 1,
        message: '密码错误'
      };
    } else {
      ctx.body = {
        errno: 1,
        message: '用户不存在'
      }
    }

  }
});

/**
  * @api {get} /user/userInfo 用户信息
  * @apiSampleRequest /user/userInfo
  * @apiName userInfo
  * @apiGroup User
  *
  * @apiParam {String} token token信息.
  *
  * @apiSuccess {Number} errno 0、成功 1、失败.
  * @apiSuccess {String} message  成功或者失败的信息
  * @apiSuccess {Object} userInfo  用户信息
*/

router.get('/api/user/userInfo', async(ctx,next) =>{
  const token = ctx.header.authorization;
  let payload,
      responseBody;
  if(token){
    payload = await verify(token.split(' ')[1], config.jwtSecret); // 解密，获取payload
    let id = payload.userInfo._id;
    let dbToken = await TokenModel.findOne({id: id});
    // 是否存在token 且 token相同
    if(dbToken.token && dbToken.token === token){
      responseBody = {
        errno: 0,
        message: '',
        userInfo: {
          username: payload.userInfo.username,
          id: payload.userInfo._id
        }
      }

    } else {
      responseBody = {
        errno: 1,
        message: '请登录'
      }
    }
  } else {
    responseBody = {
      errno: 1,
      message: '请登录'
    }
  }
  ctx.body = responseBody;
});

module.exports = router;
