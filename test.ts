import jsonbin from "./source"
import test from "ava"

const token = process.env.JSONBIN_TOKEN

test("main", async t => {
	if (!token) {
		console.log("Set JSONBIN_TOKEN to test.")
		t.pass()
		return
	}

	const store = jsonbin("test_jsonbin_api", `token ${token}`)

	await store.set("foo.bar", "baz")

	t.is(await store.get("foo.bar"), "baz")

	await store.delete("foo.bar")

	t.false(await store.has("foo.bar"))
})
