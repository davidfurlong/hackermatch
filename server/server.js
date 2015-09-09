var csv = Meteor.npmRequire('csv'); 
var fs = Meteor.npmRequire('fs');
var path = Meteor.npmRequire('path');

function loadHtn(hackathon_id) {
    var basepath = path.resolve('.').split('.meteor')[0];
    var record_count = 0;
    var stream = fs.createReadStream(basepath+'htn.csv');
    //console.log(stream);
    stream.pipe(
    csv.parse     ()).pipe(
    csv.transform (Meteor.bindEnvironment(function(record){
        
        var username = "htn_user" + record_count;
        var email = "notset"+record_count+"@hackermat.ch";
        record_count++;
        var name = record[1],
            contact = record[2],
            dev_skills = record[3],
            design_skills = record[4],
            other_skills = record[5],
            linkedin = record[6],
            github = record[7],
            personal_site = record[8],
            cool_stuff = record[9],
            university = record[10],
            looking_for = record[11];
        var profile = {
            name: name,
            login: username,
//            hackathon_id: hackathon_id,
            contact: contact,
            dev_skills: dev_skills,
            design_skills: design_skills,
            other_skills: other_skills,
            urls: {
                linkedin: linkedin,
                github: github,
                personal_site: personal_site
            },
            cool_stuff: cool_stuff,
            university: university,
            looking_for: looking_for
        };
        var password = "bogus_password";
        var options = {
            username: username,
            email: email,
            password: password,
            profile: profile
        }
        console.log(profile);
        console.log("htn user: " + record_count);
        console.log(username);
        
        var user = Accounts.createUser(options);
        console.log(user);
    })));
}

function loadData(hackathon_id) {
  var basepath = path.resolve('.').split('.meteor')[0];
  //console.log(basepath);
  //console.log(csv);
  var stream = fs.createReadStream(basepath+'mhacks.csv');
  //console.log(stream);
    stream.pipe(
    csv.parse     ()).pipe(
    csv.transform (Meteor.bindEnvironment(function(record){
        var user = record[0],
            email = record[1],
            idea = record[3];
        var idea = {
            description: idea,
            hackathon_id: hackathon_id,
            user_profile: {
                name: user,
                email: email,
                contact: email
            },
            skills: {
                frontend: false,
                backend: false,
                ios: false,
                android: false,
                design: false,
                hardware: false 
            },
            comments: {}
        }
        Meteor.call('create_idea', idea, function(err, res) {});
        // return record.map(function(value){return value.toUpperCase()});
    })));
}

Meteor.startup(function () {
    // code to run on server at startup
    var User = Meteor.users.findOne({"services.github.username":"kainolophobia"});
    //    var User = Meteor.users.findOne({"services.github.username":"jumploops"});
    if(User) {
    //        Meteor.users.remove({_id: User._id});
    } 
    var hackathons = Hackathons.remove({"title":"blah"});

    // TODO
    if (false && Hackathons.find().count() === 0) {
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
        var hackathon = Hackathons.findOne({url_title: 'hackthenorth'});
        if(hackathon) {
            loadHtn(hackathon._id);
        }
    }
});

Meteor.publish("user_repos", function(userId){
    return UserRepos.find({userId: userId});
})

Meteor.publish("user_notifications", function(){
    return Notifications.find({userId: this.userId});
});

Meteor.publish("user_messages_and_profiles", function(){
    // get messages -> get users
    var m = Messages.find({$or: [{user1: this.userId}, {user2: this.userId}]});
    var convoPartners = [];
    for(var i = 0; i< m.length; i++){
        if(m[i].user1 == this.userId){
            convoPartners.push(m[i].user2);
        }
        else {
            convoPartners.push(m[i].user1);
        }
    }
    return [
        Messages.find({$or: [{user1: this.userId}, {user2: this.userId}]}),
        Meteor.users.find({_id: {$in: convoPartners}})
    ]
});

Meteor.publish("hackathon", function(url_title){
    return Hackathons.find({url_title: url_title});
});

// Meteor.publish("one_users_ideas_not_in_hackathon", function(hackathon_id){
//     return Ideas.find({$and: [{userId: this.userId},{$not: {hackathon_id: hackathon_id}}, {duplicate: {$exists: false}}, {$not: {$and: [{},{}]}}}]})
// });

Meteor.publish("users", function(){
    return Meteor.users.find({});
});

Meteor.publish("users_essentials", function(){
    return Meteor.users.find({}, {fields: {_id: 1, "profile.avatar_url":1, "profile.login": 1, "profile.name": 1}});
});

Meteor.publish("user", function (username) {
    return Meteor.users.find({'services.github.username': username}); 
});

Meteor.publish("user_profile", function(userid) {
    return Meteor.users.find({_id:userid});
});
     
Meteor.publish("one_users_ideas", function (){
    return Ideas.find({userId: this.userId});
});

Meteor.publish("ideaFull", function(ideaId){
    return [
        Ideas.find({'_id': ideaId}),
        Comments.find({ideaId: ideaId}),
        Hearts.find({ $and: [{idea_id: ideaId}, {user_id: this.userId}]})
    ];
});

// TODO Very inefficient function that finds hackathon by title, then uses 
// the id of the returned hackathon to "publish" the cursor of that 
// same hackathon. Should probably get cursor first, then return it 
// after fetching id.
Meteor.publish("hackathon_and_ideas", function (hackathon_title, limit) {
    var hackathon = Hackathons.findOne({ url_title: hackathon_title});
    var hackathon_id = null;
   
    if(hackathon) {
        hackathon_id = hackathon._id; 
    }

    if (Roles.userIsInRole(this.userId, ['hacker', 'organizer', 'admin'], hackathon_title)) {
        return [
            // Need to remove users and comments from access like this
            Comments.find({}),
            // end TODO
            Hackathons.find({_id: hackathon_id}),
            //Ideas.find({hackathon_id: hackathon_id}, {limit: limit}),
            Ideas.find({hackathon_id: hackathon_id}),
            Hearts.find({ $and: [{hackathon_id: hackathon_id}, {user_id: this.userId}]})
        ];
    } else {
        // user not authorized. do not publish secrets
        this.stop();
        return;
    }
});

Meteor.publish("hackathon_admin", function(hackathon_title){
    var hackathon = Hackathons.findOne({url_title: hackathon_title});

    var ideas = Ideas.find({hackathon_id: hackathon._id}, {_id: 1}).fetch();
    var ideaIds = ideas.map(function(idea){
        return idea._id;
    });

    if (Roles.userIsInRole(this.userId, ['creator', 'organizer', 'admin'], hackathon_title)) {
        var query = {
            roles: {}
        };
        query["roles"][hackathon_title] = ['hacker'];
        return [
            Hearts.find({hackathon_id: hackathon._id}),
            Comments.find({ideaId: {$in: ideaIds}}),
            Ideas.find({hackathon_id: hackathon._id}, {_id: 1}),
            Hackathons.find({url_title: hackathon_title}),
            Meteor.users.find(query)
        ]
    } 
    else {
        // user not authorized. do not publish secrets
        this.stop();
        return;
    }
});

// TODO this name is unclear
Meteor.publish("users_and_hackathon", function (hackathon_title, filters, limit) {
    var user = Meteor.users.findOne({_id: this.userId});
    var hackathon = Hackathons.findOne({url_title: hackathon_title});
    var hackathon_id = null;
    if(hackathon) {
        hackathon_id = hackathon._id; 
    }
    if (Roles.userIsInRole(this.userId, ['hacker', 'organizer', 'admin'], hackathon_title)) {
        var query = {
            roles: {}
        };
        query["roles"][hackathon_title] = ['hacker'];

        if(filters && filters.length) {

            _.each(filters, function(filter) {

                query["profile.skills." + filter] = true;
            });
/*
        "skills" : {
            "backend" : true,
            "design" : false,
            "hardware" : false,
            "mobile" : false,
            "webdev" : true
        },
*/
        }

        return Meteor.users.find(query, {limit: limit});
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
    } 
    else { // user not authorized. do not publish secrets
        this.stop();
        return;
    }
});

// server: publish the set of parties the logged-in user can see.
Meteor.publish("myHackathons", function () {
    var user = Meteor.users.findOne({_id: this.userId});
    if(!user) return;
    var hackathonList = [];
    _.each(user.roles, function(role, hackathon) {
        var entry = {};
        entry['url_title'] = hackathon;
        if(role.length != 0)
            hackathonList.push(entry);
    });
    if(hackathonList.length) {
        return Hackathons.find({$or: hackathonList});
    } else {
        return;
    }
});
