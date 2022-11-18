import { open } from "node:fs/promises";

import { Iclargs } from "@clinjs/clargs";
import inquirer from "inquirer";
import tricolors from "tricolors";

import commity from "../../commity.json" assert { type: 'json' };

const kConfigFilepath = `${process.cwd()}/commity.json`;

export class InitCommandHandler {
  #clargs: Iclargs

  constructor(clargs: Iclargs) {
    this.#clargs = clargs;
  }

  async run(): Promise<void> {
    const configFileExists = await this.#configFileExists();
    if (configFileExists) {
      await this.#resetConfigFile();

      return;
    }

    await this.#generateConfigFile();
  }

  async #generateConfigFile() {
    try {
      const fh = await open(kConfigFilepath, "wx");
      await fh.write(JSON.stringify(commity, null, 2));
      await fh.close();
    }
    catch (e) {
      console.log(e);
      tricolors.redLog(`Could not create ${process.cwd()}/commity.json`);

      return;
    }

    tricolors.greenLog(`Created ${process.cwd()}/commity.json`);

    return;
  }

  async #resetConfigFile() {
    if (!this.#clargs.hasOption("overwrite", "o")) {
      const prompt = await inquirer.prompt({
        name: "confirm",
        type: "confirm",
        message: "A config file already exists in the cwd, reset?"
      });

      if (!prompt.confirm) {
        return;
      }
    }

    try {
      const fh = await open(kConfigFilepath, "r+");
      await fh.write(JSON.stringify(commity, null, 2));
      await fh.close();
    }
    catch (e) {
      tricolors.redLog(`Could not update ${process.cwd()}/commity.json`);

      return;
    }

    tricolors.greenLog(`Updated ${process.cwd()}/commity.json`);

    return;
  }

  async #configFileExists(): Promise<boolean> {
    try {
      const fh = await open(kConfigFilepath, "r");
      await fh.close();
    }
    catch (error) {
      return false;
    }

    return true;
  }
}
