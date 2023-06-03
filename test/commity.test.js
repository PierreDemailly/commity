// Import Node.js Dependencies
import { test } from "node:test";
import assert from "node:assert";
import { EOL } from "node:os";

// Import Third-party Dependencies
import esmock from "esmock";

const logs = [];

global.console = {
  log: (...value) => {
    logs.push(value[0].split(EOL));
  }
};

test("should generate prompt responses for each chunk", async() => {
  const inputs = ["foo", "1"];
  const { App } = await esmock("../dist/app/app.js", {}, {
    "@topcli/prompts": {
      prompt: async() => inputs.shift(),
      select: async() => "bar",
      confirm: async() => true
    },
    "@pierred/node-git": {
      indexAll: async() => 1,
      commit: async() => 1,
      changesCount: async() => 3,
      push: async() => 1,
      stagedCount: async() => 2
    },
    kleur: {
      red: (str) => str,
      blue: () => {
        return { bold: (str) => str };
      },
      bold: (str) => str,
      green: (str) => str
    },
    "ansi-styles": {
      default: {
        green: {
          open: "",
          close: ""
        }
      }
    }
  });
  const app = new App();
  await app.initialize();

  assert.deepEqual(logs.flat(), ["✔ Commited 2 files. bar: foo", "", "Fixes #1"]);
});
