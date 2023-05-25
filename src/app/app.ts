// Import Node.js Dependencies
import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";

// Import Third-party Dependencies
import clargs, { Iclargs, SetupOptions } from "@clinjs/clargs";
import kleur from "kleur";

// Import Internal Dependencies
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

// CONSTANTS
const kConfigFilepath = `${process.cwd()}/commity.json`;

export class App {
  #conf: Conf | undefined;

  async initialize(): Promise<void> {
    this.#isGitInitialized();
    this.#setupParser();

    if (clargs.commandUsed("init")) {
      const initCommandHandler = new InitCommandHandler(clargs as Iclargs);
      await initCommandHandler.run();

      return;
    }

    this.#getUserConfig();

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

  #getUserConfig(): void {
    try {
      const content = readFileSync(kConfigFilepath, "utf-8");
      this.#conf = JSON.parse(content);
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

  #isGitInitialized(): void {
    const isGitInitialized = existsSync(join(process.cwd(), "/.git"));

    if (!isGitInitialized) {
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
