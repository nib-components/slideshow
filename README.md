# Slideshow

A JS slideshow that depends on CSS transitions.

TODO: Link to styles component

## Installation

```
$ component install nib-components/slideshow
```

## API


Require component

```
var Slideshow = require('slideshow');
```

Then create the slideshow

```
// we need a target element
var element = document.querySelector('.js-slideshow');

var slideshow = new Slideshow({
  el: element,  // expects an element
  speed: 2000,   // optional: enables automatic scrolling at this speed. Defaults to null
  slideSelector: .js-slide-item,   // optional: define a classname for a slide. Defaults to .js-slide
  startAt: 2,   // optional: define the starting slide, Defaults to 0
  buttons: false, // optional: display next/previous buttons, Defaults to true
  indicators: false // optional: display paging indicators, Defaults to true
 });
```

The slideshow expects certain markup.

```
	<!-- js-slideshow - Slideshow wrapper -->
	<div class="slideshow slideshow--banner js-slideshow">

	  <!-- Slides wrapper -->
	  <div class="slideshow__slides" data-state="current">
	    <!-- Slide -->
	    <div class="slideshow__slide js-slide">Slide 1</div>

	    <!-- Slide -->
	    <div class="slideshow__slide js-slide">Slide 2</div>

	    <!-- Slide -->
	    <div class="slideshow__slide js-slide">Slide 3</div>
	  </div>

	  <!-- Indicators wrapper -->
	  <div class="slideshow__indicators js-indicators">
	    <!-- indicator template -->
	    <script type="text/template" data-template="indicator">
	      <span class="slideshow__indicator"></span>
	    </script>
	  </div>

	  <!-- Next button template -->
	  <script type="text/template" data-template="next">
	    <span class="slideshow__next"></span>
	  </script>

	  <!-- Previous button template -->
	  <script type="text/template" data-template="previous">
	    <span class="slideshow__previous"></span>
	  </script>
	</div>
```