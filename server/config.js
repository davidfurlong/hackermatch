ServiceConfiguration.configurations.remove({
    service : 'github'
});

// REMOTE VERSION

// ServiceConfiguration.configurations.insert({
//     service : 'github',
//     clientId: 'b04325d8189b5abd4358',
//     secret  : '88f6cc75ef929df9406290194e700cb18ce2577b'
// });

// LOCAL VERSION
ServiceConfiguration.configurations.insert({
    service : 'github',
    clientId: '191ae17422ad5a993ca3',
    secret  : 'e067a8a9ccdc7c9dd29667895f81f88cdd40ff0a'
});



Accounts.onCreateUser(function (options, user) {
  var accessToken = user.services.github.accessToken,
      result,
      profile;

  console.log('GOT HERE');

  result = Meteor.http.get("https://api.github.com/user", {
    headers: {
    	'User-Agent':'davidfurlong'
    },
    params: {
      access_token: accessToken
    }
  });

  if (result.error)
    throw result.error;

  profile = _.pick(result.data,
    "login",
    "name",
    "avatar_url",
    "url",
    "company",
    "blog",
    "location",
    "email",
    "bio",
    "html_url");

  var username = profile.login;


  var repos = Meteor.http.get("https://api.github.com/"+username+"/repos", {
    headers: {
      'User-Agent':'davidfurlong'
    },
    params: {
      access_token: accessToken
    }
  });

  console.log(repos);


  var events = Meteor.http.get("https://api.github.com/"+username+"/events", {
    headers: {
      'User-Agent':'davidfurlong'
    },
    params: {
      access_token: accessToken
    }
  });

  console.log(events);

  user.profile = profile;

  // Profile generator.

  return user;
});

