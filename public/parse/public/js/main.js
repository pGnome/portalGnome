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


$(function() {
    Parse.initialize("28PBuP52sksBKQskvbMEyny2jVhaECzQ72gyIqsI", "o0AtN7gd9eQgPYBiCia202rDYNwYAYsnOcVfCfQ2");

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

        render: function(e) {
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

            Parse.User.signUp(username, password, {
                ACL: new Parse.ACL()
            }, {
                success: function(user) {
                    console.log("signed up")
                    console.log(user.get("username"));
                    new ManageGardenView();

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
    var MenuView = Parse.View.extend({
        events: {
            "click #logOut": "logOut",
            "click #settings": "settings",
            "click #dashboard": "dashboard"
        },

        el: ".menu",

        initialize: function() {
            _.bindAll(this);
            this.render();
        },
        dashboard: function(e) {
            if (this.currentView)
                this.currentView.undelegateEvents();
            delete this.currentView;
            this.currentView = new ManageGardenView();

        },

        settings: function(e) {
            this.currentView.undelegateEvents();
            delete this.currentView;
            this.currentView = new SettingsView();

        },

        logOut: function(e) {
            console.log("Logged Out");

            Parse.User.logOut();
            new LogInView();
            this.undelegateEvents();
            delete self;
        },
        render: function(e) {
            this.$el.html(_.template($("#menu-template").html()));
            this.delegateEvents();
            this.currentView = new ManageGardenView();

            $("#signedInUser").append(Parse.User.current().get("username"));


        }

    });
    var SettingsView = Parse.View.extend({
        events: {
            "click #setLocation": "updateAddress"
        },

        el: ".content",

        initialize: function() {
            _.bindAll(this);
            this.render();
        },


        render: function(e) {
            this.$el.html(_.template($("#settings-template").html()));
            this.delegateEvents();

        },

        updateAddress: function() {
            console.log("Update Address")
            var geocoder = new google.maps.Geocoder();
            var address = document.getElementById("address").value;
            geocoder.geocode({
                'address': address
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var lat = results[0].geometry.location.latitude
                    var lon = results[0].geometry.location.longitude
                    console.log("lat: " + lat + " lon: " + lon)
                }
            });
        }

    });

    var ManageGardenView = Parse.View.extend({
        events: {
            "click #setMoistureLevel": "setMoistureLevel"
        },

        el: ".content",

        initialize: function() {
            _.bindAll(this);
            this.render();

            this.currentUser = Parse.user.current();
        },




        setMoistureLevel: function(e) {
            var newLevel = $(".dial").attr('value');

            var MoistureSetting = Parse.Object.extend("MoistureSetting");
            var newMoistureSetting = new MoistureSetting();
            newMoistureSetting.set("level", newLevel);
            newMoistureSetting.save({
                level: parseInt(newLevel)
            }, {
                success: function(setting) {
                    // The object was saved successfully.
                    alert("Moisture Level Set at: " + newLevel);
                },
                error: function(setting, error) {
                    // The save failed.
                    // error is a Parse.Error with an error code and description.
                    alert("error: " + error);
                }
            });
        },

        render: function(e) {
            this.$el.html(_.template($("#manageGarden-template").html()));
            this.delegateEvents();
            console.log("ManageGardenView");



            //MOISTURE

            var MoistureReading = Parse.Object.extend("Moisture");
            var query = new Parse.Query(MoistureReading);

            // query.equalTo("user", currentUser);

            query.descending("createdAt");
            query.first({
                success: function(reading) {
                    // current moisture level
                    var level = reading.get("level");
                    $("#currentMoistureLevel").append(level);
                    $('.dial').attr('value', level);
                    // $(".dial").knob();
                },
                error: function(object, error) {
                    console.log("Error retreiving Moisture Level");
                }

            });
            setInterval(function() {
                var query = new Parse.Query(MoistureReading);
                query.descending("createdAt");
                query.first({
                    success: function(reading) {
                        // current moisture level
                        $("#currentMoistureLevel").html(reading.get("level"));
                        // $(".dial").knob();

                    },
                    error: function(object, error) {
                        console.log("Error retreiving Moisture Level");
                    }

                });
            }, 60000);


            $(".dial").knob();




            //CHARTS
            var gatheredChart = document.getElementById("waterGathered").getContext("2d");
            new Chart(gatheredChart).Line({
                labels: ["January", "February", "March", "April", "May", "June", "July"],
                datasets: [{
                    fillColor: "rgba(220,220,220,0.5)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    data: [65, 59, 90, 81, 56, 55, 40]
                }]
            });

            var ctx = document.getElementById("waterConsumed").getContext("2d");
            new Chart(ctx).Line({
                labels: ["January", "February", "March", "April", "May", "June", "July"],
                datasets: [{
                    fillColor: "rgba(220,220,220,0.5)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    data: [65, 59, 90, 81, 56, 55, 40]
                }]
            });



            var Barrel = Parse.Object.extend("Barrel");
            query = new Parse.Query(Barrel);
            query.descending("createdAt");
            query.first({
                success: function(reading) {

                    var currentLevel = [reading.get("level")];


                    var bwl = document.getElementById("barrelWaterLevel").getContext("2d");
                    new Chart(bwl).Bar({
                        labels: [""],
                        datasets: [{
                                fillColor: "rgba(220,220,220,0.5)",
                                strokeColor: "rgba(220,220,220,1)",
                                data: currentLevel
                            },

                        ]
                    }, {

                        //Boolean - If we show the scale above the chart data
                        scaleOverlay: false,

                        //Boolean - If we want to override with a hard coded scale
                        scaleOverride: true,

                        //** Required if scaleOverride is true **
                        //Number - The number of steps in a hard coded scale
                        scaleSteps: 20,
                        //Number - The value jump in the hard coded scale
                        scaleStepWidth: 5,
                        //Number - The scale starting value
                        scaleStartValue: 0,

                        //String - Colour of the scale line
                        scaleLineColor: "rgba(0,0,0,.1)",

                        //Number - Pixel width of the scale line
                        scaleLineWidth: 1,

                        //Boolean - Whether to show labels on the scale
                        scaleShowLabels: true,

                        //Interpolated JS string - can access value
                        scaleLabel: "<%=value%>",

                        //String - Scale label font declaration for the scale label
                        scaleFontFamily: "'Arial'",

                        //Number - Scale label font size in pixels
                        scaleFontSize: 12,

                        //String - Scale label font weight style
                        scaleFontStyle: "normal",

                        //String - Scale label font colour
                        scaleFontColor: "#666",

                        ///Boolean - Whether grid lines are shown across the chart
                        scaleShowGridLines: false,

                        //String - Colour of the grid lines
                        scaleGridLineColor: "rgba(0,0,0,.05)",

                        //Number - Width of the grid lines
                        scaleGridLineWidth: 1,

                        //Boolean - If there is a stroke on each bar
                        barShowStroke: true,

                        //Number - Pixel width of the bar stroke
                        barStrokeWidth: 0,

                        //Number - Spacing between each of the X value sets
                        barValueSpacing: 0,

                        //Number - Spacing between data sets within X values
                        barDatasetSpacing: 0,

                        //Boolean - Whether to animate the chart
                        animation: true,

                        //Number - Number of animation steps
                        animationSteps: 60,

                        //String - Animation easing effect
                        animationEasing: "easeOutQuart",

                        //Function - Fires when the animation is complete
                        onAnimationComplete: null

                    });
                },
                error: function(object, error) {
                    console.log("Error retreiving Barrel Level");
                }

            });
            var index = 0;
            var pumpOn = false;
            setInterval(function() {
                console.log("animating");
                if (pumpOn) {
                    switch (index) {
                        case 0:
                            $("#isWatering").css("background-image", "url('img/sprinkler.png')");
                            index = 1;
                            break;
                        case 1:
                            $("#isWatering").css("background-image", "url('img/sprinkler-1.png')");
                            index = 2;
                            break;
                        case 2:
                            $("#isWatering").css("background-image", "url('img/sprinkler-2.png')");
                            index = 3;
                            break;
                        case 3:
                            $("#isWatering").css("background-image", "url('img/sprinkler-3.png')");
                            index = 0;
                            break;
                    }
                }
            }, 1000);


            setInterval(function() {
                var pumpReading = Parse.Object.extend("Pump");
                var query = new Parse.Query(pumpReading);
                query.descending("createdAt");

                var id = 0;
                query.first({
                    success: function(reading) {
                        // current moisture level
                        console.log(reading);
                        if (reading.get("isWatering")) {
                            console.log("isWatering");
                            pumpOn = true;
                            // console.log(id)
                        } else {
                            // clearInterval(id);
                            pumpOn = false;
                        }

                    },
                    error: function(object, error) {
                        console.log("Error retreiving Moisture Level");
                    }

                });


            }, 10000);




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
                new MenuView();
            } else {
                new LogInView();
            }
        }
    });

    new AppView;
});