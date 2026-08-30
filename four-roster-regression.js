
const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const sets=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));

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
    const hasFlight=(d.sectors||0)>0;
    const active=hasFlight||!!d.hasDH||(d.simSessions||0)>0;
    const post=active?0.5:0;
    let credit,activated=false;
    if(d.standby&&active&&(d.activationStart||d.standbyEnd)){
      const a=d.activationStart||d.standbyEnd;
      credit=dur(d.report,a)*0.25+dur(a,d.release)+0.5;
      activated=true;
    } else if(d.standby) credit=base*0.25;
    else credit=base+post;

    const nightEnd=post?addHoursToHHMM(d.release,post):d.release;
    const n=activated
      ? overlapNight((d.activationStart||d.standbyEnd),nightEnd)
      : (d.standby?0:overlapNight(d.report,nightEnd));

    duty+=credit; night+=n;
    rows.push({day:d.day,report:d.report,release:d.release,duty:hhmm(credit),night:hhmm(n),sectors:d.sectors});
  }
  return {duty:hhmm(duty),night:hhmm(night),rows};
}

const expected={
  July:['145:18','20:33'],
  August:['137:33','11:13'],
  September:['111:03','09:05'],
  Caglar:['112:22','21:46']
};

const out={};
for(const [name,cells] of Object.entries(sets)){
  out[name]=totals(cells);
  if(out[name].duty!==expected[name][0] || out[name].night!==expected[name][1]){
    throw new Error(name+' expected '+expected[name].join('/')+' got '+out[name].duty+'/'+out[name].night);
  }
}

const c1=out.Caglar.rows.find(r=>r.day===1);
if(!c1 || c1.report!=='10:40' || c1.release!=='16:02' || c1.duty!=='05:52'){
  throw new Error('Caglar Aug1 month-boundary regression '+JSON.stringify(c1));
}
const a30=out.August.rows.find(r=>r.day===30);
if(!a30 || a30.report!=='03:30' || a30.release!=='16:54' || a30.duty!=='11:50' || a30.sectors!==1){
  throw new Error('Aug30 activated standby regression '+JSON.stringify(a30));
}
const s22=out.September.rows.find(r=>r.day===22);
const s23=out.September.rows.find(r=>r.day===23);
if(!s22 || s22.release!=='00:25' || s22.duty!=='05:25' || s22.sectors!==2) throw new Error('Sep22');
if(!s23 || s23.duty!=='02:00' || s23.sectors!==0) throw new Error('Sep23');

console.log(JSON.stringify({
  July:{duty:out.July.duty,night:out.July.night},
  August:{duty:out.August.duty,night:out.August.night,a30},
  September:{duty:out.September.duty,night:out.September.night,s22,s23},
  Caglar:{duty:out.Caglar.duty,night:out.Caglar.night,day1:c1}
},null,2));
console.log('FOUR-ROSTER BROWSER-LIKE REGRESSION PASS');
