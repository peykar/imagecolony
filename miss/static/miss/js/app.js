var bing_apiKey = "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";
var map, layers, controls;
var max_ajax_attempts = 3;

// Initialize the map
function init() {
  redrawContainer();

  map = new OpenLayers.Map({
      div: "map",
  });

  // Layers
  layers = {
    //google_roadmap: new OpenLayers.Layer.Google("Google Roadmap", {type: google.maps.MapTypeId.ROADMAP}),
    google_satellite: new OpenLayers.Layer.Google("Google Satellite", {type: google.maps.MapTypeId.SATELLITE}),
    bing_aerial: new OpenLayers.Layer.Bing({
        name: "Bing Aerial",
        key: bing_apiKey,
        type: "Aerial"
    }),
    vectorLayer: new OpenLayers.Layer.Vector("Vector Layer")
  }
  var layersArray = toArray(layers);

  // Controls
  controls = {
    layerSwitcher: new OpenLayers.Control.LayerSwitcher(),
    point: new OpenLayers.Control.DrawFeature(layers.vectorLayer, OpenLayers.Handler.Point)
  }
  var controlsArray = toArray(controls);

  // note that first layer must be visible
  map.addLayers(layersArray);
  map.addControls(controlsArray);

  map.zoomToMaxExtent();
}

// Redraw container
function redrawContainer() {
  $(".container-custom").css("height", $('body').innerHeight() - $("#header").outerHeight() - $("#topPanel").outerHeight() - $("#footer").outerHeight() + 5);
  $(".tab-content").css("height", $("#sidebar").innerHeight() - $(".nav-tabs").outerHeight());
}

$(window).on('resize', redrawContainer);

// cast object to array
function toArray(obj) {
  return $.map(obj, function(x) { return x; });
}

// Show messages
function show(type, m) {
  var dom = '<div class="alert alert-floating alert-' + type + ' fade in"><button type="button" class="close" data-dismiss="alert">&times;</button>' + m + '</div>';
  $(dom).appendTo('body');
  dom = $(".alert").alert();

  // Remove the message after 8 seconds
  setTimeout(function() {
    $(this).alert('close');
  }.bind(dom), 8000);
}

// Handle point selection on map
function featureAdded(e) {
  controls.point.deactivate();

  var point  = e.feature.geometry.toString();
  var bounds = e.feature.geometry.bounds;

  $("#pointLat").text(e.feature.geometry.x);
  $("#pointLon").text(e.feature.geometry.y);
  $("#zoomLevel").text(e.feature.layer.map.zoom);

  $("#point").val(point);
}

// Get dropdown items
function getTypes(subject, attempts) {
  attempts = attempts || 0;

  var dom = $("#" + subject);
  dom.attr('disabled', 'disabled');

  $.ajax({
    url: '/imagecolony/miss/' + subject,
    type: 'post',
    dataType: 'json',
    success: function(data) {
      var types = data.types;
      for(var i in types) {
        $('<option value="' + types[i][0] + '">' + types[i][1] + '</option>').appendTo(dom);
      }

      dom.removeAttr('disabled');
    },
    error: function() {
      if(attempts < max_ajax_attempts) {
        getTypes(subject, attempts + 1);
      } else {
        show("error", "Error loading! Please try again in a minute.");
      }
    }
  });
}

// Get locations list
function getList(limit, attempts) {
  limit = limit || 20;

  var wkt =  map.getExtent().toGeometry().toString();

  $.ajax({
    url: 'imagecolony/miss/region/list',
    type: 'post',
    dataType: 'json',
    data: "limit=" + limit + "&wkt=" + wkt,
    success: function(data) {
      if(data.success) {
        var list = data.regions,
             dom = $("#list .nav-list");

        for(var i in list) {
          $('<li class="clearfix" data-region="' + list[i].region + '" data-region-id="' + list[i].region_id + '"><a href="imagecolony/miss/vote/up/' + list[i].region_id + '" class="vote-up"><i class="icon-chevron-up"></i></a><a href="imagecolony/miss/vote/down/' + (list[i].region_id || "-") + '" class="vote-down"><i class="icon-chevron-down"></i></a><small class="score">(' + list[i].current_vote + ')</small><a href="#">' + list[i].name + '</a></li>').appendTo(dom);
        }

        dom.find(".vote-up, .vote-down").on('click', function(e) {
          e.preventDefault();
          $.ajax({
            url: this.href,
            type: 'post',
            dataType: 'json',
            success: function(data) {
              if(data.success) {
                show("success", "Your vote has been successfully submitted!");
                $(this).siblings(".score").text("(" + data.current_vote + ")");
              } else {
                show("error", data.message);
              }
            }.bind(this),
            error: function() {
              show("error", "Error voting! Try again shortly.");
            }
          });
        });
      } else {
        show("error", data.message);
      }
    },
    error: function() {
      if(attempts < max_ajax_attempts) {
        getList(limit, attempts + 1);
      } else {
        show("error", "Error loading! Please try again in a minute.");
      }
    }
  });
}

// Authentication
var authentication = {
  isLoggedIn: false,
  user: {
    name: ""
  },


  check: function() {
    this._isLoggedIn();
  },

  _isLoggedIn: function(callback) {
    $.ajax({
      url   : '/imagecolony/miss/user_info',
      dataType: 'json',
      type  : 'post',
      success : function(data) {
        this.isLoggedIn = data.success;
        this.user.name = data.name;
      }.bind(this),
      error : function() {
        this.isLoggedIn = false;
      }.bind(this),
      complete: this._updateDom.bind(this)
    });
  },

  _updateDom: function() {
    if(this.isLoggedIn) {
      $("#loginButton, #registerButton").hide();
      $("#logoutButton").show().find("#username").text(this.user.name);

    } else {
      $("#loginButton, #registerButton").show();
      $("#logoutButton").hide();
    }
  },

  login: function(username, password, success, error) {
    $.ajax({
      url   : '/imagecolony/miss/login',
      dataType: 'json',
      type  : 'post',
      data  : "username="+username+"&password="+password,
      success : success,
      error : error,
      complete: this.check.bind(this)
    });
  },

  logout: function() {
    $.ajax({
      url   : '/imagecolony/miss/logout',
      dataType: 'json',
      type  : 'post',
      success : function(data) {
        this.isLoggedIn = !data.success;
        this.user.name = "";
      }.bind(this),
      complete: this._updateDom.bind(this)
    });
  }
};

// Authentication
$(function() {
  authentication.check();
  $("#logout").click(function(e) {
    e.preventDefault();
    authentication.logout();
  });


  $('#login form').submit(function(e) {
    e.preventDefault();

    var form = $(this);

    // username
    var username = form.find("#loginUsername");
    var un = $.trim(username.val());
    if(un.length == 0) {
      show("error", "Enter your username.");
      username.focus();
      return false;
    }

    // password
    var password = form.find("#loginPassword");
    var psw = $.trim(password.val());
    if(psw.length == 0) {
      show("error", "Enter your password.");
      password.focus();
      return false;
    }

    // Disable the button to prevent multiple submits
    var btn = form.find('button[type="submit"], button[type="reset"]');
    btn.attr('disabled', 'disabled');
    form.find('button[type="reset"]').before('<span class="loading"></span>');

    authentication.login(un, psw,
      function(data) {
        if(data.success) {
          form.get(0).reset();
          $("#login").modal('hide');
        } else {
          show("error", data.message);
        }
        
        btn.removeAttr("disabled");
        form.find(".loading").remove();
      },
      function(data) {
        btn.removeAttr("disabled");
        form.find(".loading").remove();
        show("error", "An error occured! Please try again shortly.");
      }
    );
  });
  
  $('#register form').submit(function(e) {
    e.preventDefault();

    var form = $(this);

    // username
    var username = form.find("#regUsername");
    var un = $.trim(username.val());
    if(un.length == 0) {
      show("error", "Enter your desired username.");
      username.focus();
      return false;
    }

    // password
    var password = form.find("#regPassword");
    var confirmpsw = form.find("#regCPassword");
    var psw = $.trim(password.val());
    var confpsw = $.trim(confirmpsw.val());
    if(psw.length == 0) {
      show("error", "Enter your desired password.");
      password.focus();
      return false;
    }
    if(psw != confpsw) {
      show("error", "Passwords dont match!");
      confirmpsw.focus();
      return false;
    }

    // email
    var email = form.find("#regEmail");
    var eml = $.trim(email.val());
    if(eml.length == 0) {
      show("error", "Enter your email address.");
      email.focus();
      return false;
    }
    if(/^[a-zA-Z0-9\.]+@[a-zA-Z0-9\.]+\.[a-zA-Z]{2,4}$/.test(eml) == false) {
      show("error", "Invalid email address!");
      email.focus();
      return false;
    }

    // Disable the button to prevent multiple submits
    var btn = form.find('button[type="submit"], button[type="reset"]');
    btn.attr('disabled', 'disabled');
    form.find('button[type="reset"]').before('<span class="loading"></span>');

    $.ajax({
      url   : this.action,
      dataType: 'json',
      type  : 'post',
      data  : $(this).serialize(),
      success : function(data) {
        // Login if successfull
        if(data.success) {
          show("success", "Registered successfully. Logging in…");
          authentication.login(un, psw);

          form.get(0).reset();
          $("#register").modal('hide');
        } else {
          show("error", data.message);
        }

        btn.removeAttr('disabled');
        form.find(".loading").remove();
      },
      error : function() {
        show("error", "An error occured! Please try again shortly.");
      },
      complete: function() {
        btn.removeAttr('disabled');
        form.find(".loading").remove();
      }
    });
  });
});


// Do
$(function() {
  init();
  getList();
  getTypes("applications");
  getTypes("imageries");
  getTypes("imagery_problems");

  $('#addFeature').on('click', function(e) {
    e.preventDefault();

    layers.vectorLayer.removeAllFeatures()
    controls.point.activate();
    controls.point.events.on({
      'featureadded': featureAdded
    });
  });

  $("#add form").on('submit', function(e) {
    e.preventDefault();

    var form = $(this);

    // Disable the button to prevent multiple submits
    var btn = form.find('button[type="submit"], button[type="reset"]');
    btn.attr('disabled', 'disabled');
    form.find('button[type="reset"]').before('<span class="loading"></span>');

    $.ajax({
      url: this.action,
      dataType: 'json',
      type: 'post',
      data: $(this).serialize(),
      success : function(data) {
        if(data.success) {
          show("success", "Imagery problem submitted successfully!");
          $("#shareAim").fadeIn();
          form.get(0).reset();
          layers.vectorLayer.removeAllFeatures();
        } else {
          show("error", data.message);
        }
      },
      error : function() {
        show("error", "An error occured! Please try again shortly.");
      },
      complete: function() {
        btn.removeAttr('disabled');
        form.find(".loading").remove();
      }
    });
  });
});