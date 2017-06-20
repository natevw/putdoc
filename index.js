#! /usr/bin/env node

var buildDoc = require("./build_doc.js"),
    fermata = require('fermata');

if (process.argv.length < 4) {
  console.log("Usage: updoc <doc_folder> <post_url>");
  process.exit(-1);
}

var doc_folder = process.argv[2],
    post_url = process.argv[3];

var api = fermata.json(post_url),
    doc = buildDoc(doc_folder),
    doc_url = api([doc._id]);
doc_url.get(function (e,oldDoc) {
  if (e && e.status !== 404) console.error("Error checking current doc:", e);
  else {
    if (!e) doc._rev = oldDoc._rev;
    doc_url.put(doc, function (e,d) {
      if (e) console.error("Error uploading doc:", e);
      else console.log(d);
    });
  }
});
