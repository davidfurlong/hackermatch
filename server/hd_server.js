
Meteor.startup(function () {
// code to run on server at startup
});

Accounts.onCreateUser(function(options, user) {
  // We're enforcing at least an empty profile object to avoid needing to check
  // for its existence later.
  user.profile = options.profile ? options.profile : {};

  var http = Npm.require('https');
  var options = {
    host: 'api.github.com',
    path: '/users/'+options.profile.github,
    headers: {
    	'User-Agent':'davidfurlong'
    }
  };

  var req = http.get(options, function(res) {
    // console.log('STATUS: ' + res.statusCode);
    // console.log('HEADERS: ' + JSON.stringify(res.headers));
    // Buffer the body entirely for processing as a whole.
    var bodyChunks = [];
    res.on('data', function(chunk) {
      // You can process streamed parts here...
      bodyChunks.push(chunk);
    }).on('end', function() {
      var body = Buffer.concat(bodyChunks);
      var avatar_url = (JSON.parse(body))['avatar_url'];
      console.log(avatar_url);
      // console.log('BODY: ' + body);
      // ...and/or process the entire body here.
      
    })
  });

  req.on('error', function(e) {
    console.log('ERROR: ' + e.message);
  });

  return user;
});
