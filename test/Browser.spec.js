import fs from 'fs';
import { describe, test, expect, beforeAll } from 'vitest';

const browserPath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const demoPagePath = 'http://localhost:8000/';
const totalUpdates = 5;

const hasBrowser = fs.existsSync(browserPath);

const conditionalDescribe = hasBrowser ? describe : describe.skip;

if (!hasBrowser) {
    console.warn('Could not find browser. Browser tests skipped.');
}

conditionalDescribe('Browser integration tests', () => {
    let results;
    let Example;

    beforeAll(async () => {
        const puppeteer = await import('puppeteer-core');
        Example = (await import('../examples/index.cjs')).default;
        results = await runExamplesBrowser(puppeteer.default, Example, totalUpdates);
    });

    test('all examples run without throwing error or warning', () => {
        const examples = Object.keys(Example);

        if (results.error) {
            console.error(results.error);
            expect(Boolean(results.error)).toBe(false);
        }
        if (results.warns) {
            console.error(results.warns);
            expect(results.warns.size).toBe(0);
        }
        if (!results.error && !results.warns) {
            for (const example of examples) {
                expect(results[example].id).toBe(example);
                expect(results[example].timestamp).toBeGreaterThan(0);
            }
        }
    });
});

const runExamplesBrowser = async (puppeteer, Example, updates) => {
    const examples = Object.keys(Example);
    const browser = await puppeteer.launch({ executablePath: browserPath });
    const page = await browser.newPage();
    const results = {};
    let example;

    let pageError;
    let pageWarns;

    const onPageError = error => pageError = error;
    const onPageConsole = async message => {
        const type = message.type();
        if (example && type === 'error' || type === 'warning') {
            const log = `[${example}] ${message.type()} ${message.text()}`;
            pageWarns = pageWarns || new Set();
            pageWarns.add(log);
        }
    };

    page.addListener('pageerror', onPageError);
    page.addListener('console', onPageConsole);

    await page.goto(demoPagePath).catch(onPageError);

    for (example of examples) {
        if (pageError) {
            break;
        }

        results[example] = await page.evaluate(async (example, updates) => {
            const demo = window.MatterDemoInstance;

            MatterTools.Demo.setExampleById(demo, example);
            const instance = demo.example.instance;
            let ticks = 0;

            await new Promise((resolve) => {
                Matter.Events.on(instance.runner, 'tick', () => {
                    if (ticks >= updates) {
                        Matter.Runner.stop(instance.runner);
                        resolve();
                    }
                    ticks += 1;
                });
            });

            return {
                id: demo.example.id,
                timestamp: instance.engine.timing.timestamp
            };
        }, example, updates);
    }

    await browser.close();

    results.error = pageError;
    results.warns = pageWarns;
    return results;
};
