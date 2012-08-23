(function($,ns) {

	ns.SignupView = Backbone.View.extend({

		el: "#login_signup #signup",

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
					user.login(true,{
						success: _.bind(function(model, data) {
							this.$('button[type="submit"]').removeClass('disabled');
							ns.objs.views.linkNetflixView = new ns.LinkNetflixView({model: user});
						}, this)
					});
				},this),
				error: _.bind(function(model, data) {
					var submitBtn = this.$('button[type="submit"]').removeClass('disabled');
					if (data.error) { 
						if(data.error.indexOf("Duplicate") != -1) {
							data.error = ns.nls.userExists;
						}
						submitBtn.siblings(".help-inline").text(data.error).removeClass('hidden')
								.closest('.control-group').addClass('error');
					}
				},this)
			});
			return false;
		}

	});

	ns.LoginView = ns.SignupView.extend({

		el: "#login_signup #login",

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
			user.login(true, {
				success: _.bind(function() {
					user.fetch({
						success: _.bind(function() {
							this.$('button[type="submit"]').removeClass('disabled');
							ns.objs.models.currentUser = user;
							ns.appRouter.navigate("user/"+user.get("netflix_id"),{trigger: true});
						}, this)
					});
				},this),
				error: _.bind(function(data) {
					var submitBtn = this.$('button[type="submit"]').removeClass('disabled');
					if (data.error) {
						submitBtn.siblings(".help-inline").text(data.error_description).removeClass('hidden')
							.closest('.control-group').addClass('error');
					}
				}, this)
			});
			return false;
		}

	});

	ns.LinkNetflixView = Backbone.View.extend({
		
		el: "#connect-modal",

		events: {
			"click #netflix-connect": "onConnectClick"
		},

		initialize: function() {
			this.$el.modal({backdrop: 'static',keyboard: false});
			this.handle = this.$("#handle");
		},

		onConnectClick: function() {
			var btn = this.$("#netflix-connect"),
				val = $.trim(this.handle.val()),
				controlGrp = this.$(".control-group.handle");

			btn.addClass('disabled');
			controlGrp.removeClass('error');

			if (!val) {
				controlGrp.addClass('error').find(".help-block").html(ns.nls.usernameEmpty);
				btn.removeClass('disabled');
				return false;
			}
			var query = new StackMob.Collection.Query(),
				users = new StackMob.Users();

			query.select('handle');
			query.equals('handle',val);

			users.bind('reset', _.bind(function() {

				if (users.length > 0) {
					btn.removeClass('disabled');
					controlGrp.addClass('error').find(".help-block").html(ns.nls.usernameExists);
					return ;
				}

				this.model.save({handle: val},{
					success: _.bind(this.redirectToNetflix, this)
				});

			},this));

			users.query(query);
			return false;
		},

		redirectToNetflix: function() {
			StackMob.customcode('oauth_redirect_url',{username: this.model.get('username')},{
				success: function(result) {
					var cbUrl = String(top.location).replace(/#[^#]*$/,"")
												+ "#oauth"
					top.location = result.url+"&oauth_callback="+encodeURIComponent(cbUrl);
				}
			});
		}

	});

})(jQuery, FLIXBUD.namespace("main"));

