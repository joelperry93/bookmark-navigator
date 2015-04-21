chrome.bookmarks.getTree(function (tree) {
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      	if (request === "bookmarks") {
      		sendResponse(tree[0].children[0].children);
      	}
	});
});