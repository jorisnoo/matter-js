import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';
import url from 'url';
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import {
    comparisonReport,
    logReport,
    toMatchExtrinsics,
    toMatchIntrinsics,
    getArg
} from './TestTools.js';
import { runExample } from './ExampleWorker.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const examplesUrl = url.pathToFileURL(path.resolve(__dirname, '../examples/index.js')).href;
const ExamplePromise = import(examplesUrl);

// Upstream 0.20.0, with only the reference inertia correction in ExampleWorker.
const require = createRequire(import.meta.url);
const referencePath = require.resolve('matter-js-upstream');
const MatterBuild = require(referencePath);

const testComparison = getArg('compare', null) !== 'false';
const saveComparison = getArg('save', null) === 'true';
const specificExamples = getArg('examples', null, (val) => val.split(','));
const repeats = getArg('repeats', 1, parseFloat);
const updates = getArg('updates', 150, parseFloat);
const benchmark = getArg('benchmark', null) === 'true';

const excludeExamples = ['svg', 'terrain'];
const excludeJitter = ['stack', 'circleStack', 'restitution', 'staticFriction', 'friction', 'newtonsCradle', 'catapult'];

let examples;
let capturesDev;
let capturesBuild;

beforeAll(async () => {
    const Example = await ExamplePromise;
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
    const completeRuns = [];

    for (const name of examples) {
        const result = await runExample({
            name,
            useDev,
            updates: updates,
            repeats: benchmark ? Math.max(repeats, 3) : repeats,
            stableSort: false,
            jitter: excludeJitter.includes(name) ? 0 : 1e-10
        });
        completeRuns.push(result);
    }

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

    const buildSize = fs.statSync(referencePath.replace(/matter\.js$/, 'matter.min.js')).size;
    const devSize = fs.statSync('./build/matter.dev.min.js').size;

    console.log(
        'Examples ran against upstream release and current build\n\n'
        + logReport(build, `upstream`) + '\n'
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

if (testComparison) {
    describe(`Regression checks`, () => {
        expect.extend(toMatchExtrinsics);
        expect.extend(toMatchIntrinsics);

        test(`Examples match intrinsic properties with upstream release`, async () => {
            expect(capturesDev).toMatchIntrinsics(capturesBuild);
        });

        test(`Examples match extrinsic positions and velocities with upstream release`, async () => {
            expect(capturesDev).toMatchExtrinsics(capturesBuild);
        });
    });
}
