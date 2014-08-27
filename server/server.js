var csv = Meteor.require('csv'); 
var fs = Meteor.require('fs');
var path = Npm.require('path');

function loadData(hackathon_id) {
  var basepath = path.resolve('.').split('.meteor')[0];
  //console.log(basepath);
  //console.log(csv);
  var stream = fs.createReadStream(basepath+'mhacks.csv');
  //console.log(stream);
    stream.pipe(
    csv.parse     ()).pipe(
    csv.transform (Meteor.bindEnvironment(function(record){
/*
        var idea = {
            name: name,
            description: description,
            userId: Meteor.userId(),
            hackathon_id: hackathon._id,
//            avatar_url: Meteor.user().profile.avatar_url,
//            github_username: Meteor.user().profile.login,
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
    */
        var user = record[0],
            email = record[1],
            idea = record[3];
        //console.log("user: " + user);
        //console.log("email: " + email);
        //console.log("idea: " + idea);
        var idea = {
            description: idea,
            hackathon_id: hackathon_id,
            user_profile: {
                name: user,
                email: email,
                contact: email
            },
            skills: {
                webdev: false,
                backend: false,
                mobile: false,
                design: false,
                hardware: false 
            },
            comments: {}
        }
        //console.log(idea);
        Meteor.call('create_idea', idea, function(err, res) {});
//        return record.map(function(value){return value.toUpperCase()});
    })));
}


Meteor.startup(function () {
// code to run on server at startup
//    Ideas.remove({});
    var User = Meteor.users.findOne({"services.github.username":"kainolophobia"});
//    var User = Meteor.users.findOne({"services.github.username":"jumploops"});
    //console.log(User);
    if(User) {
//        Meteor.users.remove({_id: User._id});
    } 
    var hackathons = Hackathons.remove({"title":"blah"});
//    var hackathons = Hackathons.remove({});
//    var ideas = Ideas.remove({});
    //console.log(hackathons);

    if (Hackathons.find().count() === 0) {
        var names = ["MHacks",
                     "YC Hacks",
                     "HackMIT"
                    ];
        for (var i = 0; i < names.length; i++) {
            Meteor.call('create_hackathon', names[i]);
        }
        var hackathon = Hackathons.findOne({url_title: 'mhacks'});
        if(hackathon) {
            loadData(hackathon._id);
        }
    }
});

Meteor.publish("user", function (username) {

    return Meteor.users.find({'services.github.username': username}); 
});

//Very inefficient function that finds hackathon by title, then uses 
// the id of the returned hackathon to "publish" the cursor of that 
// same hackathon. Should probably get cursor first, then return it 
// after fetching id.
Meteor.publish("hackathon_and_ideas", function (hackathon_title) {
    
    var url_title = encodeURI(hackathon_title.toLowerCase().replace(/ /g, ''));
    var hackathon = Hackathons.findOne({url_title: url_title});
    
    var hackathon_id = null;
    if(hackathon) {
        hackathon_id = hackathon._id; 
    }

    if (Roles.userIsInRole(this.userId, ['hacker', 'organizer', 'admin'], url_title)) {
        return [
    // Need to remove users and comments from access like this
            Comments.find({}),
    // end TODO
            Hackathons.find({_id: hackathon_id}),
            Ideas.find({hackathon_id: hackathon_id}),
            Hearts.find({ $and: [{hackathon_id: hackathon_id}, {user_id: this.userId}]})
        ];
    } else {
        // user not authorized. do not publish secrets
        this.stop();
        return;
    }
});


// server: publish the set of parties the logged-in user can see.
Meteor.publish("hackathons", function () {
    if (Roles.userIsInRole(this.userId, ['admin'], 'all')) {

        return Hackathons.find({});

    } else {
        // user not authorized. do not publish secrets
        this.stop();
        return;
    }
});

// server: publish the set of parties the logged-in user can see.
Meteor.publish("myHackathons", function () {
    var user = Meteor.users.findOne({_id: this.userId});
    //console.log(user);
    if(!user) return;
    var hackathonList = [];
    _.each(user.roles, function(role, hackathon) {
        var entry = {};
        if(role == "admin") {
            //console.log("admin role found");
        }
        //console.log(role);
        //console.log(hackathon);
        entry['url_title'] = hackathon;
        hackathonList.push(entry);
    });
    //console.dir(hackathonList);
    if(hackathonList.length) {
        return Hackathons.find({$or: hackathonList});
    } else {
        return
    }
    //return Hackathons.find({$or: hackathonList}).fetch();
});




