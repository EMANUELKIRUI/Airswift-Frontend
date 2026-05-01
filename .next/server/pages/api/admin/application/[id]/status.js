"use strict";(()=>{var e={};e.id=528,e.ids=[528],e.modules={99344:e=>{e.exports=require("jsonwebtoken")},11185:e=>{e.exports=require("mongoose")},20145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},45184:e=>{e.exports=require("nodemailer")},56249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,r){return r in t?t[r]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,r)):"function"==typeof t&&"default"===r?t:void 0}}})},75379:(e,t,r)=>{r.r(t),r.d(t,{config:()=>y,default:()=>m,routeModule:()=>x});var o={};r.r(o),r.d(o,{default:()=>h});var i=r(71802),s=r(47153),a=r(56249),n=r(61244),l=r(8250),p=r(99344),d=r.n(p),u=r(1641);let c=process.env.JWT_ACCESS_SECRET||process.env.JWT_SECRET||"change_me",g=e=>new Promise((t,r)=>{let o=e.headers.authorization?.replace("Bearer ","")||e.cookies.accessToken;if(!o){r(Error("No token provided"));return}d().verify(o,c,(e,o)=>{if(e){r(Error("Invalid token"));return}t({userId:o.id,email:o.email,role:o.role})})}),f=(e,t)=>{let r=e.user_id?.name||"Applicant",o=process.env.NEXT_PUBLIC_FRONTEND_URL||"https://airswift-frontend.vercel.app";return"shortlisted"===t?{subject:"Application Update – You've Been Shortlisted",html:`
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2c3e50;">Application Update</h2>
          <p>Dear ${r},</p>
          <p>
            Thank you for your interest in joining our team. We are pleased to inform you
            that after careful review of your application, you have been <strong>shortlisted</strong>
            for the next stage of our selection process.
          </p>
          <p>
            Our team will be reaching out to you shortly with further details regarding
            the next steps.
          </p>
          <p>
            We appreciate your time and effort in applying and look forward to speaking with you.
          </p>
          <br/>
          <p style="margin-top:20px;">
            <a href="${o}"
               style="background:#007bff;color:#fff;padding:10px 15px;
                      text-decoration:none;border-radius:5px;">
              Visit Your Dashboard
            </a>
          </p>
          <br/>
          <p>Kind regards,</p>
          <p><strong>Talex Recruitment Team</strong></p>
        </div>
      `}:"accepted"===t?{subject:"Application Successful",html:`
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Dear ${r},</p>
          <p>
            We are delighted to inform you that your application has been
            <strong>successful</strong>.
          </p>
          <p>Our team will contact you with further onboarding details.</p>
          <p>Congratulations and welcome aboard!</p>
          <br/>
          <p style="margin-top:20px;">
            <a href="${o}"
               style="background:#007bff;color:#fff;padding:10px 15px;
                      text-decoration:none;border-radius:5px;">
              Visit Your Dashboard
            </a>
          </p>
          <br/>
          <p>Best regards,<br/>Talex Team</p>
        </div>
      `}:"rejected"===t?{subject:"Application Update",html:`
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Dear ${r},</p>
          <p>
            Thank you for your interest in joining our team.
          </p>
          <p>
            After careful consideration, we regret to inform you that we will not
            be progressing with your application at this time.
          </p>
          <p>
            We truly appreciate your effort and encourage you to apply again in the future.
          </p>
          <br/>
          <p style="margin-top:20px;">
            <a href="${o}"
               style="background:#007bff;color:#fff;padding:10px 15px;
                      text-decoration:none;border-radius:5px;">
              Visit Your Dashboard
            </a>
          </p>
          <br/>
          <p>Kind regards,<br/>Talex Team</p>
        </div>
      `}:null};async function h(e,t){if(await (0,n.u)(),"PUT"!==e.method)return t.status(405).json({message:"Method not allowed"});try{let r;try{r=await g(e)}catch(e){return t.status(401).json({message:"Unauthorized"})}if(!r||"admin"!==r.role)return t.status(403).json({message:"Admin access required"});let{id:o}=e.query,{status:i}=e.body;if(!o||!i)return t.status(400).json({message:"Application ID and status are required"});if(!["pending","shortlisted","accepted","rejected"].includes(i))return t.status(400).json({message:"Invalid status"});let s=await l.default.findByIdAndUpdate(o,{status:i},{new:!0}).populate("user_id","name email").populate("job_id","title");if(!s)return t.status(404).json({message:"Application not found"});if(["shortlisted","accepted","rejected"].includes(i)&&s.user_id?.email)try{let e=f(s,i);e&&(await (0,u.Cz)(s.user_id.email,e.subject,"",e.html),console.log(`Status update email sent to ${s.user_id.email} for status: ${i}`))}catch(e){console.error("Failed to send status update email:",e)}return t.status(200).json({success:!0,application:s,message:`Application ${i} successfully`})}catch(e){return console.error("Error updating application status:",e),t.status(500).json({message:"Internal server error"})}}let m=(0,a.l)(o,"default"),y=(0,a.l)(o,"config"),x=new i.PagesAPIRouteModule({definition:{kind:s.x.PAGES_API,page:"/api/admin/application/[id]/status",pathname:"/api/admin/application/[id]/status",bundlePath:"",filename:""},userland:o})},1641:(e,t,r)=>{r.d(t,{Cz:()=>d,zk:()=>p});var o=r(45184),i=r.n(o);class s{logSent(e,t,r){let o={id:this.generateId(),timestamp:new Date,recipient:e,subject:t,status:"sent",retries:0,messageId:r};return this.logs.push(o),this.maintainLogSize(),console.log(`📧 [EMAIL_LOG] Sent to: ${e} | Subject: ${t} | ID: ${o.id}`),o.id}logFailed(e,t,r,o=0){let i=r instanceof Error?r.message:String(r),s={id:this.generateId(),timestamp:new Date,recipient:e,subject:t,status:"failed",error:i,retries:o};return this.logs.push(s),this.maintainLogSize(),console.error(`❌ [EMAIL_FAILED] To: ${e} | Subject: ${t} | Error: ${i} | Retries: ${o} | ID: ${s.id}`),o>2&&this.alertRepeatedFailures(e,t,o),s.id}getStats(){let e=this.logs.length,t=this.logs.filter(e=>"sent"===e.status).length,r=this.logs.filter(e=>"failed"===e.status).length,o=e>0?(t/e*100).toFixed(2):"0.00";return{total:e,sent:t,failed:r,successRate:`${o}%`,lastLog:this.logs[this.logs.length-1]}}getRecentFailures(e=10){return this.logs.filter(e=>"failed"===e.status).slice(-e).reverse()}getFailuresForRecipient(e){return this.logs.filter(t=>"failed"===t.status&&t.recipient===e)}maintainLogSize(){this.logs.length>this.maxLogs&&(this.logs=this.logs.slice(-this.maxLogs))}generateId(){return`${Date.now()}-${Math.random().toString(36).substr(2,9)}`}alertRepeatedFailures(e,t,r){console.warn(`⚠️ [EMAIL_ALERT] Repeated failures - To: ${e} | Subject: ${t} | Retries: ${r}`),console.warn(`Production Alert: Email delivery issues detected for ${e}. This should be investigated.`)}exportLogs(){return{timestamp:new Date().toISOString(),stats:this.getStats(),recentFailures:this.getRecentFailures(20),allLogs:this.logs}}constructor(){this.logs=[],this.maxLogs=1e3}}let a=new s,n=null,l=async()=>{if(n)return n;if(process.env.BREVO_API_KEY)n=i().createTransport({host:"smtp-relay.brevo.com",port:587,secure:!1,auth:{user:process.env.BREVO_SMTP_USER||"apikey",pass:process.env.BREVO_API_KEY}});else if(process.env.SENDGRID_API_KEY)n=i().createTransport({host:"smtp.sendgrid.net",port:587,auth:{user:"apikey",pass:process.env.SENDGRID_API_KEY}});else if(process.env.SMTP_HOST)n=i().createTransport({host:process.env.SMTP_HOST,port:parseInt(process.env.SMTP_PORT||"587"),secure:"true"===process.env.SMTP_SECURE,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});else{console.warn("⚠️ Email service not configured. Using Ethereal Email for testing.");try{let e=await i().createTestAccount();n=i().createTransport({host:"smtp.ethereal.email",port:587,secure:!1,auth:{user:e.user,pass:e.pass}}),console.log("\uD83D\uDCE7 Ethereal Email Account:",e.user)}catch(e){throw console.error("Failed to create test account:",e),e}}return n},p=async(e,t,r)=>{try{let o=await l(),i=process.env.FRONTEND_URL||"http://localhost:3000",s=`${i}/activate/${r}`,a={from:process.env.EMAIL_FROM||"noreply@airswift.com",to:e,subject:"Verify your Airswift Account - Secure Link",html:`
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Airswift</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Email Verification</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #333; font-size: 16px; margin-top: 0;">
                Hi ${t},
              </p>
              
              <p style="color: #555; font-size: 15px; line-height: 1.6;">
                Thank you for signing up for Airswift! To complete your registration and verify your email address, click the button below:
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a 
                  href="${s}"
                  style="
                    display: inline-block;
                    padding: 14px 36px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 16px;
                    transition: transform 0.2s;
                  "
                >
                  Verify Email Address
                </a>
              </div>

              <!-- Alternative Link -->
              <p style="color: #888; font-size: 13px; margin: 25px 0;">
                Or copy and paste this link in your browser:
              </p>
              <p style="
                background: #f9f9f9;
                border-left: 4px solid #667eea;
                padding: 12px;
                border-radius: 4px;
                word-break: break-all;
                font-size: 12px;
                color: #555;
                font-family: 'Courier New', monospace;
              ">
                ${s}
              </p>

              <!-- Important Information -->
              <div style="background: #f0f7ff; border-left: 4px solid #667eea; padding: 15px; border-radius: 4px; margin: 25px 0;">
                <p style="color: #555; font-size: 13px; margin: 0;">
                  <strong>⏰ This link expires in 24 hours</strong><br>
                  After expiration, you can request a new verification link.
                </p>
              </div>

              <!-- Security Note -->
              <p style="color: #888; font-size: 12px; margin-top: 25px;">
                <strong>🔒 Security:</strong> This token is unique and single-use only. Never share this link with anyone else.
              </p>

              <!-- Footer -->
              <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                If you didn't create this account, please ignore this email. Your email address will not be used without your confirmation.
              </p>
            </div>

            <!-- Footer Brand -->
            <div style="background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 11px; margin: 0;">
                \xa9 2024 Airswift. All rights reserved.<br>
                <a href="${i}/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> | 
                <a href="${i}/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a>
              </p>
            </div>
          </div>
        </div>
      `,text:`
        Hello ${t},

        Thank you for signing up for Airswift! To complete your registration and verify your email address, visit this link:

        ${s}

        This link expires in 24 hours. After expiration, you can request a new verification link.

        If you didn't create this account, please ignore this email.

        Airswift
      `},n=await o.sendMail(a);return console.log("✅ Verification email sent to:",e),console.log("\uD83D\uDCE7 Message ID:",n.messageId),n}catch(e){throw console.error("❌ Error sending verification email:",e),e}},d=async(e,t,r,o)=>{try{let i=await l(),s={from:process.env.EMAIL_FROM||"noreply@airswift.com",to:e,subject:t,text:r,html:o||r},n=await i.sendMail(s);return console.log("✅ Email sent to:",e),console.log("\uD83D\uDCE7 Message ID:",n.messageId),a.logSent(e,t,n.messageId),n}catch(r){throw console.error("❌ Error sending email:",r),a.logFailed(e,t,r instanceof Error?r:Error(String(r))),r}}},8250:(e,t,r)=>{r.r(t),r.d(t,{default:()=>a});var o=r(11185),i=r.n(o);let s=new o.Schema({user_id:{type:o.Schema.Types.ObjectId,ref:"User",required:!0},job_id:{type:o.Schema.Types.ObjectId,ref:"Job",required:!0},national_id:{type:String,required:!0},phone:{type:String,required:!0},passport_path:{type:String,required:!0},cv_path:{type:String,required:!0},status:{type:String,enum:["pending","shortlisted","accepted","rejected"],default:"pending"},stage:{type:String,enum:["documents","interview","final"],default:"documents",index:!0},notes:{type:String,default:""},aiScore:{total:{type:Number,default:0},skills:{type:Number,default:0},experience:{type:Number,default:0},communication:{type:Number,default:0}},rank:{type:Number,default:null}},{timestamps:{createdAt:"created_at",updatedAt:"updated_at"}}),a=i().models.Application||i().model("Application",s)},61244:(e,t,r)=>{r.d(t,{u:()=>s});var o=r(11185),i=r.n(o);let s=async()=>{try{let e=process.env.MONGODB_URI||process.env.MONGO_URI||process.env.DATABASE_URL;if(!e)throw Error("MongoDB URI missing");await i().connect(e),console.log("MongoDB connected")}catch(e){console.error("MongoDB connection error:",e.message),process.exit(1)}}},47153:(e,t)=>{var r;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return r}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(r||(r={}))},71802:(e,t,r)=>{e.exports=r(20145)}};var t=require("../../../../../webpack-api-runtime.js");t.C(e);var r=t(t.s=75379);module.exports=r})();