import {processPixels,hasLocalChanges} from './engine.js';
let bitmap=null,preview=null,fileName='photograph',originalSize={width:0,height:0};
function canvas(w,h){return new OffscreenCanvas(w,h);}
function drawSource(w,h){const c=canvas(w,h),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,w,h);return {c,ctx};}
function blurData(c,w,h,factor){const smallW=Math.max(1,Math.round(w/factor)),smallH=Math.max(1,Math.round(h/factor));const small=canvas(smallW,smallH);const sc=small.getContext('2d');sc.imageSmoothingQuality='high';sc.drawImage(c,0,0,smallW,smallH);const wide=canvas(w,h);const wc=wide.getContext('2d',{willReadFrequently:true});wc.imageSmoothingQuality='high';wc.drawImage(small,0,0,w,h);return wc.getImageData(0,0,w,h).data;}
function makeMasks(w,h,state){const masks={},settings=state.masks;
 for(const type of ['sky','ground','subject','brush']){
  if(!hasLocalChanges(state.regions[type]))continue;const strokes=settings.strokes?.[type]||[];const c=canvas(w,h),ctx=c.getContext('2d',{willReadFrequently:true});
  if(type==='sky'||type==='ground'){
   const y=(settings.horizon??.53)*h,feather=Math.max(1,(settings.feather??.13)*h);
   const grad=ctx.createLinearGradient(0,y-feather/2,0,y+feather/2);
   if(type==='sky'){grad.addColorStop(0,'rgba(255,255,255,1)');grad.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle='white';ctx.fillRect(0,0,w,Math.max(0,y-feather/2));ctx.fillStyle=grad;ctx.fillRect(0,Math.max(0,y-feather/2),w,feather+1);}else{
    grad.addColorStop(0,'rgba(255,255,255,0)');grad.addColorStop(1,'rgba(255,255,255,1)');ctx.fillStyle=grad;ctx.fillRect(0,Math.max(0,y-feather/2),w,feather+1);ctx.fillStyle='white';ctx.fillRect(0,y+feather/2,w,h);}
  }else if(type==='subject'){
   const rx=Math.max(1,(settings.subjectWidth??.28)*w),ry=Math.max(1,(settings.subjectHeight??.39)*h),f=Math.max(.01,settings.subjectFeather??.25);
   ctx.save();ctx.translate((settings.subjectX??.5)*w,(settings.subjectY??.54)*h);ctx.scale(rx,ry);const grad=ctx.createRadialGradient(0,0,Math.max(0,1-f),0,0,1);grad.addColorStop(0,'white');grad.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  for(const stroke of strokes){if(!stroke.points?.length)continue;ctx.save();ctx.globalCompositeOperation=stroke.erase?'destination-out':'source-over';ctx.strokeStyle='white';ctx.fillStyle='white';ctx.globalAlpha=stroke.opacity??1;ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=Math.max(2,(stroke.radius||.035)*Math.min(w,h)*2);ctx.beginPath();const pts=stroke.points;ctx.moveTo(pts[0][0]*w,pts[0][1]*h);for(let j=1;j<pts.length;j++)ctx.lineTo(pts[j][0]*w,pts[j][1]*h);if(pts.length===1){ctx.beginPath();ctx.arc(pts[0][0]*w,pts[0][1]*h,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();}else ctx.stroke();ctx.restore();}
  masks[type]=ctx.getImageData(0,0,w,h).data;
 }
 return masks;
}
function renderAt(w,h,state){const {c,ctx}=drawSource(w,h);const image=ctx.getImageData(0,0,w,h);const output=ctx.createImageData(w,h);const detail={};if(state.global.texture||state.global.sharpness)detail.small=blurData(c,w,h,3);if(state.global.clarity||state.global.glow||Object.values(state.regions).some(r=>r.clarity))detail.large=blurData(c,w,h,16);const masks=makeMasks(w,h,state);const histogram=processPixels(image,output,w,h,state,detail,masks);ctx.putImageData(output,0,0);return {c,histogram};}
self.onmessage=async e=>{const m=e.data;
 try{
  if(m.type==='load'){
   if(bitmap)bitmap.close();bitmap=await createImageBitmap(m.file);fileName=m.file.name;originalSize={width:bitmap.width,height:bitmap.height};const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));preview={width:Math.max(1,Math.round(bitmap.width*scale)),height:Math.max(1,Math.round(bitmap.height*scale))};self.postMessage({type:'loaded',name:fileName,...originalSize,preview});
  }else if(m.type==='render'){
   if(!bitmap)return;const {c,histogram}=renderAt(preview.width,preview.height,m.state);const blob=await c.convertToBlob({type:'image/jpeg',quality:.94});self.postMessage({type:'rendered',id:m.id,blob,histogram:Array.from(histogram)});
  }else if(m.type==='export'){
   if(!bitmap)return;const limit=m.limit==='original'?Infinity:parseInt(m.limit,10)||Infinity;const scale=Math.min(1,limit/Math.max(bitmap.width,bitmap.height));const w=Math.max(1,Math.round(bitmap.width*scale)),h=Math.max(1,Math.round(bitmap.height*scale));if(w*h>36000000)throw new Error('This image is unusually large. Choose a smaller export size to avoid memory limits.');
   const {c}=renderAt(w,h,m.state);const type=['image/png','image/jpeg','image/webp'].includes(m.format)?m.format:'image/jpeg';let exportCanvas=c;if(type==='image/jpeg'){exportCanvas=canvas(w,h);const ectx=exportCanvas.getContext('2d');ectx.fillStyle='white';ectx.fillRect(0,0,w,h);ectx.drawImage(c,0,0);}const blob=await exportCanvas.convertToBlob({type,quality:m.quality});self.postMessage({type:'exported',blob,format:type,width:w,height:h,name:fileName});
  }
 }catch(err){self.postMessage({type:'error',operation:m.type,message:err?.message||String(err)});}
};
