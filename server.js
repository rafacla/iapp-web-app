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

app.get('*', (req, res, next) => {
   if (req.headers['x-forwarded-proto'] != 'https') {
       
// checa se o header é HTTP ou HTTPS

       res.redirect("https://" + req.headers.host + req.url);
       
// faz o redirect para HTTPS

   } else {
       next();
       
// segue com a sequência das rotas

   }
});

app.get('/*', function (req, res) {
   res.sendFile(path.join(__dirname, 'dist', 'iapp-web-app', 'index.html'));   
})
 
app.listen(port)