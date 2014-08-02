ServiceConfiguration.configurations.remove({
    service : 'github'
});
ServiceConfiguration.configurations.insert({
    service : 'github',
    clientId: 'b04325d8189b5abd4358',
    secret  : '88f6cc75ef929df9406290194e700cb18ce2577b'
});


Accounts.onCreateUser(function (options, user) {
  var accessToken = user.services.github.accessToken,
      result,
      profile;

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

  user.profile = profile;

  return user;
});

