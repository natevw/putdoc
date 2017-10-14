var assert = require('assert'),
    buildDoc = require(".");

var ignore = buildDoc("test_samples/ignore");
//console.log(ignore);
assert(ignore._attachments['yep.txt']);
assert(!ignore._attachments['nope.bin']);
assert(!ignore.packages);
assert(ignore.other.packages);


var auto_id = buildDoc("test_samples/folder_as_id");
//console.log(auto_id);
assert(auto_id._id === '_design/folder_as_id');

var static_id = buildDoc("test_samples/hardcoded_id");
//console.log(static_id)
assert(static_id._id === '_design/from_file');
