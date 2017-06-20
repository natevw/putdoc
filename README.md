# updoc (work in progress)

PUT a folder as JSON, in CouchDB "traditional couchapp" style, simple node.js tool.

## Usage

Install updoc, and then use it to post a JSON "document folder" to a CouchDB database, or any HTTP server really…:

```
npm install --global updoc
updoc /path/to/ddoc-folder http://localhost:5984/some-db
```

Or within a node.js project:

```
npm install --save-dev updoc
# simple shell example, more likely you would use `updoc` from a package.json script…
export PATH=$PATH:./node_modules/.bin
updoc . http://localhost:5984/some-db
```

## "Document folder" structure

A design document folder is turned into an object using each file or subfolder's name as a key (dropping any extension).

The UTF-8 content of most files are used as a (string) value, and subfolders become nested objects.

Files with the `.json` extension are parsed to support other datatypes like arrays/numbers/boolean.

If there is an "_attachments" subfolder, the binary files are uploaded verbatim under their original subpaths. The content type will be guessed based on each file's extension.

(For an alternate explanation, see [The CouchApp Filesystem Mapping](http://couchapp.readthedocs.io/en/latest/design/filesystem-mapping.html) documentation although note that there are currently some differences, e.g. the root folder name is not used and the `_docs` subfolder is not yet supported.)

## Examples

So a design document might have a folder like:

```
my_ddoc/
  language
  views/
      someindex.js
```

TODO: finish this example, including push to database


You can use updoc for regular documents too, if you have need:

```
freedom_day
  _id         ('event-863798f3-c427-4519-951f-752682aee66a')
  name        ('Juneteenth')
  timestamp   ('1865-06-19T09:00:00-05:00')
  alt_names.json ('["Juneteenth Independence Day", "Freedom Day"]')
```

Simply becomes:

```
{
  "_id": "event-863798f3-c427-4519-951f-752682aee66a",
  "name": "First Juneteenth",
  "timestamp": "1865-06-19T09:00:00-05:00",
  "alt_names": ["Juneteenth Independence Day", "Freedom Day"]
}
```

This would probably be more useful with a document that had attachments, although note that updoc does not handle large attachments well.


## See also

* [couchapp](https://github.com/couchapp/couchapp) (in Python) might be the original tool that supported this format and offers an easy `pip install couchapp`.

* [Erica](https://github.com/benoitc/erica) is an Erlang port that seems similar to the original couchapp tool

* [Kanso](https://kanso.app.medicmobile.org/) is also in node.js and has a `traditional-couchapp` plugin to support the same folder structure albeit still requiring a `kanso.json` configuration file.

* [node.couchapp.js](https://github.com/mikeal/node.couchapp.js/) — this uses a different app format, iirc this was a precursor to the "normal Kanso"–style apps rather than the "Traditional CouchApp" style.

* I also have a utility that lets you `require()` a traditional-style design document into your node app, called [ddoc](https://github.com/natevw/ddoc). This can help you migrate design document code (like validators or views) out of the database and into middleware should you need that.


## License

