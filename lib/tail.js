const fs = require('fs');
const rl = require('readline');
const events = require('events');
const util = require('util');

/**
  *This module is responsible to read and tail a log file. We assume that only new log will be appended to this log file,
  *which means the size of log file keeps incrementing and does not decrease.
  *If there are preexisting records, it shall read through the records line by line from position specified. Then it begins to
  *keep updating new incoming log.
  *Parameters:
  *filepath: path to the target log file.
  *position: the position where it start to process the log file.
  *Events:
  *'log' - user of this module listen to this event to get log records line by line including pre-existing and incoming ones.
  */
var Tail = function (filepath, position) {
  const self = this;
  self.filepath = filepath;
  self.current_position = position;

  function updatePosition(path) {
    fs.stat(path, (err, stats) => {
      if (err) {
        console.log(err);
      }
      self.current_position = stats.size;
    });
  }

  function readFromIndex(path, index) {
    // **debug output
    //console.log('Read file: ', path);
    //console.log('Reading from ', current_position);
    const rs = fs.createReadStream(path, {start: index});

    var ri = rl.createInterface({
      input: rs
    });

    ri.on('line', (input) => {
        // **debug output
      //console.log('Received at ', new Date());
      //console.log('\t', input);
      //Tail.filter(input);
      //console.log(util.inspect(input));
      //console.log('size:', input.length);
      if (input.length != 0) { // empty line shall be neglected.
        self.emit('log', input);
      }
    });
  }


/**
  * Call this method to beging process.
  */
  this.tail = function () {
    // read from start
    readFromIndex(self.filepath, 0);
    updatePosition(self.filepath);

    // a workaround for fixing event fires twice.
    var even_odd = 0;
    var watcher = fs.watch(self.filepath);
    watcher.on('change', function() {
      if (even_odd % 2 == 0) {
        readFromIndex(self.filepath, self.current_position);
        updatePosition(self.filepath);
      }
      even_odd++;
    });
  }

}

Tail.prototype = new events.EventEmitter;

module.exports = Tail;
