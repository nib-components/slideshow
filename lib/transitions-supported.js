
// Test for transition support
var transitionsSupported = (function() {
  var s = document.createElement('p').style, // 's' for style. better to create an element if body yet to exist
    v = ['ms','O','Moz','Webkit']; // 'v' for vendor

  if( s.transition === '' ) return true; // check first for prefeixed-free support

  while( v.length ) // now go over the list of vendor prefixes and check support until one is found
    if( v.pop() + 'Transition' in s )
      return true;

  return false;
})();

module.exports = transitionsSupported;