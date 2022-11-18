/* eslint-disable max-nested-callbacks */
import { PathLike } from "node:fs";

import clargs, { Iclargs } from "@clinjs/clargs";
import inquirer from "inquirer";
import tricolors from "tricolors";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InitCommandHandler } from "../../app/commands/init.js";

const kDefaultConfigPath = new URL("../../commity.json", import.meta.url);

let openCalledTime = 0;

vi.mock("node:fs/promises", () => {
  function open(path: PathLike, flag: string) {
    if (path === kDefaultConfigPath) {
      return Promise.resolve({
        readFile: () => true,
        close: () => true
      });
    }

    if (flag === "r" && openCalledTime < 3) {
      openCalledTime++;
      const err: NodeJS.ErrnoException = new Error();
      err.code = "ENOENT";
      // throw to simulate there is no existing config file.
      throw err;
    }

    return Promise.resolve({
      // cannot write, all tests will fails.
      write: () => Promise.reject(new Error()),
      readFile: () => true,
      close: () => Promise.resolve()
    });
  }

  return { open };
});


describe("InitCommandHandler failures", () => {
  clargs.setup({
    usage: "commity <command> <options>",
    options: [],
    commands: []
  });
  clargs.parse();

  let initCommandHandler: InitCommandHandler;

  beforeEach(() => {
    initCommandHandler = new InitCommandHandler(clargs as Iclargs);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should be truthy", () => {
    expect(initCommandHandler).toBeTruthy();
  });

  describe("run", () => {
    it("should not create new config file", async() => {
      vi.spyOn(tricolors, "redLog").mockResolvedValue();

      await initCommandHandler.run();

      expect(tricolors.redLog).toHaveBeenCalledWith(`Could not create ${process.cwd()}/commity.json`);
    });

    it("should not reset config file", async() => {
      vi.spyOn(tricolors, "redLog").mockResolvedValue();
      vi.spyOn(inquirer, "prompt").mockResolvedValue({ confirm: true });
      await initCommandHandler.run();

      expect(tricolors.redLog).toHaveBeenCalledWith(`Could not update ${process.cwd()}/commity.json`);
    });
  });
});
