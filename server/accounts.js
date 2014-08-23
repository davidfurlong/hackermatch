

Meteor.startup(function () {

    var user = Meteor.users.findOne({"profile.login": "kainolophobia"});
    console.log(user);
    if(user) {
        Roles.addUsersToRoles(user._id, ['admin'], 'all')
        Roles.addUsersToRoles(user._id, ['hacker'], 'ychacks')
        Roles.addUsersToRoles(user._id, ['hacker', 'organizer'], 'mhacks')
    }
    //twice in case we're on the same box and the $or breaks
    var user = Meteor.users.findOne({"profile.login": "davidfurlong"});
    if(user) {
        Roles.addUsersToRoles(user._id, ['admin'], 'all')
        Roles.addUsersToRoles(user._id, ['hacker'], 'ychacks')
        Roles.addUsersToRoles(user._id, ['hacker', 'organizer'], 'mhacks')
    }
});
 


Accounts.onCreateUser(function (options, user) {
  var accessToken = user.services.github.accessToken,
      result,
      profile;

  result = Meteor.http.get("https://api.github.com/user", {
    headers: {
    	'User-Agent':'Meteor/1.0'
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

