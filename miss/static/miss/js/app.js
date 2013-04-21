var bing_apiKey = "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";
var map;

function init() {
    map = new OpenLayers.Map({
        div: "map",
    });

    var google_roadmap = new OpenLayers.Layer.Google("Google Roadmap", {type: google.maps.MapTypeId.ROADMAP});
    var google_satellite = new OpenLayers.Layer.Google("Google Satellite", {type: google.maps.MapTypeId.SATELLITE});
    var bing_aerial = new OpenLayers.Layer.Bing({
        name: "Bing Aerial",
        key: bing_apiKey,
        type: "Aerial"
    });

    // note that first layer must be visible
    map.addLayers([google_satellite, bing_aerial]);

    map.addControl(new OpenLayers.Control.LayerSwitcher());
    map.zoomToMaxExtent();


    //map = new OpenLayers.Map("map");
    
}

// Show messages
function show(type, m) {
  var dom = '<div class="alert alert-floating alert-' + type + ' fade in"><button type="button" class="close" data-dismiss="alert">&times;</button>' + m + '</div>';
  $(dom).appendTo('body');
  $(".alert").alert();
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


// Do
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