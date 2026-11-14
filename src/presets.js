export const CHANNELS = ['Red', 'Orange', 'Yellow', 'Green', 'Aqua', 'Blue', 'Purple', 'Magenta'];
export const DEFAULT = Object.freeze({
  exposure:0, contrast:0, highlights:0, shadows:0, whites:0, blacks:0,
  temperature:0, tint:0, vibrance:0, saturation:0,
  levelBlack:0, levelWhite:255, levelGamma:1,
  clarity:0, texture:0, dehaze:0, glow:0, vignette:0,
  grain:0, grainSize:36, sharpness:0,
});
export const LOCAL_DEFAULT = Object.freeze({exposure:0,contrast:0,temperature:0,tint:0,saturation:0,clarity:0,dehaze:0});
export function freshState(){
  return {
    global:{...DEFAULT},
    hsl:CHANNELS.map(()=>({h:0,s:0,l:0})),
    grading:{shadows:{h:32,s:0},midtones:{h:37,s:0},highlights:{h:43,s:0},balance:0},
    curve:[[0,0],[0.25,0.25],[0.5,0.5],[0.75,0.75],[1,1]],
    regions:{sky:{...LOCAL_DEFAULT},ground:{...LOCAL_DEFAULT},subject:{...LOCAL_DEFAULT},brush:{...LOCAL_DEFAULT}},
    masks:{horizon:0.53,feather:0.13,subjectX:0.5,subjectY:0.54,subjectWidth:0.28,subjectHeight:0.39,subjectFeather:0.25,
      strokes:{sky:[],ground:[],subject:[],brush:[]}}
  };
}
const hsl = (obj={}) => CHANNELS.map(name=>({h:0,s:0,l:0,...(obj[name]||{})}));
const grade = (shadows=[32,0],midtones=[37,0],highlights=[43,0],balance=0)=>({shadows:{h:shadows[0],s:shadows[1]},midtones:{h:midtones[0],s:midtones[1]},highlights:{h:highlights[0],s:highlights[1]},balance});
export const PRESETS = [
 {id:'untouched',name:'Unvarnished',sub:'Original light',palette:['#b8c1bb','#777e70','#d8c9ae'],global:{},hsl:hsl(),grading:grade()},
 {id:'gold',name:'The Gilded Hour',sub:'Amber · late Romantic',palette:['#423c2b','#937148','#dfbe76'],global:{exposure:-0.46,contrast:16,highlights:-44,shadows:-29,whites:-25,blacks:-23,temperature:42,tint:4,vibrance:-12,saturation:-9,clarity:-17,texture:-12,dehaze:-8,vignette:-20,grain:18},hsl:hsl({Yellow:{h:-22,s:-17,l:-13},Green:{h:-34,s:-47,l:-19},Blue:{s:-58,l:-18}}),grading:grade([33,12],[36,17],[45,29],16)},
 {id:'ophelia',name:'Ophelia’s Garden',sub:'Verdant · Millais',palette:['#182c25','#526a47','#c2b07d'],global:{exposure:-0.1,contrast:11,highlights:-26,shadows:8,temperature:9,tint:-6,vibrance:6,saturation:-6,clarity:-7,texture:10,glow:9,vignette:-10},hsl:hsl({Green:{h:-13,s:-13,l:-17},Yellow:{h:-16,s:4,l:-6},Aqua:{s:-30}}),grading:grade([165,9],[48,7],[47,14],-5)},
 {id:'rossetti',name:'Rossetti Reverie',sub:'Rose · burnished colour',palette:['#37212c','#95594e','#d5a07c'],global:{contrast:13,highlights:-25,shadows:2,temperature:18,tint:18,vibrance:2,saturation:-5,clarity:-10,texture:-8,glow:10,vignette:-14,grain:10},hsl:hsl({Red:{h:5,s:12,l:-6},Orange:{s:3,l:-9},Green:{s:-24},Blue:{s:-30}}),grading:grade([350,13],[14,12],[37,16],3)},
 {id:'ruskin',name:'Ruskin Study',sub:'Slate · silver light',palette:['#29363a','#738787','#b1bcb6'],global:{exposure:-0.17,contrast:18,highlights:-37,shadows:-4,temperature:-19,tint:-2,vibrance:-30,saturation:-24,clarity:12,texture:13,dehaze:9,vignette:-12,grain:11},hsl:hsl({Yellow:{s:-40},Green:{s:-45},Blue:{s:-16,l:-13}}),grading:grade([207,12],[191,8],[43,5],-7)},
 {id:'vesper',name:'Vesper Nocturne',sub:'Twilight · ink shadows',palette:['#0b1e28','#25454e','#b7a078'],global:{exposure:-0.8,contrast:24,highlights:-48,shadows:-33,whites:-18,blacks:-26,temperature:-9,vibrance:-25,saturation:-13,clarity:-12,dehaze:11,vignette:-30,grain:17},hsl:hsl({Yellow:{s:-29,l:-25},Green:{s:-45,l:-25},Blue:{h:-12,s:-22,l:-24}}),grading:grade([208,22],[187,12],[40,16],-16)},
 {id:'albumen',name:'Antique Albumen',sub:'Sepia · photographic plate',palette:['#372d22','#806849','#d4c095'],global:{exposure:0.07,contrast:7,highlights:-27,shadows:2,temperature:32,vibrance:-93,saturation:-80,clarity:-14,texture:-12,glow:8,vignette:-23,grain:30,levelBlack:8,levelWhite:246},hsl:hsl(),grading:grade([31,23],[39,22],[45,27],8)},
 {id:'woodland',name:'Woodland Psalm',sub:'Umber · filtered sunlight',palette:['#283122','#6d6440','#c8ad6d'],global:{exposure:-0.34,contrast:10,highlights:-40,shadows:-18,temperature:31,tint:-6,vibrance:-12,saturation:-14,clarity:-11,texture:-7,dehaze:-7,glow:12,vignette:-19,grain:14},hsl:hsl({Green:{h:-30,s:-35,l:-16},Yellow:{h:-18,s:-12,l:-12},Blue:{s:-47}}),grading:grade([44,9],[40,14],[48,25],14)},
 {id:'bloom',name:'Gothic Bloom',sub:'Garnet · deep velvets',palette:['#211d26','#6e3f4b','#aa8367'],global:{exposure:-0.28,contrast:23,highlights:-31,shadows:-17,blacks:-14,temperature:14,tint:17,vibrance:4,saturation:-15,clarity:1,texture:-4,vignette:-25,grain:13},hsl:hsl({Red:{h:-6,s:12},Green:{s:-32,l:-15},Blue:{h:10,s:-34}}),grading:grade([306,12],[352,11],[35,17],-3)}
];
export function applyPreset(state,preset){const p=typeof preset==='string'?PRESETS.find(x=>x.id===preset):preset;if(!p)return state;return {...state,global:{...DEFAULT,...p.global},hsl:structuredClone(p.hsl),grading:structuredClone(p.grading),curve:[[0,0],[.25,.25],[.5,.5],[.75,.75],[1,1]]};}
