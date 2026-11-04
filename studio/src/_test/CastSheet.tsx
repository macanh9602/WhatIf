import React,{useEffect,useRef,useState} from 'react';
import {AbsoluteFill,continueRender,delayRender,useCurrentFrame} from 'remotion';
import {Pen,bodyFront,Outfit,FrontOpts,POSES} from '../videos/owen/toon';
import {OWEN,MOM,PATEL,THEO,classmate,swim} from '../videos/owen/people';
const NAMED:[string,Outfit,FrontOpts][]=[['Owen',OWEN,{expr:'proud_chin',reach:POSES.hands_on_hips}],['Dana / Mom',MOM,{expr:'deadpan'}],['Mrs. Patel',PATEL,{expr:'sideeye'}],['Theo',THEO,{expr:'sheepish'}]];
const ALL:[string,Outfit,FrontOpts][]=[...NAMED,...['Jersey','Overalls','Dino + joggers','Hoodie dress','Plaid + jeans','Pleated skirt'].map((n,i):[string,Outfit,FrontOpts]=>[n,classmate(i),{}])];
export const CastSheet:React.FC<{readability?:boolean}>=()=>{
 const ref=useRef<HTMLCanvasElement>(null),[h]=useState(()=>delayRender('outfit sheet')),f=useCurrentFrame();
 useEffect(()=>{const g=ref.current!.getContext('2d')!;g.resetTransform();g.fillStyle='#f5f0e6';g.fillRect(0,0,3000,3700);
 const label=(t:string,x:number,y:number,size=26)=>{g.resetTransform();g.fillStyle='#252525';g.font=`600 ${size}px Arial`;g.textAlign='center';g.fillText(t,x,y)};
 const draw=(o:Outfit,opts:FrontOpts,x:number,y:number,scale:number,black=false,targetHeight=0)=>{const c=document.createElement('canvas');c.width=900;c.height=1100;const q=c.getContext('2d')!;q.translate(150,0);bodyFront(new Pen(q),o,{mode:'stand',exprT:f/30,...opts});if(black){q.globalCompositeOperation='source-in';q.fillStyle='#090909';q.fillRect(0,0,900,1100);}g.resetTransform();if(targetHeight){const pixels=q.getImageData(0,0,900,1100).data;let top=1100,bottom=0;for(let row=0;row<1100;row++)for(let col=0;col<900;col++)if(pixels[(row*900+col)*4+3]){top=Math.min(top,row);bottom=Math.max(bottom,row);}const normalized=targetHeight/(bottom-top+1);g.drawImage(c,0,top,900,bottom-top+1,x-450*normalized,y,900*normalized,targetHeight);}else g.drawImage(c,x-450*scale,y,900*scale,1100*scale);};
 label('OWEN / OUTFIT DESIGN • US SUBURB • 2026',1500,55,38);
 label('SIGNATURE CAST • stand + acting pose • preserved skeleton / white heads / black limbs',1500,105);
 NAMED.forEach(([n,o,opts],i)=>{const x=375+i*750;draw(o,opts,x-155,120,.62);draw(o,{expr:i===0?'smile':i===1?'deadpan':'curious',reach:i===0?POSES.wave:i===1?POSES.hold_out:i===2?POSES.arms_crossed:POSES.shrug,prop:i===1?'mug':null,...(i===0?{}:{})},x+155,120,.62);label(n,x,800,30)});
 label('SIX CLASSMATES • different garment silhouettes • no orange',1500,890,32);
 ALL.slice(4).forEach(([n,o],i)=>{draw(o,{},250+i*500,920,.67);label(n,250+i*500,1640,28)});
 label('WATER PARK • trunks / one-piece / rash guard • bare stick limbs, no shoes',1500,1735,32);
 [OWEN,classmate(1),THEO,classmate(3),classmate(0),classmate(5)].forEach((o,i)=>{const sw=swim(o,i);draw(sw,{expr:'smile',reach:POSES.wave},250+i*500,1760,.6);label({trunks:'Trunks',onepiece:'One-piece',rashguard:'Rash guard'}[sw.swimwear!],250+i*500,2395)}); // kids only: the adults chaperone in clothes
 label('SILHOUETTE CHECK • identical neutral pose • all ten characters • solid black alpha fill',1500,2510,30);
 ALL.forEach(([n,o],i)=>{draw(o,{},150+i*300,2540,.43,true);label(n,150+i*300,3010,21)});
 label('15% FRAME-HEIGHT CHECK • 288 px characters on a 1920 px reference frame',1500,3130,30);
 ALL.forEach(([n,o],i)=>{draw(o,{},150+i*300,3210,1,false,288);label(n,150+i*300,3640,21)});
 continueRender(h);
 },[h,f]);return <AbsoluteFill><canvas ref={ref} width={3000} height={3700}/></AbsoluteFill>;
};
