/* Create a closure to maintain scope of the '$'
   and remain compatible with other frameworks.  */
(function($) {

    // Since we're in a closure we don't interfere with window.self
    var self = $(this);

    var Guillotine = {
        add_snippet: function(obj) {
            var snippets = JSON.parse(localStorage.snippets);
            snippets.push(obj);
            localStorage.snippets = JSON.stringify(snippets);
        }
    };
	
    var extension = Site.extend({
        common: {
            // This function will fire on every page first
            init: function() {
                if (localStorage.snippets === undefined) {
                    localStorage.snippets = JSON.stringify([]);
                }
            }
        },

        guillotine: {
            background: function() {
                Guillotine.menu_item = chrome.contextMenus.create({
                    title: 'Add selection to Guillotine',
                    contexts: [
                        'selection'
                    ],
                    onclick: function(info, tab) {
                        Guillotine.add_snippet({
                            url: info.pageUrl,
                            text: info.selectionText
                        });
                    }
                });

                chrome.browserAction.onClicked.addListener(function(tab) {
                    var view_tab = chrome.extension.getURL('/pages/guillotine.html');
                    //var views = chrome.extension.getViews();

                    Guillotine.found = false;

                    chrome.windows.getAll({
                        populate: true
                    }, function(windows) {
                        for (var w = 0; w < windows.length; w++) {
                            for (var i = 0; i < windows[w].tabs.length; i++) {
                                var tab = windows[w].tabs[i];

                                if (tab.url == view_tab) {
                                    Guillotine.found = true;

                                    chrome.tabs.update(tab.id, {
                                        selected: true
                                    });
                                }
                            }
                        }

                        if (!Guillotine.found) {
                            chrome.tabs.create({
                                url: view_tab
                            });
                        }
                    });
                });
            },

            main: function() {
            }
        }
    });

    /* DOM Ready */
	$(function() {
        window.extension = new extension();
        window.Guillotine = Guillotine;
	});

    /* Window Ready */
	$(window).bind("load", function() {
	});
	
})(jQuery);
