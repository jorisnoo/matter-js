/* eslint-env es6 */
"use strict";

jest.setTimeout(2 * 60 * 1000);

const fs = require('fs');
const path = require('path');

const {
    requireUncached,
    comparisonReport,
    logReport,
    toMatchExtrinsics,
    toMatchIntrinsics,
    getArg
} = require('./TestTools.cjs');

const Example = requireUncached('../examples/index.cjs');

// Load the ESM build via dynamic import
const buildUrl = require('url').pathToFileURL(path.resolve(__dirname, '../build/matter.js')).href;
const MatterBuildPromise = import(buildUrl).then(m => m.default || m);

const Worker = require('jest-worker').Worker;

const testComparison = getArg('compare', null) === 'true';
const saveComparison = getArg('save', null) === 'true';
const specificExamples = getArg('examples', null, (val) => val.split(','));
const repeats = getArg('repeats', 1, parseFloat);
const updates = getArg('updates', 150, parseFloat);
const benchmark = getArg('benchmark', null) === 'true';

const excludeExamples = ['svg', 'terrain'];
const excludeJitter = ['stack', 'circleStack', 'restitution', 'staticFriction', 'friction', 'newtonsCradle', 'catapult'];

let examples;
let MatterBuild;
let capturesDev;
let capturesBuild;

beforeAll(async () => {
    MatterBuild = await MatterBuildPromise;
    const { versionSatisfies } = MatterBuild.Plugin;

    examples = (specificExamples || Object.keys(Example)).filter(key => {
        const excluded = excludeExamples.includes(key);
        const buildVersion = MatterBuild.version;
        const exampleFor = Example[key].for;
        const supported = versionSatisfies(buildVersion, exampleFor);
        return !excluded && supported;
    });

    capturesDev = await captureExamples(true);
    capturesBuild = await captureExamples(false);
});

const captureExamples = async useDev => {
    const worker = new Worker(require.resolve('./ExampleWorker.cjs'), {
        enableWorkerThreads: true,
        numWorkers: benchmark ? 1 : undefined
    });

    const completeRuns = await Promise.all(examples.map(name => worker.runExample({
        name,
        useDev,
        updates: updates,
        repeats: benchmark ? Math.max(repeats, 3) : repeats,
        stableSort: false,
        jitter: excludeJitter.includes(name) ? 0 : 1e-10
    })));

    await worker.end();

    const capture = {};

    for (const completeRun of completeRuns) {
        capture[completeRun.name] = completeRun;
    }

    return capture;
};

afterAll(async () => {
    if (!capturesDev || !capturesBuild) {
        return;
    }

    const dev = capturesDev;
    const build = capturesBuild;

    const buildSize = fs.statSync('./build/matter.min.js').size;
    const devSize = fs.statSync('./build/matter.dev.min.js').size;

    console.log(
        'Examples ran against previous release and current build\n\n'
        + logReport(build, `release`) + '\n'
        + logReport(dev, `current`) + '\n'
        + comparisonReport(dev, build, devSize, buildSize, MatterBuild.version, saveComparison, benchmark)
    );
});

describe(`Integration checks`, () => {
    test(`Examples run without throwing`, async () => {
        expect(Object.keys(capturesDev)).toEqual(examples);
        expect(Object.keys(capturesBuild)).toEqual(examples);
    });
});

// Experimental regression comparison checks.
if (testComparison) {
    describe(`Regression checks`, () => {
        expect.extend(toMatchExtrinsics);
        expect.extend(toMatchIntrinsics);

        test(`Examples match intrinsic properties with release build`, async () => {
            // compare mass, inertia, friction etc.
            expect(capturesDev).toMatchIntrinsics(capturesBuild);
        });

        test(`Examples match extrinsic positions and velocities with release build`, async () => {
            // compare position, linear and angular velocity
            expect(capturesDev).toMatchExtrinsics(capturesBuild);
        });
    });
}
