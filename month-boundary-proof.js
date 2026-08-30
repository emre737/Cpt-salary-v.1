
const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const cells=JSON.parse(fs.readFileSync(process.argv[3],'utf8')).Caglar;
function between(a,b){const s=html.indexOf(a),e=html.indexOf(b,s);return html.slice(s,e);}
const pad=n=>String(n).padStart(2,'0');
const toH=s=>{const m=String(s||'').match(/(\d{1,3}):(\d{2})/);return m?Number(m[1])+Number(m[2])/60:null;};
const hhmm=h=>{let m=Math.round(h*60);return pad(Math.floor(m/60))+':'+pad((m%60+60)%60);};
const dur=(a,b)=>{let s=toH(a),e=toH(b);if(e<s)e+=24;return e-s;};
const overlapNight=(a,b)=>{let s=toH(a),e=toH(b);if(e<s)e+=24;let t=0;for(let d=-1;d<=1;d++){const ns=1+24*d,ne=6+24*d;t+=Math.max(0,Math.min(e,ne)-Math.max(s,ns));}return t;};
const addHoursToHHMM=(t,h)=>{let v=toH(t);v=(v+h)%24;const m=Math.round(v*60)%1440;return pad(Math.floor(m/60))+':'+pad(m%60);};
eval(between('function parseCell(day, lines){','\n\nfunction pair(cells){'));
eval(between('function pair(cells){','\n\nasync function extractPdf'));
const ds=pair(cells.map(c=>parseCell(c.day,c.lines)));
let D=0,N=0;
for(const d of ds){
 const base=dur(d.report,d.release), active=(d.sectors||0)>0||d.hasDH||(d.simSessions||0)>0, post=active?.5:0;
 let cr,activated=false;
 if(d.standby&&active&&(d.activationStart||d.standbyEnd)){const a=d.activationStart||d.standbyEnd;cr=dur(d.report,a)*.25+dur(a,d.release)+.5;activated=true;}
 else if(d.standby)cr=base*.25;else cr=base+post;
 const ne=post?addHoursToHHMM(d.release,post):d.release;
 const n=activated?overlapNight((d.activationStart||d.standbyEnd),ne):(d.standby?0:overlapNight(d.report,ne));
 D+=cr;N+=n;
}
console.log(hhmm(D)+' / '+hhmm(N));
