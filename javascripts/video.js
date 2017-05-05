var video = (function(){
	var self = {},
	userdata,
	player;

	self.setUserData = function(data){
		userdata = data;
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	}

	onYouTubeIframeAPIReady = function () {
		player = new YT.Player('video', {
      height: '244',
      width: '434',
      videoId: userdata,  // youtube video id
      playerVars: {
        'autoplay': 0,
        'rel': 0,
        'showinfo': 0,
        'enablejsapi': 1
      },
      events: {
        'onStateChange': onPlayerStateChange,
        'onReady': onPlayerReady
      }
    });
	}

	onPlayerStateChange = function (event) {
    if (event.data == YT.PlayerState.ENDED) {
    	console.log(event);	
    }
	}
	onPlayerReady = function (event){
		console.log(event);
	}

	return self;

}(video = video || {}));