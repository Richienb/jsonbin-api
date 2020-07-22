"use strict"

import * as ky from "ky-universal"
import splitDots from "split-string"
import { assert } from "@sindresorhus/is"
import { JsonValue } from "type-fest"

const request = ky.create({
	prefixUrl: "https://jsonbin.org"
})

class JsonBin {
	constructor(private readonly _options: { name: string, auth: string }) {
		assert.string(_options.name)
		assert.string(_options.auth)
	}

	private _getUrlPath(key: string) {
		const result = [this._options.name, ...splitDots(key)]
			.map(part => encodeURIComponent(part))
			.filter(part => part !== "")
		return {
			urlKey: result.pop(),
			urlPath: result.join("/")
		}
	}

	async set(key: string, value: JsonValue) {
		const { urlKey, urlPath } = this._getUrlPath(key)
		await request.patch(urlPath, {
			json: {
				[urlKey]: value
			},
			headers: {
				"Authorisation": this._options.auth
			}
		})
	}
}

/**
My awesome module.
@param input Lorem ipsum.
@param postfix Lorem ipsum.
@example
```
const theModule = require("the-module");
theModule("unicorns");
//=> 'unicorns & rainbows'
```
*/
function jsonbinApi(name: string, auth: string) {
	return new JsonBin({
		name,
		auth
	})
}

export default jsonbinApi

module.exports = jsonbinApi
module.exports.default = jsonbinApi // eslint-disable-line @typescript-eslint/no-unsafe-member-access
