const {chromium}=require('C:/Users/admin/AppData/Local/npm-cache/_npx/420ff84f11983ee5/node_modules/playwright');
(async()=>{
const browser=await chromium.launch({headless:true,channel:'msedge'});
for(const width of [1440,390]){
const page=await browser.newPage({viewport:{width,height:950},reducedMotion:'reduce'});
const response=await page.goto('http://localhost:3000/ve-thehegeo/kinh-nghiem-du-an/');
if(response.status()!==200) throw Error(`Page returned ${response.status()}`);
await page.locator('.project-evidence').first().waitFor();
if(await page.locator('.project-evidence').count()!==3) throw Error('Project count');
if(await page.locator('.project-evidence-dossier').count()!==3) throw Error('Dossier count');
if(await page.locator('.project-evidence-dossier dd').allTextContents().then(items=>items.some(x=>x!=='Đang cập nhật'))) throw Error('Unconfirmed metadata');
for(const slug of ['a360','ai-platform','quan-ly-du-an']){
const link=page.locator(`.project-evidence-content a[href*="/ung-dung/${slug}"]`);
if(await link.count()!==1) throw Error(`Missing project link ${slug}`);
}
if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw Error('Horizontal overflow');
await page.screenshot({path:`.impeccable/review/experience-${width}.png`,fullPage:true});
if(width===390){await page.getByRole('button',{name:'Mở menu',exact:true}).click();}
const navLink=page.locator('#site-navigation a[href*="/ve-thehegeo/kinh-nghiem-du-an"]');
if(await navLink.count()!==1) throw Error('Navigation missing');
if(width===1440) await page.locator('#site-navigation .nav-item > a').filter({hasText:'Về THEHEGEO'}).hover();
await navLink.waitFor({state:'visible'});
await page.goto('http://localhost:3000/ve-thehegeo/');
await page.locator('.corp-grid a[href*="/ve-thehegeo/kinh-nghiem-du-an"]').waitFor();
console.log(`${width}: project portfolio, metadata, links, navigation, about overview and responsive layout verified`);
await page.close();
}
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

