var fs = require('fs'),
    p = require('path'),
    mime = require('mime'),
    extend = require('xok');

module.exports = function (ddoc_dir, opts) {
  opts = extend({
    excludeDirs: ['packages', 'node_modules'],
    hideExtensions: ['.js', '.json'],
  }, opts)
  
  function objFromDir(dir, lvl) {
    var obj = {};
    fs.readdirSync(dir).forEach(function (file) {
        var path = p.join(dir,file),
            type = fs.statSync(path);
        if (file[0] === '.') return;
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
          if (opts.hideExtensions.indexOf(ext) !== -1) {
            obj[p.basename(file,ext)] = data
          } else {
            obj[file] = data
          }
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
      if (type.isDirectory()) addAttsFromDir(atts, path, key);
      else atts[key] = {
        content_type: mime.lookup(file),
        data: fs.readFileSync(path).toString('base64')
      };
    });
  }
  
  ddoc_dir = p.resolve(p.dirname(module.parent.filename), ddoc_dir);
  return objFromDir(ddoc_dir, 0);   
}
