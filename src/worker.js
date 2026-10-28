import {smooth} from './smooth.js';
self.onmessage=({data:d})=>{try{const pixels=smooth(d.pixels,d.width,d.height,d.strength,d.range);self.postMessage({pixels},[pixels.buffer]);}catch(e){self.postMessage({error:e.message});}};
