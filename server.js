const express = require('express')
const path = require('path')
const port = process.env.PORT || 3000
const app = express()
 
app.use(express.static(__dirname))
app.use(
   express.static(
      path.join(__dirname, 'dist', 'iapp-web-app')
   )
)

app.use(function forceLiveDomain(req, res, next) {
   // Don't allow user to hit http now that we have https
   if (!req.secure) {
     return res.redirect(301, 'https://'+req.headers.host+req.path);
   }
   return next();
 });


app.get('/*', function (req, res) {
   res.sendFile(path.join(__dirname, 'dist', 'iapp-web-app', 'index.html'));   
})
 
app.listen(port)