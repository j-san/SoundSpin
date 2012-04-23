
var songwriterDetails = function(user){
	var $body  = $('<div class="body"/>'),
 		$blockNav = $('<ol class="spin-items" style="float:right; width:30%;"/>').appendTo($body),
	 	$block = $('<div class="block-content loading"/>').appendTo($body),
		$songs = $('<div class="loading songs"/>').appendTo($body);

	SC.get('/users/' + user.id, {}, function(user){
		console.log('user' , user);
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
	});

	SC.get('/users/' + user.id + '/playlists', {}, function(albums){
		console.log('playlists',albums);
		$songs.removeClass('loading');
		$.each(albums, function(ind,album){
			var $album = $('<div class="nav album"/>')
					.data('panelType',"albumDetails")
					.data('album',album)
					.data('user',user)
					.appendTo($songs);
			var $artwork = $('<img class="artwork" />').appendTo($album);
			if(album.artwork_url){
				 $artwork.prop('src',album.artwork_url);
			}else{
				$artwork.prop('src','img/default_album.png');
			}
			$('<p>' + album.title + '</p>').appendTo($album);
		});
		var $album = $('<div class="nav album"/>').data('panelType',"allTracks").data('user',user).appendTo($songs);
		$('<img class="artwork" src="img/default_album.png" />').appendTo($album);
		$('<p>All</p>').appendTo($album);
	});

	return $body;
};



var songwriterSearch = function(){
	var url = '/users';
	var filter = {};

	var $body  = $('<div class="body"/>'),
		$filter = $('<div class="filter"/>').appendTo($body),
		$search = $('<form class="search"><input/></form>').submit(function(evt){
			evt.preventDefault();
			var q=$(this).find('input').val();
			songwriterSearchUpdateResults($block,'/users',{q:q})
		}).appendTo($body),
		$block = $('<div class="results"/>').appendTo($body);

	$('<button class="toggle-button">Followings</button>')
		.click(function(){
			$self = $(this);
			$self.toggleClass('pressed');
			if($self.hasClass('pressed')){
				url = '/me/followings';
			}else{
				url = '/users';
			}
			songwriterSearchUpdateResults($block,url,filter);
		}).appendTo($filter);
	/*
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
			filter.tag
		}else{
		}
		songwriterSearchUpdateResults($block,url,filter);
	});
	*/
	
	songwriterSearchUpdateResults($block,url);
	return $body;
};

var songwriterFollowings = function(user){
	var url = '/users/' + user.id + '/followings';

	var $body  = $('<div class="body"/>'),
		$filter = $('<div class="filter"/>').appendTo($body),
		$block = $('<div class="results"/>').appendTo($body);
	
	songwriterSearchUpdateResults($block,url);
	return $body;
};

var songwriterSearchUpdateResults = function($block, url, filter){
	$block.empty();
	$block.addClass('loading');
	if(this.xhr){
		this.xhr.abort();
	}
	this.xhr = SC.get(url, filter, function(results){
		$block.removeClass('loading');
		console.log('results',results);
		$.each(results, function(ind,author){
			$('<img class="nav" title="' + author.username + '" src="' + author.avatar_url + '"/>')
					.data({
						panelType: 'songwriterDetails',
						user: author
					})
					.appendTo($block);
		});
	});	
}
