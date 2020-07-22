# jsonbin-api [![Travis CI Build Status](https://img.shields.io/travis/com/Richienb/jsonbin-api/master.svg?style=for-the-badge)](https://travis-ci.com/Richienb/jsonbin-api)

Simple data storage with jsonbin.

[![NPM Badge](https://nodei.co/npm/jsonbin-api.png)](https://npmjs.com/package/jsonbin-api)

## Install

```sh
npm install jsonbin-api
```

## Usage

```js
const jsonbin = require("jsonbin");
const store = jsonbin("myapp", "token e5334b72-244c-46d3-9e4f-27f1a5776816");

(async () => {
	await store.set("foo.bar", "baz");

	await store.get("foo.bar");
	//=> "baz"
})();
```

## API

### theModule(input, options?)

#### input

Type: `string`

Lorem ipsum.

#### options

Type: `object`

##### postfix

Type: `string`\
Default: `rainbows`

Lorem ipsum.
