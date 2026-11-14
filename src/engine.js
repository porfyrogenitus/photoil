// Pure pixel mathematics, shared by browser worker and Node tests. All work remains on the user's device.
export const clamp=(x,a=0,b=1)=>x<a?a:x>b?b:x;
export const mix=(a,b,t)=>a+(b-a)*t;
export const smooth=(a,b,x)=>{if(a===b)return x>=b?1:0;const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
export const luma=(r,g,b)=>r*.2126+g*.7152+b*.0722;
export function curveLUT(points){
  const ps=(points||[[0,0],[1,1]]).map(p=>[clamp(Number(p[0])),clamp(Number(p[1]))]).sort((a,b)=>a[0]-b[0]);
  const table=new Float32Array(256);let j=0;
  for(let i=0;i<256;i++){const x=i/255;while(j<ps.length-2&&x>ps[j+1][0])j++;const a=ps[j],b=ps[j+1];const t=clamp((x-a[0])/Math.max(.00001,b[0]-a[0]));table[i]=mix(a[1],b[1],t);}
  return table;
}
export function hsvToRgb(h,s,v){h=((h%360)+360)%360;s=clamp(s);v=clamp(v);const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let a=[0,0,0];if(h<60)a=[c,x,0];else if(h<120)a=[x,c,0];else if(h<180)a=[0,c,x];else if(h<240)a=[0,x,c];else if(h<300)a=[x,0,c];else a=[c,0,x];return [a[0]+m,a[1]+m,a[2]+m];}
export function rgbToHsl(r,g,b){const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2;let h=0,s=0;if(d>1e-7){s=d/(1-Math.abs(2*l-1)+1e-8);switch(max){case r:h=((g-b)/d)%6;break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}h=(h*60+360)%360;}return [h,s,l];}
export function hslToRgb(h,s,l){h=((h%360)+360)%360;s=clamp(s);l=clamp(l);const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let a;if(h<60)a=[c,x,0];else if(h<120)a=[x,c,0];else if(h<180)a=[0,c,x];else if(h<240)a=[0,x,c];else if(h<300)a=[x,0,c];else a=[c,0,x];return [a[0]+m,a[1]+m,a[2]+m];}
const sectorHues=[0,30,60,120,180,240,270,315];
export function hslMixer(r,g,b,channels){if(!channels)return [r,g,b];let [h,s,l]=rgbToHsl(clamp(r),clamp(g),clamp(b));let dh=0,ds=0,dl=0,sum=0;for(let k=0;k<8;k++){const c=channels[k];if(!c||(!c.h&&!c.s&&!c.l))continue;const d=Math.abs(((h-sectorHues[k]+540)%360)-180),w=Math.pow(Math.max(0,1-d/65),2);dh+=w*c.h;ds+=w*c.s;dl+=w*c.l;sum+=w;}if(sum<.00001)return [r,g,b];h+=dh;s=clamp(s*(1+ds/100));l=clamp(l+dl/200);return hslToRgb(h,s,l);}
export function gradePixel(r,g,b,grade){if(!grade)return [r,g,b];const lum=luma(r,g,b),bal=(grade.balance||0)/100;const sh=1-smooth(.08+bal*.07,.57+bal*.07,lum),hi=smooth(.42+bal*.07,.93+bal*.07,lum),mid=clamp(1-Math.max(sh,hi));const triples=[['shadows',sh],['midtones',mid],['highlights',hi]];for(const [key,w] of triples){const g2=grade[key];if(!g2||!g2.s)continue;const [cr,cg,cb]=hsvToRgb(g2.h,1,1);const amount=w*g2.s/100*.24;r+=amount*(cr-.5);g+=amount*(cg-.5);b+=amount*(cb-.5);}return [r,g,b];}
export function basicTone(r,g,b,a){
  // Values are assumed to be gamma-encoded sRGB in 0..1.
  const exp=Math.pow(2,a.exposure||0);r*=exp;g*=exp;b*=exp;
  const lum=luma(r,g,b),con=(a.contrast||0)/100;
  const shift=(a.shadows||0)/100*.27*(1-smooth(.08,.57,lum))+(a.highlights||0)/100*.28*smooth(.43,.91,lum)+(a.blacks||0)/100*.18*(1-smooth(0,.32,lum))+(a.whites||0)/100*.18*smooth(.65,1,lum);
  r=(r-.5)*(1+con)+.5+shift;g=(g-.5)*(1+con)+.5+shift;b=(b-.5)*(1+con)+.5+shift;
  const t=(a.temperature||0)/100*.14,ti=(a.tint||0)/100*.085;r+=t+ti*.4;g-=ti;b-=t-ti*.4;
  const l=luma(r,g,b),sat=1+(a.saturation||0)/100;const vib=(a.vibrance||0)/100*(1-Math.min(1,(Math.max(r,g,b)-Math.min(r,g,b))*1.3));
  const k=Math.max(0,sat+vib);return [l+(r-l)*k,l+(g-l)*k,l+(b-l)*k];
}
export function localTone(r,g,b,a){const ex=Math.pow(2,a.exposure||0);r*=ex;g*=ex;b*=ex;const c=1+(a.contrast||0)/100;r=(r-.5)*c+.5;g=(g-.5)*c+.5;b=(b-.5)*c+.5;const t=(a.temperature||0)/100*.14,ti=(a.tint||0)/100*.085;r+=t+ti*.4;g-=ti;b-=t-ti*.4;const l=luma(r,g,b),s=1+(a.saturation||0)/100;r=l+(r-l)*s;g=l+(g-l)*s;b=l+(b-l)*s;const d=(a.dehaze||0)/100*.35;return [(r-.5)* (1+d)+.5,(g-.5)*(1+d)+.5,(b-.5)*(1+d)+.5];}
export function levels(r,g,b,a,table){const black=(a.levelBlack||0)/255,white=(a.levelWhite??255)/255,gamma=Math.max(.15,a.levelGamma||1);const f=x=>{const v=Math.pow(clamp((x-black)/Math.max(.01,white-black)),1/gamma);return table[Math.round(v*255)];};return [f(r),f(g),f(b)];}
export function grainNoise(x,y,seed=173){let h=Math.imul(x+seed,374761393)^Math.imul(y+seed*3,668265263);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295-.5;}
export function maskStrength(type,x,y,params){const horizon=clamp(params.horizon??.53),feather=Math.max(.005,params.feather??.13);if(type==='sky')return 1-smooth(horizon-feather/2,horizon+feather/2,y);if(type==='ground')return smooth(horizon-feather/2,horizon+feather/2,y);if(type==='subject'){const dx=(x-(params.subjectX??.5))/Math.max(.01,params.subjectWidth??.28),dy=(y-(params.subjectY??.54))/Math.max(.01,params.subjectHeight??.39);const d=Math.hypot(dx,dy);const f=clamp(params.subjectFeather??.25,.01,.95);return 1-smooth(1-f,1,d);}return 0;}
export function hasLocalChanges(settings){return Object.values(settings||{}).some(x=>Math.abs(Number(x))>.00001);}
export function processPixels(source,output,w,h,state,detail={},masks={}){
  const src=source.data||source,dst=output.data||output,g=state.global,channels=state.hsl,grading=state.grading,table=curveLUT(state.curve);const hist=new Uint32Array(256);
  const rKeys=Object.keys(state.regions).filter(k=>hasLocalChanges(state.regions[k]));const useHsl=channels.some(c=>c.h||c.s||c.l),useGrade=Object.values(grading).some(v=>typeof v==='object'&&v.s>0);
  const strongTexture=(g.texture||0)/100*.6,sharp=(g.sharpness||0)/100*.55,clarity=(g.clarity||0)/100*.58;
  const grain=(g.grain||0)/100*.10,grainScale=Math.max(1,Math.round(1+(g.grainSize||36)/50));const dehaze=(g.dehaze||0)/100*.45;
  const glow=(g.glow||0)/100*.25,vig=(g.vignette||0)/100*.8;const fw=Math.max(1,w-1),fh=Math.max(1,h-1);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=(y*w+x)*4,alpha=src[i+3];if(!alpha){dst[i]=dst[i+1]=dst[i+2]=dst[i+3]=0;continue;}
    let r=src[i]/255,gg=src[i+1]/255,b=src[i+2]/255;
    [r,gg,b]=basicTone(r,gg,b,g);
    if(useHsl)[r,gg,b]=hslMixer(r,gg,b,channels);
    if(useGrade)[r,gg,b]=gradePixel(r,gg,b,grading);
    [r,gg,b]=levels(r,gg,b,g,table);
    if(dehaze){const lum=luma(r,gg,b);const strength=dehaze*(.65+.35*(1-lum));r=(r-.5)*(1+strength)+.5;gg=(gg-.5)*(1+strength)+.5;b=(b-.5)*(1+strength)+.5;}
    for(const key of rKeys){const mm=masks[key];const m=mm?mm[i+3]/255:maskStrength(key,x/fw,y/fh,state.masks);if(m>.0001){const [rr,ggg,bb]=localTone(r,gg,b,state.regions[key]);r=mix(r,rr,m);gg=mix(gg,ggg,m);b=mix(b,bb,m);}}
    const ds=detail.small,dl=detail.large;
    if(ds&&(strongTexture||sharp)){const amount=strongTexture+sharp;r+=(src[i]-ds[i])/255*amount;gg+=(src[i+1]-ds[i+1])/255*amount;b+=(src[i+2]-ds[i+2])/255*amount;}
    if(dl&&(clarity||glow)){const lr=luma(src[i],src[i+1],src[i+2])/255,lb=luma(dl[i],dl[i+1],dl[i+2])/255;const difference=(lr-lb)*clarity;r+=difference;gg+=difference;b+=difference;if(glow){const bloom=Math.max(0,lb-.34)*glow;r=mix(r,Math.max(r,dl[i]/255),bloom);gg=mix(gg,Math.max(gg,dl[i+1]/255),bloom);b=mix(b,Math.max(b,dl[i+2]/255),bloom);}}
    for(const key of rKeys){const local=state.regions[key];if(!local.clarity)continue;const mm=masks[key],m=mm?mm[i+3]/255:maskStrength(key,x/fw,y/fh,state.masks);if(dl&&m){const a=luma(src[i],src[i+1],src[i+2])/255-luma(dl[i],dl[i+1],dl[i+2])/255;const v=a*local.clarity/100*.45*m;r+=v;gg+=v;b+=v;}}
    if(vig){const nx=(x/fw-.5)*1.5,ny=(y/fh-.5)*1.5;const dist=clamp(Math.hypot(nx,ny));const v=1-vig*smooth(.18,1,dist);r*=v;gg*=v;b*=v;}
    if(grain){const n=grainNoise(Math.floor(x/grainScale),Math.floor(y/grainScale))*grain;r+=n;gg+=n;b+=n;}
    dst[i]=Math.round(clamp(r)*255);dst[i+1]=Math.round(clamp(gg)*255);dst[i+2]=Math.round(clamp(b)*255);dst[i+3]=alpha;
    if((x%3===0)&&(y%3===0))hist[Math.round(luma(dst[i],dst[i+1],dst[i+2]))]++;
  }
  return hist;
}
