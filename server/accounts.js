Meteor.startup(function () {
    var user = Meteor.users.findOne({"services.github.username": "kainolophobia"});
    if(user) {
        Roles.addUsersToRoles(user._id, ['admin'], 'all');
        Roles.addUsersToRoles(user._id, ['hacker'], 'ychacks');
        Roles.addUsersToRoles(user._id, ['hacker'], 'hackthenorth');
        Roles.addUsersToRoles(user._id, ['hacker', 'organizer'], 'mhacks');
    }
    //twice in case we're on the same box and the $or breaks
    var user = Meteor.users.findOne({"services.github.username": "davidfurlong"});
    if(user) {
        Roles.addUsersToRoles(user._id, ['admin'], 'all');
        Roles.addUsersToRoles(user._id, ['hacker'], 'ychacks');
        Roles.addUsersToRoles(user._id, ['hacker'], 'hackthenorth');
        Roles.addUsersToRoles(user._id, ['hacker', 'organizer'], 'mhacks');
    }

    Meteor.methods({
        sendMessage: function(to, contents) {
          var from = Meteor.userId();
          if(to == from)
            return false;
          if(to < from){
            var user1 = to;
            var user2 = from;
          }
          else {
            var user1 = from;
            var user2 = to;
          }
          var message = {
            'text' : contents,
            'timestamp': (new Date()).getTime(),
            'from': from == user1 // boolean: true => user1 & false => 2
          }
          
          Messages.update({$and: [{user1: user1}, {user2: user2}]}, {$push: {messages: message}, $setOnInsert: {user1: user1, user2: user2}}, {upsert: true}, function(err, result){
            if(err) console.error(err);
            else {
              var messageNotification = {
                details: {
                  type: "message",
                  from: Meteor.user().profile.login,
                  contents: contents
                },
                read: false,
                priority: 2,
                timestamp: (new Date()).getTime()
              };
              
              // email notification
              var userTarget = Meteor.users.findOne(to);
              if(userTarget &&  userTarget.profile.email_notifications){
                Meteor.call('sendEmail', userTarget.profile.email, "david@furlo.ng", "Hackermatch: "+Meteor.user().profile.login+" just sent you a message",
                  Meteor.user().profile.login+" just sent you the message "+contents+". Check it out at http://hackermat.ch/messages/"
                  );
              }
              // in app notification
              Notifications.update({userId: to}, {$push: {notifications: messageNotification}}, {upsert:true}, function(err, result) {
                if(err) console.error(err);
              });
            }
          })
        },
        sendEmail: function (to, from, subject, text) {
          check([to, from, subject, text], [String]);

          // Let other method calls from the same client start running,
          // without waiting for the email sending to complete.
          this.unblock();

          Email.send({
            to: to,
            from: from,
            subject: subject,
            text: text
          });
        },
        //attaching lost ideas to users - a result of manual importing from other source of ideas
        attach_ideas: function (user_id) {
            var user = Meteor.users.findOne(user_id);
            if(!user) return;
            var ideas = Ideas.find({ $and: [
                {$or: [{'user_profile.name': user.profile.name},
                {'user_profile.email': user.profile.contact}]},
                {userId: null}
            ]}).fetch();
            var user_profile_min = _.pick(user.profile,
              "login", "avatar_url", "name");
            _.each(ideas, function(idea) {
                Ideas.update({_id:idea._id}, {$set:{"userId":user._id}});
                Ideas.update({_id:idea._id}, {$set:{"user_profile":user_profile_min}});
                Meteor.call('heart_idea', idea._id);
            });
        },
        update_ideas: function (user_id) {   // updates user info for ideas
            var user = Meteor.users.findOne(user_id);
            if(!user) return;
            var user_profile_min = _.pick(user.profile,
              "login", "avatar_url", "name");

            Ideas.update({userId: user_id}, {"user_profile":user_profile_min});
        },
        read_notifications: function(){
          function removeNotif(){
            Notifications.update({userId: Meteor.userId(), "notifications.read": false}, {$set: {"notifications.$.read": true}}, function(err, result) {
              if(err){
                console.error(err);
              }
              else if(result != 0) {
                removeNotif();
              }
            });
          }
          removeNotif();
        },
        heart_idea: function (idea_id) {
            var heart = Hearts.findOne({ $and: [{idea_id: idea_id}, {user_id: this.userId}]});
            var idea = Ideas.findOne({_id: idea_id});
            // attach notification
            var heartedNotification = {
              details: {
                type: "hearted",
                by: Meteor.user().profile.login,
                idea_id: idea._id,
                idea_name: idea.name,
                hackathon: idea.hackathon_id
              },
              read: false,
              priority: 1,
              timestamp: (new Date()).getTime()
            };
            console.log(heart);
            if(heart && (Meteor.userId() != idea.userId || !heart.hearted)){ // dont notify yourself or if unheart
              // email notification
              var userAuthor = Meteor.users.findOne(idea.userId);
              if(userAuthor.profile.email_notifications){
                Meteor.call('sendEmail', userAuthor.profile.email, "david@furlo.ng", "Hackermatch: "+Meteor.user().profile.login+" just hearted your idea",
                  Meteor.user().profile.login+" just hearted your idea "+idea.name+". Check it out at http://hackermat.ch/idea/"+idea._id
                  );
              }
              // in app notification
              Notifications.update({userId: idea.userId}, {$push: {notifications: heartedNotification}}, {upsert:true}, function(err, result) {
                if(err){
                  console.error(err);
                }
                else {
                  console.log('new notification for user '+idea.userId);
                }
              });
            }

            // Updates DB
            if(typeof idea.hearts == "number"){ // safety check for NaN
              if(heart && idea) {
                if(heart.hearted) {
                    Hearts.update({_id:heart._id}, {$set:{"hearted":false}});
                    idea.hearts--;
                    Ideas.update({_id:idea._id}, {$set:{"hearts":idea.hearts}});
                } else {
                    Hearts.update({_id:heart._id}, {$set:{"hearted":true}});
                    idea.hearts++;
                    Ideas.update({_id:idea._id}, {$set:{"hearts":idea.hearts, "time_lastupdated": new Date().getTime()}});
                }
                return;
              }
            }
            else {
              if(heart && idea) {
                  if(heart.hearted) {
                      Hearts.update({_id:heart._id}, {$set:{"hearted":false}});
                      Ideas.update({_id:idea._id}, {$pull:{"hearts":Meteor.user().profile.login}});
                  } else {
                      Hearts.update({_id:heart._id}, {$set:{"hearted":true}});
                      Ideas.update({_id:idea._id}, {
                        $push:{"hearts":Meteor.user().profile.login},
                        $set: {"time_lastupdated": new Date().getTime()}
                      });
                  }
                  return;
              }
            }
            if(idea && this.userId) {
                // apply heart
                heart = {
                    idea_id: idea._id,
                    user_id: this.userId,
                    hackathon_id: idea.hackathon_id,
                    hearted: true
                };

                Hearts.insert(heart, function(err, result) {
                    if(err) {
                      //console.log("error hearting idea");
                    } else {
                      //console.log("hearted idea!");
                      //Add initial heart to idea
                      if(typeof idea.hearts == "number"){
                        idea.hearts++;
                        Ideas.update({_id:idea._id}, {$set:{"hearts":idea.hearts}});
                      }
                      else {
                        Ideas.update({_id:idea._id}, {$push:{"hearts":Meteor.user().profile.login}});
                      }
                    }
                });
            }
        },
        create_idea: function(idea) {
          idea.hearts = [];

          //Ideas.insert({name: name}, function(err, result) {
          Ideas.insert(idea, function(err, idea_id) {
              if(err) {
                  console.log("error creating idea");
              } else {
                  // TODO can save this call by inserting in above
                  Meteor.call('heart_idea', idea_id, function(err, res) {});
              }
          });
          return false;
        },
        create_comment: function(comment){    
          Comments.insert(comment, function(err, result) {
              if(err) {
                  console.log("error creating comment");
              } 
          });

          // todo subscribers are not unique duplicated
          var commented = _.uniq(_.pluck(Comments.find({ideaId: comment.ideaId}).fetch(), 'userId'));
          var idea = Ideas.findOne({_id: comment.ideaId});
          var subscribers = _.difference(_.union(commented, [idea.userId]), [Meteor.userId()]);
          // for testing:
          //subscribers = _.union(subscribers, [Meteor.userId()]);
          for(var i = 0; i < subscribers.length; i++){
              var commentNotification = {
                details: {
                  type: "comment",
                  hackathon: idea.hackathon_id,
                  idea_name: idea.name,
                  idea_id: idea._id,
                  by: Meteor.user().profile.login,
                  text: comment.text
                },
                priority: 2,
                timestamp: (new Date()).getTime(),
                read: false     
              };
              // email notification
              var userSubscriber = Meteor.users.findOne(subscribers[i]);
              if(userSubscriber.profile.email_notifications){
                Meteor.call('sendEmail', userSubscriber.profile.email, "david@furlo.ng", "Hackermatch: Someone just commented on an idea you are following",
                  Meteor.user().profile.login+" just commented on "+idea.name+". Check it out at http://hackermat.ch/idea/"+idea._id
                  );
              }
              // in app notification
              Notifications.update({userId: subscribers[i]}, {$push: {notifications: commentNotification}}, {upsert:true}, function(err, result) {
                  if(err){
                      console.error(err)
                  }
                  else {
                      console.log('new notification for user'+subscribers[i]);
                  }
              }); 
              Ideas.update({_id: comment.ideaId}, {$set: {"time_lastupdated": new Date().getTime()}});
          }
        },
        hackathon_by_code: function (invite_code, url_title) {
          //console.log('hackathon by code ' + invite_code);

          var hackathon = Hackathons.findOne({$and: [{invite_code: invite_code}, {url_title: url_title}]});
         
          if(hackathon) {
              return hackathon;
          } else {
              // todo better error message;
              return null;
          } 
        },
        is_hackathon_open_join: function(url_title){
          var hackathon = Hackathons.findOne({url_title: url_title});    
          if(hackathon && hackathon.open) { // hackathon.open may be undefined for old db
              return true;
          } else {
              return false;
          } 
        },
        leave_hackathon: function(id){ // todo only works for hackers
          var hackathon = Hackathons.findOne({_id: id});
          if(hackathon){
            var group = hackathon.url_title;
            Roles.removeUsersFromRoles(this.userId, ['hacker'], group);
            // todo unattach ideas?
            return true;
          }
          else {
            return false;
          }
        },
        join_hackathon: function (invite_code) {
          var hackathon = Hackathons.findOne({invite_code: invite_code});
          
          if(hackathon) {
              var group = hackathon.url_title;
              Roles.addUsersToRoles(this.userId, ['hacker'], group);
              Meteor.call('attach_ideas', this.userId, function(err, res) {});
              return hackathon.url_title;
          } else {
              return null;
          } 
        },

        create_hackathon: function(obj, isOrganizer) {     
          if (!obj) return "no obj";

          var hackathon;
          if(typeof obj == "string"){
            // if passed just a title
            hackathon = {
              'title': obj
            }
          }
          else {
            // if passed hackathon object
            hackathon = obj;
          }

          var url_title = encodeURI(hackathon.title.toLowerCase().replace(/ /g, ''));
          var url_title_exists = Hackathons.findOne({url_title: url_title});
          var count = 1;
          while(url_title_exists){
            url_title = encodeURI(hackathon.title.toLowerCase().replace(/ /g, '')+count);
            url_title_exists = Hackathons.findOne({url_title: url_title});
            count++;
          }

          var hash = ((Math.floor(Math.random() * 1e8) + new Date().getMilliseconds()).toString(36)).toUpperCase().substring(0,5);
          var code_exists = Hackathons.findOne({invite_code: hash});
          while(code_exists) {
            hash = ((Math.floor(Math.random() * 1e8) + new Date().getMilliseconds()).toString(36)).toUpperCase().substring(0,5);
            code_exists = Hackathons.findOne({invite_code: hash});
          }
          
          hackathon['url_title'] = url_title;
          hackathon['invite_code'] = hash;
          hackathon['created_by'] = this.userId;

          // var exists = Hackathons.findOne({title: hackathon.title});
          // if(exists) {
          //     return;
          //     // TODO throw sensible error
          //     //can we select on name attribute again?
          // }
          var uid = this.userId;
          var h = Hackathons.insert(hackathon);
          // TODO ADAM this throws an error
          if(isOrganizer)
            Roles.addUsersToRoles(uid, ['hacker','organizer','creator'], hackathon['url_title']);
          else
            Roles.addUsersToRoles(uid, ['hacker','creator'], hackathon['url_title']);
          
          // email notification
          if(Meteor.user().profile.email_notifications){
            Meteor.call('sendEmail', Meteor.user().profile.email, "david@furlo.ng", "Hackermatch: Hackathon "+hackathon.name+" successfully created",
              "Check it out at http://hackermat.ch/"+hackathon['url_title']
              );
          }  
          return hackathon['url_title'];   
        }
    });
});

Accounts.onCreateUser(function (options, user) {

    user.profile = options.profile;
    if(!user.services.github) return user;

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
    user.username = profile.login;


    //Send Welcome Message
   
    var welcome = {
        details: {
            type:"welcome",
        },
        priority: 1,
        read: false,
        timestamp: (new Date()).getTime()
    };
    Notifications.update({userId: user._id}, {$push: {notifications: welcome}}, {upsert:true}, function(err, result) {
        if(err){
            console.error('failed to create notification model for user')
        }
        else {

        }
    });

    //Get Github data
    
    var job = new Job(jobs, 'processGithub', // type of job
      // Job data that you define, including anything the job
      // needs to complete. May contain links to files, etc...
        {
            _id: user._id,
            accessToken: accessToken,
            username: profile.login,
        }
    );

    // Set some properties of the job and then submit it
    job.priority('normal')
      .retry({ retries: 5,
        wait: 15*60*1000 })  // 15 minutes between attempts
      //.delay(60*60*1000)     // Wait an hour before first try
      .save();               // Commit it to the server

  return user;
});
