const load=()=>{try{return JSON.parse(localStorage.getItem("MOCKDB"))||null}catch(e){return null}};
let DB0;const DB=load()||{users:[],docs:[],coach_links:[],coach_codes:[],reports:[],plans:[]};DB.plans=DB.plans||[];
const persist=()=>localStorage.setItem("MOCKDB",JSON.stringify(DB));
let clock=Date.now();const now=()=>new Date(clock+=1000).toISOString();
export function createClient(url,key,opt){
  const sk=opt.auth.storageKey;let session=null;try{session=JSON.parse(localStorage.getItem(sk))}catch(e){}
  const listeners=[];const setS=(s,ev)=>{session=s;if(s)localStorage.setItem(sk,JSON.stringify(s));else localStorage.removeItem(sk);listeners.forEach(f=>f(ev,s))};
  const auth={getSession:async()=>({data:{session}}),onAuthStateChange:f=>{listeners.push(f);return{data:{subscription:{unsubscribe(){}}}}},
    signUp:async({email,password})=>{if(DB.users.find(u=>u.email===email))return{error:{message:"User already registered"}};const u={id:crypto.randomUUID(),email,password};DB.users.push(u);persist();const s={user:{id:u.id,email}};setS(s,"SIGNED_IN");return{data:{user:s.user,session:s},error:null}},
    signInWithPassword:async({email,password})=>{const u=DB.users.find(u=>u.email===email&&u.password===password);if(!u)return{data:{},error:{message:"Invalid login credentials"}};const s={user:{id:u.id,email}};setS(s,"SIGNED_IN");return{data:{user:s.user,session:s},error:null}},
    signOut:async()=>{setS(null,"SIGNED_OUT");return{}},resetPasswordForEmail:async()=>({error:null}),updateUser:async()=>({data:{},error:null})};
  const uid=()=>session&&session.user.id;
  function from(t){const st={filters:[],op:"select"};
    const vis=r=>t==="docs"?r.user_id===uid():t==="coach_codes"?r.coach_id===uid():t==="plans"?(r.coach_id===uid()||(r.client_id===uid()&&DB.coach_links.some(l=>l.client_id===uid()&&l.coach_id===r.coach_id))):(r.client_id===uid()||r.coach_id===uid());
    function run(){const tbl=DB[t];
      if(st.op==="upsert"){for(const row of st.payload){
          if(t==="docs"&&row.user_id!==uid())return{error:{message:"RLS violation"}};
          if(t==="reports"&&!(row.client_id===uid()&&DB.coach_links.some(l=>l.client_id===uid()&&l.coach_id===row.coach_id)))return{error:{message:"RLS violation"}};
          if(t==="plans"&&!(row.coach_id===uid()&&DB.coach_links.some(l=>l.coach_id===uid()&&l.client_id===row.client_id)))return{error:{message:"RLS violation"}};
          if(t==="coach_codes"&&tbl.find(r=>r.code===row.code&&r.coach_id!==row.coach_id))return{error:{message:"duplicate key"}};
          const ex=tbl.find(r=>st.conf.every(c=>r[c]===row[c]));if(ex)Object.assign(ex,JSON.parse(JSON.stringify(row)),{updated_at:now()});else tbl.push({...JSON.parse(JSON.stringify(row)),updated_at:now()})}
        persist();return{data:null,error:null}}
      let rows=tbl.filter(vis).filter(r=>st.filters.every(f=>f(r)));
      if(st.op==="update"){rows.forEach(r=>Object.assign(r,st.payload));persist();return{error:null}}
      if(st.op==="delete"){DB[t]=tbl.filter(r=>!rows.includes(r));persist();return{error:null}}
      if(st.order)rows=rows.slice().sort((a,b)=>a[st.order]<b[st.order]?-1:1);if(st.range)rows=rows.slice(st.range[0],st.range[1]+1);
      rows=JSON.parse(JSON.stringify(rows));return st.single?{data:rows[0]||null,error:null}:{data:rows,error:null}}
    const b={select(){return b},eq(c,v){st.filters.push(r=>r[c]===v);return b},gt(c,v){st.filters.push(r=>r[c]>v);return b},in(c,v){st.filters.push(r=>v.includes(r[c]));return b},order(c){st.order=c;return b},range(a,z){st.range=[a,z];return b},maybeSingle(){st.single=true;return b},
      upsert(rows,o){st.op="upsert";st.payload=Array.isArray(rows)?rows:[rows];st.conf=o.onConflict.split(",");return b},update(v){st.op="update";st.payload=v;return b},delete(){st.op="delete";return b},
      then(res,rej){return Promise.resolve(run()).then(res,rej)}};
    return b}
  async function rpc(name,a){if(name==="delete_my_account"){const u=uid();DB.reports=DB.reports.filter(r=>r.client_id!==u&&r.coach_id!==u);DB.coach_links=DB.coach_links.filter(r=>r.client_id!==u&&r.coach_id!==u);DB.coach_codes=DB.coach_codes.filter(r=>r.coach_id!==u);DB.docs=DB.docs.filter(r=>r.user_id!==u);DB.users=DB.users.filter(x=>x.id!==u);persist();return{error:null}}const c=DB.coach_codes.find(r=>r.code===a.p_code.toUpperCase());if(!c)return{error:{message:"No coach with that code"}};if(c.coach_id===uid())return{error:{message:"That is your own code"}};
    if(!DB.coach_links.find(l=>l.client_id===uid()&&l.coach_id===c.coach_id))DB.coach_links.push({client_id:uid(),coach_id:c.coach_id,coach_name:c.name,client_name:a.p_name,include_notes:true});persist();return{data:c.name,error:null}}
  return{auth,from,rpc}}
