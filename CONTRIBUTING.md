# Contributing

## License Agreement

By providing any kind of contribution to this project, **you must agree and be legally entitled** to provide them for use and distribution as a part of this project **wholly under the same terms as in the original included [license](https://github.com/liabru/matter-js/blob/master/LICENSE)**.

## Contributions

Contributions by pull request or issues are welcome. Please ensure they follow the same style and architecture as the rest of the code. Use `npm run lint` and see [Testing](#Testing) below before submitting. Please **do not include** any changes to the files in the `build` directory. 

Before contributing please read the license agreement described at the beginning of this document.

## Building

The development tools require Node.js 20.19+ (20.x) or 22.12+. From this checkout run:

	npm ci

which will install the required build dependencies, then run

	npm start

which will run the development server and opens `http://localhost:8000/` in your browser. Any changes you make to the source will automatically rebuild and reload the page.

## Testing

All contributions should pass when running the commands

- `npm run lint`
- `npm run test`
- `npm run test-types`
- `npx playwright-core install chromium --only-shell`
- `npm run build-demo && npm run test-browser`

`npm test` includes a [comparison report](https://github.com/liabru/matter-js/pull/794) against `matter-js-upstream` 0.20.0 with the upstream compound-inertia fix applied to the reference. Any difference in the compared examples fails the suite.

Test options are set with environment variables, e.g. `MATTER_TEST_EXAMPLES=stack,car npm test` to run specific examples, or `MATTER_TEST_COMPARE=false npm test` to skip the upstream comparison.

## Commands

The following development commands can be run at the terminal

- **npm start**  
runs development server and opens demo page
- **npm run build**  
creates a release build
- **npm run build-demo**  
builds the demo
- **npm run lint**  
runs the linter
- **npm run test**
runs the tests and compares results
- **npm run test-browser**  
runs the compiled demo in headless Chromium; it starts its own local server. To use an existing Chromium executable, set `CHROME_PATH`.
