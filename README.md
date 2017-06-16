[![Build Status](https://travis-ci.org/jahglow/r-sort-table.svg?branch=master)](https://travis-ci.org/jahglow/r-sort-table) [![codecov](https://codecov.io/gh/jahglow/r-sort-table/branch/master/graph/badge.svg)](https://codecov.io/gh/jahglow/r-sort-table)

# ES6 Karma Jasmine Webpack Boilerplate

_No Grunt/Gulp required!_

Boilerplate for building a client-based JavaScript library in ES6 using the following components:

* [Babel](https://babeljs.io/)
* [webpack](https://webpack.github.io/)
* [Jasmine](http://jasmine.github.io/)
* [Karma](http://karma-runner.github.io/)
* babel-plugin-istanbul
* [ESLint](http://eslint.org/) with [eslint-config-airbnb](https://github.com/airbnb/javascript)
* PostCSS with Autoprefixer (for autoprefixing vendors), includes and CSSnext (for css custom-properties etc.) and cssnano (for CSS minification)
* JSDoc3 to auto-generate JSDoc documentation for JS that uses JSDoc comment syntax.


##SRC

`./src` folder must contain at least `main.js` file. There you may write your code, but preferably write it in other files that are named according to their main Class and import them into main.js
If you have a `.css` file that need to be included, import it into the top of `main.js` file via `require("./file/path/relative/to/main/js/file/styles.css")` which may include imports of other css files via `@import "./path/to/file.css"`. This `.css` file will be run through PostCSS.
These two files are the ones that import content (via `require("path/to/module.js")` or `import ClassName from "./class/path/ClassName.js"` and via `@import "path/to/module.css";`) from other files located in the same folder/nested folders (if you need several files with classes)
or act as the only js/css files for the module.
If you plan to write tests using fixtures ([using Jasmine-jquery](https://github.com/velesin/jasmine-jquery) with [karma-jasmine-jquery](https://github.com/bessdsv/karma-jasmine-jquery)) (both shipped in this bundle)
put your fixtures under `/src/__tests__/fixtures/fixtureFile.html`  (which would contain the code of your fixture omitting `<html>` and `<body>` tags) or `/src/__tests__/fixtures/fixtureFile.json`. In your tests you need to include the fixture and then you'll be able to reference any HTML tags by jquery selectors via `$j('.someSelector')` like below:

```javascript
describe('Fixture example', () => {

  beforeEach(()=>{ // or beforeAll()
    jasmine.getFixtures().fixturesPath = 'base/src/__tests__/fixtures'; // do not change this line, it's pointing to the correct folder with fixtures 
    loadFixtures('table-nested-headers.html'); // use this file as a fixture
  });

  it('can tests if the fixture loaded', () => {
    expect($j('#confirmit_agg_table')).toExist();
  });
});

```

To make use of the fixtures please refer to [Jasmine-jquery API documentation](https://github.com/velesin/jasmine-jquery)

### Commands (configured in package.json)

- `npm install` installs all dependencies of the project
- `npm run build:prd` generates minified build files under `/dist` folder 
- `npm run build:dev` generates build files under `/dist` folder and starts watching all changes made to the project during this session, appending them to the build files
- `npm test` Runs tests that have been written and put into `/src/__tests__` folder. (Note: test should follow name convention: `NameOfClass-test.js` which is a test for `NameOfFile.js`)
- `npm run lint` Lints your JavaScript code placed in src folder.
- `npm run docs` generates documentation for your project `.js` files that use JSDoc3 comments and puls them into `docs` folder
- `npm run docs-commit`  publishes documentation to `http://ConfirmitASA.github.io/[RepoName]/[version]/` where `[RepoName]` is name of your repository as well as name specified in `package.json -> name` AND `[version]` is the version in your `package.json`. 
Please make sure you have the `npm run docs-commit` command configured properly with the correct name of repo to be used there.
