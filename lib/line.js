
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');

function Line(options) {
  EventEmitter.call(this);

  var self = this;
  this.config = {};
  this.middleware = [];
  this.buffer = [];
  this.current = 0;

  this.on('step', function(){
    if (self.current === self.middleware.length) {
      return self.emit('end', self.buffer);
    }
    var next = function(data) {
      self.buffer.push(data);
      self.current++;
      self.emit('step');
    };
    tail = this.buffer[this.buffer.length - 1] || this.input;
    self.middleware[self.current].call(self, tail, self.buffer, next);
  });

  this.on('end', function(){
    if (typeof self._endCallback !== 'function')
      throw new Error('Missing callback function. Use `Line#end(fn)`')
    self._endCallback.call(self, self.buffer);
  });
};

util.inherits(Line, EventEmitter);

Line.prototype.use = function(fn) {
  self = this;
  if (util.isArray(fn)) {
    _.each(fn, function(fn_i) {
      self.middleware.push(fn_i);
    });
    return this;
  }
  this.middleware.push(fn);
  return this;
};

Line.prototype.run = function(input) {
  this.input = input;
  this.emit('step');
  return this;
};

Line.prototype.end = function(fn){
  this._endCallback = fn;
  return this;
};

Line.prototype.flush = function() {
  this.current = 0;
  this.middleware = [];
  this._events = {};
  return this;
};

Line.prototype.set = function(attr, value) {
  this.config[attr] = value;
  return this;
};

exports = module.exports = Line;
