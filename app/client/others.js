
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


var TeamFilters = { // TODO ADAM
    'All': function(){
        return Meteor.users.find().fetch();
    }
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



Template.person_filter.filters = function() {
        var filter_info = [];
        var total_count = 0;                                                                                 
        _.each(TeamFilters, function (key, value) {
            filter_info.push({filter: value, count: key().length});
        });

        filter_info = _.sortBy(filter_info, function (x) { return x.filter; });
        return filter_info;
};

Template.person_filter.selected = function() {
    return Session.equals('team_filter', this.filter) ? 'selected' : '';
}

Template.person_filter.events({ 
  'mousedown .filter': function () {
    if (Session.equals('team_filter', this.filter)) {
        //Session.set('idea_filter', null);
    } else {
        Session.set('team_filter', this.filter);
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
    // Session.set("selectedIdea", "");
    if(!profileSelected || profileSelected == "") {
        return false;
    } else {
        Session.set('profile_sidebarOpened', 'open');
        $('.pt-triggers, #pt-main, #title-bar').addClass('blur');
        return true;
    }
}

Template.sidebar.opened = function() {
    var ideaSelected = Session.get("selectedIdea");
    // Session.set("selectedIdea", "");
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
        });
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
            });

            window.FForm2 = new FForm( formWrap, {
                onReview : function() {
                    classie.add( document.body, 'overview' ); // for demo purposes only
                }
            });
        })();
    });    
}




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


var IdeaFilters = {
    'Hearted': function() {
        var hackathon = Session.get("current_hackathon");
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
    //Ideas that need your skills list
    'Needs your skills': function() {  
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
        //var x = Ideas.find({ $and: [{hackathon_id: hackathon._id}, {userId: {$ne: Meteor.userId()}}]}).fetch();
        var x = Ideas.find({hackathon_id: hackathon._id}).fetch();
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