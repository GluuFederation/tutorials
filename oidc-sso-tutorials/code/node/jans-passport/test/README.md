# Test Folder
Remember, we do TDD.

## Practices
- **Unit tests** : files should be named *.test.js
- **Integration tests**: files should be named *.spec.js

## Things you should know

- **config/test.js**: File used to setup testing env and some mocks, using [node-config](https://www.npmjs.com/package/config) module (please read it).
- **test/test.config.js**: This is not a configuration file, this **tests** the configuration files on `/config`
- **test/helper.js**: Here are all helpers to avoid [**DRY**](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) and some mocks.
- **all other files in /test**: Testing files using mocha and chai.

