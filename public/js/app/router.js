(function($,ns) {
	
	var AppRouter = Backbone.Router.extend({

		routes: {
			"login_signup": "onLoginSignup",
			"oauth"    : "oauthCallback",
			"user/:id" : "userHome",
			"*actions"  : "defaultRoute"
		},

		defaultRoute: function( actions ) {
			var currUsername = StackMob.getLoggedInUser();
			if (currUsername) {
				var user = new StackMob.User({username: currUsername});
				user.fetch({
					success: function() {
						ns.appRouter.navigate("user/"+user.get("netflix_id"),{trigger: true});
					}
				});
				return;
			}
			ns.appRouter.navigate("login_signup",{trigger: true});
		},

		onLoginSignup: function() {
			if (!ns.objs.views.signup) {
				ns.objs.views.signup = new ns.SignupView();
				ns.objs.views.login = new ns.LoginView();
			}
			this.showPage("#login_signup");
		},

		oauthCallback: function( actions ) {
			// user should be logged in at this point.
			if (!StackMob.getLoggedInUser()) {
				ns.appRouter.navigate("",{trigger: true});
				return;
			}
			this.showPage("#oauth");
			var bar = $("#oauth .progress .bar"),
				search = location.search;

			if (search && search[0]=='?') {
				var oauth_token = _.find(search.substring(1).split("&"),
									function(q){return q.indexOf("oauth_token")!=-1});
				if (oauth_token) {
					oauth_token = encodeURIComponent(oauth_token.split("=")[1]);
					bar.animate({width: "90%"},1000);
					_.delay(function() {
						StackMob.customcode('oauth_token',{token: oauth_token},{
							success: function(result) {
								bar.width("100%");
								window.location = "/#user/"+result.userId;
							}
						});
					}, 1000);
				}
			}
		},

		userHome: function( userId ) {
			if (!userId || !StackMob.getLoggedInUser()) {
				ns.appRouter.navigate("",{trigger: true});
				return;
			}

			var initViews = function(userModel) {
				if (!ns.objs.views.topNavbar) {
					try {
						ns.objs.views.topNavbar = new ns.TopNavbarView({model: userModel});
						ns.objs.views.userProfile = new ns.UserProfileEditView({user: userModel});
					} catch(e) {
						console.error(e);
					}
				}
			};

			if (ns.objs.models.currentUser) {
				initViews(ns.objs.models.currentUser);
			} else {
				var user = new StackMob.User({username: StackMob.getLoggedInUser()});
				user.fetch({
					success: function(model) {
						ns.objs.models.currentUser = initViews(model);
					},
					error: function() {
						user.logout({
							success: function() {
								window.location = "/";
							}
						});
					}
				});
			}

			this.showPage("#user_home");
		},

		showPage: function(pageSel) {
			$("body > .page").addClass('hidden');
			$(pageSel).removeClass('hidden');
		}

	});

	$(function() {
		StackMob.init({
    		appName: "foobar",
    		clientSubdomain: "victordoss",
    		publicKey: "bdbf02ea-2def-4a89-8708-2f6c90f834a4",
    		apiVersion: 0
		});
		ns.objs = {views:{},models:{}};
		ns.appRouter = new AppRouter();
		Backbone.history.start();
	});

})(jQuery, FLIXBUD.namespace('main'));

