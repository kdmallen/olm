import {smooth} from './smooth.js';
self.onmessage=({data:d})=>{try{
  let pixels=d.pixels,remaining=d.strength;
  // Values above 100 add passes instead of extrapolating colors/alpha.
  if(remaining===0)pixels=new Uint8ClampedArray(pixels);
  while(remaining>0){pixels=smooth(pixels,d.width,d.height,Math.min(100,remaining),d.range);remaining-=100;}
  self.postMessage({pixels},[pixels.buffer]);
}catch(e){self.postMessage({error:e.message});}};
