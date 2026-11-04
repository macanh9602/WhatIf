import {Outfit, SKINS} from './toon';
export const OWEN: Outfit = {jacket:'#E8643C',pants:'#3B4A6B',boots:'#3E7CC9',hat:null,strands:3,hair:'#2b1d16',build:'kid',skin:SKINS[0],top:'hoodie',hoodie:true,bottom:'shorts',shoe:'hightop',socks:'#ffffff',laces:'#c63939'};
export const MOM: Outfit = {fem:true,jacket:'#ffffff',pants:'#5C7FA3',boots:'#394b50',hat:null,style:'ponytail',hair:'#8A4B32',skin:SKINS[0],top:'tee',bottom:'scrubs',layer:{kind:'cardigan',color:'#6E8B6B',long:true},acc:['pen_in_hair'],shoe:'clog'};
export const PATEL: Outfit = {fem:true,jacket:'#e8dfc6',pants:'#273750',boots:'#292b38',hat:null,style:'smooth',bun:true,hair:'#2a2626',glasses:'#c0353a',skin:SKINS[0],top:'blouse',bottom:'skirt',pattern:'dots',layer:{kind:'cardigan',color:'#C99A2E'},acc:['lanyard'],shoe:'flat'};
export const THEO: Outfit = {jacket:'#4E9A5B',pants:'#b8a779',boots:'#f4f1ea',hat:null,style:'curls',hair:'#2A1E16',glasses:'#1f2a44',backpack:'#e2b43c',build:'kid',skin:SKINS[0],top:'polo',pattern:'stripes',bottom:'cargo',acc:['backpack','socks_high'],socks:'#f5f1df',shoe:'sneaker'};
const CLASS: Partial<Outfit>[] = [
 {jacket:'#c93f47',pants:'#344364',top:'jersey',bottom:'shorts',pattern:'number',acc:['headband'],style:'spiky'},
 {jacket:'#e3c6cc',pants:'#496b96',top:'tee',bottom:'overalls',pattern:'stripes',style:'ponytail',fem:true},
 {jacket:'#428c91',pants:'#334438',top:'tee',bottom:'joggers',graphic:'dino',acc:['cap'],style:'smooth'},
 {jacket:'#8554b4',pants:'#302c49',top:'hoodie',bottom:'dress',longSleeves:true,leggings:'#302c49',style:'smooth',bun:true,fem:true}, // not curls: Theo's silhouette (silhouette_qa 0.88)
 {jacket:'#447791',pants:'#344963',top:'button',bottom:'jeans',longSleeves:true,pattern:'plaid',style:'spiky',backpack:'#c25a7a'}, // backpack breaks the dino kid's shape (0.89)
 {jacket:'#c47091',pants:'#40535e',top:'sweater',bottom:'skirt',pleated:true,acc:['socks_high'],socks:'#f2efda',style:'smooth',fem:true}, // bob: ponytail = the overalls girl (0.97), curls = Theo (0.89)
];
export const classmate = (v:number):Outfit => ({jacket:'#447791',pants:'#344963',boots:'#f4f1ea',hat:null,hair:['#2a201a','#d9b25a','#5a3b2a','#1e1a1a','#8a4b32','#3a2a22'][((v%6)+6)%6],build:'kid',skin:SKINS[0],shoe:'sneaker',...CLASS[((v%6)+6)%6]});
const SWIM=['#2f9fd8','#e04f8a','#47b36b'];
/** water-park swimwear: girls one-piece / rash guard, boys trunks / rash guard (never a shirtless girl: family audience) */
export const swim=(o:Outfit,v:number):Outfit => {
  const kind = o.fem ? (v%4<2 ? 'onepiece' : 'rashguard') : (v%4<2 ? 'trunks' : 'rashguard');
  return {...o,jacket:SWIM[v%3],pants:SWIM[v%3],boots:'#090909',top:kind==='onepiece'?'tank':'tee',bottom:kind==='onepiece'?undefined:'shorts',swimwear:kind,longSleeves:kind==='rashguard',leggings:undefined,backpack:undefined,layer:undefined,hoodie:false,dress:undefined,cardigan:false,pattern:undefined,graphic:undefined,acc:[],socks:undefined,shoe:undefined,hat:null};
};
