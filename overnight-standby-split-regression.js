
const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const cells=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));

function between(a,b){
  const s=html.indexOf(a),e=html.indexOf(b,s);
  if(s<0||e<0) throw new Error('extract '+a);
  return html.slice(s,e);
}
const pad=n=>String(n).padStart(2,'0');
const toH=s=>{const m=String(s||'').match(/(\d{1,3}):(\d{2})/);return m?Number(m[1])+Number(m[2])/60:null;};
const hhmm=h=>{let m=Math.round(h*60);return pad(Math.floor(m/60))+':'+pad((m%60+60)%60);};
const dur=(a,b)=>{let s=toH(a),e=toH(b);if(s==null||e==null)return 0;if(e<s)e+=24;return e-s;};
const overlapNight=(a,b)=>{
  let s=toH(a),e=toH(b);if(s==null||e==null)return 0;if(e<s)e+=24;
  let t=0;
  for(let d=-1;d<=1;d++){
    const ns=1+24*d,ne=6+24*d;
    t+=Math.max(0,Math.min(e,ne)-Math.max(s,ns));
  }
  return t;
};
const addHoursToHHMM=(t,h)=>{
  let v=toH(t);if(v==null)return t;
  v=(v+h)%24;
  const m=Math.round(v*60)%1440;
  return pad(Math.floor(m/60))+':'+pad(m%60);
};

eval(between('function parseCell(day, lines){','\n\nfunction pair(cells){'));
eval(between('function pair(cells){','\n\nasync function extractPdf'));

function calc(d){
  const base=dur(d.report,d.release);
  const active=(d.sectors||0)>0||!!d.hasDH||(d.simSessions||0)>0;
  const post=active?0.5:0;
  let credit,activated=false;

  if(d.standby&&active&&(d.activationStart||d.standbyEnd)){
    const a=d.activationStart||d.standbyEnd;
    credit=dur(d.report,a)*0.25+dur(a,d.release)+post;
    activated=true;
  } else if(d.standby){
    credit=base*0.25;
  } else {
    credit=base+post;
  }

  const nightEnd=post?addHoursToHHMM(d.release,post):d.release;
  const night=activated
    ? overlapNight((d.activationStart||d.standbyEnd),nightEnd)
    : (d.standby?0:overlapNight(d.report,nightEnd));

  return {duty:hhmm(credit),night:hhmm(night)};
}

const duties=pair(cells.map(c=>parseCell(c.day,c.lines)));
const rows=duties.map(d=>({
  day:d.day,report:d.report,release:d.release,
  standby:!!d.standby,split:!!d.splitFromOvernightStandby,
  sectors:d.sectors,activation:d.activationStart,...calc(d)
}));

const d15=rows.find(r=>r.day===15);
const d16=rows.find(r=>r.day===16);

if(!d15) throw new Error('Sep 15 missing');
if(!d16) throw new Error('Sep 16 missing');

if(d15.report!=='21:00'||d15.release!=='05:00'||!d15.standby||d15.sectors!==0||d15.duty!=='02:00'||d15.night!=='00:00'){
  throw new Error('Sep15 wrong '+JSON.stringify(d15));
}
if(d16.report!=='05:00'||d16.release!=='10:00'||d16.standby||d16.sectors!==2||d16.duty!=='05:30'||d16.night!=='01:00'){
  throw new Error('Sep16 wrong '+JSON.stringify(d16));
}

// Same-day activated standby must remain combined.
const aug30=pair([parseCell(30,[
  'Report 03:30 ADB',
  'SB1 ADB 03:30 ~ 06:15 ADB',
  'Report 06:15 ADB',
  'Release 06:15 ADB',
  'DH ADB 07:30 ~ 09:37 FRA',
  'XQ911 FRA 13:05 ~ 16:54 ADB',
  'Release 16:54 ADB'
])]);
if(aug30.length!==1) throw new Error('Aug30 unexpectedly split');
const a=aug30[0], ar=calc(a);
if(a.report!=='03:30'||a.release!=='16:54'||a.sectors!==1||a.activationStart!=='06:15'||ar.duty!=='11:50'){
  throw new Error('Aug30 regression '+JSON.stringify({...a,...ar}));
}

// Existing Sep 22/23 overnight logic must remain intact.
const sep2223=pair([
  parseCell(22,['Report 19:30 ADB','XQ9238 ADB 20:45 ~ 22:15 ASR','XQ9239 ASR 22:50 ~ ADB']),
  parseCell(23,['XQ9239 ASR ~ 00:25 ADB','Release 00:25 ADB','Report 13:00 ADB','SB3 ADB 13:00 ~ 21:00 ADB','Release 21:00 ADB'])
]);
if(sep2223.length!==2) throw new Error('Sep22/23 duty count');
if(calc(sep2223[0]).duty!=='05:25'||sep2223[0].sectors!==2) throw new Error('Sep22 regression');
if(calc(sep2223[1]).duty!=='02:00'||sep2223[1].sectors!==0) throw new Error('Sep23 regression');

let totalDuty=0,totalNight=0;
for(const r of rows){
  totalDuty+=toH(r.duty);
  totalNight+=toH(r.night);
}

console.log(JSON.stringify({
  sep15:d15,
  sep16:d16,
  aug30:{report:a.report,release:a.release,sectors:a.sectors,activation:a.activationStart,...ar},
  sep22:{duty:calc(sep2223[0]).duty,sectors:sep2223[0].sectors},
  sep23:{duty:calc(sep2223[1]).duty,sectors:sep2223[1].sectors},
  septemberTotal:{duty:hhmm(totalDuty),night:hhmm(totalNight)}
},null,2));
console.log('OVERNIGHT STANDBY SPLIT REGRESSION PASS');
