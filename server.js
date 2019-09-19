const express = require('express')
const path = require('path')
const port = process.env.PORT || 3000
const app = express()
 
app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, 'dist', 'iapp-web-app'
)))

app.get('*', function(req, res) {  
   res.redirect('https://' + req.headers.host + req.url);
})
 
app.get('/', function (req, res) {
   res.sendFile(path.join(__dirname, 'dist', 'iapp-web-app', 'index.html'))
})

app.use(function(req, res) {
   res.redirect('/');
});
 
app.listen(port)