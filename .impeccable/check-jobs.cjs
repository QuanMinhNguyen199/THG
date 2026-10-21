const { chromium } = require('C:/Users/admin/AppData/Local/npm-cache/_npx/420ff84f11983ee5/node_modules/playwright');
(async()=>{
 const browser = await chromium.launch({headless:true, channel:"msedge"});
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
 const page=await browser.newPage({viewport:{width,height}});
 await page.goto('http://localhost:3000/tuyen-dung/');
 await page.locator('.job-folders .project').first().scrollIntoViewIfNeeded();
 await page.screenshot({path:`.impeccable/review/jobs-${name}.png`});
 await page.locator('.job-folders .project').first().click();
 await page.waitForSelector('.tdn-dialog.is-standing'); await page.waitForTimeout(1200);
 const dialog=page.locator('dialog[open]');
 if(await dialog.locator('.folder-reading-body h3').count()!==4) throw Error('Missing JD');
 console.log(name, await dialog.locator('.folder-reading-footer a').getAttribute('href'), await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:`.impeccable/review/jobs-${name}-open.png`});
 await page.keyboard.press('Escape');
 await page.waitForSelector('dialog[open]',{state:'hidden'});
 await page.getByRole('button',{name:'AIoT',exact:true}).click();
 if(await page.locator('.job-folders .project').count()!==1) throw Error('Filter');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('.job-folders .project').click();
 await page.waitForSelector('.tdn-dialog.is-standing'); await page.waitForTimeout(1200);
 await page.getByRole('button',{name:'Đóng mô tả công việc'}).click();
 await page.waitForSelector('dialog[open]',{state:'hidden'});
 await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});



