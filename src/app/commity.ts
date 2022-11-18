import { Iclargs } from "@clinjs/clargs";
import { indexAll, stagedCount } from "@pierred/node-git";
import nezbold from "nezbold";
import tricolors from "tricolors";

import { Conf } from "./app.js";
import { promptCommitChunks } from "./helpers/core/fields.js";

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
    this.#checkStagedCount();

    const { chunks, render } = this.#conf;
    const values: Record<string, string> = {};

    for await (const value of promptCommitChunks(chunks)) {
      Object.assign(values, value);
    }

    const hasOwn = Object.prototype.hasOwnProperty;
    const commitMsg = render.replace(
      /{{\s*([^}]+)\s*}}/g,
      (whole: any, key: string) => (hasOwn.call(values, key) ? (() => {
        const chunk = chunks.find((chunk) => chunk[key])[key];
        const chunkValue = values[key];
        if (!chunkValue && chunk.required === false) {
          return "";
        }

        const prefix = chunk.decorations?.prefix ?? "";

        return prefix + chunkValue;
      })() : whole)
    );

    await this.#commit(commitMsg);
    await this.#handlePushOption();

    this.#finalMsg += `${tricolors.green(`Commited ${this.#stagedCount} files.`)} ${nezbold.bold(commitMsg)}`;

    console.log(this.#finalMsg);
    process.exit();
  }

  async #checkChangesCount(): Promise<void> {
    const { changesCount } = await import("@pierred/node-git");
    this.#changesCount = await changesCount();

    if (this.#changesCount < 1) {
      throw new Error("No changes detected, cannot commit");
    }
  }

  async #handleAddAllOption(): Promise<void> {
    this.#stagedCount = await stagedCount();
    if (this.#clargs.hasOption("addAll", "a") && (this.#changesCount - this.#stagedCount) > 0) {
      await indexAll({ omitNewFiles: false });
      tricolors.greenLog("Added " + (this.#changesCount - this.#stagedCount) + " files to staged changes \r\n");
      this.#stagedCount += this.#changesCount - this.#stagedCount;
    }
  }

  #checkStagedCount(): void {
    if (this.#stagedCount === 0 && !this.#clargs.hasOption("addAll", "a")) {
      throw new Error("Are you sure there are staged changes to commit ?");
    }
  }

  async #commit(msg: string): Promise<void> {
    const { commit } = await import("@pierred/node-git");
    await commit(msg);
  }

  async #handlePushOption(): Promise<void> {
    if (this.#clargs.hasOption("push", "p")) {
      const { push } = await import("@pierred/node-git");
      await push();
      this.#finalMsg += "\r\n" + nezbold.bold("Pushed commited changes");
    }
  }
}
