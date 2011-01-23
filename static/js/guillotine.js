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
        },

        update_snippets: function() {
            var snippets = JSON.parse(localStorage.snippets);
            var $snippets = $('#snippets table tbody');

            $snippets.html('');
            for (var i = 0; i < snippets.length; i++) {
                var snip = snippets[i];
                $snippets.append('<tr id="' + i + '"><td><input class="snip" type="checkbox" /></td><td><a href="' + snip.url  + '">' + snip.url + '</a></td><td class="snip-text">' + escape(snip.text)  + '</td><td><a class="remove-snip" href="javascript:;">X</a></td></tr>');
            }

            if (snippets.length === 0) {
                $('#no-snips').show();
                $('#snippets table').hide();
            } else {
                $('#no-snips').hide();
                $('#snippets table').show();
            }
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
                            text: Encoder.htmlEncode(info.selectionText)
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
                $(window).bind('storage', function(e) {
                    Guillotine.update_snippets();
                });

                Guillotine.update_snippets();

                $('input.snip').live('click', function() {
                    var snips = $('input.snip:checked');
                    var id = $(this).closest('tr').attr('id');

                    if (snips.length == 3) {
                        $('#' + Guillotine.first_snip + ' input.snip').attr('checked', '');
                    }

                    if ($(this).attr('checked') === true) {
                        if (Guillotine.second_snip === undefined) {
                            Guillotine.second_snip = id;
                        }

                        Guillotine.first_snip = Guillotine.second_snip;
                        Guillotine.second_snip = id;
                    } else {
                        if (snips.length === 0) {
                            Guillotine.first_snip = Guillotine.second_snip = undefined;
                        } else {
                            Guillotine.first_snip = Guillotine.second_snip = $(snips[0]).closest('tr').attr('id');
                        }
                    }
                });

                $('a.remove-snip').live('click', function() {
                    var snippets = JSON.parse(localStorage.snippets);
                    var snip = $(this).closest('tr');
                    var id = parseInt(snip.attr('id'), 10);

                    snippets.splice(id - 1, 1);
                    localStorage.snippets = JSON.stringify(snippets);

                    snip.remove();

                    Guillotine.update_snippets();
                });

                $('#diff').click(function() {
                    var snips = $('input.snip:checked');

                    if (snips.length != 2) {
                        alert('You must have exactly 2 snippets selected to run the comparison tool.');

                        return false;
                    }

                    var first_snip = Encoder.htmlDecode(escape($(snips[0]).closest('tr').find('td.snip-text').html()));
                    var second_snip = Encoder.htmlDecode(escape($(snips[1]).closest('tr').find('td.snip-text').html()));

                    var diff = diffString(first_snip, second_snip);
                    $('#result').html(diff);

                    return false;
                });
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
