"use strict"

import ky from "ky-universal"
import splitDots from "split-string"
import dotProp from "dot-prop"
import { JsonValue } from "type-fest" // eslint-disable-line import/no-unresolved

class JsonBin {
	constructor(private readonly _options: { name: string, auth: string }) { }

	/**
	Get the value of a key.
	@param key The key to get the value of. Dot props are allowed.
	*/
	public async get(key: string): Promise<JsonValue> {
		try {
			const result = await ky(this._getPathParts(key).join("/"), {
				prefixUrl: "https://jsonbin.org/me",
				headers: {
					Authorization: this._options.auth
				}
			})
			const data = await result.text()
			try {
				return JSON.parse(data) as JsonValue
			} catch (_) {
				return data
			}
		} catch (error) {
			if ((error as ky.HTTPError)?.response?.status === 404) {
				return undefined
			}

			throw error
		}
	}

	/**
	Check if a key is defined.
	@param key The key to check. Dot props are allowed.
	*/
	public async has(key: string): Promise<boolean> {
		return await this.get(key) !== undefined
	}

	/**
	Add an item to an array or create a new array, adding the item to it.
	@param key The key pointing to the array. Dot props are allowed.
	@param value The value to add.
	*/
	public async add(key: string, value: JsonValue): Promise<void> {
		try {
			await ky.patch(this._getPathParts(key).join("/"), {
				json: value,
				prefixUrl: "https://jsonbin.org/me",
				headers: {
					Authorization: this._options.auth
				}
			})
		} catch (error) {
			if ((error as ky.HTTPError)?.response?.status === 404) {
				await this.set(key, [])
				return this.add(key, value) // eslint-disable-line @typescript-eslint/return-await
			}

			throw error
		}
	}

	/**
	Set the value of a key.
	@param key The key to set. Dot props are allowed.
	@param value The value to set.
	*/
	public async set(key: string, value: JsonValue): Promise<void> {
		await ky.patch("", {
			json: dotProp.set({}, this._getPathParts(key).join("."), value),
			prefixUrl: "https://jsonbin.org/me",
			headers: {
				Authorization: this._options.auth
			}
		})
	}

	/**
	Delete a key.
	@param key The key to delete. Dot props are allowed.
	*/
	public async delete(key: string): Promise<void> {
		try {
			await ky.delete(this._getPathParts(key).join("/"), {
				prefixUrl: "https://jsonbin.org/me",
				headers: {
					Authorization: this._options.auth
				}
			})
		} catch (error) {
			if ((error as ky.HTTPError)?.response?.status === 404) {
				return undefined
			}

			throw error
		}
	}

	/**
	Generate a bearer token for client use.
	*/
	public async generateBearer({ expiry, path }: {
		/**
		The expiry time in milliseconds.
		*/
		expiry?: number

		/**
		The path to restrict access to.
		*/
		path?: string
	} = {}): Promise<string> {
		const { token } = await ky("https://jsonbin.org/_/bearer", {
			searchParams: {
				exp: expiry,
				path: this._getPathParts(path).join(".")
			},
			headers: {
				Authorization: this._options.auth
			}
		}).json()

		return token as string
	}

	/**
	Get the username that owns the authentication token.
	*/
	public async getUsername(): Promise<string> {
		return ky("https://jsonbin.org/_/me/username", {
			headers: {
				Authorization: this._options.auth
			}
		}).json()
	}

	/**
	Get or set whether a key can be publicly accessed without an authentication token.
	@param key The key to check access permissions for. Dot props are allowed.
	@param accessType The permission to set.
	*/
	public async access(key: string, accessType?: "public" | "private"): Promise<"public" | "private"> {
		if (accessType) {
			await ky(`${this._getPathParts(key).join("/")}/_perms`, {
				method: accessType === "public" ? "put" : "delete",
				prefixUrl: "https://jsonbin.org/me",
				headers: {
					Authorization: this._options.auth
				}
			}).json()
			return accessType
		}

		const isPrivate = await ky(`${this._getPathParts(key).join("/")}/_perms`, {
			prefixUrl: "https://jsonbin.org/me",
			headers: {
				Authorization: this._options.auth
			}
		}).json()
		return isPrivate ? "private" : "public"
	}

	private _getPathParts(key: string): string[] {
		return [this._options.name, ...splitDots(key)]
			.map(part => encodeURIComponent(part))
			.filter(part => part !== "")
	}
}

/**
Simple data storage with jsonbin.
@param name The name of the store.
@param auth The authentication token to use. Can be `token ...` or `bearer ...`.
@example
```
const jsonbin = require("jsonbin");
const store = jsonbin("myapp", "token e5334b72-244c-46d3-9e4f-27f1a5776816");

(async () => {
	await store.set("foo.bar", "baz");

	await store.get("foo.bar");
	//=> "baz"
})();
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
