const fs = require('fs');
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse/lighthouse-core/fraggle-rock/api.js');

const { waitTillHTMLRendered } = require('./utils/renderer');
const { fields } = require('./config/fields');
const { SELECTORS } = require('./constants/selectors');
const { CONFIG } = require('./constants/config');

async function captureReport() {
    const browser = await puppeteer.launch({
        args: ['--allow-no-sandbox-job', '--allow-sandbox-debugging', '--no-sandbox', 
               '--disable-gpu', '--disable-gpu-sandbox', '--display', '--ignore-certificate-errors', 
               '--disable-storage-reset=true']
    });

    const page = await browser.newPage();
    await page.setViewport(CONFIG.viewport);
    await page.setDefaultTimeout(CONFIG.defaultTimeout);

    const navigationPromise = page.waitForNavigation({
        timeout: CONFIG.navigationTimeout, 
        waitUntil: ['domcontentloaded']
    });
    
    await page.goto(CONFIG.baseURL);
    await navigationPromise;

    const flow = await lighthouse.startFlow(page, {                       
        name: CONFIG.lighthouse.name,                                                       
        configContext: {                                                               
            settingsOverrides: {
                throttling: CONFIG.throttling,
                throttlingMethod: CONFIG.lighthouse.throttlingMethod,
                screenEmulation: CONFIG.lighthouse.screenEmulation,
                formFactor: CONFIG.lighthouse.formFactor,
                onlyCategories: CONFIG.lighthouse.onlyCategories,
            },
        },
    });
    
    // ================================ OPEN HOME PAGE ================================
    await flow.navigate(CONFIG.baseURL, { stepName: 'Open Home page' });
    console.log('Home page is opened');
    await waitTillHTMLRendered(page);

    
    // ================================ NAVIGATE TO TABLE PAGE ================================
    await page.waitForSelector(SELECTORS.tablePageSelector, { timeout: 30000 });
    await flow.startTimespan({ stepName: 'Open Table page' });
        await page.click(SELECTORS.tablePageSelector);
        await waitTillHTMLRendered(page);
    await flow.endTimespan();
    console.log('Table page is opened');
    

    // =============================== NAVIGATE TO TABLE PRODUCT ================================
    await page.waitForSelector(SELECTORS.tableProductSelector, { timeout: 30000 });
    await flow.startTimespan({ stepName: 'Open Table Product page' });
        await page.$eval(SELECTORS.tableProductSelector, (el) => el.click());
        await waitTillHTMLRendered(page);
    await flow.endTimespan();
    console.log('Table Product page is opened');


    // =============================== ADD TO CART ================================
    await page.waitForSelector(SELECTORS.addToCartButtonSelector, { timeout: 30000 });
    await flow.startTimespan({ stepName: 'Add to Cart' });
        await page.click(SELECTORS.addToCartButtonSelector);
        await waitTillHTMLRendered(page);
    await flow.endTimespan();
    console.log('Product is added to cart');


    // =============================== GO TO CART ================================
    await page.waitForSelector(SELECTORS.addToCartSelector, { timeout: 30000 });
    await flow.startTimespan({ stepName: 'Go to Cart' });
        await page.click(SELECTORS.addToCartSelector);
        await waitTillHTMLRendered(page);
    await flow.endTimespan();
    console.log('Cart page is opened');


    // =============================== PLACE ORDER ================================
    await page.waitForSelector(SELECTORS.placeOrderButtonSelector, { timeout: 30000 });
    await flow.startTimespan({ stepName: 'Place Order' });
        await page.click(SELECTORS.placeOrderButtonSelector);
        await waitTillHTMLRendered(page);
    await flow.endTimespan();
    console.log('Place Order page is opened');
    

    // =============================== FILL FORM AND SUBMIT ================================
    await flow.startTimespan({ stepName: 'Fill Form Fields' });
        for (const f of fields) {
        try {
            await page.waitForSelector(f.field, { timeout: 5000 });
            if (f.field.includes('select')) {
                await page.select(f.field, String(f.name || ''));
            } else {
                await page.type(f.field, String(f.name || ''), { delay: 20 });
            }
        } catch (e) {
            console.log(`Field "${f.field}" not found`);
        }
    }
    await flow.endTimespan();

    await new Promise(r => setTimeout(r, 1000));

    // =============================== SUBMIT FORM ================================
    await page.waitForSelector(SELECTORS.filledFormButtonSelector, { timeout: 30000 });
    await flow.startTimespan({ stepName: 'Fill Form and Submit' });
        await page.click(SELECTORS.filledFormButtonSelector);
        await waitTillHTMLRendered(page);
    await flow.endTimespan();
    console.log('Form is filled and submitted');



    // ================================ REPORTING ================================
    const reportPath = require('path').join(__dirname, '..', 'user-flow.report.html');
    const report = await flow.generateReport();
    fs.writeFileSync(reportPath, report);
    
    await browser.close();
}

captureReport().catch(console.error);
