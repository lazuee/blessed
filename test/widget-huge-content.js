var blessed = require('../')
  , screen;

screen = blessed.screen({
  dump: __dirname + '/logs/huge-content.log',
  smartCSR: true,
  warnings: true
});

var content = '';
for (var j = 0; j < 50; j++) {
  for (var i = 0; i < 50; i++) {
    content += 'line: ' + i + '\n';
  }
  for (var i = 0; i < 100; i++) {
    content += 'longline';
  }
  content += '\n';
}

var box = blessed.box({
  parent: screen,
  scrollable: true,
  left: 'center',
  top: 'center',
  width: '80%',
  height: '80%',
  border: 'line',
  content: content,
  keys: true,
  vi: true,
  alwaysScroll: true,
  scrollbar: {
    ch: ' ',
    inverse: true
  }
});

screen.key(['escape', 'q', 'C-c'], function() {
  return screen.destroy();
});

box.focus();

screen.render();
