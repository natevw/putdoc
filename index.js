#! /usr/bin/env node

var buildDoc = require("./build_doc.js"),
    fermata = require('fermata');

var no_parent = (process.argv[2] === '--docs'),
    args_expected = (no_parent) ? 5 : 4;

if (process.argv.length < args_expected) {
  console.log("Usage: putdoc [--docs] <doc_folder> <post_url>");
  process.exit(-1);
}

var doc_folder = process.argv[args_expected - 2],
    post_url = process.argv[args_expected - 1];

var docs = [];
function extractDocs(doc) {
  if (doc._id) docs.push(doc);
  else if (!no_parent || docs.length) console.warn("Unexpected _id-less doc:", doc);
  if (doc._docs) {
    doc._docs.forEach(extractDocs);
    delete doc._docs;
  }
}
extractDocs(buildDoc(doc_folder, {no_parent:no_parent}));

var api = fermata.json(post_url);
docs.forEach(function (doc) {
  var doc_url = api([doc._id]);
  doc_url.get(function (e,oldDoc) {
    if (e && e.status !== 404) console.error("Error checking current doc:", e, arguments);
    else {
      if (!e) doc._rev = oldDoc._rev;
      doc_url.put(doc, function (e,d) {
        if (e) console.error("Error uploading doc:", e);
        else console.log(d);
      });
    }
  });
});
