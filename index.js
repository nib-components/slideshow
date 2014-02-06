var classes = require('classes');
var events = require('event');
var transition = require('css-emitter');
var Emitter = require('emitter');
var each = [].forEach;

// Test for transition support
var supportsTransitions = (function() {
  var s = document.createElement('p').style, // 's' for style. better to create an element if body yet to exist
      v = ['ms','O','Moz','Webkit']; // 'v' for vendor

  if( s.transition === '' ) return true; // check first for prefeixed-free support

  while( v.length ) // now go over the list of vendor prefixes and check support until one is found
    if( v.pop() + 'Transition' in s )
        return true;

  return false;
})();

/**
 * Export
 */

module.exports = SlideShow;

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
 * Create a slideshow
 * @param {Object} options
 */
function SlideShow(options) {
  this.options = options || {};
  this.el = this.options.el;
  this.slides = this.el.querySelectorAll(this.options.slideSelector || '.js-slide');
  this.current = this.options.startAt || 0;
  this.enabled = true;
  this._createNextButton();
  this._createPreviousButton();
  this._createIndicators();
  this.setIndicator(this.current);
  this.show(this.current, true);
  this.speed = this.options.speed || 0;
  this.pauseOnHover();
  this.play();
}

/**
 * Alternative constructor
 */

SlideShow.create = function(options){
  return new SlideShow(options);
};

/**
 * Mixin an emitter
 */

Emitter(SlideShow.prototype);

/**
 * Create the next button from the template and bind events
 *
 * @api private
 */

SlideShow.prototype._createNextButton = function() {
  var el = getTemplate(this.el, 'next');
  events.bind(el, 'click', this.next.bind(this));
  this.el.appendChild(el);
  this.nextEl = el;
  this.emit('nextButton', el);
};

/**
 * Create the previous button from the template and bind events
 *
 * @api private
 */

SlideShow.prototype._createPreviousButton = function() {
  var el = getTemplate(this.el, 'previous');
  events.bind(el, 'click', this.previous.bind(this));
  this.el.appendChild(el);
  this.previousEl = el;
  this.emit('previousButton', el);
};

/**
 * Create the indicators from the template. Fires events
 * when hovering over the indicator to allow for creating
 * tooltips on the indicators.
 *
 * @api private
 */

SlideShow.prototype._createIndicators = function() {
  var self = this;
  var list = this.el.querySelector('.js-indicators');
  var text;
  this.indicators = [];

  this.each(function(slide, i){
    text = null;

    // check for indicator value
    if (slide.getAttribute('data-indicator-value')){
      text = slide.getAttribute('data-indicator-value');
    }

    var el = getTemplate(this.el, 'indicator', text);

    // When clicking the indicator move to the correct
    // slide. If clicking an indicator higher than the
    // current one, it assumes it is moving forward and
    // vica-versa.
    events.bind(el, 'click', function(){
      self.show(i, i > self.current);
      self.emit('select', i);
    });

    // Add it to the list of indicators
    list.appendChild(el);
    this.indicators.push(el);
  });
};

/**
 * Destroy the slideshow
 *
 * @api public
 */

SlideShow.prototype.remove = function() {
  this.el.parentNode.removeChild(this.el);
  this.emit('remove');
};

/**
 * Set the current active indicator
 *
 * @api private
 */

SlideShow.prototype.setIndicator = function(index) {
  var self = this;
  each.call(this.indicators, function(el, i){
    if( i === index ) {
      classes(el).add('is-active');
      self.emit('indicator:active', el, i);
    }
    else {
      classes(el).remove('is-active');
    }
  });
};

/**
 * Show a slide by its index. Also pass through a boolean
 * for whether to move the slideshow forward or backward
 * to reach the slide.
 *
 * @api public
 */

SlideShow.prototype.show = function(index, isForward) {
  if(this.enabled === false || this.current === index) return;
  this.setIndicator(index);
  this.setSlide(index, isForward);
  this.current = index;
  this.emit('show', index, isForward);
};

/**
 * Loop through each slide and fire a callback
 *
 * @api public
 */

SlideShow.prototype.each = function(fn) {
  each.call(this.slides, fn, this);
};

/**
 * Pass an index and return a boolean determining
 * if it is the index of the last slide
 *
 * @api public
 */

SlideShow.prototype.isLast = function(index) {
  return index === this.slides.length - 1;
};

/**
 * Pass an index and return a boolean determining
 * if it is the index of the first slide
 *
 * @api public
 */

SlideShow.prototype.isFirst = function(index) {
  return index === 0;
};

/**
 * Give it an index and get the index of the next slide
 *
 * @api public
 */

SlideShow.prototype.getNextIndex = function(index) {
  var next = index + 1;
  if(next > (this.slides.length - 1)) next = 0;
  return next;
};

/**
 * Give it an index and get the index of the previous slide
 *
 * @api public
 */

SlideShow.prototype.getPreviousIndex = function(index) {
  var previous = index - 1;
  if(previous === -1) previous = (this.slides.length - 1);
  return previous;
};

/**
 * Enable or disable transitions on a slide
 *
 * @api private
 */

SlideShow.prototype.enableTransitions = function(el) {
  classes(el).remove('no-transitions');
};

/**
 * Enable or disable transitions on a slide
 *
 * @api private
 */

SlideShow.prototype.disableTransitions = function(el) {
  classes(el).add('no-transitions');
};

/**
 * Reposition a slide for its next animation
 *
 * @api private
 */

SlideShow.prototype.reposition = function(index, isForward) {
  var nextSlide = this.slides[index];

  if(this.isLast(index) && isForward) {
    nextSlide.setAttribute('data-state', 'next');
  }
  else if(this.isFirst(index) && !isForward) {
    nextSlide.setAttribute('data-state', 'previous');
  }
  else {
    nextSlide.setAttribute('data-state', isForward ? 'next' : 'previous');
  }
};

/**
 * Show a slide by it's index and a boolean for whether
 * to show it moving forward or backwards
 *
 * @api private
 */

SlideShow.prototype.setSlide = function(show, isForward) {
  var self = this;
  var nextSlide = this.slides[show];
  var currentSlide = this.slides[this.current];

  // Enable when the animations are finished
  if(supportsTransitions) {

    // Stops the user from spamming the buttons
    this.setEnabled(false);

    transition(currentSlide).once(function(){
      self.setEnabled(true);
      currentSlide.removeAttribute('data-state');
      self.emit('show', show);
    });
  }

  self.disableTransitions(nextSlide);

  // Re-position the next slide in the correct position depending
  // if we're going forward or backwards. This allows for looping.
  self.reposition(show, isForward);

  setTimeout(function(){
    currentSlide.setAttribute('data-state', isForward ? 'previous' : 'next');
    self.enableTransitions(nextSlide);
  }, 100);
  setTimeout(function(){
    nextSlide.setAttribute('data-state', 'current');
  }, 100);

};

/**
 * Move to the next slide
 *
 * @api public
 */

SlideShow.prototype.next = function(){
  this.show(this.getNextIndex(this.current), true);
  this.emit('next');
};

/**
 * Move to the previous slide
 *
 * @api public
 */

SlideShow.prototype.previous = function(){
  this.show(this.getPreviousIndex(this.current), false);
  this.emit('previous');
};

/**
 * Enable or disable the ability to move between slides
 *
 * @api public
 */

SlideShow.prototype.setEnabled = function(val) {
  this.enabled = Boolean(val);
};

/**
 * Enable pausing the slideshow on hover
 *
 * @api public
 */

SlideShow.prototype.pauseOnHover = function(){
  this.el.addEventListener('mouseover', this.pause.bind(this));
  this.el.addEventListener('mouseout', this.play.bind(this));
};

/**
 * On pause, set this.paused to true
 *
 * @api public
 */

SlideShow.prototype.pause = function(){
  this.paused = true;
};

/**
 * On play, set this.paused to false and call the auto method
 *
 * @api public
 */

SlideShow.prototype.play = function(){
  this.paused = false;
  this.auto(this.speed);
};

/**
 * Enable an automated scrolling slideshow
 *
 * @api public
 */

SlideShow.prototype.auto = function(speed){
  var self = this;

  // Is it automatic?
  if(speed == null ) {
    return this.speed !== 0;
  }

  this.speed = speed;

  // clear any previous timeouts
  if(this._timeout) clearTimeout(this._timeout);

  // This will keep firing until the speed is set to 0.
  // If the slideshow is paused, the timeout will continue
  // but it won't move to the next slide.
  this._timeout = setTimeout(function tick(){
    // No more automatic sliding
    if(self.speed === 0) return;

    // Set it so we can clear it
    self._timeout = setTimeout(tick, self.speed);

    // Next slide if not paused
    if(self.paused === false) self.next();
  }, this.speed);
};
