
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
   credit=dur(d.report,a)*.25+dur(a,effectiveRelease)+post; activated=true;
 } else if(d.standby) credit=base*.25;
 else credit=base+post;
 const nightEnd=post?addHoursToHHMM(effectiveRelease,post):effectiveRelease;
 const night=activated?overlapNight((d.activationStart||d.standbyEnd),nightEnd):(d.standby?0:overlapNight(d.report,nightEnd));
 return {duty:hhmm(credit),night:hhmm(night),post};
}
function eq(g,w,l){if(g!==w)throw new Error(`${l}: ${g} != ${w}`);}

// Previous month side of user's example: cutoff at 24:00, no post-flight.
const aug=pair([parseCell(31,[
 'Report 19:50 ADB',
 'XQ9020 ADB 21:05 ~ 23:05 BAL',
 'XQ9021 BAL 23:45 ~ ADB'
])])[0];
const ar=calc(aug,31);
eq(ar.duty,'04:10','Aug 31 cutoff duty');
eq(ar.night,'00:00','Aug 31 cutoff night');
eq(ar.post,0,'Aug 31 no post');

// Next month side: no Report, but XQ continuation + Release on Sep 1.
// Must count 00:00 -> 01:55 + 00:30 post-flight.
const sepDuties=pair([parseCell(1,[
 'XQ9021 BAL ~ 01:55 ADB',
 'Release 01:55 ADB',
 'TOF ADB 15:00 ~ 21:00 ADB'
])]);
eq(sepDuties.length,1,'Sep carry-in count');
const s=sepDuties[0];
eq(s.carryIn,true,'carry-in flag');
eq(s.report,'00:00','carry-in report');
eq(s.release,'01:55','carry-in release');
eq(s.sectors,1,'carry-in sectors');
const sr=calc(s,30);
eq(sr.duty,'02:25','Sep carry-in duty');
eq(sr.night,'01:25','Sep carry-in night');
eq(sr.post,0.5,'Sep carry-in post-flight');

// First-day carry-in followed by a normal later Report must become two duties.
const two=pair([parseCell(1,[
 'XQ500 FRA ~ 02:10 ADB',
 'Release 02:10 ADB',
 'Report 18:00 ADB',
 'XQ600 ADB 19:00 ~ 21:00 FRA',
 'XQ601 FRA 22:00 ~ 23:50 ADB',
 'Release 23:50 ADB'
])]);
eq(two.length,2,'carry-in + later duty count');
eq(two[0].carryIn,true,'first is carry-in');
eq(two[1].report,'18:00','second normal report');

// Carry-in standby continuation: 00:00 -> 04:00 is 4h x 25%, no night.
const sb=pair([parseCell(1,['SB5 ADB ~ 04:00 ADB','Release 04:00 ADB'])])[0];
const sbr=calc(sb,30);
eq(sb.carryIn,true,'standby carry-in');
eq(sbr.duty,'01:00','standby carry-in duty');
eq(sbr.night,'00:00','standby carry-in night');

console.log(JSON.stringify({aug31:ar,sep1:sr,standbyCarryIn:sbr},null,2));
console.log('MONTH CARRY-IN/OUT REGRESSION PASS');
