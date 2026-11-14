import test from 'node:test';
import assert from 'node:assert/strict';
import {clamp,smooth,luma,curveLUT,rgbToHsl,hslToRgb,maskStrength,processPixels,grainNoise} from '../src/engine.js';
import {freshState,applyPreset,PRESETS} from '../src/presets.js';

test('identity default pipeline preserves RGB and alpha approximately',()=>{
 const src=new Uint8ClampedArray([0,32,128,255,255,170,50,255,0,0,0,0,220,190,60,255]);
 const out=new Uint8ClampedArray(src.length); const hist=processPixels(src,out,2,2,freshState());
 for(let i=0;i<src.length;i++)assert.ok(Math.abs(src[i]-out[i])<=1,`${i} ${src[i]} vs ${out[i]}`);
 assert.equal(hist.length,256);
});
test('exposure brightens and shadows darken',()=>{
 const src=new Uint8ClampedArray([70,90,120,255]);const out=new Uint8ClampedArray(4);
 const bright=freshState();bright.global.exposure=1;processPixels(src,out,1,1,bright);assert.ok(out[0]>src[0]);
 const dark=freshState();dark.global.exposure=-1;processPixels(src,out,1,1,dark);assert.ok(out[2]<src[2]);
});
test('levels remap black/white points',()=>{const src=new Uint8ClampedArray([64,128,224,255]),out=new Uint8ClampedArray(4),s=freshState();s.global.levelBlack=70;s.global.levelWhite=210;processPixels(src,out,1,1,s);assert.equal(out[0],0);assert.equal(out[2],255);});
test('curve lookup handles endpoints and shape',()=>{const a=curveLUT([[0,0],[.5,.7],[1,1]]);assert.equal(a[0],0);assert.equal(a[255],1);assert.ok(a[128]>.69);});
test('HSL roundtrip works for natural colours',()=>{for(const rgb of [[.7,.2,.1],[.1,.4,.8],[.8,.85,.2],[.33,.33,.33]]){const [h,s,l]=rgbToHsl(...rgb),out=hslToRgb(h,s,l);rgb.forEach((v,i)=>assert.ok(Math.abs(v-out[i])<.00001));}});
test('region masks follow horizon and ellipse',()=>{const m={horizon:.52,feather:.15,subjectX:.4,subjectY:.4,subjectWidth:.2,subjectHeight:.3,subjectFeather:.3};assert.ok(maskStrength('sky',.3,.1,m)>.98);assert.ok(maskStrength('sky',.3,.9,m)<.02);assert.ok(maskStrength('ground',.3,.9,m)>.98);assert.ok(maskStrength('subject',.4,.4,m)>.98);assert.equal(maskStrength('subject',.99,.99,m),0);});
test('preset application preserves local masks',()=>{const s=freshState();s.masks.horizon=.31;s.regions.sky.exposure=1.2;const p=applyPreset(s,'gold');assert.equal(p.masks.horizon,.31);assert.equal(p.regions.sky.exposure,1.2);assert.notEqual(p.global.temperature,0);assert.equal(PRESETS.length,9);});
test('grain is deterministic',()=>{assert.equal(grainNoise(21,31),grainNoise(21,31));assert.notEqual(grainNoise(21,31),grainNoise(22,31));});
test('clamp and smooth monotonic',()=>{assert.equal(clamp(-3),0);assert.equal(clamp(3),1);assert.ok(smooth(0,1,.25)<smooth(0,1,.5));assert.ok(luma(1,1,1)>.999);});

test('regional mask changes only selected pixels',()=>{
 const src=new Uint8ClampedArray([90,100,110,255,90,100,110,255]),dst=new Uint8ClampedArray(src.length),s=freshState();s.regions.sky.exposure=1;const mask=new Uint8ClampedArray([255,255,255,255,0,0,0,0]);processPixels(src,dst,2,1,s,{}, {sky:mask});assert.ok(dst[0]>src[0]);assert.equal(dst[4],src[4]);
});
test('presets are numerically finite in every declared adjustment',()=>{for(const p of PRESETS){for(const [k,v] of Object.entries(p.global))assert.ok(Number.isFinite(v),p.id+' '+k);for(const channel of p.hsl)for(const v of Object.values(channel))assert.ok(Number.isFinite(v),p.id);}});
