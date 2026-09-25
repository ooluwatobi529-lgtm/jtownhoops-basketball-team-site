import { useMemo, useState } from "react";
import { User, Star, X, MapPin, Award, Plus, Pencil, Trash2, Search, Save } from "lucide-react";
import playersBackground from "../images/mybackground4.jpg";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

const blankPlayer = { name: "", number: "", position: "Point Guard", avatar: "/src/images/jtownteamlogo.jpg", ppg: 0, apg: 0, rpg: 0, status: "Active", isAllStar: false, bio: "", height: "", weight: "", hometown: "", experience: "", college: "" };

export default function Players() {
  const { isAdmin } = useAuth();
  const { playersData, addPlayer, updatePlayer, removePlayer } = useNotifications();
  const [statFilter, setStatFilter] = useState("ppg");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [search, setSearch] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankPlayer);

  const visiblePlayers = useMemo(() => [...playersData]
    .filter((p) => `${p.name} ${p.position} ${p.status}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.stats?.[statFilter] || 0) - (a.stats?.[statFilter] || 0)), [playersData, search, statFilter]);

  const openAdd = () => { setEditingId(null); setForm(blankPlayer); setShowEditor(true); };
  const openEdit = (p) => { setEditingId(p.id); setForm({ ...p, ppg: p.stats?.ppg || 0, apg: p.stats?.apg || 0, rpg: p.stats?.rpg || 0 }); setShowEditor(true); };
  const savePlayer = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = { ...form, name: form.name.trim(), number: form.number.trim(), stats: { ppg: Number(form.ppg) || 0, apg: Number(form.apg) || 0, rpg: Number(form.rpg) || 0 } };
    delete payload.ppg; delete payload.apg; delete payload.rpg;
    editingId ? updatePlayer(editingId, payload) : addPlayer(payload);
    setShowEditor(false);
  };
  const deletePlayer = (p) => { if (window.confirm(`Remove ${p.name} from the roster?`)) { removePlayer(p.id); if (selectedPlayer?.id === p.id) setSelectedPlayer(null); } };

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 py-10 bg-cover bg-center bg-fixed" style={{ backgroundImage: `linear-gradient(rgba(5,5,5,.58),rgba(5,5,5,.65)),url(${playersBackground})` }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div><p className="text-orange-400 text-xs font-black uppercase tracking-[.35em]">J-Town Hoops • Roster Control</p><h1 className="text-4xl sm:text-5xl font-black uppercase mt-2">Players <span className="text-orange-500">Hub</span></h1><p className="text-neutral-400 mt-2">Add, edit and manage player profiles. Every saved change is sent to the shared notification system.</p></div>
          {isAdmin && <button onClick={openAdd} className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 text-black font-black px-5 py-3 rounded-xl shadow-lg shadow-orange-500/20"><Plus size={18}/> Add Player</button>}
        </div>

        <div className="grid md:grid-cols-[1fr_auto] gap-4 mb-7">
          <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search player, position or status..." className="w-full bg-black/70 border border-neutral-800 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-orange-500"/></div>
          <div className="flex gap-2 bg-black/70 border border-neutral-800 rounded-xl p-1">{["ppg","apg","rpg"].map((s)=><button key={s} onClick={()=>setStatFilter(s)} className={`px-4 py-2 rounded-lg uppercase text-xs font-black ${statFilter===s?"bg-orange-500 text-black":"text-neutral-300 hover:bg-neutral-900"}`}>{s}</button>)}</div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visiblePlayers.map((p)=><article key={p.id} className="group bg-black/75 border border-neutral-800 hover:border-orange-500/60 rounded-2xl overflow-hidden shadow-xl transition-all hover:-translate-y-1">
            <div className="relative h-56 overflow-hidden"><img src={p.avatar} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/><div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"/>{p.isAllStar&&<span className="absolute top-3 left-3 bg-orange-500 text-black text-[10px] font-black px-2 py-1 rounded-full flex gap-1 items-center"><Star size={11} fill="currentColor"/> ALL STAR</span>}<span className="absolute bottom-3 left-4 text-4xl font-black text-white/25">#{p.number}</span></div>
            <div className="p-5"><h2 className="text-xl font-black">{p.name}</h2><p className="text-orange-400 text-xs uppercase font-bold mt-1">{p.position}</p><div className="grid grid-cols-3 gap-2 my-4">{["ppg","apg","rpg"].map((s)=><div key={s} className="bg-neutral-900 rounded-lg p-2 text-center"><div className="font-black">{p.stats?.[s] ?? 0}</div><div className="text-[9px] text-neutral-500 uppercase">{s}</div></div>)}</div><div className="flex gap-2"><button onClick={()=>setSelectedPlayer(p)} className="flex-1 bg-white/5 hover:bg-white/10 rounded-lg py-2 text-xs font-bold">Profile</button>{isAdmin && <button onClick={()=>openEdit(p)} className="p-2 bg-orange-500/10 text-orange-400 rounded-lg hover:bg-orange-500 hover:text-black"><Pencil size={16}/></button>} {isAdmin && <button onClick={()=>deletePlayer(p)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white"><Trash2 size={16}/></button>}</div></div>
          </article>)}
        </div>
      </div>

      {selectedPlayer && <div className="fixed inset-0 z-[12000] bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center" onClick={()=>setSelectedPlayer(null)}><div className="w-full max-w-2xl bg-[#111] border border-neutral-800 rounded-3xl p-6 sm:p-8 relative" onClick={(e)=>e.stopPropagation()}><button onClick={()=>setSelectedPlayer(null)} className="absolute right-5 top-5 text-neutral-400 hover:text-white"><X/></button><div className="flex flex-col sm:flex-row gap-6"><img src={selectedPlayer.avatar} className="w-32 h-32 rounded-2xl object-cover"/><div><p className="text-orange-400 font-black">#{selectedPlayer.number}</p><h2 className="text-3xl font-black">{selectedPlayer.name}</h2><p className="text-neutral-400">{selectedPlayer.position}</p><p className="mt-4 text-neutral-300">{selectedPlayer.bio}</p></div></div><div className="grid sm:grid-cols-2 gap-3 mt-6 text-sm">{[[MapPin,"Hometown",selectedPlayer.hometown],[Award,"College",selectedPlayer.college],[User,"Height / Weight",`${selectedPlayer.height} • ${selectedPlayer.weight}`],[Star,"Experience",selectedPlayer.experience]].map(([Icon,l,v])=><div key={l} className="bg-neutral-900 rounded-xl p-3 flex gap-3"><Icon className="text-orange-400" size={18}/><div><p className="text-neutral-500 text-xs">{l}</p><p className="font-bold">{v}</p></div></div>)}</div></div></div>}

      {showEditor && isAdmin && <Editor title={editingId?"Edit Player":"Add Player"} onClose={()=>setShowEditor(false)} onSubmit={savePlayer}>{[
        ["Name","name","text"],["Jersey Number","number","text"],["Position","position","text"],["Status","status","text"],["Avatar path / URL","avatar","text"],["PPG","ppg","number"],["APG","apg","number"],["RPG","rpg","number"],["Height","height","text"],["Weight","weight","text"],["Hometown","hometown","text"],["Experience","experience","text"],["College","college","text"]
      ].map(([label,key,type])=><Field key={key} label={label} type={type} value={form[key]} onChange={(v)=>setForm({...form,[key]:v})}/>)}<label className="md:col-span-2 text-sm"><span className="text-neutral-400">Biography</span><textarea value={form.bio} onChange={(e)=>setForm({...form,bio:e.target.value})} rows={3} className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 outline-none focus:border-orange-500"/></label><label className="md:col-span-2 flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-xl p-3"><input type="checkbox" checked={form.isAllStar} onChange={(e)=>setForm({...form,isAllStar:e.target.checked})}/><span>All-Star player</span></label></Editor>}
    </div>
  );
}

function Field({label,value,onChange,type="text"}){return <label className="text-sm"><span className="text-neutral-400">{label}</span><input type={type} step={type==="number"?"0.1":undefined} value={value ?? ""} onChange={(e)=>onChange(e.target.value)} className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 outline-none focus:border-orange-500"/></label>}
function Editor({title,onClose,onSubmit,children}){return <div className="fixed inset-0 z-[12000] bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"><div className="max-w-3xl mx-auto my-8 bg-[#111] border border-neutral-800 rounded-3xl p-6"><div className="flex justify-between mb-5"><h2 className="text-2xl font-black">{title}</h2><button onClick={onClose}><X/></button></div><form onSubmit={onSubmit}><div className="grid md:grid-cols-2 gap-4">{children}</div><div className="flex justify-end gap-3 mt-6"><button type="button" onClick={onClose} className="px-5 py-3 rounded-xl bg-neutral-800">Cancel</button><button className="px-5 py-3 rounded-xl bg-orange-500 text-black font-black flex items-center gap-2"><Save size={17}/> Save Player</button></div></form></div></div>}
