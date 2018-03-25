"use strict";

function slider(){
    if ($('.slider-box').length){
        $('.slider-box').slick({
            infinite: true,
            variableWidth: true,
            prevArrow: '<button class="slider-box__control slider-box__prew icon-angle-left" ></button>',
            nextArrow: '<button class="slider-box__control slider-box__next icon-angle-right" ></button>',
            responsive: [
                {
                    breakpoint: 1200,

                    settings:{
                        centerMode: true,
                    }
                },
                {
                    breakpoint: 992,

                    settings: {
                        centerMode: true,
                        arrows: false
                    }
                }

            ]

        });
    }
}
function initMap() {
    var uluru = {lat: 45.5022656, lng: -122.673581};
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: uluru,
        disableDefaultUI: true
    });
}

function pushBurger() {
    if( $('#burgerButton').length ) {
        $('#burgerButton').on('click', function () {
            var target = $(this);
            var span = target[0].querySelector('span');
            var burgerMenu = $('#burger-menu');
            span.classList.toggle('burger-btn--active');
            if (span.classList.contains('burger-btn--active')) {
                $(burgerMenu).slideDown(300);

            } else {
                $(burgerMenu).slideUp(500);

            }
        });
    }
}
function closeBurger() {
    $('#burgerButton').children().removeClass('burger-btn--active');
    $('#burger-menu').css('display', 'none');
}

function scrollbarWith() {
    var $outer = $('<div>').css({visibility: 'hidden', width: 100, overflow: 'scroll'}).appendTo('body'),
        widthWithScroll = $('<div>').css({width: '100%'}).appendTo($outer).outerWidth();
    $outer.remove();
    return 100 - widthWithScroll;
}

function testWidthWindow() {
    var scrollWidth = scrollbarWith();
    $(window).resize(function () {
        var widthWindow = $(document).innerWidth();
        if ( ( widthWindow + scrollWidth) > 768) {
            closeBurger();
        }
    });
}

function slowScrolling() {
    $("#menu, #burger-menu, .scroll-js").on("click", "a", function(event) {
        event.preventDefault();
        var id = $(this).attr('href');
        if (id !== undefined) {
            var top = $(id).offset().top;
            if($(this).hasClass('hide-js')) {
                closeBurger();
            }
            $('body,html').animate({ scrollTop: top }, 1500);
        }
    });
}

$(document).ready( function () {
    slider();
    pushBurger();
    slowScrolling();
    testWidthWindow();
});