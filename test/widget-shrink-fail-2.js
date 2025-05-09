var blessed = require('../');
var screen = blessed.screen({
  autoPadding: true,
  warnings: true
});

var tab = blessed.box({
  parent: screen,
  top: 2,
  left: 0,
  right: 0,
  bottom: 0,
  scrollable: true,
  keys: true,
  vi: true,
  alwaysScroll: true,
  scrollbar: {
    ch: ' '
  },
  style: {
    scrollbar: {
      inverse: true
    }
  }
});

tab._.data = blessed.text({
  parent: tab,
  top: 0,
  left: 3,
  height: 'shrink',
  width: 'shrink',
  content: '',
  tags: true
});

tab._.data.setContent(require('util').inspect(process, null, 6));

screen.key(['escape', 'q', 'C-c'], function() {
  screen.destroy();
});

screen.render();
