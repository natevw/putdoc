# putdoc

PUT a folder as JSON, in CouchDB "traditional couchapp" style, via simple node.js tool.

## Usage

Install putdoc, and then use it to push a JSON "document folder" to a CouchDB database:

```
npm install --global putdoc
putdoc /path/to/ddoc-folder http://localhost:5984/some-db
```

Or within a node.js project:

```
npm install --save-dev putdoc
# simple shell example, more likely you would use `putdoc` from a package.json script…
export PATH=$PATH:./node_modules/.bin
putdoc . http://localhost:5984/some-db
```

## "Document folder" structure

A design document folder is turned into an object using each file or subfolder's name as a key (dropping any extension).

The UTF-8 content of most files are used as a (string) value, and subfolders become nested objects.

Files with the `.json` extension are parsed to support other datatypes like arrays/numbers/boolean.

If there is an "_attachments" subfolder, the binary files are uploaded verbatim under their original subpaths. The content type will be guessed based on each file's extension.

If there is a "_docs" subfolder, it may contain a mix of either `.json` files and/or nested "document folder" structures. These will be uploaded alongside the main document. This is useful for seeding app data, but be careful since any changes that have made in the database will be overwritten.

(For an alternate explanation of this overall structure, see [The CouchApp Filesystem Mapping](http://couchapp.readthedocs.io/en/latest/design/filesystem-mapping.html) documentation. This implementation may differ slightly, but the general approach is the same.)

### Bonus feature: merging multiple entries into an object

Within any object (e.g. document or subfolder), `putdoc` will recognize a special key named `_data`. The value of this field must be an object, and the entries of this object will be merged into its *parent*.

This is **not** part of the original CouchApp's filesystem mapping and may not be supported by any other utility; use advisedly if compatibility is a concern. Without this feature, you must choose between representing an object as:

1. a folder with *all* its entries as individual files
2. via a `.json` file within a parent object

This feature adds additional flexibility for organizing documents/sub-objects:

1. folder with individual entry files
2. single `.json` file within a parent
3. folder with entries in individual files *and/or* a `_data.json` file

This is especially useful at the top level document where you may want a folder structure for `_attachments` but also have lots of little fields that don't need their own files.

One last thing: if you really have need, `putdoc` actually supports merging *multiple* objects where the first \[dot-separated] part of the filename \[i.e. key] is `_data`. That is, entries from `_data.X.json`, `_data.generated.json`, `_data.json`, and even `_data.group1/` will all get merged into their parent object. The precendence of keys defined in multiple places is currently unspecified and subject to random chance/future change.


## Examples

So a design document might have a folder like:

```
my_app_repo/
  _id         ('_design/glob')
  language    ('javascript')
  views/
    by_date/
      map.js
      reduce.js
    by_path/
      map.js
  rewrites.json
  lists/
    posts.js
  lib/
    atom.js
    date.js
    glob.js
    …
  templates/
    theme.html
  _attachments/
    logo.png
    nerdishness.html
```

You could then update the "_design/glob" document in a local "dev_db" by using the following command:

    putdoc . http://some_admin:their_password@localhost:5984/dev_db

You can use putdoc for regular documents too, if you have need:

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

This would probably be more useful with a document that had attachments, although note that putdoc does not handle large attachments well.

You can even use putdoc on a **folder** of regular and/or design documents, using the `--docs` CLI flag:

```
sample_data
  doc1.json
  doc2.json
  doc3
    info      ("this document has some attachments")
    _attachments
      file1.txt
      file2.txt
```

Running `putdoc --docs ./sample_data http://localhost:5984/my_data` will upload three documents (doc1/doc2/doc3) to the my_data database, with no "parent" document corresponding to the sample_data folder itself.


## See also

* [couchapp](https://github.com/couchapp/couchapp) (in Python) might be the original tool that supported this format and offers an easy `pip install couchapp`.

* [Erica](https://github.com/benoitc/erica) is an Erlang port that seems similar to the original couchapp tool

* [Kanso](https://kanso.app.medicmobile.org/) is also in node.js and has a `traditional-couchapp` plugin to support the same folder structure albeit still requiring a `kanso.json` configuration file.

* [node.couchapp.js](https://github.com/mikeal/node.couchapp.js/) — this uses a different app format, iirc this was a precursor to the "normal Kanso"–style apps rather than the "Traditional CouchApp" style.

* I also have a utility that lets you `require()` a traditional-style design document into your node app, called [ddoc](https://github.com/natevw/ddoc). This can help you migrate design document code (like validators or views) out of the database and into middleware should you need that.

* [couchdb-push](https://github.com/jo/couchdb-push) is a similar tool to deploy CouchDB documents from directory, JSON or CommonJS module. 


## ISC License

Copyright © 2017 Nathan Vander Wilt

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
