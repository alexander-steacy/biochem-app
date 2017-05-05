var quiz = (function(self){
	var self = {},
			request, 
			url,
			current = 0,
			answeredCorrect = 0,
			answeredIncorrect = 0, 
			percentage = 0, 
			completed = 0,
			fired = false;

  self.trace = function (){
    for(var i = 0, count = arguments.length; i < count; i++)
    {
      try {console.log(arguments[i]);}
      catch (error){}
    }
  };

  self.initialize = function(){
  	self.populateControls();
  	$('.mc-choice').on('click', self.onMCSelection);
  	$('.select-all').on('click', self.onSASelection);
  	$('#previous').on('click', self.onControlsClick);
  	$('#next').on('click', self.onControlsClick);
  	$('#check-answer').on('click', self.onCheckanswerClick);
  	$('input:text').on('input', function(){$("#check-answer").parent().removeClass('non-clickable')});
  	$('input:text').on('input', function(){$(this).parent().find('.visible').removeClass('visible')});
  	$('#return-to-quiz').on('click', self.returnToQuiz);
  	$('#new-topic').on('click', self.selectNewTopic);
  	$('.incorrect-data').on('click', function(){ console.log($(this)); $(this).removeClass('visible');});
  	$('.answer-data').on('click', function(){$(this).removeClass('visible');});
  };

	self.loadJSON = function(){
		url = "/data/quiz.json";
		request = new XMLHttpRequest();
		request.open('Get', url);
		request.responseType = 'json';
		request.send();
		request.onload = function(){
			self.data = request.response;
			self.buildPageStructure(self.data);
		}
	};

	self.buildPageStructure = function(data){
		var topic = [], questions = [], question = {};
		for(var i=0; i<data.quiz.length; i++){
			topic[i] = data.quiz[i].category;
			$('div#topic-screen').append('<div class="select-topic selection-' + topic[i].idname + '" category="' + topic[i].idname + '"><img src="../images/' + topic[i].image + '" /><h3>'+ topic[i].categoryname +'</h3></div>');
		}
		$('.select-topic').on('click', self.buildTopic);
	}

	self.buildTopic = function(event){
		if(fired) return;
		fired = true;
		var cat = $(this).attr('category'),
				topic = [],
				question = {};

		for(var i=0; i<self.data.quiz.length; i++){
			if(cat == self.data.quiz[i].category.idname){
				topic = self.data.quiz[i].category;
			}
		}
		for(var j=0; j<topic.questionlist.length; j++){
			question.type = topic.questionlist[j].question.type;
			question.id = topic.questionlist[j].question.idname;
			question.class = topic.questionlist[j].question.classname;
			question.text = topic.questionlist[j].question.text;
			question.incorrect = topic.questionlist[j].question.incorrect;
			question.answer = topic.questionlist[j].question.answer;
			question.discussion = topic.questionlist[j].question.discussion;
			question.difficulty = topic.questionlist[j].question.stars;

			if(topic.questionlist[j].question.hasOwnProperty('order')){ question.order = topic.questionlist[j].question.order; }
			if(topic.questionlist[j].question.hasOwnProperty('parts')){ 
				var parts = {};
				for(var l=0; l<topic.questionlist[j].question.parts.length; l++){
					parts[topic.questionlist[j].question.parts[l].idname] = topic.questionlist[j].question.parts[l].option;
				}
				question.parts = parts;
			}

			if(topic.questionlist[j].question.hasOwnProperty('image')){ question.image = topic.questionlist[j].question.image; }
			if(topic.questionlist[j].question.hasOwnProperty('choices')){
				var choice = {}
				for(var k=0; k<topic.questionlist[j].question.choices.length; k++){
					choice[topic.questionlist[j].question.choices[k].idname] = topic.questionlist[j].question.choices[k].option;
				}
				question.choices = choice;
			}
			self.buildQuiz(topic.idname, question, j)
		}
		$('#topic-title').html('<h2>' + topic.categoryname + '</h2>')
		$('#topic-screen').fadeOut(function(){$('#quiz-data').fadeIn();	});
		self.loadProblems(topic);
		self.initialize();
	}

	self.buildQuiz  = function(topic, data, num){
		var display = "", re = /\[space\]/;
		display = '<div class="question-text screen-' + topic + ' question-' + num + '" data-type="' + data.type + '" data-correct="' + data.answer + '" attempted="false"><p>' + data.text + '</p>';		
		if(display.match(re)){display = display.replace(re, '<span class="spacer"></span>')}

		switch(data.type){
			case 'multiple-choice':
				display += self.buildQuestionChoices(topic, data);
				break;
			case 'select-all':
				display += self.buildQuestionSelectAll(topic, data);
				break;
			case 'fill-in':
				display += self.buildQuestionFillIn(topic, data);
				break;
			case 'true-false':
				display += self.buildQuestionTrueFalse(topic, data);
				break;
			case 'identify':
				display += self.buildQuestionIdentify(topic, data);
				break;
			case 'mix-match':
				display += self.buildQuestionMixMatch(topic, data);
				$(function(){
					$('#sortable-elements').sortable({
						update: self.updateSortOrder
					});
					$('#sortable-elements').disableSelection();
				});
				break;
			default:
				self.trace('Alexander Messed Up');
		}
		display += '<div class="difficulty" id="' + data.idname + '"><h3>Difficulty Rating</h3>';
		for(var i=0; i<data.difficulty; i++){
			display += '<img src="../images/star.png" />'
		}
		display += '</div>';
		display += '<div class="answer-data"><p>' + data.discussion + '</p><span>X</span></div>';
		display += '<div class="incorrect-data"><p>' + data.incorrect + '</p><span>X</span></div>';
		display += '</div>';
		$("#screen").append(display);
	}

	self.updateSortOrder = function(){
		var sortorder = "";
		$('.mix-match').each(function(){sortorder += $(this).attr("data-point"); });
		$('#check-answer').parent().removeClass('non-clickable');
		$('.current-order span').html(sortorder);
	}

self.buildQuestionSelectAll = function(topic, data){
		var display = "";
		if(data.hasOwnProperty('image')){ display += '<img src="../images/' + data.image + '" />'; }
		for(key in data.choices){ display += '<div class="select-all" id="' + topic + '-' + data.id + '-' + key + '" data-point="' + key + '">' + data.choices[key] + '</div>'; }
		return display;
	}

	self.buildQuestionChoices = function(topic, data){
		var display = "";
		if(data.hasOwnProperty('image')){ display += '<img src="../images/' + data.image + '" />'; }
		for(key in data.choices){ display += '<div class="mc-choice" id="' + topic + '-' + data.id + '-' + key + '" data-point="' + key + '">' + data.choices[key] + '</div>'; }
		return display;
	}

	self.buildQuestionTrueFalse = function(topic, data){
		var display = "";
		for(key in data.choices){ display += '<div class="mc-choice" id="' + topic + '-' + data.id + '-' + key + '" data-point="' + key + '">' + data.choices[key] + '</div>'; }
		return display;
	}

	self.buildQuestionFillIn = function(topic, data){
		var display = "";
		display += '<label>Enter your answer here: </label><input type="text" name="user-answer">';
		return display;
	}

	self.buildQuestionIdentify = function(topic, data){
		var display = "";
		display = '<img src="../images/' + data.image + '" />';
		display += '<label>Enter your answer here: </label><input type="text" name="user-answer">';
		return display;
	}

	self.buildQuestionMixMatch = function(topic, data){
		var display = "", part = [], num = [], i, j;
		display += '<div id="sortable-elements">';
		for(key in data.parts){ 
			part.push('<div class="mix-match draggable" id="draggable-' + key + '" data-point="' + key + '">' + data.parts[key] + '</div>');
			num.push(part.length - 1);
		}
		i=num.length;
		while(i--){
			j = Math.floor(Math.random() * (i+1));
			display += part[num[j]];
			num.splice(j,1);
		}
		display += '</div>';
		display += '<div class="current-order"><p>Your answer: <span></span></p></div>';
		return display;
	}

	self.loadProblems = function(topic){
		var that = event.target;
		$(".active").toggleClass("active").fadeOut({complete: function(){
			$('.screen-' + topic.idname + '.question-text.question-0').toggleClass('active').fadeIn();
		}}, 1000);
		if(!$('.active').length){
			$('.screen-' + topic.idname + '.question-text.question-0').toggleClass('active').fadeIn(function(){
				fired = false;
			});
		}
		$('#counter').html('<span id="iterable">1</span> of ' + $('.question-text').length);
	};

	self.onMCSelection = function(event){
		var that = $(this);
		var question = that.parent();
		if( question.find($('.mc-choice.selected'))){question.find($('.mc-choice.selected')).removeClass('selected');}
		if(question.find($('.visible'))){question.find($('.visible')).removeClass('visible');}
		that.addClass('selected');
		$('.control a#check-answer').parent().removeClass('non-clickable');
	};

	self.onSASelection = function(event){
		var that = $(this);
		var question = that.parent();
		$(this).toggleClass('selected');
		$('.control a#check-answer').parent().removeClass('non-clickable');
	};

  self.onCheckanswerClick = function(event){
  	var correct = "", answer = "";
  	switch($('.question-text.active').attr('data-type')){
  		case 'multiple-choice':
  			correct =  $('.question-text.active .mc-choice.selected').parent().attr('data-correct');
  			answer = $('.question-text.active .mc-choice.selected').attr("data-point");
  			break;
  		case 'select-all':
  			correct = $('.question-text.active').attr('data-correct');
  			$('.select-all.selected').each(function(){
  				answer += $(this).attr("data-point");
  			});
  			break;
  		case 'fill-in':
  			correct =  $('.question-text.active input').parent().attr('data-correct').toLowerCase();;
  			answer = $('.question-text.active input').val().toLowerCase();
  			break;
  		case 'identify':
  			correct =  $('.question-text.active input').parent().attr('data-correct').toLowerCase();;
  			answer = $('.question-text.active input').val().toLowerCase();
  			break;
  		case 'true-false':
  			correct =  $('.question-text.active .mc-choice.selected').parent().attr('data-correct').toLowerCase();
  			answer = $('.question-text.active .mc-choice.selected').attr("data-point").toLowerCase();
  			break;
  		case 'mix-match':
  			correct =  $('.question-text.active').attr('data-correct').toLowerCase();
  			answer = $('.question-text.active .current-order span').html().toLowerCase();
  			break;
  		default:
  			console.log($('.question-text.active').attr('data-type'));
  	}

  	if(answer == correct){
			$('.question-text.active .answer-data').addClass('visible');
			if($('.question-text.active').attr('attempted') == 'false'){ $('.question-text.active').addClass('user-correct'); }
		} else {
			$('.question-text.active .incorrect-data').addClass('visible');
			if($('.question-text.active').attr('attempted') == 'false'){ $('.question-text.active').addClass('user-incorrect'); }
		}
  	if($('.question-text.active').attr('attempted') == 'true') return;
  	if($('.question-text.active').attr('attempted') == 'false'){
  		(answer == correct) ? answeredCorrect++ : answeredIncorrect++;
  		$('#number-correct').html(answeredCorrect);
  		percentage = Math.floor(answeredCorrect/$('.question-text').length * 100);
  		$('#quiz-percent').html(percentage + '%');
  		completed++;
  	}
  	$('.question-text.active').attr('attempted', 'true');
	};

	self.populateControls = function(){
		$('#controls').removeClass('hidden');
		$('.control a#previous').parent().addClass('non-clickable');
		$('.control a#check-answer').parent().addClass('non-clickable');
	};
	
	self.onControlsClick = function(event){
		var that = event.target;
		var questions = $('.question-text');
		var count = questions.length;
		if(that.id == 'next'){
			$('#check-answer').parent().addClass('non-clickable');
			if(current >= count-1 && completed === count){
				$('#screen').fadeOut(function(){
					$('#completed').fadeIn().addClass('visible');
					$('#controls').addClass('hidden');
				});
			} else if (current >= count-1 && completed !== count){
				alert('please answer all of the questions');
				return;
			};
			if(current < count-1){
				questions.eq(current).hide().removeClass('active');
				questions.eq(current+1).fadeIn().addClass('active');
				$('.control a#previous').parent().removeClass('non-clickable');
				$('#iterable').html(current+2);
			}
			current++;
		}
		if(that.id == 'previous'){
			if(current == count-1 && $('#completed.visible').length) {
				$('#completed').fadeOut(function(){
					$('#screen').fadeIn();
				}).removeClass('visible');
				return;
			}
			if(current <= 0) return;
			if(current > 0){
				questions.eq(current).hide().removeClass('active');
				questions.eq(current-1).fadeIn().addClass('active');
				$('#iterable').html(current);
				$('.control a#next').parent().removeClass('non-clickable');
				if(current == 0){ $('.control a#previous').parent().addClass('non-clickable'); }
			}
			current--;
		}
	};

	self.returnToQuiz = function(event){
		$('#completed').fadeOut(function(){
			$('#screen').fadeIn();
			$('#controls').removeClass('hidden');
		}).removeClass('visible');
		current--;
	};

	self.selectNewTopic = function(event){
		current = 0;
		answeredCorrect = 0;
		answeredIncorrect = 0;
		percentage = 0;
		completed = 0;

		$('#previous').off();
  	$('#next').off();
  	$('#check-answer').off();

		$('#quiz-data').fadeOut(function(){
			$('#topic-screen').fadeIn();
			$('#screen').empty().fadeIn();
			$('#number-correct').empty();
			$('#quiz-percent').empty();
			$('#completed').removeClass('visible').fadeOut();
		});
	}



	return self;
}(quiz = quiz || {}));