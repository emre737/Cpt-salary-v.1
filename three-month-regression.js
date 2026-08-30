
const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const sets=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));

function between(a,b){
  const s=html.indexOf(a), e=html.indexOf(b,s);
  if(s<0||e<0) throw new Error('extract fail '+a);
  return html.slice(s,e);
}
const pad=n=>String(n).padStart(2,'0');
const toH=s=>{const m=String(s||'').match(/(\d{1,3}):(\d{2})/);return m?Number(m[1])+Number(m[2])/60:null;};
const hhmm=h=>{let m=Math.round(h*60);return pad(Math.floor(m/60))+':'+pad((m%60+60)%60);};
const dur=(a,b)=>{let s=toH(a),e=toH(b);if(s==null||e==null)return 0;if(e<s)e+=24;return e-s;};
const overlapNight=(a,b)=>{
  let s=toH(a),e=toH(b);if(s==null||e==null)return 0;if(e<s)e+=24;
  let total=0;
  for(let d=-1;d<=1;d++){const ns=1+24*d,ne=6+24*d;total+=Math.max(0,Math.min(e,ne)-Math.max(s,ns));}
  return total;
};
const addHoursToHHMM=(t,h)=>{let v=toH(t);if(v==null)return t;v=(v+h)%24;const mins=Math.round(v*60)%1440;return pad(Math.floor(mins/60))+':'+pad(mins%60);};

eval(between('function parseCell(day, lines){','\n\nfunction pair(cells){'));
eval(between('function pair(cells){','\n\nasync function extractPdf'));

function totals(cells){
  const duties=pair(cells.map(c=>parseCell(c.day,c.lines)));
  let duty=0,night=0;
  const rows=[];
  for(const d of duties){
    const base=dur(d.report,d.release);
    const hasFlightSectors=(d.sectors||0)>0;
    const hasActiveDuty=hasFlightSectors || !!d.hasDH || (d.simSessions||0)>0;
    const postFlightDuty=hasActiveDuty ? 0.5 : 0;

    let credit;
    if(d.standby && hasActiveDuty && (d.activationStart||d.standbyEnd)){
      const activation=d.activationStart||d.standbyEnd;
      credit=dur(d.report,activation)*0.25 + dur(activation,d.release) + 0.5;
      d.activatedStandby=true;
    } else if(d.standby) {
      credit=base*0.25;
      d.activatedStandby=false;
    } else {
      credit=base+postFlightDuty;
      d.activatedStandby=false;
    }

    d.postFlightDuty=postFlightDuty;
    const nightEnd=postFlightDuty?addHoursToHHMM(d.release,postFlightDuty):d.release;
    const n=d.activatedStandby
      ? overlapNight((d.activationStart||d.standbyEnd),nightEnd)
      : (d.standby?0:overlapNight(d.report,nightEnd));

    duty+=credit; night+=n;
    rows.push({day:d.day,report:d.report,release:d.release,duty:hhmm(credit),night:hhmm(n),sectors:d.sectors});
  }
  return {duty:hhmm(duty),night:hhmm(night),rows};
}

const expected={
  July:{duty:'145:18',night:'20:33'},
  August:{duty:'137:33',night:'11:13'},
  September:{duty:'111:03',night:'09:05'}
};
const output={};
for(const [month,cells] of Object.entries(sets)){
  output[month]=totals(cells);
  if(output[month].duty!==expected[month].duty) throw new Error(month+' duty '+output[month].duty);
  if(output[month].night!==expected[month].night) throw new Error(month+' night '+output[month].night);
}

// Critical specific duties:
const a30=output.August.rows.find(r=>r.day===30);
if(!a30 || a30.report!=='03:30' || a30.release!=='16:54' || a30.duty!=='11:50' || a30.sectors!==1)
  throw new Error('August 30 regression failed '+JSON.stringify(a30));
const s22=output.September.rows.find(r=>r.day===22);
const s23=output.September.rows.find(r=>r.day===23);
if(!s22 || s22.release!=='00:25' || s22.duty!=='05:25' || s22.sectors!==2)
  throw new Error('Sep22 regression failed');
if(!s23 || s23.duty!=='02:00' || s23.sectors!==0)
  throw new Error('Sep23 regression failed');
const j31=output.July.rows.find(r=>r.day===31);
if(!j31 || j31.duty!=='02:30' || j31.sectors!==0)
  throw new Error('Jul31 bleed regression failed '+JSON.stringify(j31));

console.log(JSON.stringify({
  July:{duty:output.July.duty,night:output.July.night},
  August:{duty:output.August.duty,night:output.August.night,a30},
  September:{duty:output.September.duty,night:output.September.night,s22,s23},
  July31:j31
},null,2));
console.log('THREE-MONTH REGRESSION PASS');
