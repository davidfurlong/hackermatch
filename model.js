
Idea = function (doc) {
  _.extend(this, doc);
};
_.extend(Idea.prototype, {
  sayName: function () {
    console.log(this.name);
  }
});

Ideas = new Meteor.Collection("Ideas", {
  transform: function (doc) { return new Idea(doc); }
});

Comments = new Meteor.Collection("Comments");

Hackathons = new Meteor.Collection("Hackathons");


create_hackathon = function(title) {
    
    console.log(title);

    //check for valid title
    if(!title) {
        //Err out
        return false;
    }

    var url_title = encodeURI(title.toLowerCase().replace(/ /g, ''));

    var hash = ((Math.floor(Math.random() * 1e8) + new Date().getMilliseconds()).toString(36)).toUpperCase();

    var hackathon = {
        title: title,
        url_title: url_title,
        invite_code: hash
/*
        description: description,
        userId: Meteor.userId(),
        avatar_url: Meteor.user().profile.avatar_url,
        skills: {
            webdev: webdev,
            backend: backend,
            mobile: mobile,
            design: design,
            hardware: hardware
        },
        comments: {}
*/
    };

    var exists = Hackathons.findOne({title: title});
    if(exists) {
        console.log("hackathon exists!");
        //do something else
        //can we select on name attribute again?
    }

    Hackathons.insert(hackathon, function(err, result) {
        if(err) {
            console.log("error creating hackathon");
        } else {
            console.log("hackathon created!");
            
            //reset input field
        }

//            Router.go('home');
    });
    return false;
}

