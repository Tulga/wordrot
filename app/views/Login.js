define([
  "jquery",
  "underscore",
  "backbone",
  "layoutmanager",
  "app"],
  function($, _, Backbone, Layout, app) {

  "use strict";

  var Login = Backbone.Layout.extend({
    template: 'login',

    events: {
      "click button.login": "doLogin",
      "click a.logout": "doLogout"
    },

    initialize: function () {
      this.model = window.wordrot.user;
      var that = this;
      this.model.on('change', function(){
        that.render();
      });
    },

    doLogout: function(e) {
      e.preventDefault();
      var that = this;
      $.ajax(window.wordrot.config.apiRoot + '/auth/logout', {
        success: function() {
          app.user.clear();
        }
      })
    },

    // Holdover pending real authentication
    doLogin: function(e) {
      e.preventDefault();
      var $username = this.$el.find('input[name=username]')
        , username = $.trim($username.val());
      if(_.isEmpty(username)) {
        return;
      }
      $.ajax({
        url: window.wordrot.config.apiRoot + '/auth/switch/' + username,
        success: function() {
          app.user.fetch();
        }
      });
    }
  });

  return Login;

});