var assert = require('assert'),
    buildDoc = require(".");

var ignore = buildDoc("test_samples/ignore");
//console.log(ignore);
assert(ignore._attachments['yep.txt']);
assert(!ignore._attachments['nope.bin']);
assert(!ignore.packages);
assert(ignore.other.packages);
assert(ignore.broken === "This is not valid JSON :-/");


var auto_id = buildDoc("test_samples/folder_as_id");
//console.log(auto_id);
assert(auto_id._id === '_design/folder_as_id');

var static_id = buildDoc("test_samples/hardcoded_id");
//console.log(static_id)
assert(static_id._id === '_design/from_file');

var merged_entries = buildDoc("test_samples/merging");
// console.log(merged_entries);
assert(!Object.keys(merged_entries).some(k => k.startsWith('_data')));
assert(merged_entries._id === 'root_id_from_merged_folder');
assert(merged_entries.from_file === true);
assert(merged_entries.from_data === true);
assert(merged_entries.also_has === "more");
assert(merged_entries['0'] === "array");
assert(merged_entries['1'] === "entries");
assert(     // NOTE: which one wins is undefined behavior!
  merged_entries.duplicate === "from: file entry" ||
  merged_entries.duplicate === "from: sub-folder" ||
  merged_entries.duplicate === "from: _data.json" ||
  merged_entries.duplicate === "from: _data.more.json"
)
assert(merged_entries.data["are we recursing yet?"] === "not overly so");

var nested_documents = buildDoc("test_samples/subdocs");
// console.log(nested_documents);
assert(nested_documents._id === 'parent');
assert(Array.isArray(nested_documents._docs));
assert(nested_documents._docs.length === 3);
assert(nested_documents._docs.find(d => d._id === 'explicit').name === "Mr. Id");
assert(nested_documents._docs.find(d => d._id === 'json').json === true);
var subnested = nested_documents._docs.find(d => d._id === 'doc_of_docs');
// console.log(subnested._docs);
assert(subnested.field === "value");
assert(subnested.extra_field === "extra_value");
assert(!('mixin' in subnested));
assert(Array.isArray(subnested._docs));
assert(subnested._docs.every(d => d.mixin === true));
assert(subnested._docs.every(d => d.mixin2 === 2));
assert(subnested._docs.find(d => d._id === 'nested').abc === 123);
var nest_atts = subnested._docs.find(d => d._id === 'nested2');
assert(nest_atts._attachments['file.txt'].data === "SEVMTE8=");
assert(nest_atts._attachments['subfolder/file.txt'].data === "V09STEQ=");
