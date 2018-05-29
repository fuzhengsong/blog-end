const fs = require('fs');
const path = require('path');
const Koa = require('koa')
const app = new Koa()

app.use(require('koa-static')(__dirname, '../dist'));

app.get('*', function(req, res) {
  const html = fs.readFileSync(path.resolve(__dirname, '../dist/index.html'), 'utf-8');
  res.send(html)
});