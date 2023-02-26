import prompts from "prompts";
import ansi from "ansi-styles";
import { Chunks } from "../../app.js";

const kTick = `${ansi.green.open}✔${ansi.green.close}`;
const kPointer = `${ansi.gray.open}›${ansi.gray.close}`;

function clearLastLine() {
  process.stdout.moveCursor(0, -1);
  process.stdout.clearLine(0);
}

export async function* promptCommitChunks(chunks: Chunks): AsyncGenerator<Record<string, string>, void, unknown> {
  for (const chunk in chunks) {
    if (!Object.prototype.hasOwnProperty.call(chunks, chunk)) {
      continue;
    }

    const fieldObject = chunks[chunk];

    const { value } = await prompts({
      name: "value",
      type: fieldObject.type ?? "text",
      message: fieldObject.message,
      choices: fieldObject.choices?.map((choice) => {
        return { ...choice, title: choice.value };
      }),
      validate: () => {
        if (fieldObject.type !== "select") {
          clearLastLine();
        }

        return true;
      },
      format: (value) => {
        if (fieldObject.type === "select") {
          clearLastLine();
          clearLastLine();

          console.log(`${kTick} ${fieldObject.message} ${kPointer} ${value.name || value}`);
        }

        return value;
      }
    });

    yield { [chunk]: value };
  }
}
