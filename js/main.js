$(document).ready(function () {

$(function() {

Parse.initialize("28PBuP52sksBKQskvbMEyny2jVhaECzQ72gyIqsI", "o0AtN7gd9eQgPYBiCia202rDYNwYAYsnOcVfCfQ2");

// $('#moistureButton').on('click', function (e) {

//     var moistureLevel = $(".knob").attr('value')
//     console.log(moistureLevel);

//      var TestObject = Parse.Object.extend("Moisture");
//      var testObject = new TestObject();
//        testObject.save({level: parseInt(moistureLevel)}, {
//        success: function(object) {
//          $(".success").show();
//        },
//        error: function(model, error) {
//          $(".error").show();
//        }
//      });

// })
// The Application
// ---------------

// The main view that lets a user manage their todo items

var LogInView = Parse.View.extend({
  events: {
    "submit form.login-form": "logIn",
    "click #signup": "signUp"
  },

  el: ".content",

  initialize: function() {
    _.bindAll(this, "logIn");
    this.render();
  },

  logIn: function(e) {
    var self = this;
    var username = this.$("#login-username").val();
    var password = this.$("#login-password").val();

    Parse.User.logIn(username, password, {
      success: function(user) {
        new ManageGardenView();
        self.undelegateEvents();
        delete self;
      },

      error: function(user, error) {
        self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
        this.$(".login-form button").removeAttr("disabled");
      }
    });

    this.$(".login-form button").attr("disabled", "disabled");



    return false;
  },

  signUp: function(e) {
    new SignUpView();
    delete self;
  },

  render: function() {
    this.$el.html(_.template($("#login-template").html()));
    this.delegateEvents();
  }
});

var SignUpView = Parse.View.extend({
  events: {
    "submit form.signup-form": "signUp"
  },

  el: ".content",

  initialize: function() {
    _.bindAll(this, "signUp");
    this.render();
  },

  signUp: function(e) {
    var self = this;
    var username = this.$("#signup-username").val();
    var password = this.$("#signup-password").val();

    Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
      success: function(user) {
        console.log("signed up")
        self.undelegateEvents();
        delete self;
      },

      error: function(user, error) {
        self.$(".signup-form .error").html(error.message).show();
        this.$(".signup-form button").removeAttr("disabled");
      }
    });

    this.$(".signup-form button").attr("disabled", "disabled");

    return false;
  },

  render: function() {
    this.$el.html(_.template($("#signup-template").html()));
    this.delegateEvents();
  }
});




var AppView = Parse.View.extend({
  // Instead of generating a new element, bind to the existing skeleton of
  // the App already present in the HTML.
  el: $("#pGnome"),

  initialize: function() {
    this.render();
  },

  render: function() {
    if (Parse.User.current()) {
      console.log("Logged In");
      new ManageGardenView();
    } else {
      new LogInView();
    }
  }
});
  new AppView
});
});