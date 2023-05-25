// Import Node.js Dependencies
import assert from "node:assert";
import { test } from "node:test";

// Import Third-party Dependencies
import esmock from "esmock";

async function arrayFromAsyncGenerator(gen) {
  const arr = [];

  for await (const value of gen) {
    arr.push(value);
  }

  return arr;
}

test("should generate prompt responses for each chunk", async() => {
  const { promptCommitChunks } = await esmock("../dist/app/helpers/core/fields.js", {
    "@topcli/prompts": {
      prompt: async() => "foo",
      select: async() => "bar"
    }
  });
  const chunks = {
    chunk1: { type: "text", message: "Enter text" },
    chunk2: {
      type: "select",
      message: "Select an option",
      choices: [
        { value: "1", description: "1" },
        { value: "2", description: "2" }
      ]
    }
  };

  const generator = promptCommitChunks(chunks);
  const result = await arrayFromAsyncGenerator(generator);

  assert.deepEqual(result, [{ chunk1: "foo" }, { chunk2: "bar" }]);
});

test("should skip inherited properties", async() => {
  const { promptCommitChunks } = await esmock("../dist/app/helpers/core/fields.js", {
    "@topcli/prompts": {
      prompt: async() => "foo",
      select: async() => "bar"
    }
  });
  const chunks = {
    chunk1: { type: "text", message: "Enter text" },
    chunk2: {
      type: "select",
      message: "Select an option",
      choices: [
        { value: "1", description: "1" },
        { value: "2", description: "2" }
      ]
    }
  };

  const inheritedChunk = { inheritedChunk: "inherited value" };
  const objWithInheritedProp = Object.create(inheritedChunk);
  Object.assign(objWithInheritedProp, chunks);

  const generator = promptCommitChunks(objWithInheritedProp);
  const result = await arrayFromAsyncGenerator(generator);

  assert.deepEqual(result, [{ chunk1: "foo" }, { chunk2: "bar" }]);
});
