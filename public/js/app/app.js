(function($,ns) {

	ns._OAuth = Backbone.Model.extend({

		defaults: {
			requestTokenURL: "http://api.netflix.com/oauth/request_token",
			requestTokenMethod: "GET",
			userAuthorizationURL: "https://api-user.netflix.com/oauth/login",
			signatureMethod: "HMAC-SHA1"
		},

		requestToken: function(consumerKey,consumerSecret) {
			var message = {
				action: this.get('requestTokenURL'),
				method: this.get('requestTokenMethod'),
				parameters: {
					oauth_consumer_key: consumerKey,
					oauth_signature_method: this.get('signatureMethod'),
					callback: "?"
				}
			}, accessor = {
				consumerKey: consumerKey,
				consumerSecret: consumerSecret
			};
			OAuth.setTimestampAndNonce(message);
			OAuth.SignatureMethod.sign(message, accessor);
			var parameters = OAuth.getParameterMap(message.parameters);
			$.get(message.action, parameters, _.bind(function(data) {
				this.set(_.extend({oauth_consumer_key: consumerKey}, OAuth.getParameterMap(data)));
			},this));
		},

		doLoginDance: function(login_url) {
				location.href = OAuth.addToURL(login_url, {
					oauth_token: this.get('oauth_token'),
					oauth_consumer_key: this.get('oauth_consumer_key'),
					application_name: this.get('application_name'),
					oauth_callback: location.href
				});
		}

	});
	ns.OAuth = new ns._OAuth();

	ns.ConnectNetflixView = Backbone.View.extend({

		el: "#flixbud-netflix-connect",

		events: {
			"click" : "onConnectClick"
		},

		initialize: function() {
			this.model.bind('change:login_url', this.doLoginDance, this);
		},

		onConnectClick: function() {
			this.model.requestToken("s6uzs9m93tpa2ybamggbhgys","4ryjZ3Z3wm");
		},

		doLoginDance: function(model,login_url) {
			this.model.doLoginDance(login_url);
		}

	});
	new ns.ConnectNetflixView({model: ns.OAuth});


	ns.SignupView = Backbone.View.extend({

		el: "#signup",

		events: {
			'blur .username': 'validateUsername',
			'blur .password': 'validatePassword',
			'click button[type="submit"]' : 'onSubmit'
		},

		validateUsername: function() {
			var username = this.$(".username")
				,val = username.val();

			if (!/\S+@\S+\.\S+/.test(val)) {
				username.siblings(".help-inline").removeClass("hidden")
					.closest(".control-group").addClass("error");
				return false;
			}
			username.siblings(".help-inline").addClass("hidden")
					.closest(".control-group").removeClass("error");
			return true;
		},

		validatePassword: function() {
			var password = this.$(".password")
				,val = password.val();

			if (!val) {
				password.siblings(".help-inline").removeClass("hidden")
					.closest(".control-group").addClass("error");
				return false;
			}
			password.siblings(".help-inline").addClass("hidden")
					.closest(".control-group").removeClass("error");
			return true;
		},

		reset: function() {
			this.$(".error").removeClass(".error");
			this.$(".help-inline").addClass("hidden");
		},

		onSubmit: function() {
			this.reset();
			if (!this.validateUsername() || !this.validatePassword()) {
				return false;
			}
			var user = new StackMob.User({
									username: this.$(".username").val(),
									password: this.$(".password").val()
								});
			this.$('button[type="submit"]').addClass("disabled");
			user.create({
				success: _.bind(function(model, data) {
					this.$('button[type="submit"]').removeClass('disabled');
				},this),
				error: _.bind(function(model, data) {
					var submitBtn = this.$('button[type="submit"]').removeClass('disabled');
					if (data.error && data.error.indexOf("Duplicate") != -1) {
						submitBtn.siblings(".help-inline").removeClass('hidden')
							.closest('.control-group').addClass('error');
					}
				},this)
			});
			return false;
		}

	});

	new ns.SignupView();

})(jQuery, FLIXBUD.namespace("main"));

StackMob.init({
	appName: 'foobar',
	version: 0,
	dev: true
});
