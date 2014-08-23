
Meteor.startup(function () {
// code to run on server at startup
//    Ideas.remove({});
    var User = Meteor.users.findOne({"services.github.username":"kainolophobia"});
    console.log(User);
//    Meteor.users.remove({_id: "3QsrE6TsjakgjBuvP"});
    if(User) {
//        Meteor.users.remove({_id: User._id});
    } 
});

