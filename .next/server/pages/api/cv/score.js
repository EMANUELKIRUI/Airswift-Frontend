"use strict";(()=>{var e={};e.id=9161,e.ids=[9161],e.modules={20145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},72079:e=>{e.exports=import("openai")},56249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,r){return r in t?t[r]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,r)):"function"==typeof t&&"default"===r?t:void 0}}})},14714:(e,t,r)=>{r.a(e,async(e,n)=>{try{r.r(t),r.d(t,{config:()=>u,default:()=>l,routeModule:()=>d});var a=r(71802),o=r(47153),s=r(56249),i=r(93986),c=e([i]);i=(c.then?(await c)():c)[0];let l=(0,s.l)(i,"default"),u=(0,s.l)(i,"config"),d=new a.PagesAPIRouteModule({definition:{kind:o.x.PAGES_API,page:"/api/cv/score",pathname:"/api/cv/score",bundlePath:"",filename:""},userland:i});n()}catch(e){n(e)}})},41658:(e,t,r)=>{r.a(e,async(e,n)=>{try{r.d(t,{f:()=>s});var a=r(72079),o=e([a]);let s=new(a=(o.then?(await o)():o)[0]).default({apiKey:process.env.OPENAI_API_KEY});n()}catch(e){n(e)}})},93986:(e,t,r)=>{r.a(e,async(e,n)=>{try{r.r(t),r.d(t,{default:()=>s});var a=r(41658),o=e([a]);async function s(e,t){if("POST"!==e.method)return t.status(405).json({message:"Method not allowed"});let{cvText:r,jobRole:n}=e.body;try{let e=await a.f.chat.completions.create({model:"gpt-4o-mini",messages:[{role:"system",content:"You are an HR AI. Analyze the candidate's CV for the job role and return a JSON response with score (0-100), skills array, summary, and recommendation (reject | shortlist | hire)."},{role:"user",content:`
Job Role: ${n}

Candidate CV:
${r}

Return JSON only:
{
  "score": 0-100,
  "skills": [],
  "summary": "",
  "recommendation": "reject | shortlist | hire"
}
`}]}),o=JSON.parse(e.choices[0].message.content||"{}");t.json(o)}catch(e){console.error("OpenAI API error:",e),t.status(500).json({message:"Internal server error"})}}a=(o.then?(await o)():o)[0],n()}catch(e){n(e)}})},47153:(e,t)=>{var r;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return r}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(r||(r={}))},71802:(e,t,r)=>{e.exports=r(20145)}};var t=require("../../../webpack-api-runtime.js");t.C(e);var r=t(t.s=14714);module.exports=r})();