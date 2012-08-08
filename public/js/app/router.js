(function($,ns) {
	
	var AppRouter = Backbone.Router.extend({

		routes: {
			"/oauth"    : "oauthCallback",
			"/user/:id" : "userHome",
			"*actions"  : "defaultRoute"
		},

		defaultRoute: function( actions ) {
		},

		oauthCallback: function( actions ) {
		},

		userHome: function( actions ) {
		}

	});

	ns.AppRouter = new AppRouter();

	Backbone.history.start();

})(jQuery, FLIXBUD.namespace('main'));
