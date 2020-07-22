import jsonbinApi from "./source"
import test from "ava"

test("main", t => {
	t.is(jsonbinApi("unicorns"), "unicorns & rainbows")
})
