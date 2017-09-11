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

(For an alternate explanation, see [The CouchApp Filesystem Mapping](http://couchapp.readthedocs.io/en/latest/design/filesystem-mapping.html) documentation although note that there are currently some differences, e.g. the root folder name is not used and the `_docs` subfolder is not yet supported.)

A file `.putdocignore` can be used to ignore files and folders much similar to `.gitignore`.

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


## See also

* [couchapp](https://github.com/couchapp/couchapp) (in Python) might be the original tool that supported this format and offers an easy `pip install couchapp`.

* [Erica](https://github.com/benoitc/erica) is an Erlang port that seems similar to the original couchapp tool

* [Kanso](https://kanso.app.medicmobile.org/) is also in node.js and has a `traditional-couchapp` plugin to support the same folder structure albeit still requiring a `kanso.json` configuration file.

* [node.couchapp.js](https://github.com/mikeal/node.couchapp.js/) — this uses a different app format, iirc this was a precursor to the "normal Kanso"–style apps rather than the "Traditional CouchApp" style.

* I also have a utility that lets you `require()` a traditional-style design document into your node app, called [ddoc](https://github.com/natevw/ddoc). This can help you migrate design document code (like validators or views) out of the database and into middleware should you need that.


## ISC License

Copyright © 2017 Nathan Vander Wilt

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
