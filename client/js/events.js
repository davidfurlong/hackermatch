Template.profile_sidebar_contents.events({
    'click .message-user': function(e,t){
        console.log(this);
        Session.set('selectedConversation', this._id);
        Router.go('/messages');
    }
});

Template.sidebar.events({
    'click #sidebar-exit': function(e){
        globals.hideSidebar();
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

            Meteor.call('create_comment', comment, function(err, res){
                if(err) console.error(err);
            });
        }
    }
});
Template.ideaPage.events({
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

            Meteor.call('create_comment', comment, function(err, res){
                if(err) console.error(err);
            });  
        }
    }
});

Template.messages.events({
    'keydown #messages-write': function(e){
        if(e.which == 13 && !e.shiftKey){
            e.preventDefault;
            // create message
            Meteor.call('sendMessage', Session.get('selectedConversation'), $(e.target).val());
            $(e.target).val("");
        }
    },
    'keydown #messages-search': function(e){
        if(e.which == 13 && !e.shiftKey){
            e.preventDefault;
            // create message
        }
    },
    'click .conversation-tab': function(e){
        if(this.convoPartner)
            Session.set('selectedConversation', this.convoPartner._id);
    }
});

Template.profile_contents.events({
    'click .message-user': function(e){
        console.log(this);
        console.log(e);
        Session.set('selectedConversation', this._id);
        Router.go('/messages');
    }
});

Template.layout.events({
    'click #full-page-fade': function(e){
        globals.hideSidebar();
    }
})

Template.ideaRow.events({
    // open idea in sidebar
    'click li.item-text' : function(e, t) {
        e.preventDefault();
        Session.set("selectedIdea", this._id);
        $('#full-page-fade').addClass('show');
    },
    // toggle heart action
    'click li.item-heart' : function(e, t) {
        e.preventDefault();
        Meteor.call('heart_idea', this._id, function(err, res) {});
    },
    'click li.item-icon' : function(e, t) {
        e.preventDefault();
        Session.set("selectedProfile", this.userId);
        $('#full-page-fade').addClass('show');
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
            'date': e.target['hackathon-date'].value,
            'open': false
        }
        hackathon.title = hackathon.title.replace('/', '&#47;');
        Meteor.call('create_hackathon', hackathon, isOrganizer, function(err, res) {
            if(err)
                console.error(err);
            else {
                Router.go('/');
            }
        });
    }
});

Template.person_filter.events({ 
    'mousedown .filter': function () {
        if (Session.equals('team_filter', this.filter)) {
        //Session.set('idea_filter', null);
        } 
        else {
            Session.set('team_filter', this.filter);
        }
    }
});

Template.createIdea.events({
    'submit #create-idea': function(e, t){
        e.preventDefault();
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
        
        var hackathonUrl= Session.get("currentHackathon");
        var hackathon = Hackathons.findOne({url_title: hackathonUrl});
        var prof = _.pick(Meteor.user().profile, "login", "avatar_url", "name");
        var idea = {
            name: ideaName,
            description: ideaDescription,
            user_id: Meteor.userId(),
            hackathon_id: hackathon._id,
            time_created: new Date().getTime(),
            time_lastupdated: new Date().getTime(),
            user_profile: prof,
            skills: ideaSkillsNeeded,
            comments: {}
        };

        Meteor.call('create_idea', idea, function(err, res) {
            if(err){
                // TODO notify user of error
                console.log(error);
            }
            else {
                Router.go('/' + hackathon.url_title);
            }
        });    
    }
});

Template.settings.events({
    'click .delete-language': function(e, t){
        var removed = $(e.currentTarget).parent().prev().attr('name');
        // $(e.currentTarget).closest('.specialization').remove();
        // console.log($(e.currentTarget).closest('.specialization'));
        var langs = $('.language').toArray().filter(function(el){
            return $(el).attr('name') != removed;
        });
        langs = langs.map(function(el){
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
        Meteor.call('leave_hackathon', this._id, function(err, res){
            if(err){
                console.error(err); 
            }
        });
    }
});

Template.index.events({
    'click #home-splash-join' : function(){
        var profile = {}

        Meteor.loginWithGithub({
            requestPermissions: ['user:email'],
            loginStyle: "redirect"
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
    'click #notifications-trigger' : function(){
        Meteor.call('read_notifications', function(err, res){
            if(err)
                console.error(err);
        });
    },
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


Template.person_filter.events({ 
    'click .filter': function () {
        var skills = Session.get("selectedSkills");
        var skill = this.name;

        if(_.contains(skills, skill)) {
            Session.set("selectedSkills", _.without(skills, skill));
        } else {
            skills.push(skill);
            Session.set("selectedSkills", skills);
        }
  }
});



