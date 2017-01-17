/* Simple JS to control basic functions of the page, jQuery is used due to lazyness */

var windowHeight;
var bannerHeight = $('#main-nav').height();
var fadeTextThreshold = 150;

// listen for resize event and change variable
$(window).resize(function(){
    windowHeight = $(window).height(); // get new height after change
    $('#index-banner').height(windowHeight);
});

// listen for events while scrolling, change color of banner when a certain 
// threshold is reached
$(window).scroll(function() {
	  
	var scroll = $(window).scrollTop();

	$('.arrow').css({'opacity':( fadeTextThreshold - scroll )/fadeTextThreshold});
	$('#front-text-container').css({'opacity':( fadeTextThreshold - scroll )/fadeTextThreshold});

	if(scroll >= windowHeight - bannerHeight){ // Set color
		$('#main-nav').addClass('colorize-nav');
		$('#main-nav').removeClass('no-shadow');
		$('.nav-link').addClass('black-links')
		$('.brand-logo').addClass('black-links')

	} else { // Set transparent
		$('#main-nav').removeClass('colorize-nav');
		$('#main-nav').addClass('no-shadow');
		$('.brand-logo').removeClass('almost-white-text')
		$('.nav-link').removeClass('black-links')
		$('.brand-logo').removeClass('black-links')
	}

});

function openModal(project){
	$(project).openModal();
}

$(window).load(function() {
	// Animate loader off screen
	$(".se-pre-con").fadeOut("slow");

});

// document ready
(function($){

	/*const elements = Array.from(document.getElementsByClassName('card-image'));
	elements.forEach(el => {
		el.addEventListener("click", project => {
			alert(project);
		})
	});
  	//$('#modal1').leanModal();
	 ///$('#modal1').openModal();
	$('.modal-trigger').leanModal();*/


	//$(document).scrollTop(0);
	windowHeight = $(window).height();

	$('#index-banner').css('height', $(window).height());
	$('.side-nav').css('height', windowHeight);

	$(function(){
	  $('.button-collapse').sideNav();
		$('.parallax').parallax();
	}); // end of document ready

  // script for animating the links to the position of content
  $(function() {
	  $('a[href*=#]:not([href=#])').click(function() {
	    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
	      var target = $(this.hash);
	      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
	      if (target.length) {
	        $('html,body').animate({
	          scrollTop: target.offset().top - bannerHeight
	        }, 1000);
	        return false;
	      }
	    }
	  });
	});


})(jQuery); // end of jQuery name space
