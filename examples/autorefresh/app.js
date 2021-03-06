var nforce       = require('../../');
var sfuser       = process.env.SFUSER;
var sfpass       = process.env.SFPASS;
var express      = require('express');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var cookieParser = require('cookie-parser');

var app = express();

var org = nforce.createConnection({
  clientId: '3MVG9rFJvQRVOvk5nd6A4swCyck.4BFLnjFuASqNZmmxzpQSFWSTe6lWQxtF3L5soyVLfjV3yBKkjcePAsPzi',
  clientSecret: '9154137956044345875',
  redirectUri: 'http://localhost:3000/oauth/_callback',
  autoRefresh: true
});

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({ secret: 'somesecret', key: 'sid' }));
app.use(org.expressOAuth({onSuccess: '/', onError: '/oauth/error'}));

app.get('/', function(req, res) {
  var status;
  if(req.query.status){
    if(req.query.status === 'rejected') {
      status = req.query.status;
      authed = false;
    } else if(req.query.status === 'ok') {
      status = req.query.status;
      authed = true;
    }
  } else if(req.session.oauth) {
    status = 'authenticated';
    authed = true;
  } else {
    status = 'not authenticated';
    authed = false;
  }
  res.render('index', {
    authed: authed,
    status: status
  });
});

app.get('/oauth/authorize', function(req, res) {
  res.redirect(org.getAuthUri());
});

app.get('/oauth/invalidate', function(req, res) {
  org.revokeToken({ token: req.session.oauth.access_token }, function(err, body) {
    if(err) throw err;
    else res.redirect('/?status=rejected');
  });
});

app.get('/query', function(req, res) {
  org.query({ query: 'SELECT Id FROM Account LIMIT 1', oauth: req.session.oauth }, function(err, body){
    if(err) throw err;
    else {
      res.send(body);
    }
  })
});

console.log('listening on 3000');
app.listen(3000);