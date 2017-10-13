var assert = require('assert'),
    buildDoc = require(".");

var ignore = buildDoc("test_samples/ignore");
console.log(ignore);
assert(ignore._attachments['yep.txt']);
assert(!ignore._attachments['nope.bin']);
assert(!ignore.packages);
assert(ignore.other.packages);
