import fs from 'fs';
const css = fs.readFileSync(process.argv[2],'utf8');
const pal = {};
for (const m of css.matchAll(/--([a-z]+-\d+):\s*oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/g)) pal[m[1]] = [+m[2],+m[3],+m[4]];
function oklchToLin([L,C,h]){const a=C*Math.cos(h*Math.PI/180),b=C*Math.sin(h*Math.PI/180);
 const l_=L+0.3963377774*a+0.2158037573*b,m_=L-0.1055613458*a-0.0638541728*b,s_=L-0.0894841775*a-1.2914855480*b;
 const l=l_**3,m=m_**3,s=s_**3;
 return [4.0767416621*l-3.3077115913*m+0.2309699292*s,-1.2684380046*l+2.6097574011*m-0.3413193965*s,-0.0041960863*l-0.7034186147*m+1.7076147010*s];}
const enc=x=>{x=Math.min(1,Math.max(0,x));return x<=0.0031308?12.92*x:1.055*x**(1/2.4)-0.055};
const hex=c=>'#'+oklchToLin(c).map(v=>Math.round(enc(v)*255).toString(16).padStart(2,'0')).join('');
const lum=c=>{const [r,g,b]=oklchToLin(c).map(v=>Math.min(1,Math.max(0,v)));return 0.2126*r+0.7152*g+0.0722*b};
const out=[];for(const [k,v] of Object.entries(pal)){const lin=oklchToLin(v);if(lin.some(x=>x<-0.001||x>1.001))out.push(k)}
console.log('OUT OF sRGB GAMUT:',out.join(', ')||'none');
const resolve=(block,name)=>{const m=block.match(new RegExp(`--md-${name}:\\s*([^;]+);`));if(!m)return null;const v=m[1].trim();if(v==='#FFFFFF')return[1,0,0];const r=v.match(/var\(--([a-z]+-\d+)\)/);return pal[r[1]];};
const [ ,light,dark]=css.split(/Layer 2: Material roles/);
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};
const pairs=[['on-primary','primary'],['on-primary-container','primary-container'],['on-secondary','secondary'],['on-secondary-container','secondary-container'],['on-tertiary','tertiary'],['on-tertiary-container','tertiary-container'],['on-error','error'],['on-error-container','error-container'],['on-success','success'],['on-success-container','success-container'],['on-surface','surface'],['on-surface-variant','surface'],['on-surface-variant','surface-container'],['on-surface-variant','surface-container-high'],['primary','surface'],['secondary','surface'],['tertiary','surface'],['error','surface'],['success','surface'],['outline','surface'],['inverse-on-surface','inverse-surface'],['inverse-primary','inverse-surface']];
for(const [name,block] of [['LIGHT',light],['DARK',dark]]){console.log('\n'+name);for(const [f,b] of pairs){const r=ratio(resolve(block,f),resolve(block,b));console.log(`${(f+' on '+b).padEnd(48)} ${r.toFixed(2).padStart(5)} ${r>=4.5?'AA':r>=3?'AA-large/UI':'FAIL'}`)}}
console.log('\nHEX');for(const [k,v] of Object.entries(pal))if(/-(25|50|300|600|800|950)$/.test(k))process.stdout.write(`${k}=${hex(v)} `);
