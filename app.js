const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const readFiles = require('./util/readFile')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const db = require('./config/dbconfig')
const routers = require('./routes/index');
const jwt = require('koa-jwt');
const config = require('./config/config');
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

//统一处理异常
app.use(async (ctx, next) => {
  try{
    await next()
  } catch(err){
    if(err.status === 401){
      ctx.body = {
        errno: 1,
        message: '请重新登录',
      };
    } else {
      throw(err);
    }
  }
});

//读取文件
app.use( async (ctx,next) =>{

  if(/uploads/.test(ctx.url)){

    let resource = await readFiles(ctx);
    let _mime = resource.type;
    if(_mime){
      ctx.type = _mime;
    }

    if ( _mime && _mime.indexOf('image/') >= 0 ) {
      // 如果是图片，则用node原生res，输出二进制数据
      ctx.res.writeHead(200);
      ctx.res.write(resource.content, 'binary');
      ctx.res.end()
    } else {
      // 其他则输出文本
      ctx.body = resource.content
    }
  }
  await next();
});
let secret =  config.jwtSecret;
// 使用jwt，secret是加密的key， unless中是不验证token的请求
app.use(jwt({
  secret
}).unless({
  path: [/\/register/, /\/login/, /\/uploads/, /\/article\/list/, /\/article\/detail/,
  /\/tags\/list/
  ]

}));

app.use(routers.routes()).use(routers.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
