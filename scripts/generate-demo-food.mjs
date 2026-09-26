// Original, deterministic stylized demo assets. No external model licenses needed.
import * as T from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mkdir, writeFile } from 'node:fs/promises';

globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(result => { this.result = result; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then(result => { this.result = `data:${blob.type};base64,${Buffer.from(result).toString('base64')}`; this.onloadend?.(); }); }
};
let seed = 71;
const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const materials = new Map();
const mat = color => { if (!materials.has(color)) materials.set(color, new T.MeshStandardMaterial({ color, roughness: .68 })); return materials.get(color); };
const sphere = new T.SphereGeometry(1, 24, 16);
const mesh = (g, geometry, color, position, scale = [1,1,1]) => {
  const m = new T.Mesh(geometry, mat(color)); m.position.set(...position); m.scale.set(...scale); g.add(m); return m;
};
const oval = (g, c, p, s) => mesh(g, sphere, c, p, s);
const disk = (g,c,r,h,y,x=0,z=0) => mesh(g,new T.CylinderGeometry(r,r,h,48),c,[x,y,z]);
const tube = (g,c,points,r=.025) => mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),48,r,8,false),c,[0,0,0]);
function plate(g,r=1.25) {
  disk(g,'#ebe6dc',r,.07,.035);
  const rim=mesh(g,new T.TorusGeometry(r-.08,.055,10,64),'#f8f5ed',[0,.09,0]); rim.rotation.x=Math.PI/2;
}
function scatter(g,n,color,center,radius,y,size=.018) {
  for(let i=0;i<n;i++){ const a=random()*Math.PI*2,r=Math.sqrt(random())*radius; oval(g,color,[center[0]+Math.cos(a)*r,y+random()*.02,center[1]+Math.sin(a)*r],[size,size*.5,size*1.6]); }
}
function leaf(g,x,y,z,s=.15){const m=oval(g,'#39823c',[x,y,z],[s,.025,s*.45]);m.rotation.y=random()*6;}
const builders = {
  burger(g) {
    plate(g); oval(g,'#bb732e',[0,.23,0],[.8,.16,.76]);
    for(const y of [.43,.66]){oval(g,'#543021',[0,y,0],[.78,.13,.74]); const cheese=mesh(g,new T.BoxGeometry(1.3,.025,1.3),'#edb94d',[0,y+.11,0]);cheese.rotation.y=y*2;}
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;leaf(g,Math.cos(a)*.64,.34,Math.sin(a)*.64,.25);}
    oval(g,'#d89342',[0,.92,0],[.82,.29,.78]);
    for(let i=0;i<75;i++){const a=random()*6.28,r=Math.sqrt(random())*.72;oval(g,'#f4dfaa',[r*Math.cos(a),.92+.29*Math.sqrt(1-r*r/.67),r*Math.sin(a)],[.025,.01,.012]);}
  },
  shake(g) {
    disk(g,'#eee4df',.47,.1,.06);
    mesh(g,new T.CylinderGeometry(.46,.31,1.25,48),'#ea9faf',[0,.72,0]);
    for(let i=0;i<4;i++) oval(g,'#fff4e3',[0,1.4+i*.12,0],[.43-i*.09,.15,.43-i*.09]);
    tube(g,'#d95272',[[.26,1,0],[.26,1.9,0],[.43,2.04,0]],.035);
    oval(g,'#c32e43',[-.27,1.51,.05],[.16,.21,.14]);leaf(g,-.27,1.71,.05,.14);
  },
  ramen(g) {
    mesh(g,new T.LatheGeometry([[.0,.03],[.45,.03],[.65,.12],[.88,.4],[1,.7],[1,.75],[.94,.75],[.81,.4],[.4,.16],[0,.16]].map(p=>new T.Vector2(...p)),48),'#253d47',[0,0,0]);
    disk(g,'#b97531',.92,.04,.63);
    for(let i=0;i<16;i++){const z=-.65+i*.08;const w=Math.sqrt(.75*.75-z*z);tube(g,'#ebc779',[[-w,.68,z],[-w*.4,.7,z+.05],[w*.4,.68,z-.04],[w,.68,z]],.025);}
    for(let i=0;i<3;i++) {oval(g,'#ba7965',[-.5+i*.38,.75,-.35],[.26,.035,.23]);oval(g,'#e4b49c',[-.5+i*.38,.78,-.35],[.16,.01,.12]);}
    oval(g,'#ffefcb',[.4,.76,.32],[.3,.06,.22]);oval(g,'#ed9b20',[.4,.82,.32],[.13,.025,.12]);
    scatter(g,60,'#478846',[0,0],.8,.79,.026);
    const nori=mesh(g,new T.BoxGeometry(.4,.48,.02),'#243928',[-.65,.94,-.15]);nori.rotation.z=-.3;
  },
  pizza(g) {
    plate(g,1.35);disk(g,'#c68c42',1.16,.12,.18);disk(g,'#a93422',1.04,.025,.25);disk(g,'#edc776',.99,.025,.27);
    const rim=mesh(g,new T.TorusGeometry(1.08,.095,12,64),'#d99f50',[0,.25,0]);rim.rotation.x=Math.PI/2;
    oval(g,'#fff1d5',[0,.41,0],[.34,.21,.33]);
    for(let i=0;i<12;i++){const a=i*.524;leaf(g,.73*Math.cos(a),.31,.73*Math.sin(a),.19);}
    scatter(g,40,'#534133',[0,0],.92,.3,.026);
  },
  tempura(g) {
    plate(g);
    for(let i=0;i<4;i++) {const z=-.55+i*.35; const points=[[-.65,.22,z],[-.32,.3,z-.06],[.12,.34,z],[.52,.3,z+.1]];tube(g,'#dea047',points,.14);
      for(let j=0;j<50;j++){const x=-.65+random()*1.13;oval(g,j%2?'#efbd65':'#b57932',[x,.35+random()*.07,z+(random()-.5)*.2],[.035,.026,.03]);}
      oval(g,'#dd6d39',[.64,.32,z+.14],[.18,.035,.08]);
    }leaf(g,-.8,.2,.55,.3);
  },
  croissant(g) {
    plate(g);
    for(let i=0;i<15;i++){const a=-1.25+i/14*2.5; const s=.12+.2*Math.sin(i/14*Math.PI);const m=oval(g,i%2?'#cc883f':'#e4ad63',[Math.sin(a)*.83,.22+s*.4,Math.cos(a)*.52-.2],[s*.65,s,s]);m.rotation.y=-a;}
    for(let i=0;i<7;i++) tube(g,'#98a953',[[-.47+i*.15,.48,-.15],[-.5+i*.15,.55,.06],[-.47+i*.15,.46,.25]],.025);
    scatter(g,70,'#678641',[0,.06],.49,.53,.026);
  },
  steak(g) {
    plate(g); const meat=oval(g,'#754331',[-.2,.25,0],[.77,.14,.57]);meat.rotation.y=.3;
    for(let i=0;i<6;i++)tube(g,'#34291f',[[-.72+i*.19,.365,-.3],[-.62+i*.19,.392,0],[-.52+i*.19,.36,.3]],.018);
    mesh(g,new T.BoxGeometry(.18,.055,.16),'#f6d886',[-.25,.41,.04]);
    for(let i=0;i<5;i++) {tube(g,'#4e813a',[[.68+i*.07,.19,-.6],[.64+i*.07,.18,.5]],.034);oval(g,'#38622a',[.68+i*.07,.2,-.64],[.047,.04,.12]);}
  },
  sushi(g) {
    mesh(g,new T.BoxGeometry(2.3,.09,1.3),'#253c40',[0,.045,0]);
    for(let i=0;i<6;i++){const x=-.84+(i%3)*.82,z=i<3?-.3:.3;disk(g,'#233728',.29,.3,.24,x,z);disk(g,'#f4e7c7',.265,.02,.399,x,z);disk(g,'#ad6740',.115,.021,.413,x,z);
      const av=oval(g,'#92b84f',[x,.47,z],[.3,.055,.16]);av.rotation.y=.3;
      scatter(g,12,'#ecdfb4',[x,z],.23,.53,.014);}
  },
  cake(g) {
    plate(g);mesh(g,new T.CylinderGeometry(.49,.57,.58,48),'#4b2b20',[0,.39,0]);disk(g,'#81933f',.22,.02,.69);
    tube(g,'#81933f',[[.1,.7,.1],[.35,.68,.22],[.46,.4,.28],[.54,.13,.32],[.72,.11,.38]],.065);
    for(let i=0;i<5;i++)oval(g,'#9c2441',[.77*Math.cos(i),.18,.77*Math.sin(i)],[.1,.11,.1]);
    scatter(g,90,'#f3ead5',[0,0],.46,.7,.008);leaf(g,-.68,.15,-.25,.2);
  }
};
await mkdir(new URL('../public/models/demo/',import.meta.url),{recursive:true});
for(const [name,build] of Object.entries(builders)) {
  const scene=new T.Scene();const group=new T.Group();group.name=`Stylized demo ${name}`;scene.add(group);build(group);
  const binary=await new GLTFExporter().parseAsync(scene,{binary:true});
  await writeFile(new URL(`../public/models/demo/${name}.glb`,import.meta.url),Buffer.from(binary));
  console.log(`${name}: ${binary.byteLength} bytes`);
}
