// Import Node.js Dependencies
import { existsSync, readFileSync, writeFileSync } from "node:fs";

// Import Third-party Dependencies
import { Iclargs } from "@clinjs/clargs";
import { confirm } from "@topcli/prompts";
import kleur from "kleur";

// Import Internal Dependencies
import { Conf } from "../app.js";

// CONSTANTS
const kConfigFilepath = `${process.cwd()}/commity.json`;
const kDefaultConfigPath = new URL("../../commity.json", import.meta.url);

export class InitCommandHandler {
  #clargs: Iclargs;
  #defaultConfig!: Conf;

  constructor(clargs: Iclargs) {
    this.#clargs = clargs;
    this.#getDefaultConfig();
  }

  async run(): Promise<void> {
    const configFileExists = existsSync(kConfigFilepath);
    if (configFileExists) {
      await this.#resetConfigFile();

      return;
    }

    this.#generateConfigFile();
  }

  #getDefaultConfig() {
    const content = readFileSync(kDefaultConfigPath, "utf-8");

    this.#defaultConfig = JSON.parse(content);
  }

  #generateConfigFile() {
    try {
      writeFileSync(kConfigFilepath, JSON.stringify(this.#defaultConfig, null, 2), { });
    }
    catch {
      console.log(kleur.red(`Could not create ${process.cwd()}/commity.json`));

      return;
    }

    console.log(kleur.green(`Created ${process.cwd()}/commity.json`));
  }

  async #resetConfigFile() {
    if (!this.#clargs.hasOption("overwrite", "o")) {
      const overwrite = await confirm("A config file already exists in the cwd, reset?", {
        initial: false
      });

      if (!overwrite) {
        return;
      }
    }

    try {
      writeFileSync(kConfigFilepath, JSON.stringify(this.#defaultConfig, null, 2), { });
    }
    catch {
      console.log(kleur.red(`Could not update ${process.cwd()}/commity.json`));

      return;
    }

    console.log(kleur.red(`Updated ${process.cwd()}/commity.json`));
  }
}
