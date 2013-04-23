var assert = require('component-assert');
var SlideShow = require('slideshow');

describe("Slideshow", function(){

  function hasClass(el, name) {
    return el.className.indexOf(name) !== -1;
  }

  beforeEach(function(){
    this.el = document.createElement('div');
    this.el.innerHTML = '<div class="js-slide"></div><div class="js-slide"></div><div class="js-slide"></div><div class="js-slide"></div><div class="js-indicators"></div>';
    this.view = new SlideShow({
      el: this.el
    });
  });

  it('should be created', function(){
    assert(this.el.querySelector('.slideshow__next'));
    assert(this.el.querySelector('.slideshow__previous'));
    assert(this.el.querySelector('.js-indicators'));
  });

  it('should have four slides', function(){
    assert(this.view.slides.length === 4);
  });

  it('should show the first slide', function(){
    assert(this.view.current === 0);
  });

  it('should have the correct slide classes on load', function(){    
    assert(hasClass(this.view.slides[0], 'is-current'));
    assert(hasClass(this.view.slides[0], 'is-previous') === false);
    assert(hasClass(this.view.slides[0], 'is-next') === false);

    assert(hasClass(this.view.slides[1], 'is-current') === false);
    assert(hasClass(this.view.slides[1], 'is-previous') === false);
    assert(hasClass(this.view.slides[1], 'is-next'));

    assert(hasClass(this.view.slides[2], 'is-current') === false);
    assert(hasClass(this.view.slides[2], 'is-previous') === false);
    assert(hasClass(this.view.slides[2], 'is-next') === false);

    assert(hasClass(this.view.slides[3], 'is-current') === false);
    assert(hasClass(this.view.slides[3], 'is-previous'));
    assert(hasClass(this.view.slides[3], 'is-next') === false);
  });

  it('should have the first indicator active', function(){
    assert(hasClass(this.view.indicators[0], 'is-active'));
    assert(hasClass(this.view.indicators[1], 'is-active') === false);
    assert(hasClass(this.view.indicators[2], 'is-active') === false);
    assert(hasClass(this.view.indicators[2], 'is-active') === false);
  });

  it('should show a slide', function(){
    this.view.show(1);

    assert(hasClass(this.view.slides[0], 'is-current') === false);
    assert(hasClass(this.view.slides[0], 'is-previous') === true);
    assert(hasClass(this.view.slides[0], 'is-next') === false);

    assert(hasClass(this.view.slides[1], 'is-current') === true);
    assert(hasClass(this.view.slides[1], 'is-previous') === false);
    assert(hasClass(this.view.slides[1], 'is-next') === false);

    assert(hasClass(this.view.slides[2], 'is-current') === false);
    assert(hasClass(this.view.slides[2], 'is-previous') === false);
    assert(hasClass(this.view.slides[2], 'is-next') === true);

    assert(hasClass(this.view.slides[3], 'is-current') === false);
    assert(hasClass(this.view.slides[3], 'is-previous') === false);
    assert(hasClass(this.view.slides[3], 'is-next') === false);
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
    assert(this.view.current === 3, this.view.current);
  });

  it('should show the previous slide when clicking the button', function(){
    this.view.previousEl.click();
    assert(this.view.current === 3, this.view.current);
  });

  it('should show the next slide when clicking the button', function(){
    this.view.nextEl.click();
    assert(this.view.current === 1, this.view.current);
  });

  it('should not do anything if it is disabled', function(){
    this.view.setEnabled(false);
    this.view.show(1);
    assert(this.view.current === 0, this.view.current);
  });

  it('should not do anything if it already on a slide', function(){
    this.view.show(0);
    assert(this.view.enabled === true);
  });

});