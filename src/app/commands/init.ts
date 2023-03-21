import { open } from "node:fs/promises";

import { Iclargs } from "@clinjs/clargs";
import prompts from "prompts";
import kleur from "kleur";
import { Conf } from "../app.js";

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
    const configFileExists = await this.#configFileExists();
    if (configFileExists) {
      await this.#resetConfigFile();

      return;
    }

    await this.#generateConfigFile();
  }

  async #getDefaultConfig() {
    try {
      const fh = await open(kDefaultConfigPath, "r");
      const content = await fh.readFile("utf-8");
      this.#defaultConfig = JSON.parse(content);
      await fh.close();
    }
    catch (error: any) {
      if (error?.code === "EPERM") {
        throw error;
      }
    }
  }

  async #generateConfigFile() {
    try {
      const fh = await open(kConfigFilepath, "wx");
      await fh.write(JSON.stringify(this.#defaultConfig, null, 2));
      await fh.close();
    }
    catch (e) {
      console.log(kleur.red(`Could not create ${process.cwd()}/commity.json`));

      return;
    }

    console.log(kleur.green(`Created ${process.cwd()}/commity.json`));
  }

  async #resetConfigFile() {
    if (!this.#clargs.hasOption("overwrite", "o")) {
      const { confirm } = await prompts({
        name: "confirm",
        type: "confirm",
        message: "A config file already exists in the cwd, reset?",
        initial: false
      });

      if (!confirm) {
        return;
      }
    }

    try {
      const fh = await open(kConfigFilepath, "r+");
      await fh.write(JSON.stringify(this.#defaultConfig, null, 2));
      await fh.close();
    }
    catch (e) {
      console.log(kleur.red(`Could not update ${process.cwd()}/commity.json`));

      return;
    }

    console.log(kleur.red(`Updated ${process.cwd()}/commity.json`));
  }

  async #configFileExists(): Promise<boolean> {
    try {
      const fh = await open(kConfigFilepath, "r");
      await fh.close();
    }
    catch (error: any) {
      if (error?.code === "ENOENT") {
        return false;
      }

      throw error;
    }

    return true;
  }
}
