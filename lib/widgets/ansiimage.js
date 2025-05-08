/**
 * ansiimage.js - render PNGS/GIFS as ANSI
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

/**
 * Modules
 */

var https = require('https');
var http = require('http');
var { runLoopOnce } = require('@se-oss/deasync');
var colors = require('../colors');

var Node = require('./node');
var Box = require('./box');

var tng = require('../../vendor/tng');

/**
 * ANSIImage
 */

function ANSIImage(options) {
  var self = this;

  if (!(this instanceof Node)) {
    return new ANSIImage(options);
  }

  options = options || {};
  options.shrink = true;

  Box.call(this, options);

  this.scale = this.options.scale || 1.0;
  this.options.animate = this.options.animate !== false;
  this._noFill = true;

  if (this.options.file) {
    this.setImage(this.options.file);
  }

  this.screen.on('prerender', function() {
    var lpos = self.lpos;
    if (!lpos) return;
    // prevent image from blending with itself if there are alpha channels
    self.screen.clearRegion(lpos.xi, lpos.xl, lpos.yi, lpos.yl);
  });

  this.on('destroy', function() {
    self.stop();
  });
}

ANSIImage.prototype.__proto__ = Box.prototype;

ANSIImage.prototype.type = 'ansiimage';

const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36 Edg/90.0.818.51";
ANSIImage.curl = function(imageUrl = "") {
  if (!/^https?:/.test(imageUrl)) throw new Error("Invalid Image URL");

  let result = null;
  let error = null;

  const options = {
    headers: {
      'User-Agent': userAgent
    }
  };

  const makeRequest = (url) => {
    const requestModule = url.startsWith('https') ? https : http;
    requestModule.get(url, options, (res) => {
      if (res.statusCode === 200) {
        let data = [];
        res.on('data', chunk => data.push(chunk));
        res.on('end', () => {
          result = Buffer.concat(data);
        });
      } else if (res.statusCode === 302) {
        const location = res.headers['location'];
        if (location) {
          makeRequest(location);
        } else {
          error = new Error('Redirect location not found.');
        }
      } else {
        error = new Error(`Failed to download image. Status code: ${res.statusCode}`);
      }
    }).on('error', (err) => {
      error = new Error(`Error downloading the image: ${err.message}`);
    });
  };

  makeRequest(imageUrl);
  while (result === null && error === null) {
    runLoopOnce();
  }

  if (error) throw error;
  return result;
};

ANSIImage.prototype.setImage = function(file) {
  this.file = typeof file === 'string' ? file : null;

  if (/^https?:/.test(file)) {
    file = ANSIImage.curl(file);
  }

  var width = this.position.width;
  var height = this.position.height;

  if (width != null) {
    width = this.width;
  }

  if (height != null) {
    height = this.height;
  }

  try {
    this.setContent('');

    this.img = tng(file, {
      colors: colors,
      width: width,
      height: height,
      scale: this.scale,
      ascii: this.options.ascii,
      speed: this.options.speed,
      filename: this.file
    });

    if (width == null || height == null) {
      this.width = this.img.cellmap[0].length;
      this.height = this.img.cellmap.length;
    }

    if (this.img.frames && this.options.animate) {
      this.play();
    } else {
      this.cellmap = this.img.cellmap;
    }
  } catch (e) {
    this.setContent('Image Error: ' + e.message);
    this.img = null;
    this.cellmap = null;
  }
};

ANSIImage.prototype.play = function() {
  var self = this;
  if (!this.img) return;
  return this.img.play(function(bmp, cellmap) {
    self.cellmap = cellmap;
    self.screen.render();
  });
};

ANSIImage.prototype.pause = function() {
  if (!this.img) return;
  return this.img.pause();
};

ANSIImage.prototype.stop = function() {
  if (!this.img) return;
  return this.img.stop();
};

ANSIImage.prototype.clearImage = function() {
  this.stop();
  this.setContent('');
  this.img = null;
  this.cellmap = null;
};

ANSIImage.prototype.render = function() {
  var coords = this._render();
  if (!coords) return;

  if (this.img && this.cellmap) {
    this.img.renderElement(this.cellmap, this);
  }

  return coords;
};

/**
 * Expose
 */

module.exports = ANSIImage;
