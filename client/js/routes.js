Router.configure({
    notFoundTemplate: 'notFound',
    layoutTemplate: 'layout',
    loadingTemplate: 'loading'
});

Router.onBeforeAction('loading');

Router.map(function() {
    this.route('index', {
        path: '/',
        layoutTemplate: '',
        onBeforeAction: function() {
            if (Meteor.user()) {
                Router.go('home');
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
        }
    });
    
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
            var hackathon = Session.get("current_hackathon");
            if(!hackathon) return;
            return Meteor.subscribe('users_and_hackathon', hackathon.title)
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
                if(!Session.get("current_hackathon")) {
                    Router.go('home'); 
                }
                else {
                    this.next();
                }
            }
        }
    });
    this.route('ideas', {
        path: '/:hackathon/ideas' , 
        template: 'hackathon',
        data: function() {
            var url_title = encodeURI(this.params.hackathon.toLowerCase().replace(/ /g, ''));
            var hackathon = Session.get("current_hackathon");
            if(!hackathon || hackathon.url_title != url_title) {
                hackathon = Hackathons.findOne({url_title: url_title});
                if(hackathon) {
                    Session.set("current_hackathon", hackathon);
                } 
            }

            //Check to see if actually an invite code not a hackathon
            var invite_code = this.params.hackathon;
            Meteor.call('hackathon_by_code', invite_code, function(err, title) {
                if(title) {
                    Session.set("invite_code", invite_code);
                    Router.go('home');
                }
            });

            return hackathon;
        },
        waitOn: function() { 
            return Meteor.subscribe('hackathon_and_ideas', this.params.hackathon)
        },
        yieldTemplates: {
            'hackathon_nav': {to: 'nav'}
        },
        onBeforeAction: function () {
            if (!Meteor.user()) {// TODO OR NOT A MEMBER OF hackathon
                Router.go(this.params.hackathon+'/join');
            } 
            else {
                this.next();
            }
        }
    });
    this.route('create_idea', {
        path: '/:hackathon/ideas/new' , 
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
    this.route('index_hackathon', {
        path: '/:hackathon/join',
        data: function() { 
            // todo get number of hackers at the hackathon
            return { 'name': this.params.hackathon }
        },
        onBeforeAction: function () {
            if (Meteor.user()) {
                // todo if member of hackathon go to the hackathon instead
                Router.go('home');
            } else {
                this.next();
            }
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
    this.route('profile', {
        path: '/profile',
        data: function() { 
            var user = Meteor.user(); 
            if(user) {
                user['title'] = 'profile';
            }
            return user;
        },
        waitOn: function() { return Meteor.subscribe('one_users_ideas', this.params._username)},
        onBeforeAction: function() {
            if (!Meteor.user()){
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
    this.route('settings', {
        path: '/settings',
        data: function() { 
            var user = Meteor.user(); 
            if(user) {
                user['title'] = 'settings';
            } else {
                user = {};
            }
            var hackathon = Session.get("current_hackathon");
            if(hackathon) {
                user.override_title = hackathon.title;
                user.override_title_url = '/' + hackathon.url_title;
            }
            return user;
        },
        waitOn: function() { return Meteor.subscribe('user', this.params._username)},
        onBeforeAction: function() {
            if (!Meteor.user()){
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
        waitOn: function() { return Meteor.subscribe('user_and_ideas', this.params._username)}
    });
    this.route('home', {
        path: '/home',
        data: function() {
            var x = {};
            x.title = '';
            x.hackathons = Hackathons.find({}).fetch();
            return x;
        },
        waitOn: function() { return Meteor.subscribe('myHackathons', this.userId)},
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
    this.route('signup', {
        path: '/signup', 
        data: function() {
            var invite_code = Session.get("invite_code");
            Meteor.call('hackathon_by_code', invite_code, function(err, title) {
                Session.set("invite_title", title);
            });
            var title = Session.get("invite_title");
            return  { title: title };
        },
        onBeforeAction: function () {
            if (Meteor.user()) {
                Router.go('home');
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
            var hackathon = Session.get("current_hackathon");
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
    // THIS HAS TO BE THE LAST ROUTE
    this.route('hackathon', {
        path: '/:hackathon', 
        data: function() {
            var url_title = encodeURI(this.params.hackathon.toLowerCase().replace(/ /g, ''));
            var hackathon = Session.get("current_hackathon");
            if(!hackathon || hackathon.url_title != url_title) {
                hackathon = Hackathons.findOne({url_title: url_title});
                if(hackathon) {
                    Session.set("current_hackathon", hackathon);
                } 
            }

            //Check to see if actually an invite code not a hackathon
            var invite_code = this.params.hackathon;
            Meteor.call('hackathon_by_code', invite_code, function(err, title) {
                if(title) {
                    Session.set("invite_code", invite_code);
                    Router.go('home');
                }
            });

            return hackathon;
        },
        waitOn: function() { 
            return Meteor.subscribe('hackathon_and_ideas', this.params.hackathon)
        },
        yieldTemplates: {
            'hackathon_nav': {to: 'nav'}
        },
        onBeforeAction: function () {
            if (!Meteor.user()) {// TODO OR NOT A MEMBER OF hackathon
                Router.go(this.params.hackathon+'/join');
            } 
            else {
                this.next();
            }
        }
    });
});
