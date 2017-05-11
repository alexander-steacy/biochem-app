var learn = (function(){
	var self = {},
			request,
			url,
			object = {},
			count = 0,
			panelCount = 0,
			body = $(window).width(),
			set = false,
			clicked = false;


	self.loadJSON = function(){
		url = "/biochem-app/data/learn.json";
		request = new XMLHttpRequest();
		request.open('Get', url);
		request.responseType = 'json';
		request.send();
		request.onload = function(){
			self.data = request.response;
			self.loadTopics(request.response);
		}
	};

	self.loadTopics = function(data){
		var topic = [];
		for(var i=0; i<data.learn.length; i++){
			topic[i] = data.learn[i].category;
			$('#topic-screen').append('<div class="select-topic selection-' + topic[i].id + '" category="' + topic[i].id + '"><img src="../images/' + topic[i].image + '" /><h3>'+ topic[i].subject +'</h3></div>');
		}

		self.initialize();
	}

	self.initialize = function(){
		$('.select-topic').on('click', self.buildSubtopics);
		$('#main-topics').on('click', self.returnEvent);
		$('#subtopics').on('click', self.returnEvent);
		$(window).on('resize', self.adjustImage);
	}

	self.adjustImage = function(event){
		var images = document.getElementsByClassName('slide-image'),
				imagewidth = images[0].naturalWidth,
				imageheight = images[0].naturalHeight,
				ratio = imageheight/imagewidth + 1;
		ratio = parseFloat(ratio.toFixed(2));

		if(set == false){
			$('.slide.active img').attr('height', 390);
			$('.slide.active img').attr('width', 390*ratio);
			$('.slide.active img')
			set = true;
		}
	}

	self.buildSubtopics = function(event){
		if(clicked) return;
		clicked = true;
		var cat = $(this).attr('category'),
		display = "";

		for(var i=0; i<self.data.learn.length; i++){
			if(self.data.learn[i].category.id == cat){
				object = self.data.learn[i].category;
			}
		}

		$('#main-title').html(object.subject);

		for(var j=0; j<object.subtopics.length; j++){
			$('#subtopic-screen').append('<div class="select-subtopic selection-' + object.subtopics[j].lesson.id + ' ' + object.subtopics[j].lesson.type + '" id="' + object.subtopics[j].lesson.id + '"><img src="../images/' + object.subtopics[j].lesson.image + '" /><h3>' + object.subtopics[j].lesson.title + '</h3></div>');
		}

		$('#topic-screen').fadeOut(function(){
			$('#subtopic-screen').fadeIn();
			clicked = false;
		});
		$('.select-subtopic').on('click', self.buildLearnModule);
	}

	self.buildLearnModule = function(event){
		var lesson = {};
		for(var i=0; i<object.subtopics.length; i++){
			if(object.subtopics[i].lesson.id == $(this).attr('id')){
				lesson = object.subtopics[i].lesson;
			}
		}

		$('#subtitle').append(' - ' + lesson.title);

		switch(lesson.type){
			case 'plain-text':
				self.buildPlainText(lesson);
				break;
			case 'slideshow':
				self.buildSlideshow(lesson);
				break;
			case 'video':
				self.buildVideo(lesson);
				break;
			case 'adventure':
				self.buildAdventure(lesson);
				break;
			default:
				console.log('No Lesson scheduled for today');
		}

		$('#subtopic-screen').fadeOut(function(){
			$('#learn-data').fadeIn();
		});
	}

	self.buildPlainText = function(data){
		var display = "";

		for(var i=0; i<data.information.length; i++){
			for(key in data.information[i]){
				switch(key){
					case 'paragraph':
						display += '<p>' + data.information[i][key] + '</p>';
						break;
					case 'unorderedlist':
						display += '<ul>';
						for(var j=0; j<data.information[i][key].length; j++){
							display += '<li>' + data.information[i][key][j].bullet + '</li>';
						}
						display += '</ul>';
						break;
					case 'orderedlist':
						display += '<ol>';
						for(var j=0; j<data.information[i][key].length; j++){
							display += '<li>' + data.information[i][key][j].bullet + '</li>';
						}
						display += '</ol>';
						break;
					case 'image':
						display += '<img src="../images/' + data.information[i][key] + '" />';
						break;
					default:
						console.log('Nothing to see here folks');
				}
			}
		}

		$('#screen').html(display);
	}
				
	self.buildSlideshow = function(data){
		var display = "";	
		for(var i=0; i<data.information.length; i++){
			for(key in data.information[i]){
				display += '<div class="slide hidden">';
				for(keys in data.information[i][key]){
					switch(keys){
						case 'id':
							break;
						case 'title':
							display += '<div class="inner-slide"><h3>' + data.information[i][key][keys] + '</h3></div>';
							break;
						case 'text':
							display += '<div class="inner-slide"><p>' + data.information[i][key][keys] + '</p></div>';
							break;
						case 'unorderedlist':
							display += '<div class="inner-slide"><ul>';
							for(var j=0; j<data.information[i][key][keys].length; j++){
								display += '<li>' + data.information[i][key][keys][j].bullet + '</li>';
							}
							display += '</ul></div>';
							break;
						case 'orderedlist':
							display += '<div class="inner-slide"><ol>';
							for(var j=0; j<data.information[i][key][keys].length; j++){
								display += '<li>' + data.information[i][key][keys][j].bullet + '</li>';
							}
							display += '</ol></div>';
							break;
						case 'image':
							display += '<img class="graphic" src="../images/' + data.information[i][key][keys] + '" />';
							break;
						default:
							console.log(keys, 'Nothing to see here folks');
					}
				}
				display += '</div>';
			}
		}
		display += '<div class="slideshow-nav" id="slide-left"><</div>';
		display += '<div class="slideshow-nav" id="slide-right">></div>';
		$('#screen').html(display);
		$('.slide').eq(0).removeClass('hidden').addClass('active').fadeIn(function(){
			self.adjustImage();
		});
		$('.slideshow-nav').on('click', self.slideNavigation);
	}

	self.buildVideo = function(data){
		var display = "";
		$('#screen').html('<div id="video"></div>');
		for(key in data.information){
			if(key == 'videoID'){
				video.setUserData(data.information[key]);
			} else {
				display += '<p>' + data.information[key] + '</p>';
			}
		}
		$('#screen').append(display);
	}

	self.buildAdventure = function(data){
		var display = "";
		for(var i=0; i<data.information.length; i++){
			for(key in data.information[i]){
				display += '<div class="panel">';
				display += '<h3>' + data.information[i][key].type + '</h3>';
				for(var j=0; j<data.information[i][key].explanation.length; j++){
					display += '<p>' + data.information[i][key].explanation[j].paragraph + '</p>';
				}
				switch(data.information[i][key].type){
					case 'Welcome':
						display += '<div class="control large"><a class="panel-nav" href="javascript:void(0)" direction="forward">Start Your Adventure</a></div>';
						break;
					case 'Option':
						display += '<div class="control"><a class="panel-nav" href="javascript:void(0)" direction="' + data.information[i][key].options[0].choice.direction + '">' + data.information[i][key].options[0].choice.button + '</a></div>';
						display += '<div class="control"><a class="panel-nav" href="javascript:void(0)" direction="' + data.information[i][key].options[1].choice.direction + '">' + data.information[i][key].options[1].choice.button + '</a></div>';
						break;
					case 'Side Path':
						display += '<div class="control large"><a class="panel-nav" href="javascript:void(0)" direction="return">Return</a></div>';
						break;
					case 'Conclusion':
						break;
					default:
						console.log('I ran out of options');
				}
				display += '</div>';
			}
		}

		$('#screen').append(display);	
		$('.panel').eq(0).addClass('active').fadeIn();
		$('.panel-nav').on('click', self.chooseYourAdventureNav);
	}

	self.returnEvent = function(event){
		if($(this).attr('id') == 'main-topics'){
			$('#learn-data').fadeOut(function(){
				$('#topic-screen').fadeIn();
				$('#screen').empty();
				$('#subtopic-screen').empty();
				$('#main-title').html('');
				$('#subtitle').html('');
			});
		} else {
			$('#learn-data').fadeOut(function(){
				$('#subtopic-screen').fadeIn();
				$('#screen').empty();
				$('#subtitle').html('');
			});
		}
	}

	self.slideNavigation = function(event){
		var length = $('.slide').length;
		if(count >= length-1 && event.target.id == 'slide-right') return;
		if(event.target.id == 'slide-right'){
			count++;
			$('.slide').not('.hidden').fadeOut(function(){
				$('.slide').eq(count).removeClass('hidden').addClass('active').fadeIn();
			}).addClass('hidden').removeClass('active');
			return;
		}
		if(count <= 0) return;
		if(event.target.id == 'slide-left'){
			count--;
			$('.slide').not('.hidden').fadeOut(function(){
				$('.slide').eq(count).removeClass('hidden').addClass('active').fadeIn();
			}).addClass('hidden').removeClass('active');
		}
	}

	self.chooseYourAdventureNav = function(event){
		var length = $('.panel').length;
		$('.panel.active').fadeOut(function(){
			switch(event.target.getAttribute('direction')){
				case 'option-panel':
					panelCount += 2;
					break;
				case 'lateral-panel':
					panelCount++;
					break;
				case 'forward':
					panelCount++;
					break;
				case 'return':
					panelCount--;
					break;
				default:
					console.log('Alex, Please develop this option');
			}
			$('.panel').eq(panelCount).addClass('active').fadeIn();
		}).removeClass('active');
	}

	return self;
	
}(learn = learn || {}));
