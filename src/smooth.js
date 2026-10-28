// MLAA adapted from Sabiasagi/OLMSmootherYMM4 (MIT). See THIRD_PARTY_LICENSES.
export function smooth(input, width, height, strength=100, range=0) {
  if (!strength) return new Uint8ClampedArray(input);
  const n=width*height, colors=new Float32Array(n*4), edges=new Uint8Array(n*2), weights=new Float32Array(n*4);
  for(let p=0;p<n;p++){const i=p*4,a=input[i+3]/255; for(let c=0;c<3;c++) colors[i+c]=input[i+c]/255*a; colors[i+3]=a;}
  const edge=(x,y,c)=>x<0||y<0||x>=width||y>=height?0:edges[(y*width+x)*2+c];
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)for(let c=0;c<2;c++){
    if(c===0?x===0:y===0)continue;
    const i=(y*width+x)*4,j=i-(c===0?4:width*4);let diff=0;
    for(let k=0;k<4;k++)diff=Math.max(diff,Math.abs(colors[i+k]-colors[j+k]));
    edges[(y*width+x)*2+c]=diff>range/255?1:0;
  }
  function area(a,d,h0,h1){const mid=d/2,b=a+1,w=[0,0],u=Math.min(b,mid),v=Math.max(a,mid);
    if(u>a){const s=h0*((u-a)-(u*u-a*a)/(2*mid));w[s>0?0:1]+=Math.abs(s);}
    if(b>v){const s=h1*((b*b-v*v)/2-mid*(b-v))/mid;w[s>0?0:1]+=Math.abs(s);}return w;}
  function boundary(x,y,vertical){
    const get=(along,across,c)=>vertical?edge(x+across,y+along,1-c):edge(x+along,y+across,c);
    let left=0,right=0,h0=0,h1=0;
    for(let i=0;i<64;i++){const a=get(-i,-1,0),b=get(-i,0,0);if(a||b){h0=a===b?0:a?.5:-.5;break;}if(!get(-i-1,0,1))break;left++;}
    for(let i=0;i<64;i++){const a=get(i+1,-1,0),b=get(i+1,0,0);if(a||b){h1=a===b?0:a?.5:-.5;break;}if(!get(i+1,0,1))break;right++;}
    return area(left,left+right+1,h0,h1);
  }
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const p=y*width+x;
    if(edge(x,y,1))weights.set(boundary(x,y,false),p*4);
    if(edge(x,y,0))weights.set(boundary(x,y,true),p*4+2);
  }
  const out=new Uint8ClampedArray(n*4),s=Math.max(0,Math.min(100,strength))/100;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const p=y*width+x,i=p*4;
    const ws=[weights[i+1],y+1<height?weights[i+width*4]:0,weights[i+3],x+1<width?weights[i+6]:0];
    const neighbors=[p-width,p+width,p-1,p+1],sum=ws.reduce((a,b)=>a+b,0),result=[];
    for(let c=0;c<4;c++){
      let v=colors[i+c];
      if(sum){let acc=0;for(let k=0;k<4;k++)if(ws[k])acc+=ws[k]*(v+(colors[neighbors[k]*4+c]-v)*ws[k]);v=v*(1-s)+acc/sum*s;}
      result[c]=v;
    }
    out[i+3]=Math.round(result[3]*255);
    for(let c=0;c<3;c++)out[i+c]=result[3]>0?Math.round(result[c]/result[3]*255):0;
  }
  return out;
}
