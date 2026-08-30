
const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
function between(a,b){const s=html.indexOf(a),e=html.indexOf(b,s);if(s<0||e<0)throw new Error(a);return html.slice(s,e);}
const pad=n=>String(n).padStart(2,'0');
const toH=s=>{const m=String(s||'').match(/(\d{1,3}):(\d{2})/);return m?Number(m[1])+Number(m[2])/60:null;};
const hhmm=h=>{let m=Math.round(h*60);return pad(Math.floor(m/60))+':'+pad((m%60+60)%60);};
const dur=(a,b)=>{let s=toH(a),e=toH(b);if(s==null||e==null)return 0;if(e<s)e+=24;return e-s;};
const overlapNight=(a,b)=>{let s=toH(a),e=toH(b);if(s==null||e==null)return 0;if(e<s)e+=24;let t=0;for(let d=-1;d<=1;d++){const ns=1+24*d,ne=6+24*d;t+=Math.max(0,Math.min(e,ne)-Math.max(s,ns));}return t;};
const addHoursToHHMM=(t,h)=>{let v=toH(t);if(v==null)return t;v=(v+h)%24;const m=Math.round(v*60)%1440;return pad(Math.floor(m/60))+':'+pad(m%60);};
eval(between('function parseCell(day, lines){','\n\nfunction pair(cells){'));
eval(between('function pair(cells){','\n\nasync function extractPdf'));

function calc(d,lastRosterDay){
 const monthEndCutoff=!d.release&&d.day===lastRosterDay;
 const effectiveRelease=monthEndCutoff?'24:00':d.release;
 const base=dur(d.report,effectiveRelease);
 const active=(d.sectors||0)>0||!!d.hasDH||(d.simSessions||0)>0;
 const post=(active&&!monthEndCutoff)?0.5:0;
 let credit,activated=false;
 if(d.standby&&active&&(d.activationStart||d.standbyEnd)){
   const a=d.activationStart||d.standbyEnd;
   credit=dur(d.report,a)*.25+dur(a,effectiveRelease)+post;
   activated=true;
 } else if(d.standby) credit=base*.25;
 else credit=base+post;
 const nightEnd=post?addHoursToHHMM(effectiveRelease,post):effectiveRelease;
 const night=activated?overlapNight((d.activationStart||d.standbyEnd),nightEnd):(d.standby?0:overlapNight(d.report,nightEnd));
 return {duty:hhmm(credit),night:hhmm(night),post,monthEndCutoff};
}
function eq(g,w,l){if(g!==w)throw new Error(`${l}: ${g} != ${w}`);}

const d=pair([parseCell(31,[
 'Report 19:50 ADB',
 'XQ9020 ADB 21:05 ~ 23:05 BAL',
 'XQ9021 BAL 23:45 ~ ADB'
])])[0];
const r=calc(d,31);
eq(d.sectors,2,'sectors');
eq(r.duty,'04:10','month-end duty');
eq(r.night,'00:00','month-end night');
eq(r.post,0,'month-end post');
eq(r.monthEndCutoff,true,'cutoff');

const n=pair([
 parseCell(22,['Report 19:30 ADB','XQ9238 ADB 20:45 ~ 22:15 ASR','XQ9239 ASR 22:50 ~ ADB']),
 parseCell(23,['XQ9239 ASR ~ 00:25 ADB','Release 00:25 ADB'])
])[0];
const nr=calc(n,30);
eq(nr.duty,'05:25','normal overnight unchanged');
eq(nr.post,0.5,'normal post');

console.log(JSON.stringify({month_end:r,normal:nr},null,2));
console.log('PASS');
