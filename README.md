# Commity [![Build status](https://travis-ci.org/PierreDemailly/commity.svg?branch=develop)](https://travis-ci.org/PierreDemailly/commity)

**Commity** is a command line tool that will prompt you each **commits parts** required in your commit message.
You can configure Commity easily so the entire team follow the commit format You need.

## Motivation

The goal is to create a powerfull tool that handle commits and some git options so all the collaborators in a same project can follow a specific commit format. The tool must make your git commits cleaner and sometimes, give them more sense.

## Installation
Installation is as simple as :

    npm i -g @pierred/commity

## Usage

| Command | Description |
| -- | -- |
| `commity` | Execute commity <br> *<sub>:bulb: project need to be commity friendly, see below</sub>* |
| `commity init` | Make your repo commity friendly creating a commity.json file |

| Option | Alias | Description |
| -- | -- | -- |
| `--addAll` | `-a` | Add all changes to the index (`git add --all`) before commit |
| `--push` | `-p` | Push after commit <br> *<sub>:bulb: if cannot push e.g. because your branch has no upstream branch, commity will be able to commit anyway</sub>* |

## Configuration
As You may see in `commity.json`, there are 2 parts you can configure: `commitsParts` and `render`

```js
{
  "commitsParts": [
    {
      "scope": { // this is a part's key
        "label": "Choose the commit scope",
        "type": "select",
        "selectOptions": [
          "spec",
          "feat",
          "fix"
        ]
      }
    },
    {
      "message": { // this is a parts's key
        "label": "Choose the commit message" // for simple inputs, don't need type
      }
    }
  ],
  "render": "$+scope: $+message" // $+scope will be replaced with selected option (spec / feat / fix)
}
```comm

Your commitsParts take a `part's key`, in the example above there are two `part's key` : scope and message.
If you want your `part` to be a simple input, juste give it a `label`

<img src="https://i.ibb.co/br60mqX/Capture-d-e-cran-2019-12-03-a-19-26-43.png" width="50%" height="50%">

If you want your `part's name` to be a select, You need to passe `"type": "select"` and `"selectOptions": ["array", "of", "options"]`

<img src="https://i.ibb.co/LgY9dR8/Capture-d-e-cran-2019-12-03-a-19-29-57.png" width="50%" height="50%">

I'm working to make the config with CLI instead of with a json file.

Of course, there is no limit of `commit part`.
