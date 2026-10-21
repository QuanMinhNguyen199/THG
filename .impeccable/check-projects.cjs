const {chromium}=require('C:/Users/admin/AppData/Local/npm-cache/_npx/420ff84f11983ee5/node_modules/playwright');
(async()=>{
const browser=await chromium.launch({headless:true,channel:'msedge'});
for(const width of [1440,390]) {
const page=await browser.newPage({viewport:{width,height:950},reducedMotion:'reduce'});
for(const [slug,client,result] of [['a360','Cục Thuế Thành phố Hà Nội','80%'],['ai-platform','UBND Thành phố Hà Nội','24/7'],['quan-ly-du-an','Tổng công ty PTSC M&C','5 giây']]) {
const response=await page.goto(`http://localhost:3000/ung-dung/${slug}/`);
if(response.status()!==200) throw Error(`${slug}: ${response.status()}`);
const evidence=page.locator('.is-project-evidence');
await evidence.waitFor();
if(!(await evidence.innerText()).includes(client)||!(await evidence.innerText()).includes(result)) throw Error('Missing project content');
await evidence.scrollIntoViewIfNeeded();
await page.screenshot({path:`.impeccable/review/project-${slug}-${width}.png`});
if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error(`${slug}: horizontal overflow`);
}
await page.goto('http://localhost:3000/ung-dung/');
await page.waitForTimeout(1000); if(await page.locator('.corp-grid a[href*="/ung-dung/quan-ly-du-an"]').count()!==1) throw Error('Missing overview link: '+await page.locator('main').innerText());
if(await page.locator('#site-navigation a[href*="/ung-dung/quan-ly-du-an"]').count()!==1) throw Error('Missing navigation link');
console.log(`${width}: three projects, overview and navigation verified`);
await page.close();
}
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});


