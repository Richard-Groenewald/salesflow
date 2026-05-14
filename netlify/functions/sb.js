const https=require('https');
const SB='kevrfdjqyuhmgziqxuvs.supabase.co';
const KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtldnJmZGpxeXVobWd6aXF4dXZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODU3Nzk5NywiZXhwIjoyMDk0MTUzOTk3fQ.L6Yfnj7Qu1LSZq4fx15vDGIfbe2n_JqC_RYm-XHeKX0';
exports.handler=async(event)=>{const path=event.path.replace('/.netlify/functions/sb','/rest/v1');const qs=event.rawQuery?'?'+event.rawQuery:'';
return new Promise(resolve=>{const opts={hostname:SB,port:443,path:path+qs,method:event.httpMethod,headers:{'Content-Type':'application/json','apikey':KEY,'Authorization':'Bearer '+KEY,'Prefer':event.headers['prefer']||''}};
const req=https.request(opts,res=>{let d='';res.on('data',c=>d+=c);res.on('end',()=>resolve({statusCode:res.statusCode,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type,Authorization,apikey,Prefer','Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,OPTIONS'},body:d}));});
req.on('error',e=>resolve({statusCode:500,body:JSON.stringify({error:e.message})}));
if(event.body)req.write(event.body);req.end();});}
