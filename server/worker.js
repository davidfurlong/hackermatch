


jobs = JobCollection('jobQueue');

//Set jobs allow for client access?

Meteor.startup(function () {
    // Start the myJobs queue running
    
    var worker = process.env.WORKER;
    var port = process.env.PORT;
    var url = process.env.ROOT_URL;

    //If running dev
    if(url.indexOf("localhost") > -1) {
        console.log("Dev on " + port + " initialized");
        jobs.startJobServer();

    //or worker instance
    } else if(worker) { 
        console.log("Worker on " + port + " initialized");
        jobs.startJobServer();

    //or normal server
    } else { 
        console.log("Instance on " + port + " initialized");
    }
    
});


var workers = Job.processJobs('jobQueue', 'processGithub',
    function (job, cb) {
        // This will only be called if a
        // 'sendEmail' job is obtained
        var userData = job.data; // Only one email per job
        processGithub(userData, 
            function(err) {
                if (err) {
                    job.log("Sending failed with error" + err,
                        {level: 'warning'});
                    job.fail("" + err);
                } else {
                    job.done();
                }
                // Be sure to invoke the callback
                // when work on this job has finished
                cb();
            }
        );
    }
);


processGithub = function(userData, cb) {

    var username = userData.username;
    var accessToken = userData.accessToken;

    console.log('Started processing ' + username);

  //Async http request
  Meteor.http.get("https://api.github.com/user/repos", {
    headers: {
      'User-Agent':'davidfurlong' //lolwut
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

        //console.log(temp);

//        if(temp.size != 0){ // not sure what this was here for
        if(temp) {
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

          if(commits.error) {
             //console.log("no commits");
          }

          //console.log(commits);
          
          if(commits.content != undefined){
            var commitsRepo = [];
            var parsedCommits = JSON.parse(commits.content);
            if(parsedCommits instanceof Array){ // Has commits
              _.each(parsedCommits, function(commit){
                  //console.log(commit);
                if(commit.author != null){
                  if(commit.author.login == username){
                    commitsRepo.push(commit.commit.author.date);
                  }
                }
              });
            }
          }
          var contributors_url = "https://api.github.com/repos/"+temp['full_name']+"/contributors";
          //console.log(contributors_url);
          var contributors = Meteor.http.get(contributors_url, {
            headers: {
              'User-Agent':'davidfurlong'
            },
            params: {
              access_token: accessToken
            }
          });

          var totalcommits = 0;
          var mycommits = 0;
          if(contributors.error) {
            //console.log("no contributors");        
          } else {
              var parsedContributors = JSON.parse(contributors.content);
              //console.log(parsedContributors);
              if(parsedContributors instanceof Array){
                _.each(parsedContributors, function(contributor){
                  if(contributor.login == username){
                    mycommits += contributor.contributions;
                  }
                  totalcommits += contributor.contributions;
                });
              }
          }
          var collaboratorsRay = [];
          /*
          var collaborators_url = "https://api.github.com/repos/"+temp['full_name']+'/collaborators';
          var collaborators = Meteor.http.get(collaborators_url, {
            headers: {
              'User-Agent':'davidfurlong'
            },
            params: {
              access_token: accessToken
            }
          });

          if(collaborators.error) {
            console.log("no collaborators"); 
          } else {
              var parsedCollaborators = JSON.parse(collaborators.content);
              if(parsedCollaborators instanceof Array){
                _.each(parsedCollaborators, function(collaborator){
                  collaboratorsRay.push({'f_login':collaborator.login, 'f_avatar_url':collaborator.avatar_url, 'f_html_url':collaborator.html_url});
                });
              }
              // console.log('110');
          }
          */
          var cl = _.extend(temp, {'owner': repo.owner.login, 'languages':languages.content, 'commits':commitsRepo, 'contributions':mycommits, 'all_contributions':totalcommits, 'collaborators':collaboratorsRay})

          userRepositories.push(cl);
        }
      });

      //User request was started with
      var user_id = userData._id;

      var current_user = Meteor.users.findOne(userData._id);

      //should contain github info plus all skills/changed features since request started
      profile = current_user.profile;

      // old storage
      // profile = _.extend(profile, {'repos': userRepositories});
      UserRepos.update({userId: userData._id}, {$set:{repos: userRepositories, timestamp: (new Date()).getTime()}}, {upsert:true}, function(err, result) {
        if(err) console.error(err);
      });

      var d = new Date();
      profile['updated_at'] = d.getTime();

      //console.log("profile 3 : " );
      //console.log(profile);
      //user.profile = profile;
  
      Meteor.users.update({_id:userData._id}, {$set:{"profile":profile}});

        console.log('Finished processing ' + username);
    
        cb(null);
  });


}


