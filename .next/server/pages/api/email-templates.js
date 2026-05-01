"use strict";(()=>{var e={};e.id=6056,e.ids=[6056],e.modules={99344:e=>{e.exports=require("jsonwebtoken")},11185:e=>{e.exports=require("mongoose")},20145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},56249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,a){return a in t?t[a]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,a)):"function"==typeof t&&"default"===a?t:void 0}}})},62690:(e,t,a)=>{a.r(t),a.d(t,{config:()=>f,default:()=>h,routeModule:()=>v});var i={};a.r(i),a.d(i,{default:()=>y});var o=a(71802),r=a(47153),s=a(56249),n=a(61244),c=a(61055),l=a(83444),u=a(99344),p=a.n(u),m=a(53182);let d=async e=>{try{let t=e.cookies.accessToken||e.headers.authorization?.replace("Bearer ","");if(!t)return null;let a=p().verify(t,process.env.JWT_SECRET||"secret");return await l.Z.findById(a.userId)}catch(e){return null}};async function y(e,t){if(await (0,n.u)(),"GET"===e.method)try{let e=await c.Z.find().sort({created_at:-1});if(!e||0===e.length){await c.Z.insertMany(m.t);let e=await c.Z.find().sort({created_at:-1});return t.status(200).json({success:!0,templates:e})}return t.status(200).json({success:!0,templates:e})}catch(e){return console.error("Error fetching email templates:",e),t.status(500).json({message:"Internal server error"})}else if("POST"!==e.method)return t.setHeader("Allow",["GET","POST"]),t.status(405).json({message:"Method Not Allowed"});else try{let a=await d(e);if(!a||"admin"!==a.role)return t.status(403).json({message:"Only admins can create templates"});let{name:i,subject:o,body:r,variables:s}=e.body;if(!i||!o||!r)return t.status(400).json({message:"Missing required fields"});if(await c.Z.findOne({name:i}))return t.status(400).json({message:"Template with this name already exists"});let n=new c.Z({name:i,subject:o,body:r,variables:s||[]});return await n.save(),t.status(201).json({success:!0,template:n})}catch(e){return console.error("Error creating template:",e),t.status(500).json({message:"Internal server error"})}}let h=(0,s.l)(i,"default"),f=(0,s.l)(i,"config"),v=new o.PagesAPIRouteModule({definition:{kind:r.x.PAGES_API,page:"/api/email-templates",pathname:"/api/email-templates",bundlePath:"",filename:""},userland:i})},53182:(e,t,a)=>{a.d(t,{t:()=>i});let i=[{id:"application_submitted",name:"Application Submitted",subject:"Application Received - {{jobTitle}} at {{companyName}}",body:`Dear {{applicantName}},

Thank you for submitting your application for the {{jobTitle}} position at {{companyName}}.

Your application has been received and is now under review. We have received the following documents:
- Passport
- National ID
- CV/Resume
{{#certificates}}- Certificate: {{certificateName}}{{/certificates}}

We will review your application and get back to you within 3-5 business days. If you have any questions, please don't hesitate to contact us.

Best regards,
The {{companyName}} Recruitment Team
Email: recruitment@talex.com
Phone: +1-800-TALEX`,stage:"application_submitted",isActive:!0,variables:["applicantName","jobTitle","companyName","certificates"]},{id:"application_reviewed",name:"Application Reviewed",subject:"Application Update - {{jobTitle}} Position",body:`Dear {{applicantName}},

We have completed the initial review of your application for the {{jobTitle}} position at {{companyName}}.

Thank you for your interest in joining our team. We appreciate the time and effort you put into your application. While we were impressed with your qualifications, we have decided to move forward with other candidates at this time.

We encourage you to apply for future opportunities that match your skills and experience.

Best regards,
The {{companyName}} Recruitment Team`,stage:"application_reviewed",isActive:!0,variables:["applicantName","jobTitle","companyName"]},{id:"interview_scheduled",name:"Interview Scheduled",subject:"Interview Scheduled - {{jobTitle}} Position",body:`Dear {{applicantName}},

Congratulations! Your application for the {{jobTitle}} position at {{companyName}} has been shortlisted.

We would like to invite you for an interview via Zoom. Here are the details:

📅 Date & Time: {{interviewDate}}
🔗 Zoom Link: {{zoomLink}}
📝 Interview Notes: {{interviewNotes}}

Please ensure you have:
- A stable internet connection
- A quiet environment
- Your Zoom application installed and updated
- All required documents ready for verification

If you need to reschedule or have any questions, please contact us immediately.

Best regards,
The {{companyName}} Recruitment Team
Email: recruitment@talex.com
Phone: +1-800-TALEX`,stage:"interview_scheduled",isActive:!0,variables:["applicantName","jobTitle","companyName","interviewDate","zoomLink","interviewNotes"]},{id:"interview_completed",name:"Interview Completed",subject:"Interview Completed - Next Steps for {{jobTitle}} Position",body:`Dear {{applicantName}},

Thank you for attending your interview for the {{jobTitle}} position at {{companyName}}.

Our team is currently reviewing your interview performance. We will get back to you with the next steps within 2-3 business days.

In the meantime, please prepare for the next stage of the process, which may include:
- Visa processing requirements
- Background verification
- Reference checks

We appreciate your patience and continued interest in joining our team.

Best regards,
The {{companyName}} Recruitment Team`,stage:"interview_completed",isActive:!0,variables:["applicantName","jobTitle","companyName"]},{id:"visa_payment_required",name:"Visa Payment Required",subject:"Visa Processing Fee Required - {{jobTitle}} Position",body:`Dear {{applicantName}},

Congratulations! You have successfully completed the interview process for the {{jobTitle}} position at {{companyName}}.

To proceed with your visa processing, you need to pay the visa processing fee of KES 30,000. This fee covers:
- Visa application processing
- Document verification
- Embassy coordination
- Work permit processing

Please complete the payment using M-Pesa by following these steps:
1. Go to M-Pesa menu on your phone
2. Select "Lipa na M-Pesa"
3. Select "Pay Bill"
4. Enter Business Number: 123456
5. Enter Account Number: VISA-{{applicationId}}
6. Enter Amount: 30000
7. Enter your M-Pesa PIN and confirm

Once payment is confirmed, your visa processing will begin immediately. You will receive a confirmation email with tracking details.

If you have any questions about the payment process, please contact our support team.

Best regards,
The {{companyName}} Visa Processing Team
Email: visa@talex.com
Phone: +1-800-TALEX`,stage:"visa_payment_required",isActive:!0,variables:["applicantName","jobTitle","companyName","applicationId"]},{id:"visa_processing_started",name:"Visa Processing Started",subject:"Visa Processing Started - {{jobTitle}} Position",body:`Dear {{applicantName}},

We have received your visa processing payment and have started processing your work visa for the {{jobTitle}} position at {{companyName}}.

Your application tracking number is: {{trackingNumber}}

Processing Timeline:
- Document verification: 2-3 business days
- Embassy submission: 5-7 business days
- Visa approval: 10-15 business days
- Total processing time: 3-4 weeks

You will receive regular updates on your visa status. Please keep all your documents safe and available for any additional requirements.

If you have any questions, please contact our visa processing team.

Best regards,
The {{companyName}} Visa Processing Team
Email: visa@talex.com
Phone: +1-800-TALEX
Tracking: {{trackingNumber}}`,stage:"visa_processing_started",isActive:!0,variables:["applicantName","jobTitle","companyName","trackingNumber"]},{id:"visa_ready",name:"Visa Ready for Collection",subject:"Visa Approved - Ready for Collection - {{jobTitle}} Position",body:`Dear {{applicantName}},

🎉 Congratulations! Your work visa has been approved!

Your visa for the {{jobTitle}} position at {{companyName}} is now ready for collection. Here are the details:

📋 Visa Details:
- Visa Number: {{visaNumber}}
- Issue Date: {{issueDate}}
- Expiry Date: {{expiryDate}}
- Work Permit Valid Until: {{workPermitExpiry}}

📍 Collection Information:
- Location: {{embassyLocation}}
- Collection Hours: Monday-Friday, 9:00 AM - 4:00 PM
- Required Documents: Original passport, collection receipt, ID

Please collect your visa within 30 days of this notification. Bring all required documents and the collection receipt attached to this email.

Once you have collected your visa, please contact us to arrange your travel and onboarding details.

Welcome to the {{companyName}} team!

Best regards,
The {{companyName}} Visa Processing Team
Email: visa@talex.com
Phone: +1-800-TALEX`,stage:"visa_ready",isActive:!0,variables:["applicantName","jobTitle","companyName","visaNumber","issueDate","expiryDate","workPermitExpiry","embassyLocation"]},{id:"application_rejected",name:"Application Rejected",subject:"Application Update - {{jobTitle}} Position",body:`Dear {{applicantName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}} and for taking the time to apply.

After careful consideration of your application and qualifications, we have decided not to proceed with your candidacy for this position. This decision was made based on our current requirements and the competitive nature of the applicant pool.

We were impressed with your background and experience, and we encourage you to apply for future opportunities that match your skills. We will keep your information on file for 6 months for consideration in other suitable positions.

Thank you again for your interest in {{companyName}}. We wish you the best in your job search.

Best regards,
The {{companyName}} Recruitment Team
Email: recruitment@talex.com
Phone: +1-800-TALEX`,stage:"application_rejected",isActive:!0,variables:["applicantName","jobTitle","companyName"]},{id:"user_suspended",name:"Account Suspended",subject:"Your account has been temporarily suspended",body:`Dear {{userName}},

We regret to inform you that your account has been temporarily suspended.

Suspension details:
- Reason: Account suspension
- Suspended until: {{suspendedUntil}}

While your account is suspended, you will not be able to access the platform. If you believe this is an error or have questions, please contact our support team.

Best regards,
The TALEX Support Team
Email: support@talex.com`,stage:"user_suspended",isActive:!0,variables:["userName","suspendedUntil"]},{id:"user_banned",name:"Account Banned",subject:"Your account has been permanently banned",body:`Dear {{userName}},

We regret to inform you that your account has been permanently banned.

This means that your account can no longer access the platform.

If you believe this action was taken in error, please contact our support team for assistance.

Best regards,
The TALEX Support Team
Email: support@talex.com`,stage:"user_banned",isActive:!0,variables:["userName"]},{id:"password_reset",name:"Password Reset",subject:"Reset Your Talex Password",body:`Dear {{userName}},

We received a request to reset your password for your Talex account.

If you made this request, click the link below to reset your password:

{{resetLink}}

This link will expire in 24 hours for security reasons.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

For security reasons, please don't share this email or the reset link with anyone.

If you have any questions or need assistance, please contact our support team.

Best regards,
The Talex Support Team
Email: support@talex.com
Phone: +1-800-TALEX

---
This is an automated message. Please do not reply to this email.`,stage:"password_reset",isActive:!0,variables:["userName","resetLink"]}]},61055:(e,t,a)=>{a.d(t,{Z:()=>s});var i=a(11185),o=a.n(i);let r=new i.Schema({name:{type:String,required:!0,unique:!0},subject:{type:String,required:!0},body:{type:String,required:!0},variables:{type:[String],default:[]}},{timestamps:{createdAt:"created_at",updatedAt:"updated_at"}}),s=o().models.EmailTemplate||o().model("EmailTemplate",r)},83444:(e,t,a)=>{a.d(t,{Z:()=>s});var i=a(11185),o=a.n(i);let r=new i.Schema({name:{type:String,required:!0},email:{type:String,required:!0,unique:!0,lowercase:!0},password:{type:String,required:!0},phone:{type:String},role:{type:String,enum:["user","admin","job-seeker","employer"],default:"user"},isVerified:{type:Boolean,default:!1},verificationToken:{type:String,default:null},verificationTokenExpires:{type:Date,default:null},otp:{type:String,default:null},otpExpires:{type:Date,default:null},resetPasswordToken:{type:String,default:null},resetPasswordExpires:{type:Date,default:null},refreshToken:{type:String,default:null},has_submitted:{type:Boolean,default:!1}},{timestamps:!0}),s=o().models.User||o().model("User",r)},61244:(e,t,a)=>{a.d(t,{u:()=>r});var i=a(11185),o=a.n(i);let r=async()=>{try{let e=process.env.MONGODB_URI||process.env.MONGO_URI||process.env.DATABASE_URL;if(!e)throw Error("MongoDB URI missing");await o().connect(e),console.log("MongoDB connected")}catch(e){console.error("MongoDB connection error:",e.message),process.exit(1)}}},47153:(e,t)=>{var a;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return a}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(a||(a={}))},71802:(e,t,a)=>{e.exports=a(20145)}};var t=require("../../webpack-api-runtime.js");t.C(e);var a=t(t.s=62690);module.exports=a})();