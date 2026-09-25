import { useMemo, useState } from "react";
import { Trophy, Plus, Minus, X, Pencil, Trash2, Save, Users } from "lucide-react";
import backgroundImage from "../images/mybackground4.jpg";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

import jtownTeamLogo from "../images/jtownteamlogo.jpg";

const blank = {
  name: "",
  logo: jtownTeamLogo,
  wins: 0,
  losses: 0,
  division: "North Conference"
};

export default function Teams(){
  const { isAdmin } = useAuth();
  const { teamsData, addTeam, updateTeam, removeTeam } = useNotifications();
  const [selectedTeam,setSelectedTeam]=useState(null); const [showEditor,setShowEditor]=useState(false); const [editingId,setEditingId]=useState(null); const [form,setForm]=useState(blank);
  const rankedTeams=useMemo(()=>[...teamsData].sort((a,b)=>(b.wins/(b.wins+b.losses||1))-(a.wins/(a.wins+a.losses||1))),[teamsData]);
  const openAdd=()=>{setEditingId(null);setForm(blank);setShowEditor(true)};
  const openEdit=(t)=>{setEditingId(t.id);setForm({...t});setShowEditor(true)};
  const save=(e)=>{e.preventDefault();if(!form.name.trim())return;const payload={...form,name:form.name.trim(),wins:Number(form.wins)||0,losses:Number(form.losses)||0};editingId?updateTeam(editingId,payload):addTeam({...payload,roster:[]});setShowEditor(false)};
  const adjust=(team,field,delta)=>updateTeam(team.id,{[field]:Math.max(0,(team[field]||0)+delta)});
  const del=(t)=>{if(window.confirm(`Delete ${t.name}?`)){removeTeam(t.id);setSelectedTeam(null)}};
  const active=selectedTeam?teamsData.find(t=>t.id===selectedTeam.id):null;

  return <div className="min-h-screen text-white py-10 px-4 sm:px-6 bg-cover bg-center bg-fixed" style={{backgroundImage:`linear-gradient(rgba(0,0,0,.58),rgba(0,0,0,.64)),url(${backgroundImage})`}}><div className="max-w-6xl mx-auto">
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 border-b border-neutral-800 pb-6 mb-8"><div><p className="text-orange-400 text-xs font-black uppercase tracking-[.35em]">League Control Centre</p><h1 className="text-4xl font-black uppercase flex items-center gap-3 mt-2"><Trophy className="text-orange-500"/> League Standings</h1><p className="text-neutral-400 mt-2">Records auto-rank by win percentage. Every saved change becomes a shared site update.</p></div>{isAdmin&&<button onClick={openAdd} className="bg-orange-500 hover:bg-orange-400 text-black font-black px-5 py-3 rounded-xl flex items-center justify-center gap-2"><Plus size={18}/> Add Team</button>}</div>
    <div className="space-y-4">{rankedTeams.map((team,index)=>{const pct=Math.round((team.wins/(team.wins+team.losses||1))*100);return <article key={team.id} className="bg-black/75 border border-neutral-800 hover:border-orange-500/50 rounded-2xl p-5 transition-all"><div className="grid lg:grid-cols-[70px_1fr_180px_220px] gap-5 items-center"><div className="text-center"><span className="text-3xl font-black text-orange-500">#{index+1}</span></div><button onClick={()=>setSelectedTeam(team)} className="flex items-center gap-4 text-left"><img src={team.logo} alt={team.name} className="w-16 h-16 rounded-2xl object-cover border border-neutral-700"/><div><h2 className="text-xl font-black">{team.name}</h2><p className="text-xs text-neutral-400 uppercase">{team.division}</p><div className="h-1.5 w-40 bg-neutral-800 rounded-full mt-2 overflow-hidden"><div className="h-full bg-orange-500" style={{width:`${pct}%`}}/></div><p className="text-[10px] text-neutral-500 mt-1">{pct}% win rate</p></div></button><div className="text-center bg-neutral-900 rounded-xl py-3"><div className="text-2xl font-black">{team.wins}<span className="text-neutral-600 mx-2">-</span>{team.losses}</div><div className="text-[10px] uppercase text-neutral-500">Wins • Losses</div></div><div className="flex justify-end gap-2 flex-wrap">{isAdmin&&<><Mini onClick={()=>adjust(team,"wins",1)} icon={<Plus size={14}/>} text="Win"/><Mini onClick={()=>adjust(team,"wins",-1)} icon={<Minus size={14}/>} text="Win"/><Mini onClick={()=>adjust(team,"losses",1)} icon={<Plus size={14}/>} text="Loss"/><button onClick={()=>openEdit(team)} className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-black"><Pencil size={16}/></button><button onClick={()=>del(team)} className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"><Trash2 size={16}/></button></>}</div></div></article>})}</div>
  </div>
  {active&&<div className="fixed inset-0 z-[12000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>setSelectedTeam(null)}><div className="w-full max-w-xl bg-[#111] border border-neutral-800 rounded-3xl p-6" onClick={e=>e.stopPropagation()}><div className="flex justify-between"><div className="flex gap-4"><img src={active.logo} className="w-20 h-20 rounded-2xl"/><div><h2 className="text-2xl font-black">{active.name}</h2><p className="text-orange-400">{active.division}</p></div></div><button onClick={()=>setSelectedTeam(null)}><X/></button></div><h3 className="font-black mt-6 flex gap-2"><Users size={18}/> Roster</h3><div className="mt-3 space-y-2">{active.roster?.length?active.roster.map((p,i)=><div key={i} className="bg-neutral-900 rounded-xl p-3 flex justify-between"><span>#{p.number} <b>{p.name}</b> • {p.pos}</span><span className="text-orange-400">{p.stat}</span></div>):<p className="text-neutral-500">No roster entries yet.</p>}</div></div></div>}
  {showEditor&&isAdmin&&<div className="fixed inset-0 z-[12000] bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center"><form onSubmit={save} className="w-full max-w-xl bg-[#111] border border-neutral-800 rounded-3xl p-6"><div className="flex justify-between mb-5"><h2 className="text-2xl font-black">{editingId?"Edit Team":"Add Team"}</h2><button type="button" onClick={()=>setShowEditor(false)}><X/></button></div><div className="grid sm:grid-cols-2 gap-4"><Field label="Team Name" value={form.name} set={v=>setForm({...form,name:v})}/><Field label="Division" value={form.division} set={v=>setForm({...form,division:v})}/><Field label="Wins" type="number" value={form.wins} set={v=>setForm({...form,wins:v})}/><Field label="Losses" type="number" value={form.losses} set={v=>setForm({...form,losses:v})}/><div className="sm:col-span-2"><Field label="Logo path / URL" value={form.logo} set={v=>setForm({...form,logo:v})}/></div></div><button className="mt-6 w-full bg-orange-500 hover:bg-orange-400 text-black font-black py-3 rounded-xl flex justify-center items-center gap-2"><Save size={17}/> Save Team</button></form></div>}
  </div>
}
function Mini({onClick,icon,text}){return <button onClick={onClick} className="px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs font-bold flex items-center gap-1">{icon}{text}</button>}
function Field({label,value,set,type="text"}){return <label className="text-sm text-neutral-400">{label}<input type={type} value={value??""} onChange={e=>set(e.target.value)} className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white outline-none focus:border-orange-500"/></label>}
