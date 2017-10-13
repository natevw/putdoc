var fs = require('fs'),
    p = require('path'),
    mime = require('mime'),
    extend = require('xok');

module.exports = function (ddoc_dir, opts) {
  opts = extend({
    ignore: '.couchappignore'     // string: path to JSON ignores list, array: provide list directly, fn: used to test
  }, opts)
  
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
    opts = extend({json:false}, opts)
    
    var data = fs.readFileSync(abs_path, 'utf8');
    if (opts.json) {
      data = JSON.parse(data);
    }
    return data;
  }
  
  function objFromDir(dir, lvl) {
    var obj = {};
    fs.readdirSync(p.join(ddoc_dir,dir)).forEach(function (file) {
        var rel_path = p.join(dir,file),
            abs_path = p.join(ddoc_dir,rel_path),
            type = fs.statSync(abs_path);
        if (file[0] === '.' || opts.ignore(rel_path)) return;
        else if (lvl === 0 && type.isDirectory() && file === '_attachments') {
         obj._attachments = {};
         addAttsFromDir(obj._attachments, rel_path, '');
        }
        else if (type.isDirectory()) {
          obj[file] = objFromDir(rel_path, lvl+1);
        }
        else if (type.isFile()) {
          var ext = p.extname(file),
              key = p.basename(file,ext);
          obj[key] = loadData(abs_path, {json:(ext === '.json')})
        } else {
            console.warn("Skipping ", rel_path);
        }
    });
    return obj;
  }
  function addAttsFromDir(atts, dir, pre) {
    fs.readdirSync(p.join(ddoc_dir,dir)).forEach(function (file) {
      var key = p.join(pre,file),
          rel_path = p.join(dir,file),
          abs_path = p.join(ddoc_dir,rel_path),
          type = fs.statSync(abs_path);
      if (file[0] === '.' || opts.ignore(rel_path)) return;
      else if (type.isDirectory()) addAttsFromDir(atts, rel_path, key);
      else atts[key] = {
        content_type: mime.lookup(file),
        data: fs.readFileSync(abs_path).toString('base64')
      };
    });
  }
  
  return objFromDir('', 0);
}
