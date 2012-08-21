(function($,ns) {

	ns.TopNavbarView = Backbone.View.extend({

		el: "#user_home .navbar-fixed-top",

      events: {
         'click #logout' : 'onLogout'
      },

		initialize: function() {
			var model = ns.objs.currentUser;
			if (model) {
				this.model = model;
				this.setUserHandle();
			} else {
				model = new StackMob.User({username: StackMob.getLoggedInUser()});
				model.fetch({
					success: _.bind(function(m) {
						this.model = m;
						this.setUserHandle();
					},this)
				});
			}
		},

		setUserHandle: function() {
			this.$("#handle_display").text('@'+this.model.get('handle'));
		},

		onLogout: function() {
			this.model.logout({
				success: function() {
					ns.appRouter.navigate("signup_login",{trigger: true});
					return false;
				}
			});
		}
	});

})(jQuery, FLIXBUD.namespace("main"));
