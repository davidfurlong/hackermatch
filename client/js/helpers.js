/* START HANDLEBARS HELPERS */

Handlebars.registerHelper('addIndex', function (all) {
    return _.map(all, function(val, index) {
        return {index: index, value: val};
    });
});

Handlebars.registerHelper('currentUser', function(){
    return Meteor.user();
});

Handlebars.registerHelper('addFieldToRay', function(ray, field, fieldname){
    if(!ray)
        return []
    return ray.map(function(el){
        var t = el;
        t[fieldname] = field;
        return t;
    })
});

Handlebars.registerHelper('equalsCurrentUsername', function(name){
    return Meteor.user().profile.login == name;
})

Handlebars.registerHelper('equals', function(a,b){
    return a == b;
});

Handlebars.registerHelper('sortNotifications', function(notifications){
    return _.sortBy(notifications, function(notification){
        return -notification.timestamp;
    });
});

Handlebars.registerHelper('lenUnread', function(notifications){
    var x = _.filter(notifications, function(notification){
        return !notification.read;
    });
    return x.length;
});

Handlebars.registerHelper('hasUnread', function(notifications){
    var x = _.filter(notifications, function(notification){
        return !notification.read;
    });
    return x.length != 0;
});

Handlebars.registerHelper('parseNotification', function (notification) {
    switch(notification.details.type){
        case "welcome":
            return "Welcome to hackermatch! Let us know if you have any problems at david@furlo.ng";
            break;
        case "hearted":
            return "<a href='/profile/"+notification.details.by+"'>"+notification.details.by+"</a> hearted your idea <a href='/idea/"+notification.details.idea_id+"'>"+notification.details.idea_name+"</a>.";
            break;
        case "comment":
            return "<a href='/profile/"+notification.details.by+"'>"+notification.details.by+"</a> commented on <a href='/idea/"+notification.details.idea_id+"'>"+notification.details.idea_name+"</a>."; 
            break;
        case "message":
            return "<a href='/messages/"+notification.details.from+"'>"+notification.details.from+" just sent you a message</a>"
            break;
    }
    return "Something went wrong";
});

Handlebars.registerHelper('shorten', function(text, maxlength){
    if(!text) return "";  
    if(text.length > maxlength){
        var shortened = text.substring(0,maxlength);
        var l = shortened.lastIndexOf(" ");
        return shortened.substring(0,l)+"...";
    }
    else {
        return text;
    }
});


Handlebars.registerHelper('isChecked', function(bool){
    return (bool == true ? 'checked' : '');
});

Handlebars.registerHelper('selected_hackathon',function(){
    var hackathonUrl= Session.get("currentHackathon");
    var hackathon = Hackathons.findOne({url_title: hackathonUrl});
    return hackathon;
});

Handlebars.registerHelper('isAdmin', function(){ // OF A HACKATHON
    var hackathonUrl = Session.get("currentHackathon");
    return Roles.userIsInRole(Meteor.user(), ['creator', 'organizer', 'admin'], hackathonUrl);
});

Handlebars.registerHelper('pageTitle',function(){
    return pageTitle(); 
});

Handlebars.registerHelper('pageUrl',function(){
    return pageUrl(); 
});

Handlebars.registerHelper('has', function(ray){
    return ray.length > 0;
})

Handlebars.registerHelper('len',function(ray){
    if(typeof ray == "object")
        return ray.length;
    else if(typeof ray == "object")
        return 1;
    else 
        return ray;
});

Handlebars.registerHelper('bitmaparray',function(obj){
    result = [];
    for (var key in obj) {
        if(obj[key])
            result.push(key);
    }
    return result;
});

Handlebars.registerHelper('anyTrue', function(obj){
    for(a in obj){
        if(obj[a])
            return true;
    }
    return false;
});

Handlebars.registerHelper('getName', function(obj){
    return obj['name'];
});

Handlebars.registerHelper('toMoment', function(time){
    return moment(time).fromNow();
});

Handlebars.registerHelper('reverse', function(ray){
    if(ray != undefined)
        return ray.reverse();
    return [];
});

Handlebars.registerHelper('positive', function(num){
    return num > 0
});

Handlebars.registerHelper('arrayify', function(obj){
    var ray = [];
    for(var a in obj){
        ray.push(a);
    }
    return ray;
});

Handlebars.registerHelper('sortandarrayify',function(obj){
    var result = [];
    //console.log(obj);
    for (var key in obj) {
        result.push(obj[key]);
    }
    result.sort(function(a,b){
        return b.count - a.count;
    });
    
    return result;
});
/* END HANDLEBARS HELPERS */

/* START GLOBAL VARS */
var SkillFilters = [
    {name: 'frontend'}, 
    {name: 'backend'},
    {name: 'mobile'}, 
    {name: 'design'}, 
    {name: 'ios'},
    {name: 'android'},
    {name: 'hardware'}
];

var TeamFilters = { // TODO ADAM
    'All': function(){
        return Meteor.users.find({}, {limit: Session.get('hackersLimit')});
    },
    // 'All': function() {
    //     var hackathon = Session.get("current_hackathon");
    //     if(!hackathon) return;
    //     var x = Meteor.users().find().fetch();
    //     return x;
    // },
    // 'Looking for more members': function() {
    //     var hackathon = Session.get("current_hackathon");
    //     if(!hackathon) return;
    //     var x = Meteor.users().find().fetch();
    //     return x;
    // },
    // 'Looking for a team': function() {
    //     var hackathon = Session.get("current_hackathon");
    //     if(!hackathon) return;
    //     var x = Meteor.users().find().fetch();
    //     return x;
    // }   
}

var IdeaFilters = {
    'Hearted': function() {
        var hackathonUrl= Session.get("currentHackathon");
        var hackathon = Hackathons.findOne({url_title: hackathonUrl});
        if(!hackathon) return;
        var x = Ideas.find({hackathon_id: hackathon._id}).fetch();
        x = _.filter(x, function(idea) {
            var heart = Hearts.findOne({ $and: [{idea_id: idea._id}, {user_id: Meteor.userId()}]});
            if(heart && heart.hearted) {
                //Only added this to idea list that template receives, such that it's a local change only
                idea.hearted = true;
            } else {
                idea.hearted = false;
            }
            idea.commentCount = Comments.find({ideaId: idea._id}).fetch().length;
            return idea.hearted;
        });
        return x;
    },
    'Needs your skills' : function() {  
        var skills = Meteor.user().profile.skills;
        var skillArray = [];
        for(var key in skills) {
            if(skills[key] == true) {
                var attr = "skills." + key;
                var skill_pair = {};
                skill_pair[attr] = true;
                skill_pair["userId"] = { $ne: Meteor.userId()};
                skillArray.push(skill_pair);
            }
        }

        if(skillArray.length == 0) {
            return [];
        }
        var hackathonUrl= Session.get("currentHackathon");
        var hackathon = Hackathons.findOne({url_title: hackathonUrl});
        if(!hackathon) return;
        var x = Ideas.find({
            $and: [
                {hackathon_id: hackathon._id},
                {$or: skillArray}
            ]
        }).fetch();
        return x;
    },
    'All' : function() { // recent
        var hackathonUrl= Session.get("currentHackathon");
        var hackathon = Hackathons.findOne({url_title: hackathonUrl});
        if(!hackathon) return;
        var x = Ideas.find({hackathon_id: hackathon._id}, {limit: Session.get("ideaLimit")}).fetch();
        return x;
    },
    'Yours': function() {
        var hackathonUrl= Session.get("currentHackathon");
        var hackathon = Hackathons.findOne({url_title: hackathonUrl});
        if(!hackathon) return;
        var x = Ideas.find({ $and: [{hackathon_id: hackathon._id}, {userId: Meteor.userId()}]}).fetch();
        return x;
    }
};
/* END GLOBAL VARS */

Template.person_filter.helpers({
    filters: function(){
        var filter_info = [];
        var total_count = 0;                                                                                 
        return SkillFilters;

        /*
        _.each(SkillFilters, function (key, value) {
            filter_info.push({filter: value, count: key().length});
        });

        filter_info = _.sortBy(filter_info, function (x) { return x.filter; });
        return filter_info;
        */
    },
    selected: function(){
        var skills = Session.get("selectedSkills");
        var skill = this.name;
        if(_.contains(skills, skill)) {
            return 'selected' 
        } else { 
            return '';
        }
    }
})

Template.idea_filter.helpers({
    filters: function(){
        var filter_info = [];
        var total_count = 0;    
        
        _.each(IdeaFilters, function (key, value) {
            filter_info.push({filter: value, count: key().length});
        });                                                    

        filter_info = _.sortBy(filter_info, function (x) { return x.filter; });
        return filter_info;
    },
    filter_text: function(){
       return this.filter; 
    },
    selected: function(){
        return Session.equals('idea_filter', this.filter) ? 'selected' : '';  
    }
})

// Used to check whether profile is done loading yet
Template.profile.helpers({
    has_github_profile: function(){
        if(this.profile) {
            return true
        }
    }
});

Template.profile_sidebar_contents.created = function(){
    this.userProfile = Meteor.subscribe('user_profile', Session.get("selectedProfile"));
}

Template.profile_sidebar_contents.destroyed = function(){
    globals.hideSidebar();
    this.userProfile.stop();
}

Template.profile_sidebar_contents.helpers({
    dataReady: function(){
        return Template.instance().userProfile.ready()
    },
    profile: function(){
        var profile = Meteor.users.findOne({_id:Session.get("selectedProfile")}); 
        _.extend(profile.profile, {_id: profile._id});
        if(profile){
           return profile['profile']
        }
    }
});

Template.profile_sidebar.helpers({
    opened: function(){
        var profileSelected = Session.get("selectedProfile");
        if(!profileSelected || profileSelected == "") {
            return false;
        } 
        else {
            Session.set('profile_sidebarOpened', 'open');
            return true;
        }
    }
});

Template.index.rendered = function(){
    $('body').addClass('landing');
}

Template.index.destroyed = function(){
    $('body').removeClass('landing');
}

Template.profile_contents.created = function(){
    this.userRepos = Meteor.subscribe('user_repos', this._id);
}

Template.profile_contents.destroyed = function(){
    this.userRepos.stop();
}

Template.profile_contents.helpers({
    dataReady: function(){
        return Template.instance().userRepos.ready()
    },
    hackathons: function() {
        if(this)
            return this.roles;
    },
    name: function() {
        if(this.profile) {
            return this.profile.name;
        }
    },
    contact: function() {
        if(this.profile) {
            return this.profile.contact;
        }
    },
    github: function() {
        if(this.profile) {
            return this.profile.login;
        }
    },
    avatar_url: function(){
        if(this.profile) {
            return this.profile.avatar_url;
        }
    },
    github_url: function(){
        if(this.profile) {
            return this.profile.html_url;
        }
    },
    location: function(){
        if(this.profile) {
            return this.profile.location;
        }
    },
    bio: function(){
        if(this.profile) {
            return this.profile.bio;
        }
    },
    skills: function(){
        if(this.profile) {
            return this.profile.skills;
        }
    },
    featured: function(){
        if(this.profile) {
            var repos = UserRepos.findOne({userId: this._id}) || [];

            function sortfunction(a, b){
                if(a.stargazers_count == b.stargazers_count)
                    return b.commits.length - a.commits.length
                else 
                    return b.stargazers_count - a.stargazers_count
            }
            repos.sort(sortfunction);
            var self = this;
            repos = repos.filter(function(repo){
                var contributor = false;
                for(var i = 0; i < repo.collaborators.length; i++){
                    if(repo.collaborators[i].f_login == self.profile.login)
                        contributor = true;
                }
                return (repo.contributions != 0 && contributor)
            });
            return repos;
        }
    },
    collaborators: function(){
        if(this.profile) {
            var repos = UserRepos.findOne({userId: this._id}) || [];
            var collaborators = {};
            for(var i = 0; i < repos.length; i++){
                var hasAccess = false;
                var temp = [];
                var repo = repos[i];
                for(var j = 0; j < repo.collaborators.length; j++){
                    if(repo.contributions != 0 && repo.collaborators[j].f_login != this.profile.login)
                        temp.push(repo.collaborators[j]);
                    if(repo.collaborators[j].f_login == this.profile.login)
                        hasAccess = true;
                }
                if(hasAccess){
                    for(var k = 0; k < temp.length; k ++){
                        if(collaborators[temp[k].f_login] != undefined){
                            collaborators[temp[k].f_login].count ++;
                        }
                        else {
                            collaborators[temp[k].f_login] = temp[k];
                            collaborators[temp[k].f_login].count = 1;
                        }
                    }
                }
            }
        }
        return collaborators;
    },
    dateGraph: function(){
        if(this.profile) {
           //console.log('rendered');
            var repos = UserRepos.findOne({userId: this._id}) || [];

            function contributedTo(repo){
                return (repo.commits.length > 0)
            }
            var dateFiltered = repos.filter(contributedTo);
            var datasets = [];
            for(var i=0;i<dateFiltered.length;i++){
                var c = dateFiltered[i];
                var byMonth = [0,0,0,0,0,0,0,0,0,0,0,0];
                for(var j=0;j<c.commits.length;j++){
                    var d = new Date(c.commits[j]).getMonth();
                    if(d < 8)
                        byMonth[d] += 1;
                }
                var color = '#'+ ('000000' + (Math.random()*0xFFFFFF<<0).toString(16)).slice(-6);
                var t = {
                    title: c.name,
                    label: c.name,
                    url: c.html_url,
                    bio: c.description,
                    fillColor : "rgba(256,256,256,0.3)",
                    strokeColor : color,
                    pointColor : color,
                    pointStrokeColor : "#fff",
                    pointHighlightFill : "#fff",
                    pointHighlightStroke : color, 
                    data : byMonth
                };
                datasets.push(t);
            }
            
           var lineChartData = {
            labels : ["January","February","March","April","May","June","July", "August"],
            datasets : datasets
           }
           window.lineChartData = lineChartData;

           if(document.readyState == "complete")
            window.setTimeout(function(){renderChart()}, 1000);       
        }
    },
    languages: function(){ 
        if(this.profile && !this.profile.languages) { // Only runs the first time
            var repos = UserRepos.findOne({userId: this._id}) || [];
            var languages = [];
             
            for(var i=0;i<repos.length;i++){
                var t = JSON.parse(repos[i].languages);

                for(var a in t){
                    languages.push(t[a]);
                }
            }

            languages = languages.reduce(function(p, c) {
                if (p.indexOf(c) < 0) p.push(c);
                return p;
            }, []);
            // TODO test this works

            updated_profile = _.extend(Meteor.user().profile, languages);
               
            // Trim and validate the input
            Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile":updated_profile}});

            Meteor.call('attach_ideas', Meteor.user()._id);
            Meteor.call('update_ideas', Meteor.user()._id);
          
            //HACK not sure what this was supposed to do, but was giving me an error 
            return languages;
        }
        else if(this.profile.languages) {
            return this.profile.languages;
        }
    },
    myIdeas: function(){
        return Ideas.find({'github_username': this.profile.login}).fetch();
    }
});

Template.person_list.helpers({
    people: function(){

        var query = {};       

        var filters = Session.get("selectedSkills");
        if(filters && filters.length) {
            _.each(filters, function(filter) {

                query["profile.skills." + filter] = true;
            });
        }
        //TODO add filter on how many users 
        return Meteor.users.find(query, {limit: Session.get('hackersLimit')});

    /*
        var hackathonUrl= Session.get("currentHackathon");
        var hackathon = Hackathons.findOne({url_title: hackathonUrl});
        if(!hackathon) return;
        var filter = Session.get("team_filter");

        if(!filter) {
            filter = 'All';
            Session.set('team_filter', filter);
        }
        var x = [];

        //Get Idea based off filter type
        x = TeamFilters[filter]();
        
        // x = _.sortBy(x, function (x) { return -x.hearts; });
        //Heart and add comment counts to ideas
        // _.each(x, function(idea) {
            
        // });
        return x;
        */
    }
});

incrementHackersLimit = function() {
    var newHackersLimit = Session.get('hackersLimit') + 20;
    //    console.log("newHackersLimit " + newHackersLimit);
    Session.set('hackersLimit', newHackersLimit);
}

Template.hackers.created = function() {
    var hackathonId = Router.current().params.hackathon;

    Session.set("selectedSkills", []);
    Session.set("hackersLimit", 20);

    Deps.autorun(function() {
        Meteor.subscribe('users_and_hackathon', hackathonId, Session.get('selectedSkills'), Session.get('hackersLimit'));
    });
}

Template.hackers.rendered = function() {
  // is triggered every time we scroll
    $(window).scroll(function() {
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 20) {
            //console.log("large: " + ($(window).scrollTop() + $(window).height()));
            //console.log("small: " + ($(document).height() - 20));
            //timeout prevents this from being called too many times on a "continue scroll"
            Meteor.setTimeout(incrementHackersLimit, 100);
        }
    });
}
Template.hackers.helpers({
    dataReady: function() {
        return true;
    },
});
 
Template.messages.created = function(){
    this.myMessages = Meteor.subscribe('user_messages_and_profiles');
    this.newMessageUser = Meteor.subscribe('user_profile', Session.get('selectedConversation'));
}

Template.messages.destroyed = function(){
    this.myMessages.stop();
    this.newMessageUser.stop();
}

Template.messages.rendered = function(){
    Meteor.typeahead.inject();
}

Template.messagesLeftbar.helpers({
    conversations: function(){
        var m = Messages.find({$or: [{user1: Meteor.userId()}, {user2: Meteor.userId()}] }).fetch();    
        var selectedPartner = Session.get('selectedConversation');
        var selectedFound = false;

        m = _.map(m, function(convo){
            var partner = convo.user1 == Meteor.userId() ? convo.user2 : convo.user1;
            var isSelected = partner == selectedPartner;
            if(isSelected) selectedFound = true;
            var convoPartner = Meteor.users.findOne({_id: partner });
            return _.extend(convo, {
                    convoPartner: convoPartner, 
                    isSelected: isSelected
                }
            );
        });

        m = _.sortBy(m, function(a){
            return -a.messages[a.messages.length-1].timestamp || 0;
        });

        // if new conversation link
        if(!selectedFound && selectedPartner){
            var temp = [];
            // todo doesn't work !!!!
            var convoPartner = Meteor.users.findOne({_id: selectedPartner });
            if(Meteor.userId() < selectedPartner){
              var user1 = Meteor.userId();
              var user2 = selectedPartner;
            }
            else {
              var user1 = selectedPartner;
              var user2 = Meteor.userId();
            }
            var newConvo = {
                convoPartner: convoPartner,
                isSelected: true,
                messages: [],
                user1: user1,
                user2: user2 
            }
            temp.push(newConvo);
            for(var i = 0;i<m.length;i++){
                temp.push(m[i]);
            }
            return temp;
        }
        return m;
    }
});

Template.messages.helpers({
    allUsers: function(){
        return Meteor.users.find({_id: {$not: Meteor.userId()}}).fetch().map(function(u){
            var t = u;
            t.value = u.profile.login;
            return t;
        });
    },
    searchElSelected: function(event, suggestion, datasetName) {
        Session.set("selectedConversation", suggestion._id);
    },
    dataReady: function(){
        return Template.instance().myMessages.ready() && Template.instance().newMessageUser.ready()
    },
    selectedConversation: function(){ // todo is this duplicating requests?
        var uidSelected = Session.get("selectedConversation");
        if(!uidSelected || uidSelected == "") {
            return null;
        }
        var thread = Messages.findOne({
            $or: [
                { $and: [{user1: Meteor.userId()}, {user2: uidSelected}]}, 
                { $and: [{user2: Meteor.userId()}, {user1: uidSelected}]}
            ]
        }) || {};
        var isUser1 = thread.user1 == Meteor.userId();
        var convoPartner = Meteor.users.findOne({_id: uidSelected});
        return _.extend(thread, {convoPartner: convoPartner, isUser1: isUser1});

        // todo when this changes set scroll to bottom
    },
    isSelectedConversation: function(){
        var uidSelected = Session.get("selectedConversation");
        return !(!uidSelected || uidSelected == "")
    }
});

Template.myHackathonList.created = function() {
    this.myHackathons = Meteor.subscribe('myHackathons');
}
Template.myHackathonList.destroyed = function() {
    this.myHackathons.stop();
}
Template.myHackathonList.helpers({
    dataReady: function() {
        return Template.instance().myHackathons.ready()
    },
    hackathons: function(){
        var user = Meteor.user();
        if(!user) return;
        var hackathonList = [];
        _.each(user.roles, function(role, hackathon) {
            var entry = {};
            entry['url_title'] = hackathon;
            if(role.indexOf('hacker') != -1)
                hackathonList.push(entry);
        });
        var x = Hackathons.find({$or: hackathonList}).fetch();
        _.each(x, function(hackathon, index) {
            var ut = hackathon.url_title;
            if(user.roles[ut] && (user.roles[ut].indexOf('creator') != -1 || user.roles[ut].indexOf('admin') != -1)){
                x[index].show_invite_code = true;
            }
            else
                x[index].show_invite_code = false;
        });
        return x;
    }
});
Template.settings.created = function() {
    this.myHackathons = Meteor.subscribe("myHackathons");
}
Template.settings.helpers({
  // Make a helper for ready state
  dataReady: function () {
    return Template.instance().myHackathons.ready()
  },
  status: function(){
    var s = Session.get("status");
    if(s == "success"){
        return "success";
    }
    else if(s == "" || !s){
        return "";
    }
    else { // error
        return "error";
    }
  },
  statusMessage: function(){
    var s = Session.get("status");
    if(s == "success"){
        setTimeout(function(){
            Session.set("status", "");
        }, 1000);
        return s;
    }
    else if(s == "" || !s){
        return "";
    }
    else { // error
        return s;
    }
  },
  hackathons: function(){
    var user = Meteor.user();
    if(!user) return;
    var hackathonList = [];
    _.each(user.roles, function(role, hackathon) {
        var entry = {};
        entry['url_title'] = hackathon;
        if(role.indexOf('hacker') != -1)
            hackathonList.push(entry);
    });
    var x = Hackathons.find({$or: hackathonList}).fetch();
    return x;
  },
  name: function() {
      if(Meteor.user() && Meteor.user().profile) {
          return Meteor.user().profile.name; 
      } 
  },
  contact: function() {
      if(Meteor.user() && Meteor.user().profile) {
          return Meteor.user().profile.contact; 
      }
  },
  github: function() {
      if(Meteor.user() && Meteor.user().profile) {
          return Meteor.user().profile.login; 
      }
  },
  email_notifications: function() {
      if(Meteor.user() && Meteor.user().profile) {
          return Meteor.user().profile.email_notifications;
      }
  },
  skill: function() {
      if(Meteor.user() && Meteor.user().profile){
          return Meteor.user().profile.skills;
      }
  },
  description: function() {
      if(Meteor.user() && Meteor.user().profile.bio){
          return Meteor.user().profile.bio;
      }
  },
  languages: function() {
      if(Meteor.user() && Meteor.user().profile.languages){
          return Meteor.user().profile.languages;
      }
  }
});
        
Template.settings.destroyed = function () {
  // Make sure the data goes away when we don’t need it anymore
  this.myHackathons.stop();
  Session.set("status", "");
};

Template.nav.created = function() {
    // todo subscribe to notifications
    this.userNotifications = Meteor.subscribe('user_notifications');
    this.hackathonsHandle = Meteor.subscribe('myHackathons');
}
Template.nav.destroyed = function() {
    this.userNotifications.stop();
    this.hackathonsHandle.stop();
}
Template.nav.helpers({
    dataReady: function () {
        return (Template.instance().hackathonsHandle.ready() && Template.instance().userNotifications.ready())
    },
    'notifications': function(){
        var x = Notifications.findOne({userId: Meteor.userId()});
        if(x)
            return x.notifications;
        else
            return [];
    },
    'hackathons': function(){
        var user = Meteor.user();
        if(!user) return;
        var hackathonList = [];
        _.each(user.roles, function(role, hackathon) {
            var entry = {};
            if(role == "admin") {
                // console.log("admin role found");
            }
            entry['url_title'] = hackathon;
            hackathonList.push(entry);
        });
        var x = Hackathons.find({$or: hackathonList}).fetch();
        // TODO ADAM $or is not working or something
        return x;
    },
    'username': function(){
        return Meteor.user().profile.login;
    }
});

Template.idea_list.helpers({
    ideas: function() {
        var hackathonUrl= Session.get("currentHackathon");
        var hackathon = Hackathons.findOne({url_title: hackathonUrl});
        if(!hackathon) return;
        var filter = Session.get("idea_filter");

        if(!filter) {
            filter = 'All';
            Session.set('idea_filter', filter);
        }
        var x = [];

        //Get Idea based off filter type
        x = IdeaFilters[filter]();
        
        x = _.sortBy(x, function (a){ 
            return -a['time_lastupdated']; 
        });

        // Heart and add comment counts to ideas
        _.each(x, function(idea) {
            var heart = Hearts.findOne({ $and: [{idea_id: idea._id}, {user_id: Meteor.userId()}]});
            if(heart && heart.hearted) {
                //Only added this to idea list that template receives, such that it's a local change only
                idea.hearted = true;
            } else {
                idea.hearted = false;
            }
            idea.commentCount = Comments.find({ideaId: idea._id}).fetch().length;
        });
        return x;
    }
});

// Template.createIdea.created = function(){
//     var hackathonUrl= Session.get("currentHackathon");
//     this.myIdeas = Meteor.subscribe('one_users_ideas_not_in_hackathon', hackathonUrlk);
// }
// Template.createIdea.destroyed = function(){
//     this.myIdeas.stop();
// }
// Template.createIdea.helpers({
//     dataReady: function () {
//         return Template.instance().myIdeas.ready();
//     },
//     ideas: function(){
//         return Ideas.find({userId: Meteor.userId()});
//     }
// });

Template.ideaPage.created = function() {
    var ideaId = Router.current().params._id;
    //console.log("idea id: " + ideaId);
    this.ideaHandle = Meteor.subscribe('ideaFull', ideaId);
}
Template.ideaPage.helpers({
  // Make a helper for ready state
  dataReady: function () {
    return Template.instance().ideaHandle.ready();
  },
  idea: function () {
    var ideaId = Router.current().params._id;

    var idea = Ideas.findOne({_id: ideaId});
    //console.log(idea);
    if(idea) {
        var author = Meteor.users.findOne({_id: idea.userId});
        var commentThread = Comments.find({ideaId: idea._id}).fetch();
        idea.author = author;
        idea.commentThread = commentThread;
        var heart = Hearts.findOne({ $and: [{idea_id: idea._id}, {user_id: Meteor.userId()}]});
        idea.hearted = heart && heart.hearted;
    }
    return idea;
  },
  heartsExist: function() {
    var ideaId = Router.current().params._id;

    var idea = Ideas.findOne({_id: ideaId});
    var exist = false;
    if(idea) {
        if(_.isArray(idea.hearts)) {
            exist = true;
        }
    }

    return exist;
  }

});
        
Template.ideaPage.destroyed = function () {
  // Make sure the data goes away when we don’t need it anymore
  this.ideaHandle.stop();
};

Template.sidebar.destroyed = function(){
    globals.hideSidebar();
}

Template.sidebar.helpers({
    idea: function() {
        var idea = Ideas.findOne({_id: Session.get("selectedIdea")});
        if(idea) {
            var author = Meteor.users.findOne({_id: idea.userId});
            var commentThread = Comments.find({ideaId: idea._id}).fetch();
            idea.author = author;
            idea.commentThread = commentThread;
            var heart = Hearts.findOne({ $and: [{idea_id: idea._id}, {user_id: Meteor.userId()}]});
            idea.hearted = heart && heart.hearted;
            return idea;
        }
    },
    opened: function(){
        var ideaSelected = Session.get("selectedIdea");
        // Session.set("selectedIdea", "");
        if(!ideaSelected || ideaSelected == "") {
            return false;
        } else {
            Session.set('sidebarOpened', 'open');
            return true;
        }
    }
});

Template.showHackathons.helpers({
    noIdeaPosted: function(){
        if(Meteor.user()){
            var hackathonUrl= Session.get("currentHackathon");
            var hackathon = Hackathons.findOne({url_title: hackathonUrl});
            if(!hackathon) return true;
            var x = Ideas.find({ $and: [{hackathon_id: hackathon._id}, {userId: {$ne: Meteor.userId()}}]}).fetch();
            if(x.length > 0){
                return false
            }
            return true
        }
    }
});

incrementIdeaLimit = function() {
  newLimit = Session.get('ideaLimit') + 10;
  Session.set('ideaLimit', newLimit);
}

Tracker.autorun(function () {
    Meteor.subscribe('hackathon_and_ideas', Session.get("currentHackathon"), Session.get("ideaLimit"));
});

Template.hackathonAdmin.created = function(){
    this.hackathon = Meteor.subscribe("hackathon_admin", Session.get("currentHackathon"));
}

Template.hackathonAdmin.destroyed = function(){
    this.hackathon.stop();
}

Template.hackathonAdmin.helpers({
    dataReady: function(){
        return Template.instance().hackathon.ready();
    },
    stats: function(){
        var o = {};
        var hackathon_title = Session.get("currentHackathon");
        var hackathon = Hackathons.findOne({url_title: hackathon_title});

        var ideas = Ideas.find({hackathon_id: hackathon._id}, {_id: 1}).fetch();
        var ideaIds = ideas.map(function(idea){
            return idea._id;
        });
        o.ideas = ideaIds.length;
        o.hearts = Hearts.find({hackathon_id: hackathon._id}).fetch().length;
        o.comments = Comments.find({ideaId: {$in: ideaIds}}).fetch().length;
        var str = "roles."+hackathon_title;
        var query = {};
        query[str] = {$in: ["hacker"]};
        o.users = Meteor.users.find(query).fetch().length;
        return o;
    }
})

Template.hackathon.created = function() {
    // todo subscribe to notifications
    var hackathonId = Router.current().params.hackathon;
    Session.set("currentHackathon", hackathonId);
    Session.setDefault("ideaLimit", 1000); //HACK HACK HACK
    //HACK need to restructure idea page to have server data for hearted ideas, and pagination for all ideas
}

Template.hackathon.rendered = function() {
  // is triggered every time we scroll
    $(window).scroll(function() {
        if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
            incrementIdeaLimit();
        }
    });
}

Template.hackathon.destroyed = function() {
//    Session.set("currentHackathon", null);
}
Template.hackathon.helpers({
    dataReady: function () {
        var hackathonUrl= Session.get("currentHackathon");
        var hackathon = Hackathons.findOne({url_title: hackathonUrl});
        if(hackathon) {
            return true;
        } else {
            return false;
        }
    },
    url_title: function() {
        var hackathonId = Router.current().params.hackathon;
        var url_title = null;

        if(hackathonId) {
            url_title = encodeURI(hackathonId.toLowerCase().replace(/ /g, ''));
        }
        return url_title;
    },
    data: function() {
        var hackathonId = Router.current().params.hackathon;
        var url_title = encodeURI(hackathonId.toLowerCase().replace(/ /g, ''));
        var hackathonUrl= Session.get("currentHackathon");
        var hackathon = Hackathons.findOne({url_title: hackathonUrl});
        if(!hackathon || hackathon.url_title != url_title) {
            hackathon = Hackathons.findOne({url_title: url_title});
            if(hackathon) {
                //Session.set("current_hackathon", hackathon);
                Session.set("currentHackathon", url_title);
            }
        }
        return hackathon;
    }
});
 




var pagePath = function() {
    var state = Router.current();

    if(state && state.location) {
        var route = state.location.get();
        return route.pathname;
    }

    return null;
}

var pageTitle = function() {

    var routeName = Router.current().route.getName()

    var title = null;
    switch(routeName) {
        case "profile": 
            var path = pagePath();
            path = path.split('/');
            if(path.length > 2) {
                title = path[2];
            }
            break; 
        case "home":
//            title = "hackathons";
            break;
        case "create_idea":
        case "messagesThread":
            title = "messages";
            break;
        case "ideas":
        case "hackathonAdmin":
        case "hackers":
        case "hackathon": 
            var hackathonUrl= Session.get("currentHackathon");
            var hackathon = Hackathons.findOne({url_title: hackathonUrl});
            if(hackathon && hackathon.title) {
                title = hackathon.title
            }
            break;
        default:
            title = routeName;
            break; 
    }
    return title;
}

var pageUrl = function() {
    var routeName = Router.current().route.getName()
    var url = null;
    switch(routeName) {
        case "profile":
            url = pagePath();
            url = url.substring(1);
            //url = Router.current().url;
            break;
        case "home": 
            url = "";
            break;
        case "create_idea":
        case "hackathonAdmin":
        case "ideas":
        case "hackers":
        case "hackathon": 
            var hackathonUrl= Session.get("currentHackathon");
            var hackathon = Hackathons.findOne({url_title: hackathonUrl});
            if(hackathon && hackathon.url_title) {
                url = hackathon.url_title
            }
            break;
        default:
            url = routeName;
            break; 
    }
    return url;
}