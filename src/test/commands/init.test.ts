/* eslint-disable max-nested-callbacks */
import { PathLike } from "node:fs";

import clargs, { Iclargs } from "@clinjs/clargs";
import inquirer from "inquirer";
import tricolors from "tricolors";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { InitCommandHandler } from "../../app/commands/init.js";

const kDefaultConfigPath = new URL("../../commity.json", import.meta.url);

let currentTestIndex = 0;

vi.mock("node:fs/promises", () => {
  function open(path: PathLike, flag: string) {
    if (path === kDefaultConfigPath) {
      return Promise.resolve({
        readFile: () => true,
        close: () => true
      });
    }

    if (flag === "r" && currentTestIndex < 3) {
      currentTestIndex++;
      // eslint-disable-next-line prefer-promise-reject-errors, no-throw-literal
      throw { code: "ENOENT" };
    }

    return Promise.resolve({
      write: () => Promise.resolve(true),
      close: () => Promise.resolve(true),
      readFile: () => Promise.resolve(true)
    });
  }

  return { open };
});


describe("get a list of todo items", () => {
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
    it("should generate new config file", async() => {
      vi.spyOn(tricolors, "greenLog").mockResolvedValue();

      await initCommandHandler.run();

      expect(tricolors.greenLog).toHaveBeenCalledWith(`Created ${process.cwd()}/commity.json`);
    });

    it("should reset new config file", async() => {
      vi.spyOn(inquirer, "prompt").mockResolvedValue({ confirm: true });
      vi.spyOn(tricolors, "greenLog").mockResolvedValue();

      await initCommandHandler.run();

      expect(tricolors.greenLog).toHaveBeenCalledWith(`Updated ${process.cwd()}/commity.json`);
    });

    it("should not reset new config file", async() => {
      vi.spyOn(inquirer, "prompt").mockResolvedValue({ confirm: false });
      vi.spyOn(tricolors, "greenLog").mockResolvedValue();

      await initCommandHandler.run();

      expect(tricolors.greenLog).not.toHaveBeenCalled();
    });

    it("should not prompt for overwrite with --overwrite option", async() => {
      vi.spyOn(inquirer, "prompt");
      vi.spyOn(tricolors, "greenLog").mockResolvedValue();

      process.argv = ["", "", "--overwrite"];
      clargs.parse();

      await initCommandHandler.run();

      expect(tricolors.greenLog).toHaveBeenCalledWith(`Updated ${process.cwd()}/commity.json`);
      expect(inquirer.prompt).not.toHaveBeenCalled();
    });

    it("should not prompt for overwrite with --overwrite option (alias -o)", async() => {
      vi.spyOn(inquirer, "prompt");
      vi.spyOn(tricolors, "greenLog").mockResolvedValue();

      process.argv = ["", "", "-o"];
      clargs.parse();

      await initCommandHandler.run();

      expect(tricolors.greenLog).toHaveBeenCalledWith(`Updated ${process.cwd()}/commity.json`);
      expect(inquirer.prompt).not.toHaveBeenCalled();
    });
  });
});
