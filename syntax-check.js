
const $ = id => document.getElementById(id);
const file = $('pdfFile'), btn = $('parseBtn');
let pdfjs = null, activeDuties = [], activeCells = [];

const palette = {
  base:'#6ea8fe', duty:'#74f0d6', night:'#9b8cff', tri:'#f5c56d', sector:'#ff8fb1', lay:'#d1d9ea', off:'#f59e0b'
};

file.addEventListener('change', ()=>{
  btn.disabled = !file.files.length;
  $('status').textContent = file.files.length ? 'PDF hazır. “PDF’yi oku”ya bas.' : 'PDF seçince okuma aktif olacak.';
});

const pad=n=>String(n).padStart(2,'0');
const toH=s=>{ const m=String(s||'').match(/(\d{1,3}):(\d{2})/); return m ? Number(m[1]) + Number(m[2])/60 : null; };
const hhmm=h=>{ let m=Math.round(h*60); return pad(Math.floor(m/60))+':'+pad((m%60+60)%60); };
const dur=(a,b)=>{ let s=toH(a), e=toH(b); if(s==null||e==null) return 0; if(e<s) e+=24; return e-s; };
const overlapNight=(a,b)=>{
  let s=toH(a), e=toH(b); if(s==null||e==null) return 0; if(e<s) e+=24;
  let total=0;
  for(let d=-1; d<=1; d++){ const ns=1+24*d, ne=6+24*d; total += Math.max(0, Math.min(e, ne)-Math.max(s, ns)); }
  return total;
};
const addHoursToHHMM=(t,h)=>{
  let v=toH(t); if(v==null) return t;
  v=(v+h)%24;
  const mins=Math.round(v*60)%1440;
  return pad(Math.floor(mins/60))+':'+pad(mins%60);
};
const eur=v=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'EUR',minimumFractionDigits:2}).format(v);
const tl=v=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(v);

function groupLines(items){
  const lines=[];
  items.sort((a,b)=>b.y-a.y||a.x-b.x);
  for(const it of items){
    let l=lines.find(x=>Math.abs(x.y-it.y)<2.2);
    if(!l){ l={y:it.y,items:[]}; lines.push(l); }
    l.items.push(it);
  }
  return lines.sort((a,b)=>b.y-a.y).map(l => l.items.sort((a,b)=>a.x-b.x).map(i=>i.str).join(' ').replace(/\s+/g,' ').trim());
}

function parseCell(day, lines){
  const text=lines.join(' | ');
  const events=[];
  const times=s=>[...String(s||'').matchAll(/(\d{1,2}:\d{2})/g)].map(m=>m[1]);

  // Keep the visual top-to-bottom order inside each calendar cell.
  // This is the key difference from the old parser: we do NOT collapse a day
  // into one Report / one Release / one sector count.
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    const lineEvents=[];

    const reportMatch=line.match(/Report\s*(\d{1,2}:\d{2})/i);
    if(reportMatch){
      lineEvents.push({
        type:'report', time:reportMatch[1],
        pos:Math.max(0,line.search(/Report/i)), raw:line, lineIndex:i
      });
    }

    const sectorMatch=line.match(/(XQ\d+)/i);
    if(sectorMatch){
      let ts=times(line);
      // A sector can wrap onto the following "~ HH:MM ..." line.
      for(let j=i+1;j<Math.min(lines.length,i+3)&&ts.length<2;j++){
        if(!/^\s*~/.test(lines[j])) break;
        ts=ts.concat(times(lines[j]));
      }
      lineEvents.push({
        type:'sector', flightNo:sectorMatch[1].toUpperCase(), times:ts,
        pos:Math.max(0,line.search(/XQ\d+/i)), raw:line, lineIndex:i
      });
    }

    // DH may appear as "DH TZX..." or visually joined as "DHTZX...".
    const dhPos=line.search(/(^|\s)DH(?=\s|[A-Z])/i);
    if(dhPos>=0){
      let ts=times(line);
      for(let j=i+1;j<Math.min(lines.length,i+3)&&ts.length<2;j++){
        if(!/^\s*~/.test(lines[j])) break;
        ts=ts.concat(times(lines[j]));
      }
      lineEvents.push({
        type:'dh', times:ts, pos:dhPos, raw:line, lineIndex:i
      });
    }

    const sbPos=line.search(/SB(?:1|2|3|4|5|-PF)/i);
    if(sbPos>=0){
      let ts=times(line);
      for(let j=i+1;j<Math.min(lines.length,i+3)&&ts.length<2;j++){
        if(!/^\s*~/.test(lines[j])) break;
        ts=ts.concat(times(lines[j]));
      }
      lineEvents.push({
        type:'standby', times:ts, pos:sbPos, raw:line, lineIndex:i
      });
    }

    const simPos=line.search(/BOEING-[A-Z]/i);
    if(simPos>=0){
      let ts=times(line);
      for(let j=i+1;j<Math.min(lines.length,i+4)&&ts.length<2;j++){
        if(!/^\s*~/.test(lines[j]) && !/BOEING/i.test(lines[j])) break;
        ts=ts.concat(times(lines[j]));
      }
      lineEvents.push({
        type:'sim', times:ts, pos:simPos, raw:line, lineIndex:i
      });
    }

    const releaseMatch=line.match(/Release\s*(\d{1,2}:\d{2})/i);
    if(releaseMatch){
      lineEvents.push({
        type:'release', time:releaseMatch[1],
        pos:Math.max(0,line.search(/Release/i)), raw:line, lineIndex:i
      });
    }

    // Normally there is one event per visual line, but sorting by text position
    // makes mixed lines deterministic too.
    lineEvents.sort((a,b)=>a.pos-b.pos);
    events.push(...lineEvents);
  }

  const codes=[...text.matchAll(/\b([A-Z]{3})\b/g)].map(m=>m[1])
    .filter(c=>!['OFF','SIM'].includes(c));

  return {day, lines, text, events, codes};
}

function pair(cells){
  const out=[];
  let open=null;
  let pendingActivationRelease='';

  const startDuty=(day,time)=>({
    day,
    report:time,
    release:'',
    standby:false,
    standbyEnd:'',
    activationStart:'',
    standbySeen:false,
    hasDH:false,
    simExtra:0,
    simSessions:0,
    sectorRecords:{},
    sectors:0,
    plannedFlight:0,
    lines:[],
    codes:[]
  });

  const absorb=(d,e)=>{
    if(!d) return;

    if(e.type==='sector'){
      const key=e.flightNo;
      if(!d.sectorRecords[key]) d.sectorRecords[key]=[];
      for(const t of (e.times||[])){
        if(!d.sectorRecords[key].includes(t)) d.sectorRecords[key].push(t);
      }
    } else if(e.type==='dh'){
      d.hasDH=true;
    } else if(e.type==='standby'){
      d.standby=true;
      const ts=e.times||[];
      if(ts.length>=2){
        d.standbyEnd=ts[ts.length-1];
      } else if(ts.length===1 && d.standbySeen){
        // Overnight continuation of a standby line.
        d.standbyEnd=ts[0];
      }
      d.standbySeen=true;
    } else if(e.type==='sim'){
      d.simSessions += 1;
      const ts=e.times||[];
      if(ts.length>=2) d.simExtra += dur(ts[0],ts[ts.length-1]);
    }

    if(e.raw) d.lines.push(e.raw);
  };

  const finishDuty=(d,release)=>{
    d.release=release||'';

    const sectorKeys=Object.keys(d.sectorRecords);
    d.sectors=sectorKeys.length;

    let pf=0;
    for(const key of sectorKeys){
      const ts=d.sectorRecords[key];
      if(ts.length>=2) pf += dur(ts[0],ts[ts.length-1]);
    }
    d.plannedFlight=pf;
    d.dhFlightComposite=!!(d.hasDH && d.sectors>0);

    delete d.sectorRecords;
    delete d.standbySeen;
    return d;
  };

  // Process every calendar cell, then every event in its visual order.
  // Example 23 Sep:
  // XQ9239 continuation -> Release 00:25 -> Report 13:00 -> SB3 -> Release 21:00.
  // The first two events belong to the duty opened on 22 Sep; the later Report
  // opens a completely separate standby duty.
  for(const c of cells){
    const parsed=(c.events ? c : parseCell(c.day,c.lines));

    for(const e of parsed.events){
      if(e.type==='report'){
        // If standby is activated exactly when the standby window ends, keep the
        // original duty open. This Report marks the start of 100% active duty.
        if(open && open.standby && open.standbyEnd && e.time===open.standbyEnd){
          open.activationStart=e.time;
          pendingActivationRelease=e.time;
          if(e.raw) open.lines.push(e.raw);
          continue;
        }

        if(open){
          out.push(finishDuty(open,''));
          pendingActivationRelease='';
        }
        open=startDuty(parsed.day,e.time);
        open.codes.push(...(parsed.codes||[]));
        if(e.raw) open.lines.push(e.raw);
        continue;
      }

      if(e.type==='release'){
        // The Release at the exact activation time is only the standby boundary.
        // It must NOT close the duty. The later final Release after DH/flight closes it.
        if(open && pendingActivationRelease && e.time===pendingActivationRelease){
          pendingActivationRelease='';
          if(e.raw) open.lines.push(e.raw);
          continue;
        }

        if(open){
          out.push(finishDuty(open,e.time));
          open=null;
        }
        continue;
      }

      if(open) absorb(open,e);
    }
  }

  if(open) out.push(finishDuty(open,''));
  return out;
}

async function extractPdf(f){
  if(!pdfjs){
    $('status').textContent='PDF okuyucu hazırlanıyor…';
    pdfjs = window.pdfjsLib;
    if(!pdfjs) throw new Error('PDF.js yüklenemedi. İnternet bağlantısını kontrol et.');
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  const data=new Uint8Array(await f.arrayBuffer());
  const doc=await pdfjs.getDocument({data}).promise;
  const cells=[];
  let allText='';

  function cluster(vals, tol){
    const groups=[];
    for(const v of vals.sort((a,b)=>a-b)){
      let g=groups.find(x=>Math.abs(x.center-v)<tol);
      if(!g){ g={vals:[v],center:v}; groups.push(g); }
      else { g.vals.push(v); g.center=g.vals.reduce((a,b)=>a+b,0)/g.vals.length; }
    }
    return groups.sort((a,b)=>a.center-b.center).map(g=>g.center);
  }

  for(let p=1;p<=doc.numPages;p++){
    const page=await doc.getPage(p), tc=await page.getTextContent();
    const items=tc.items
      .filter(i=>i.str&&i.str.trim())
      .map(i=>({str:i.str.trim(),x:i.transform[4],y:i.transform[5],h:Math.abs(i.transform[3])}));

    allText += ' ' + items.map(i=>i.str).join(' ');

    const headers=items
      .filter(i=>/^([1-9]|[12]\d|3[01])$/.test(i.str)&&i.h>10)
      .map(i=>({...i,day:Number(i.str)}));

    if(!headers.length) continue;

    const ys=cluster(headers.map(h=>h.y),5).sort((a,b)=>b-a);
    const viewport=page.getViewport({scale:1});

    // The roster is a fixed seven-column calendar. Do not derive column
    // boundaries from the number text itself: labels such as "Aug. 1" shift
    // the x-position of the number and can make adjacent month cells bleed.
    const calendarLeft=8;
    const calendarRight=viewport.width-8;
    const colWidth=(calendarRight-calendarLeft)/7;

    for(let row=0;row<ys.length;row++){
      const rowHeaders=headers
        .filter(h=>Math.abs(h.y-ys[row])<5)
        .sort((a,b)=>a.x-b.x);

      rowHeaders.forEach((h,col)=>{
        const left=calendarLeft+col*colWidth;
        const right=calendarLeft+(col+1)*colWidth;
        const top=ys[row]+5;
        const bottom=row<ys.length-1 ? ys[row+1]+5 : Number.NEGATIVE_INFINITY;

        const cellItems=items.filter(it =>
          it !== h &&
          it.x >= left && it.x < right &&
          it.y <= top && it.y > bottom
        );

        cells.push({page:p,row,col,day:h.day,lines:groupLines(cellItems)});
      });
    }
  }

  cells.sort((a,b)=>a.page-b.page||a.row-b.row||a.col-b.col);

  // Determine roster month and take exactly that calendar month's day cells.
  const monthNames={
    january:0,february:1,march:2,april:3,may:4,june:5,
    july:6,august:7,september:8,october:9,november:10,december:11
  };
  let year=null, month=null;
  const lower=allText.toLowerCase();
  for(const [name,idx] of Object.entries(monthNames)){
    const m=lower.match(new RegExp(name+'\\s+(20\\d{2})'));
    if(m){ month=idx; year=Number(m[1]); break; }
  }

  let first=cells.findIndex(c=>c.day===1);
  if(first<0) first=0;

  if(year!=null && month!=null){
    const daysInMonth=new Date(year,month+1,0).getDate();
    return cells.slice(first, first+daysInMonth);
  }
  return cells.slice(first);
}
function renderType(d){
  let tag='Duty', cls='';
  if(d.activatedStandby){ tag='STBY → Duty'; cls='stby'; }
  else if(d.standby){ tag='STBY'; cls='stby'; }
  else if((d.simSessions||0)>0){ tag='SIM'; cls='sim'; }
  if(d.training) return `<span class="tag train">${tag} · Eğitim</span>`;
  return `<span class="tag ${cls}">${tag}</span>`;
}

const TURKEY_IATA = new Set([
  'ADB','AYT','IST','SAW','ESB','ADA','GZT','DIY','TZX','SZF','KYA','ASR','DLM','BJV','VAN','ERZ',
  'HTY','GNY','MQM','EDO','KCM','MLX','NAV','VAS','DNZ','KZR','OGU','RZV','BAL','BZI','CKZ','USQ',
  'AFY','AJI','BGG','CII','IGD','ISE','KSY','MSR','NOP','ONQ','TEQ','AJI'
]);

function cellText(c){ return (c.lines||[]).join(' '); }

function inferHotelStation(c){
  // First trust station resolved from Hotel-specific parsing.
  for(const h of (c.hotels||[])){
    if(h.station && h.station!=='ADB') return h.station;
  }

  const lines=c.lines||[];

  // Hotel-adjacent operational location is more reliable than DH/Travel transfer airport.
  for(const line of lines){
    let m=line.match(/\bHotel\s+([A-Z]{3})\b/i);
    if(m && m[1]!=='ADB') return m[1];
  }
  for(const line of lines){
    let m=line.match(/\bTransit\s+([A-Z]{3})\b/i);
    if(m && m[1]!=='ADB') return m[1];
  }
  for(const line of lines){
    let m=line.match(/\b(?:Report|Release)\s+\d{1,2}:\d{2}\s+([A-Z]{3})\b/i);
    if(m && m[1]!=='ADB') return m[1];
  }
  for(const line of lines){
    let m=line.match(/\bBOEING-[A-Z]\s+([A-Z]{3})\b/i);
    if(m && m[1]!=='ADB') return m[1];
  }

  // Deliberately do NOT fall back to arbitrary DH/Travel airport.
  return '';
}
function findOutboundTime(cells, hotelDay, station){
  // Same day first, then one day before (DXB trip starts the previous evening).
  const candidates=cells.filter(c=>c.day===hotelDay || c.day===hotelDay-1).sort((a,b)=>a.day-b.day);
  for(const c of candidates){
    for(const line of (c.lines||[])){
      // Any operated/DH departure from ADB.
      const m=line.match(/\b(?:XQ\d+|DH)\s+ADB\s+(\d{1,2}:\d{2})/i);
      if(m) return {day:c.day,time:m[1]};
    }
  }
  return {day:hotelDay,time:''};
}

function findReturn(cells, hotelDay, station){
  // Search hotel day and next two days for a duty ending back at ADB.
  const candidates=cells.filter(c=>c.day>=hotelDay && c.day<=hotelDay+2).sort((a,b)=>a.day-b.day);
  for(const c of candidates){
    const txt=cellText(c);
    const rel=(txt.match(/Release\s+(\d{1,2}:\d{2})\s+ADB/i)||[])[1];
    if(rel) return {day:c.day,time:rel};
    // Fallback: release time on a day containing a return-to-ADB sector.
    if(/\~\s*\d{1,2}:\d{2}\s+ADB\b/i.test(txt)){
      const r=(txt.match(/Release\s+(\d{1,2}:\d{2})/i)||[])[1];
      if(r) return {day:c.day,time:r};
    }
  }
  return {day:hotelDay,time:''};
}

function detectLayovers(cells){
  const hotelCells=cells.filter(c=>(c.hotels||[]).length || /\bHotel\b/i.test(cellText(c)));

  // First collect hotel markers. Multiple "Hotel" lines belonging to the same
  // overnight rest can occur in two adjacent calendar cells; merge them.
  const markers=[];
  for(const c of hotelCells){
    const station=inferHotelStation(c);
    if(!station) continue;
    markers.push({station,day:c.day});
  }
  markers.sort((a,b)=>a.day-b.day || a.station.localeCompare(b.station));

  const groups=[];
  for(const m of markers){
    const prev=groups[groups.length-1];
    if(prev && prev.station===m.station && m.day<=prev.lastHotelDay+1){
      prev.lastHotelDay=Math.max(prev.lastHotelDay,m.day);
      if(!prev.hotelDays.includes(m.day)) prev.hotelDays.push(m.day);
    }else{
      groups.push({station:m.station,firstHotelDay:m.day,lastHotelDay:m.day,hotelDays:[m.day]});
    }
  }

  let stays=groups.map(g=>{
    const out=findOutboundTime(cells,g.firstHotelDay,g.station);
    const ret=findReturn(cells,g.lastHotelDay,g.station);

    const startDay=out.day;
    const endDay=ret.day;
    const startH=toH(out.time);
    const endH=toH(ret.time);

    let equivalentDays=0;
    if(startDay===endDay){
      equivalentDays=(startH!=null && startH<14 && endH!=null && endH>14)?1:0.5;
    }else{
      // Departure day: full only if leaving base before 14:00 local.
      if(startH!=null && startH<14) equivalentDays+=1;

      // Calendar days fully spent away from base.
      equivalentDays+=Math.max(0,endDay-startDay-1);

      // Return day: <=14:00 half, >14:00 full.
      if(endH!=null) equivalentDays+=endH<=14?0.5:1;
      else equivalentDays+=0.5;
    }

    return {
      station:g.station,
      domestic:TURKEY_IATA.has(g.station),
      startDay,endDay,startTime:out.time,endTime:ret.time,
      days:equivalentDays
    };
  });

  // Deduplicate overlapping/identical stays created by split Hotel text.
  // Same station + overlapping trip window = one physical layover.
  stays.sort((a,b)=>a.startDay-b.startDay || a.endDay-b.endDay);
  const dedup=[];
  for(const s of stays){
    const same=dedup.find(x =>
      x.station===s.station &&
      s.startDay<=x.endDay &&
      s.endDay>=x.startDay
    );
    if(!same){
      dedup.push({...s});
    }else{
      // Keep the widest interval, never add the days twice.
      same.startDay=Math.min(same.startDay,s.startDay);
      same.endDay=Math.max(same.endDay,s.endDay);
      if(!same.startTime && s.startTime) same.startTime=s.startTime;
      if(!same.endTime && s.endTime) same.endTime=s.endTime;
      same.days=Math.max(same.days,s.days);
    }
  }

  return dedup;
}
function applyLayovers(cells){
  const stays=detectLayovers(cells);
  let domEq=0,intEq=0;
  stays.forEach(s=>{ if(s.domestic) domEq+=s.days; else intEq+=s.days; });

  // Convert equivalent days into full-day and half-day unit inputs.
  const domFull=Math.floor(domEq), domHalf=Math.round((domEq-domFull)*2);
  const intFull=Math.floor(intEq), intHalf=Math.round((intEq-intFull)*2);

  $('domFull').value=domFull;
  $('domHalf').value=domHalf;
  $('intFull').value=intFull;
  $('intHalf').value=intHalf;

  const autoLayEuro=domEq*30+intEq*50;
  $('hotelAutoSummary').textContent = stays.length
    ? `İç hat ${domEq.toFixed(1).replace('.',',')} gün · Dış hat ${intEq.toFixed(1).replace('.',',')} gün · ${eur(autoLayEuro)}`
    : 'Hotel kaydı bulunamadı.';

  $('hotelAutoCards').innerHTML = stays.map(s=>`
    <div class="earn-card">
      <div class="x">${s.domestic?'İç hat':'Dış hat'} yatı</div>
      <div class="y">${s.station} · ${String(s.days).replace('.',',')} gün</div>
      <div class="x">${s.startDay}. gün ${s.startTime||'—'} → ${s.endDay}. gün ${s.endTime||'—'}</div>
    </div>
  `).join('');

  return stays;
}

function recalc(){
  const training=new Set($('trainingDays').value.split(',').map(x=>Number(x.trim())).filter(Boolean));
  const instructorMode=($('instructorMode')?.value||'yes')==='yes';
  let duty=0, night=0, sectors=0, tri=0;

  activeDuties.forEach(d=>{
    const base=dur(d.report,d.release);
    const hasFlightSectors=(d.sectors||0)>0;
    const hasActiveDuty=hasFlightSectors || !!d.hasDH || (d.simSessions||0)>0;
    const postFlightDuty=hasActiveDuty ? 0.5 : 0;

    // DUTY RULES V6.4 (event-based / CAE-aligned)
    // Flight / DH / SIM: FIRST Report -> FINAL Release + 00:30 post-flight.
    // DH + operating flight is one continuous duty whether DH is before or after the flight.
    // The +00:30 is added ONCE at the end of that full duty.
    // Standby-only: %25.
    // Activated standby: standby section %25 + active section %100 + 00:30 post-flight.
    if(d.standby && hasActiveDuty && (d.activationStart||d.standbyEnd)){
      const activation=d.activationStart||d.standbyEnd;
      const standbyPart=dur(d.report,activation)*0.25;
      const activePart=dur(activation,d.release);
      d.credit=standbyPart + activePart + 0.5;
      d.activatedStandby=true;
      d.standbyCredit=standbyPart;
      d.activeCredit=activePart;
    } else if(d.standby){
      d.credit=base*0.25;
      d.activatedStandby=false;
      d.standbyCredit=d.credit;
      d.activeCredit=0;
    } else {
      d.credit=base + postFlightDuty;
      d.activatedStandby=false;
      d.standbyCredit=0;
      d.activeCredit=base;
    }
    // Night pay is 01:00–06:00. Post-flight duty is duty time too.
    // Use the local value immediately so the FIRST calculation after PDF load
    // already includes post-flight Night; do not depend on a previous recalc().
    d.postFlightDuty=postFlightDuty;
    const nightEnd = postFlightDuty ? addHoursToHHMM(d.release,postFlightDuty) : d.release;
    d.night = d.activatedStandby
      ? overlapNight((d.activationStart||d.standbyEnd),nightEnd)
      : (d.standby ? 0 : overlapNight(d.report,nightEnd));
    d.extra=Math.max(0,d.sectors-2);
    d.training=training.has(d.day);

    duty += d.credit;
    night += d.night;
    sectors += d.extra;

    if(instructorMode && d.training){
      // SIM training: +6:00 TRI instructor credit per SIM session.
      // This affects TRI pay only. SIM duty itself stays Report -> Release.
      if((d.simSessions||0)>0) tri += (d.simSessions||0)*6;
      else tri += d.plannedFlight;
    }
  });

  $('dutyEdit').value=hhmm(duty);
  $('nightEdit').value=hhmm(night);
  $('sectorEdit').value=sectors;
  $('triEdit').value=hhmm(tri);

  $('dutyShow').textContent=hhmm(duty);
  $('nightShow').textContent=hhmm(night);
  $('sectorShow').textContent=String(sectors);
  $('triShow').textContent=hhmm(tri);

  $('dutyProgText').textContent = duty>100 ? '100 saat aşıldı' : `${hhmm(duty)} / 100:00`;
  $('triProgText').textContent = tri>12 ? '12 saat aşıldı' : `${hhmm(tri)} / 12:00`;
  $('dutyProg').style.width=`${Math.min(100,(duty/100)*100)}%`;
  $('triProg').style.width=`${Math.min(100,(tri/12)*100)}%`;
  const dutyHighHours=Math.max(0,duty-100);
  const triExtraHours=Math.max(0,tri-12);
  $('dutyExtraText').textContent = dutyHighHours>0
    ? `${hhmm(dutyHighHours)} saat · 52,80 €/saat tarifeden`
    : `${hhmm(Math.max(0,100-duty))} saat sonra yüksek tarifeye geçer`;
  $('triExtraText').textContent = triExtraHours>0
    ? `${hhmm(triExtraHours)} saat · 35 €/saat ekstra TRI`
    : `${hhmm(Math.max(0,12-tri))} saat TRI baz ücret içinde kaldı`;


  const stays=applyLayovers(activeCells);
  const hotelStations=[...new Set(stays.map(s=>s.station))];
  $('hotelInfo').textContent = hotelStations.length
    ? `Bulunan yatı istasyonları: ${hotelStations.join(', ')}`
    : 'Hotel/yatı istasyonu otomatik bulunamadı.';

  $('rows').innerHTML=activeDuties.map(d=>`
    <tr>
      <td>${d.day}</td>
      <td>${d.report||'—'}</td>
      <td>${d.release||'—'}</td>
      <td>${renderType(d)}</td>
      <td>${hhmm(d.credit)}${
        d.activatedStandby
          ? ` <span class="muted-note">(SB %25 + aktif duty +00:30)</span>`
          : (d.dhFlightComposite
              ? ' <span class="muted-note">(ilk Report → son Release +00:30)</span>'
              : (d.postFlightDuty ? ' <span class="muted-note">(+00:30 post-flight)</span>' : ''))
      }</td>
      <td>${hhmm(d.night)}</td>
      <td>${d.sectors}</td>
      <td class="tri-col">${(d.training && (d.simSessions||0)>0) ? hhmm((d.simSessions||0)*6) : '—'}</td>
    </tr>
  `).join('');

  calcPay();
}

function buildDonut(parts, total){
  let acc=0;
  const segs = parts.map(([k,v,c]) => {
    const start=(acc/total)*100;
    acc += v;
    const end=(acc/total)*100;
    return `${c} ${start}% ${end}%`;
  });
  $('donut').style.background = `conic-gradient(${segs.join(', ')})`;
  $('donutTotal').textContent = eur(total);

  $('legend').innerHTML = parts.map(([k,v,c]) => `
    <div class="legend-item">
      <div class="legend-left"><span class="sw" style="background:${c}"></span><span>${k}</span></div>
      <strong>${eur(v)}</strong>
    </div>
  `).join('');
}

function calcPay(){
  const duty=toH($('dutyEdit').value)||0;
  const night=toH($('nightEdit').value)||0;
  const tri=toH($('triEdit').value)||0;
  const sectors=Math.max(0, Number($('sectorEdit').value)||0);
  const fx=Math.max(0, Number(String($('fx').value).replace(',','.'))||0);

  const base=Number($('senioritySelect')?.value)||6490;
  const instructorMode=($('instructorMode')?.value||'yes')==='yes';
  const triBase=instructorMode ? 378 : 0;
  const offToDutyCount=Math.max(0, Math.floor(Number($('offToDutyCount')?.value)||0));
  const offToDutyPay=offToDutyCount*330;
  const dutyPay=Math.min(duty,100)*28.6 + Math.max(0,duty-100)*52.8;
  const nightPay=night*71.3;
  const sectorPay=sectors*17.9;
  const triPay=instructorMode ? (triBase + Math.max(0,tri-12)*35) : 0;
  const lay=(Number($('domFull').value)||0)*30 + (Number($('domHalf').value)||0)*15 + (Number($('intFull').value)||0)*50 + (Number($('intHalf').value)||0)*25;
  const total=base+dutyPay+nightPay+triPay+sectorPay+lay + offToDutyPay;

  $('totalTl').textContent=tl(total*fx);
  $('totalEur').textContent=eur(total);

  const items = [
    ['Baz maaş', base, palette.base],
    ['Duty', dutyPay, palette.duty],
    ['Night', nightPay, palette.night],
    ['Sektör', sectorPay, palette.sector],
    ['Yatı', lay, palette.lay],
  ];
  if(instructorMode){
    items.splice(3,0,['TRI', triPay, palette.tri]);
  }
  if(offToDutyCount > 0){
    items.push(['Off to Duty', offToDutyPay, palette.off]);
  }

  $('breakdown').innerHTML = items.map(([k,v,c]) => `
    <div class="earn-card">
      <div class="x">${k}</div>
      <div class="y">${eur(v)}</div>
    </div>
  `).join('');

  buildDonut(items, total);
}

btn.addEventListener('click', async ()=>{
  if(!file.files[0]) return;
  try{
    btn.disabled=true;
    $('status').textContent='PDF okunuyor…';
    activeCells = await extractPdf(file.files[0]);
    activeDuties = pair(activeCells.map(c=>parseCell(c.day,c.lines)));
    if(!activeDuties.length) throw new Error('Report/Release görevleri bulunamadı');
    $('results').style.display='block';
    recalc();
    $('status').textContent='V6.4 ACTIVE · 3-month regression tested · PDF okundu · Görev '+activeDuties.length+' · SIM eğitim credit '+hhmm(activeDuties.reduce((s,d)=>s+((d.training&&d.simSessions)?d.simSessions*6:0),0))+' · TRI toplam '+$('triEdit').value+' · Yatı '+$('hotelAutoSummary').textContent;
  }catch(e){
    $('status').textContent='PDF okunamadı: '+e.message;
  }finally{
    btn.disabled=false;
  }
});

['trainingDays'].forEach(id => $(id).addEventListener('input', ()=>activeDuties.length && recalc()));
['dutyEdit','nightEdit','sectorEdit','triEdit','domFull','domHalf','intFull','intHalf','fx'].forEach(id => $(id).addEventListener('input', calcPay));



if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(()=>{});
}
if ('caches' in window) {
  caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k)))).catch(()=>{});
}


const senioritySelect=$('senioritySelect');
if(senioritySelect){
  senioritySelect.addEventListener('change',()=>calcPay());
}


const offToDutyCountInput=$('offToDutyCount');
if(offToDutyCountInput){
  offToDutyCountInput.addEventListener('input',()=>calcPay());
  offToDutyCountInput.addEventListener('change',()=>calcPay());
}


function applyInstructorMode(){
  const yes=($('instructorMode')?.value||'yes')==='yes';
  ['triKpi','triProgressWrap','triManualField'].forEach(id=>{
    const el=$(id); if(el) el.classList.toggle('tri-hidden', !yes);
  });
  document.querySelectorAll('.tri-col').forEach(el=>el.classList.toggle('tri-hidden', !yes));
  if(!yes){
    if($('triEdit')) $('triEdit').value='00:00';
    if($('triShow')) $('triShow').textContent='00:00';
  } else if(activeDuties.length){
    recalc();
    return;
  }
  calcPay();
}

document.querySelectorAll('#instructorToggle .seg-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('#instructorToggle .seg-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    $('instructorMode').value=btn.dataset.value;
    applyInstructorMode();
  });
});
applyInstructorMode();

