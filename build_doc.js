var fs = require('fs'),
    p = require('path'),
    mime = require('mime'),
    extend = require('xok');

module.exports = function (ddoc_dir, opts) {
  opts = extend({
    no_parent: false,             // boolean: if true, expects so-called `ddoc_dir` to be a folder containing individual documents
    ignore: '.couchappignore'     // string: path to JSON ignores list, array: provide list directly, fn: used to test
  }, opts);
  
  if (typeof opts.ignore === 'string') try {
    var ignore_file = p.join(ddoc_dir, opts.ignore);
    opts.ignore = loadData(ignore_file, {json:true});
  } catch (err) {
    if (err.code === 'ENOENT') opts.ignore = [];
    else throw err;
  }
  if (Array.isArray(opts.ignore)) {
    var exclude_list = opts.ignore.map(function (s) { return new RegExp(s); });
    opts.ignore = function (rel_path) {
      return exclude_list.some(function (re) {
        return re.test(rel_path);
      });
    }
  }
  
  function loadData(abs_path, opts) {
    opts = extend({json:false}, opts);
    
    var data = fs.readFileSync(abs_path, 'utf8');
    if (opts.json) {
      try {
        data = JSON.parse(data);
      } catch (err) {
        console.warn("Couldn't parse", abs_path, "as intended:", err.message);
      }
    }
    return data;
  }
  
  function forEachEntry(rel_base, dir, fn) {
    fs.readdirSync(p.join(rel_base,dir)).forEach(function (file) {
        var rel_path = p.join(dir,file),
            abs_path = p.join(rel_base,rel_path),
            type = fs.statSync(abs_path);
        if (file[0] === '.' || opts.ignore(rel_path)) return;
        else fn(file, type, rel_path, abs_path);
    });
  }
  
  function addField(obj, key, val) {
    let keyPrefix = key.split('.')[0];
    if (keyPrefix === '_data') {
      if (typeof val === 'object') {
        if (Array.isArray(val)) console.warn("Merging indexes of array", key, "into parent object.");
        extend(obj, val);
      } else {
        // only objects can be merged.
        console.warn("Ignoring non-mergeable", key, typeof val, "field.");
      }
    } else {
      obj[key] = val;
    }
  }
  
  function fixupId(obj, fallback_id) {
    if (!obj._id) obj._id = fallback_id;
    else obj._id = obj._id.trim();      // clean up a bit, not as aggressively as https://github.com/couchapp/couchapp/blob/1399aedfa9e5bb3dd582aa5992dc419e82e102a3/couchapp/localdoc.py#L81 though
  }
  
  
  function objFromDir(doc_dir, dir, lvl) {
    var obj = {};
    forEachEntry(doc_dir, dir, function (file, type, rel_path, abs_path) {
      if (lvl === 0 && type.isDirectory() && file === '_attachments') {
        obj._attachments = {};
        addAttsFromDir(obj._attachments, doc_dir, rel_path, '');
      }
      else if (lvl === 0 && type.isDirectory() && file === '_docs') {
        obj._docs = docsFromDir(abs_path);
      }
      else if (type.isDirectory()) {
        var key = file,
            val = objFromDir(doc_dir, rel_path, lvl+1);
        addField(obj, key, val);
      }
      else if (type.isFile()) {
        var ext = p.extname(file),
            key = p.basename(file,ext),
            val = loadData(abs_path, {json:(ext === '.json')});
        addField(obj, key, val);
      } else {
          console.warn("Skipping field", rel_path);
      }
    });
    return obj;
  }
  function docsFromDir(dir) {
    var docs = [],
        data = {};
    forEachEntry(dir, '', function (file, type, rel_path, abs_path) {
      var subdoc;
      if (type.isDirectory()) subdoc = objFromDir(abs_path, '', 0);
      else if (type.isFile() && p.extname(file) === '.json') {
        subdoc = loadData(abs_path, {json:true});
      } else {
        console.warn("Skipping document", rel_path);
      }
      
      let keyPrefix = file.split('.')[0];
      if (keyPrefix === '_data') {
        extend(data, subdoc);
      } else {
        fixupId(subdoc, p.basename(file, '.json'));
        docs.push(subdoc);
      }
    });
    docs.forEach(function (subdoc) {
      extend(subdoc, data);
    });
    return docs;
  }
  function addAttsFromDir(atts, doc_dir, dir, pre) {
    forEachEntry(doc_dir, dir, function (file, type, rel_path, abs_path) {
      // NOTE: `key` is used in URLs, so use `p.posix` instead of OS default
      var key = p.posix.join(pre, file);
      if (type.isDirectory()) addAttsFromDir(atts, doc_dir, rel_path, key);
      else atts[key] = {
        content_type: mime.getType(file),
        data: fs.readFileSync(abs_path).toString('base64')
      };
    });
  }
  
  if (opts.no_parent) {
    var _docs = docsFromDir(ddoc_dir);
    return {_docs:_docs};
  } else {
    var obj = objFromDir(ddoc_dir, '', 0);
    fixupId(obj, "_design/" + p.basename(ddoc_dir));
    return obj;
  }
}
