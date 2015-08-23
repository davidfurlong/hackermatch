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

Hearts = new Meteor.Collection("Hearts");

Notifications = new Meteor.Collection("Notifications");

// stores [{type, message, url, priority, timestamp, hackathonId}]
// types: welcome, comment, heart, postcomment
// priority: 1, 2, 3 (3 is highest)