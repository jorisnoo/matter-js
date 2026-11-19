import { chromium } from 'playwright-core';
import { preview } from 'vite';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import * as examples from '../examples/index.js';

describe('Built browser demo', () => {
    let server, browser, page, problems;

    beforeAll(async () => {
        server = await preview({
            configFile: 'vite.demo.config.js',
            preview: { host: '127.0.0.1', port: 0 },
        });
        browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
    });

    afterAll(async () => {
        try {
            await browser?.close();
        } finally {
            await server?.close();
        }
    });

    beforeEach(async () => {
        problems = [];
        page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
        page.setDefaultTimeout(15000);
        page.on('pageerror', error => problems.push(`${page.url()}: ${error.stack}`));
        page.on('console', message => {
            if (['warning', 'error'].includes(message.type())) {
                problems.push(`${page.url()}: ${message.type()}: ${message.text()}`);
            }
        });
        await page.goto(server.resolvedUrls.local[0]);
        await page.waitForFunction(() => window.MatterDemoInstance?.tools.gui.datGui);
    });

    afterEach(async () => {
        await page?.close();
        expect(problems).toEqual([]);
    });

    test('every example runs at least five frames with its own GUI and Inspector', async () => {
        const select = page.getByLabel('Select example');
        expect(await select.locator('option').evaluateAll(options => options.map(o => o.value).sort()))
            .toEqual(Object.keys(examples).sort());

        for (const id of Object.keys(examples)) {
            await select.selectOption(id);
            await page.waitForFunction(id => {
                const { example, tools } = window.MatterDemoInstance;
                const { engine, runner, render } = example.instance;
                return example.id === id && tools.gui.engine === engine && tools.inspector.render === render
                    && render.canvas.isConnected && runner.frameDeltaHistory.length >= 5 && engine.timing.timestamp > 0;
            }, id);
            expect(problems, id).toEqual([]);
        }
    });

    test('GUI restores a saved world and Inspector can select, copy and paste its bodies', async () => {
        const gui = page.locator('.dg.main');
        const worldBodies = () => Matter.Composite.allBodies(window.MatterDemoInstance.example.instance.engine.world).length;
        const count = await page.evaluate(worldBodies);
        expect(count).toBeGreaterThan(0);

        await gui.getByText('save', { exact: true }).click();
        await gui.getByText('addBody', { exact: true }).click();
        expect(await page.evaluate(worldBodies)).toBe(count + 1);
        await gui.getByText('load', { exact: true }).click();
        expect(await page.evaluate(worldBodies)).toBe(count);

        const bodyId = await page.evaluate(() => {
            const { engine } = window.MatterDemoInstance.example.instance;
            return engine.world.bodies[0].id;
        });
        await page.locator(`#body_${bodyId}_anchor`).click();
        await page.waitForFunction(id => window.MatterDemoInstance.tools.inspector.selected[0]?.data.id === id, bodyId);
        await page.keyboard.press('Control+c');
        await page.keyboard.press('Control+v');
        await page.waitForFunction(id => {
            const { engine, selected } = window.MatterDemoInstance.tools.inspector;
            const clone = selected[0]?.data;
            return clone instanceof Matter.Body && clone.id !== id && clone.parts[0] === clone
                && Matter.Composite.allBodies(engine.world).includes(clone);
        }, bodyId);
        expect(await page.evaluate(worldBodies)).toBe(count + 1);
    });
});
