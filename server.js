const express = require('express')
const path = require('path')
const port = process.env.PORT || 3000
const app = express()
 
app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, 'dist', 'iapp-web-app'
)))

app.get('/*', function (req, res) {
   if (req.secure) {
      res.sendFile(path.join(__dirname, 'dist', 'iapp-web-app', 'index.html'))
   } else {
      res.redirect('https://' + req.headers.host + req.url);
   }
   
})
 
app.listen(port)