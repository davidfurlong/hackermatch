

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

    Meteor.methods({
        join_hackathon: function (invite_code) {
            console.log('join_hackathon called ' + invite_code);

            var hackathon = Hackathons.findOne({invite_code: invite_code});
            
            if(hackathon) {
                var group = hackathon.url_title;
                Roles.addUsersToRoles(this.userId, ['hacker'], group);
                return hackathon.url_title;
            } else {
                return null;
            } 
        }
    });
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

  var username = profile.login;

  //Async http request
  Meteor.http.get("https://api.github.com/user/repos", {
    headers: {
      'User-Agent':'davidfurlong'
    },
    params: {
      access_token: accessToken
    }
  }, function(error, repos) {
  
  

      var reposFormatted = JSON.parse(repos.content);
      var userRepositories = [];
      // No repos = [] not error so this is fine. 
      _.each(reposFormatted, function(repo,a,b){
        var temp = _.pick(repo,
          "full_name",
          "name",
          "description",
          "html_url",
          "created_at",
          "updated_at",
          "stargazers_count",
          "languages_url", // need to get this
          "commits_url",
          "created_at",
          "updated_at",
          "homepage",
          "private",
          "owner",
          "size",
          "fork",
          "contributors_url",
          "git_url");

        if(temp.size != 0){
          var languages_url = temp.languages_url;
          var languages = Meteor.http.get(languages_url, {
            headers: {
              'User-Agent':'davidfurlong'
            },
            params: {
              access_token: accessToken
            }
          });
        
          var commits_url = "https://api.github.com/repos/"+temp['full_name']+'/commits';
          var commits = Meteor.http.get(commits_url, {
            headers: {
              'User-Agent':'davidfurlong'
            },
            params: {
              access_token: accessToken
            }
          });

          if(commits.error)
            return
          
          if(commits.content != undefined){
            var commitsRepo = [];
            var parsedCommits = JSON.parse(commits.content);
            if(parsedCommits instanceof Array){ // Has commits
              _.each(parsedCommits, function(commit){
                if(commit.author != null){
                  if(commit.author.login == profile.login){
                    commitsRepo.push(commit.commit.author.date);
                  }
                }
              });
            }
          }
          var contributors_url = "https://api.github.com/repos/"+temp['full_name']+"/contributors";
          console.log(contributors_url);
          var contributors = Meteor.http.get(contributors_url, {
            headers: {
              'User-Agent':'davidfurlong'
            },
            params: {
              access_token: accessToken
            }
          });
          if(contributors.error)
            return

          var totalcommits = 0;
          var mycommits = 0;
          var parsedContributors = JSON.parse(contributors.content);
          console.log(parsedContributors);
          if(parsedContributors instanceof Array){
            _.each(parsedContributors, function(contributor){
              if(contributor.login == profile.login){
                mycommits += contributor.contributions;
              }
              totalcommits += contributor.contributions;
            });
          }
          var collaborators_url = "https://api.github.com/repos/"+temp['full_name']+'/collaborators';
          var collaborators = Meteor.http.get(collaborators_url, {
            headers: {
              'User-Agent':'davidfurlong'
            },
            params: {
              access_token: accessToken
            }
          });
          if(collaborators.error)
            return

          var collaboratorsRay = [];
          var parsedCollaborators = JSON.parse(collaborators.content);
          if(parsedCollaborators instanceof Array){
            _.each(parsedCollaborators, function(collaborator){
              collaboratorsRay.push({'f_login':collaborator.login, 'f_avatar_url':collaborator.avatar_url, 'f_html_url':collaborator.html_url});
            });
          }
          // console.log('110');
          var cl = _.extend(temp, {'owner': repo.owner.login, 'languages':languages.content, 'commits':commitsRepo, 'contributions':mycommits, 'all_contributions':totalcommits, 'collaborators':collaboratorsRay})

          userRepositories.push(cl);
        }
      });

      //User request was started with
      var user_id = user._id;

      var current_user = Meteor.users.findOne(user._id);
      console.log("user._id: " + user._id);
      console.log("current_user._id: " + current_user._id);

      //Should contain github info
      console.log("profile 1 : " );
      console.log(profile);

      //should contain github info plus all skills/changed features since request started
      profile = current_user.profile;
      
      console.log("profile 2 : " );
      console.log(profile);

      profile = _.extend(profile, {'repos': userRepositories});

      var d = new Date();
      profile['updated_at'] = d.getTime();

      console.log("profile 3 : " );
      console.log(profile);
//      user.profile = profile;

      Meteor.users.update({_id:user._id}, {$set:{"profile":profile}})

      console.log("ASYNC profile creation finished");
  });


  console.log("User initial profile creation finished");

  return user;
});

