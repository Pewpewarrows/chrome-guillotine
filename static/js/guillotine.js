/* Create a closure to maintain scope of the '$'
   and remain compatible with other frameworks.  */
(function($) {

    // Since we're in a closure we don't interfere with window.self
    var self = $(this);

    var Guillotine = Site.extend({
        common: {
            // This function will fire on every page first
            init: function() {
            }
        }
    });
	
    /* DOM Ready */
	$(function() {
        window.Guillotine = new Guillotine();
	});

    /* Window Ready */
	$(window).bind("load", function() {
	});
	
})(jQuery);
