import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const TL={critical:{label:"Critical",color:[220,38,38],hex:"#DC2626",glow:"rgba(220,38,38,0.15)"},high:{label:"High",color:[234,88,12],hex:"#EA580C",glow:"rgba(234,88,12,0.12)"},medium:{label:"Medium",color:[202,138,4],hex:"#CA8A04",glow:"rgba(202,138,4,0.10)"},low:{label:"Low",color:[22,163,74],hex:"#16A34A",glow:"rgba(22,163,74,0.10)"}};

// ── Smoke ──
const ThreatSmokeLayer=({threatLevel="critical",originY=200})=>{const canvasRef=useRef(null);const animRef=useRef(null);const particlesRef=useRef([]);const timeRef=useRef(0);const tl=TL[threatLevel]||TL.critical;
useEffect(()=>{const c=canvasRef.current;if(!c)return;const ctx=c.getContext("2d");let w,h;const resize=()=>{const r=c.parentElement.getBoundingClientRect();w=c.width=r.width*1.2;h=c.height=Math.min(r.height,800)*1.2};resize();window.addEventListener("resize",resize);
const noise=(x,y,t)=>Math.sin(x*0.007+t*0.001)*Math.cos(y*0.009+t*0.0012)*Math.sin((x+y)*0.005+t*0.0007)+Math.sin(x*0.013+y*0.011+t*0.0018)*0.5;
const col=tl.color,col2=[Math.min(255,col[0]+35),Math.max(0,col[1]-20),Math.max(0,col[2]-15)],col3=[Math.max(0,col[0]-30),Math.min(255,col[1]+25),Math.min(255,col[2]+35)],colors=[col,col2,col3];
const mkP=(x,y,cfg={})=>{const a=cfg.angle!=null?cfg.angle:Math.random()*Math.PI*2;const s=cfg.speed||(Math.random()*0.3+0.05);return{x:x+(Math.random()-0.5)*(cfg.spread||15),y:y+(Math.random()-0.5)*(cfg.spread||15),vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,decay:cfg.decay||(0.001+Math.random()*0.003),radius:Math.random()*(cfg.maxR||50)+(cfg.minR||15),growRate:cfg.grow||(Math.random()*0.15+0.03),color:cfg.color||col,opacity:cfg.opacity||0.035,noiseOffX:Math.random()*1000,noiseOffY:Math.random()*1000,drag:0.995+Math.random()*0.003,goingUp:cfg.goingUp||false}};
const emit=(t)=>{const scale=w/(c.parentElement.getBoundingClientRect().width||1);const cy=originY*scale*1.2,cx=w*0.42,arcW=520*scale;const param=Math.random(),ang=Math.PI*0.08+param*Math.PI*0.84;const px=cx+Math.cos(ang)*(arcW*0.5),py=cy-Math.sin(ang)*(25*scale);const goingUp=Math.random()<0.4;const spd=goingUp?(0.1+Math.random()*0.25):(0.07+Math.random()*0.18);const dir=goingUp?(-Math.PI*0.5+(Math.random()-0.5)*1.2):(Math.PI*0.5+(Math.random()-0.5)*1.8);const dec=goingUp?(0.0005+Math.random()*0.0015):(0.0015+Math.random()*0.004);return mkP(px,py,{color:colors[Math.floor(Math.random()*colors.length)],opacity:goingUp?0.025+Math.random()*0.02:0.03+Math.random()*0.025,maxR:goingUp?35+Math.random()*35:28+Math.random()*35,minR:10,speed:spd,angle:dir,spread:18,decay:dec,grow:goingUp?0.06+Math.random()*0.08:0.08+Math.random()*0.12,goingUp})};
const draw=()=>{timeRef.current++;const t=timeRef.current;ctx.fillStyle="rgba(12,16,33,0.06)";ctx.fillRect(0,0,w,h);ctx.fillStyle="rgba(12,16,33,0.03)";ctx.fillRect(0,h*0.4,w,h*0.6);if(t%80===0){ctx.fillStyle="rgba(12,16,33,0.06)";ctx.fillRect(0,0,w,h*0.3)}if(t%120===0){ctx.fillStyle="rgba(12,16,33,0.08)";ctx.fillRect(0,0,w,h)}
if(Math.random()<0.6)particlesRef.current.push(emit(t));if(Math.random()<0.5)particlesRef.current.push(emit(t));if(Math.random()<0.3)particlesRef.current.push(emit(t));
if(Math.random()<0.007){for(let i=0;i<6+Math.floor(Math.random()*10);i++)particlesRef.current.push(emit(t))}
const alive=[];particlesRef.current.forEach(p=>{p.life-=p.decay;if(p.life<=0)return;const nf=noise(p.x*0.007+p.noiseOffX,p.y*0.007+p.noiseOffY,t*0.4);p.vx+=nf*0.005;p.vy+=Math.cos(nf*3)*0.003;if(!p.goingUp)p.vy+=0.002;p.x+=p.vx;p.y+=p.vy;p.radius+=p.growRate;p.vx*=p.drag;p.vy*=p.drag;if(p.y<80){p.vy*=0.97;p.vx*=0.98}const al=p.life*p.opacity*(p.life>0.8?(1-p.life)/0.2+0.01:1);const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.radius);g.addColorStop(0,`rgba(${p.color},${al*1.2})`);g.addColorStop(0.3,`rgba(${p.color},${al*0.5})`);g.addColorStop(0.65,`rgba(${p.color},${al*0.1})`);g.addColorStop(1,`rgba(${p.color},0)`);ctx.beginPath();ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();alive.push(p)});
particlesRef.current=alive.length>600?alive.slice(-600):alive;animRef.current=requestAnimationFrame(draw)};ctx.fillStyle="#0C1021";ctx.fillRect(0,0,w,h);animRef.current=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(animRef.current);window.removeEventListener("resize",resize)}},[threatLevel,originY]);
return <canvas ref={canvasRef} style={{position:"absolute",top:0,left:0,width:"100%",height:750,zIndex:1,pointerEvents:"none"}}/>};

const HalfLogo=({color="#E8463A",width=120})=>(<svg viewBox="0 0 200 110" width={width} style={{display:"block"}}><path d="M20 108 A80 80 0 0 1 180 108" fill="none" stroke={color} strokeWidth="18" strokeLinecap="round"/><path d="M48 108 A52 52 0 0 1 152 108" fill="none" stroke={color} strokeWidth="15" strokeLinecap="round"/></svg>);

// ── Data ──
const EXP_DATA=Array.from({length:24},(_,i)=>{const m=i<12?`${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]} '25`:`${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i-12]} '26`;const b=40+Math.sin(i*0.5)*20;return{month:m,infostealerLogs:Math.round(b+Math.random()*30),dataBreaches:Math.round(b*0.4+Math.random()*15),logsOnSale:Math.round(b*0.3+Math.random()*20+i*2),darkWebMentions:Math.round(b*0.2+Math.random()*10)}});

const HERO_ALERTS=[{id:1,sev:"critical",text:"23 employee credentials found in stealer logs",source:"Russian Market",time:"2h ago"},{id:2,sev:"critical",text:"Company database listed for sale on Breach Forums",source:"Breach Forums",time:"5h ago"},{id:3,sev:"high",text:"3 VIP accounts detected in combo lists",source:"Telegram",time:"8h ago"}];
const LOWER_ALARMS=[{id:10,severity:"high",title:"New ransomware group mentions your sector",source:"Dark Web Forum",time:"6h ago",domain:"Financial Services",count:2},{id:11,severity:"medium",title:"Third-party vendor credentials exposed",source:"Public Paste",time:"1d ago",domain:"vendor.partner.com",count:7},{id:12,severity:"medium",title:"Subdomain discussed in hacking channel",source:"Telegram",time:"1d ago",domain:"api.example.com",count:2},{id:13,severity:"medium",title:"Exposed API key detected in code repository",source:"Github Gist",time:"2d ago",domain:"keys.example.com",count:1},{id:14,severity:"low",title:"Brand mentioned in low-risk dark web thread",source:"Forum",time:"3d ago",domain:"example.com",count:1}];
const COVERAGE_BARS=[{label:"Domains",used:2,total:3,color:"#E8463A"},{label:"Keywords",used:5,total:10,color:"#F59E0B"},{label:"VIP Accounts",used:1,total:5,color:"#A855F7"},{label:"Financial Assets",used:0,total:2,color:"#3B82F6"}];
const BLACK_MARKET=[{id:1,asset:"platform.socradar.com",price:"$10.00",status:"Open",date:"2025-10-29"},{id:2,asset:"academy.socradar.is",price:"$10.00",status:"Open",date:"2025-10-22"},{id:3,asset:"socradar.com",price:"$10.00",status:"Open",date:"2025-10-03"},{id:4,asset:"fastpay.co.id",price:"$10.00",status:"Open",date:"2025-10-03"}];
const FQDN_DATA=[{domain:"gateway.example.com",count:28700},{domain:"example.com",count:14100},{domain:"openam.example.com",count:460},{domain:"www.example.com",count:1100},{domain:"business.example.com",count:335},{domain:"apps.example.com",count:758},{domain:"login.example.com",count:644}];
const THIRD_PARTY_DATA=[{domain:"salesforce.example.com",service:"Salesforce",creds:10},{domain:"docusign.com",service:"DocuSign",creds:7},{domain:"onelogin.com",service:"OneLogin",creds:5},{domain:"lastpass.com",service:"LastPass",creds:5},{domain:"adp.com",service:"ADP",creds:4},{domain:"carta.com",service:"Carta",creds:4}];
const EXPOSED_EMP=[{email:"v.walker@greenanimalsbank.com",date:"2023-11-21",strength:"Fair"},{email:"g.barnett@greenanimalsbank.com",date:"2023-11-21",strength:"Weak"},{email:"m.white@greenanimalsbank.com",date:"2023-11-21",strength:"Strong"},{email:"bird@greenanimalsbank.com",date:"2023-11-21",strength:"Poor"},{email:"test9@greenanimalsbank.com",date:"2023-11-21",strength:"Weak"},{email:"admin@greenanimalsbank.com",date:"2023-10-15",strength:"Fair"},{email:"finance@greenanimalsbank.com",date:"2023-10-12",strength:"Poor"},{email:"ops@greenanimalsbank.com",date:"2023-09-28",strength:"Weak"}];

const SEV={critical:"#DC2626",high:"#EA580C",medium:"#CA8A04",low:"#16A34A"};
const STR_COL={Weak:"#DC2626",Poor:"#EA580C",Fair:"#CA8A04",Strong:"#16A34A",Excellent:"#059669"};

// ── Alert Card ──
const AlertCard=({alert,onDismiss})=>{const[hov,setHov]=useState(false);return(
<div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{padding:"12px 14px",borderRadius:12,position:"relative",overflow:"hidden",background:"rgba(255,255,255,0.02)",border:`1px solid ${SEV[alert.sev]}18`,transition:"all 0.25s",marginBottom:8,...(hov&&{borderColor:`${SEV[alert.sev]}30`})}}>
  <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
    <div style={{width:7,height:7,borderRadius:"50%",background:SEV[alert.sev],boxShadow:`0 0 6px ${SEV[alert.sev]}60`,marginTop:5,flexShrink:0}}/>
    <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,lineHeight:1.4,marginBottom:3}}>{alert.text}</div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}><span className="mono" style={{fontSize:10,color:"rgba(232,236,241,0.25)"}}>{alert.source}</span><span style={{width:3,height:3,borderRadius:"50%",background:"rgba(255,255,255,0.1)"}}/><span className="mono" style={{fontSize:10,color:"rgba(232,236,241,0.2)"}}>{alert.time}</span></div>
    </div>
  </div>
  <div style={{position:"absolute",top:0,right:0,bottom:0,display:"flex",alignItems:"center",gap:6,padding:"0 12px",background:hov?"rgba(12,16,33,0.75)":"rgba(12,16,33,0)",backdropFilter:hov?"blur(6px)":"blur(0px)",opacity:hov?1:0,transform:hov?"translateX(0)":"translateX(12px)",transition:"all 0.3s cubic-bezier(0.16,1,0.3,1)",borderRadius:"0 12px 12px 0"}}>
    <button style={{padding:"6px 14px",borderRadius:8,border:"none",background:SEV[alert.sev],color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Satoshi'",boxShadow:`0 2px 8px ${SEV[alert.sev]}30`,whiteSpace:"nowrap"}}>Go to Alert</button>
    <button style={{padding:"6px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.04)",color:"rgba(232,236,241,0.65)",fontSize:11,fontWeight:500,cursor:"pointer",fontFamily:"'Satoshi'",whiteSpace:"nowrap"}}>Close</button>
    <button onClick={e=>{e.stopPropagation();onDismiss?.(alert.id)}} style={{width:24,height:24,borderRadius:6,border:"none",background:"rgba(255,255,255,0.06)",color:"rgba(232,236,241,0.35)",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
  </div>
</div>)};

const CoverageBar=({item})=>{const[hov,setHov]=useState(false);const pct=item.total>0?(item.used/item.total)*100:0;return(<div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{padding:"8px 10px",borderRadius:9,cursor:"pointer",transition:"all 0.2s",background:hov?"rgba(255,255,255,0.03)":"transparent",marginBottom:4}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><span style={{fontSize:11,fontWeight:500,color:hov?"#E8ECF1":"rgba(232,236,241,0.5)",transition:"color 0.2s"}}>{item.label}</span><span className="mono" style={{fontSize:10,color:hov?item.color:"rgba(232,236,241,0.3)",transition:"color 0.2s"}}>{item.used}/{item.total}</span></div><div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:2,background:item.color,width:`${pct}%`,opacity:hov?1:0.65,transition:"all 0.3s",boxShadow:hov?`0 0 8px ${item.color}40`:"none"}}/></div></div>)};

// ═══════════════════════════════════════
export default function App(){
  const[threatLevel]=useState("critical");const[loaded,setLoaded]=useState(false);
  const[heroAlerts,setHeroAlerts]=useState(HERO_ALERTS);
  const[domainTab,setDomainTab]=useState("fqdn"); // fqdn | thirdparty
  useEffect(()=>{setTimeout(()=>setLoaded(true),100)},[]);
  const tl=TL[threatLevel];const dismissHero=(id)=>setHeroAlerts(p=>p.filter(a=>a.id!==id));
  const ttS={contentStyle:{background:"rgba(12,16,28,0.96)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,fontSize:11,fontFamily:"'JetBrains Mono',monospace",backdropFilter:"blur(20px)",boxShadow:"0 12px 48px rgba(0,0,0,0.5)",padding:"10px 14px"},itemStyle:{color:"#E8ECF1",padding:"2px 0"},labelStyle:{color:"rgba(232,236,241,0.5)",marginBottom:4,fontWeight:600}};

  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#0C1021",color:"#E8ECF1",fontFamily:"'Satoshi','DM Sans',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@300;400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box}::selection{background:rgba(232,70,58,0.3);color:#fff}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.06);border-radius:3px}
        .mono{font-family:'JetBrains Mono',monospace}.hfont{font-family:'Plus Jakarta Sans',sans-serif}
        .recharts-cartesian-grid-horizontal line,.recharts-cartesian-grid-vertical line{stroke:rgba(255,255,255,0.03)}
        .recharts-text{fill:rgba(232,236,241,0.3)!important;font-family:'JetBrains Mono',monospace!important;font-size:9px!important}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 15px ${tl.glow}}50%{box-shadow:0 0 35px ${tl.glow},0 0 50px ${tl.glow}}}
        .glass{background:rgba(255,255,255,0.02);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.05);border-radius:16px}
        .glass-sm{background:rgba(255,255,255,0.025);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.05);border-radius:12px}
        .alarm-row{padding:13px 16px;border-bottom:1px solid rgba(255,255,255,0.03);transition:all 0.2s;cursor:pointer}.alarm-row:hover{background:rgba(255,255,255,0.02)}.alarm-row:last-child{border-bottom:none}
        .tag{display:inline-flex;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:500;background:rgba(255,255,255,0.04);color:rgba(232,236,241,0.4);margin-right:4px}
        .nav-item{padding:10px 16px;border-radius:8px;font-size:13px;color:rgba(255,255,255,0.45);cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:10px;margin-bottom:2px}
        .nav-item:hover{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.7)}.nav-item.active{background:rgba(232,70,58,0.1);color:#E8463A;font-weight:600}
        .nav-section{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.2);padding:16px 16px 6px;font-family:'JetBrains Mono',monospace}
        .tab-btn{padding:6px 16px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.25s;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);color:rgba(232,236,241,0.4);font-family:'Satoshi',sans-serif}
        .tab-btn:hover{border-color:rgba(255,255,255,0.1)}.tab-btn.on{background:rgba(232,70,58,0.1);border-color:rgba(232,70,58,0.25);color:#E8463A;font-weight:600}
        .trow{padding:9px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.02);cursor:pointer;transition:background 0.2s}
        .trow:hover{background:rgba(255,255,255,0.02)}
      `}</style>

      {/* SIDEBAR */}
      <aside style={{width:220,background:"#151B2E",borderRight:"1px solid rgba(255,255,255,0.05)",display:"flex",flexDirection:"column",flexShrink:0,overflow:"auto",zIndex:30}}>
        <div style={{padding:"16px 16px 20px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}><div style={{display:"flex",alignItems:"center",gap:8}}><svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12.5" fill="none" stroke="#E8463A" strokeWidth="1.5" opacity="0.7"/><circle cx="14" cy="14" r="6" fill="#E8463A" opacity="0.85"/><circle cx="14" cy="14" r="2.5" fill="#151B2E"/></svg><span className="hfont" style={{fontSize:15,fontWeight:700,color:"#fff"}}>SOCRadar</span></div></div>
        <div style={{padding:"12px 8px",flex:1}}>
          <div className="nav-item" style={{color:"rgba(255,255,255,0.6)"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboards</div>
          <div className="nav-section">Dark Web Radar</div>
          <div className="nav-item active"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0-4 19.5"/></svg>Dashboard</div>
          <div className="nav-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z"/></svg>Protection Coverage</div>
          <div className="nav-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Dark Web Search</div>
          <div className="nav-section">Threat Intelligence</div>
          <div className="nav-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path d="M2 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/></svg>I&A Intelligence</div>
          <div className="nav-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>Tactical Intel</div>
          <div className="nav-section">Operations</div>
          <div className="nav-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>Incidents</div>
          <div className="nav-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>Reports</div>
        </div>
        <div style={{padding:"12px 8px",borderTop:"1px solid rgba(255,255,255,0.05)"}}><div className="nav-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2m-9-11h2m18 0h2m-3.6-6.4l-1.4 1.4M6 6L4.6 4.6m0 14.8L6 18m12 0l1.4 1.4"/></svg>Settings</div></div>
      </aside>

      {/* MAIN */}
      <main style={{flex:1,overflow:"auto",position:"relative"}}>
        <div style={{padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.04)",background:"rgba(12,16,33,0.92)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:25}}>
          <div><span className="hfont" style={{fontSize:16,fontWeight:700}}>Dark Web Dashboard</span><span className="mono" style={{fontSize:10,color:"rgba(232,236,241,0.25)",marginLeft:12}}>Advanced Dark Web Monitoring</span></div>
          <div style={{display:"flex",alignItems:"center",gap:16}}><div className="mono" style={{fontSize:10,color:"rgba(232,236,241,0.3)"}}>Last scan: 12 min ago</div><div style={{width:32,height:32,borderRadius:10,background:"rgba(232,70,58,0.1)",border:"1px solid rgba(232,70,58,0.2)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div></div>
        </div>

        <div style={{position:"relative"}}>
          <ThreatSmokeLayer threatLevel={threatLevel} originY={200}/>
          <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:18,position:"relative",zIndex:2}}>

            {/* ═══ 1. HERO ═══ */}
            <div style={{position:"relative",marginTop:24}}>
              <div style={{position:"absolute",top:-40,left:"50%",transform:"translateX(-50%)",zIndex:5,filter:`drop-shadow(0 4px 24px ${tl.hex}50) drop-shadow(0 0 40px ${tl.hex}25)`}}><HalfLogo color={tl.hex} width={90}/></div>
              <div className="glass" style={{position:"relative",overflow:"hidden",animation:loaded?"fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both":"none",boxShadow:`0 8px 40px rgba(0,0,0,0.25), 0 0 40px ${tl.glow}`,borderTop:`1px solid ${tl.hex}20`}}>
                <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 30% 40%, ${tl.hex}08 0%, transparent 60%)`,pointerEvents:"none"}}/>
                <div style={{position:"relative",zIndex:2,padding:"28px 24px 20px"}}>
                  <div style={{display:"flex",gap:20,alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><div style={{width:10,height:10,borderRadius:"50%",background:tl.hex,boxShadow:`0 0 12px ${tl.hex}80`,animation:"pulseGlow 2.5s ease-in-out infinite"}}/><span className="hfont" style={{fontSize:12,fontWeight:700,color:tl.hex,textTransform:"uppercase",letterSpacing:"0.08em"}}>{tl.label} Exposure</span></div>
                      <h2 className="hfont" style={{fontSize:26,fontWeight:800,letterSpacing:"-0.03em",lineHeight:1.15,marginBottom:16,color:"#fff",textShadow:"0 2px 24px rgba(0,0,0,0.6)"}}>Immediate attention required</h2>
                      {heroAlerts.map(a=><AlertCard key={a.id} alert={a} onDismiss={dismissHero}/>)}
                      <div style={{padding:"12px 14px",borderRadius:12,background:"rgba(59,130,246,0.04)",border:"1px solid rgba(59,130,246,0.15)",display:"flex",alignItems:"flex-start",gap:10,marginTop:4}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" style={{flexShrink:0,marginTop:1}}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg><div><div style={{fontSize:13,fontWeight:500,color:"rgba(232,236,241,0.7)",lineHeight:1.4}}>Under-configured protection</div><div style={{fontSize:12,color:"rgba(232,236,241,0.4)",lineHeight:1.5,marginTop:2}}>Add additional VIP accounts and IP addresses to maximize coverage.</div></div></div>
                    </div>
                    <div style={{width:220,flexShrink:0}}>
                      <div className="glass-sm" style={{padding:"14px 16px",background:"rgba(255,255,255,0.012)"}}>
                        <div className="mono" style={{fontSize:10,letterSpacing:"0.08em",color:"rgba(232,236,241,0.3)",textTransform:"uppercase",marginBottom:8}}>Coverage</div>
                        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}><svg viewBox="0 0 80 44" width={65}><path d="M8 42 A32 32 0 0 1 72 42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" strokeLinecap="round"/><path d="M8 42 A32 32 0 0 1 72 42" fill="none" stroke={tl.hex} strokeWidth="6" strokeLinecap="round" strokeDasharray="100.5" strokeDashoffset={100.5*0.35} opacity="0.8"/><text x="40" y="38" textAnchor="middle" fill="#fff" fontSize="14" fontFamily="Plus Jakarta Sans" fontWeight="800">65%</text></svg><div><div style={{fontSize:11,color:"rgba(232,236,241,0.5)"}}>Config Score</div><div style={{fontSize:10,color:"rgba(232,236,241,0.25)"}}>Improve below ↓</div></div></div>
                        <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)",marginBottom:8}}/>
                        {COVERAGE_BARS.map(item=><CoverageBar key={item.label} item={item}/>)}
                        <div style={{marginTop:8,textAlign:"center"}}><span className="mono" style={{fontSize:10,color:"#E8463A",cursor:"pointer"}}>Protection Coverage →</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ 2. EXPOSURE TIMELINE ═══ */}
            <div className="glass" style={{padding:"22px 20px 14px",animation:loaded?"fadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,padding:"0 4px"}}>
                <div><div className="mono" style={{fontSize:10,letterSpacing:"0.08em",color:"rgba(232,236,241,0.25)",textTransform:"uppercase",marginBottom:4}}>Exposure Timeline</div><span className="hfont" style={{fontSize:15,fontWeight:700}}>Threat activity — last 24 months</span></div>
                <div style={{display:"flex",gap:14}}>{[{l:"Stealer Logs",c:"#E8463A"},{l:"Breaches",c:"#F59E0B"},{l:"Logs on Sale",c:"#A855F7"},{l:"DW Mentions",c:"#3B82F6"}].map(i=>(<div key={i.l} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:3,background:i.c,opacity:0.7}}/><span className="mono" style={{fontSize:9,color:"rgba(232,236,241,0.3)"}}>{i.l}</span></div>))}</div>
              </div>
              <ResponsiveContainer width="100%" height={180}><AreaChart data={EXP_DATA}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} interval={3}/><YAxis axisLine={false} tickLine={false} width={30}/><Tooltip {...ttS}/><Area type="monotone" dataKey="infostealerLogs" stroke="#E8463A" fill="#E8463A" fillOpacity={0.08} strokeWidth={2} dot={false}/><Area type="monotone" dataKey="dataBreaches" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.05} strokeWidth={1.5} dot={false}/><Area type="monotone" dataKey="logsOnSale" stroke="#A855F7" fill="#A855F7" fillOpacity={0.05} strokeWidth={1.5} dot={false}/><Area type="monotone" dataKey="darkWebMentions" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.04} strokeWidth={1.5} dot={false}/></AreaChart></ResponsiveContainer>
            </div>

            {/* ═══ 3. STATS ROW ═══ */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,animation:loaded?"fadeUp 0.6s 0.15s cubic-bezier(0.16,1,0.3,1) both":"none"}}>
              {[{label:"Total DW Findings",value:"1,345",change:"+12%",icon:"M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"},{label:"Exposed Employees",value:"712",change:"+8%",icon:"M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-6 8a6 6 0 0 1 12 0H6z"},{label:"Infected Employees",value:"2,552",change:"+23%",icon:"M13 2L3 14h9l-1 8 10-12h-9l1-8z"},{label:"Password Reuse",value:"31.8%",change:"+2%",icon:"M12 2L4 7v6c0 5.25 3.4 10.15 8 11.35 4.6-1.2 8-6.1 8-11.35V7l-8-5z"}].map((s,i)=>(
                <div key={i} className="glass" style={{padding:"16px 18px",cursor:"pointer",transition:"all 0.25s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(232,70,58,0.15)";e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.05)";e.currentTarget.style.transform="translateY(0)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><div style={{width:28,height:28,borderRadius:8,background:"rgba(232,70,58,0.06)",border:"1px solid rgba(232,70,58,0.12)",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="2"><path d={s.icon}/></svg></div><span style={{fontSize:11,color:"rgba(232,236,241,0.4)",fontWeight:500}}>{s.label}</span></div>
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}><span className="hfont" style={{fontSize:24,fontWeight:800,letterSpacing:"-0.02em"}}>{s.value}</span><span className="mono" style={{fontSize:10,color:"#DC2626",fontWeight:500}}>▲ {s.change}</span></div>
                </div>
              ))}
            </div>

            {/* ═══ 4. TWO COLS: Alerts + Identifiers/Black Market ═══ */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              {/* Your Critical Alerts */}
              <div className="glass" style={{overflow:"hidden",animation:loaded?"fadeUp 0.6s 0.2s cubic-bezier(0.16,1,0.3,1) both":"none"}}>
                <div style={{padding:"18px 20px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div className="mono" style={{fontSize:10,letterSpacing:"0.08em",color:"rgba(232,236,241,0.25)",textTransform:"uppercase",marginBottom:4}}>Your Critical Alerts</div><span className="hfont" style={{fontSize:15,fontWeight:700}}>{LOWER_ALARMS.length} open alerts</span></div>
                  <span className="mono" style={{fontSize:11,color:"#E8463A",cursor:"pointer"}}>View All →</span>
                </div>
                <div style={{maxHeight:380,overflow:"auto"}}>
                  {LOWER_ALARMS.map(a=>(<div key={a.id} className="alarm-row"><div style={{display:"flex",alignItems:"flex-start",gap:10}}><div style={{width:7,height:7,borderRadius:"50%",background:SEV[a.severity],boxShadow:`0 0 6px ${SEV[a.severity]}50`,marginTop:6,flexShrink:0}}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,lineHeight:1.4,marginBottom:4}}>{a.title}</div><div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}><span className="mono" style={{fontSize:10,color:"rgba(232,236,241,0.25)"}}>{a.source}</span><span style={{width:3,height:3,borderRadius:"50%",background:"rgba(255,255,255,0.1)"}}/><span className="mono" style={{fontSize:10,color:"rgba(232,236,241,0.2)"}}>{a.time}</span></div></div><div className="mono" style={{fontSize:18,fontWeight:700,color:SEV[a.severity],opacity:0.6,flexShrink:0}}>{a.count}</div></div></div>))}
                </div>
              </div>

              {/* Unique Identifiers (top) + Black Market (bottom) */}
              <div style={{display:"flex",flexDirection:"column",gap:18,animation:loaded?"fadeUp 0.6s 0.25s cubic-bezier(0.16,1,0.3,1) both":"none"}}>
                {/* Unique Identifiers */}
                <div className="glass" style={{padding:"16px 20px"}}>
                  <div className="mono" style={{fontSize:10,letterSpacing:"0.08em",color:"rgba(232,236,241,0.25)",textTransform:"uppercase",marginBottom:14}}>Data Unique Identifiers</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                    {[{label:"Unique FQDNs",value:"217",trend:"-6.0%",down:true},{label:"Unique Passwords",value:"764",trend:"-2.2%",down:true},{label:"Unique Usernames",value:"1.9K",trend:"-0.8%",down:true}].map((d,i)=>(
                      <div key={i} style={{padding:"12px 14px",borderRadius:12,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)"}}>
                        <div style={{fontSize:10,color:"rgba(232,236,241,0.3)",marginBottom:6,fontWeight:500}}>{d.label}</div>
                        <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                          <span className="hfont" style={{fontSize:20,fontWeight:800}}>{d.value}</span>
                          <span className="mono" style={{fontSize:9,color:d.down?"#16A34A":"#DC2626"}}>{d.down?"▼":"▲"} {d.trend}</span>
                        </div>
                        {/* Mini sparkline */}
                        <svg width="100%" height="24" viewBox="0 0 100 24" preserveAspectRatio="none" style={{marginTop:6,display:"block",opacity:0.4}}>
                          <polyline points={Array.from({length:12},(_,j)=>`${j*9},${12+Math.sin(j*0.8+i*2)*8-j*0.3}`).join(" ")} fill="none" stroke={d.down?"#16A34A":"#DC2626"} strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Black Market Activity */}
                <div className="glass" style={{overflow:"hidden",flex:1}}>
                  <div style={{padding:"16px 20px 12px",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><div className="mono" style={{fontSize:10,letterSpacing:"0.08em",color:"rgba(232,236,241,0.25)",textTransform:"uppercase",marginBottom:4}}>Black Market Activity</div><span className="hfont" style={{fontSize:14,fontWeight:700}}>{BLACK_MARKET.length} active listings</span></div>
                    <span className="mono" style={{fontSize:11,color:"#E8463A",cursor:"pointer"}}>View All →</span>
                  </div>
                  <div style={{padding:"0"}}>
                    <div style={{padding:"6px 20px",display:"flex",justifyContent:"space-between"}}><span className="mono" style={{fontSize:9,color:"rgba(232,236,241,0.15)",textTransform:"uppercase"}}>Asset</span><div style={{display:"flex",gap:40}}><span className="mono" style={{fontSize:9,color:"rgba(232,236,241,0.15)"}}>Price</span><span className="mono" style={{fontSize:9,color:"rgba(232,236,241,0.15)"}}>Status</span></div></div>
                    {BLACK_MARKET.map(bm=>(<div key={bm.id} className="trow"><span className="mono" style={{fontSize:11,color:"rgba(232,236,241,0.5)"}}>{bm.asset}</span><div style={{display:"flex",gap:20,alignItems:"center"}}><span className="mono" style={{fontSize:11,color:"#F59E0B",fontWeight:500}}>{bm.price}</span><span className="tag" style={{background:"rgba(22,163,74,0.08)",color:"#16A34A",fontSize:9}}>{bm.status}</span></div></div>))}
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ 5. DW SEARCH ENGINE — white ═══ */}
            <div style={{background:"#F0F2F5",borderRadius:18,padding:"28px 32px",display:"flex",alignItems:"center",gap:20,animation:loaded?"fadeUp 0.6s 0.3s cubic-bezier(0.16,1,0.3,1) both":"none",boxShadow:"0 4px 24px rgba(0,0,0,0.15)"}}>
              <div style={{flex:"0 0 auto",display:"flex",alignItems:"center",gap:12}}>
                <div style={{position:"relative",width:44,height:44}}><svg width="44" height="44" viewBox="0 0 44 44" fill="none"><circle cx="22" cy="22" r="18" stroke="#1A1A2E" strokeWidth="1.5"/><ellipse cx="22" cy="22" rx="10" ry="18" stroke="#1A1A2E" strokeWidth="1"/><line x1="4" y1="22" x2="40" y2="22" stroke="#1A1A2E" strokeWidth="0.8"/><line x1="22" y1="4" x2="22" y2="40" stroke="#1A1A2E" strokeWidth="0.8"/></svg><svg width="20" height="20" viewBox="0 0 24 24" fill="#E8463A" style={{position:"absolute",bottom:-2,right:-4}}><path d="M12 2C9.24 2 7 4.24 7 7c0 1.4.58 2.66 1.5 3.56L12 14l3.5-3.44C16.42 9.66 17 8.4 17 7c0-2.76-2.24-5-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/><path d="M5 18c0-2 3.13-3.5 7-3.5s7 1.5 7 3.5v2H5v-2z" opacity="0.7"/></svg></div>
                <span className="hfont" style={{fontSize:20,fontWeight:800,color:"#1A1A2E",letterSpacing:"-0.02em"}}>Dark Web <span style={{color:"#E8463A"}}>Search Engine</span></span>
              </div>
              <div style={{flex:1,position:"relative"}}><svg style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",opacity:0.25}} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input placeholder="Search keywords, domains, IPs, emails, hashes..." style={{width:"100%",padding:"14px 16px 14px 42px",fontSize:14,fontFamily:"'Satoshi'",background:"#fff",border:"1px solid rgba(0,0,0,0.08)",borderRadius:12,color:"#1A1A2E",outline:"none",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}/></div>
              <button style={{padding:"14px 28px",borderRadius:12,border:"none",cursor:"pointer",background:"#E8463A",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"'Plus Jakarta Sans'",boxShadow:"0 4px 16px rgba(232,70,58,0.3)",flexShrink:0}}>Search</button>
            </div>

            {/* ═══ 6. TWO COLS: Exposed Employees + Toggled Domains ═══ */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,animation:loaded?"fadeUp 0.6s 0.35s cubic-bezier(0.16,1,0.3,1) both":"none"}}>
              {/* Exposed Employees — taller */}
              <div className="glass" style={{overflow:"hidden"}}>
                <div style={{padding:"18px 20px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div className="mono" style={{fontSize:10,letterSpacing:"0.08em",color:"rgba(232,236,241,0.25)",textTransform:"uppercase",marginBottom:4}}>Exposed Employees</div><div style={{display:"flex",alignItems:"baseline",gap:8}}><span className="hfont" style={{fontSize:22,fontWeight:800}}>712</span><span className="mono" style={{fontSize:10,color:"#DC2626"}}>▲ +8%</span></div></div>
                  <span className="mono" style={{fontSize:11,color:"#E8463A",cursor:"pointer"}}>View All →</span>
                </div>
                <div style={{padding:"4px 0"}}>
                  <div style={{padding:"0 20px 4px",display:"grid",gridTemplateColumns:"1fr 80px 70px",gap:8}}><span className="mono" style={{fontSize:9,color:"rgba(232,236,241,0.15)",textTransform:"uppercase"}}>Email</span><span className="mono" style={{fontSize:9,color:"rgba(232,236,241,0.15)",textAlign:"center"}}>Strength</span><span className="mono" style={{fontSize:9,color:"rgba(232,236,241,0.15)",textAlign:"right"}}>Date</span></div>
                  {EXPOSED_EMP.map((r,i)=>(
                    <div key={i} className="trow" style={{display:"grid",gridTemplateColumns:"1fr 80px 70px",gap:8,alignItems:"center"}}>
                      <span className="mono" style={{fontSize:11,color:"rgba(232,236,241,0.5)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.email}</span>
                      <div style={{display:"flex",justifyContent:"center"}}><div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(b=><div key={b} style={{width:10,height:6,borderRadius:1,background:b<=({Weak:1,Poor:2,Fair:3,Strong:4,Excellent:5}[r.strength]||0)?STR_COL[r.strength]:"rgba(255,255,255,0.06)"}}/>)}</div></div>
                      <span className="mono" style={{fontSize:10,color:"rgba(232,236,241,0.2)",textAlign:"right"}}>{r.date}</span>
                    </div>
                  ))}
                  <div style={{padding:"12px 20px"}}><span className="mono" style={{fontSize:10,color:"#E8463A",cursor:"pointer"}}>View Exposed Employees →</span></div>
                </div>
              </div>

              {/* Toggled: Unique FQDNs / Third-Party Risk */}
              <div className="glass" style={{overflow:"hidden"}}>
                <div style={{padding:"18px 20px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                    <div><div className="mono" style={{fontSize:10,letterSpacing:"0.08em",color:"rgba(232,236,241,0.25)",textTransform:"uppercase",marginBottom:4}}>Exposure Distribution</div><span className="hfont" style={{fontSize:15,fontWeight:700}}>{domainTab==="fqdn"?"Stealer Exposure by Domain":"Third-Party Service Risk"}</span></div>
                    <span className="mono" style={{fontSize:11,color:"#E8463A",cursor:"pointer"}}>Details →</span>
                  </div>
                  <div style={{display:"flex",gap:6}}><button className={`tab-btn ${domainTab==="fqdn"?"on":""}`} onClick={()=>setDomainTab("fqdn")}>Unique FQDNs</button><button className={`tab-btn ${domainTab==="thirdparty"?"on":""}`} onClick={()=>setDomainTab("thirdparty")}>Third-Party Risk</button></div>
                </div>
                <div style={{padding:"4px 0"}}>
                  {domainTab==="fqdn" ? (<>
                    <div style={{padding:"0 20px 4px",display:"flex",justifyContent:"space-between"}}><span className="mono" style={{fontSize:9,color:"rgba(232,236,241,0.15)",textTransform:"uppercase"}}>Domain</span><span className="mono" style={{fontSize:9,color:"rgba(232,236,241,0.15)"}}>Exposures</span></div>
                    {FQDN_DATA.map((r,i)=>{const max=FQDN_DATA[0].count;return(
                      <div key={i} className="trow"><div style={{flex:1,minWidth:0}}><span className="mono" style={{fontSize:11,color:"rgba(232,236,241,0.5)"}}>{r.domain}</span></div><div style={{display:"flex",alignItems:"center",gap:8,width:160}}><div style={{flex:1,height:4,borderRadius:2,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:2,background:"#E8463A",width:`${(r.count/max)*100}%`,opacity:0.6}}/></div><span className="mono" style={{fontSize:10,color:"rgba(232,236,241,0.4)",minWidth:40,textAlign:"right"}}>{r.count>=1000?(r.count/1000).toFixed(1)+"K":r.count}</span></div></div>
                    )})}
                  </>) : (<>
                    <div style={{padding:"6px 20px 2px"}}><p style={{fontSize:12,color:"rgba(232,236,241,0.35)",lineHeight:1.5,marginBottom:8}}>Employee credentials found on these third-party services. These accounts may provide lateral access to your organization.</p></div>
                    {THIRD_PARTY_DATA.map((r,i)=>(
                      <div key={i} className="trow"><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:28,height:28,borderRadius:8,background:"rgba(232,70,58,0.06)",border:"1px solid rgba(232,70,58,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:11,fontWeight:700,color:"#E8463A"}}>{r.service[0]}</span></div><div><div style={{fontSize:12,fontWeight:500,color:"rgba(232,236,241,0.7)"}}>{r.service}</div><div className="mono" style={{fontSize:10,color:"rgba(232,236,241,0.25)"}}>{r.domain}</div></div></div><div style={{display:"flex",alignItems:"center",gap:6}}><span className="hfont" style={{fontSize:16,fontWeight:700,color:"#E8463A"}}>{r.creds}</span><span style={{fontSize:10,color:"rgba(232,236,241,0.25)"}}>credentials</span></div></div>
                    ))}
                  </>)}
                  <div style={{padding:"12px 20px"}}><span className="mono" style={{fontSize:10,color:"#E8463A",cursor:"pointer"}}>{domainTab==="fqdn"?"View All Domains →":"View All Third-Party Risk →"}</span></div>
                </div>
              </div>
            </div>

            {/* ═══ 7. I&A INTELLIGENCE SEARCH — white ═══ */}
            <div style={{background:"#F0F2F5",borderRadius:18,padding:"28px 32px",display:"flex",alignItems:"center",gap:20,animation:loaded?"fadeUp 0.6s 0.4s cubic-bezier(0.16,1,0.3,1) both":"none",boxShadow:"0 4px 24px rgba(0,0,0,0.15)"}}>
              <div style={{flex:"0 0 auto",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:44,height:44,borderRadius:12,background:"#1A1A2E",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8463A" strokeWidth="2" strokeLinecap="round"><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path d="M2 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/></svg></div>
                <span className="hfont" style={{fontSize:20,fontWeight:800,color:"#1A1A2E",letterSpacing:"-0.02em"}}>Identity & Access <span style={{color:"#E8463A"}}>Intelligence</span></span>
              </div>
              <div style={{flex:1,position:"relative"}}><svg style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",opacity:0.25}} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input placeholder="Search by domain, email, IP address, or username..." style={{width:"100%",padding:"14px 16px 14px 42px",fontSize:14,fontFamily:"'Satoshi'",background:"#fff",border:"1px solid rgba(0,0,0,0.08)",borderRadius:12,color:"#1A1A2E",outline:"none",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}/></div>
              <button style={{padding:"14px 28px",borderRadius:12,border:"none",cursor:"pointer",background:"#E8463A",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"'Plus Jakarta Sans'",boxShadow:"0 4px 16px rgba(232,70,58,0.3)",flexShrink:0}}>Search</button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
