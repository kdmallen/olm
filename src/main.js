import './style.css';
const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d');
let source,result,name='drawing',url,worker,job=0,showOriginal=false,timer;
function status(s){$('status').textContent=s;}
function draw(){const data=showOriginal?source:result||source;if(data)ctx.putImageData(data,0,0);$('original').classList.toggle('active',showOriginal);$('smoothed').classList.toggle('active',!showOriginal);}
function process(){if(!source)return;const id=++job;worker?.terminate();$('save').disabled=true;result=null;draw();status('Smoothing your drawing…');worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});worker.onmessage=({data})=>{if(id!==job)return;if(data.error){status(data.error);return;}result=new ImageData(data.pixels,source.width,source.height);draw();$('save').disabled=false;status('Ready. Transparent PNG, original dimensions.');worker.terminate();};worker.onerror=()=>status('Processing failed. Try a smaller PNG.');worker.postMessage({pixels:source.data,width:source.width,height:source.height,strength:+$('strength').value,range:+$('range').value});}
$('file').onchange=async e=>{const file=e.target.files[0];if(!file)return;const ticket=++job;clearTimeout(timer);worker?.terminate();$('save').disabled=true;status('Opening image…');try{
 const signature=new Uint8Array(await file.slice(0,8).arrayBuffer());if(signature.join(',')!=='137,80,78,71,13,10,26,10')throw Error('Please choose a PNG image.');
 const image=new Image(),localURL=URL.createObjectURL(file);try{image.src=localURL;await image.decode();}finally{URL.revokeObjectURL(localURL);}if(ticket!==job)return;
 if(image.naturalWidth*image.naturalHeight>16000000)throw Error('Please use a PNG up to 16 megapixels for this first version.');
 canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0);source=ctx.getImageData(0,0,canvas.width,canvas.height);result=null;name=file.name.replace(/\.png$/i,'');$('filename').textContent=file.name;$('dimensions').textContent=`${canvas.width} × ${canvas.height}`;$('empty').hidden=true;$('artboard').hidden=false;$('artboard').style.width=canvas.width+'px';$('artboard').style.height=canvas.height+'px';fit();showOriginal=false;process();
 }catch(err){status(err.message);if(source&&result)$('save').disabled=false;}e.target.value='';};
$('open').onclick=$('choose').onclick=()=>$('file').click();
for(const id of ['strength','range'])$(id).oninput=()=>{clearTimeout(timer);++job;worker?.terminate();$('save').disabled=true;
 if(![$('strength'),$('range')].every(el=>el.value.trim()!==''&&Number.isFinite(+el.value)&&+el.value>=0)){status('Enter a number of zero or greater.');return;}
 status('Updating…');timer=setTimeout(process,250);};
$('original').onclick=()=>{showOriginal=true;draw();};$('smoothed').onclick=()=>{showOriginal=false;draw();};
$('save').onclick=()=>{if(!result)return;const exportCanvas=document.createElement('canvas');exportCanvas.width=result.width;exportCanvas.height=result.height;exportCanvas.getContext('2d').putImageData(result,0,0);exportCanvas.toBlob(blob=>{if(!blob){status('Could not export this image.');return;}if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name+'-smoothed.png';document.body.append(a);a.click();a.remove();status('PNG exported. Save to Files to use it in Procreate.');},'image/png');};

const viewport=$('viewport'),artboard=$('artboard'),panel=$('panel');
let scale=1,tx=0,ty=0;
function transform(){artboard.style.transform=`translate(${tx}px, ${ty}px) scale(${scale})`;$('zoom-label').textContent=Math.round(scale*100)+'%';}
function fit(){if(!source)return;scale=Math.min((viewport.clientWidth-60)/source.width,(viewport.clientHeight-60)/source.height,1);tx=(viewport.clientWidth-source.width*scale)/2;ty=(viewport.clientHeight-source.height*scale)/2;transform();}
function zoomAt(factor,x,y){const next=Math.max(.01,Math.min(64,scale*factor)),ratio=next/scale;tx=x-(x-tx)*ratio;ty=y-(y-ty)*ratio;scale=next;transform();}
$('fit').onclick=fit;
viewport.addEventListener('wheel',e=>{e.preventDefault();if(!source)return;const rect=viewport.getBoundingClientRect();zoomAt(Math.exp(-e.deltaY*.0015),e.clientX-rect.left,e.clientY-rect.top);},{passive:false});
viewport.addEventListener('auxclick',e=>e.preventDefault());
const pointers=new Map();let gesture;
viewport.addEventListener('pointerdown',e=>{if(e.button!==1&&e.pointerType!=='touch')return;e.preventDefault();viewport.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});gesture=null;viewport.classList.add('panning');});
viewport.addEventListener('pointermove',e=>{const old=pointers.get(e.pointerId);if(!old)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const points=[...pointers.values()];if(points.length===1){tx+=e.clientX-old.x;ty+=e.clientY-old.y;transform();}else if(points.length===2){const [a,b]=points,dist=Math.hypot(a.x-b.x,a.y-b.y),x=(a.x+b.x)/2,y=(a.y+b.y)/2,rect=viewport.getBoundingClientRect();if(gesture){tx+=x-gesture.x;ty+=y-gesture.y;zoomAt(dist/Math.max(1,gesture.dist),x-rect.left,y-rect.top);}gesture={dist,x,y};}});
function endPointer(e){pointers.delete(e.pointerId);gesture=null;if(!pointers.size)viewport.classList.remove('panning');}
viewport.addEventListener('pointerup',endPointer);viewport.addEventListener('pointercancel',endPointer);
$('background').onchange=()=>{$('backdrop').style.display=$('background').checked?'block':'none';};
$('background-color').oninput=()=>{$('backdrop').style.background=$('background-color').value;};
$('settings-toggle').onclick=()=>{panel.hidden=!panel.hidden;};
let drag;
$('panel-handle').onpointerdown=e=>{if(e.button!==0)return;const r=panel.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX-r.left,y:e.clientY-r.top};$('panel-handle').setPointerCapture(e.pointerId);};
$('panel-handle').onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;panel.style.right='auto';panel.style.left=Math.max(0,Math.min(innerWidth-panel.offsetWidth,e.clientX-drag.x))+'px';panel.style.top=Math.max(56,Math.min(innerHeight-panel.offsetHeight,e.clientY-drag.y))+'px';};
$('panel-handle').onpointerup=$('panel-handle').onpointercancel=()=>{drag=null;};
window.addEventListener('resize',()=>{const r=panel.getBoundingClientRect();panel.style.right='auto';panel.style.left=Math.max(0,Math.min(innerWidth-panel.offsetWidth,r.left))+'px';panel.style.top=Math.max(56,Math.min(innerHeight-panel.offsetHeight,r.top))+'px';});
