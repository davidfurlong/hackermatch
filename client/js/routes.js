Router.configure({
//    notFoundTemplate: 'error',
    layoutTemplate: 'layout',
    loadingTemplate: 'loading'
});

Router.onBeforeAction('loading');

Router.map(function() {
    this.route('home', {
        path: '/',
        // data: function() {
        //     var x = {};
        //     x.title = '';
        //     x.hackathons = Hackathons.find({}).fetch();
        //     return x;
        // },
        // waitOn: function() { return Meteor.subscribe('myHackathons', this.userId)},
        onBeforeAction: function () {
            // Session.set("current_hackathon", null);
            if (!Meteor.user()) {
              if (Meteor.loggingIn()) {
                    this.next();
              }
              else{
                Router.go('signup');
              }
            } else {
                this.next();
            }

        }
    });
    this.route('create_hackathon', {
        path: '/create',
        onBeforeAction: function () {
            if (!Meteor.user()) {
                if (Meteor.loggingIn()) {
                } 
                else {
                Router.go('signup');
                }
            }
            else {
                this.next();
            }
        }
    });
    this.route('logout', function(){
        var self = this;
        Meteor.logout(function(err){
          if(err){
            console.log('Error Logging out: '+ err);
          }
          self.redirect('/');
        });
    })
    this.route('hackers', {
        path: '/:hackathon/hackers' , 
        data: function() {
            var hackathon = this.params.hackathon;
            if(hackathon) {
                hackathon.override_title = hackathon.title;
                hackathon.override_title_url = '/' + hackathon.url_title;
            }
            return hackathon;
        },
        waitOn: function() { 
            return Meteor.subscribe('users_and_hackathon', this.params.hackathon)
        },
        yieldTemplates: {
            'hackathon_nav': {to: 'nav'}
        },
        onBeforeAction: function () {
            if (!Meteor.user()) {
                if (Meteor.loggingIn()) {
                }
                else {
                    Router.go('signup');
                }
            } 
            else {
                if(!Session.get("currentHackathon")) {
                    Router.go('/'); 
                }
                else {
                    // TODO check is members of hackathon
                    this.next();
                }
            }
        }
    });
    this.route('idea', {
        path: '/idea/:_id',
        data: function() {
            Session.set('selectedIdea', this.params._id);
        },
        template: 'ideaPage'
    });
    this.route('create_idea', {
        path: '/:hackathon/new' , 
        data: function() {
            var hackathon = this.params.hackathon;
            if(hackathon) {
                hackathon.override_title = hackathon;
                hackathon.override_title_url = '/' + hackathon;
            }
            return hackathon;
        },
        yieldTemplates: {
          'hackathon_nav': {to: 'nav'}
        },
        onBeforeAction: function () {
            if (!Meteor.user()) {
                if (Meteor.loggingIn()) {
                    this.next();
                } 
                else {
                    Router.go('signup');
                }
            }
            else {
                this.next();  
            }   
        }
    }); 
    this.route('joinHackathon', {
        path: '/:hackathon/join',
        data: function() { 
            // todo non critical get number of hackers at the hackathon
            return { 
                'name': this.params.hackathon,
                'isNotUser':  Meteor.user() == null
            }
        },
        onBeforeAction: function () {
            // TODO if member of hackathon go to the hackathon instead
            var h = this.params.hackathon;
            Meteor.call('is_hackathon_open_join', h, function(err, hackathonOpen){
                if(hackathonOpen) {
                    this.next();
                }
                else {
                    Router.go('error', {title: "Hackathon requires invite or no such hackathon"});
                }  
            });
        }
    });
    this.route('joinHackathonInvite', {
        path: '/:hackathon/join/:invite_code',
        data: function(){
            return {
                'name': this.params.hackathon,
                'isNotUser':  Meteor.user() == null
            }
        },
        onBeforeAction: function(){
            // TODO non critical check if member of hackathon go to /:hackathon
            // Checks if valid invite code to a hackathon
            var invite_code = this.params.invite_code;
            var h = this.params.hackathon;
            Meteor.call('hackathon_by_code', invite_code, h, function(err, hackathon) {
                if(hackathon) {
                    this.next();
                }
                else {
                    Router.go('error', {title: "Invalid invite code or no such hackathon"});
                }
            });
        }
    });
    this.route('alerts', {
        path: '/alerts' , 
        data: function() {
            return {};
        }
    });
    this.route('about', {
        path: '/about'
    });
//     this.route('profile', {
//         path: '/profile',
//         data: function() { 
//             var user = Meteor.user(); 
//             if(user) {
//                 user['title'] = 'profile';
//             }
//             return user;
//         },
//         waitOn: function() { return Meteor.subscribe('one_users_ideas', this.params._username)},
//         onBeforeAction: function() {
//             if (!Meteor.user()){
//                 if (Meteor.loggingIn()) {
//                     this.next();
//                     //TODO render logging in template
//                 }
//                 else{
//                   Router.go('signup');
//                 }
//             } 
//             else {
//                 var user = Meteor.user();
//                 var username = user.profile.login;
//                 Router.go("/profile/" + username);
// //                this.next();
//             }
//         }
//     });
    this.route('settings', {
        path: '/settings',
        onBeforeAction: function() {
            if (!Meteor.user()){
                if (Meteor.loggingIn()) {
                    this.next();
                }
                else {
                  Router.go('signup');
                }
            } 
            else {
                this.next();
            }
        }
    });
    this.route('profileOther', {
        path: '/profile/:_username',
        template: 'profile',
        data: function() { 
            var user = Meteor.users.findOne({'services.github.username': this.params._username}); 
            if(user) {
                user['title'] = this.params._username;
            }
            return user;
        },
        waitOn: function() { 
            return [ Meteor.subscribe('user', this.params._username), Meteor.subscribe('one_users_ideas', this.params._username) ]
        }
    });
    this.route('signup', {
        path: '/signup', 
        onBeforeAction: function () {
            if (Meteor.user()) {
                Router.go('/');
            } else {
                this.next();
            }
        }
    });
    this.route('admin', {
        path: '/admin', 
        data: function() {
            var obj = {
                title: 'admin',
                hackathons: Hackathons.find({}).fetch()
            };
            var hackathonUrl= Session.get("currentHackathon");
            var hackathon = Hackathons.findOne({url_title: hackathonUrl});
            if(hackathon) {
                obj.override_title = hackathon.title;
                obj.override_title_url = '/' + hackathon.url_title;
            }
            return obj;
        },
        waitOn: function() { return Meteor.subscribe('hackathons', this.userId)},
        onBeforeAction: function () {
            // Session.set("current_hackathon", null);
            if (!Meteor.user()) {
              if (Meteor.loggingIn()) {
                this.next();
              }
              else{
                Router.go('signup');
              }
            } else {
                this.next();
            }
        }
    });
    this.route('error', {
        path: '/error/:title',
        data: function(){
            var title = this.params.title;
            var o = {
                message: title || "Unknown error occurred"
            }
            return o;
        }
    });
    this.route('hackathon', { // THIS HAS TO BE THE LAST ROUTE
        path: '/:hackathon', 
        /*
        data: function() {
            var url_title = encodeURI(this.params.hackathon.toLowerCase().replace(/ /g, ''));
            var hackathon = Session.get("current_hackathon");
            if(!hackathon || hackathon.url_title != url_title) {
                hackathon = Hackathons.findOne({url_title: url_title});
                if(hackathon) {
                    Session.set("current_hackathon", hackathon);
                } 
            }

            return hackathon;
        },
        */
        yieldTemplates: {
            'hackathon_nav': {to: 'nav'}
        },
        /*
        waitOn: function() { 
            return Meteor.subscribe('hackathon_and_ideas', this.params.hackathon)
        },
        */
        onBeforeAction: function () {
            if (!Meteor.user() && !Meteor.loggingIn()) {// TODO OR NOT A MEMBER OF hackathon
                Router.go(this.params.hackathon+'/join');
            } 
            else {
                Session.set("currentHackathon", this.params.hackathon);
                this.next();
            }
        }
    });
});
