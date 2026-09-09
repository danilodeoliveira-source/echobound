"use strict";
/* EchoBound V5000 — native WebGL adventure build, GitHub Pages ready. */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rng=s=>{let x=Math.sin(s*12.9898)*43758.5453;return x-Math.floor(x)};
const REGIONS=[
 ['Floresta de Lúmen','#183d2b','#4fd18a'],['Deserto de Aurum','#5e421d','#e6bf5c'],['Picos de Vhar','#294b60','#a9e8ff'],['Ruínas de Noctis','#241b43','#b796ff'],['Costa de Maréa','#123e55','#52d9ff'],['Vulcão Kharon','#4a1d15','#ff765e'],['Pântano de Myra','#173b27','#9be86e'],['Céu de Aether','#303b63','#cbd8ff'],['Vale dos Gigantes','#4c3824','#e1b87b'],['Biblioteca Abissal','#2c1640','#e7a7ff'],['Jardim Celestial','#5a2c4b','#ffc3df'],['Coração do Eclipse','#27132f','#ff709a'],['Cavernas de Obsidiana','#151a24','#9aa8ff'],['Ilhas de Tempestade','#173d4c','#62d9ff'],['Cidade Mecânica','#252a31','#ffb45c'],['Planícies de Âmbar','#51401d','#ffd36b'],['Floresta Sombria','#201b28','#b27cff'],['Mar de Cristal','#17334a','#8ff0ff'],['Trono dos Titãs','#3b2a24','#ffb37a'],['Núcleo do Eco','#20152e','#ff72d2']
];
const RACES=[['Zumbis','#7b9a75'],['Esqueletos','#c8cbd1'],['Bandidos','#a26a45'],['Orcs','#6ca344'],['Magos','#8b69e8'],['Feras','#9c7149'],['Espíritos','#8adbd7'],['Constructos','#7f92a2'],['Aranhas','#72558f'],['Draconianos','#b65b46']];
const state=Object.assign({region:0,phase:0,xp:0,coins:250,shards:20,level:1,name:'Aventureiro',quality:'ultra',inventory:[],equipped:{}},(()=>{try{return JSON.parse(localStorage.getItem('echobound_v5000')||'{}')}catch{return {}}})());
if(!Array.isArray(state.inventory)) state.inventory=[];
if(!state.equipped || typeof state.equipped!=='object') state.equipped={};
const SHOP_ITEMS={
  'Espada do Eco':{id:'sword_echo',slot:'arma',icon:'⚔',rarity:'Rara',price:50,power:12,desc:'Lâmina equilibrada que canaliza o Eco.'},
  'Arco Prismático':{id:'bow_prism',slot:'arma',icon:'🏹',rarity:'Épica',price:125,power:24,desc:'Dispara flechas de energia prismática.'},
  'Lâmina Solar':{id:'blade_solar',slot:'arma',icon:'☀️',rarity:'Lendária',price:200,power:40,desc:'Uma lâmina que brilha com energia solar.'},
  'Armadura Lúmen':{id:'armor_lumen',slot:'armadura',icon:'🛡',rarity:'Rara',price:50,power:15,desc:'Protege contra golpes e aumenta a vitalidade.'},
  'Escudo Guardião':{id:'shield_guard',slot:'armadura',icon:'🛡️',rarity:'Épica',price:125,power:30,desc:'Escudo reforçado para enfrentar chefes.'},
  'Peitoral de Vhar':{id:'chest_vhar',slot:'armadura',icon:'🧱',rarity:'Lendária',price:200,power:45,desc:'Armadura forjada nos Picos de Vhar.'},
  'Poção de Vida':{id:'potion_life',slot:'consumível',icon:'🧪',rarity:'Rara',price:50,power:25,desc:'Recupera vida durante a aventura.'},
  'Elixir do Eco':{id:'elixir_echo',slot:'consumível',icon:'🔮',rarity:'Épica',price:125,power:50,desc:'Aumenta temporariamente a força do Eco.'},
  'Frasco de Velocidade':{id:'speed_vial',slot:'consumível',icon:'⚗️',rarity:'Lendária',price:200,power:35,desc:'Aumenta a velocidade de movimento.'},
  'Amuleto Prismático':{id:'amulet_prism',slot:'relíquia',icon:'💎',rarity:'Rara',price:50,power:10,desc:'Amplifica a energia coletada.'},
  'Relíquia do Eclipse':{id:'relic_eclipse',slot:'relíquia',icon:'🌑',rarity:'Épica',price:125,power:28,desc:'Relíquia ancestral do Eclipse.'},
  'Fragmento Antigo':{id:'fragment_ancient',slot:'relíquia',icon:'✦',rarity:'Lendária',price:200,power:45,desc:'Fragmento raro carregado de memórias.'}
};
const ITEM_BY_ID=Object.fromEntries(Object.values(SHOP_ITEMS).map(x=>[x.id,x]));
function save(){try{localStorage.setItem('echobound_v5000',JSON.stringify(state));}catch{} updateHUD();}
function ownedCount(id){return state.inventory.filter(x=>x===id).length}
function isEquipped(id){return Object.values(state.equipped).includes(id)}
function buyItem(name){
  const item=SHOP_ITEMS[name]; if(!item) return;
  if(state.coins<item.price){notifyShop('Echo Coins insuficientes.');return;}
  state.coins-=item.price; state.inventory.push(item.id);
  save(); buildShop(document.querySelector('#shopTitle')?.textContent||'Arsenal'); notifyShop(`${item.icon} ${name} comprado!`);
}
function equipItem(id){
  const item=ITEM_BY_ID[id]; if(!item || !ownedCount(id)) return;
  if(item.slot==='consumível'){notifyShop('Consumíveis não precisam ser equipados.');return;}
  state.equipped[item.slot]=id; save(); buildInventory(); notifyShop(`${item.icon} ${itemName(id)} equipado!`);
}
function itemName(id){return ITEM_BY_ID[id]?.name||Object.keys(SHOP_ITEMS).find(k=>SHOP_ITEMS[k].id===id)||'Item'}
Object.entries(SHOP_ITEMS).forEach(([name,item])=>item.name=name);
let shopNoticeTimer=0;
function notifyShop(msg){const el=$('#shopNotice');if(!el)return;el.textContent=msg;el.classList.remove('hidden');clearTimeout(shopNoticeTimer);shopNoticeTimer=setTimeout(()=>el.classList.add('hidden'),2200)}
let gl,program,canvas,raf,last=0,keys={},time=0,attackCD=0,echoCD=0,gameRunning=false;
let authMode='login', currentRoom=null, socket=null;
const ONLINE_WS_URL=(window.ECHOBOUND_CONFIG&&window.ECHOBOUND_CONFIG.wsUrl)||'';
let player={x:0,y:1.2,z:8,hp:100},enemies=[],boss=null,particles=[],objects=[]; let camera={yaw:0,pitch:.32,dist:13}; let sceneMode='lobby'; let lobbyServices=[];
const VS=`attribute vec3 aPos,aNormal,aColor;uniform mat4 uMVP,uModel;uniform vec3 uLight;varying vec3 vColor;varying float vLight;void main(){vec3 n=normalize((uModel*vec4(aNormal,0.)).xyz);vLight=max(.2,dot(n,normalize(uLight))*.72+.28);vColor=aColor;gl_Position=uMVP*vec4(aPos,1.);}`;
const FS=`precision mediump float;varying vec3 vColor;varying float vLight;void main(){vec3 c=max(vColor*vLight,vec3(.025));gl_FragColor=vec4(c,1.);}`;
const cubePos=new Float32Array([-0.5,-0.5,-0.5, 0.5,-0.5,-0.5, 0.5,0.5,-0.5, -0.5,0.5,-0.5, -0.5,-0.5,0.5, 0.5,-0.5,0.5, 0.5,0.5,0.5, -0.5,0.5,0.5, -0.5,-0.5,-0.5, -0.5,0.5,-0.5, -0.5,0.5,0.5, -0.5,-0.5,0.5, 0.5,-0.5,-0.5, 0.5,-0.5,0.5, 0.5,0.5,0.5, 0.5,0.5,-0.5, -0.5,-0.5,-0.5, -0.5,-0.5,0.5, 0.5,-0.5,0.5, 0.5,-0.5,-0.5, -0.5,0.5,-0.5, 0.5,0.5,-0.5, 0.5,0.5,0.5, -0.5,0.5,0.5]);
const cubeNorm=[];for(let i=0;i<6;i++){const n=[[0,0,-1],[0,0,1],[-1,0,0],[1,0,0],[0,-1,0],[0,1,0]][i];for(let j=0;j<4;j++)cubeNorm.push(...n)}
const idx=new Uint16Array([0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23]);
let pBuf,nBuf,cBuf,iBuf,uMVP,uModel,aColorLoc;
function mat4(){return new Float32Array(16)}function ident(m){m.fill(0);m[0]=m[5]=m[10]=m[15]=1;return m}
function mul(a,b){const o=mat4();for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o}
function persp(fovy,aspect,n,f){const o=mat4(),t=1/Math.tan(fovy/2);o[0]=t/aspect;o[5]=t;o[10]=(f+n)/(n-f);o[11]=-1;o[14]=2*f*n/(n-f);return o}
function look(eye,c){let z=[eye[0]-c[0],eye[1]-c[1],eye[2]-c[2]],zl=Math.hypot(...z);z=z.map(v=>v/zl);let x=[z[2],0,-z[0]],xl=Math.hypot(...x);x=x.map(v=>v/xl);let y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];const o=ident(mat4());o[0]=x[0];o[4]=x[1];o[8]=x[2];o[1]=y[0];o[5]=y[1];o[9]=y[2];o[2]=z[0];o[6]=z[1];o[10]=z[2];o[12]=-(x[0]*eye[0]+x[1]*eye[1]+x[2]*eye[2]);o[13]=-(y[0]*eye[0]+y[1]*eye[1]+y[2]*eye[2]);o[14]=-(z[0]*eye[0]+z[1]*eye[1]+z[2]*eye[2]);return o}
function translate(m,x,y,z){const o=new Float32Array(m);o[12]+=m[0]*x+m[4]*y+m[8]*z;o[13]+=m[1]*x+m[5]*y+m[9]*z;o[14]+=m[2]*x+m[6]*y+m[10]*z;return o}
function scale(m,x,y,z){const o=new Float32Array(m);for(let i=0;i<4;i++){o[i]*=x;o[4+i]*=y;o[8+i]*=z}return o}
function rotY(m,a){const c=Math.cos(a),s=Math.sin(a),o=new Float32Array(m);for(let r=0;r<4;r++){const x=m[r],z=m[8+r];o[r]=x*c-z*s;o[8+r]=x*s+z*c}return o}
function colorHex(h){const n=parseInt(h.slice(1),16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]}
function initGL(){canvas=$('#gameCanvas'); gl=canvas.getContext('webgl',{antialias:true,alpha:false})||canvas.getContext('experimental-webgl');if(!gl)throw Error('WebGL não disponível');const vs=gl.createShader(gl.VERTEX_SHADER);gl.shaderSource(vs,VS);gl.compileShader(vs);if(!gl.getShaderParameter(vs,gl.COMPILE_STATUS))throw Error('Vertex shader: '+gl.getShaderInfoLog(vs));const fs=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(fs,FS);gl.compileShader(fs);if(!gl.getShaderParameter(fs,gl.COMPILE_STATUS))throw Error('Fragment shader: '+gl.getShaderInfoLog(fs));program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Falha no shader');gl.useProgram(program);pBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,pBuf);gl.bufferData(gl.ARRAY_BUFFER,cubePos,gl.STATIC_DRAW);let a=gl.getAttribLocation(program,'aPos');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,0,0);nBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,nBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(cubeNorm),gl.STATIC_DRAW);a=gl.getAttribLocation(program,'aNormal');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,0,0);iBuf=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,iBuf);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,idx,gl.STATIC_DRAW);cBuf=gl.createBuffer();uMVP=gl.getUniformLocation(program,'uMVP');uModel=gl.getUniformLocation(program,'uModel');aColorLoc=gl.getAttribLocation(program,'aColor');gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearDepth(1);resize()}
function resize(){if(!gl)return; canvas=$('#gameCanvas'); if(!canvas)return;const q=state.quality==='ultra'?1:state.quality==='high'?.8:.6,d=Math.min(devicePixelRatio||1,2.5);canvas.width=Math.max(1,innerWidth*d*q);canvas.height=Math.max(1,innerHeight*d*q);canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';gl.viewport(0,0,canvas.width,canvas.height)}
function drawCube(x,y,z,s,col,ry=0){let m=ident(mat4());m=translate(m,x,y,z);m=rotY(m,ry);m=scale(m,s,s,s);const eye=[player.x+Math.sin(camera.yaw)*camera.dist,7+camera.pitch*8,player.z+Math.cos(camera.yaw)*camera.dist],view=look(eye,[player.x,1,player.z]),proj=persp(1.05,canvas.width/canvas.height,.1,180),mvp=mul(proj,mul(view,m));gl.uniformMatrix4fv(uMVP,false,mvp);gl.uniformMatrix4fv(uModel,false,m);const cv=new Float32Array(24),c=colorHex(col);for(let i=0;i<24;i++)cv.set(c,i*3);gl.bindBuffer(gl.ARRAY_BUFFER,cBuf);gl.bufferData(gl.ARRAY_BUFFER,cv,gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(aColorLoc);gl.vertexAttribPointer(aColorLoc,3,gl.FLOAT,false,0,0);gl.drawElements(gl.TRIANGLES,36,gl.UNSIGNED_SHORT,0)}
function setupLobby(){
  sceneMode='lobby'; enemies=[]; boss=null; particles=[]; objects=[];
  player={x:0,y:1.2,z:8,hp:100}; camera={yaw:0,pitch:.28,dist:16};
  lobbyServices=[
    {x:-9,z:-5,name:'Arsenal',action:()=>openLobbyService('shop','Arsenal'),col:'#b85d46'},
    {x:-4,z:-8,name:'Ferreiro',action:()=>openLobbyService('shop','Ferreiro'),col:'#8b7a63'},
    {x:4,z:-8,name:'Alquimista',action:()=>openLobbyService('shop','Alquimista'),col:'#6a78c9'},
    {x:9,z:-5,name:'Relíquias',action:()=>openLobbyService('shop','Relíquias'),col:'#b58be8'},
    {x:-10,z:6,name:'Estatísticas',action:()=>openLobbyService('stats'),col:'#4f9fbd'},
    {x:-3,z:12,name:'Equipamento',action:()=>openLobbyService('inventory'),col:'#6c9b68'},
    {x:5,z:12,name:'Mapa do Mundo',action:()=>openLobbyService('map'),col:'#d2a64b'},
    {x:11,z:6,name:'Partida On-line',action:()=>openLobbyService('online'),col:'#6f83d8'}
  ];
  lobbyServices.forEach((o,i)=>{objects.push({x:o.x,z:o.z,type:10+i,col:o.col,name:o.name})});
  for(let i=0;i<42;i++){const a=rng(i*13.7)*Math.PI*2,r=17+rng(i*9.2)*18;objects.push({x:Math.cos(a)*r,z:Math.sin(a)*r,type:20+(i%3),col:['#31543b','#4c3a2d','#6f5940'][i%3]})}
  updateHUD(); updateLobbyPrompt(); resize();
}
function openLobbyService(action,shop){
  if(action==='shop'){$('#shopTitle').textContent=shop||'Mercador'; buildShop(shop||'Arsenal'); show('shop');}
  else if(action==='stats'){buildStats();show('stats');}
  else if(action==='inventory'){buildInventory();show('inventory');}
  else if(action==='map'){buildMap();show('lobby2');}
  else if(action==='online'){show('online');}
}
function nearestLobbyService(){let best=null,bd=999;for(const o of lobbyServices){const d=Math.hypot(player.x-o.x,player.z-o.z);if(d<bd){bd=d;best=o}}return bd<3.2?best:null}
function updateLobbyPrompt(){if(sceneMode!=='lobby')return;const o=nearestLobbyService(),el=$('#lobbyPrompt');if(!el)return;if(o){el.innerHTML=`<b>E</b> ${o.name}`;el.classList.remove('hidden')}else el.classList.add('hidden')}
function interactLobby(){const o=nearestLobbyService();if(o)o.action()}
function renderLobby(){
  const lp=$('#l3dPlayer'); if(lp){ const sx=Math.max(-42,Math.min(42,player.x*1.35)); const sy=Math.max(-20,Math.min(20,(player.z-8)*.9)); lp.style.transform=`translate(calc(-50% + ${sx}px),calc(-50% + ${sy}px))`; }
  if(!canvas||!gl)return;
  gl.viewport(0,0,canvas.width,canvas.height);
  gl.clearColor(.025,.045,.075,1);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniform3f(gl.getUniformLocation(program,'uLight'),-.35,1,.55);
  // chão amplo
  for(let x=-30;x<=30;x+=3)for(let z=-30;z<=30;z+=3){
    const c=((Math.abs(x/3)+Math.abs(z/3))%2===0)?'#725c43':'#604d39';
    drawCube(x,-.75,z,2.9,c);
  }
  // praça central
  drawCube(0,-.05,0,12,'#8a7254');
  drawCube(0,.10,0,8,'#9b805f');
  // portal/cristal central
  drawCube(0,1.7,-1,3.0,'#334b78');
  drawCube(0,3.7,-1,2.0,'#57d7ff');
  drawCube(0,5.0,-1,1.0,'#b7f4ff');
  // prédios/serviços
  lobbyServices.forEach(o=>{
    drawCube(o.x,.9,o.z,2.1,'#263449');
    drawCube(o.x,2.35,o.z,1.55,o.col);
    drawCube(o.x,3.55,o.z,.72,'#e8d5ad');
  });
  // árvores e decoração
  objects.filter(o=>o.type>=20).forEach(o=>{
    drawCube(o.x,.8,o.z,1.1,'#3b5b42');
    drawCube(o.x,2.5,o.z,1.8,'#31583b');
  });
  // postes de luz
  for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*14,z=Math.sin(a)*14;drawCube(x,1,z,.32,'#a8b4c2');drawCube(x,3,z,.6,'#ffe8a6')}
  // personagem
  drawCube(player.x,.9,player.z,1.35,'#4fc8e8',camera.yaw);
  drawCube(player.x,2.15,player.z,.9,'#d9a47d',camera.yaw);
  drawCube(player.x,2.85,player.z,.42,'#273c67',camera.yaw);
  updateLobbyPrompt();
}
function setupWorld(){enemies=[];objects=[];particles=[];boss=null;const seed=state.region*1000+state.phase+77,reg=REGIONS[state.region];for(let i=0;i<90;i++){const a=rng(seed+i)*Math.PI*2,r=14+rng(seed+i+80)*55;objects.push({x:Math.cos(a)*r,z:Math.sin(a)*r,type:i%5})}const n=8+state.region+Math.floor((state.phase%25)/4);for(let i=0;i<n;i++){const a=rng(seed+i*4)*Math.PI*2,r=14+rng(seed+i*5)*42,rr=RACES[(state.region+i+state.phase)%RACES.length];enemies.push({x:Math.cos(a)*r,z:Math.sin(a)*r,hp:45+state.region*7,max:45+state.region*7,color:rr[1],speed:.7+rng(i+3)*.8})}if(state.phase%25===24)boss={x:0,z:-32,hp:100,max:100,color:'#ff4f88',name:'Guardião '+(state.region*100+Math.floor(state.phase/25)+1)};player={x:0,y:1.2,z:8,hp:100};updateHUD()}
function burst(x,y,z,col){for(let i=0;i<10;i++){const a=Math.random()*Math.PI*2;particles.push({x,y,z,vx:Math.cos(a)*3,vy:1+Math.random()*4,vz:Math.sin(a)*3,life:.55,col})}}
function update(dt){time+=dt;attackCD=Math.max(0,attackCD-dt);echoCD=Math.max(0,echoCD-dt);let dx=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0),dz=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0);if(dx||dz){const l=Math.hypot(dx,dz);player.x+=dx/l*12*dt;player.z+=dz/l*12*dt}if(keys.q)camera.yaw-=dt;if(keys.e)camera.yaw+=dt;enemies.forEach(e=>{const x=player.x-e.x,z=player.z-e.z,d=Math.hypot(x,z)||1;if(d>2.3){e.x+=x/d*e.speed*dt;e.z+=z/d*e.speed*dt}else player.hp=clamp(player.hp-8*dt,0,100)});if(boss){const x=player.x-boss.x,z=player.z-boss.z,d=Math.hypot(x,z)||1;if(d>4){boss.x+=x/d*1.5*dt;boss.z+=z/d*1.5*dt}else player.hp=clamp(player.hp-12*dt,0,100)}particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vy-=6*dt;p.life-=dt});particles=particles.filter(p=>p.life>0);if(player.hp<=0){player.hp=100;player.x=0;player.z=8}updateHUD()}
function attack(){if(attackCD>0)return;attackCD=.28;enemies=enemies.filter(e=>{if(Math.hypot(e.x-player.x,e.z-player.z)<4){e.hp-=35;burst(e.x,1,e.z,'#6fe8ff');if(e.hp<=0){state.coins+=10;state.xp+=20;return false}}return true});if(boss&&Math.hypot(boss.x-player.x,boss.z-player.z)<5){boss.hp-=8;burst(boss.x,2,boss.z,'#ff70b0');if(boss.hp<=0){boss=null;state.coins+=500;state.xp+=500;save()}}}
function echo(){if(echoCD>0)return;echoCD=3;enemies=enemies.filter(e=>{if(Math.hypot(e.x-player.x,e.z-player.z)<8){e.hp-=75;burst(e.x,1,e.z,'#aa82ff')}return e.hp>0});if(boss&&Math.hypot(boss.x-player.x,boss.z-player.z)<9){boss.hp-=22;burst(boss.x,2,boss.z,'#aa82ff')}}
function render(){if(sceneMode==='lobby'){renderLobby();return}const reg=REGIONS[state.region];gl.clearColor(...colorHex(reg[1]),1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.uniform3f(gl.getUniformLocation(program,'uLight'),-.4,1,.3);for(let x=-60;x<=60;x+=5)for(let z=-60;z<=60;z+=5)drawCube(x,-.65,z,2,reg[1]);objects.forEach(o=>{if(o.type===0){drawCube(o.x,.9,o.z,.65,reg[2]);drawCube(o.x,2.8,o.z,2.2,reg[1])}else if(o.type===1)drawCube(o.x,.8,o.z,1.1,'#6b7788');else if(o.type===2)drawCube(o.x,.5,o.z,1.4,'#8d5b3f');else if(o.type===3)drawCube(o.x,1,o.z,.8,reg[2]);else drawCube(o.x,.4,o.z,1.6,'#33404e')});enemies.forEach(e=>{drawCube(e.x,1,e.z,1.25,e.color,Math.atan2(player.x-e.x,player.z-e.z));drawCube(e.x,2.15,e.z,.8,e.color)});if(boss){drawCube(boss.x,2,boss.z,3,boss.color);drawCube(boss.x,5,boss.z,1.8,'#ffd166');$('#bossBar').style.width=Math.max(0,boss.hp)+'%';$('#bossHud').classList.remove('hidden');$('#bossName').textContent=boss.name}else $('#bossHud').classList.add('hidden');drawCube(player.x,1.2,player.z,1.15,'#4f9dff',camera.yaw);drawCube(player.x,2.7,player.z,.78,'#d9a47d',camera.yaw);particles.forEach(p=>drawCube(p.x,p.y,p.z,.12,p.col))}
function startGame(){
  let webglReady=!!(gl&&program);
  if(!webglReady){
    try{initGL();webglReady=!!(gl&&program)}catch(err){
      console.warn('WebGL indisponível; usando apresentação compatível.',err);
      gl=null; program=null;
      const n=$('#renderNotice');
      if(n){n.textContent='Modo compatibilidade ativo.';n.classList.remove('hidden')}
    }
  }
  if(sceneMode==='lobby') setupLobby(); else if(webglReady) setupWorld(); else {
    const n=$('#renderNotice'); if(n){n.textContent='3D indisponível nesta máquina. O Lobby continua jogável em modo compatibilidade.';n.classList.remove('hidden')}
  }
  gameRunning=true;
  last=performance.now();
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(loop);
}
function loop(now){if(!gameRunning)return;const dt=Math.min(.033,(now-last)/1000||.016);last=now;if($('#pauseMenu').classList.contains('hidden')){update(dt);try{render()}catch(err){console.error('EchoBound render error',err);gl=null;program=null;}}raf=requestAnimationFrame(loop)}
function save(){try{localStorage.setItem('echobound_v5000',JSON.stringify(state))}catch{}}
function updateHUD(){[$('#hudCoins'),$('#coins')].filter(Boolean).forEach(el=>el.textContent=state.coins);const shardEl=$('#hudShards');if(shardEl)shardEl.textContent=state.shards;const phase=state.phase+1,bossPhase=state.phase%25===24;$('#hudName').textContent=state.name;$('#hudLevel').textContent=state.level;$('#hudCoins').textContent=state.coins;$('#hudShards').textContent=state.shards;$('#regionHud').textContent=REGIONS[state.region][0];$('#phaseHud').textContent=`FASE ${phase}/25`;$('#objective').textContent=bossPhase?'Derrote o Guardião':'Explore, lute e encontre o próximo eco';$('#hpBar').style.width=player.hp+'%';$('#xpBar').style.width=(state.xp%100)+'%';$('#chapterLabel').textContent=bossPhase?'CAPÍTULO BOSS':'CAPÍTULO '+((state.phase%6)+1)+'/6';$('#timerLabel').textContent=bossPhase?'90:00':'60:00'}
function show(id){
  $$('.screen').forEach(x=>x.classList.remove('active'));
  const el=$('#'+id); if(el)el.classList.add('active');
  const hideDock=['lobby','game'].includes(id); $('#dock').classList.toggle('hidden',hideDock);
  if(id==='lobby'){sceneMode='lobby';startGame();} else if(id==='game'){sceneMode='game';startGame();} else {gameRunning=false;}
}
function buildMap(){const g=$('#regionGrid');if(!g)return;g.innerHTML=REGIONS.map((r,i)=>`<button class="panel" data-region="${i}"><b>${i+1}. ${r[0]}</b><small>25 fases • 100 chefes</small></button>`).join('');$$('[data-region]').forEach(b=>b.onclick=()=>{state.region=+b.dataset.region;buildPhases();show('region');save()})}
function buildPhases(){const g=$('#phaseGrid');if(!g)return;$('#regionTitle').textContent=REGIONS[state.region][0];$('#regionEyebrow').textContent=`REGIÃO ${state.region+1}/20`;$('#regionDesc').textContent='25 fases, incluindo uma batalha de Guardião a cada ciclo.';$('#regionStats').innerHTML=`<b>25 fases</b><b>100 chefes</b><b>10 raças</b><b>60/90 min</b>`;g.innerHTML=Array.from({length:25},(_,i)=>{const boss=i===24;return `<button class="panel" data-phase="${i}"><b>${boss?'👑':'⚔️'} Fase ${i+1}</b><small>${boss?'Boss • 90 minutos':'Aventura • 60 minutos'}</small></button>`}).join('');$$('[data-phase]').forEach(b=>b.onclick=()=>{state.phase=+b.dataset.phase;show('game');save()})}
function buildCodex(){const g=$('#bossGrid');if(!g)return;g.innerHTML=Array.from({length:20},(_,r)=>`<article class="panel"><b>${REGIONS[r][0]}</b><p>100 chefes • elementos • arenas • modificadores</p></article>`).join('')}
function buildInventory(){
  const g=$('#inventoryGrid'); if(!g)return;
  const owned=[...new Set(state.inventory)].map(id=>ITEM_BY_ID[id]).filter(Boolean);
  const equipped=Object.values(state.equipped);
  const slots=[['arma','Arma'],['armadura','Armadura'],['relíquia','Relíquia']];
  const slotCards=slots.map(([slot,label])=>{const id=state.equipped[slot],it=ITEM_BY_ID[id];return `<article class="panel equip-slot"><small>${label}</small><b>${it?it.icon+' '+it.name:'— Vazio —'}</b><span>${it?it.rarity+' • Poder +'+it.power:'Nenhum item equipado'}</span></article>`}).join('');
  g.innerHTML=slotCards + (owned.length?owned.map(it=>`<article class="panel item-card"><div class="icon">${it.icon}</div><h3>${it.name}</h3><p>${it.desc}</p><small>${it.rarity} • Poder +${it.power} • ${ownedCount(it.id)}x</small><button ${it.slot==='consumível'?'disabled':''} data-equip="${it.id}">${isEquipped(it.id)?'✅ Equipado':'⚡ Equipar'}</button></article>`).join(''):`<article class="panel"><h3>Inventário vazio</h3><p>Compre itens nos comerciantes do Santuário.</p></article>`);
  $$('[data-equip]').forEach(b=>b.onclick=()=>equipItem(b.dataset.equip));
}

function buildStats(){const g=$('#statsGrid');if(!g)return;const defeated=Math.max(0,Math.floor(state.xp/20));g.innerHTML=[['Nível',state.level],['XP',state.xp],['Echo Coins',state.coins],['Fragmentos',state.shards],['Região atual',`${state.region+1}/20`],['Fase atual',`${state.phase+1}/25`],['Inimigos derrotados',defeated],['Chefes disponíveis','2.000']].map(([a,b])=>`<article class="panel stat-card"><small>${a}</small><b>${b}</b></article>`).join('')}
function buildShop(shop){
  const g=$('#shopGrid'); if(!g)return;
  const sets={Arsenal:['Espada do Eco','Arco Prismático','Lâmina Solar'],Ferreiro:['Armadura Lúmen','Escudo Guardião','Peitoral de Vhar'],Alquimista:['Poção de Vida','Elixir do Eco','Frasco de Velocidade'],Relíquias:['Amuleto Prismático','Relíquia do Eclipse','Fragmento Antigo']};
  g.innerHTML=(sets[shop]||sets.Arsenal).map(name=>{const it=SHOP_ITEMS[name];const owned=ownedCount(it.id);return `<article class="panel item-card"><div class="icon">${it.icon}</div><h3>${it.name}</h3><p>${it.desc}</p><small>${it.rarity} • Poder +${it.power}${owned?' • '+owned+'x no inventário':''}</small><button data-buy="${it.name}">💰 Comprar • ${it.price} ✦</button></article>`}).join('');
  $$('[data-buy]').forEach(b=>b.onclick=()=>buyItem(b.dataset.buy));
}

function bindUI(){
  $$('[data-action]').forEach(b=>b.onclick=()=>{
    const a=b.dataset.action;
    if(a==='map'){buildMap();show('worldMap')}
    else if(a==='back'||a==='lobby'){show('lobby')}
    else if(a==='lobby2'){show('worldMap')}
    else if(a==='online'){show('online')}
    else if(a==='codex'){buildCodex();show('codex')}
    else if(a==='inventory'){buildInventory();show('inventory')}
    else if(a==='pause')$('#pauseMenu').classList.remove('hidden')
    else if(a==='resume')$('#pauseMenu').classList.add('hidden')
    else if(a==='restart'){setupWorld();$('#pauseMenu').classList.add('hidden')}
    else if(a==='continue'){show('game')}
    else if(a==='next'){state.phase=(state.phase+1)%25;setupWorld();$('#victory')?.classList.add('hidden')}
  });
  $('#authToggle')?.addEventListener('click',()=>{
    authMode=authMode==='login'?'register':'login';
    $('#authTitle').textContent=authMode==='login'?'Entrar no EchoBound':'Criar conta EchoBound';
    $('#authSub').textContent=authMode==='login'?'Entre para salvar seu aventureiro e acessar as partidas on-line.':'Crie seu perfil local para começar sua jornada.';
    $('#authConfirmWrap').classList.toggle('hidden',authMode==='login');
    $('#authSubmit').textContent=authMode==='login'?'ENTRAR':'CRIAR CONTA';
    $('#authToggle').textContent=authMode==='login'?'Criar nova conta':'Já tenho uma conta';
  });
  $$('[data-lobby-service]').forEach(b=>b.onclick=()=>openLobbyService(b.dataset.lobbyService,b.dataset.shop));
  $('#authSubmit')?.addEventListener('click',submitAuth);
  $('#guestBtn')?.addEventListener('click',()=>enterGame('Aventureiro'));
  $('#createRoom')?.addEventListener('click',createRoom);
  $('#joinRoom')?.addEventListener('click',joinRoom);
  $('#startOnline')?.addEventListener('click',()=>{state.phase=0;show('game');setupWorld()});
}
async function digestPassword(text){
  if(window.crypto?.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  return btoa(unescape(encodeURIComponent(text)));
}
async function submitAuth(){
  const user=($('#authUser')?.value||'').trim(); const pass=$('#authPass')?.value||''; const pass2=$('#authPass2')?.value||''; const msg=$('#authMsg');
  if(user.length<3||pass.length<4){msg.textContent='Use pelo menos 3 caracteres no usuário e 4 na senha.';return}
  const key='echobound_account_'+user.toLowerCase(); const hash=await digestPassword(pass);
  if(authMode==='register'){
    if(pass!==pass2){msg.textContent='As senhas não conferem.';return}
    if(localStorage.getItem(key)){msg.textContent='Essa conta já existe neste navegador.';return}
    localStorage.setItem(key,JSON.stringify({user,hash,name:user})); enterGame(user);
  }else{
    const account=JSON.parse(localStorage.getItem(key)||'null');
    if(!account||account.hash!==hash){msg.textContent='Usuário ou senha incorretos neste navegador.';return}
    enterGame(account.name||user);
  }
}
function enterGame(name){
  state.name=name; localStorage.setItem('echobound_session',JSON.stringify({name}));
  $('#auth').classList.add('hidden'); $('#topbar').classList.remove('hidden'); $('#app').classList.remove('hidden'); $('#dock').classList.remove('hidden');
  $('#playerName').textContent=name; $('#authMsg').textContent=''; save(); show('lobby');
}
function initAuth(){
  try{const session=JSON.parse(localStorage.getItem('echobound_session')||'null'); if(session?.name){enterGame(session.name);return}}catch{}
  $('#auth').classList.remove('hidden'); $('#topbar').classList.add('hidden'); $('#app').classList.add('hidden'); $('#dock').classList.add('hidden');
}
function randomRoom(){return 'ECHO-'+Math.random().toString(36).slice(2,6).toUpperCase()+'-'+Math.random().toString(36).slice(2,4).toUpperCase()}
function setOnlineStatus(title,details,ok=false){$('#onlineStatus').textContent=title;$('#onlineDetails').textContent=details;$('#onlineDot').textContent='●';$('#onlineDot').style.opacity=ok?'1':'.55'}
function renderRoom(){if(!currentRoom)return;$('#roomPanel').classList.remove('hidden');$('#roomTitle').textContent=currentRoom.name;$('#roomCodeView').innerHTML='<div class="room-code">'+currentRoom.code+'</div><small>Compartilhe este código com seus amigos.</small>';$('#partySlots').innerHTML=currentRoom.players.map((x,i)=>`<span class="party-slot">${i===0?'👑 ':''}${x}</span>`).join('')}
function createRoom(){
  currentRoom={code:randomRoom(),name:($('#roomName').value||'Expedição EchoBound').trim(),mode:$('#onlineMode').value,players:[state.name]}; renderRoom();
  if(ONLINE_WS_URL){connectOnline('create')}else setOnlineStatus('Sala criada • modo demonstração','Código gerado localmente. Para multiplayer real, configure o servidor WebSocket.',false);
}
function joinRoom(){
  const code=($('#joinCode').value||'').trim().toUpperCase(); if(code.length<5){setOnlineStatus('Código inválido','Digite um código de sala como ECHO-7K2P.');return}
  currentRoom={code,name:'Sala '+code,mode:'Cooperação',players:[state.name,'Aventureiro convidado']}; renderRoom();
  if(ONLINE_WS_URL)connectOnline('join');else setOnlineStatus('Sala encontrada • modo demonstração','Conexão multiplayer real será ativada quando o servidor WebSocket estiver configurado.',false);
}
function connectOnline(action){
  try{socket=new WebSocket(ONLINE_WS_URL);setOnlineStatus('Conectando...','Estabelecendo conexão com o servidor de partidas.');socket.onopen=()=>{setOnlineStatus('Online conectado','Sala sincronizada com o servidor.',true);socket.send(JSON.stringify({type:action,room:currentRoom,name:state.name}))};socket.onmessage=e=>{try{const m=JSON.parse(e.data);if(m.room){currentRoom=m.room;renderRoom()}}catch{}};socket.onerror=()=>setOnlineStatus('Servidor indisponível','A sala continua disponível no modo local.');socket.onclose=()=>{if(currentRoom)setOnlineStatus('Conexão encerrada','Você ainda pode jogar localmente.')}}catch(e){setOnlineStatus('Servidor indisponível','Configure ECHOBOUND_CONFIG.wsUrl para ativar o multiplayer real.')}}
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','e','E'].includes(e.key))e.preventDefault();keys[e.key]=true;if(sceneMode==='lobby'&&e.key.toLowerCase()==='e'){interactLobby();return}if(e.code==='Space')attack();if(e.key.toLowerCase()==='r')echo();if(e.key==='Escape')$('#pauseMenu')?.classList.toggle('hidden')});window.addEventListener('keyup',e=>keys[e.key]=false);window.addEventListener('resize',resize);
$('#qualitySelect')?.addEventListener('change',e=>{state.quality=e.target.value;resize();save()});
function boot(){buildMap();buildPhases();buildCodex();buildInventory();bindUI();$('#boot')?.classList.add('hidden');try{initGL();}catch(err){console.error(err);$('#renderNotice').textContent='3D indisponível: ative a aceleração gráfica/WebGL.';$('#renderNotice').classList.remove('hidden')}initAuth();save()}
boot();
