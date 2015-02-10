/* 
  Quick bookmark search
  Developed by Joel Perry - 24/07/14
*/
({
  bookmarks     : [],
  selectedItem  : null,
  view         : {
    displayLimit    : 6,
    container       : null,
    searchBox       : null,
    outputContainer : null,
    ids             : {
      container       : 'bookmark-search-container',
      searchBox       : 'bookmark-search-box',
      outputContainer : 'bookmark-search-output',
    },
    classes : {
      bookmark  : 'bookmark-search-bookmark',
      favicon   : 'bookmark-search-favicon',
      selected  : 'bookmark-search-selected',
    },
    fonts : {
      droidSans : 'http://fonts.googleapis.com/css?family=Droid+Sans',
      ubuntu    : 'http://fonts.googleapis.com/css?family=Ubuntu'
    }
  },
  keyCodes : {
    backspace : 8,
    enter     : 13,
    escape    : 27,
    up        : 38,
    down      : 40,
    b         : 66
  },

  init : function () {
    this.injectHTML().getBookmarks().addListeners().align();
  },

  injectHTML : function () {
    this.view.container    = document.createElement('div');
    this.view.container.id = this.view.ids.container;

    this.view.searchBox              = document.createElement('input');
    this.view.searchBox.id           = this.view.ids.searchBox;
    this.view.searchBox.placeholder  = "Search bookmarks";

    this.view.outputContainer      = document.createElement('ul');
    this.view.outputContainer.id   = this.view.ids.outputContainer;

    this.view.container.appendChild(this.view.searchBox);
    this.view.container.appendChild(this.view.outputContainer);

    var fontLink  = document.createElement('link');
    fontLink.rel  = 'stylesheet';
    fontLink.type = 'text/css';
    fontLink.href = this.view.fonts.droidSans;

    document.head.appendChild(fontLink);
    document.body.appendChild(this.view.container);

    return this;
  },

  search : function (searchTerm) {
    if (searchTerm.length > 0) {
      this.output(this.searchBookmarks(searchTerm));
    }

    return this;
  },

  clear : function () {
    this.view.searchBox.value                = "";
    this.view.outputContainer.innerHTML      = "";
    this.view.outputContainer.style.display  = "none";

    return this;
  },

  addListeners : function () {
    var x     = this;
    var keys  = this.keyCodes;

    // Search box events
    this.view.searchBox.onkeydown = function (e) {
      if (e.keyCode === keys.up || e.keyCode === keys.down || e.keyCode === keys.enter || e.metaKey) {
        e.preventDefault();
      }
    }

    this.view.searchBox.onkeyup = function (e) {
      if (e.keyCode === keys.up || e.keyCode === keys.down || e.keyCode === keys.enter || e.metaKey) {
        return;
      }

      x.search.apply(x, [this.value]);
    };

    this.view.searchBox.onkeypress = function (e) {
      if (e.metaKey) {
        e.preventDefault();
      } 
    }

    this.view.searchBox.onblur = function () {
      x.hide.apply(x);
    }


    // window and document events
    window.onscroll = window.onresize = function () {
      x.align.apply(x);
    }

    document.onkeydown = function (e) {
      switch (e.keyCode) {
        case keys.backspace:
          x.clear.apply(x);
          break;

        case keys.enter: 
          x.goToLink.apply(x);
          break;

        case keys.escape:
          x.hide.apply(x);
          break;

        case keys.up:
          x.selectItemWithOffset.apply(x, [-1]);
          break;

        case keys.down: 
          x.selectItemWithOffset.apply(x, [1]);
          break;

        case keys.b:
          if (e.metaKey) x.toggleVisible.apply(x);
          break;
      }
    }; 

    return this;
  },

  output : function (bookmarks) {
    this.view.outputContainer.innerHTML      = "";
    this.view.outputContainer.style.display  = "none";

    for (var i = 0; i < bookmarks.length && i < this.view.displayLimit; i++) {
      var item        = document.createElement('li');
      item.innerHTML  = bookmarks[i].title;
      item.className  = this.view.classes.bookmark;

      item.setAttribute('data-url', bookmarks[i].url);

      var favicon       = document.createElement('img');
      favicon.src       = "http://g.etfv.co/" + bookmarks[i].url;
      favicon.className = this.view.classes.favicon;

      item.appendChild(favicon);
      
      if (i === 0) {
        this.selectItem(item);
        this.view.outputContainer.style.display = "block";
      }

      this.view.outputContainer.appendChild(item);
    }

    return this;
  },

  show : function () {
    this.view.container.style.display = "block";
    this.align().view.searchBox.focus();

    return this;
  },

  hide : function () {
    this.view.container.style.display  = "none";
    this.clear();

    return this;
  },

  toggleVisible : function () {
    (this.view.container.style.display === "block") ? this.hide() : this.show();
  },

  align : function () {
    this.view.container.style.left = (window.innerWidth / 2) - (this.view.container.offsetWidth / 2) + "px";
    this.view.container.style.top  = document.body.scrollTop + (window.innerHeight / 10) + "px";

    return this;
  },

  searchBookmarks : function (searchTerm) {
    return this.bookmarks.filter(function (bookmark) {
      bookmark.matchIndex = bookmark.title.toLowerCase().search(searchTerm.toLowerCase());
      return (bookmark.matchIndex !== -1);
    }).sort(function (a, b) {
      return a.matchIndex - b.matchIndex;
    });
  },

  getBookmarks : function () {
    var x = this;

    chrome.runtime.sendMessage("bookmarks", function (response) {
      x.bookmarks = response;
    });

    return this;
  },

  goToLink : function () {
    window.location.href = this.selectedItem.getAttribute('data-url');
  },

  selectItem : function (item) {
    if (this.selectedItem) {
      this.selectedItem.className = this.view.classes.bookmark;
    }

    this.selectedItem = item;
    this.selectedItem.className += " " + this.view.classes.selected;
  },

  selectItemWithOffset : function (offset) {
    var items = this.view.outputContainer.children, x = this;

    for (var i = 0; i < items.length; i++) {
      if (isSelected(items[i]) && items[i + offset]) {
        this.selectItem(items[i + offset]);
        break;
      }
    }

    function isSelected(element) {
      return element.className.search(x.view.classes.selected) !== -1;
    }
  }
}).init();