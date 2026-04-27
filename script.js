// ────────────────────────────────────
// 3D CANVAS VIEWER — simple repère + vecteurs
// ────────────────────────────────────
function setup3D(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let rotX = 0.45, rotY = 0.55;
  let dragging = false, lx = 0, ly = 0;
  canvas.onmousedown = e => { dragging = true; lx = e.clientX; ly = e.clientY; };
  canvas.onmousemove = e => {
    if (!dragging) return;
    rotY += (e.clientX - lx) * 0.012; rotX += (e.clientY - ly) * 0.012;
    lx = e.clientX; ly = e.clientY; draw3D();
  };
  canvas.onmouseup = () => dragging = false;
  canvas.onmouseleave = () => dragging = false;
  canvas.onwheel = e => { e.preventDefault(); draw3D(); };
  window['resetView3D'] = () => { rotX = 0.45; rotY = 0.55; draw3D(); };

  function project(x, y, z) {
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const x2 = x*cosY - z*sinY;
    const z2 = x*sinY + z*cosY;
    const y2 = y*cosX - z2*sinX;
    const scale = 70;
    return [W/2 + x2*scale, H/2 - y2*scale];
  }

  function arrow3D(x1,y1,z1, x2,y2,z2, color, label) {
    const [px1,py1] = project(x1,y1,z1);
    const [px2,py2] = project(x2,y2,z2);
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px1,py1); ctx.lineTo(px2,py2); ctx.stroke();
    // arrowhead
    const ang = Math.atan2(py2-py1, px2-px1);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(px2, py2);
    ctx.lineTo(px2-10*Math.cos(ang-0.35), py2-10*Math.sin(ang-0.35));
    ctx.lineTo(px2-10*Math.cos(ang+0.35), py2-10*Math.sin(ang+0.35));
    ctx.closePath(); ctx.fill();
    if (label) {
      ctx.font = 'bold 13px "Syne", sans-serif';
      ctx.fillStyle = color;
      ctx.fillText(label, px2+6, py2-4);
    }
  }

  function grid3D() {
    ctx.strokeStyle = '#ddd'; ctx.lineWidth = 0.5;
    for (let i = -3; i <= 3; i++) {
      const [a,b] = project(i,0,-3), [c,d] = project(i,0,3);
      ctx.beginPath(); ctx.moveTo(a,b); ctx.lineTo(c,d); ctx.stroke();
      const [e,f] = project(-3,0,i), [g,h] = project(3,0,i);
      ctx.beginPath(); ctx.moveTo(e,f); ctx.lineTo(g,h); ctx.stroke();
    }
  }

  function dot3D(x,y,z,color,label) {
    const [px,py] = project(x,y,z);
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px,py,4,0,2*Math.PI); ctx.fill();
    if (label) { ctx.font = '12px "Lora",serif'; ctx.fillStyle = color; ctx.fillText(label,px+6,py-4); }
  }

  function draw3D() {
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = '#faf9f6'; ctx.fillRect(0,0,W,H);
    grid3D();
    // Axes
    arrow3D(0,0,0, 3,0,0, '#b83232', 'x');
    arrow3D(0,0,0, 0,3,0, '#1a6b4a', 'y');
    arrow3D(0,0,0, 0,0,3, '#2255aa', 'z');
    // Vecteurs exemple
    arrow3D(0,0,0, 2,1,1, '#8a6a10', 'ū');
    arrow3D(1,0,0, 1,2,0, '#6a3aaa', 'v̄');
    // Parallelogramme
    arrow3D(0,0,0, 3,3,1, '#aaa', 'ū+v̄');
    // Points
    dot3D(0,0,0,'#333','O');
    dot3D(2,1,1,'#8a6a10','A');
    dot3D(1,2,0,'#6a3aaa','B');
    // Légende
    ctx.font = '11px "JetBrains Mono",monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('Repère orthonormé (O;i,j,k) — glisser pour faire pivoter', 12, H-10);
  }
  draw3D();
}
setup3D('canvas-vec');

// ────────────────────────────────────
// CALCULATEURS
// ────────────────────────────────────
function r(v) { return Math.round(v*10000)/10000; }

function calcDist() {
  const ax=+document.getElementById('ax').value, ay=+document.getElementById('ay').value, az=+document.getElementById('az').value;
  const bx=+document.getElementById('bx').value, by=+document.getElementById('by').value, bz=+document.getElementById('bz').value;
  const dx=bx-ax, dy=by-ay, dz=bz-az;
  const d = Math.sqrt(dx*dx+dy*dy+dz*dz);
  const el = document.getElementById('dist-result');
  const fmt = v => v < 0 ? `(${v})` : `${v}`;
  el.innerHTML = `\\(\\overrightarrow{AB} = \\begin{pmatrix}${dx}\\\\${dy}\\\\${dz}\\end{pmatrix},\\quad AB = \\sqrt{${fmt(dx)}^2+${fmt(dy)}^2+${fmt(dz)}^2} = ${r(d)}\\)`;
  if(window.MathJax) MathJax.typeset([el]);
}
calcDist();

function calcDroite() {
  const x0=+document.getElementById('d-x0').value, y0=+document.getElementById('d-y0').value, z0=+document.getElementById('d-z0').value;
  const a=+document.getElementById('d-a').value, b=+document.getElementById('d-b').value, c=+document.getElementById('d-c').value;
  const sign=(v,s)=> s?`${v>0?'+':'-'} ${Math.abs(v)}t`:`${v}`;
  const el = document.getElementById('droite-result');
  el.innerHTML = `\\(\\begin{cases}x = ${x0} ${a>=0?'+':'-'} ${Math.abs(a)}t\\\\y = ${y0} ${b>=0?'+':'-'} ${Math.abs(b)}t\\\\z = ${z0} ${c>=0?'+':'-'} ${Math.abs(c)}t\\end{cases},\\quad t\\in\\mathbb{R}\\)`;
  if(window.MathJax) MathJax.typeset([el]);
}
calcDroite();

function calcPlan() {
  const x0=+document.getElementById('p-x0').value, y0=+document.getElementById('p-y0').value, z0=+document.getElementById('p-z0').value;
  const a=+document.getElementById('p-a').value, b=+document.getElementById('p-b').value, c=+document.getElementById('p-c').value;
  const d = -(a*x0+b*y0+c*z0);
  let eq = '';
  [[a,'x'],[b,'y'],[c,'z']].forEach(([coef,v],i) => {
    if(coef===0) return;
    if(i>0 && coef>0) eq+='+';
    if(coef===-1) eq+='-'; else if(coef!==1) eq+=coef;
    eq+=v;
  });
  if(d>0) eq+=`+${d}`; else if(d<0) eq+=`${d}`;
  const el = document.getElementById('plan-result');
  el.innerHTML = `Équation cartésienne : \\(${eq} = 0\\)<br>Normale : \\(\\vec{n}=\\begin{pmatrix}${a}\\\\${b}\\\\${c}\\end{pmatrix}\\)`;
  if(window.MathJax) MathJax.typeset([el]);
}
calcPlan();

function calcScal() {
  const ua=+document.getElementById('ua').value, ub=+document.getElementById('ub').value, uc=+document.getElementById('uc').value;
  const va=+document.getElementById('va').value, vb=+document.getElementById('vb').value, vc=+document.getElementById('vc').value;
  const dot = ua*va+ub*vb+uc*vc;
  const nu = Math.sqrt(ua*ua+ub*ub+uc*uc), nv = Math.sqrt(va*va+vb*vb+vc*vc);
  let angStr = '';
  if(nu>0&&nv>0){
    const cosA = Math.max(-1,Math.min(1,dot/(nu*nv)));
    angStr = ` — angle = ${r(Math.acos(cosA)*180/Math.PI)}°`;
  }
  const el = document.getElementById('scal-result');
  el.innerHTML = `\\(\\vec{u}\\cdot\\vec{v} = ${dot}\\) — \\(\\|\\vec{u}\\|=${r(nu)}\\) — \\(\\|\\vec{v}\\|=${r(nv)}\\)${angStr} ${dot===0?'→ <strong style="color:var(--green)">Orthogonaux ✓</strong>':''}`;
  if(window.MathJax) MathJax.typeset([el]);
}
calcScal();

function calcDistPlan() {
  const x0=+document.getElementById('dm-x0').value, y0=+document.getElementById('dm-y0').value, z0=+document.getElementById('dm-z0').value;
  const a=+document.getElementById('dp-a').value, b=+document.getElementById('dp-b').value, c=+document.getElementById('dp-c').value, d=+document.getElementById('dp-d').value;
  const num = Math.abs(a*x0+b*y0+c*z0+d);
  const den = Math.sqrt(a*a+b*b+c*c);
  const el = document.getElementById('distplan-result');
  const fmtMul = (coef, val) => {
    // Format "coef × val" with parens if val is negative
    const vs = val < 0 ? `(${val})` : `${val}`;
    const cs = coef < 0 ? `(${coef})` : `${coef}`;
    return `${cs}\\times ${vs}`;
  };
  const fmtSq = v => v < 0 ? `(${v})^2` : `${v}^2`;
  const numStr = `${fmtMul(a,x0)}+${fmtMul(b,y0)}+${fmtMul(c,z0)}${d>=0?'+'+d:d}`;
  const denStr = `${fmtSq(a)}+${fmtSq(b)}+${fmtSq(c)}`;
  el.innerHTML = `\\(d = \\dfrac{|${numStr}|}{\\sqrt{${denStr}}} = \\dfrac{${r(num)}}{${r(den)}} = ${r(num/den)}\\)`;
  if(window.MathJax) MathJax.typeset([el]);
}
calcDistPlan();

// ────────────────────────────────────
// PYODIDE
// ────────────────────────────────────
let pyodide = null, pyodideLoading = false;
const origCodes = {};
document.querySelectorAll('.py-code').forEach(ta => { origCodes[ta.id] = ta.value; });

async function loadPy() {
  if (pyodide) return true;
  if (pyodideLoading) return false;
  pyodideLoading = true;
  const st = document.getElementById('py-status');
  st.textContent = '⏳ Chargement Python…';
  try {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
    document.head.appendChild(s);
    await new Promise((res,rej)=>{s.onload=res;s.onerror=rej;});
    pyodide = await window.loadPyodide();
    st.textContent = '✓ Python prêt'; st.classList.add('ready');
    setTimeout(()=>st.classList.add('hidden'),3000);
    return true;
  } catch(e) { st.textContent='✗ Erreur Python'; return false; }
}
async function runPy(id) {
  const code = document.getElementById(id+'-code').value;
  const out = document.getElementById(id+'-out');
  out.className='py-output active'; out.textContent='⏳ Exécution…';
  out.style.color='#888';
  const ok = await loadPy();
  if(!ok){out.className='py-output active error';out.textContent='Python non disponible.';return;}
  try {
    let stdout='';
    pyodide.setStdout({batched:s=>stdout+=s+'\n'});
    await pyodide.runPythonAsync(code);
    out.className='py-output active'; out.style.color='#a6e3a1';
    out.textContent = stdout||'(aucune sortie)';
  } catch(e) { out.className='py-output active error'; out.textContent='⚠ '+e.message; }
}
function downloadPy(id){
  const code=document.getElementById(id+'-code').value;
  const fname=document.getElementById(id+'-code').closest('.py-block').querySelector('.py-title').textContent.trim();
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([code],{type:'text/plain'}));
  a.download=fname; a.click();
}
function resetPy(id){
  document.getElementById(id+'-code').value=origCodes[id+'-code'];
  const out=document.getElementById(id+'-out');
  out.className='py-output'; out.textContent='';
}

// ────────────────────────────────────
// QCM
// ────────────────────────────────────
const allQ = [
  { q:"Un plan de l'espace a pour équation \\(2x - y + 3z + 5 = 0\\). Son vecteur normal est :", opts:["\\((-2;1;-3)\\)","\\((2;-1;3)\\)","\\((2;1;3)\\)","\\((5;5;5)\\)"], ans:1,
    exp:"Le vecteur normal se lit directement sur les coefficients : \\(\\vec{n}=(2;-1;3)\\)." },
  { q:"Le point \\(M(1;0;-1)\\) appartient-il au plan \\(x + 2y - z - 2 = 0\\) ?", opts:["Oui","Non","Impossible à déterminer","Il appartient à la normale"], ans:0,
    exp:"\\(1+2(0)-(-1)-2=1+0+1-2=0\\) ✓ M est bien dans le plan." },
  { q:"Deux vecteurs \\(\\vec{u}=(1;2;3)\\) et \\(\\vec{v}=(2;4;6)\\) sont :", opts:["Orthogonaux","Colinéaires","De même norme","Non coplanaires avec \\(\\vec{0}\\)"], ans:1,
    exp:"\\(\\vec{v} = 2\\vec{u}\\), donc ils sont colinéaires." },
  { q:"La représentation paramétrique d'une droite dans l'espace fait intervenir :", opts:["1 paramètre","2 paramètres","3 paramètres","Aucun paramètre"], ans:0,
    exp:"Une droite est une courbe de dimension 1, décrite par un seul paramètre \\(t\\in\\mathbb{R}\\)." },
  { q:"Deux droites de l'espace non parallèles sont forcément :", opts:["Sécantes","Perpendiculaires","Coplanaires","Ni sécantes ni parallèles (gauches) possibles"], ans:3,
    exp:"En géométrie de l'espace, deux droites non parallèles peuvent être sécantes ou gauches (non coplanaires)." },
  { q:"\\(\\vec{u}\\cdot\\vec{v} = 0\\) signifie que :", opts:["\\(\\vec{u}=\\vec{0}\\)","\\(\\vec{v}=\\vec{0}\\)","\\(\\vec{u}\\) et \\(\\vec{v}\\) sont orthogonaux","\\(\\vec{u}\\) et \\(\\vec{v}\\) sont colinéaires"], ans:2,
    exp:"Par définition, \\(\\vec{u}\\cdot\\vec{v}=0 \\Leftrightarrow \\vec{u}\\perp\\vec{v}\\)." },
  { q:"La distance du point \\(M(0;0;0)\\) au plan \\(x+y+z-3=0\\) vaut :", opts:["\\(\\sqrt{3}\\)","\\(1\\)","\\(3\\)","\\(3\\sqrt{3}\\)"], ans:0,
    exp:"\\(d=\\dfrac{|0+0+0-3|}{\\sqrt{1+1+1}}=\\dfrac{3}{\\sqrt{3}}=\\sqrt{3}\\)." },
  { q:"Combien de paramètres décrivent un plan dans l'espace ?", opts:["1","2","3","4"], ans:1,
    exp:"Un plan est de dimension 2 : sa représentation paramétrique fait intervenir deux paramètres \\((s,t)\\in\\mathbb{R}^2\\)." },
  { q:"\\(\\|\\vec{u}+\\vec{v}\\|^2 = \\|\\vec{u}\\|^2 + \\|\\vec{v}\\|^2\\) si et seulement si :", opts:["\\(\\vec{u}=\\vec{v}\\)","\\(\\vec{u}\\perp\\vec{v}\\)","\\(\\vec{u}\\) et \\(\\vec{v}\\) sont colinéaires","Toujours"], ans:1,
    exp:"\\(\\|\\vec{u}+\\vec{v}\\|^2 = \\|\\vec{u}\\|^2+2\\vec{u}\\cdot\\vec{v}+\\|\\vec{v}\\|^2\\). L'égalité a lieu ssi \\(\\vec{u}\\cdot\\vec{v}=0\\), i.e. \\(\\vec{u}\\perp\\vec{v}\\)." },
  { q:"Trois vecteurs sont coplanaires si et seulement si :", opts:["Ils sont deux à deux orthogonaux","L'un d'eux est combinaison linéaire des deux autres","Ils sont de même norme","Ils forment une base de l'espace"], ans:1,
    exp:"\\(\\vec{w}=\\lambda\\vec{u}+\\mu\\vec{v}\\) ⟺ \\(\\vec{u},\\vec{v},\\vec{w}\\) sont coplanaires." },
  { q:"La droite passant par \\(A(1;0;2)\\) et \\(B(3;1;4)\\) a pour vecteur directeur :", opts:["\\((1;0;2)\\)","\\((3;1;4)\\)","\\((2;1;2)\\)","\\((4;1;6)\\)"], ans:2,
    exp:"\\(\\overrightarrow{AB}=(3-1;1-0;4-2)=(2;1;2)\\)." },
  { q:"Un vecteur \\(\\vec{d}\\) est normal au plan \\(\\mathcal{P}\\) si :", opts:["\\(\\vec{d}\\) est dans \\(\\mathcal{P}\\)","\\(\\vec{d}\\) est orthogonal à tout vecteur de \\(\\mathcal{P}\\)","\\(\\vec{d}\\) est directeur d'une droite de \\(\\mathcal{P}\\)","\\(\\vec{d}=\\vec{0}\\)"], ans:1,
    exp:"Le vecteur normal est par définition orthogonal à tous les vecteurs du plan." },
];

let curQ=[], answered={}, cSec=0, cPaused=false, cInt=null;

function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function pad(n){return String(n).padStart(2,'0');}

function newQCM(){
  answered={}; curQ=shuffle(allQ).slice(0,8);
  document.getElementById('qcm-result').classList.remove('active');
  document.getElementById('score-display').textContent='0 / 0';
  resetChrono(); startChrono(); renderQCM();
}
function renderQCM(){
  const c=document.getElementById('qcm-container');
  c.innerHTML=curQ.map((q,qi)=>`
    <div class="qcm-q" id="qq-${qi}">
      <div class="qcm-question">${qi+1}. ${q.q}</div>
      <div class="qcm-opts">
        ${q.opts.map((o,oi)=>`
          <div class="qcm-opt" id="opt-${qi}-${oi}" onclick="selOpt(${qi},${oi})">
            <span class="opt-letter">${String.fromCharCode(65+oi)}</span><span>${o}</span>
          </div>`).join('')}
      </div>
      <div class="qcm-feedback" id="fb-${qi}"></div>
    </div>`).join('');
  if(window.MathJax) MathJax.typeset([c]);
}
function selOpt(qi,oi){
  if(answered[qi]!==undefined)return;
  document.querySelectorAll(`#qq-${qi} .qcm-opt`).forEach(e=>e.classList.remove('selected'));
  document.getElementById(`opt-${qi}-${oi}`).classList.add('selected');
  answered[qi]=oi;
}
function submitQCM(){
  let sc=0;
  curQ.forEach((q,qi)=>{
    const ch=answered[qi];
    const qEl=document.getElementById(`qq-${qi}`);
    const fb=document.getElementById(`fb-${qi}`);
    q.opts.forEach((_,oi)=>{
      const el=document.getElementById(`opt-${qi}-${oi}`);
      el.classList.add('disabled');
      if(oi===q.ans)el.classList.add('correct');
      if(ch===oi&&ch!==q.ans)el.classList.add('wrong');
    });
    if(ch===q.ans){sc++;qEl.classList.add('correct');fb.innerHTML=`✓ Correct ! ${q.exp}`;}
    else{qEl.classList.add('wrong');fb.innerHTML=`✗ ${ch===undefined?'Non répondu. ':''}Réponse : <strong>${q.opts[q.ans]}</strong>. ${q.exp}`;}
    fb.classList.add('active');
  });
  const tot=curQ.length;
  document.getElementById('score-display').textContent=`${sc} / ${tot}`;
  const pct=Math.round(sc/tot*100);
  const msg=pct>=87?'🏆 Excellent ! Maîtrise parfaite de la géométrie vectorielle.':pct>=62?'👍 Bien ! Quelques notions à consolider.':'📚 À retravailler — revoyez les définitions et formules.';
  document.getElementById('result-score').textContent=`${sc} / ${tot} — ${pct} %`;
  document.getElementById('result-msg').textContent=msg;
  document.getElementById('qcm-result').classList.add('active');
  if(window.MathJax)MathJax.typeset([document.getElementById('qcm-result'),document.getElementById('qcm-container')]);
  stopChrono();
}
function startChrono(){stopChrono();cPaused=false;document.getElementById('chrono-btn').textContent='Pause';cInt=setInterval(()=>{if(!cPaused){cSec++;document.getElementById('chrono-display').textContent=`${pad(Math.floor(cSec/60))}:${pad(cSec%60)}`;}},1000);}
function stopChrono(){clearInterval(cInt);cInt=null;}
function resetChrono(){stopChrono();cSec=0;cPaused=false;document.getElementById('chrono-display').textContent='00:00';document.getElementById('chrono-btn').textContent='Pause';}
function toggleChrono(){cPaused=!cPaused;document.getElementById('chrono-btn').textContent=cPaused?'Reprendre':'Pause';}

newQCM();

// ── SCROLL REVEAL ──
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');}),{threshold:0.07});
document.querySelectorAll('section').forEach(s=>io.observe(s));

// ── NAV ACTIVE ──
const navLinks=document.querySelectorAll('nav a');
window.addEventListener('scroll',()=>{
  let cur='';
  document.querySelectorAll('main section').forEach(s=>{if(window.scrollY>=s.offsetTop-130)cur=s.id;});
  navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+cur));
},{passive:true});