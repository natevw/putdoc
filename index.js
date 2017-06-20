var buildDoc = require("./build_doc.js")

var doc = buildDoc(process.argv[2])
console.log(doc);
