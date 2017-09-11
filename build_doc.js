var fs = require('fs'),
    p = require('path'),
    mime = require('mime'),
    extend = require('xok'),
    ignore = require('ignore');

module.exports = function (ddoc_dir, opts) {
  opts = extend({
    excludeDirs: ['packages', 'node_modules'],
  }, opts)
  
  var ig = ignore().add(opts.ignore || '');
  
  function objFromDir(dir, lvl) {
    var obj = {};
    fs.readdirSync(dir).forEach(function (file) {
        var path = p.join(dir,file),
            type = fs.statSync(path);
        if (file[0] === '.' || ig.ignores(file)) {
          console.warn("Skipping ", path);
          return;
        }
        else if (lvl === 0 && type.isDirectory() && file === '_attachments') {
         obj._attachments = {};
         addAttsFromDir(obj._attachments, path, '');
        }
        else if (type.isDirectory() && opts.excludeDirs.indexOf(file) === -1) {
          obj[file] = objFromDir(path, lvl+1);
        }
        else if (type.isFile()) {
          var ext = p.extname(file);
          var data = fs.readFileSync(path, 'utf8');
          if (ext === '.json') {
            data = JSON.parse(data);
          }
          obj[p.basename(file,ext)] = data
        } else {
            console.warn("Skipping ", path);
        }
    });
    return obj;
  }
  function addAttsFromDir(atts, dir, pre) {
    fs.readdirSync(dir).forEach(function (file) {
      var key = p.join(pre,file),
          path = p.join(dir,file),
          type = fs.statSync(path);
      if (file[0] === '.' || ig.ignores(file)) {
        console.warn("Skipping ", path);
        return;
      }
      if (type.isDirectory()) addAttsFromDir(atts, path, key);
      else atts[key] = {
        content_type: mime.lookup(file),
        data: fs.readFileSync(path).toString('base64')
      };
    });
  }
  
  return objFromDir(ddoc_dir, 0);   
}
