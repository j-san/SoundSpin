

(function() {
	var soundspin = {
            views: {}
        }, // namespace declatration
        client_id = 'u9MitXmAQmMLJPiKtFHiQ',
		$player,
		player,
		this_application_url = 'http://j-san.github.com/SoundSpin/';

    soundspin.views = {};


	SC.initialize({
      client_id: client_id,
      redirect_uri: this_application_url + 'callback.html',
    });


    soundspin.AppRouter = Backbone.Router.extend({
        routes: {
            "musicians"            : "musicianSearch",
            "musician/:id"         : "musicianDetails",
            "musician/:id/favories": "musicianFavorites",
            "musician/:id/tracks"  : "musicianTracks",
            "album/:id"          : "albumDetails"
        },
        musicianDetails: function (id) {
            $.spin(new soundspin.views.MusicianDetails({userId: id}).render().$el);
        },
        musicianSearch: function (id) {
            $.spin(new soundspin.views.MusicianSearch().render().$el);
        }
    });


    soundspin.views.Home = Backbone.View.extend({
        tagName: "article",
        className: "home",

        events: {
            "click #connection": "connect"
        },

        render: function() {
            this.$el.append(JTmpl.call('Home'));

            soundspin.player   = new soundspin.views.SoundSpinPlayer({el: this.$('#player')});
            soundspin.playlist = new soundspin.views.SoundSpinPlaylist({el: this.$('#playlist')});

            if(SC.isConnected()) {
                this.$el.addClass('connected');

                this.loadFollowings();

                SC.get('/me/activities', {}, function(data) {
                    var i, showed = [];
                    
                    for(i in data.collection) {
                        var activity = data.collection[i];
                        if (activity.origin.track && showed.indexOf(activity.origin.track.id) < 0) {
                            var track = activity.origin.track;
                            if(!track.user) {
                                track.user = activity.origin.user;
                            }
                            showed.push(activity.origin.track.id);
                            soundspin.playlist.addTrack(track, track.user);
                        }
                    }
                });
            }else{
                // get some sample random tracks
                SC.get('/tracks',{limit:10},function(data){
                    soundspin.playlist.addTracks(data);
                });
            }

            return this;
        },
        connect: function() {
            SC.connect(function(){
                this.loadFollowings();
            });
        },
		loadFollowings: function() {
			SC.get('/me/followings',{},function(data){
				console.log('followings', data);
				if($connect){
					$connect.remove();
				}
				$.each(data, function(ind,author){
                    var img = author.avatar_url.replace(/large\.(\w{3})/,'badge.$1');
					$('<img class="nav" title="' + author.username + '" src="' + img + '"/>')
							.data({
								panelType: 'songwriterDetails',
								user: author
							})
							.prependTo($block);
				});
			});
		},
        follow: function() {
            this.$el.addClass('followed');
            this.$('.follow').addClass('loading');
            if(this.followed){
                SC.delete('/me/followings/' + user.id, function(data){
                    this.$('.follow').removeClass('loading');
                    this.$el.addClass('followed');
                    this.followed = false;
                });
            } else {
                SC.put('/me/followings/' + user.id, function(data){
                    this.$('.follow').removeClass('loading');
                    this.$el.addClass('followed');
                    this.followed = true;
                });
            }
        }
    });


    soundspin.views.MusicianDetails = Backbone.View.extend({
        tagName: "article",
        className: "musician-details",

        events: {
        },

        render: function() {
            var self = this;
            SC.get('/users/' + this.options.userId, {}, function(user){
                console.log('user' , user);
                self.$el.append(JTmpl.call('MusicianDetails',{
                    user: user,
                    avatar: user.avatar_url.replace('large','t300x300')
                }));
            });
            
            return this;
        }
    });

/*
                $block.removeClass('loading');
                $block.append('<a href="' + user.permalink_url + '" target="_blank">Voir sur Soundcloud</a>');
                $block.append('<h1>' + (user.full_name || user.username) + '</h1>');
                $block.append('<img class="resizable extended-artwork" src="' + user.avatar_url.replace('large','t300x300') + '" />');
                if(user.description){
                    $block.append('<p class="description">' + user.description + '</p>');
                }
                $('<li class="spin-item nav">' + user.public_favorites_count + ' Favorites</li>')
                        .data({
                            panelType: 'favorites',
                            user: user
                        }).appendTo($blockNav);
                $('<li class="spin-item nav">' + user.followings_count + ' Followings</li>')
                        .data({
                            panelType: 'followings',
                            user: user
                        })
                        .appendTo($blockNav);

                var $info = $('<div class="songwriter-info"/>').appendTo($block);
                
                function info(label, name){
                    if(user[name]){
                        $info.append('<p>' + label + ' <strong>' + user[name] + '</strong></p>');
                    }
                }
                info('Dicogs', 'discogs_name');
                info('Myspace', 'myspace_name');
                info('Country', 'country');
                info('City', 'city');

                if(user.website){
                    $info.append('<p><a href="' + user.website + '">' + (user.website_title || user.website) + '</a></p>');
                }

                if(SC.isConnected()){
                    $follow = $('<button>Follow</button>')
                            .data('follow',false)
                            .attr('disabled',true)
                            .appendTo($info);

                    $follow.click(function(){
                        $follow.attr('disabled',true);
                        if($follow.data('follow')){
                            SC.delete('/me/followings/' + user.id, function(data){
                                $follow.removeAttr('disabled');
                                $follow.text('Follow');
                                $follow.data('follow',false);
                            });
                        } else {
                            SC.put('/me/followings/' + user.id, function(data){
                                $follow.removeAttr('disabled');
                                $follow.text('Unfollow');
                                $follow.data('follow',true);
                            });
                        }
                    });

                    SC.get('/me/followings/' + user.id, function(error){
                        $follow.removeAttr('disabled');
                        if(!error) {
                            $follow.data('follow',true);
                            $follow.text('Unfollow');
                        }
                    });
                }

	$(function(){
		$(document.body).delegate('img.resizable','click',function(){
			if(this.src.indexOf('default_avatar_large.png')>=0){
				return;
			}
			var $body = $('<div class="body panel-image-view"/>');
			$body.append('<img src="' + this.src.replace(/large\.(\w{3})/,'crop.$1') + '" />');
			$.spin.removeAfter($(this).closest('.panel'));
			var $panel = $.spin($body, 'img');
		});
	});
*/



	var albumDetails = function(album,user){
		var $body  = $('<div class="body"/>'),
	 		$block = $('<div class="block-content"/>').appendTo($body),
			$songs = $('<div class="album-tracks"/>').appendTo($body);

		$block.append('<h1>' + (album.title) + '</h1>');
		console.log('album', album);
		if(album.artwork_url) {
			$block.append('<img class="resizable extended-artwork" src="' + album.artwork_url.replace('large','t300x300') + '" />');
		}
		if(album.description){
			$block.append('<p class="description">' + album.description + '</p>');
		}
		$block.append('<button>Play all</button>').click(function(){	
			player.addTracks(album.tracks);
			$set.find('.spin-item').addClass('disabled');
		});
		$set = $('<ol class="spin-items trackset"/>').appendTo($songs);
		$.each(album.tracks, function(ind,track){
			var $track = Items.clickable({title:track.title})
					.data('track',track)
					.addClass('no-arrow')
					.click(function(){
						if(!$track.hasClass('disabled')){
							player.addTrack($track.data('track'),user);
							$track.addClass('disabled');
						}
					}).appendTo($set);
			if(player.hasTrack(track)){
				$track.addClass('disabled');
			}
		});
		return $body;
	}

	var allTracks = function(user){
		var $body  = $('<div class="body"/>'),
			$songs = $('<div class="loading user-tracks"/>').appendTo($body);

		SC.get('/users/' + user.id + '/tracks', {}, function(tracks){
			$songs.removeClass('loading');
			$set = $('<ol class="spin-items trackset"/>').appendTo($songs);
			$.each(tracks, function(ind,track){
				var $track = Items.clickable({title:track.title})
						.data('track',track)
						.click(function(){
							if(!$track.hasClass('disabled')){
								player.addTrack($track.data('track'),user);
								$track.addClass('disabled');
							}
						}).appendTo($set);
				if(player.hasTrack(track)){
					$track.addClass('disabled');
				}
			});
		});

		return $body;
	};

	var songsSearch = function(){
		var url = '/users';
		var filter = {};

		var $body  = $('<div class="body"/>'),
			$filter = $('<div class="filter"/>').appendTo($body),
			$search = $('<form class="search"><input/></form>').submit(function(evt){
				evt.preventDefault();
				var q=$(this).find('input').val();
				songsSearchUpdateResults($block,'/tracks',{q:q})
			}).appendTo($body),
			$block = $('<div class="results"/>').appendTo($body);

		$('<button class="toggle-button">Favorites</button>')
			.click(function(){
				$self = $(this);
				$self.toggleClass('pressed');
				if($self.hasClass('pressed')){
					url = '/me/favorites';
				}else{
					url = '/tracks';
				}
				songsSearchUpdateResults($block,url,filter);
			}).appendTo($filter);
		
		$filter.append('<button class="toggle-button tag">Pop</button>');
		$filter.append('<button class="toggle-button tag">Rock</button>');
		$filter.append('<button class="toggle-button tag">Metal</button>');
		$filter.append('<button class="toggle-button tag">Indu</button>');
		$filter.append('<button class="toggle-button tag">Punk</button>');
		$filter.append('<button class="toggle-button tag">Ciber</button>');
		$filter.append('<button class="toggle-button tag">Electro</button>');
		
		$filter.delegate('.tag','click',function(){
			$self = $(this);
			$self.toggleClass('pressed');
			if($self.hasClass('pressed')){
			}else{
			}
			songwriterSearchUpdateResults($block,url,filter);
		});
		
		songwriterSearchUpdateResults($block,url);
		return $body;
	};
	

	var favorites = function(user){
		var url = '/users/' + user.id + '/favorites';

		var $body  = $('<div class="body"/>'),
			$filter = $('<div class="filter"/>').appendTo($body),
			$block = $('<div class="results"/>').appendTo($body);
		
		songsSearchUpdateResults($block,url);
		return $body;
	};

	var songsSearchUpdateResults = function($block, url, filter){
		$block.empty();
		$block.addClass('loading');
		if(this.xhr){
			this.xhr.abort();
		}
		this.xhr = SC.get(url, filter, function(results){
			$block.removeClass('loading');
			console.log('results',results);
			$.each(results, function(ind,track){
				var $track = Items.clickable({title:track.title})
						.data('track',track)
						.click(function(){
							if(!$track.hasClass('disabled')){
								player.addTrack($track.data('track'),user);
								$track.addClass('disabled');
							}
						}).appendTo($block);
			});
		});	
	}


	window.soundspin = soundspin; // namespace publication


	window.Items = {
		navigable:function(options){
			return $(
			'<a href="#user/123" title="' + (options.title || '') + '">\
				' + (options.icon? '<img class="spin-icon" src="' + options.icon + '" />': '') + '\
				<span class="spin-right">' + (options.info || '') + '</span>\
				' + (options.title || '') + '\
			</a>');
		},
		clickable:function(options){
			return $(
			'<li class="spin-item" title="' + (options.title || '') + '">\
				<span class="spin-left spin-title">' + (options.title || '') + '</span>\
				<span class="spin-right">' + (options.info || '') + '</span>\
			</li>');
		}
	};
}());
