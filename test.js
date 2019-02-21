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

var nested_documents = buildDoc("test_samples/subdocs");
//console.log(nested_documents);
assert(nested_documents._id === 'parent');
assert(Array.isArray(nested_documents._docs));
assert(nested_documents._docs.length === 3);
assert(nested_documents._docs.find(d => d._id === 'explicit').name === "Mr. Id");
assert(nested_documents._docs.find(d => d._id === 'json').json === true);
var subnested = nested_documents._docs.find(d => d._id === 'doc_of_docs');
//console.log(subnested._docs);
assert(subnested.field === "value");
assert(Array.isArray(subnested._docs));
assert(subnested._docs.find(d => d._id === 'nested').abc === 123);
var nest_atts = subnested._docs.find(d => d._id === 'nested2');
assert(nest_atts._attachments['file.txt'].data === "SEVMTE8=");
assert(nest_atts._attachments['subfolder/file.txt'].data === "V09STEQ=");
