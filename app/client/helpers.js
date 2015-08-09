Handlebars.registerHelper('selected_hackathon',function(){
    var hackathon = Session.get('current_hackathon');
    return hackathon;
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

Template.index.rendered = function(){
    $('.pt-triggers').css('background-color', 'transparent');
}

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

// Used to check whether profile is done loading yet
Template.profile.helpers( {
    has_github_profile: function(){
        if(this.profile) {
            return this.profile.updated_at; 
        }
    }
});

Template.profile_contents.helpers({
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
            var repos = this.profile.repos;
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
            var repos = this.profile.repos;
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
            var repos = this.profile.repos;

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
            var repos = this.profile.repos;
            var languages = {};
            for(var i=0;i<repos.length;i++){
                var t = JSON.parse(repos[i].languages);

                for(var a in t){
                    if(languages.hasOwnProperty(a)){
                        languages[a] += t[a];
                    }
                    else {
                        languages[a] = t[a];
                    }
                }
            }

            var sortable = [];
            for (var a in languages)
                sortable.push([a, languages[a]])
            sortable.sort(function(a, b) {return b[1] - a[1]})
            var sentence = ""; 
            var i = 0;
            while(i<sortable.length-1 && i < 4){
                if(i == sortable.length-2 || i == 3){
                    sentence += sortable[i][0];
                }
                else {
                    sentence += sortable[i][0] + ", ";
                }
                i++;
            }

            var languages = {
                languages: sortable.map(function(el){
                    return el[0]
                })
            }
            updated_profile = _.extend(Meteor.user().profile, languages);
               
            // Trim and validate the input
            Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile":updated_profile}});

            Meteor.call('attach_ideas', Meteor.user()._id);
            Meteor.call('update_ideas', Meteor.user()._id);
            
            return sentence;
        }
        else if(this.profile.languages) {
            var sortable = this.profile.languages;
            var sentence = ""; 
            var i = 0;
            while(i<sortable.length-1){
                if(i == sortable.length-2){
                    sentence += sortable[i];
                }
                else {
                    sentence += sortable[i] + ", ";
                }
                i++;
            }
            return sentence;
        }
    },
    myIdeas: function(){
        console.log(Ideas.find().fetch());
        return Ideas.find({'github_username': this.profile.login}).fetch();
    }
});


Template.person_list.helpers({
    People: function(){
        var hackathon = Session.get("current_hackathon");
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
    }
});

Template.home.helpers({
    profileIncomplete: function() {
        if(Meteor.user()){
            var me = Meteor.user().profile;
            return me.bio == null || me.bio == "" || me.contact == null || me.contact == "" || me.name == "" || me.name == null
        }
    }
});


Template.settings.helpers({
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
    skills: function() {
        if(Meteor.user() && Meteor.user().profile){
            var skills = Meteor.user().profile.skills;

            $('#sb1').prop('checked', skills.webdev);
            $('#sb2').prop('checked', skills.design);
            $('#sb3').prop('checked', skills.backend);
            $('#sb4').prop('checked', skills.mobile);
            $('#sb5').prop('checked', skills.hardware);
            $('.ac-cross input[type="checkbox"]').trigger('change');
            setTimeout(function(){$('.ac-cross input[type="checkbox"]').trigger('change')},1000);
            return '';
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

Template.layout.helpers({
    'notifications': function(){
        return Notifications.find({userId: Meteor.userId()});
    }
});


Template.idea_list.helpers({
    ideas: function() {
        var hackathon = Session.get("current_hackathon");
        if(!hackathon) return;
        var filter = Session.get("idea_filter");

        if(!filter) {
            filter = 'All';
            Session.set('idea_filter', filter);
        }
        var x = [];

        //Get Idea based off filter type
        x = IdeaFilters[filter]();
        
        x = _.sortBy(x, function (x) { return -x.hearts; });
        //Heart and add comment counts to ideas
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

 
Template.sidebar.helpers({
    idea: function() {
        var idea = Ideas.findOne({_id: Session.get("selectedIdea")});
        if(idea) {
            var author = Meteor.users.findOne({_id: idea.userId});
            var commentThread = Comments.find({ideaId: idea._id}).fetch();
            idea.author = author;
            idea.commentThread = commentThread;
            return idea;
        }
    }
});


Template.showHackathons.helpers({
    noIdeaPosted: function(){
        if(Meteor.user()){
            var hackathon = Session.get("current_hackathon");
            if(!hackathon) return true;
            var x = Ideas.find({ $and: [{hackathon_id: hackathon._id}, {userId: {$ne: Meteor.userId()}}]}).fetch();
            if(x.length > 0){
                return false
            }
            return true
        }
    }
});