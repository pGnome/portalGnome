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
        "click #moisture": "moisture",
        "click #data": "data"

    },

    el: ".menu",

    initialize: function() {
        _.bindAll(this);
        this.render();
    },
    moisture: function(e) {
        if (this.currentView)
            this.currentView.undelegateEvents();
        delete this.currentView;
        this.currentView = new MoistureView();

    },
    data: function(e) {
        if (this.currentView)
            this.currentView.undelegateEvents();
        delete this.currentView;
        this.currentView = new DataView();

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
        this.currentView = new MoistureView();

        $("#signedInUser").append(Parse.User.current().get("username"));


    }

});
var SettingsView = Parse.View.extend({
    events: {
        "click #setLocation": "updateLocation",
        "click #setSchedule": "updateSchedule",
        "click #manualOveride": "manualOveride"
    },

    el: ".content",

    initialize: function() {
        _.bindAll(this);
        this.render();
    },


    render: function(e) {

        this.$el.html(_.template($("#settings-template").html()));
        this.delegateEvents();
        var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        $("[name='my-checkbox']").bootstrapSwitch();

        for (var day in days) {
           var name = days[day];
             // console.log()
             // console.log(  $("#" + name + "  > #from").val)
             $("#" + name + "  > #at").timepicker();




         }
         var Manual = Parse.Object.extend("Manual");
         var query = new Parse.Query(Manual);
         query.descending("createdAt");
         query.first({
                    success: function(result) {
                        // current moisture level
                       $('#manualOveride').prop('checked', result.get("override"));


                    },
                    error: function(object, error) {
                        console.log("Error retreiving Manual");
                    }

                });


     },
     manualOveride: function(){
        var value = $("#manualOveride").val();
        var Manual = Parse.Object.extend("Manual");
        var manual = new Manual();
        var state = $('#manualOveride').prop('checked');
        console.log(state);
        if(state){

            manual.set("override",true);

        }
        else{
            manual.set("override",false);

        }
        manual.save();

     },
     updateSchedule: function(){
        $(function () {
            var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            var Schedule = Parse.Object.extend("Schedule");

            for (var day in days) {
                var name = days[day];
                var at = $("#" + name + "  > #at").val();
                var duration = parseInt($("#" + name + "  > #duration").val());

                if(!duration){
                    duration = 0;
                }
                if(!at){
                    at = "";
                }

                var Schedule = Parse.Object.extend("Schedule");

                var schedule = new Schedule();
                schedule.set("day", name);
                schedule.set("at", at);
                schedule.set("duration", duration);



                schedule.save(null, {
                  success: function(schedule) {
                    // Execute any logic that should take place after the object is saved.
                    manualOveride();
                },
                error: function(schedule, error) {
                    // Execute any logic that should take place if the save fails.
                    // error is a Parse.Error with an error code and description.
                    console.log("Error saving schedule");
                }
            });


            }

        });

},

updateLocation: function() {

    var geocoder = new google.maps.Geocoder();
    var latitude, longitude;

    var address = (document.getElementById("zipcode").value);
    console.log(address);
    geocoder.geocode({
        'address': address
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            longitude = results[0].geometry.location.A;
            latitude = results[0].geometry.location.k;

            console.log(latitude);
            console.log(longitude);

            var Location = Parse.Object.extend("Location");
            var location  = new Location();
            location.set("lon",longitude);
            location.set("lat",latitude);
            location.save(null, {
              success: function(schedule) {
                                        // Execute any logic that should take place after the object is saved.

                                    },
                                    error: function(schedule, error) {
                                        // Execute any logic that should take place if the save fails.
                                        // error is a Parse.Error with an error code and description.
                                        console.log("Error saving schedule");
                                    }
                                });

                    // var geoUrl = 'https://api.forecast.io/forecast/' + '7160deca2c6bcb9e35b9bf9b6ade6675' + '/' + latitude + ',' + longitude;
                    var embedUrl = "http://forecast.io/embed/#lat=" + latitude + "&lon=" + longitude;

                    $('#forecast_embed').attr("src",embedUrl);

                } else {
                    alert("Geocode was not successful for the following reason: " + status);
                }
            });

}
});



var MoistureView = Parse.View.extend({
    events: {
        "click .setMoistureButton": "setMoistureLevel"
    },

    el: ".content",

    initialize: function() {
        _.bindAll(this);
        this.render();

        this.currentUser = Parse.User.current();


    },




    setMoistureLevel: function(e) {
        var clickedEl = $(e.currentTarget);
        var zone = clickedEl.attr("id");


        var user = this.currentUser;
        console.log(user.get("username"));


        var newLevel = $("#zone"+zone).attr('value');

        var MoistureSetting = Parse.Object.extend("MoistureSetting");
        var newMoistureSetting = new MoistureSetting();
        newMoistureSetting.set("level", newLevel);
        newMoistureSetting.set("gnomeZone", parseInt(zone));


            // var relation = newMoistureSetting.relation("user");
            // relation.add(user);
            // console.log(this.currentUser.get());

            // newMoistureSetting.setACL(new Parse.ACL(Parse.User.current()));

            newMoistureSetting.save({
                level: parseInt(newLevel),
            }, {
                success: function(setting) {
                    // The object was saved successfully.
                    alert("Moisture Level Set for Zone " + zone + ": " + newLevel);


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

            $("#zone1").knob();
            $("#zone2").knob();
            $("#zone3").knob();


            // $('.graphs').slick();

            moisture();
            //Setting
            var MoistureSettingReading = Parse.Object.extend("MoistureSetting");
            var mSQuery = new Parse.Query(MoistureSettingReading);
            mSQuery.descending("createdAt");

            for(var zone= 1;zone<4;zone++){
                console.log(zone);
                mSQuery.equalTo("gnomeZone",zone);

                mSQuery.first({
                    success: function(reading) {
                        // current moisture level
                        console.log(reading);
                        var level = reading.get("level");
                        var gnomeZone = reading.get("gnomeZone");
                        var gnomeZoneId = "#zone"+gnomeZone;
                        console.log("ZONE DIAL " + gnomeZoneId);
                        $(gnomeZoneId).val(level).trigger('change')


                    },
                    error: function(object, error) {
                        console.log("Error retreiving Moisture Level");
                    }

                });
            }
            //MOISTURE

            var MoistureReading = Parse.Object.extend("Moisture");
            var mQuery = new Parse.Query(MoistureReading);

            // query.equalTo("user", this.currentUser);
            var zones = [1,2,3];
            mQuery.descending("createdAt");
            for(var zone= 1;zone<4;zone++){
                console.log(zone);
                mQuery.equalTo("gnomeZone",zone);

                mQuery.first({
                    success: function(reading) {
                        // current moisture level
                        console.log(reading);
                        var level = reading.get("level");
                        var gnomeZone = reading.get("gnomeZone");

                        var zoneId = '#mlevel-' + gnomeZone;
                        var dialzoneId = '#zone' + gnomeZone;


                        $(zoneId).append(level);


                    },
                    error: function(object, error) {
                        console.log("Error retreiving Moisture Level");
                    }

                });
            }

            // setInterval(function() {
            //     for(var zone= 1;zone<4;zone++){
            //                     console.log(zone);
            //                     mQuery.equalTo("gnomeZone",zone);

            //                     mQuery.first({
            //                         success: function(reading) {
            //                             // current moisture level
            //                             console.log(reading);
            //                             var level = reading.get("level");
            //                             var gnomeZone = reading.get("gnomeZone");

            //                             var zoneId = '#mlevel-' + gnomeZone;
            //                             console.log(zoneId);
            //                             $(zoneId).append(level);

            //                             // $(zoneId).attr('value', level);
            //                             // $(".dial").knob();
            //                         },
            //                         error: function(object, error) {
            //                             console.log("Error retreiving Moisture Level");
            //                         }

            //                     });
            //                 }


            // }, 600000);








            // var index = 0;
            // var pumpOn = false;
            // setInterval(function() {
            //     console.log("animating");
            //     if (pumpOn) {
            //         switch (index) {
            //             case 0:
            //                 $("#isWatering").css("background-image", "url('img/sprinkler.png')");
            //                 index = 1;
            //                 break;
            //             case 1:
            //                 $("#isWatering").css("background-image", "url('img/sprinkler-1.png')");
            //                 index = 2;
            //                 break;
            //             case 2:
            //                 $("#isWatering").css("background-image", "url('img/sprinkler-2.png')");
            //                 index = 3;
            //                 break;
            //             case 3:
            //                 $("#isWatering").css("background-image", "url('img/sprinkler-3.png')");
            //                 index = 0;
            //                 break;
            //         }
            //     }
            // }, 1000000);


            // setInterval(function() {
            //     var pumpReading = Parse.Object.extend("Pump");
            //     var query = new Parse.Query(pumpReading);
            //     query.descending("createdAt");

            //     var id = 0;
            //     query.first({
            //         success: function(reading) {
            //             // current moisture level
            //             console.log(reading);
            //             if (reading.get("isWatering")) {
            //                 console.log("isWatering");
            //                 pumpOn = true;
            //                 // console.log(id)
            //             } else {
            //                 // clearInterval(id);
            //                 pumpOn = false;
            //             }

            //         },
            //         error: function(object, error) {
            //             console.log("Error retreiving Moisture Level");
            //         }

            //     });


            // }, 10000);




}
});

function moisture(){
    var MoistureReading = Parse.Object.extend("Moisture");
    var mQuery = new Parse.Query(MoistureReading);

    var moistureData = [];
    var labelsX= [];

    allMoistureQuery = new Parse.Query(MoistureReading);
    allMoistureQuery.descending("createdAt");
    allMoistureQuery.limit(25);
    // if(zone){
    //     allMoistureQuery.equalTo("zone",zone);

    // }
    allMoistureQuery.find({
        success: function(reading) {
                // current moisture level
                var i = 0;
                reading.forEach(function(moistureReading) {
                    console.log(moistureReading.get("level"));
                    moistureData.push(moistureReading.get("level"));
                    labelsX.push("");


                });

                //CHARTS


                var gatheredChart = document.getElementById("#moistureHistory").getContext("2d");
                new Chart(gatheredChart).Line({
                    labels: labelsX,
                    datasets: [{
                        fillColor: "rgba(220,220,220,0.5)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        data: moistureData
                    }]
                });

            },
            error: function(object, error) {
                console.log("Error retreiving Moisture Levels");
            }

        });

}
var DataView = Parse.View.extend({
    events: {
    },

    el: ".content",

    initialize: function() {
        _.bindAll(this);
        this.render();

        this.currentUser = Parse.User.current();


    },



    render: function(e) {
        this.$el.html(_.template($("#data-template").html()));
        this.delegateEvents();


        var Location = Parse.Object.extend("Location");
        var locQuery = new Parse.Query(Location);
        locQuery.descending("createdAt");


        locQuery.first({
          success: function(location) {
                    // current moisture level
                    var embedUrl = "http://forecast.io/embed/#lat=" + location.get("lat") + "&lon=" + location.get("lon");

                    $('#forecast_embed').attr("src",embedUrl);

                },
                error: function(object, error) {
                   console.log("Error retreiving Location");
              }

          });

        moisture();












var Barrel = Parse.Object.extend("Barrel");
var barrelQuery = new Parse.Query(Barrel);
barrelQuery.descending("createdAt");
barrelQuery.first({
    success: function(reading) {

        var currentLevel = [reading.get("level")];


        var bwl = document.getElementById("barrelWaterLevel").getContext("2d");
        new Chart(bwl).Bar({
            labels: [""],
            datasets: [{
                fillColor: "rgba(135,206,250,0.5)",
                strokeColor: "rgba(220,220,220,1)",
                data: currentLevel
            },

            ],


        }, {

                    //Boolean - If we show the scale above the chart data
                    scaleOverlay: false,

                    //Boolean - If we want to override with a hard coded scale
                    scaleOverride: true,

                    //** Required if scaleOverride is true **
                    //Number - The number of steps in a hard coded scale
                    scaleSteps: 10,
                    //Number - The value jump in the hard coded scale
                    scaleStepWidth: 10,
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
                    scaleGridLineColor: "rgba(,0,0,.05)",

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


barrelData = [];

barrelQuery.find({
    success: function(reading) {
                // current moisture level
                reading.forEach(function(barrelReading) {
                    console.log(barrelReading.get("level"));
                    barrelData.push(barrelReading.get("level"));



                });

                //CHARTS
                var ctx = document.getElementById("waterConsumed").getContext("2d");
                new Chart(ctx).Line({
                    labels: ["January", "February", "March", "April", "May", "June", "July"],
                    datasets: [{
                        fillColor: "rgba(135,206,250,0.5)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        data: barrelData
                    }]
                });

            },
            error: function(object, error) {
                console.log("Error retreiving barrel Levels");
            }

        });
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