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
Template.signup.events({
    'submit #register-form' : function(e, t) {
      e.preventDefault();
      var email = t.find('#q2').value
        , password = t.find('#q5').value;

        console.log("email: " + email);
        console.log("password: " + password);
        // Trim and validate the input

      Accounts.createUser({email: email, password : password}, function(err){
          if (err) {
            console.error('no user :(');
            alert('This email is already registered');
            // Inform the user that account creation failed
          } else {
            console.log('created user!');
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
}

