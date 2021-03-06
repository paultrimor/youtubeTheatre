var socket = io();
var prepended = false;
var time = 0;
socket.emit('room', url);

$('form').submit(function () {
	socket.emit('chat message', $('#m').val(), url);
	$('#m').val('');
	return false;
});

socket.on('chat message', function (msg) {
	$('#messages').append($('<li style=" overflow-wrap: word;">').text(msg));
});

socket.on('sendTime', function () {
	console.log("Sending time: " + Math.round(player.getCurrentTime()));
	socket.emit('time', url, Math.round(player.getCurrentTime()));
});

function embedVideo() {
	if (prepended == false) {
		//var time = Math.round(new Date().getTime() / 1000) - startTime;
		console.log("received start time before set youtube: " + time);
		/*$('body').prepend('<iframe id="video" width="560" height="315" src="//www.youtube.com/embed/' + url + '?start=' + time + '&autoplay=1" allowfullscreen></iframe>')*/
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		prepended = true;
	}
}

socket.on('time', function (start_time_received) {
	console.log("Got start time: " + start_time_received);
	time = start_time_received;
	embedVideo();
});

socket.on('playerState', function (state) {
	console.log("Received playerState");
	switch (state) {
	case 1:
		console.log("Player playing");
		player.playVideo();
		break;
	case 2:
		console.log("Player paused");
		player.pauseVideo();
		break;
	}
})

socket.on('changeTime', function (time_change) {
	player.seekTo(time_change);
})

setTimeout(function () {
	if (prepended == false) {
		startTime = Math.round(new Date().getTime() / 1000);
		embedVideo()
	}
}, 2000);




var player;
var video = url;
video.h = '390' //video iframe height
video.w = '640'
	// this function gets called when API is ready to use
function onYouTubePlayerAPIReady() {
	// create the global player from the specific iframe (#video)
	player = new YT.Player('player', {
		height: video.h,
		width: video.w,
		videoId: video,
		playerVars: {
			start: time,
			rel: 0,
			showinfo: 0,
			autoplay: 1
		},
		events: {
			'onStateChange': onPlayerStateChange
		}
	});
};
var tempTime = time;

function onPlayerStateChange(event) {
	console.log(event.data);
	timeInterval = setInterval(function () {
		tempTime = player.getCurrentTime();
		if (((tempTime - time) > 2) || ((tempTime - time) < -2)) {
			socket.emit('changeTime', url, tempTime);
			console.log("Time changed");
		}
		time = tempTime;
	}, 1000);
	switch (event.data) {
	case 1:
		console.log("Player playing");
		socket.emit('playerState', url, 1);
		break;
	case 2:
		console.log("Player paused");
		socket.emit('playerState', url, 2);
		break;
	}
}



// Inject YouTube API script
var tag = document.createElement('script');
tag.src = "//www.youtube.com/player_api";