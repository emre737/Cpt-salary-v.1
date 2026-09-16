
const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const cells=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
function between(a,b){const s=html.indexOf(a),e=html.indexOf(b,s);if(s<0||e<0)throw new Error(a);return html.slice(s,e);}
const pad=n=>String(n).padStart(2,'0');
const toH=s=>{const m=String(s||'').match(/(\d{1,3}):(\d{2})/);return m?Number(m[1])+Number(m[2])/60:null;};
const hhmm=h=>{let m=Math.round(h*60);return pad(Math.floor(m/60))+':'+pad((m%60+60)%60);};
const dur=(a,b)=>{let s=toH(a),e=toH(b);if(s==null||e==null)return 0;if(e<s)e+=24;return e-s;};
const overlapNight=(a,b)=>{let s=toH(a),e=toH(b);if(s==null||e==null)return 0;if(e<s)e+=24;let t=0;for(let d=-1;d<=1;d++){const ns=1+24*d,ne=6+24*d;t+=Math.max(0,Math.min(e,ne)-Math.max(s,ns));}return t;};
const addHoursToHHMM=(t,h)=>{let v=toH(t);if(v==null)return t;v=(v+h)%24;const m=Math.round(v*60)%1440;return pad(Math.floor(m/60))+':'+pad(m%60);};
eval(between('function parseCell(day, lines){','\n\nfunction pair(cells){'));
eval(between('function pair(cells){','\n\nasync function extractPdf'));

function calc(d){
 const base=dur(d.report,d.release);
 const active=(d.sectors||0)>0||!!d.hasDH||(d.simSessions||0)>0;
 const post=active?.5:0;
 let c,act=false;
 if(d.standby&&active&&(d.activationStart||d.standbyEnd)){const a=d.activationStart||d.standbyEnd;c=dur(d.report,a)*.25+dur(a,d.release)+post;act=true;}
 else if(d.standby)c=base*.25; else c=base+post;
 const ne=post?addHoursToHHMM(d.release,post):d.release;
 const n=act?overlapNight((d.activationStart||d.standbyEnd),ne):(d.standby?0:overlapNight(d.report,ne));
 return {duty:hhmm(c),night:hhmm(n)};
}
const ds=pair(cells.map(c=>parseCell(c.day,c.lines)));
const rows=ds.map(d=>({day:d.day,report:d.report,release:d.release,sectors:d.sectors,standby:!!d.standby,...calc(d)}));
const d15=rows.find(r=>r.day===15), d16=rows.find(r=>r.day===16);
if(!d15||d15.report!=='21:00'||d15.release!=='05:00'||d15.duty!=='02:00'||d15.sectors!==0) throw new Error('Sep15 '+JSON.stringify(d15));
if(!d16||d16.report!=='05:00'||d16.release!=='10:00'||d16.duty!=='05:30'||d16.night!=='01:00'||d16.sectors!==2) throw new Error('Sep16 '+JSON.stringify(d16));
const d22=rows.find(r=>r.day===22), d23=rows.find(r=>r.day===23);
if(!d22||d22.duty!=='05:25'||d22.sectors!==2) throw new Error('Sep22');
if(!d23||d23.duty!=='02:00'||d23.sectors!==0) throw new Error('Sep23');
console.log(JSON.stringify({sep15:d15,sep16:d16,sep22:d22,sep23:d23},null,2));
console.log('LATEST SEPTEMBER PARSER REGRESSION PASS');
