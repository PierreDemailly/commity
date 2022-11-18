import { join } from "node:path";
import { open } from "node:fs/promises";

import clargs, { Iclargs, SetupOptions } from "@clinjs/clargs";
import tricolors from "tricolors";

import { InitCommandHandler } from "./commands/init.js";
import { Commity } from "./commity.js";

export interface Conf extends SetupOptions {
  render: string;
  chunks: any[];
}

const kConfigFilepath = `${process.cwd()}/commity.json`;

export class App {
  #conf: Conf | undefined;

  async initialize(): Promise<void> {
    await this.#isGitInitialized();
    this.#setupParser();

    if (clargs.commandUsed("init")) {
      const initCommandHandler = new InitCommandHandler(clargs as Iclargs);
      await initCommandHandler.run();

      return;
    }

    await this.#getUserConfig();

    const commity = new Commity(clargs as Iclargs, this.#conf as Conf);

    try {
      await commity.run();
    }
    catch (error) {
      if (error instanceof Error) {
        tricolors.redLog(error.message);

        return;
      }
    }
  }

  async #getUserConfig(): Promise<void> {
    try {
      const fh = await open(kConfigFilepath);
      const content = await fh.readFile("utf-8");
      this.#conf = JSON.parse(content);
      await fh.close();
    }
    catch (error: any) {
      if (error?.code === "ENOENT") {
        tricolors.redLog("Commity is not initialized. Please run \"commity init\" to init your workspace.");
        process.exit();
      }

      throw error;
    }
  }

  async #isGitInitialized(): Promise<void> {
    try {
      const path = join(process.cwd(), "/.git");
      const fh = await open(path);
      await fh.close();

      return;
    }
    catch (error) {
      tricolors.redLog("Current directory is not a Git repository.");
      process.exit();
    }
  }

  #setupParser(): void {
    clargs.setup({
      usage: "commity <command> <options>",
      options: [
        {
          name: "--push",
          alias: "-p",
          description: "push changes to current remote branch after commiting"
        },
        {
          name: "--addAll",
          alias: "-a",
          description: "add all staged changes before commiting"
        }
      ],
      commands: [
        {
          name: "init",
          description: "inititialize Commity",
          options: [
            {
              name: "--overwrite",
              alias: "-o",
              description: "overwrite existing commity.json (if exists)"
            }
          ]
        }
      ]
    });
    clargs.parse();
  }
}
