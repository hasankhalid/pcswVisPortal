var isMenuOpen = false;

$("#hamburger").click(function() {
  isMenuOpen = true;
  $('html').css("overflow-y", "hidden"); //Makes page unscrollable on full navigation menu
  $('body').css("overflow-y", "hidden");
  $('#overlay_menu').css("z-index", "10");
  $('#overlay_menu').removeClass('slideOutRight');
  setTimeout(function () {
    $('#overlay_menu').show().addClass('animated slideInLeft');}, 50
  );
});

$('#overlay_menu').on("animationend", function(){
  $('#link1').removeClass('fadeOutUp');
  $('#link2').removeClass('fadeOutUp');
  $('#link3').removeClass('fadeOutUp');
  $('#link4').removeClass('fadeOutDown');
  $('#link5').removeClass('fadeOutDown');
  $('#link6').removeClass('fadeOutDown');
  $('.logos_section').removeClass('fadeOut');

  if (isMenuOpen === true) {
    setTimeout(function () {
      $('#link1').show().addClass('animated fadeInDown');}, 50
    );
    setTimeout(function () {
      $('#link2').show().addClass('animated fadeInDown');}, 100
    );
    setTimeout(function () {
      $('#link3').show().addClass('animated fadeInDown');}, 150
    );
    setTimeout(function () {
      $('#link4').show().addClass('animated fadeInUp');}, 50
    );
    setTimeout(function () {
      $('#link5').show().addClass('animated fadeInUp');}, 100
    );
    setTimeout(function () {
      $('#link6').show().addClass('animated fadeInUp');}, 150
    );
    setTimeout(function () {
      $('.logos_section').show().addClass('animated fadeIn');}, 250
    );
   }
   else {
     $('#link1').css('opacity', '0'); //Change opacity to 0 and hide DOM elements on sliding out an overlay menu.
     $('#link2').css('opacity', '0');
     $('#link3').css('opacity', '0');
     $('#link4').css('opacity', '0');
     $('#link5').css('opacity', '0');
     $('#link6').css('opacity', '0');
     $('.logos_section').css('opacity', '0');
     $('#link1').hide();
     $('#link2').hide();
     $('#link3').hide();
     $('#link4').hide();
     $('#link5').hide();
     $('#link6').hide();
     $('.logos_section').hide();
   }
});

$("#closeIcon").click(function() {
  isMenuOpen = false;
  $('html').css("overflow-y", "visible");
  $('body').css("overflow-y", "visible");
  setTimeout(function () {
    $('#link4').addClass('animated fadeOutDown');}, 50
  );
  setTimeout(function () {
    $('#link5').addClass('animated fadeOutDown');}, 75
  );
  setTimeout(function () {
    $('#link6').addClass('animated fadeOutDown');}, 100
  );
  setTimeout(function () {
    $('#link1').addClass('animated fadeOutUp');}, 50
  );
  setTimeout(function () {
    $('#link2').addClass('animated fadeOutUp');}, 75
  );
  setTimeout(function () {
    $('#link3').addClass('animated fadeOutUp');}, 100
  );
  setTimeout(function () {
    $('.logos_section').addClass('animated fadeOut');}, 125
  );
  setTimeout(function () {
    $('#overlay_menu').addClass('animated slideOutRight');}, 175
  );
  setTimeout(function () {
    $('#overlay_menu').css("z-index", "-1");}, 1225
  );
});
