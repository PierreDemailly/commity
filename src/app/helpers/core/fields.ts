import inquirer from 'inquirer';

interface FieldValue {
  [string: string]: string | object;
  [number: number]: string | object;
}

export interface Fields {
  fieldsNames: string[];
  values: FieldValue;
}

export const fields = (): Promise<Fields> => {
  return new Promise(async (resolve, reject) => {
    const conf = require(process.cwd() + '/commity.json');
    const inquirerPrompts = [];
    const fields = conf.fields;
    const fieldsNames = [];
    for (const field in fields) {
      const fieldName = Object.keys(fields[field]).join();
      fieldsNames.push(fieldName);

      const fieldObject = fields[field][fieldName];
      const prompt = () => {
        return inquirer.prompt({
          name: fieldName,
          type: fieldObject['type'] === 'select' ? 'list' : 'input',
          message: fieldObject['label'],
          choices: fieldObject['selectOptions'] || null,
        });
      };
      inquirerPrompts.push(prompt);
    }

    const results: Fields = {fieldsNames, values: {}};

    for (let i = 0; i < inquirerPrompts.length; i++) {
      try {
        const res = await inquirerPrompts[i]();
        const prop = Object.keys(res)[0];
        const val = Object.values(res)[0];
        results['values'][prop] = val;
      } catch (e) {
        reject(e);
        process.exit();
      }
    }
    resolve(results);
  });
};
