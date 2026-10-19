import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { join } from "node:path";

const root=process.cwd();
const port=3187;
const origin=`http://127.0.0.1:${port}`;
const nextCli=join(root,"node_modules","next","dist","bin","next");
const child=spawn(process.execPath,[nextCli,"start","--hostname","127.0.0.1","--port",String(port)],{
  cwd:root,env:{...process.env,NODE_ENV:"production"},
  stdio:["ignore","pipe","pipe"],
});
let logs="";
child.stdout.on("data",data=>logs+=data.toString());
child.stderr.on("data",data=>logs+=data.toString());
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function read(path){
  const response=await fetch(origin+path,{signal:AbortSignal.timeout(25000)});
  return response;
}
try{
  let ready=false;
  for(let attempt=0;attempt<80;attempt++){
    if(child.exitCode!==null)throw Error("Next server exited: "+logs);
    try{
      const response=await fetch(origin+"/es",{signal:AbortSignal.timeout(2500)});
      if(response.ok){ready=true;break;}
    }catch{}
    await sleep(450);
  }
  assert(ready,"Next did not start: "+logs);
  for(const lang of ["es","en"]){
    const response=await read("/"+lang);
    assert.equal(response.status,200);
    const html=await response.text();
    assert.match(html,/property="og:title"/);
    assert.match(html,/property="og:description"/);
    assert(html.includes("/"+lang+"/opengraph-image"),"OG image not present: "+lang);
    assert.match(html,/name="twitter:card"[^>]+summary_large_image/);
    assert.match(html,/JarceDev/);
    assert(html.includes("/experience/index.html?lang="+lang),"Wrong 3D experience for locale "+lang);
    assert(!html.includes("Jorge-Arce-Solano-CV-"),"CV download link was exposed");
    const preview=await read("/"+lang+"/opengraph-image");
    assert.equal(preview.status,200,"Social preview endpoint missing: "+lang);
    assert((preview.headers.get("content-type")??"").includes("image/png"),"Social preview is not PNG");
    const data=Buffer.from(await preview.arrayBuffer());
    assert(data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),"Not a PNG: "+lang);
    assert.equal(data.readUInt32BE(16),1200);
    assert.equal(data.readUInt32BE(20),630);
    console.log(lang+": OG/Twitter tags and 1200x630 PNG verified.");
  }
  for(const path of ["/es/portfolio","/es/projects/firetrack"]){
    const response=await read(path);
    assert.equal(response.status,200);
    const html=await response.text();
    assert.match(html,/property="og:image"/);
    assert.match(html,/opengraph-image/);
    assert(!html.includes("Jorge-Arce-Solano-CV-"));
  }
  for(const path of ["/cv/Jorge-Arce-Solano-CV-ES.pdf","/cv/Jorge-Arce-Solano-CV-EN.pdf"]){
    const response=await read(path);
    assert.equal(response.status,404,"Old downloadable CV must not be public: "+path);
  }
  console.log("JarceDev WhatsApp/OG previews and absence of CV download verified.");
}finally{
  child.kill();
}
