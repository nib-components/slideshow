var assert = require('component-assert');
var SlideShow = require('slideshow');

describe("Slideshow", function(){

  function hasClass(el, name) {
    return el.className.indexOf(name) !== -1;
  }

  beforeEach(function(){
    this.el = document.createElement('div');
    this.el.innerHTML = '<div class="js-slide is-current"></div><div class="js-slide"></div><div class="js-slide"></div><div class="js-slide"></div><div class="js-indicators"><script type="text/template" data-template="indicator"><span class="slideshow__indicator"></span></script></div><script type="text/template" data-template="next"><span class="slideshow__next"></span></script><script type="text/template" data-template="previous"><span class="slideshow__previous"></span></script>';
    this.view = new SlideShow({
      el: this.el,
      useTransitions: false //handling events in the testing framework is ugly and hard... timeouts... Yuck!
    });
  });

  it('should be created', function(){
    assert(this.el.querySelector('.slideshow__next'));
    assert(this.el.querySelector('.slideshow__previous'));
    assert(this.el.querySelector('.js-indicators'));
  });

  it('should have four slides', function(){
    assert(this.view.slideElements.length === 4);
  });

  it('should show the first slide', function(){
    assert(this.view.currentIndex === 0);
  });

  it('should have the correct slide classes on load', function(){

    assert(hasClass(this.view.slideElements[0], 'is-current'));
    assert(hasClass(this.view.slideElements[0], 'is-previous') === false);
    assert(hasClass(this.view.slideElements[0], 'is-next') === false);

    assert(hasClass(this.view.slideElements[1], 'is-current') === false);
    assert(hasClass(this.view.slideElements[1], 'is-previous') === false);
    assert(hasClass(this.view.slideElements[1], 'is-next') === false);

    assert(hasClass(this.view.slideElements[2], 'is-current') === false);
    assert(hasClass(this.view.slideElements[2], 'is-previous') === false);
    assert(hasClass(this.view.slideElements[2], 'is-next') === false);

    assert(hasClass(this.view.slideElements[3], 'is-current') === false);
    assert(hasClass(this.view.slideElements[3], 'is-previous') === false);
    assert(hasClass(this.view.slideElements[3], 'is-next') === false);
  });

  it('should have the first indicator active', function(){
    assert(hasClass(this.view.indicatorElements[0], 'is-active'));
    assert(hasClass(this.view.indicatorElements[1], 'is-active') === false);
    assert(hasClass(this.view.indicatorElements[2], 'is-active') === false);
    assert(hasClass(this.view.indicatorElements[2], 'is-active') === false);
  });

  it('should show a slide', function(){

    this.view.show(1);

    assert(hasClass(this.view.slideElements[0], 'is-current') === false);
    assert(hasClass(this.view.slideElements[0], 'is-previous') === false);
    assert(hasClass(this.view.slideElements[0], 'is-next') === false);

    assert(hasClass(this.view.slideElements[1], 'is-current') === true);
    assert(hasClass(this.view.slideElements[1], 'is-previous') === false);
    assert(hasClass(this.view.slideElements[1], 'is-next') === false);

    assert(hasClass(this.view.slideElements[2], 'is-current') === false);
    assert(hasClass(this.view.slideElements[2], 'is-previous') === false);
    assert(hasClass(this.view.slideElements[2], 'is-next') === false);

    assert(hasClass(this.view.slideElements[3], 'is-current') === false);
    assert(hasClass(this.view.slideElements[3], 'is-previous') === false);
    assert(hasClass(this.view.slideElements[3], 'is-next') === false);

  });

  it('should show the next slide', function(){
    var show = false;
    this.view.show = function(i){
      show = i;
    };
    this.view.next();
    assert(show === 1);
  });

  it('should show the previous slide', function(){
    this.view.previous();
    assert(this.view.currentIndex === 3, this.view.currentIndex);
  });

  it('should show the previous slide when clicking the button', function(){
    this.view.previousElement.click();
    assert(this.view.currentIndex === 3, this.view.currentIndex);
  });

  it('should show the next slide when clicking the button', function(){
    this.view.nextElement.click();
    assert(this.view.currentIndex === 1, this.view.currentIndex);
  });

  it('should not do anything if it is disabled', function(){
    this.view.setEnabled(false);
    this.view.show(1);
    assert(this.view.currentIndex === 0, this.view.currentIndex);
  });

  it('should not do anything if it already on a slide', function(){
    this.view.show(0);
    assert(this.view.enabled === true);
  });

});