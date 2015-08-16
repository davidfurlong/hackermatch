Router.configure({
    notFoundTemplate: 'error',
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
                if(!Session.get("current_hackathon")) {
                    Router.go('home'); 
                }
                else {
                    this.next();
                }
            }
        }
    });
    this.route('idea', {
        path: '/ideas/:idea',
        template: 'idea_page',
        data: function(){
            Session.set("selectedIdea", this.params.idea);

            var idea = Ideas.findOne({_id: this.params.idea});
            console.log(idea);
            if(idea) {
                var author = Meteor.users.findOne({_id: idea.userId});
                var commentThread = Comments.find({ideaId: idea._id}).fetch();
                idea.author = author;
                idea.commentThread = commentThread;
                var heart = Hearts.findOne({ $and: [{idea_id: idea._id}, {user_id: Meteor.userId()}]});
                idea.hearted = heart && heart.hearted;
                return idea;
            }
            else
                Router.go('error', {title: 'Idea not found'});
        },
        waitOn: function(){
            return Meteor.subscribe('idea', this.params.idea)
        },
        onBeforeAction: function () {
            // TODO
            if (!Meteor.user()) {
                Router.go('signup');
            } 
            else {
                Session.set("selectedIdea", this.params.idea);
                this.next();
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
            } 
            else {
                this.next();
            }
        }
    });
    this.route('settings', {
        path: '/settings',
        data: function() { 
            var user = Meteor.user();
            return user;
        },
        waitOn: function() { return Meteor.subscribe('user', this.params._username)},
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
        yieldTemplates: {
            'hackathon_nav': {to: 'nav'}
        },
        waitOn: function() { 
            return Meteor.subscribe('hackathon_and_ideas', this.params.hackathon)
        },
        onBeforeAction: function () {
            // todo check is a hackathon
            if (!Meteor.user()) {
                Router.go('joinHackathon', { hackathon: this.params.hackathon});
            } 
            else { // TODO OR NOT A MEMBER OF hackathon
                var user = Meteor.user();
                console.log(user);
                if(true){
                    this.next();
                }
                else {
                  this.next();  
                }
            }
        }
    });
});
