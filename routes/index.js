const router = require('koa-router')();

const users = require('./users');
const article = require('./article');
const tags = require('./tags');
// routes
router.use(users.routes(), users.allowedMethods());
router.use(article.routes(), article.allowedMethods());
router.use(tags.routes(), tags.allowedMethods());

module.exports = router;

