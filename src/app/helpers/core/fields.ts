import inquirer from "inquirer";

export async function* promptCommitChunks(chunks: any): AsyncGenerator<Record<string, string>, void, unknown> {
  for (const chunk in chunks) {
    const fieldname = Object.keys(chunks[chunk]).join();
    const fieldObject = chunks[chunk][fieldname];

    yield await inquirer.prompt({
      name: fieldname,
      type: fieldObject.type === "select" ? "list" : "input",
      message: fieldObject.label,
      choices: fieldObject.selectOptions || null
    });
  }
}
