
const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');

function extract(name,nextName){
  const start=html.indexOf('function '+name+'(');
  const end=html.indexOf('\n\nfunction '+nextName+'(', start);
  if(start<0||end<0) throw new Error('cannot extract '+name);
  return html.slice(start,end);
}
const pad=n=>String(n).padStart(2,'0');
const toH=s=>{ const m=String(s||'').match(/(\d{1,3}):(\d{2})/); return m ? Number(m[1]) + Number(m[2])/60 : null; };
const dur=(a,b)=>{ let s=toH(a), e=toH(b); if(s==null||e==null) return 0; if(e<s) e+=24; return e-s; };
const hhmm=h=>{ let m=Math.round(h*60); return pad(Math.floor(m/60))+':'+pad((m%60+60)%60); };

eval(extract('parseCell','pair'));
let pairStart=html.indexOf('function pair(');
let pairEnd=html.indexOf('\n\nasync function extractPdf',pairStart);
eval(html.slice(pairStart,pairEnd));

function calc(d){
  const base=dur(d.report,d.release);
  const hasFlightSectors=(d.sectors||0)>0;
  const hasActiveDuty=hasFlightSectors || !!d.hasDH || (d.simSessions||0)>0;
  const postFlightDuty=hasActiveDuty ? 0.5 : 0;
  if(d.standby && hasActiveDuty && (d.activationStart||d.standbyEnd)){
    const activation=d.activationStart||d.standbyEnd;
    return dur(d.report,activation)*0.25 + dur(activation,d.release) + 0.5;
  }
  if(d.standby) return base*0.25;
  return base+postFlightDuty;
}
function cells(arr){ return arr.map(x=>parseCell(x.day,x.lines)); }
function assert(cond,msg){ if(!cond) throw new Error(msg); }

// ACTUAL August 30 cell from schedule-2026-8(2).pdf
let a=pair(cells([{day:30,lines:[
  'Report 03:30 ADB',
  'SB1 ADB 03:30 ~ 06:15 ADB',
  'Report 06:15 ADB',
  'Release 06:15 ADB',
  'DH ADB 07:30 ~ 09:37 FRA',
  'XQ911 FRA 12:10 ~ 16:06 ADB',
  'Release 16:06 ADB'
]}]));
assert(a.length===1,'Aug30 should be ONE duty, got '+a.length);
assert(a[0].report==='03:30','Aug30 report');
assert(a[0].release==='16:06','Aug30 final release');
assert(a[0].activationStart==='06:15','Aug30 activation');
assert(a[0].standby===true,'Aug30 standby flag');
assert(a[0].hasDH===true,'Aug30 DH');
assert(a[0].sectors===1,'Aug30 sectors '+a[0].sectors);
assert(hhmm(calc(a[0]))==='11:02','Aug30 duty expected 11:02 got '+hhmm(calc(a[0])));

// ACTUAL Sep 22 -> Sep 23 cells
let s=pair(cells([
 {day:22,lines:[
   'Report 19:30 ADB',
   'XQ9238 ADB 20:45',
   '~ 22:15 ASR',
   'XQ9239 ASR 22:50 ~ ADB'
 ]},
 {day:23,lines:[
   'XQ9239 ASR ~ 00:25 ADB',
   'Release 00:25 ADB',
   'Report 13:00 ADB',
   'SB3 ADB 13:00 ~ 21:00 ADB',
   'Release 21:00 ADB'
 ]}
]));
assert(s.length===2,'Sep22/23 should be two duties');
assert(s[0].release==='00:25' && s[0].sectors===2,'Sep22 pairing/sectors');
assert(hhmm(calc(s[0]))==='05:25','Sep22 duty '+hhmm(calc(s[0])));
assert(s[1].report==='13:00' && s[1].release==='21:00' && s[1].sectors===0,'Sep23 standby pairing');
assert(hhmm(calc(s[1]))==='02:00','Sep23 duty '+hhmm(calc(s[1])));

console.log(JSON.stringify({
  aug30:{report:a[0].report,activation:a[0].activationStart,release:a[0].release,sectors:a[0].sectors,duty:hhmm(calc(a[0]))},
  sep22:{report:s[0].report,release:s[0].release,sectors:s[0].sectors,duty:hhmm(calc(s[0]))},
  sep23:{report:s[1].report,release:s[1].release,sectors:s[1].sectors,duty:hhmm(calc(s[1]))}
},null,2));
