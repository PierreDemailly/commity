import { Chunks } from "../../app.js";
import { prompt, select } from "@topcli/prompts";

export async function* promptCommitChunks(chunks: Chunks): AsyncGenerator<Record<string, string>, void, unknown> {
  for (const chunk in chunks) {
    if (chunk === "branchName") {
      throw new Error("branchName cannot be used as chunk");
    }

    if (!Object.prototype.hasOwnProperty.call(chunks, chunk)) {
      continue;
    }

    const { type, message, choices } = chunks[chunk];

    if (type === "select") {
      yield {
        [chunk]: await select(message, {
          ignoreValues: [], choices: choices!.map((choice) => {
            return { label: choice.value, ...choice };
          })
        })
      };
    }
    else {
      yield { [chunk]: await prompt(message) };
    }
  }
}
