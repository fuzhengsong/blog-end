const path = require('path');
const content = require('./content');
const mimes = require('./mimes');

// 解析资源类型
function parseMime( url ) {
  let extName = path.extname( url );
  extName = extName ?  extName.slice(1) : 'unknown';
  return  mimes[ extName ]
}


const readFiles = async function(ctx){
  // 静态资源目录在本地的绝对路径
  let fullStaticPath = path.resolve(__dirname, '../');

  // 获取静态资源内容，有可能是文件内容，目录，或404
  let _content = await content( ctx, fullStaticPath );

  // 解析请求内容的类型
  let _mime = parseMime( ctx.url )

  return {
    type: _mime,
    content: _content
  }
}

module.exports = readFiles;
