hackathonAuth = function() {
    if(Meteor.loggingIn()) {
        this.render('loading');
    } else {
        var user = Meteor.user();
        if(!user) {
            Router.go('signup');
        }
        if(Roles.userIsInRole(user, ['hacker', 'organizer', 'admin'], this.params.hackathon)) {
            document.cookie = 'most_recent_hackathon='+this.params.hackathon;
            Session.set("currentHackathon", this.params.hackathon);
            this.next();
        } 
        else { // todo check is a hackathon first
            Session.set("currentHackathon", null);
            //Router.go('/'+this.params.hackathon+'/join');
            Router.go('/settings');
        }
    }
}

hackathonAdminAuth = function() {
    if(Meteor.loggingIn()) {
        this.render('loading');
    } else {
        var user = Meteor.user();
        if(!user) {
            Router.go('signup');
        }
        if(Roles.userIsInRole(user, ['creator', 'organizer', 'admin'], this.params.hackathon)) {
            document.cookie = 'most_recent_hackathon='+this.params.hackathon;
            Session.set("currentHackathon", this.params.hackathon);
            this.next();
        } 
        else { // todo check is a hackathon first
            Router.go('/');
        }
    }
}

userAuth = function() {
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

Router.configure({
    notFoundTemplate: 'error',
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    trackPageView: true
});

Router.onBeforeAction('loading');

Router.map(function() {
    this.route('home', {
        path: '/',
        template: 'index',
        layoutTemplate: '',
        onBeforeAction: function () {
            // Session.set("current_hackathon", null);
            if (!Meteor.user()) {
                this.next();
            } 
            else {
                var c = Cookie.get('most_recent_hackathon');
                if(c){
                    Router.go('/'+c)
                }
                else {
                    Router.go('/settings')
                }
                this.next();
            }

        }
    });
    this.route('create_hackathon', {
        path: '/create',
        onBeforeAction: userAuth
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
        path: '/:hackathon/hackers', 
        yieldTemplates: {
            'hackathon_nav': {to: 'nav'}
        },
        onBeforeAction: hackathonAuth
    });
    this.route('hackathonAdmin', {
        path: '/:hackathon/admin',
        yieldTemplates: {
            'hackathon_nav': {to: 'nav'}
        },
        onBeforeAction: hackathonAdminAuth
    })
    this.route('messages', {
        path: '/messages',
        onBeforeAction: userAuth,
        waitOn: function(){
            return Meteor.subscribe("users_essentials");
        }
    });
    this.route('messagesThread', {
        path: '/messages/:_username',
        template: 'messages',
        onBeforeAction: function(){
            var uid = Meteor.users.findOne({"profile.login": this.params._username});
            Session.set("selectedConversation",uid._id);
            userAuth.call(this);
        },
        waitOn: function(){
            return Meteor.subscribe("users_essentials");
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
        onBeforeAction: hackathonAuth
    }); 
    // this.route('joinHackathon', {
    //     path: '/:hackathon/join',
    //     data: function() { 
    //         // todo non critical get number of hackers at the hackathon
    //         return { 
    //             'name': this.params.hackathon,
    //             'isNotUser':  Meteor.user() == null
    //         }
    //     },
    //     onBeforeAction: function () {
    //         // TODO if member of hackathon go to the hackathon instead
    //         var h = this.params.hackathon;
    //         Meteor.call('is_hackathon_open_join', h, function(err, hackathonOpen){
    //             if(hackathonOpen) {
    //                 this.next();
    //             }
    //             else {
    //                 Router.go('error', {title: "Hackathon requires invite or no such hackathon"});
    //             }  
    //         });
    //     }
    // });
    this.route('joinHackathonInvite', {
        path: '/:hackathon/join/:invite_code',
        template: 'joinHackathon',
        data: function(){
            return {
                'name': this.params.hackathon,
                'isNotUser':  Meteor.user() == null
            }
        },
        onBeforeAction: function(){
            // TODO non critical check if member of hackathon go to /:hackathon
            // Checks if valid invite code to a hackathon
            var user = Meteor.user();
            if(user){
                if(Roles.userIsInRole(user, ['hacker'], this.params.hackathon)) {
                    Router.go('/'+this.params.hackathon);
                } 
            }   
            var invite_code = this.params.invite_code;
            var h = this.params.hackathon;
            var that = this;
            Session.set("invite_title", h);
            Session.set("invite_code", invite_code);

            Meteor.call('hackathon_by_code', invite_code, h, function(err, hackathon) {
                if(hackathon) {
                    // that.next();
                    // TODO this is hacky
                    return;
                }
                else {
                    Router.go('error', {title: "Invalid invite code or no such hackathon"});
                }
            });
            this.next();
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
    this.route('settings', {
        path: '/settings',
        onBeforeAction: userAuth
    });
    this.route('profile', {
        path: '/profile/:_username',
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
        onBeforeAction: userAuth
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
        yieldTemplates: {
            'hackathon_nav': {to: 'nav'}
        },
        onBeforeAction: hackathonAuth,
        onAfterAction: function(){
            var h = Hackathons.findOne({url_title:this.params.hackathon});
            if(h){
                SEO.set({
                    title: 'Hackermatch | '+ h.title,
                    meta: {
                        'title': 'Hackermatch | '+ h.title,
                        'image': h.logo != "" ? h.logo : "http://hackermat.ch/logo.png",
                        'description': "Find "+h.title+" team mates by discussing ideas. For hackers, by hackers, with <3. Made in San Francisco"
                    },
                    og: {
                        'title': 'Hackermatch | '+ h.title,
                        'image': h.logo != "" ? h.logo : "http://hackermat.ch/logo.png",
                        'description': "Find "+h.title+" team mates by discussing ideas. For hackers, by hackers, with <3. Made in San Francisco",
                        'type': 'hackermatch:hackathon',
                        'url': 'http://hackermat.ch/'+h.url_title,
                        'site_name': 'Hackermatch'
                    }
                });
            }
        }
    });
});


