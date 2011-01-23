var port = chrome.extension.connect();

var menu_item = chrome.contextMenus.create({
    title: 'Add selection to Guillotine',
    contexts: [
        'page'
    ],
    onclick: function(info, tab) {
        console.log(info);
        console.log(tab);
    }
});
