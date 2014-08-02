/*
Ideas.insert({name: "raptor", sound: "roar"});
Ideas.findOne({name: "raptor"}).makeNoise(); // prints "roar"

var myMessages = Messages.find({userId: Session.get('myUserId')}).fetch();
*/




Router.map(function() {
    this.route('index', {
        path: '/',
        onBeforeAction: function () {
            if (Meteor.user()) {
                Router.go('home');
            }
         }

    });
    this.route('home', {
        path: '/home',
        onBeforeAction: function () {
            if (!Meteor.user()) {
              if (Meteor.loggingIn()) {
              }
              else{
                Router.go('login');
              }
            }
         }
    });
    this.route('signup');
    this.route('login');
});

Template.ideaList.helpers({
  ideas: function() {
        var x =  Ideas.find().fetch();
        return x;
  }
});

Template.yourIdeaList.helpers({
  ideas: function() {
        return Ideas.find({userId: Meteor.userId()}).fetch();
  }
});
Template.home.helpers({
    ideas: function() {
        return Ideas.find({userId: Session.get('myUserId')}).fetch();
    }
});

Template.home.events({
    'submit #idea-create' : function(e, t) {
      e.preventDefault();
      var description = t.find('#q1').value
        , name = t.find('#q2').value
        , webdev = t.find('#cb1').value
        , design = t.find('#cb2').value
        , backend = t.find('#cb3').value
        , mobile = t.find('#cb4').value
        , hardware = t.find('#cb5').value;

        var idea = {
            name: name,
            description: description,
            userId: Meteor.userId(),
            skills: {
                webdev: webdev,
                backend: backend,
                mobile: mobile,
                design: design,
                hardware: hardware
            },
            comments: {}
        };
        console.log("idea create: ");
        console.dir(idea);

        var exists = Ideas.findOne({name: name});
        if(exists) {
            console.log("idea exists!");
            //do something else
            //can we select on name attribute again?
        }

        //Ideas.insert({name: name}, function(err, result) {
        Ideas.insert(idea, function(err, result) {
            if(err) {
                console.log(err);
                console.log(result);
                console.log("error creating idea");
            } else {
                console.log('created idea!');
                //hackety hackety hack
                //using pageTransitions library, instead of Meteor routing...
                $("#my-group").trigger("click");
            }
        });
        return false;
    }
});
Template.update_user.helpers({
    name: function() {
        if(Meteor.user().profile) {
            return Meteor.user().profile.name; 
        } 
    },
    github: function() {
        if(Meteor.user().profile) {
            return Meteor.user().profile.github; 
        }
    }
});
Template.update_user.events({
    'submit #update-user-form' : function(e, t) {
      e.preventDefault();
      console.dir(t);
      console.dir(t.find('#cb1').checked);
      var q1 = t.find('#user_name').value
        , q2 = t.find('#user_email').value
        , q3 = t.find('#user_skills').value
        , q4 = t.find('#user_github').value
        , q5 = t.find('#user_picture').value
        , webdev = t.find('#cb1').checked
        , design = t.find('#cb2').checked
        , backend = t.find('#cb3').checked
        , mobile = t.find('#cb4').checked
        , hardware = t.find('#cb5').checked;

        var profile = {
            name: q1,
            github: q4,
            skills: {
                backend: backend,
                design: design,
                hardware: hardware,
                mobile: mobile,
                webdev: webdev
            }
        };
            
        console.log("q1: " + q1);
        console.log("q2: " + q2);
        console.log("q3: " + q3);
        console.log("q4: " + q4);
        console.log("q5: " + q5);
        // Trim and validate the input
        Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile":profile}});
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




Template.signup.events({
    'submit #register-form' : function(e, t) {
      e.preventDefault();
      var email = t.find('#q2').value
        , name = t.find('#q1').value
        , github = t.find('#q4').value
        , webdev = t.find('#q1b').value
        , backend = t.find('#q2c').value
        , mobile = t.find('#q3a').value
        , design = t.find('#q4a').value
        , hardware = t.find('#q5a').value
        , password = t.find('#q5').value;

        console.log("email: " + email);
        console.log("password: " + password);
        // Trim and validate the input
        var options = {
            email: email,
            password: password,
            profile: {
                name: name,
                github: github,
                skills: {
                    webdev: webdev,
                    backend: backend,
                    mobile: mobile,
                    design: design,
                    hardware: hardware
                }
            }
        };
        console.log("options: ");
        console.dir(options);

        Accounts.createUser(options, function(err){
          if (err) {
            console.error('no user :(');
            alert('This email is already registered');
            // Inform the user that account creation failed
          } else {
            console.log('created user!');
            console.dir(options);
            Router.go('home');
            // Success. Account has been created and the user
            // has logged in successfully. 
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
            console.log("success!");
            Router.go('home');
          // The user has been logged in.
        }
      });
         return false; 
      }
});

