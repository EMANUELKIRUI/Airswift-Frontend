"use strict";exports.id=8968,exports.ids=[8968],exports.modules={73139:(e,t,r)=>{r.d(t,{Z:()=>m});var a=r(16689);let i=(...e)=>e.filter((e,t,r)=>!!e&&""!==e.trim()&&r.indexOf(e)===t).join(" ").trim(),n=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),s=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,r)=>r?r.toUpperCase():t.toLowerCase()),o=e=>{let t=s(e);return t.charAt(0).toUpperCase()+t.slice(1)};var l={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let d=e=>{for(let t in e)if(t.startsWith("aria-")||"role"===t||"title"===t)return!0;return!1},c=(0,a.createContext)({}),p=()=>(0,a.useContext)(c),h=(0,a.forwardRef)(({color:e,size:t,strokeWidth:r,absoluteStrokeWidth:n,className:s="",children:o,iconNode:c,...h},m)=>{let{size:u=24,strokeWidth:y=2,absoluteStrokeWidth:g=!1,color:f="currentColor",className:x=""}=p()??{},w=n??g?24*Number(r??y)/Number(t??u):r??y;return(0,a.createElement)("svg",{ref:m,...l,width:t??u??l.width,height:t??u??l.height,stroke:e??f,strokeWidth:w,className:i("lucide",x,s),...!o&&!d(h)&&{"aria-hidden":"true"},...h},[...c.map(([e,t])=>(0,a.createElement)(e,t)),...Array.isArray(o)?o:[o]])}),m=(e,t)=>{let r=(0,a.forwardRef)(({className:r,...s},l)=>(0,a.createElement)(h,{ref:l,iconNode:t,className:i(`lucide-${n(o(e))}`,`lucide-${e}`,r),...s}));return r.displayName=o(e),r}},85444:(e,t,r)=>{r.d(t,{Z:()=>a});let a=(0,r(73139).Z)("layout-dashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]])},63696:(e,t,r)=>{r.d(t,{Z:()=>a});let a=(0,r(73139).Z)("log-out",[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]])},30591:(e,t,r)=>{r.d(t,{Z:()=>i});var a=r(20997);r(16689);let i=({size:e="md",fullScreen:t=!1})=>{let r=a.jsx("div",{className:`animate-spin ${{sm:"w-4 h-4",md:"w-8 h-8",lg:"w-12 h-12"}[e]}`,children:a.jsx("div",{className:"h-full w-full border-4 border-primary border-t-transparent rounded-full"})});return t?a.jsx("div",{className:"fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50",children:r}):r}},51365:(e,t,r)=>{r.d(t,{Z:()=>i});var a=r(20997);r(16689);let i=({isOpen:e,title:t,children:r,onClose:i,onConfirm:n,confirmText:s="Confirm",cancelText:o="Cancel"})=>e?a.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:(0,a.jsxs)("div",{className:"bg-white rounded-lg shadow-lg max-w-md w-full mx-4",children:[t&&a.jsx("div",{className:"p-6 border-b",children:a.jsx("h2",{className:"text-xl font-bold text-gray-900",children:t})}),a.jsx("div",{className:"p-6",children:r}),(0,a.jsxs)("div",{className:"p-6 border-t flex justify-end gap-4",children:[a.jsx("button",{onClick:i,className:"px-4 py-2 border border-gray-300 rounded hover:bg-gray-50",children:o}),n&&a.jsx("button",{onClick:n,className:"px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90",children:s})]})]})}):null},2191:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.d(t,{Q:()=>l,a:()=>d});var i=r(16689),n=r(11163),s=r(8111),o=e([s]);s=(o.then?(await o)():o)[0];let l=({role:e,status:t,redirectTo:r}={})=>{let a=(0,n.useRouter)(),{user:o,isLoading:l}=(0,s.a)();return(0,i.useEffect)(()=>{if(!l){if(!o){a.push("/login");return}if(e&&o.role?.toLowerCase()!==e.toLowerCase()){a.push("/unauthorized");return}if(t&&!t.includes(o.applicationStatus||"")){a.push(r||"/dashboard");return}}},[l,o,e,t,r,a]),{isAuthorized:!l&&!!o&&(!e||o.role?.toLowerCase()===e.toLowerCase())&&(!t||t.includes(o.applicationStatus||"")),isLoading:l,user:o}},d=e=>l({role:e});a()}catch(e){a(e)}})},85508:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.d(t,{Z:()=>p});var i=r(20997),n=r(16689),s=r(41664),o=r.n(s),l=r(8111),d=r(37792),c=e([l,d]);[l,d]=c.then?(await c)():c;let p=({children:e,sidebarItems:t})=>{let[r,a]=(0,n.useState)(!1),{user:s}=(0,l.a)();return(0,i.jsxs)("div",{className:"flex h-screen bg-gray-50 page-watermark overflow-hidden",children:[(0,i.jsxs)("aside",{className:`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 overflow-y-auto md:relative md:translate-x-0 ${r?"translate-x-0":"-translate-x-full"}`,children:[(0,i.jsxs)("div",{className:"p-4 flex items-center justify-between bg-gradient-to-r from-primary to-secondary",children:[i.jsx("h2",{className:`text-xl font-bold uppercase tracking-wide text-white ${r?"block":"hidden md:block"}`,children:"TALEX"}),i.jsx("button",{onClick:()=>a(!r),className:"p-1 hover:bg-primary/80 rounded text-white","aria-label":"Toggle sidebar",children:"☰"})]}),i.jsx("nav",{className:"mt-8 space-y-2 px-2",children:t.map(e=>i.jsx(o(),{href:e.href,className:"block px-4 py-2 rounded-lg hover:bg-gray-700 transition text-gray-300 hover:text-white",onClick:()=>a(!1),children:e.label},e.href))})]}),r&&i.jsx("div",{className:"fixed inset-0 z-40 bg-black/40 md:hidden",onClick:()=>a(!1),"aria-hidden":"true"}),(0,i.jsxs)("div",{className:"flex-1 flex flex-col overflow-hidden md:pl-64",children:[i.jsx(d.Z,{}),i.jsx("main",{className:"flex-1 overflow-y-auto",children:i.jsx("div",{className:"container mx-auto px-4 sm:px-6 lg:px-8 py-8",children:e})})]})]})};a()}catch(e){a(e)}})},90155:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.d(t,{y:()=>s});var i=r(20228),n=e([i]);i=(n.then?(await n)():n)[0];let s={sendInterviewInvitation:async e=>{let t=`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Interview Invitation</h2>
        <p>Hi ${e.candidateName},</p>
        
        <p>Congratulations! We are pleased to invite you for an interview for the position of <strong>${e.jobTitle}</strong> at ${e.companyName||"our company"}.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Interview Details</h3>
          <p><strong>Position:</strong> ${e.jobTitle}</p>
          <p><strong>Date:</strong> ${new Date(e.interviewDate).toDateString()}</p>
          <p><strong>Time:</strong> ${e.interviewTime}</p>
          <p><strong>Interviewer:</strong> ${e.interviewerName}</p>
          ${e.zoomLink?`<p><strong><a href="${e.zoomLink}" style="color: #007bff;">Join Interview</a></strong></p>`:""}
        </div>
        
        <p>If you have any questions or need to reschedule, please don't hesitate to reach out.</p>
        
        <p>Best regards,<br>${e.interviewerName}<br>${e.companyName||"TALEX"}</p>
      </div>
    `;return i.Z.post("/admin/email/send",{to:e.candidateEmail,subject:`Interview Invitation - ${e.jobTitle}`,html:t})},sendRejectionEmail:async e=>{let t=`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Application Update</h2>
        <p>Hi ${e.candidateName},</p>
        
        <p>Thank you for your interest in the <strong>${e.jobTitle}</strong> position at ${e.companyName||"our company"}.</p>
        
        <p>After careful consideration, we regret to inform you that we have decided not to move forward with your application at this time. We appreciate the time you spent with us and encourage you to apply for other positions in the future.</p>
        
        <p>We wish you the best in your career endeavors.</p>
        
        <p>Best regards,<br>The Recruitment Team<br>${e.companyName||"TALEX"}</p>
      </div>
    `;return i.Z.post("/admin/email/send",{to:e.candidateEmail,subject:`Application Update - ${e.jobTitle}`,html:t})},sendShortlistNotification:async(e,t,r)=>{let a=`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Great News!</h2>
        <p>Hi ${e},</p>
        
        <p>We are pleased to inform you that you have been shortlisted for the <strong>${r}</strong> position!</p>
        
        <p>Your qualifications and experience stood out among many applicants. The next step will be an interview with our team.</p>
        
        <p>We will be in touch shortly with the interview details.</p>
        
        <p>Best regards,<br>The Recruitment Team<br>TALEX</p>
      </div>
    `;return i.Z.post("/admin/email/send",{to:t,subject:`You've been shortlisted! - ${r}`,html:a})},sendRescheduleConfirmation:async(e,t,r,a,n,s,o,l)=>{let d=`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Interview Rescheduled</h2>
        <p>Hi ${e},</p>
        
        <p>Your interview for the <strong>${r}</strong> position has been successfully rescheduled.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">New Interview Details</h3>
          <p><strong>Position:</strong> ${r}</p>
          <p><strong>Date:</strong> ${new Date(a).toDateString()}</p>
          <p><strong>Time:</strong> ${n}</p>
          ${o?`<p><strong>Interviewer:</strong> ${o}</p>`:""}
          ${s?`<p><strong><a href="${s}" style="color: #007bff;">Join Interview</a></strong></p>`:""}
        </div>
        
        <p>Please mark your calendar and ensure you're available at the scheduled time. If you need to reschedule again or have any questions, please contact us.</p>
        
        <p>Best regards,<br>${o||"The Recruitment Team"}<br>${l||"TALEX"}</p>
      </div>
    `;return i.Z.post("/admin/email/send",{to:t,subject:`Interview Rescheduled - ${r}`,html:d})},sendEmail:async e=>i.Z.post("/admin/email/send",e)};a()}catch(e){a(e)}})},22130:(e,t,r)=>{r.d(t,{aF:()=>i,p6:()=>a,rY:()=>n});let a=e=>new Date(e).toLocaleDateString("en-CA",{year:"numeric",month:"long",day:"numeric"}),i=(e,t)=>e.length>t?`${e.substring(0,t)}...`:e,n=(e,t=[])=>Array.isArray(e)?e:t}};