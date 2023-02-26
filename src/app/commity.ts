import { Iclargs } from "@clinjs/clargs";
import { indexAll, commit, changesCount, push } from "@pierred/node-git";
import kleur from "kleur";
import ansi from "ansi-styles";

import { Conf } from "./app.js";
import { promptCommitChunks } from "./helpers/core/fields.js";

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
    await this.#checkChangesCount();
    await this.#handleAddAllOption();

    if (this.#stagedCount === 0 && !this.#clargs.hasOption("addAll", "a")) {
      throw new Error("Are you sure there are staged changes to commit ?");
    }

    const { chunks, render } = this.#conf;
    const values: Record<string, string> = {};
    for await (const value of promptCommitChunks(chunks)) {
      Object.assign(values, value);
    }

    const hasOwn = Object.prototype.hasOwnProperty;
    const commitMsg = render.replace(
      /{{\s*([^}]+)\s*}}/g,
      (whole: string, key: string) => (hasOwn.call(values, key)
        ? (() => {
          const chunk = chunks[key];
          const chunkValue = values[key];
          if (!chunkValue && chunk.required === false) {
            return "";
          }

          const prefix = chunk.decorations?.prefix ?? "";

          return prefix + chunkValue;
        })()
        : whole)
    );
    await this.#commit(commitMsg);
    await this.#handlePushOption();

    const infoMsg = `${kTick} Commited ${this.#stagedCount} files.`;
    this.#finalMsg += `${kleur.green(infoMsg)} ${kleur.blue().bold(commitMsg)}`;

    console.log(this.#finalMsg);
    process.exit();
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
    await commit(msg, { skipHooks: this.#clargs.hasOption("no-verify", "n") });
  }

  async #handlePushOption(): Promise<void> {
    if (this.#clargs.hasOption("push", "p")) {
      await push();
      this.#finalMsg += `${kTick}${kleur.bold("Pushed commited changes")}`;
    }
  }
}
