/**
 * loading.js - loading element for blessed
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */

var Spinners = require("cli-spinners");
var Node = require('./node');
var Box = require('./box');
var Text = require('./text');

/**
 * Loading
 */

function Loading(options) {
  if (!(this instanceof Node)) {
    return new Loading(options);
  }

  options = options || {};

  if (typeof options.spinner !== "string" || typeof options.spinner !== "object") {
    options.spinner = "dots";
  }

  this.spinner = Spinners.default[options.spinner];
  if (typeof options.spinner == "object" && Array.isArray(options.spinner.frames)) {
    this.spinner = {
      interval: options.spinner.interval || 80,
      frames: options.spinner.frames
    };
  }

  Box.call(this, options);

  this._.indexSpinner = 0;
  this._.icon = new Text({
    parent: this,
    align: 'center',
    top: 1,
    left: 1,
    right: 1,
    height: 1,
    content: this.spinner[this._.indexSpinner],
    style: options.style
  });
}

Loading.prototype.__proto__ = Box.prototype;

Loading.prototype.type = 'loading';

Loading.prototype.load = function (text) {
  var self = this;

  // XXX Keep above:
  // var parent = this.parent;
  // this.detach();
  // parent.append(this);

  this.show();
  // this.setContent(text);
  this._.loading = () => {
    const { frames } = this.spinner;
    const spinner = frames[this._.indexSpinner = ++this._.indexSpinner % frames.length];
    const hasSpinner = text.indexOf('{spinner}') > -1;
    const content = hasSpinner ? text.split('{spinner}').join(spinner) : `${spinner} ${text}`;
    self._.icon.setContent(content);
    self.screen.render();
  }
  this._.loading();

  if (this._.timer) {
    this._.indexSpinner = 0;
    this.stop();
  }

  this.screen.lockKeys = true;

  this._.timer = setInterval(this._.loading, this.spinner.interval);
};

Loading.prototype.stop = function () {
  this.screen.lockKeys = false;
  this.hide();
  if (this._.timer) {
    clearInterval(this._.timer);
    delete this._.timer;
  }
  this.screen.render();
};

/**
 * Expose
 */

module.exports = Loading;
