Template.sidebar.events({
    'click #sidebar-exit': function(e){
        var id = e;
        if(Session.get("sidebarOpened") == "open" || Session.get('profile_sidebarOpened') == "open") {
           e.preventDefault();
           Session.set('selectedIdea', '');
           Session.set('sidebarOpened', '');
           Session.set('selectedProfile', '');
           Session.set('profile_sidebarOpened', '');
        }
    },
    'click #heart-idea-toggle': function(e){
        var idea_id = Session.get('selectedIdea');
        Meteor.call('heart_idea', idea_id, function(err, res) {});
    },
    'submit #comment-create' : function(e, t) {
        e.preventDefault();
        var text = t.find('#comment-text').value;
        if(text != ""){
            t.find('#comment-text').value = "";
            var comment = {
                userId: Meteor.userId(),
                username: Meteor.user().profile.name,
                login: Meteor.user().profile.login,
                avatar_url: Meteor.user().profile.avatar_url,
                text: text,
                skills: Meteor.user().profile.skills,
                time: new Date().getTime(),
                ideaId: Session.get("selectedIdea")
            };

            Comments.insert(comment, function(err, result) {
                if(err) {
                    console.log("error creating comment");
                } else {
                    //hackety hackety hack
                    //console.log("comment added!");
                }
            });
            // todo subscribers are not unique duplicated
            var subscribers = Comments.find({$and: [{ideaId: Session.get("selectedIdea")}, {userId: Meteor.userId()}] }).fetch(); // todo this code is likely wrong
            var idea = Ideas.findOne({_id: Session.get("selectedIdea")});
            for(var i = 0; i < subscribers.length; i++){
                var heartedNotification = {};
                heartedNotification[idea.userId] = {
                    type: "comment",
                    message: "New comment on "+idea.name,
                    url: null,
                    priority: 2,
                    timestamp: (new Date()).getTime(),
                    hackathon: idea.hackathon_id
                };
                var notifId = Notifications.find({userId: idea.userId}).fetch()._id;
                console.log(Notifications.find({userId: idea.userId}).fetch());

                Notifications.update({_id: notifId}, {notifications: {$push: heartedNotification}}, function(err, result) {
                    if(err){
                        console.error('failed to create notification model for user')
                    }
                    else {
                        console.log('new notification for user'+idea.userId);
                    }
                }); 
            }
        }
    }
});

Template.personRow.events({
    'click .person-row': function(e){
        Router.go('/profile/'+$(e.currentTarget).closest('.person-row').data('id'));
    }
});

Template.hackathon.events({
    'click .sidebar' : function(e, t) {
        e.stopPropagation();
    },
    'click .profile_sidebar' : function(e, t){
        e.stopPropagation();
    },
    'click .page-container' : function(e, t) {
        var id = e;
        if(Session.get("sidebarOpened") == "open" || Session.get('profile_sidebarOpened') == "open") {
            e.preventDefault();
            Session.set('selectedIdea', '');
            Session.set('sidebarOpened', '');
            Session.set('selectedProfile', '');
            Session.set('profile_sidebarOpened', '');
            $('.pt-triggers, #pt-main, #title-bar').removeClass('blur');
        } 
    }
});

Template.ideaRow.events({
    // open idea in sidebar
    'click li.item-text' : function(e, t) {
        e.preventDefault();
        var idea_id = e.currentTarget.dataset.id;
        Session.set("selectedIdea", idea_id);
    },
    // toggle heart action
    'click li.item-heart' : function(e, t) {
        e.preventDefault();
        var idea_id = e.currentTarget.dataset.id;
        Meteor.call('heart_idea', idea_id, function(err, res) {});
    }
});

Template.home.events({
    'click #incomplete-profile': function (e, t){
        Router.go('settings');
    }
});

Template.showHackathons.events({
    'click #no-idea-posted': function(){
        Router.go('/idea');
    },
    'click #team-reminder': function(){
        // Router.go('/people');
    }
});

Template.admin.events({
    'submit #create_hackathon' : function(e, t) {
        e.preventDefault();

        var title = t.find("#new_hackathon_name").value;
        if(title.indexOf('/') != -1){
            alert('Hackathon names can\'t contain / because we use them for routes');
            return;         
        }
        t.$("#new_hackathon_name").val("");

        Meteor.call('create_hackathon', title, function(err, res) {});
    }
});

Template.createHackathon.events({
    'submit #add-hackathon-form': function(e, t){
        e.preventDefault();
        // todo test & act well on optional inputs
        var isOrganizer = e.target['hackathon-isOrganizer'].checked;
        var hackathon = {
            'title': e.target['hackathon-name'].value,
            'url': e.target['hackathon-url'].value,
            'logo': e.target['hackathon-logo-url'].value,
            'open': e.target['hackathon-open-join'].value
        }
        hackathon.title = hackathon.title.replace('/', '&#47;');
        Meteor.call('create_hackathon', hackathon, function(err, res) {});
        // todo make current user organizer if checked
    }
});

Template.person_filter.events({ 
  'mousedown .filter': function () {
    if (Session.equals('team_filter', this.filter)) {
        //Session.set('idea_filter', null);
    } else {
        Session.set('team_filter', this.filter);
    }
  }
});

Template.createIdea.events({
    'submit #create-idea': function(e, t){
        // get form submitted values
        var ideaName = e.target['idea-name'].value;
        var ideaDescription = e.target['idea-description'].value;
        var ideaSkillsNeeded = {
            design: e.target['idea-need-designer'].checked,
            frontend: e.target['idea-need-frontend'].checked,
            backend: e.target['idea-need-backend'].checked,
            ios: e.target['idea-need-ios'].checked,
            android: e.target['idea-need-android'].checked,
            hardware: e.target['idea-need-hardware'].checked,
        }
        
        var hackathon = Session.get("current_hackathon");

        var idea = {
            name: ideaName,
            description: ideaDescription,
            user_id: Meteor.userId(),
            hackathon_id: hackathon._id,
            time_created: new Date().getTime(),
            user_profile: Meteor.user().profile,
            skills: ideaSkillsNeeded,
            comments: {}
        };

        Meteor.call('create_idea', idea, function(err, res) {
            if(err){
                // TODO notify user of error
                console.log(error);
            }
            else {
                Router.go('hackathon', { hackathon: hackathon.title});
            }
        });    
    }
});

Template.settings.events({
    'click .delete-language': function(e, t){
        $(e.currentTarget).closest('.specialization').remove();
        var langs = $('.language').toArray().map(function(el){
            return $(el).val();
        });
        var updated_profile = {
            languages: langs
        };
        updated_profile = _.extend(Meteor.user().profile, updated_profile);
        Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile":updated_profile}});
    },
    'click .add-language': function(){
        var langs = $('.language').toArray().map(function(el){
            return $(el).val();
        });
        langs.push('');
        var updated_profile = {
            languages: langs
        };
        updated_profile = _.extend(Meteor.user().profile, updated_profile);
        Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile":updated_profile}});
    },
    'submit #update-user-form' : function(e, t){
        e.preventDefault();
        var langs = [];
        var iter = 0;
        while(e.target['user-specialization-'+iter] != undefined){
            langs.push(e.target['user-specialization-'+iter].value);
            iter++;
        }

        var updated_profile = {
            name: e.target['user-name'].value,
            contact: e.target['user-email'].value,
            email_notifications: e.target['user-email-notifications'].checked,
            skills: {
                backend: e.target['user-skill-backend'].checked,
                design: e.target['user-skill-design'].checked,
                hardware: e.target['user-skill-hardware'].checked,
                ios: e.target['user-skill-ios'].checked,
                frontend: e.target['user-skill-frontend'].checked,
                android: e.target['user-skill-android'].checked
            },
            bio: e.target['user-description'].value, 
            languages: langs
        };
        updated_profile = _.extend(Meteor.user().profile, updated_profile);
        
        // Trim and validate the input
        Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile":updated_profile}});
        Meteor.call('attach_ideas', Meteor.user()._id);
        Meteor.call('update_ideas', Meteor.user()._id);
       
        return false;
    },
    'submit #join-hackathon' : function(e, t) {
        e.preventDefault();
        var invite_code = e.target['join-code'].value;

        Meteor.call('join_hackathon', invite_code, function(err, res) {       
            if(res) {
                Router.go('hackathon', {hackathon: res});
            }    
        });
    },
    'click .leave-hackathon' : function(e) {
        console.log(this);
        Meteor.call('leave_hackathon', this._id, function(err, res){
            if(err){
                // todo something
                console.error(err); 
            }
            if(res){
                // do nothing?
            }
            else {
                console.error('leaving hackathon failed');
            }
        });
    }
});

Template.index.events({
    'click #home-splash-join' : function(){
        var profile = {}

        Meteor.loginWithGithub({
            requestPermissions: ['user:email']
        }, function (err) {
            if (err) {
                Session.set('errorMessage', err.reason || 'Unknown error');
            }
            if(Meteor.user()) {
                profile = _.extend(profile, Meteor.user().profile);
                //Temporarily set contact info as email
                profile.contact = profile.email;
                Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile":profile}});

                var invite_title = Session.get("invite_title");
                var invite_code = Session.get("invite_code");
                if(invite_title && invite_code) {
                    Meteor.call('join_hackathon', invite_code, function(err, res) {
                        if(res) {
                            Router.go('hackathon', {_title: res});
                        }    
                    });
                } 
                else {
                    Router.go('home');
                }
            }
        });
    }
})

Template.nav.events({
    'click #join-link' : function(){
        var profile = {}

        Meteor.loginWithGithub({
            requestPermissions: ['user:email']
        }, function (err) {
            if (err) {
                Session.set('errorMessage', err.reason || 'Unknown error');
            }
            if(Meteor.user()) {
                profile = _.extend(profile, Meteor.user().profile);
                //Temporarily set contact info as email
                profile.contact = profile.email;
                Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile":profile}});

                var invite_title = Session.get("invite_title");
                var invite_code = Session.get("invite_code");
                if(invite_title && invite_code) {
                    Meteor.call('join_hackathon', invite_code, function(err, res) {
                        if(res) {
                            Router.go('hackathon', {_title: res});
                        }    
                    });
                } 
                else {
                    Router.go('home');
                }
            }
        });
    }
});

Template.signup.events({
    'submit #register-form': function(e, t){
       e.preventDefault();
       
       var userSkills = {
           design: e.target['user-skill-designer'].checked,
           frontend: e.target['user-skill-frontend'].checked,
           backend: e.target['user-skill-backend'].checked,
           ios: e.target['user-skill-ios'].checked,
           android: e.target['user-skill-android'].checked,
           hardware: e.target['user-skill-hardware'].checked,
       }

       var profile = {
           skills: userSkills
       }

       Meteor.loginWithGithub({
           requestPermissions: ['user:email']
       }, function (err) {
           if (err) {
             Session.set('errorMessage', err.reason || 'Unknown error');
           }
           if(Meteor.user()) {
               profile = _.extend(profile, Meteor.user().profile);
               //Temporarily set contact info as email
               profile.contact = profile.email;
               Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile":profile}});
           }
       });
       return false; 
    }
});

Template.joinHackathon.events({
    'submit #register-form' : function(e, t) {
        // TODO check if user, then do something else.

        e.preventDefault();
    
        var userSkills = {
            design: e.target['user-skill-designer'].checked,
            frontend: e.target['user-skill-frontend'].checked,
            backend: e.target['user-skill-backend'].checked,
            ios: e.target['user-skill-ios'].checked,
            android: e.target['user-skill-android'].checked,
            hardware: e.target['user-skill-hardware'].checked,
        }

        var profile = {
            skills: userSkills
        }

        Meteor.loginWithGithub({
            requestPermissions: ['user:email']
        }, function (err) {
            if (err) {
              Session.set('errorMessage', err.reason || 'Unknown error');
            }
            if(Meteor.user()) {
                profile = _.extend(profile, Meteor.user().profile);
                //Temporarily set contact info as email
                profile.contact = profile.email;
                Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile":profile}});
              
                var invite_title = Session.get("invite_title");
                var invite_code = Session.get("invite_code");
                if(invite_title && invite_code) {
                    Meteor.call('join_hackathon', invite_code, function(err, res) {
                        if(res) {
                            Router.go('hackathon', {_title: res});
                        }    
                    });
                } else {
                    Router.go('home');
                }
            }
        });


        /*
        Accounts.createUser(options, function(err){
          if (err) {
            console.error('no user created :(');
            alert('This email is already registered');
            // Inform the user that account creation failed
          } else {
            Router.go('home');
            // Success. Account has been created and the user
            // has logged in successfully. 
          }

        });
        */

        return false;
    }
});

// Template.login.events({
//     'submit #login-form' : function(e, t){
//         e.preventDefault();
//         // retrieve the input field values
//         var email = t.find('#login-email').value
//         , password = t.find('#login-password').value;

//         // Trim and validate your fields here.... 

//         // If validation passes, supply the appropriate fields to the
//         // Meteor.loginWithPassword() function.
//         Meteor.loginWithPassword(email, password, function(err){
//             if (err) {
//                 console.log(err);
//                 // The user might not have been found, or their passwword
//                 // could be incorrect. Inform the user that their
//                 // login attempt has failed. 
//             } 
//             else {
//                 Router.go('home');
//                 // The user has been logged in.
//             }
//         });
//         return false; 
//     }
// });

Template.idea_filter.events({ 
  'mousedown .filter': function () {
    if (Session.equals('idea_filter', this.filter)) {
        //Session.set('idea_filter', null);
    } else {
        Session.set('idea_filter', this.filter);
    }
  }
});