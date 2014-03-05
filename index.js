var events = require('event');
var emitter = require('emitter');
var hammer = require('hammerjs');
var transition = require('css-emitter');
var isTransitionSupported = require('./lib/transitions-supported');

/**
 * Gets a template, renders it and returns the elements
 * @param  {Element} el
 * @param  {String} name Template name identified with data-template
 * @return {Element}
 */
function getTemplate(el, name, text) {
  var template = el.querySelector('[data-template="'+name+'"]').innerHTML.trim();
  var tmp = document.createElement('div');
  tmp.innerHTML = template;

  // set the indicator value
  if (text){
    var child = document.createElement('span');
    child.innerHTML = text;
    tmp.firstChild.appendChild(child);
  }

  return tmp.firstChild;
}

/**
 * Slideshow
 * @param {Object} options
 * @constructor
 */
function SlideShow(options) {
  this.options        = options || {};
  this.currentIndex   = this.options.startAt || 0;
  this.element        = this.options.el;
  this.slideElements  = this.element.querySelectorAll(this.options.slideSelector || '.js-slide');

  this.speed          = this.options.speed || 0;
  this.enabled        = this.options.enabled || true;
  this.useTransitions = typeof this.options.useTransitions !== 'undefined' ? this.options.useTransitions : isTransitionSupported;

  //create the navigation elements
  this._createNextButton();
  this._createPreviousButton();
  this._createIndicators();

  //bind mouse events
  events.bind(this.element, 'mouseover', this.pause.bind(this));
  events.bind(this.element, 'mouseout', this.play.bind(this));

  //bind touch events
  //TODO: It'd be nice to show the slides being dragged whilst the user is dragging their finger just like at http://eightmedia.github.io/hammer.js/examples/carousel.html.
  //      I'm pretty sure this will require styling changes to the slider.
  hammer(this.element).on('release swipeleft dragleft swiperight dragright', function(event) {

    switch (event.type) {

    case 'swipeleft':
      this.next();
      event.gesture.stopDetect();
      break;

    case 'swiperight':
      this.previous();
      event.gesture.stopDetect();
      break;

    case 'release':
      if(event.gesture.velocityX != 0) {
        if (event.gesture.direction == 'right') {
          this.previous();
        } else {
          this.next();
        }
      }
      break;

    }

  }.bind(this));

  //update the current index
  this._selectIndicator(this.currentIndex);
  this.show(this.currentIndex);

  //start the slideshow playing
  this.play();
}
emitter(SlideShow.prototype);

/**
 * Alternative constructor
 * @param   {object}  options
 */
SlideShow.create = function(options){
  return new SlideShow(options);
};

/**
 * Creates the next button from the template and binds events
 * @api private
 */
SlideShow.prototype._createNextButton = function() {
  this.nextElement = getTemplate(this.element, 'next');
  this.element.appendChild(this.nextElement);
  events.bind(this.nextElement, 'click', this.next.bind(this));
  this.emit('nextButton', this.nextElement);
};

/**
 * Creates the previous button from the template and binds events
 * @api private
 */

SlideShow.prototype._createPreviousButton = function() {
  this.previousElement = getTemplate(this.element, 'previous');
  this.element.appendChild(this.previousElement);
  events.bind(this.previousElement, 'click', this.previous.bind(this));
  this.emit('previousButton', this.previousElement);
};

/**
 * Creates the indicators from the template and binds events
 * @api private
 */
SlideShow.prototype._createIndicators = function() {
  this.indicatorElements = [];

  //get the indicators container
  var self = this;
  var container = this.element.querySelector('.js-indicators');

  //create an indicator for each slide
  for (var i=0; i<this.slideElements.length; ++i) {

    //get the slide element
    var slide = this.slideElements[i];

    //get the indicator text
    var text = '';
    if (slide.getAttribute('data-indicator-value')){
      text = slide.getAttribute('data-indicator-value');
    }

    //get the indicator template
    var indicator = getTemplate(this.element, 'indicator', text);

    //bind events to the indicator element
    events.bind(indicator, 'click', function(j) {
      return function() {
        self.show(j);
        self.emit('select', j);
      }
    }(i));

    //add the indicator
    container.appendChild(indicator);
    this.indicatorElements.push(indicator);

  }

};

/**
 * Selects the indicator
 * @api private
 * @param   {number}  index
 */
SlideShow.prototype._selectIndicator = function(index) {
  for (var i=0; i<this.slideElements.length; ++i) {
    if (i === index) {
      this.indicatorElements[index].classList.add('is-active');
      this.emit('indicator:active', this.indicatorElements[index], i);
    } else {
      this.indicatorElements[i].classList.remove('is-active');
    }
  }
};

/**
 * Gets whether the slideshow is enabled
 * @api       public
 * @returns   {boolean}
 */
SlideShow.prototype.isEnabled = function() {
  return this.enabled;
};

/**
 * Enable or disable the ability to move between slides
 * @api       public
 * @param     {boolean}   enabled
 */

SlideShow.prototype.setEnabled = function(enabled) {
  this.enabled = Boolean(enabled);
};

/**
 * Gets the indicator element
 * @api       public
 * @param     {number}    index
 * @return    {HTMLElement}
 */
SlideShow.prototype.getIndicator = function(index) {
  return this.indicatorElements[index];
};

/**
 * Gets the slide element
 * @api       public
 * @param     {number}    index
 * @return    {HTMLElement}
 */
SlideShow.prototype.getSlide = function(index) {
  return this.slideElements[index];
};

/**
 * Shows the specified slide
 * @api     public
 * @param   {number}  index
 * @param   {boolean} isMovingForward
 */
SlideShow.prototype.show = function(index, isMovingForward) {
  isMovingForward = typeof isMovingForward === 'undefined' ? index>this.currentIndex : isMovingForward;

  //check if the slideshow is disabled
  if (this.enabled !== true) {
    return;
  }

  //check if the specified slide is already the current slide
  if (index === this.currentIndex) {
    return;
  }

  //Get the slides.
  var currentSlide  = this.slideElements[this.currentIndex];
  var nextSlide     = this.slideElements[index];

  //Stop the user from spamming the slides.
  this.setEnabled(false);

  //Select the indicator for the next slide.
  this._selectIndicator(index);

  if (this.useTransitions) {

    //Position the next slide ready for the transition. Make sure transitions are disabled so the slide is moved immediately.
    nextSlide.classList.add('no-transitions');
    if (isMovingForward) {
      nextSlide.classList.add('is-next');
    } else {
      nextSlide.classList.add('is-previous');
    }

    //Wait for the browser to render the position changes to the next slide.
    setTimeout(function() {

      //Start the current slide moving off the screen.
      if (isMovingForward) {
        currentSlide.classList.add('is-previous');
      } else {
        currentSlide.classList.add('is-next');
      }
      currentSlide.classList.remove('is-current');

      //Re-enable transitions and start the next slide moving onto the screen.
      nextSlide.classList.add('is-current');
      nextSlide.classList.remove('is-next');
      nextSlide.classList.remove('is-previous');
      nextSlide.classList.remove('no-transitions');

    }.bind(this), 10);

    //Remove the next/previous classes when the transition has finished.
    transition(currentSlide).once(function(){

      //Reset the current slide position.
      currentSlide.classList.remove('is-next');
      currentSlide.classList.remove('is-previous');
      //disable transitions cause they're not needed?

      //Set the current slide index.
      this.currentIndex = index;

      //Allow the user to spam buttons.
      this.setEnabled(true);

      //Trigger the show event.
      this.emit('show', this.currentIndex);

    }.bind(this));

  } else {

    //Change the slide which is displayed.
    nextSlide.classList.add('is-current');
    currentSlide.classList.remove('is-current');

    //Set the current slide index.
    this.currentIndex = index;

    //Allow the user to spam buttons.
    this.setEnabled(true);

    //Trigger the show event.
    this.emit('show', this.currentIndex);

  }

};

/**
 * Gets whether the specified slide is the first slide
 * @api     public
 * @param   {number}  index
 * @returns {boolean}
 */
SlideShow.prototype.isFirst = function(index) {
  return index === 0;
};

/**
 * Gets whether the specified slide is the last slide
 * @api     public
 * @param   {number}  index
 * @returns {boolean}
 */
SlideShow.prototype.isLast = function(index) {
  return index === this.slideElements.length - 1;
};

/**
 * Gets the next index for the specified index
 * @api     public
 * @param   {number} index
 * @returns {number}
 */
SlideShow.prototype.getNextIndex = function(index) {
  var next = index + 1;
  if(next > (this.slideElements.length - 1)) next = 0;
  return next;
};

/**
 * Gets the previous index for the specified index
 * @api     public
 * @param   {number} index The
 * @returns {number}
 */
SlideShow.prototype.getPreviousIndex = function(index) {
  var previous = index - 1;
  if(previous === -1) previous = (this.slideElements.length - 1);
  return previous;
};

/**
 * Moves to the next slide
 * @api   public
 */
SlideShow.prototype.next = function() {
  this.show(this.getNextIndex(this.currentIndex), true);
  this.emit('next');
};

/**
 * Moves to the previous slide
 * @api   public
 */
SlideShow.prototype.previous = function() {
  this.show(this.getPreviousIndex(this.currentIndex), false);
  this.emit('previous');
};

/**
 * Pauses the slideshow
 * @api   public
 */
SlideShow.prototype.pause = function(){
  this.paused = true;
};

/**
 * Plays the slideshow
 * @api   public
 */
SlideShow.prototype.play = function(){
  this.paused = false;
  this.auto(this.speed);
};

/**
 * Enables automatic sliding
 * @api     public
 * @param   {number}  speed
 */
SlideShow.prototype.auto = function(speed){
  this.speed = speed;

  //Clear previous timeouts so we can update the speed.
  if(this.timeout) {
    clearTimeout(this.timeout);
  }

  // This will keep firing until the speed is set to 0.
  // If the slideshow is paused, the timeout will continue
  // but it won't move to the next slide.
  var self = this;
  this.timeout = setTimeout(function tick(){

    //Stop auto scrolling.
    if(self.speed === 0) {
      return;
    }

    // Set it so we can clear it
    self.timeout = setTimeout(tick, self.speed);

    //Move to the next slide if not paused.
    if(self.paused === false) {
      self.next();
    }

  }.bind(this), self.speed);

};

/**
 * Iterates over the slides
 * @api     public
 * @param   {function}  callback
 */
SlideShow.prototype.each = function(callback){
  for (var i=0; i<this.slideElements.length; ++i) {
    callback.call(this, this.slideElements[i], i)
  }
};

/**
 * Destroy the slideshow
 * @api public
 */
SlideShow.prototype.remove = function() {
  this.element.parentNode.removeChild(this.element);
  this.emit('remove');
};

module.exports = SlideShow;
