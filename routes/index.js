const router = require('koa-router')();
const fs = require('fs');
const path = require('path')
const users = require('./users');
const article = require('./article');
const tags = require('./tags');
// routes
router.get('/index', async(ctx, next)=> {
  ctx.type = 'text/html';
  ctx.body = fs.createReadStream(path.resolve(__dirname, '../public/dist/index.html'));
})
router.use(users.routes(), users.allowedMethods());
router.use(article.routes(), article.allowedMethods());
router.use(tags.routes(), tags.allowedMethods());

router.get('*', async (ctx, next) => {
  ctx.type = 'text/html';
  ctx.body = fs.createReadStream(path.resolve(__dirname, '../public/dist/index.html'));
})

module.exports = router;

