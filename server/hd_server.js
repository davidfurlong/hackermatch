
Meteor.startup(function () {
// code to run on server at startup
//    Ideas.remove({});
    var User = Meteor.users.findOne({"services.github.username":"kainolophobia"});
//    var User = Meteor.users.findOne({"services.github.username":"jumploops"});
    console.log(User);
//    Meteor.users.remove({_id: "3QsrE6TsjakgjBuvP"});
   if(User) {
//        Meteor.users.remove({_id: User._id});
    } 
    var hackathons = Hackathons.remove({"title":"blah"});
    console.log(hackathons);

    if (Hackathons.find().count() === 0) {
      var names = ["MHacks",
                   "YC Hacks",
                   "HackMIT"
                   ];
      for (var i = 0; i < names.length; i++) {
        create_hackathon(names[i]);
      }
    }
});

