# Commity

[![Greenkeeper badge](https://badges.greenkeeper.io/PierreDemailly/commity.svg)](https://greenkeeper.io/)

**Commity** is a command line tool that will prompt you each **commits parts** required in your commit message.
You can configure Commity easily so the entire team follow the commit format You need.

## Motivation

The goal is to create a powerfull tool that handle commits and some git options so all the collaborators in a same project can follow a specific commit format. The tool must make your git commits cleaner and sometimes, give them more sense.

## Installation
Installation is as simple as :

    npm i -g @pierred/commity

## Initialization
When You have Commity installed, You need to run this simple (sub)command:

    commity init
It will create a `commity.json` file at the root of your application so You are ready to use commity:

    commity

## Configuration
As You may see in `commity.json`, there are 2 parts you can configure: `commitsParts` and `render`

    {
      "commitsParts": [
        {
          "scope": {
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
          "message": {
            "label": "Choose the commit message"
          }
        }
      ],
      "render": "$+scope: $+message"
    }  

Your commitsParts take a `part's name`, in the example above there are two `part's name` : scope and message.
If you want your `part's name` to be a simple input, juste give it a `label`
![Comity CLI screenshot](https://i.ibb.co/br60mqX/Capture-d-e-cran-2019-12-03-a-19-26-43.png)
If you want your `part's name` to be a select, You need to passe `"type": "select"` and `"selectOptions": ["array", "of", "options"]` 
![enter image description here](https://i.ibb.co/LgY9dR8/Capture-d-e-cran-2019-12-03-a-19-29-57.png)

I'm working to make the config with CLI instead of with a json file.

Of course, there is no limit of `commit part`.
