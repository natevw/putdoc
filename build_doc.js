var fs = require('fs'),
    p = require('path'),
    mime = require('mime'),
    extend = require('xok');

module.exports = function (ddoc_dir, opts) {
  opts = extend({
    excludeDirs: ['packages', 'node_modules'],
  }, opts)
  
  function objFromDir(dir, lvl) {
    var obj = {};
    fs.readdirSync(p.join(ddoc_dir,dir)).forEach(function (file) {
        var rel_path = p.join(dir,file),
            abs_path = p.join(ddoc_dir,rel_path),
            type = fs.statSync(abs_path);
        if (file[0] === '.') return;
        else if (lvl === 0 && type.isDirectory() && file === '_attachments') {
         obj._attachments = {};
         addAttsFromDir(obj._attachments, rel_path, '');
        }
        else if (type.isDirectory() && opts.excludeDirs.indexOf(file) === -1) {
          obj[file] = objFromDir(rel_path, lvl+1);
        }
        else if (type.isFile()) {
          var ext = p.extname(file);
          var data = fs.readFileSync(abs_path, 'utf8');
          if (ext === '.json') {
            data = JSON.parse(data);
          }
          obj[p.basename(file,ext)] = data
        } else {
            console.warn("Skipping ", rel_path);
        }
    });
    return obj;
  }
  function addAttsFromDir(atts, dir, pre) {
    fs.readdirSync(p.join(ddoc_dir,dir)).forEach(function (file) {
      if (file[0] === '.') return;
      var key = p.join(pre,file),
          rel_path = p.join(dir,file),
          abs_path = p.join(ddoc_dir,rel_path),
          type = fs.statSync(abs_path);
      if (type.isDirectory()) addAttsFromDir(atts, rel_path, key);
      else atts[key] = {
        content_type: mime.lookup(file),
        data: fs.readFileSync(abs_path).toString('base64')
      };
    });
  }
  
  return objFromDir('', 0);
}
