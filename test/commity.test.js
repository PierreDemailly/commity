import { test } from "node:test";
import assert from "node:assert";

import esmock from "esmock";

const logs = [];

global.console = { log: (value) => {
  if (value.includes("#")) {
    // A very weird bug workaround: node --test replaces " #" by " \#" and everything crash
    logs.push(value.replace("#", "$"));

    return;
  }
  logs.push(value);
}
};

test("should generate prompt responses for each chunk", async() => {
  const { App } = await esmock("../dist/app/app.js", {}, {
    "@topcli/prompts": {
      prompt: async() => "foo",
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
  assert.deepEqual(logs, ["✔ Commited 2 files. bar $foo: foo"]);
});
