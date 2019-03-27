(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      define(['tui-editor'], factory);
    } else if (typeof exports === 'object') {
      factory(require('tui-editor'));
    } else {
      factory(root['tui']['Editor']);
    }
  })(this, function(Editor) {
    Editor.defineExtension('youtube', function() {
      Editor.codeBlockManager.setReplacer('youtube', function(youtubeId) {
        var wrapperId = 'yt' + Math.random().toString(36).substr(2, 10);
        setTimeout(renderYoutube.bind(null, wrapperId, youtubeId), 0);
  
        return '<div id="' + wrapperId + '"></div>';
      });
    });
  
    function renderYoutube(wrapperId, youtubeId) {
      var el = document.querySelector('#' + wrapperId);
      el.innerHTML = '<iframe width="640" height="360" frameborder="0" src="https://www.youtube.com/embed/' + youtubeId + '"></iframe>';
      // MODIFIED By LIFOsitory
      $('[data-language="youtube"]').unwrap();
    }
  });