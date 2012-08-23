(function($,ns) {

	ns.MainUserView = Backbone.View.extend({

		el: "#user_main",

		initialize: function(options) {
			this.history = options.history;
			this.user = options.user;

			var q = new StackMob.Collection.Query();
			q.mustBeOneOf('history', this.history.pluck('history_id'));

			var users = new StackMob.Users();
			users.query(q, {
				success: function(result) {
				}
			});
		}

	});

	function declareModels() {
		ns.MovieHistoryModel = StackMob.Model.extend({
			idAttribute: "history_id",
			schemaName: "history"
		});

		ns.MovieHistoryCollection = StackMob.Collection.extend({

			model: ns.MovieHistoryModel,

			comparator: function(movie) {
				return -movie.get("viewed_time");
			}

		});

		ns.MovieModel = StackMob.Model.extend({
			idAttribute: "movie_id",
			schemaName: "movie"
		});

		ns.MoviesCollection = StackMob.Collection.extend({
			model: ns.MovieModel
		});
	}

	ns.TopNavbarView = Backbone.View.extend({

		el: "#user_home .navbar-fixed-top",

      events: {
         'click #logout' : 'onLogout'
      },

		initialize: function() {
			this.setUserHandle();
		},

		setUserHandle: function() {
			this.$("#handle_display").text('@'+this.model.get('handle'));
		},

		onLogout: function() {
			this.model.logout({
				success: function() {
					window.location = "/";
					return false;
				}
			});
		}
	});

	ns.UserProfileEditView = Backbone.View.extend({

		el: "#profile_modal",

		events: {
			"click #recently_watched .thumbnail .add-movie": "onAddMovie",
			"click #save_profile": "onSaveProfile"
		},

		box_art_map: {
			"like" : "box_art_large",
			"ok"   : "box_art_medium",
			"neeh" : "box_art_small"
		},

		initialize: function(options) {
			this.template = _.template($("#recently_watch_item_tmpl").html());
			this.$el.modal({backdrop: 'static',keyboard: false});
			this.user = options.user;
			if (!ns.MovieHistoryModel) { //FIXME: hack
				declareModels();
			}
			this.bindProfileEvents(new ns.MoviesCollection());
			this.loadCurrentHistory();
		},

		onSaveProfile: function() {
			try {
				var profile_ids = this.profile.pluck("movie_id"),
					existing_movies = new ns.MoviesCollection(),
					mq = new StackMob.Collection.Query(),
					_self = this;

				mq.mustBeOneOf('movie_id', profile_ids);
				existing_movies.query(mq, {
					success: _.bind(function(existing) {
						var new_movies = _.difference(profile_ids,existing.pluck("movie_id")).map(function(mid){return _self.profile.get(mid)}),
							ex_movies = _.difference(this.profile.models,new_movies).map(function(mod){ return mod.id; });
						if (new_movies.length>0) {
							this.user.addRelationship("profile", new_movies);
						}
						if (ex_movies.length>0) {
							this.user.appendAndSave("profile", ex_movies);
						}
					},this)
				});
				return false;

				this.user.addRelationship("profile",this.profile,{
					success: _.bind(function() {
						this.$el.modal('hide');	
					},this)
				});
			} catch(e) {
				console.error(e);
			}
			return false;
		},

		bindHistoryEvents: function(history) {
			this.history = history;
			history.bind("add", this.historyAddOne, this);
			history.bind("reset", this.historyAddAll, this);
		},

		bindProfileEvents: function(profile) {
			this.profile = profile;
			this.profile.bind("add", this.profileAddOne, this);
			this.profile.bind("reset", this.profileAddAll, this);
		},

		profileAddOne: function(movie) {
			movie.bind("change:ratingidx", this.shiftBoxArt, this);
			movie.bind("change:rating", this.onRatingChange, this);
			movie.set({rating: "like"});
		},
		
		onRatingChange: function(movie, newRating) {
			var curr = this.$("#movie_profile .thumbnail."+movie.get('rating')),
				empty = curr.filter(".empty:first");

			if (empty[0]) {
				movie.set("ratingidx", $.inArray(empty[0],curr));
			} else {
				movie.set("ratingidx", 0);
				curr.each(function(){
					var mv = $(this).data("last-movie-model") || $(this).data("movie-model"),
						rIdx = (mv.get("ratingidx") || 0)+1;

					if (rIdx < curr.length) {
						mv.set({ratingidx: rIdx});
					} else {
						var cRat = mv.get("rating");
						if (cRat == "like") {
							mv.set({rating: "ok",ratingidx: 0});
						} else if (cRat == "ok") {
							mv.set({rating: "neeh",ratingidx: 0});
						}
					}
				});
			}
		},

		shiftBoxArt: function(movie, newIdx) {
			var mvNode = $(this.$("#movie_profile .thumbnail."+movie.get('rating')).get(newIdx));
			this.setBoxArtImg(mvNode, movie);
		},

		setBoxArtImg: function(mvNode, mvModel) {
			var imgattr = this.box_art_map[mvModel.get("rating")];
			if (imgattr) {
				$("img",mvNode).attr("src",mvModel.get(imgattr));
				mvNode.removeClass("empty");
				var mm = mvNode.data("movie-model");
				if (mm) {
					mvNode.data("last-movie-model",mm);
				}
				mvNode.data("movie-model",mvModel);
			}
		},

		profileAddAll: function(movie) {
			this.history.each(_.bind(this.profileAddOne,this));
		},

		historyAddOne: function(movie) {
			this.$("#recently_watched .thumbnails").append(this.template(movie.toJSON()));
		},

		historyAddAll: function() {
			this.history.each(_.bind(this.historyAddOne,this));
		},

		onAddMovie: function(e) {
			try {
				var movie_id = $(e.target).data("movie-id");
				if (!movie_id) {
					console.error("No movie id");
					return;
				}
				var mv = _.clone(this.history.get(movie_id).toJSON());
				mv.movie_id = mv.history_id;
				delete mv.history_id;
				delete mv.dvd;
				delete mv.viewed_time;
				this.profile.add(new ns.MovieModel(mv));
			} catch (e) {
				console.error(e);
			}
			e.preventDefault();
			return false;
		},

		addToProfile: function(movie) {
			var profileMovies = $("#movie_profile thumbnail img");
				first = profileMovies.filter(":first");
		},

		loadCurrentHistory: function() {
			var history = this.user.get('history');
			if (!history || history.length == 0) {
				// First time.
				this.syncFromNetflix();
				return;
			}
			var q = new StackMob.Model.Query();
			q.setExpand(1);
			q.select('history').select('history.*');
			this.user.query(q,{
				success: _.bind(function() {
					this.syncFromNetflix();
				},this)
			});
		},

		syncFromNetflix: function() {
			var currHistory = new ns.MovieHistoryCollection(),
					historyData = this.user.get('history');
			this.bindHistoryEvents(currHistory);
			if (historyData) {
				currHistory.add(historyData);
			}
			
			StackMob.customcode('call_netflix', {url: this.recentlyWatched()}, {
				success: _.bind(function(data) {
					if (data && data.response) {
						var history = JSON.parse(data.response).rental_history;
						if (!history) {
							alert("Error calling Netflix. Try refreshing the page");
							return;
						}
						var items = _.map(history.rental_history_item, function(h){
														var netflix_id = h.id.substring(h.id.lastIndexOf("/")+1);
														return new ns.MovieHistoryModel({
															history_id: netflix_id,
															average_rating: h.average_rating,
															box_art_large: h.box_art.large,
															box_art_medium: h.box_art.medium,
															box_art_small: h.box_art.small,
															release_year: h.release_year,
															title: h.title.regular,
															viewed_time: (h.watched_date || h.shipped_date)*1000,
															dvd: h.shipped_date ? true : false,
															url: _.find(h.link,function(l){return l.rel == "alternate"}).href
														});
													})
							,newHistory = _.filter(items,function(i){
												return currHistory.get(i.id) ? false : true;
											},this);
						if(newHistory.length > 0) {
							currHistory.add(newHistory);
							this.user.addRelationship('history', newHistory);
						}
						this.initMain();
					}
				}, this)
			});
		},

		recentlyWatched: function() {
			return "/users/"+this.user.get('netflix_id')+"/rental_history?output=json";
		},

		initMain: function() {
			ns.objs.views.mainView = new ns.MainUserView({user: this.user, history: this.history});
		}

	});


})(jQuery, FLIXBUD.namespace("main"));
