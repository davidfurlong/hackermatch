
Router.configure({
//    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound',
    layoutTemplate: 'layout'
});
Router.onBeforeAction('loading');

Router.map(function() {
    this.route('index', {
        path: '/',
        data: {
            title: ''
        },
        onBeforeAction: function () {
            if (Meteor.user()) {
                Router.go('home');
            }
        },
        layoutTemplate: ''

    });
    this.route('signupProfile', {
        path: '/signup-profile',
        data: {
            title: ''
        },
        onBeforeAction: function () {
            if (Meteor.user()){
                Router.go('profile');
            }
        }
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
        yieldTemplates: {
          'base_nav': {to: 'nav'}
        },
        onBeforeAction: function() {
            if (!Meteor.user()){
                if (Meteor.loggingIn()) {
                }
                else{
                  Router.go('signup');
                }
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
        yieldTemplates: {
          'base_nav': {to: 'nav'}
        },
        onBeforeAction: function() {
            if (!Meteor.user()){
                if (Meteor.loggingIn()) {
                }
                else{
                  Router.go('signup');
                }
            }
        }
    });
    this.route('profile', {
        path: '/user/:_username',
        data: function() { 
            var user = Meteor.users.findOne({'services.github.username': this.params._username}); 
            if(user) {
                user['title'] = this.params._username;
            }
            return user;
        },
        yieldTemplates: {
          'base_nav': {to: 'nav'}
        },
        waitOn: function() { return Meteor.subscribe('user', this.params._username)},
        onBeforeAction: function() {
            if (!Meteor.user()){
                if (Meteor.loggingIn()) {
                }
                else{
                  Router.go('signup');
                }
            }
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
        yieldTemplates: {
          'base_nav': {to: 'nav'}
        },
        waitOn: function() { return Meteor.subscribe('myHackathons', this.userId)},
        onBeforeAction: function () {
//            Session.set("current_hackathon", null);
            if (!Meteor.user()) {
              if (Meteor.loggingIn()) {
              }
              else{
                Router.go('signup');
              }
            }
        }
    });
    this.route('signup', {
        path: '/login', 
        data: {
            title: 'log in'
        },
        onBeforeAction: function () {
            if (Meteor.user()) {
                Router.go('home');
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
            }
        }
    });
    this.route('admin', {path: '/admin', 
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
        yieldTemplates: {
          'base_nav': {to: 'nav'}
        },
        waitOn: function() { return Meteor.subscribe('hackathons', this.userId)},
        onBeforeAction: function () {
//            Session.set("current_hackathon", null);
            if (!Meteor.user()) {
              if (Meteor.loggingIn()) {
              }
              else{
                Router.go('signup');
              }
            }
        }
    });
    this.route('create_idea', {path: '/idea' , 
        data: function() {
            var hackathon = Session.get("current_hackathon");
            if(hackathon) {
                hackathon.override_title = hackathon.title;
                hackathon.override_title_url = '/' + hackathon.url_title;
            }
            return hackathon;
        },
//        waitOn: function() { return Meteor.subscribe('hackathon_and_ideas', this.params._title)},
        yieldTemplates: {
          'base_nav': {to: 'nav'}
        },
        onBeforeAction: function () {
            if (!Meteor.user()) {
              if (Meteor.loggingIn()) {
              } else {
                Router.go('signup');
              }
            } else {
                if(!Session.get("current_hackathon")) {
                    Router.go('home'); 
                }
            }
        }
    });        
    this.route('hackathon', {path: '/:_title' , 
        data: function() {
            var url_title = encodeURI(this.params._title.toLowerCase().replace(/ /g, ''));
            var hackathon = Session.get("current_hackathon");

            if(!hackathon || hackathon.url_title != url_title) {
                hackathon = Hackathons.findOne({url_title: url_title});
                if(hackathon) {
                    Session.set("current_hackathon", hackathon);
                } 
            } 

            //Check to see if actually an invite code not a hackathon
            var invite_code = this.params._title;
            Meteor.call('hackathon_by_code', invite_code, function(err, title) {
                if(title) {
                    Session.set("invite_code", invite_code);
                    Router.go('home');
                }
            });

            return hackathon;
        },
        waitOn: function() { return Meteor.subscribe('hackathon_and_ideas', this.params._title)},
        yieldTemplates: {
          'hackathon_nav': {to: 'nav'}
        },
        onBeforeAction: function () {
            if (!Meteor.user()) {
              if (Meteor.loggingIn()) {
              } else {
                Session.set("invite_code", this.params._title);
                Router.go('signup');
              }
            }
        }
    });
});

/* START HANDLEBARS HELPERS */

Handlebars.registerHelper('selected_hackathon',function(){
    var hackathon = Session.get('current_hackathon');
    return hackathon;
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
    'click li.item-text' : function(e, t) {
        e.preventDefault();
        var idea_id = e.currentTarget.dataset.id;
        Session.set("selectedIdea", idea_id);
    },
    'click li.item-heart' : function(e, t) {
        e.preventDefault();
        var idea_id = e.currentTarget.dataset.id;
        //console.log("hearted");

        Meteor.call('heart_idea', idea_id, function(err, res) {});
    }
});

//Used to check whether profile is done loading yet
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
        if(this.profile) {
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
            return sentence;
        }
    }
});

function renderChart(){
    if(window.renderedChart != true){
        window.renderedChart = true;
        var ctx = document.getElementById("canvas").getContext("2d");
        window.myLine = new Chart(ctx).Line(window.lineChartData, {
            responsive: true,
            bezierCurveTension: 0.4,
            scaleShowGridLines : false,
            pointDot: false,
            // legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",
            annotateDisplay: true,
            annotateLabel: '<%=v1%>',
            graphMin: 0,
            inGraphDataTmpl: '<%=v1%>',
            savePng: true,
            savePngBackgroundColor: 'white',
        });
        function legend(parent, data) {
            parent.className = 'legend';
            var datas = data.hasOwnProperty('datasets') ? data.datasets : data;

            // remove possible children of the parent
            while(parent.hasChildNodes()) {
                parent.removeChild(parent.lastChild);
            }
            var label = document.createTextNode("Currently Working on");
            var h3 = document.createElement('h3');
            h3.appendChild(label);
            parent.appendChild(h3);
            datas.forEach(function(d) {
                var titlecontainer = document.createElement('div');
                var titlelabel = document.createElement('span');
                var title = document.createElement('span');
                title.className = 'title';
                titlelabel.className = 'title-dot';
                titlelabel.style.backgroundColor = d.hasOwnProperty('strokeColor') ? d.strokeColor : d.color;
                // title.style.borderColor = d.hasOwnProperty('strokeColor') ? d.strokeColor : d.color;
                // title.style.borderStyle = 'solid';
                titlecontainer.appendChild(titlelabel);
                titlecontainer.appendChild(title);
                var link = document.createElement('a');
                link.href = d.url;
                title.appendChild(link)
                var text = document.createTextNode(d.label + " - "+d.bio);
                link.appendChild(text);
                parent.appendChild(titlecontainer);
            });
        }
        legend(document.getElementById("lineLegend"), window.lineChartData.datasets);
    }
}

Template.sidebar.events({
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

            //console.log(comment);
            Comments.insert(comment, function(err, result) {
                if(err) {
                    console.log("error creating comment");
                } else {
                    //hackety hackety hack
                    //console.log("comment added!");
                }
            });
        }
    },
    'keyup #comment-create' : function(e){
        if(e.keyCode == 13){
            $('#comment-create').submit();
        }
    }
});

Template.home.invite_code = function() {

    var invite_code = Session.get('invite_code');
    if(invite_code) {
        return invite_code;
    } else {
        return 'I6WK9';
    }
}

Template.profile_sidebar.opened = function() {
    var profileSelected = Session.get("selectedProfile");
//    Session.set("selectedIdea", "");
    if(!profileSelected || profileSelected == "") {
        return false;
    } else {
        Session.set('profile_sidebarOpened', 'open');
        $('.pt-triggers, #pt-main, #title-bar').addClass('blur');
        return true;
    }
}

 
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
Template.sidebar.opened = function() {
    var ideaSelected = Session.get("selectedIdea");
//    Session.set("selectedIdea", "");
    if(!ideaSelected || ideaSelected == "") {
        return false;
    } else {
        Session.set('sidebarOpened', 'open');
        $('.pt-triggers, #pt-main, #title-bar').addClass('blur');
        return true;
    }
}
Template.hackathon.rendered =  function() {
    /*
$.getScript("js/inline.js", function(data, textStatus, jqxhr) {
                      [].slice.call( document.querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {    
                          new SelectFx( el, {
                              stickyPlaceholder: false,
                              onChange: function(val){
                                  document.querySelector('span.cs-placeholder').style.backgroundColor = val;
                              }
                          });
                      } );
})
*/
}

Template.settings.rendered =  function() {
$.getScript("js/inline.js", function(data, textStatus, jqxhr) {
                      [].slice.call( document.querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {    
                          new SelectFx( el, {
                              stickyPlaceholder: false,
                              onChange: function(val){
                                  document.querySelector('span.cs-placeholder').style.backgroundColor = val;
                              }
                          });
                      } );
})
}
Template.idea_create_template.rendered =  function() {
$.getScript("js/inline.js", function(data, textStatus, jqxhr) {
                  (function() {
                      var formWrap = document.getElementById( 'fs-form-wrap-idea' );
  
                      [].slice.call( document.querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {    
                          new SelectFx( el, {
                              stickyPlaceholder: false,
                              onChange: function(val){
                                  document.querySelector('span.cs-placeholder').style.backgroundColor = val;
                              }
                          });
                      } );
  
                      window.FForm2 = new FForm( formWrap, {
                          onReview : function() {
                              classie.add( document.body, 'overview' ); // for demo purposes only
                          }
                      } );
                  })();
              });    
}

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

/*
Template.hackathonList.helpers({
  hackathons: function() {
        var x = Hackathons.find({}).fetch();
        return x;
  }
});
*/
/*
Template.myHackathonList.helpers({
  hackathons: function() {
        var user = Meteor.user();
        if(!user) return;
        var hackathonList = [];
        _.each(user.roles, function(role, hackathon) {
            var entry = {};
            if(role == "admin") {
                console.log("admin role found");
            }
            console.log(role);
            console.log(hackathon);
            entry['url_title'] = hackathon;
            hackathonList.push(entry);
        });
        console.dir(hackathonList);
        var x = Hackathons.find({$or: hackathonList}).fetch();
        return x;
  }
});
*/


Template.home.events({
    'submit #join_hackathon' : function(e, t) {
        e.preventDefault();

        var invite_code = t.find("#join_hackathon_code").value;

        t.$("#join_hackathon_code").val("");

        Meteor.call('join_hackathon', invite_code, function(err, res) {
            
            if(res) {
                Router.go('hackathon', {_title: res});
            }    
        });
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

Template.idea_create_template.events({
    'keyup #idea-create' : function(e){
        if(e.keyCode == 13){
            if($('.fs-number-current').text() == "3") {
                e.preventDefault();
                $('.fs-continue').click();
            }
        }
    },
    'click .fs-continue' : function(e, t) {
        if($('.fs-number-current').text() != "3") {
            return;
        }
        e.preventDefault();
        var description = t.find('#q1').value
        , name = t.find('#q2').value
        , webdev = t.find('#cb1').checked
        , design = t.find('#cb2').checked
        , backend = t.find('#cb3').checked
        , mobile = t.find('#cb4').checked
        , hardware = t.find('#cb5').checked;


        //hackety hackety hack
        $('#my-group').trigger('click');
        $('#idea-create').removeClass('fs-form-overview')
        $('#idea-create').addClass('fs-form-full');
        $("#my-group").trigger("click");
        $('.fs-fields li').removeClass('fs-current');
        $($('.fs-fields li')[0]).addClass('fs-current');
        $('.fs-fields input').val('');
        $('.fs-fields textarea').val('');
      
        $('.fs-controls > *').addClass('fs-show');
        $('.fs-controls').height($('.pt-page-3').height());
        //using pageTransitions library, instead of Meteor routing...
        
        var hackathon = Session.get("current_hackathon");
       
        //TODO make a better error case, shouldn't even get this far...
        if(!hackathon || hackathon == "") {
            console.log("no hackathon selected");
            Router.go('home');
            return;
        }
        
        Router.go('hackathon', {_title: hackathon.title});

        if(!description) return;

        var idea = {
            name: name,
            description: description,
            userId: Meteor.userId(),
            hackathon_id: hackathon._id,
//            avatar_url: Meteor.user().profile.avatar_url,
//            github_username: Meteor.user().profile.login,
            time: new Date().getTime(),
            user_profile: Meteor.user().profile,
            skills: {
                webdev: webdev,
                backend: backend,
                mobile: mobile,
                design: design,
                hardware: hardware
            },
            comments: {}
        };
        Meteor.call('create_idea', idea, function(err, res) {});
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
    }
});

Template.settings.events({
    'submit #update-user-form' : function(e, t) {
      e.preventDefault();
      var q1 = t.find('#user_name').value
        , q2 = t.find('#user_contact').value
        , q3 = t.find('#user_skills').value
        , q4 = t.find('#user_github').value
        //, q5 = t.find('#user_picture').value
        , webdev = t.find('#sb1').checked
        , design = t.find('#sb2').checked
        , backend = t.find('#sb3').checked
        , mobile = t.find('#sb4').checked
        , hardware = t.find('#sb5').checked;

        var updated_profile = {
            name: q1,
            contact: q2,
            github: q4,
            skills: {
                backend: backend,
                design: design,
                hardware: hardware,
                mobile: mobile,
                webdev: webdev
            }
        };
        updated_profile = _.extend(Meteor.user().profile, updated_profile);
            
        // Trim and validate the input
        Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile":updated_profile}});

        Meteor.call('attach_ideas', Meteor.user()._id);
        Meteor.call('update_ideas', Meteor.user()._id);

        var hackathon = Session.get("current_hackathon");
       
        //TODO make a better error case, shouldn't even get this far...
        if(!hackathon || hackathon == "") {
            console.log("no hackathon selected");
            Router.go('home');
            return;
        }
        
        Router.go('hackathon', {_title: hackathon.title});
    /*
      Accounts.createUser({email: email, password : password}, function(err){
          if (err) {
            console.log('no user :(');
            Router.go('home');
            // Inform the user that account creation failed
          } else {
            console.log('created user!');
            Router.go('home');
            // Success. Account has been created and the user
            // has logged in successfully. 
          }

      });
    */
      return false;
    },
    'click #logout': function (e, t) {
        e.preventDefault();
        if (Meteor.user()) {
            Meteor.logout(function() {
                Router.go('index');
            });
        }
    }
});

Template.signup.rendered = function(){
  if( document.createElement('svg').getAttributeNS ) {
    var checkbxsCross = Array.prototype.slice.call( document.querySelectorAll( '.ac-cross input[type="checkbox"]' ) ),
      radiobxsFill = Array.prototype.slice.call( document.querySelectorAll( '.ac-fill input[type="radio"]' ) ),
      checkbxsCheckmark = Array.prototype.slice.call( document.querySelectorAll( '.ac-checkmark input[type="checkbox"]' ) ),
      radiobxsCircle = Array.prototype.slice.call( document.querySelectorAll( '.ac-circle input[type="radio"]' ) ),
      checkbxsBoxfill = Array.prototype.slice.call( document.querySelectorAll( '.ac-boxfill input[type="checkbox"]' ) ),
      radiobxsSwirl = Array.prototype.slice.call( document.querySelectorAll( '.ac-swirl input[type="radio"]' ) ),
      checkbxsDiagonal = Array.prototype.slice.call( document.querySelectorAll( '.ac-diagonal input[type="checkbox"]' ) ),
      checkbxsList = Array.prototype.slice.call( document.querySelectorAll( '.ac-list input[type="checkbox"]' ) ),
      pathDefs = {
        cross : ['M 10 10 L 90 90','M 90 10 L 10 90'],
        fill : ['M15.833,24.334c2.179-0.443,4.766-3.995,6.545-5.359 c1.76-1.35,4.144-3.732,6.256-4.339c-3.983,3.844-6.504,9.556-10.047,13.827c-2.325,2.802-5.387,6.153-6.068,9.866 c2.081-0.474,4.484-2.502,6.425-3.488c5.708-2.897,11.316-6.804,16.608-10.418c4.812-3.287,11.13-7.53,13.935-12.905 c-0.759,3.059-3.364,6.421-4.943,9.203c-2.728,4.806-6.064,8.417-9.781,12.446c-6.895,7.477-15.107,14.109-20.779,22.608 c3.515-0.784,7.103-2.996,10.263-4.628c6.455-3.335,12.235-8.381,17.684-13.15c5.495-4.81,10.848-9.68,15.866-14.988 c1.905-2.016,4.178-4.42,5.556-6.838c0.051,1.256-0.604,2.542-1.03,3.672c-1.424,3.767-3.011,7.432-4.723,11.076 c-2.772,5.904-6.312,11.342-9.921,16.763c-3.167,4.757-7.082,8.94-10.854,13.205c-2.456,2.777-4.876,5.977-7.627,8.448 c9.341-7.52,18.965-14.629,27.924-22.656c4.995-4.474,9.557-9.075,13.586-14.446c1.443-1.924,2.427-4.939,3.74-6.56 c-0.446,3.322-2.183,6.878-3.312,10.032c-2.261,6.309-5.352,12.53-8.418,18.482c-3.46,6.719-8.134,12.698-11.954,19.203 c-0.725,1.234-1.833,2.451-2.265,3.77c2.347-0.48,4.812-3.199,7.028-4.286c4.144-2.033,7.787-4.938,11.184-8.072 c3.142-2.9,5.344-6.758,7.925-10.141c1.483-1.944,3.306-4.056,4.341-6.283c0.041,1.102-0.507,2.345-0.876,3.388 c-1.456,4.114-3.369,8.184-5.059,12.212c-1.503,3.583-3.421,7.001-5.277,10.411c-0.967,1.775-2.471,3.528-3.287,5.298 c2.49-1.163,5.229-3.906,7.212-5.828c2.094-2.028,5.027-4.716,6.33-7.335c-0.256,1.47-2.07,3.577-3.02,4.809'],
        checkmark : ['M16.667,62.167c3.109,5.55,7.217,10.591,10.926,15.75 c2.614,3.636,5.149,7.519,8.161,10.853c-0.046-0.051,1.959,2.414,2.692,2.343c0.895-0.088,6.958-8.511,6.014-7.3 c5.997-7.695,11.68-15.463,16.931-23.696c6.393-10.025,12.235-20.373,18.104-30.707C82.004,24.988,84.802,20.601,87,16'],
        circle : ['M34.745,7.183C25.078,12.703,13.516,26.359,8.797,37.13 c-13.652,31.134,9.219,54.785,34.77,55.99c15.826,0.742,31.804-2.607,42.207-17.52c6.641-9.52,12.918-27.789,7.396-39.713 C85.873,20.155,69.828-5.347,41.802,13.379'],
        boxfill : ['M6.987,4.774c15.308,2.213,30.731,1.398,46.101,1.398 c9.74,0,19.484,0.084,29.225,0.001c2.152-0.018,4.358-0.626,6.229,1.201c-5.443,1.284-10.857,2.58-16.398,2.524 c-9.586-0.096-18.983,2.331-28.597,2.326c-7.43-0.003-14.988-0.423-22.364,1.041c-4.099,0.811-7.216,3.958-10.759,6.81 c8.981-0.104,17.952,1.972,26.97,1.94c8.365-0.029,16.557-1.168,24.872-1.847c2.436-0.2,24.209-4.854,24.632,2.223 c-14.265,5.396-29.483,0.959-43.871,0.525c-12.163-0.368-24.866,2.739-36.677,6.863c14.93,4.236,30.265,2.061,45.365,2.425 c7.82,0.187,15.486,1.928,23.337,1.903c2.602-0.008,6.644-0.984,9,0.468c-2.584,1.794-8.164,0.984-10.809,1.165 c-13.329,0.899-26.632,2.315-39.939,3.953c-6.761,0.834-13.413,0.95-20.204,0.938c-1.429-0.001-2.938-0.155-4.142,0.436 c5.065,4.68,15.128,2.853,20.742,2.904c11.342,0.104,22.689-0.081,34.035-0.081c9.067,0,20.104-2.412,29.014,0.643 c-4.061,4.239-12.383,3.389-17.056,4.292c-11.054,2.132-21.575,5.041-32.725,5.289c-5.591,0.124-11.278,1.001-16.824,2.088 c-4.515,0.885-9.461,0.823-13.881,2.301c2.302,3.186,7.315,2.59,10.13,2.694c15.753,0.588,31.413-0.231,47.097-2.172 c7.904-0.979,15.06,1.748,22.549,4.877c-12.278,4.992-25.996,4.737-38.58,5.989c-8.467,0.839-16.773,1.041-25.267,0.984 c-4.727-0.031-10.214-0.851-14.782,1.551c12.157,4.923,26.295,2.283,38.739,2.182c7.176-0.06,14.323,1.151,21.326,3.07 c-2.391,2.98-7.512,3.388-10.368,4.143c-8.208,2.165-16.487,3.686-24.71,5.709c-6.854,1.685-13.604,3.616-20.507,4.714 c-1.707,0.273-3.337,0.483-4.923,1.366c2.023,0.749,3.73,0.558,5.95,0.597c9.749,0.165,19.555,0.31,29.304-0.027 c15.334-0.528,30.422-4.721,45.782-4.653'],
        swirl : ['M49.346,46.341c-3.79-2.005,3.698-10.294,7.984-8.89 c8.713,2.852,4.352,20.922-4.901,20.269c-4.684-0.33-12.616-7.405-14.38-11.818c-2.375-5.938,7.208-11.688,11.624-13.837 c9.078-4.42,18.403-3.503,22.784,6.651c4.049,9.378,6.206,28.09-1.462,36.276c-7.091,7.567-24.673,2.277-32.357-1.079 c-11.474-5.01-24.54-19.124-21.738-32.758c3.958-19.263,28.856-28.248,46.044-23.244c20.693,6.025,22.012,36.268,16.246,52.826 c-5.267,15.118-17.03,26.26-33.603,21.938c-11.054-2.883-20.984-10.949-28.809-18.908C9.236,66.096,2.704,57.597,6.01,46.371 c3.059-10.385,12.719-20.155,20.892-26.604C40.809,8.788,58.615,1.851,75.058,12.031c9.289,5.749,16.787,16.361,18.284,27.262 c0.643,4.698,0.646,10.775-3.811,13.746'],
        diagonal : ['M16.053,91.059c0.435,0,0.739-0.256,0.914-0.768 c3.101-2.85,5.914-6.734,8.655-9.865C41.371,62.438,56.817,44.11,70.826,24.721c3.729-5.16,6.914-10.603,10.475-15.835 c0.389-0.572,0.785-1.131,1.377-1.521'],
        list : ['M1.986,8.91c41.704,4.081,83.952,5.822,125.737,2.867 c17.086-1.208,34.157-0.601,51.257-0.778c21.354-0.223,42.706-1.024,64.056-1.33c18.188-0.261,36.436,0.571,54.609,0.571','M3.954,25.923c9.888,0.045,19.725-0.905,29.602-1.432 c16.87-0.897,33.825-0.171,50.658-2.273c14.924-1.866,29.906-1.407,44.874-1.936c19.9-0.705,39.692-0.887,59.586,0.45 c35.896,2.407,71.665-1.062,107.539-1.188']
      },
      animDefs = {
        cross : { speed : .2, easing : 'ease-in-out' },
        fill : { speed : .8, easing : 'ease-in-out' },
        checkmark : { speed : .2, easing : 'ease-in-out' },
        circle : { speed : .2, easing : 'ease-in-out' },
        boxfill : { speed : .8, easing : 'ease-in' },
        swirl : { speed : .8, easing : 'ease-in' },
        diagonal : { speed : .2, easing : 'ease-in-out' },
        list : { speed : .3, easing : 'ease-in-out' }
      };

    //console.log(checkbxsCross);

    function createSVGEl( def ) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      if( def ) {
        svg.setAttributeNS( null, 'viewBox', def.viewBox );
        svg.setAttributeNS( null, 'preserveAspectRatio', def.preserveAspectRatio );
      }
      else {
        svg.setAttributeNS( null, 'viewBox', '0 0 100 100' );
      }
      svg.setAttribute( 'xmlns', 'http://www.w3.org/2000/svg' );
      return svg;
    }

    function controlCheckbox( el, type, svgDef ) {
      var svg = createSVGEl( svgDef );
      el.parentNode.appendChild( svg );
      //console.log(el);
      $(el).change(function() {
        //console.log('ay');

        if( el.checked ) {
          draw( el, type );
        }
        else {
          reset( el );
        }
      } );
    }

    function controlRadiobox( el, type ) {
      var svg = createSVGEl();
      el.parentNode.appendChild( svg );
      el.addEventListener( 'change', function() {
        resetRadio( el );
        draw( el, type );
      } );
    }

    checkbxsCross.forEach( function( el, i ) { controlCheckbox( el, 'cross' ); } );
    radiobxsFill.forEach( function( el, i ) { controlRadiobox( el, 'fill' ); } );
    checkbxsCheckmark.forEach( function( el, i ) { controlCheckbox( el, 'checkmark' ); } );
    radiobxsCircle.forEach( function( el, i ) { controlRadiobox( el, 'circle' ); } );
    checkbxsBoxfill.forEach( function( el, i ) { controlCheckbox( el, 'boxfill' ); } );
    radiobxsSwirl.forEach( function( el, i ) { controlRadiobox( el, 'swirl' ); } );
    checkbxsDiagonal.forEach( function( el, i ) { controlCheckbox( el, 'diagonal' ); } );
    checkbxsList.forEach( function( el ) { controlCheckbox( el, 'list', { viewBox : '0 0 300 100', preserveAspectRatio : 'none' } ); } );

    function draw( el, type ) {
      var paths = [], pathDef, 
        animDef,
        svg = el.parentNode.querySelector( 'svg' );

      switch( type ) {
        case 'cross': pathDef = pathDefs.cross; animDef = animDefs.cross; break;
        case 'fill': pathDef = pathDefs.fill; animDef = animDefs.fill; break;
        case 'checkmark': pathDef = pathDefs.checkmark; animDef = animDefs.checkmark; break;
        case 'circle': pathDef = pathDefs.circle; animDef = animDefs.circle; break;
        case 'boxfill': pathDef = pathDefs.boxfill; animDef = animDefs.boxfill; break;
        case 'swirl': pathDef = pathDefs.swirl; animDef = animDefs.swirl; break;
        case 'diagonal': pathDef = pathDefs.diagonal; animDef = animDefs.diagonal; break;
        case 'list': pathDef = pathDefs.list; animDef = animDefs.list; break;
      };
      
      paths.push( document.createElementNS('http://www.w3.org/2000/svg', 'path' ) );

      if( type === 'cross' || type === 'list' ) {
        paths.push( document.createElementNS('http://www.w3.org/2000/svg', 'path' ) );
      }
      
      for( var i = 0, len = paths.length; i < len; ++i ) {
        var path = paths[i];
        svg.appendChild( path );

        path.setAttributeNS( null, 'd', pathDef[i] );

        var length = path.getTotalLength();
        // Clear any previous transition
        //path.style.transition = path.style.WebkitTransition = path.style.MozTransition = 'none';
        // Set up the starting positions
        path.style.strokeDasharray = length + ' ' + length;
        if( i === 0 ) {
          path.style.strokeDashoffset = Math.floor( length ) - 1;
        }
        else path.style.strokeDashoffset = length;
        // Trigger a layout so styles are calculated & the browser
        // picks up the starting position before animating
        path.getBoundingClientRect();
        // Define our transition
        path.style.transition = path.style.WebkitTransition = path.style.MozTransition  = 'stroke-dashoffset ' + animDef.speed + 's ' + animDef.easing + ' ' + i * animDef.speed + 's';
        // Go!
        path.style.strokeDashoffset = '0';
      }
    }

    function reset( el ) {
      Array.prototype.slice.call( el.parentNode.querySelectorAll( 'svg > path' ) ).forEach( function( el ) { el.parentNode.removeChild( el ); } );
    }

    function resetRadio( el ) {
      Array.prototype.slice.call( document.querySelectorAll( 'input[type="radio"][name="' + el.getAttribute( 'name' ) + '"]' ) ).forEach( function( el ) { 
        var path = el.parentNode.querySelector( 'svg > path' );
        if( path ) {
          path.parentNode.removeChild( path );
        }
      } );
    }

  }
/*
    $.getScript("js/inline.js", function(data, textStatus, jqxhr) {
                  (function() {
                      var formWrap = document.getElementById( 'fs-form-wrap-signup' );
  
                      [].slice.call( document.querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {    
                          new SelectFx( el, {
                              stickyPlaceholder: false,
                              onChange: function(val){
                                  document.querySelector('span.cs-placeholder').style.backgroundColor = val;
                              }
                          });
                      } );
  
                      window.FForm2 = new FForm( formWrap, {
                          onReview : function() {
                              classie.add( document.body, 'overview' ); // for demo purposes only
                          }
                      } );
                  })();
              });    
*/
};

Template.signup.events({
    'submit #register-form' : function(e, t) {
      e.preventDefault();
    
    var webdev = t.find('#cb1').checked
        , backend = t.find('#cb3').checked
        , mobile = t.find('#cb4').checked
        , design = t.find('#cb2').checked
        , hardware = t.find('#cb5').checked;

        // Trim and validate the input
        var profile = {
//                name: name,
//                contact: email,
//                github: github,
                skills: {
                    webdev: webdev,
                    backend: backend,
                    mobile: mobile,
                    design: design,
                    hardware: hardware
                }
        }
        //console.log(profile);

      Meteor.loginWithGithub({
            requestPermissions: []
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

Template.signupProfile.events({
    'submit #register-form' : function(e, t) {
      e.preventDefault();

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
                Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile":profile}})
                Router.go('profile');
            }
      });

      return false;
    }
});


Template.login.events({

    'submit #login-form' : function(e, t){
      e.preventDefault();
      // retrieve the input field values
      var email = t.find('#login-email').value
        , password = t.find('#login-password').value;

        // Trim and validate your fields here.... 

        // If validation passes, supply the appropriate fields to the
        // Meteor.loginWithPassword() function.
        Meteor.loginWithPassword(email, password, function(err){
        if (err) {
            console.log(err);
          // The user might not have been found, or their passwword
          // could be incorrect. Inform the user that their
          // login attempt has failed. 
        } else {
            Router.go('home');
          // The user has been logged in.
        }
      });
         return false; 
      }
});


Template.idea_filter.filters = function () {
    var filter_info = [];
    var total_count = 0;                                                                                 
    _.each(IdeaFilters, function (key, value) {
        filter_info.push({filter: value, count: key().length});
    });

    filter_info = _.sortBy(filter_info, function (x) { return x.filter; });
    return filter_info;
};                                                                                                     

Template.idea_filter.filter_text = function () {
    return this.filter;
};                                                                                                     
Template.idea_filter.selected = function () {
    return Session.equals('idea_filter', this.filter) ? 'selected' : '';
};                                                                                                     
Template.idea_filter.events({ 
  'mousedown .filter': function () {
    if (Session.equals('idea_filter', this.filter)) {
//        Session.set('idea_filter', null);
    } else {
        Session.set('idea_filter', this.filter);
    }
  }
});

var IdeaFilters = {
    'Hearted': function() {
        var hackathon = Session.get("current_hackathon");
        if(!hackathon) return;
        var x = Ideas.find({ $and: [{hackathon_id: hackathon._id}, {userId: {$ne: Meteor.userId()}}]}).fetch();
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
    'Needs your help': function() {
    //Ideas that need your skills list
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
            return;
        }
        var hackathon = Session.get("current_hackathon");
        if(!hackathon) return;
        var x = Ideas.find({
            $and: [
                {hackathon_id: hackathon._id},
                {$or: skillArray}
            ]
        }).fetch();
        return x;
    },
    'All': function() {
        var hackathon = Session.get("current_hackathon");
        if(!hackathon) return;
        var x = Ideas.find({ $and: [{hackathon_id: hackathon._id}, {userId: {$ne: Meteor.userId()}}]}).fetch();
        return x;
    },
    'Yours': function() {
    //Your ideas
        var hackathon = Session.get("current_hackathon");
        if(!hackathon) return;
        var x = Ideas.find({ $and: [{hackathon_id: hackathon._id}, {userId: Meteor.userId()}]}).fetch();
        return x;
    }
}

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
        
//        x = _.sortBy(x, function (x) { return -x.hearts; });
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


