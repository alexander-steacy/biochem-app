$(document).ready(function(){
	var quizpage = 'quiz';
	var learnpage = 'learn';
	var url = window.location.href;
	
	if(url.match(quizpage)){ quiz.loadJSON(); }
	if(url.match(learnpage)){ learn.loadJSON(); }
});