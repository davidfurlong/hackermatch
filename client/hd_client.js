if (Meteor.isClient) {
    /*
  Template.hello.greeting = function () {
    return "Welcome to hacker.dating.";
  };
  */

Router.map(function() {
      this.route('index', {path: '/'});
      this.route('home', {path: '/home'});
      this.route('signup');
      this.route('signup', {path: '/signup.html'});
      this.route('index', {path: '/index.html'});
      this.route('index', {path: '/index'});
      this.route('login', {path: '/login'});
      this.route('login', {path: '/login.html'});
});

/*
  Template.hello.events({
    'click input': function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });
  */
Template.home.events({
    'submit #idea-create' : function(e, t) {
      e.preventDefault();
      var q1 = t.find('#q1').value
        , q2 = t.find('#q2').value
        , cb1 = t.find('#cb1').value
        , cb2 = t.find('#cb2').value
        , cb3 = t.find('#cb3').value;

        console.log("q1: " + q1);
        console.log("q2: " + q2);
        console.log("cb1: " + cb1);
        console.log("cb2: " + cb2);
        console.log("cb3: " + cb3);
        // Trim and validate the input

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
    }
});
Template.update_user.events({
    'submit #update-user-form' : function(e, t) {
      e.preventDefault();
      var q1 = t.find('#user_name').value
        , q2 = t.find('#user_email').value
        , q3 = t.find('#user_skills').value
        , q4 = t.find('#user_github').value
        , q5 = t.find('#user_picture').value;

        console.log("q1: " + q1);
        console.log("q2: " + q2);
        console.log("q3: " + q3);
        console.log("q4: " + q4);
        console.log("q5: " + q5);
        // Trim and validate the input
        Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile.name":q1}});
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
            console.log('no user :(');
            Router.go('home');
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
          // The user has been logged in.
        }
      });
         return false; 
      }
  });
}

