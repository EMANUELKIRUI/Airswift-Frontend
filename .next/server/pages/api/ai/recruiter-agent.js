"use strict";(()=>{var e={};e.id=6438,e.ids=[6438],e.modules={38013:e=>{e.exports=require("mongodb")},11185:e=>{e.exports=require("mongoose")},20145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},99648:e=>{e.exports=import("axios")},72079:e=>{e.exports=import("openai")},56249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,a){return a in t?t[a]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,a)):"function"==typeof t&&"default"===a?t:void 0}}})},43682:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.r(t),a.d(t,{config:()=>l,default:()=>c,routeModule:()=>p});var n=a(71802),i=a(47153),o=a(56249),d=a(78361),s=e([d]);d=(s.then?(await s)():s)[0];let c=(0,o.l)(d,"default"),l=(0,o.l)(d,"config"),p=new n.PagesAPIRouteModule({definition:{kind:i.x.PAGES_API,page:"/api/ai/recruiter-agent",pathname:"/api/ai/recruiter-agent",bundlePath:"",filename:""},userland:d});r()}catch(e){r(e)}})},61244:(e,t,a)=>{a.d(t,{u:()=>i});var r=a(11185),n=a.n(r);let i=async()=>{try{let e=process.env.MONGODB_URI||process.env.MONGO_URI||process.env.DATABASE_URL;if(!e)throw Error("MongoDB URI missing");await n().connect(e),console.log("MongoDB connected")}catch(e){console.error("MongoDB connection error:",e.message),process.exit(1)}}},41658:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.d(t,{f:()=>o});var n=a(72079),i=e([n]);let o=new(n=(i.then?(await i)():i)[0]).default({apiKey:process.env.OPENAI_API_KEY});r()}catch(e){r(e)}})},78361:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.r(t),a.d(t,{default:()=>p});var n=a(38013),i=a(41658),o=a(61244),d=a(11185),s=a.n(d),c=a(99648),l=e([i,c]);[i,c]=l.then?(await l)():l;let u=e=>{try{let t=e.indexOf("{"),a=e.lastIndexOf("}"),r=-1!==t&&-1!==a?e.slice(t,a+1):e;return JSON.parse(r)}catch(e){return console.error("JSON parse error:",e),null}};async function p(e,t){if("POST"!==e.method)return t.status(405).json({message:"Method not allowed"});let{applications:a,jobDescription:r}=e.body;if(!Array.isArray(a)||!r)return t.status(400).json({message:"applications and jobDescription are required"});let d=a.map((e,t)=>({...e,candidateId:e._id||e.id||`candidate-${t}`})),l=`You are an autonomous HR recruiter AI.

Job Description:
${r}

Applications:
${JSON.stringify(d,null,2)}

Tasks:
1. Score each candidate 0-100.
2. Rank them from strongest to weakest.
3. Select top 3 candidates.
4. Reject weak candidates.
5. Output JSON only with candidateId references.

Expected output format:
{
  "topCandidates": [
    {
      "candidateId": "...",
      "score": 92,
      "summary": "Strong communication, relevant experience..."
    }
  ],
  "rejected": [
    {
      "candidateId": "...",
      "score": 18,
      "summary": "Limited experience and weak cultural fit."
    }
  ],
  "reasoning": ""
}
`;try{let e=(await i.f.responses.create({model:"gpt-4.1-mini",input:l})).output_text||"",a=u(e);if(!a||!Array.isArray(a.topCandidates)||!Array.isArray(a.rejected))return t.status(500).json({message:"Unexpected AI response format",raw:e});try{await (0,o.u)();let e=s().connection.db,t=new Set(a.topCandidates.map(e=>e.candidateId)),r=new Set(a.rejected.map(e=>e.candidateId));await Promise.all(d.map(async i=>{if(!i.candidateId||!/^[0-9a-fA-F]{24}$/.test(String(i.candidateId)))return null;let o=r.has(i.candidateId)?"rejected":t.has(i.candidateId)?"reviewed":i.status||"pending";if(await e.collection("applications").updateOne({_id:new n.ObjectId(i.candidateId)},{$set:{status:o,recruiterAnalysis:{candidateId:i.candidateId,record:a.topCandidates.find(e=>e.candidateId===i.candidateId)||a.rejected.find(e=>e.candidateId===i.candidateId)||null,reasoning:a.reasoning||""},updatedAt:new Date}}),"rejected"===o&&i.email)try{await c.default.post(`${process.env.NEXTAUTH_URL||"http://localhost:3000"}/api/emails/send`,{templateId:"application_rejected",recipientEmail:i.email,variables:{applicantName:i.fullName||"Candidate",jobTitle:i.jobId?.title||"Position",companyName:"Talex"}})}catch(e){console.error("Error sending rejection email:",e)}else if("reviewed"===o&&i.email)try{await c.default.post(`${process.env.NEXTAUTH_URL||"http://localhost:3000"}/api/emails/send`,{templateId:"application_reviewed",recipientEmail:i.email,variables:{applicantName:i.fullName||"Candidate",jobTitle:i.jobId?.title||"Position",companyName:"Talex"}})}catch(e){console.error("Error sending shortlist email:",e)}return!0}))}catch(e){console.error("Database update error:",e)}return t.json(a)}catch(e){return console.error("OpenAI API error:",e),t.status(500).json({message:"Internal server error"})}}r()}catch(e){r(e)}})},47153:(e,t)=>{var a;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return a}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(a||(a={}))},71802:(e,t,a)=>{e.exports=a(20145)}};var t=require("../../../webpack-api-runtime.js");t.C(e);var a=t(t.s=43682);module.exports=a})();