import { join } from "node:path";
import { open } from "node:fs/promises";

import clargs, { Iclargs, SetupOptions } from "@clinjs/clargs";
import kleur from "kleur";

import { InitCommandHandler } from "./commands/init.js";
import { Commity } from "./commity.js";

export interface Chunks {
  [key: string]: {
    type?: "select" | "text",
    message: string,
    choices?: {
      value: string;
      description: string;
    }[],
    required?: boolean,
    decorations?: {
      prefix?: string;
    }
  };
}

export interface Conf extends SetupOptions {
	render: string;
	chunks: Chunks;
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
        console.log(kleur.red(error.message));

        return;
      }

      throw error;
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
      if ("code" in error && error?.code === "ENOENT") {
        console.log(
          `${kleur.red("Commity is not initialized")} Please run "npx commity init".`
        );
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
      console.log(kleur.red("Current directory is not a Git repository."));
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
        },
        {
          name: "--no-verify",
          alias: "-n",
          description: "skip GIT hooks"
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
