
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


