# updoc (work in progress)

PUT a folder as JSON, in CouchDB "traditional couchapp" style.

## See also

I also have a utility that lets you `require()` a design document into your node app, called [ddoc](https://github.com/natevw/ddoc).


## Usage

```
npm install --save-dev updoc
export PATH=$PATH:./node_modules/.bin
updoc . http://localhost:5984/some-db
```


## License

