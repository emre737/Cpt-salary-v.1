
const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');

function extractBetween(a,b){
  const s=html.indexOf(a), e=html.indexOf(b,s);
  if(s<0||e<0) throw new Error('extract failed '+a);
  return html.slice(s,e);
}
const pad=n=>String(n).padStart(2,'0');
const toH=s=>{ const m=String(s||'').match(/(\d{1,3}):(\d{2})/); return m ? Number(m[1])+Number(m[2])/60 : null; };
const hhmm=h=>{ let m=Math.round(h*60); return pad(Math.floor(m/60))+':'+pad((m%60+60)%60); };
const dur=(a,b)=>{ let s=toH(a),e=toH(b); if(s==null||e==null)return 0;if(e<s)e+=24;return e-s; };
const overlapNight=(a,b)=>{
  let s=toH(a),e=toH(b); if(s==null||e==null)return 0;if(e<s)e+=24;
  let total=0;for(let d=-1;d<=1;d++){const ns=1+24*d,ne=6+24*d;total+=Math.max(0,Math.min(e,ne)-Math.max(s,ns));}
  return total;
};
const addHoursToHHMM=(t,h)=>{let v=toH(t);if(v==null)return t;v=(v+h)%24;const mins=Math.round(v*60)%1440;return pad(Math.floor(mins/60))+':'+pad(mins%60);};

eval(extractBetween('function parseCell(day, lines){','\n\nfunction pair(cells){'));
eval(extractBetween('function pair(cells){','\n\nasync function extractPdf'));

function calc(d){
  const base=dur(d.report,d.release);
  const hasFlightSectors=(d.sectors||0)>0;
  const hasActiveDuty=hasFlightSectors || !!d.hasDH || (d.simSessions||0)>0;
  const postFlightDuty=hasActiveDuty ? 0.5 : 0;
  let credit, activated=false;
  if(d.standby && hasActiveDuty && (d.activationStart||d.standbyEnd)){
    const activation=d.activationStart||d.standbyEnd;
    credit=dur(d.report,activation)*0.25 + dur(activation,d.release) + 0.5;
    activated=true;
  } else if(d.standby) credit=base*0.25;
  else credit=base+postFlightDuty;

  const nightEnd=postFlightDuty?addHoursToHHMM(d.release,postFlightDuty):d.release;
  const night=activated
    ? overlapNight((d.activationStart||d.standbyEnd),nightEnd)
    : (d.standby?0:overlapNight(d.report,nightEnd));

  return {duty:hhmm(credit),night:hhmm(night),post:postFlightDuty};
}
function assertEq(got,want,label){if(got!==want)throw new Error(`${label}: expected ${want}, got ${got}`);}

// 1) DH overnight case from user's screenshot: 19:40 -> 01:15 +30.
// Night must include 01:15 -> 01:45 post-flight = total 00:45.
let dh=pair([
  parseCell(1,['Report 19:40 TZX','DH TZX 20:40 ~ 22:05 ESB','DH ESB 23:55 ~ ADB']),
  parseCell(2,['DH ESB ~ 01:15 ADB','Release 01:15 ADB'])
]);
assertEq(dh.length,1,'DH duty count');
assertEq(calc(dh[0]).duty,'06:05','DH duty');
assertEq(calc(dh[0]).night,'00:45','DH night incl post-flight');

// 2) Normal flight ending during night.
let f=pair([parseCell(7,['Report 00:30 ADB','XQ100 ADB 01:30 ~ 03:00 FRA','XQ101 FRA 03:30 ~ 05:50 ADB','Release 05:50 ADB'])]);
assertEq(calc(f[0]).night,'05:00','Flight night capped at 06:00'); // 01:00-06:00 incl 10m post-flight portion

// 3) Normal flight ending before night starts; post-flight crosses into 01:00.
let f2=pair([parseCell(8,['Report 20:00 ADB','XQ200 ADB 22:00 ~ 00:45 ADB','Release 00:45 ADB'])]);
assertEq(calc(f2[0]).night,'00:15','Post-flight crossing 01:00');

// 4) Flight ending at 00:20 +30 ends 00:50: still zero night.
let f3=pair([parseCell(25,['Report 19:10 ADB','XQ9358 ADB 20:25 ~ 22:00 SZF','XQ9359 SZF 22:35 ~ 00:20 ADB','Release 00:20 ADB'])]);
assertEq(calc(f3[0]).night,'00:00','Sep25 no night');

// 5) Morning flight 03:00 -> 10:40 +30: post-flight outside night, remains 03:00.
let f4=pair([parseCell(27,['Report 03:00 ADB','XQ986 ADB 04:15 ~ 06:05 MUC','XQ987 MUC 07:00 ~ 10:40 ADB','Release 10:40 ADB'])]);
assertEq(calc(f4[0]).night,'03:00','Sep27 night');

// 6) Standby-only: never night, no post-flight.
let sb=pair([parseCell(15,['Report 21:00 ADB','SB5 ADB 21:00 ~ 04:00 ADB','Release 04:00 ADB'])]);
assertEq(calc(sb[0]).night,'00:00','Standby-only night');
assertEq(calc(sb[0]).post,0,'Standby-only post-flight');

// 7) Activated standby Aug30: standby part excluded from night; active 06:15+ is outside night.
let asb=pair([parseCell(30,[
  'Report 03:30 ADB','SB1 ADB 03:30 ~ 06:15 ADB','Report 06:15 ADB','Release 06:15 ADB',
  'DH ADB 07:30 ~ 09:37 FRA','XQ911 FRA 12:10 ~ 16:06 ADB','Release 16:06 ADB'
])]);
assertEq(asb.length,1,'Activated standby duty count');
assertEq(calc(asb[0]).duty,'11:02','Activated standby duty');
assertEq(calc(asb[0]).night,'00:00','Activated standby night');

// 8) Synthetic activated standby activating inside night. Standby before activation excluded;
// active 04:30 -> 05:45 plus post-flight to 06:15 => night is 01:30 (04:30-06:00).
let asb2=pair([parseCell(9,[
  'Report 02:00 ADB','SB1 ADB 02:00 ~ 04:30 ADB','Report 04:30 ADB','Release 04:30 ADB',
  'XQ300 ADB 04:50 ~ 05:45 ADB','Release 05:45 ADB'
])]);
assertEq(calc(asb2[0]).night,'01:30','Activated standby night incl post-flight');

// 9) SIM duty: post-flight also counts for night.
let sim=pair([parseCell(10,['Report 20:00 IST','BOEING-C IST 22:00 ~ 01:20 IST','Release 01:20 IST'])]);
assertEq(calc(sim[0]).night,'00:50','SIM post-flight night');

console.log(JSON.stringify({
  dh_over_midnight:calc(dh[0]),
  flight_0550_release:calc(f[0]),
  flight_0045_release:calc(f2[0]),
  sep25:calc(f3[0]),
  sep27:calc(f4[0]),
  standby_only:calc(sb[0]),
  aug30_activated:calc(asb[0]),
  activated_inside_night:calc(asb2[0]),
  sim_0120_release:calc(sim[0])
},null,2));
console.log('ALL NIGHT REGRESSION TESTS PASS');
