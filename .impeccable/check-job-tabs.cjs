const { chromium } = require('C:/Users/admin/AppData/Local/npm-cache/_npx/420ff84f11983ee5/node_modules/playwright');
(async()=>{
const browser=await chromium.launch({headless:true,channel:'msedge'});
for(const [width,height] of [[1440,1000],[390,844],[320,568]]) {
const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
await page.goto('http://localhost:3000/tuyen-dung/'); await page.waitForTimeout(1000);
for(let i=0;i<4;i++) { console.log(width, i);
await page.locator('.job-folders .project').nth(i).click();
const d=page.locator('dialog[open]');
for(let t=0;t<5;t++) {
await d.getByRole('tab').nth(t).click();
const result=await d.locator('.folder-reading-body').evaluate(el=>({scroll:el.scrollHeight-el.clientHeight}));
const rect=await d.locator('.job-folder-content').boundingBox();
if(result.scroll>1 || rect.y<0 || rect.y+rect.height>height) throw Error(JSON.stringify({width,height,i,t,...result,rect}));
}
if(i===0){await d.getByRole('tab',{name:'Công việc',exact:true}).click();await page.screenshot({path:`.impeccable/review/jobs-tabs-${width}.png`});}
await page.keyboard.press('Escape');
}
console.log(`${width}x${height}: all 4 jobs, all 5 sections visible without scrolling`);
await page.close();
}
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});


