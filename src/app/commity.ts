// Import Node.js Dependencies
import { EOL } from "node:os";

// Import Third-party Dependencies
import { Iclargs } from "@clinjs/clargs";
import { indexAll, commit, changesCount, push, stagedCount, currentBranch } from "@pierred/node-git";
import kleur from "kleur";
import ansi from "ansi-styles";
import pupa from "pupa";

// Import Internal Dependencies
import { Conf } from "./app.js";
import { promptCommitChunks } from "./helpers/core/fields.js";

// CONSTANTS
const kTick = `${ansi.green.open}✔${ansi.green.close}`;

export class Commity {
  #clargs: Iclargs;
  #conf: Conf;
  #finalMsg = "";
  #stagedCount = 0;
  #changesCount = 0;

  constructor(clargs: Iclargs, conf: Conf) {
    this.#clargs = clargs;
    this.#conf = conf;
  }

  async run(): Promise<void> {
    this.#stagedCount = await stagedCount();
    await this.#checkChangesCount();
    await this.#handleAddAllOption();

    if (this.#stagedCount === 0 && !this.#clargs.hasOption("addAll", "a")) {
      throw new Error("Are you sure there are staged changes to commit ?");
    }

    const { chunks, render, bodyRender = [] } = this.#conf;
    const branchName = (await currentBranch()).replace("\n", "");
    const values: Record<string, string> = {};

    for await (const value of promptCommitChunks(chunks)) {
      Object.assign(values, value);
    }
    Object.assign(values, { branchName });
    Object.assign(chunks, { branchName });

    let commitMsg = pupa(render, values, {
      transform: ({ value, key }): string => {
        const chunk = chunks[key];

        const prefix = chunk.decorations?.prefix ?? "";

        return prefix + value;
      },
      ignoreMissing: true
    });

    for (const body of bodyRender) {
      if (body.if && !values[body.if]) {
        continue;
      }

      commitMsg += EOL + EOL;
      commitMsg += pupa(body.value, values, { ignoreMissing: true });
    }

    await this.#commit(commitMsg);
    await this.#handlePushOption();

    const infoMsg = `${kTick} Commited ${this.#stagedCount} files.`;
    this.#finalMsg += `${kleur.green(infoMsg)} ${kleur.blue().bold(commitMsg)}`;

    console.log(this.#finalMsg);
  }

  async #checkChangesCount(): Promise<void> {
    this.#changesCount = await changesCount();

    if (this.#changesCount < 1) {
      throw new Error("No changes detected, cannot commit");
    }
  }

  async #handleAddAllOption(): Promise<void> {
    if (
      this.#clargs.hasOption("addAll", "a") &&
      this.#changesCount - this.#stagedCount > 0
    ) {
      await indexAll({ omitNewFiles: false });
      const addedCount = this.#changesCount - this.#stagedCount;
      console.log(kleur.green(`${kTick} Added ${addedCount} files to staged changes`));
      this.#stagedCount += this.#changesCount - this.#stagedCount;
    }
  }

  async #commit(msg: string): Promise<void> {
    await commit(msg, {
      skipHooks: this.#clargs.hasOption("no-verify", "n")
    });
  }

  async #handlePushOption(): Promise<void> {
    if (this.#clargs.hasOption("push", "p")) {
      await push();
      this.#finalMsg += `${kTick}${kleur.bold("Pushed commited changes")}`;
    }
  }
}
