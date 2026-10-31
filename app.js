const STORAGE_KEY = 'moje-godziny-v2';
const MONTHS = ['styczeń','luty','marzec','kwiecień','maj','czerwiec','lipiec','sierpień','wrzesień','październik','listopad','grudzień'];
const WEEKDAYS = ['Pn','Wt','Śr','Cz','Pt','So','Nd'];
const $ = (id) => document.getElementById(id);
let state = loadState();
let shown = new Date(); shown = new Date(shown.getFullYear(), shown.getMonth(), 1);
let installPrompt = null;

function loadState() {
  try { const saved=JSON.parse(localStorage.getItem(STORAGE_KEY))||{};return {salary:saved.salary??'',hours:saved.hours||{},types:saved.types||{},leaveAllowance:saved.leaveAllowance||{}}; }
  catch { return { salary: '', hours: {}, types: {}, leaveAllowance: {} }; }
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); $('save-status').innerHTML = '<i></i>Zapisano na tym urządzeniu'; }
  catch { $('save-status').textContent = 'Nie udało się zapisać'; }
}
function pad(n) { return String(n).padStart(2, '0'); }
function dateKey(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
function easterSunday(year) {
  const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,n=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*n+114)/31),day=((h+l-7*n+114)%31)+1;
  return new Date(year, month - 1, day);
}
function holidays(year) {
  const fixed=[['01-01','Nowy Rok'],['01-06','Trzech Króli'],['05-01','Święto Pracy'],['05-03','Święto Konstytucji'],['08-15','Wniebowzięcie'],['11-01','Wszystkich Świętych'],['11-11','Niepodległości'],['12-25','Boże Narodzenie'],['12-26','Drugi dzień świąt']];
  if (year >= 2025) fixed.push(['12-24','Wigilia']);
  const set = new Map(fixed.map(([md,name]) => [`${year}-${md}`,name]));
  const easter = easterSunday(year);
  const add = (offset,name) => { const d=new Date(easter); d.setDate(d.getDate()+offset); set.set(dateKey(year,d.getMonth(),d.getDate()),name); };
  add(0,'Wielkanoc'); add(1,'Poniedziałek Wielkanocny'); add(49,'Zielone Świątki'); add(60,'Boże Ciało');
  return set;
}
function monthData(year,month) {
  const holidaysMap=holidays(year),days=new Date(year,month+1,0).getDate(); let normDays=0;
  for(let day=1;day<=days;day++){const dow=new Date(year,month,day).getDay();if(dow!==0&&dow!==6&&!holidaysMap.has(dateKey(year,month,day)))normDays++;}
  return {days,normDays,norm:normDays*8,holidaysMap};
}
function fmt(value,maximum=2) { return new Intl.NumberFormat('pl-PL',{minimumFractionDigits:0,maximumFractionDigits:maximum}).format(value); }
function money(value) { return new Intl.NumberFormat('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:2}).format(value); }
function dayHours(year,month,day,data) {
  const key=dateKey(year,month,day);
  if(state.types[key]==='vacation'||state.types[key]==='blood') return 8;
  if(Object.prototype.hasOwnProperty.call(state.hours,key)) return Number(state.hours[key])||0;
  const dow=new Date(year,month,day).getDay();
  return dow!==0&&dow!==6&&!data.holidaysMap.has(key)?8:0;
}
function monthTotal(year,month,data) {
  let total=0;
  for(let day=1;day<=data.days;day++) total+=dayHours(year,month,day,data);
  return total;
}
function updateSummary() {
  const y=shown.getFullYear(),m=shown.getMonth(),data=monthData(y,m),total=monthTotal(y,m,data);
  const overtime=Math.max(0,total-data.norm),salary=Math.max(0,Number(state.salary)||0),hourly=data.norm?salary/data.norm:0,payout=salary+overtime*hourly,hasSalary=state.salary!==''&&state.salary!=null;
  $('total-hours').textContent=fmt(total);$('norm-hours').textContent=fmt(data.norm,0);$('workday-count').textContent=`${data.normDays} dni roboczych × 8 godz.`;$('overtime-hours').textContent=fmt(overtime);
  $('payout').textContent=hasSalary?money(payout):'—';$('hourly-rate').textContent=`Stawka bazowa: ${hasSalary?`${money(hourly)} zł / godz.`:'— zł / godz.'}`;
  $('detail-total').textContent=`${fmt(total)} godz.`;$('detail-norm').textContent=`− ${fmt(data.norm,0)} godz.`;$('detail-overtime').textContent=`${fmt(overtime)} godz.`;$('detail-payout').textContent=hasSalary?`${money(payout)} zł`:'— zł';
  const yearKey=String(y),allowance=state.leaveAllowance[yearKey],used=Object.entries(state.types).filter(([key,type])=>key.startsWith(`${yearKey}-`)&&type==='vacation').length;
  $('leave-year').textContent=y;if(document.activeElement!==$('leave-allowance'))$('leave-allowance').value=allowance??'';$('leave-used').textContent=fmt(used,0);$('leave-left').textContent=allowance==null||allowance===''?'—':fmt(Number(allowance)-used);$('leave-left').classList.toggle('over-limit',allowance!=null&&allowance!==''&&Number(allowance)<used);$('leave-hint').textContent=allowance==null||allowance===''?'Ustaw swój roczny wymiar, aby zobaczyć pozostałe dni.':'Urlop jest liczony według zaznaczonych dni w tym roku.';
}
function render() {
  const y=shown.getFullYear(),m=shown.getMonth(),data=monthData(y,m);
  $('month-title').textContent=`${MONTHS[m][0].toUpperCase()+MONTHS[m].slice(1)} ${y}`;$('month-caption').textContent=`${data.days} dni`;$('footer-year').textContent=y;$('salary').value=state.salary??'';
  const grid=$('calendar-grid');grid.replaceChildren();
  WEEKDAYS.forEach((name,index)=>{const el=document.createElement('div');el.className=`weekday${index>4?' weekday-weekend':''}`;el.setAttribute('role','columnheader');el.textContent=name;grid.append(el);});
  const firstOffset=(new Date(y,m,1).getDay()+6)%7;
  for(let i=0;i<firstOffset;i++){const blank=document.createElement('div');blank.className='day-cell empty';blank.setAttribute('aria-hidden','true');grid.append(blank);}
  const now=new Date();
  for(let d=1;d<=data.days;d++){
    const key=dateKey(y,m,d),dow=new Date(y,m,d).getDay(),holidayName=data.holidaysMap.get(key),cell=document.createElement('div');
    cell.className='day-cell';cell.setAttribute('role','gridcell');if(dow===0||dow===6)cell.classList.add('weekend');if(holidayName)cell.classList.add('holiday');if(y===now.getFullYear()&&m===now.getMonth()&&d===now.getDate())cell.classList.add('today');
    const hasOverride=Object.prototype.hasOwnProperty.call(state.hours,key),isWorkday=dow!==0&&dow!==6&&!holidayName,val=hasOverride?state.hours[key]:(isWorkday?8:'');
    const type=state.types[key]||'';if(type==='vacation')cell.classList.add('leave-day');if(type==='blood')cell.classList.add('blood-day');
    const shownVal=type?8:val;if(shownVal!==''&&Number(shownVal)>0)cell.classList.add('has-hours');
    const top=document.createElement('div');top.className='day-top';const num=document.createElement('span');num.className='day-number';num.textContent=d;top.append(num);cell.append(top);
    const select=document.createElement('select');select.className='day-type-select';select.setAttribute('aria-label',`${d} ${MONTHS[m]}: oznacz urlop lub oddanie krwi`);select.title='Oznacz dzień: urlop lub oddanie krwi';select.innerHTML='<option value="">—</option><option value="vacation">Urlop</option><option value="blood">Krew</option>';select.value=type;select.addEventListener('change',()=>{if(select.value)state.types[key]=select.value;else delete state.types[key];persist();render();});cell.append(select);
    if(holidayName){const label=document.createElement('span');label.className='day-label';label.title=holidayName;label.textContent=holidayName;cell.append(label);}
    const input=document.createElement('input');input.type='number';input.min='0';input.step='0.25';input.inputMode='decimal';input.placeholder='—';input.value=shownVal;input.disabled=Boolean(type);input.setAttribute('aria-label',`${d} ${MONTHS[m]} ${y}: liczba przepracowanych godzin${type==='vacation'?', urlop zaliczony jako 8 godzin':type==='blood'?', oddanie krwi zaliczone jako 8 godzin':''}${holidayName?`, ${holidayName}`:''}`);
    input.addEventListener('input',()=>{state.hours[key]=input.value===''?0:Math.max(0,Number(input.value));cell.classList.toggle('has-hours',Boolean(state.hours[key]));persist();updateSummary();});
    cell.append(input);grid.append(cell);
  }
  updateSummary();
}
function changeMonth(delta){shown=new Date(shown.getFullYear(),shown.getMonth()+delta,1);render();}
$('prev-month').addEventListener('click',()=>changeMonth(-1));
$('next-month').addEventListener('click',()=>changeMonth(1));
$('today-button').addEventListener('click',()=>{const now=new Date();shown=new Date(now.getFullYear(),now.getMonth(),1);render();});
$('salary').addEventListener('input',e=>{state.salary=e.target.value;persist();updateSummary();});
$('leave-allowance').addEventListener('input',e=>{const yearKey=String(shown.getFullYear());if(e.target.value==='')delete state.leaveAllowance[yearKey];else state.leaveAllowance[yearKey]=e.target.value;persist();updateSummary();});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('install-button').hidden=false;});
$('install-button').addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('install-button').hidden=true;});
if('serviceWorker'in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
