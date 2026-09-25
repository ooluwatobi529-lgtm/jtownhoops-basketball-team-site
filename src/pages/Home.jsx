import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SidebarWidget from "../components/SidebarWidget";
import { useAuth } from "../context/AuthContext";
import {
  ArrowUp,
  ArrowUpRight,
  Bot,
  Camera,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Edit3,
  HeartHandshake,
  ImagePlus,
  MessageCircle,
  Music2,
  Play,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

/* ============================================================
   J-TOWN HOOPS HOME PAGE
   ============================================================
   EASY IMAGE EDITING:
   1. Put your files in: src/images/
   2. Import them below.
   3. Add/remove them in DEFAULT_HERO_SLIDES.

   IMPORTANT:
   Replace the sample filenames below ONLY if your actual filenames differ.
   ============================================================ */

import hero1 from "../images/about1.jpg";
import hero2 from "../images/about2.jpg";
import hero3 from "../images/gallery1.jpg";
import hero4 from "../images/gallery2.jpg";
import hero5 from "../images/bigfemo.jpg";
import footerBackground from "../images/mybackground4.jpg";
import jtownLogo from "../images/jtownteamlogo.jpg";

/* ORIGINAL HOME HERO IMAGES
   Change these filenames whenever you want different carousel pictures.
   Every image below comes from src/images/. */
import originalHero1 from "../images/about1.jpg";
import originalHero2 from "../images/about2.jpg";
import originalHero3 from "../images/gallery1.jpg";

const HOME_CONTENT_KEY = "jtown-home-content-v1";

/* Change this ONE number to your real WhatsApp number.
   Format: country code + number, no + and no spaces. */
const WHATSAPP_NUMBER = "2348000000000";

const DEFAULT_HERO_SLIDES = [
  {
    id: 1,
    image: hero1,
    eyebrow: "J-Town Hoops • Jos, Nigeria",
    title: "Education & Integrity Through Sports",
    text: "Training talent. Building character. Creating opportunities through basketball.",
  },
  {
    id: 2,
    image: hero2,
    eyebrow: "Youth Basketball Clinic",
    title: "Developing The Next Generation",
    text: "A home for training, discipline, teamwork, competition and community.",
  },
  {
    id: 3,
    image: hero3,
    eyebrow: "Game Day",
    title: "Built For The Game",
    text: "Follow J-Town Hoops highlights, players, teams, schedules and tournament action.",
  },
  {
    id: 4,
    image: hero4,
    eyebrow: "The Community",
    title: "One City. One Court. One Mission.",
    text: "Connecting players, supporters, teams and basketball lovers across the J-Town community.",
  },
  {
    id: 5,
    image: hero5,
    eyebrow: "J-Town Hoops",
    title: "More Than Basketball",
    text: "Supporting youth innovation, productivity and positive development through sport.",
  },
];

const DEFAULT_HIGHLIGHTS = [
  {
    id: 1,
    tag: "Tournament",
    title: "J-Town Hoops Game Highlights",
    text: "Catch the energy, plays and moments from J-Town Hoops basketball.",
    image: hero3,
    link: "/videos",
  },
  {
    id: 2,
    tag: "Clinic",
    title: "Youth Basketball Development",
    text: "Training fundamentals, teamwork, confidence and discipline.",
    image: hero2,
    link: "/pictures",
  },
  {
    id: 3,
    tag: "Community",
    title: "Inside J-Town Hoops",
    text: "Photos, stories and activities from the J-Town basketball community.",
    image: hero4,
    link: "/news",
  },
];

const DEFAULT_UPDATES = [
  {
    id: 1,
    category: "Training",
    title: "Training Camp Is Open",
    text: "The squad continues preparation with focused drills, conditioning and tactical work.",
  },
  {
    id: 2,
    category: "Clinic",
    title: "Youth Basketball Clinic",
    text: "Young athletes can learn fundamentals, teamwork and discipline through basketball.",
  },
  {
    id: 3,
    category: "Team",
    title: "Roster Update",
    text: "Meet the players representing J-Town Hoops and follow their season statistics.",
  },
];

const DEFAULT_TEAM_ROSTER = [
  {
    id: 1,
    name: "Marcus '⚡' Bolt",
    position: "Point Guard",
    jersey: "#0",
    ppg: "18.4",
    rpg: "5.2",
    apg: "7.1",
    status: "Active",
    image: "/players/gallery1.jpg",
  },
  {
    id: 2,
    name: "Cynthia Morgan",
    position: "Forward / Center",
    jersey: "#23",
    ppg: "22.1",
    rpg: "11.4",
    apg: "2.3",
    status: "Active",
    image: "/players/gallery2.jpg",
  },
  {
    id: 3,
    name: "TEAMS",
    position: "Coach",
    jersey: "",
    ppg: "16.8",
    rpg: "3.1",
    apg: "4.5",
    status: "Coach",
    image: "../src/images/aipart2.jpg",
  },
    {
    id: 4,
    name: "Mr Brown",
    position: "Shooting Guard",
    jersey: "#19",
    ppg: "16.8",
    rpg: "3.1",
    apg: "4.5",
    status: "Active",
    image: "/players/gallery5.jpg",
  },
    {
    id: 5,
    name: "Chris",
    position: "Point Guard",
    jersey: "#1",
    ppg: "16.8",
    rpg: "3.1",
    apg: "4.5",
    status: "Active",
    image: "/players/gallery4.jpg",
  },
  {
    id: 6,
    name: "Big Femo",
    position: "Founder",
    jersey: "#13",
    ppg: "12.3",
    rpg: "6.8",
    apg: "3.9",
    status: "Founder",
    image: "../src/images/bigfemo.jpg",
  },
  
];

function loadHomeContent() {
  try {
    const saved = JSON.parse(localStorage.getItem(HOME_CONTENT_KEY) || "{}");
    return {
      heroSlides:
        Array.isArray(saved.heroSlides) && saved.heroSlides.length
          ? saved.heroSlides
          : DEFAULT_HERO_SLIDES,
      highlights:
        Array.isArray(saved.highlights) && saved.highlights.length
          ? saved.highlights
          : DEFAULT_HIGHLIGHTS,
      updates:
        Array.isArray(saved.updates) && saved.updates.length
          ? saved.updates
          : DEFAULT_UPDATES,
      roster:
        Array.isArray(saved.roster) && saved.roster.length
          ? saved.roster
          : DEFAULT_TEAM_ROSTER,
    };
  } catch {
    return {
      heroSlides: DEFAULT_HERO_SLIDES,
      highlights: DEFAULT_HIGHLIGHTS,
      updates: DEFAULT_UPDATES,
      roster: DEFAULT_TEAM_ROSTER,
    };
  }
}

function AdminModal({ editor, setEditor, onSave, onClose }) {
  if (!editor) return null;

  const setField = (field, value) =>
    setEditor((prev) => ({
      ...prev,
      item: { ...prev.item, [field]: value },
    }));

  const isHero = editor.section === "hero";
  const isHighlight = editor.section === "highlight";
  const isRoster = editor.section === "roster";

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-amber-500/30 bg-[#11110f] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">
              Admin Controller
            </p>
            <h3 className="mt-1 text-xl font-black uppercase text-white">
              {editor.mode === "add" ? "Add" : "Edit"}{" "}
              {isHero ? "Hero Slide" : isHighlight ? "Highlight" : isRoster ? "Roster Player" : "Update"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-neutral-400 transition hover:border-amber-500 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-4 p-6">
          {isHero && (
            <input
              value={editor.item.eyebrow || ""}
              onChange={(e) => setField("eyebrow", e.target.value)}
              placeholder="Small heading"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
            />
          )}

          {isHighlight && (
            <input
              value={editor.item.tag || ""}
              onChange={(e) => setField("tag", e.target.value)}
              placeholder="Highlight category"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
            />
          )}

          {!isHero && !isHighlight && !isRoster && (
            <input
              value={editor.item.category || ""}
              onChange={(e) => setField("category", e.target.value)}
              placeholder="Update category"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
            />
          )}

          {isRoster && (
            <>
              <input
                required
                value={editor.item.name || ""}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Player name"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
              />
              <input
                required
                value={editor.item.position || ""}
                onChange={(e) => setField("position", e.target.value)}
                placeholder="Position / role"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
              />
            </>
          )}

          {!isRoster && (
          <input
            required
            value={editor.item.title || ""}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Title"
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
          />
          )}

          {!isRoster && (
          <textarea
            required
            rows={4}
            value={editor.item.text || ""}
            onChange={(e) => setField("text", e.target.value)}
            placeholder="Description"
            className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
          />
          )}

          {(isHero || isHighlight || isRoster) && (
            <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-4">
              <label className="flex cursor-pointer items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400">
                <ImagePlus size={17} />
                Choose replacement image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setField("image", reader.result);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              <p className="mt-2 text-center text-[10px] text-neutral-500">
                For permanent project images, use the src/images imports at the top of Home.jsx.
              </p>
            </div>
          )}

          {isHighlight && (
            <input
              value={editor.item.link || ""}
              onChange={(e) => setField("link", e.target.value)}
              placeholder="/videos"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-amber-500"
            />
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-amber-500 px-5 py-4 text-xs font-black uppercase tracking-widest text-black transition hover:bg-orange-500"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminControls({ onEdit, onDelete }) {
  return (
    <div className="absolute right-3 top-3 z-30 flex gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-full border border-white/10 bg-black/75 p-2 text-white backdrop-blur transition hover:border-amber-500 hover:text-amber-400"
        title="Edit"
      >
        <Edit3 size={14} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-full border border-white/10 bg-black/75 p-2 text-white backdrop-blur transition hover:border-red-500 hover:text-red-400"
        title="Delete"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default function Home() {
  const { user, isAdmin } = useAuth();

  // ORIGINAL HERO CAROUSEL — now sourced only from src/images.
  // Add/remove imported images here whenever you want.
  const carouselImages = [originalHero1, originalHero2, originalHero3];
  const initialContent = useMemo(() => loadHomeContent(), []);

  const [activeSlide, setActiveSlide] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [showAiGuide, setShowAiGuide] = useState(false);
  const [editor, setEditor] = useState(null);
  const [heroSlides, setHeroSlides] = useState(initialContent.heroSlides);
  const [highlights, setHighlights] = useState(initialContent.highlights);
  const [updates, setUpdates] = useState(initialContent.updates);
  const [teamRoster, setTeamRoster] = useState(initialContent.roster);
  const [tourStep, setTourStep] = useState(-1);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 650);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const persist = (nextHero, nextHighlights, nextUpdates, nextRoster = teamRoster) => {
    try {
      localStorage.setItem(
        HOME_CONTENT_KEY,
        JSON.stringify({
          heroSlides: nextHero,
          highlights: nextHighlights,
          updates: nextUpdates,
          roster: nextRoster,
        })
      );
    } catch (error) {
      console.error("Could not save Home page changes:", error);
      alert(
        "This browser does not have enough local storage for that image. Use a smaller image or add it through src/images."
      );
    }
  };

  const openEditor = (section, mode, item = {}) => {
    const blank =
      section === "hero"
        ? { id: Date.now(), image: hero1, eyebrow: "", title: "", text: "" }
        : section === "highlight"
        ? { id: Date.now(), image: hero2, tag: "", title: "", text: "", link: "/videos" }
        : section === "roster"
        ? { id: Date.now(), image: hero1, name: "", position: "" }
        : { id: Date.now(), category: "", title: "", text: "" };

    setEditor({
      section,
      mode,
      item: mode === "add" ? blank : { ...item },
    });
  };

  const saveEditor = (e) => {
    e.preventDefault();
    if (!editor) return;

    let nextHero = heroSlides;
    let nextHighlights = highlights;
    let nextUpdates = updates;
    let nextRoster = teamRoster;

    const updateList = (list) =>
      editor.mode === "add"
        ? [...list, editor.item]
        : list.map((item) => (item.id === editor.item.id ? editor.item : item));

    if (editor.section === "hero") {
      nextHero = updateList(heroSlides);
      setHeroSlides(nextHero);
    } else if (editor.section === "highlight") {
      nextHighlights = updateList(highlights);
      setHighlights(nextHighlights);
    } else if (editor.section === "roster") {
      nextRoster = updateList(teamRoster);
      setTeamRoster(nextRoster);
    } else {
      nextUpdates = updateList(updates);
      setUpdates(nextUpdates);
    }

    persist(nextHero, nextHighlights, nextUpdates, nextRoster);
    setEditor(null);
  };

  const removeItem = (section, id) => {
    if (!window.confirm("Delete this Home page item?")) return;

    let nextHero = heroSlides;
    let nextHighlights = highlights;
    let nextUpdates = updates;
    let nextRoster = teamRoster;

    if (section === "hero") {
      nextHero = heroSlides.filter((item) => item.id !== id);
      setHeroSlides(nextHero);
      setActiveSlide(0);
    } else if (section === "highlight") {
      nextHighlights = highlights.filter((item) => item.id !== id);
      setHighlights(nextHighlights);
    } else if (section === "roster") {
      nextRoster = teamRoster.filter((item) => item.id !== id);
      setTeamRoster(nextRoster);
    } else {
      nextUpdates = updates.filter((item) => item.id !== id);
      setUpdates(nextUpdates);
    }

    persist(nextHero, nextHighlights, nextUpdates, nextRoster);
  };

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello J-Town Hoops, I am contacting you from the website."
  )}`;

  const currentSlide = heroSlides[activeSlide] || DEFAULT_HERO_SLIDES[0];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0d0d0c] font-sans text-gray-100">
      <AdminModal
        editor={editor}
        setEditor={setEditor}
        onSave={saveEditor}
        onClose={() => setEditor(null)}
      />

      {/* SIDEBAR WIDGET — preserved from your original Home structure */}
      <div className="relative z-50 w-full border-b border-neutral-800 bg-[#141412]">
        <SidebarWidget />
      </div>

      {/* DYNAMIC LIVE MATRICES ALERT TICKER */}
      <div className="bg-amber-500 text-white py-0.5 uppercase overflow-hidden font-bold text-[10px] tracking-widest whitespace-nowrap shadow-2xs relative z-10">
        <div className="inline-block animate-jsx-marquee">
          ⚡ Welcome to J-Town Hoops Basketball Website • Education and Integrity Through Sports / Supporting Youths Innovations and Productivity • Highlights and Interactive Activities Below.... • J-town Hoops Basketball Clinic at Azin Yako Dadin Kowa Youth Center Jos / Join us for the N0.1 Basketball Tournament in Jos / Now Open!!! • ⚡
        </div>
      </div>

      {/* HERO CONTAINER FEATURING BACKGROUND IMAGE CAROUSEL WITH GLOW */}
      <section id="home" className="relative min-h-[75vh] flex items-center justify-center py-20 px-4">
        
        {/* Dynamic Image Slides Container Behind the Text Content */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {carouselImages.map((imgUrl, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                idx === activeSlide ? "opacity-35" : "opacity-0"
              }`}
              style={{ backgroundImage: `url('${imgUrl}')` }}
            />
          ))}
          {/* Cyberpunk Radial Glow Layer + Dark Vignette */}
          <div className="absolute inset-0 bg-linear-to-t from-[#0d0d0c] via-transparent to-[#0d0d0c]/80 z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12),transparent_70%)] z-10 animate-pulse" />
          
          <div className="sports-grid absolute inset-0 z-10 opacity-60" />

<div className="hero-ball-glow z-10" />

<span className="floating-light light-one z-20" />
<span className="floating-light light-two z-20" />
<span className="floating-light light-three z-20" />
<span className="floating-light light-four z-20" />

<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-24 bg-orange-500/10 blur-[70px] z-10" />
        </div>

        {/* Foreground Content Card Layout */}
        <div className="relative z-20 flex flex-col items-center w-full max-w-6xl mx-auto text-center space-y-8 overflow-visible">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-widest shadow-lg backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Education and Integrity Through Sports</span>
          </div>

<h1 className="jtown-title w-full">
  <span className="jtown-town">J-TOWN</span>{" "}
  <span className="jtown-hoops">HOOPS</span>
</h1>

<div className="hero-description-wrapper">
  <p className="hero-description">
    Follow the latest highlights, scores, and real-time updates from your favorite team roster program. Elite talent training, game tactics, and atomic performance.
  </p>
</div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a 
              href="#highlights"
              className="sports-button w-full sm:w-auto bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold uppercase tracking-wider text-xs px-8 py-4 rounded-xl shadow-xl shadow-amber-500/20 transform hover:-translate-y-0.5 transition-all text-center"
            >
              View Game Highlights
            </a>

            <a 
              href="#roster" 
              className="sports-button w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-xs px-8 py-4 rounded-xl border border-white/10 backdrop-blur-md transition-all text-center"
            >
              Roster Statistics
            </a>
          </div>
        </div>
      </section>

      {/* CONTENT HUB SECTION WITH INTERACTIVE MEDIA AND HIGHLIGHT TILES */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Highlights Feed Grid Area — original section, now admin editable */}
          <div id="highlights-first" className="lg:col-span-12 space-y-8 scroll-mt-28">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="border-l-4 border-amber-500 pl-4">
                <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">Featured Media</h2>
                <p className="text-gray-400 text-xs mt-1">Archives, game moments and practice recordings.</p>
              </div>
              {isAdmin && (
                <button type="button" onClick={() => openEditor("highlight", "add")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-amber-400 transition hover:bg-amber-500 hover:text-black">
                  <Plus size={15} /> Add Highlight
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {highlights.map((item) => (
                <article key={`first-${item.id}`} className="sports-card relative bg-[#141412] rounded-2xl overflow-hidden border border-neutral-800 group hover:border-amber-500/30 transition-all shadow-xl">
                  {isAdmin && (
                    <AdminControls onEdit={() => openEditor("highlight", "edit", item)} onDelete={() => removeItem("highlight", item.id)} />
                  )}
                  <div className="aspect-video bg-neutral-900 relative flex items-center justify-center overflow-hidden">
                    <img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="play-button w-14 h-14 bg-linear-to-br from-amber-300 to-orange-500 rounded-full flex items-center justify-center text-black group-hover:scale-110 transition-all relative z-10">
                      <Play size={20} fill="currentColor" />
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 block mb-1">{item.tag}</span>
                    <h3 className="font-bold text-white text-sm">{item.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-neutral-500">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* FIRST TEAM PERFORMANCE REMOVED — the newer performance section below is kept. */}

{/* ROSTER — simplified original roster with admin controls */}
        <section id="roster-first" className="lg:col-span-12 mt-10 scroll-mt-28">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="border-l-4 border-amber-500 pl-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-amber-400">The Squad</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white">J-Town <span className="text-amber-400">Roster</span></h2>
              <p className="mt-2 max-w-xl text-sm text-gray-400">Meet the people representing J-Town Hoops — their picture, name and position at a glance.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-md">
                <p className="text-[9px] uppercase tracking-[0.25em] text-gray-500 font-bold">Roster</p>
                <p className="text-2xl font-black text-white">{teamRoster.length}</p>
              </div>
              {isAdmin && (
                <button type="button" onClick={() => openEditor("roster", "add")} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-4 text-[9px] font-black uppercase tracking-widest text-black transition hover:bg-orange-500">
                  <Plus size={15} /> Add Person
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamRoster.map((player) => (
              <article key={`first-roster-${player.id}`} className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-[#141412] shadow-2xl transition duration-500 hover:-translate-y-2 hover:border-amber-500/50">
                {isAdmin && (
                  <AdminControls onEdit={() => openEditor("roster", "edit", player)} onDelete={() => removeItem("roster", player.id)} />
                )}
                <div className="relative h-72 overflow-hidden bg-neutral-900">
                  <img src={player.image} alt={`${player.name} - J-Town Hoops`} className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-linear-to-t from-[#141412] via-[#141412]/10 to-transparent" />
                  <div className="sports-grid absolute inset-0 opacity-20 pointer-events-none" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="mb-1 text-[9px] font-black uppercase tracking-[0.22em] text-amber-400">{player.position}</p>
                    <h3 className="text-2xl font-black uppercase leading-tight text-white drop-shadow-lg">{player.name}</h3>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>

      {/* ======================================================
          NEW HOME EXPERIENCE CONTINUES BELOW
          Original hero/highlights/performance/roster above are preserved.
          ====================================================== */}
      <main className="relative z-20 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* WELCOME / QUICK ACTIONS */}
        <section id="quick-actions" className="grid gap-4 md:grid-cols-3 scroll-mt-28">
          <Link
            to="/register"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#141412] p-6 transition hover:-translate-y-1 hover:border-amber-500/50"
          >
            <Users className="text-amber-400" />
            <h3 className="mt-5 text-xl font-black uppercase text-white">
              Join J-Town Hoops
            </h3>
            <p className="mt-2 text-xs leading-6 text-neutral-500">
              Register as a User, Player, Team, Supporter or Manager from one connected registration system.
            </p>
            <ArrowUpRight className="absolute right-5 top-5 text-neutral-600 transition group-hover:text-amber-400" size={18} />
          </Link>

          <Link
            to="/support"
            className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-6 transition hover:-translate-y-1 hover:border-amber-500/60"
          >
            <HeartHandshake className="text-amber-400" />
            <h3 className="mt-5 text-xl font-black uppercase text-white">
              Support The Mission
            </h3>
            <p className="mt-2 text-xs leading-6 text-neutral-400">
              Help develop young basketball talent, organize competitions and create opportunities through sport.
            </p>
            <ArrowUpRight className="absolute right-5 top-5 text-amber-500" size={18} />
          </Link>

          <Link
            to="/ai-assistant"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#141412] p-6 transition hover:-translate-y-1 hover:border-amber-500/50"
          >
            <Bot className="text-amber-400" />
            <h3 className="mt-5 text-xl font-black uppercase text-white">
              J-Town AI Assistant
            </h3>
            <p className="mt-2 text-xs leading-6 text-neutral-500">
              Ask about players, teams, schedules, games, news and how to navigate the J-Town Hoops website.
            </p>
            <ArrowUpRight className="absolute right-5 top-5 text-neutral-600 transition group-hover:text-amber-400" size={18} />
          </Link>
        </section>

        {/* FEATURED MEDIA */}
        <section id="highlights" className="mt-16 scroll-mt-28">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="border-l-4 border-amber-500 pl-4">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">
                J-Town Media Hub
              </p>
              <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-white">
                Featured Highlights
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Games, clinics, photos, videos and community moments.
              </p>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => openEditor("highlight", "add")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-amber-400 transition hover:bg-amber-500 hover:text-black"
              >
                <Plus size={15} />
                Add Highlight
              </button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-[#141412] shadow-xl transition duration-500 hover:-translate-y-2 hover:border-amber-500/40"
              >
                {isAdmin && (
                  <AdminControls
                    onEdit={() => openEditor("highlight", "edit", item)}
                    onDelete={() => removeItem("highlight", item.id)}
                  />
                )}

                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-black shadow-lg">
                    <Play size={18} fill="currentColor" />
                  </div>
                </div>

                <div className="p-5">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-400">
                    {item.tag}
                  </span>
                  <h3 className="mt-2 text-lg font-black uppercase text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-neutral-500">
                    {item.text}
                  </p>
                  <Link
                    to={item.link || "/videos"}
                    className="mt-5 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white transition hover:text-amber-400"
                  >
                    Explore
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* PERFORMANCE */}
        <section id="performance" className="mt-16 scroll-mt-28">
          <div className="mb-6 border-l-4 border-amber-500 pl-4">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">
              Team Performance
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              A quick look at the squad's current performance numbers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["Games Played", "12", "This Season"],
              ["Wins", "9", "75% Win Rate"],
              ["Points Per Game", "82.6", "Team Average"],
              ["Ranking", "#02", "Current Position"],
            ].map(([label, value, note]) => (
              <div
                key={label}
                className="rounded-2xl border border-neutral-800 bg-[#141412] p-5 transition hover:-translate-y-1 hover:border-amber-500/40"
              >
                <p className="text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-black text-white">{value}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-amber-400">
                  {note}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ROSTER — preserves your existing roster data */}
        <section id="roster" className="mt-16 scroll-mt-28">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="border-l-4 border-amber-500 pl-5">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">
                The Squad
              </p>
              <h2 className="mt-1 text-3xl font-black uppercase text-white sm:text-4xl">
                J-Town <span className="text-amber-400">Roster</span>
              </h2>
              <p className="mt-2 max-w-xl text-xs leading-6 text-neutral-500">
                Meet the athletes representing J-Town Hoops. Built on discipline, teamwork, talent and the hunger to win.
              </p>
            </div>
            <Link
              to="/players"
              className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-amber-400 hover:text-white"
            >
              View All Players <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamRoster.map((player) => (
              <article
                key={player.id}
                className="group overflow-hidden rounded-2xl border border-neutral-800 bg-[#141412] shadow-xl transition duration-500 hover:-translate-y-2 hover:border-amber-500/50"
              >
                <div className="relative h-64 overflow-hidden bg-neutral-900">
                  <img
                    src={player.image}
                    alt={`${player.name} - J-Town Hoops`}
                    className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141412] via-transparent to-black/10" />
                  <span className="absolute left-4 top-4 rounded-full border border-emerald-400/30 bg-black/60 px-3 py-1.5 text-[7px] font-black uppercase tracking-widest text-emerald-400">
                    {player.status}
                  </span>
                  <span className="absolute right-4 top-4 flex h-12 min-w-12 items-center justify-center rounded-xl border border-white/10 bg-black/50 px-2 text-lg font-black text-white backdrop-blur">
                    {player.jersey}
                  </span>
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-400">
                      {player.position}
                    </p>
                    <h3 className="mt-1 text-2xl font-black uppercase text-white">
                      {player.name}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-5">
                  {[
                    ["PPG", player.ppg],
                    ["RPG", player.rpg],
                    ["APG", player.apg],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/5 bg-white/[0.03] py-3 text-center"
                    >
                      <p className="text-lg font-black text-white">{value}</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-500">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* AI NAVIGATION TUTORIAL — interactive guided Home tour + existing AI Assistant */}
        <section id="ai-tour" className="mt-16 scroll-mt-28 overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] via-[#141412] to-[#0d0d0c] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2">
                <Sparkles size={14} className="text-amber-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-400">New User Guided Tour</span>
              </div>
              <h2 className="mt-5 text-3xl font-black uppercase text-white sm:text-4xl">New Here? Let J-Town AI Show You Around.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400">
                Start a friendly guided tour of the important parts of this Home page. J-Town AI will move you from section to section, explain what each area is for and show you where to go next.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => { setTourStep(0); setShowAiGuide(true); setTimeout(() => document.getElementById("home")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50); }} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-4 text-[9px] font-black uppercase tracking-widest text-black transition hover:bg-orange-500">
                  <Bot size={17} /> Start J-Town Tour
                </button>
                <Link to="/ai-assistant" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-[9px] font-black uppercase tracking-widest text-white transition hover:border-amber-500 hover:text-amber-400">
                  <MessageCircle size={17} /> Open AI Assistant
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-black"><Bot size={21} /></div>
                <div>
                  <p className="text-sm font-black uppercase text-white">J-Town AI Guide</p>
                  <p className="text-[9px] uppercase tracking-widest text-emerald-400">Tour + Assistant Ready</p>
                </div>
              </div>
              <div className="mt-4 space-y-3 text-xs text-neutral-400">
                <p className="rounded-xl bg-white/5 p-3">🏀 “I can show you what is happening on the Home page.”</p>
                <p className="rounded-xl bg-white/5 p-3">🧭 “I will explain Highlights, Roster, Performance and Updates.”</p>
                <p className="rounded-xl bg-white/5 p-3">🤖 “For questions after the tour, open the full AI Assistant.”</p>
              </div>
            </div>
          </div>
        </section>

        {showAiGuide && tourStep >= 0 && (() => {
          const tourStops = [
            { id: "home", title: "Welcome to J-Town Hoops", text: "This is your starting point. Use the main buttons to jump to Highlights or the Roster, and use the navigation bar to reach the rest of the J-Town website." },
            { id: "highlights-first", title: "Featured Media", text: "This area brings important J-Town game, clinic and community media together. Select the media that interests you and continue exploring highlights below." },
            { id: "roster-first", title: "Meet the J-Town Roster", text: "Here you can quickly recognize J-Town players and team members by their photo, name and position. The full Players page gives you a deeper player experience." },
            { id: "quick-actions", title: "Join, Support or Ask AI", text: "These shortcuts help new visitors register with J-Town, support the mission or open the full J-Town AI Assistant whenever they need help." },
            { id: "highlights", title: "Explore More Highlights", text: "This second media hub gives you more J-Town content and direct links into videos, pictures, news and other website areas." },
            { id: "performance", title: "Team Performance", text: "Use this section for a quick snapshot of games played, wins, team scoring and current ranking." },
            { id: "latest-updates", title: "Latest J-Town Updates", text: "This is where visitors can catch important training, clinic, roster and community announcements before moving to the other pages." },
            { id: "ai-tour", title: "You Are Ready", text: "Use the Navbar to visit Teams, Players, Schedule, Games, Music, Videos, Pictures, About Us, Account and Notifications. If you get lost, return to the J-Town AI Assistant and ask where to go." },
          ];
          const stop = tourStops[tourStep] || tourStops[0];
          const goTo = (next) => {
            const safe = Math.max(0, Math.min(next, tourStops.length - 1));
            setTourStep(safe);
            setTimeout(() => document.getElementById(tourStops[safe].id)?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
          };
          return (
            <div className="fixed bottom-5 left-1/2 z-[9500] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-3xl border border-amber-500/40 bg-[#11110f]/95 shadow-2xl shadow-amber-500/10 backdrop-blur-xl">
              <div className="h-1 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600" />
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-black"><Bot size={21} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.28em] text-amber-400">J-Town AI Tour • {tourStep + 1}/{tourStops.length}</p>
                        <h3 className="mt-1 text-lg font-black uppercase text-white">{stop.title}</h3>
                      </div>
                      <button type="button" onClick={() => { setShowAiGuide(false); setTourStep(-1); }} className="rounded-full border border-white/10 p-2 text-neutral-400 hover:border-amber-500 hover:text-white" aria-label="Close tour"><X size={16} /></button>
                    </div>
                    <p className="mt-3 text-xs leading-6 text-neutral-400">{stop.text}</p>
                  </div>
                </div>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${((tourStep + 1) / tourStops.length) * 100}%` }} /></div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <button type="button" disabled={tourStep === 0} onClick={() => goTo(tourStep - 1)} className="rounded-xl border border-white/10 px-4 py-3 text-[8px] font-black uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-30 hover:border-amber-500">Previous</button>
                  <button type="button" onClick={() => { setShowAiGuide(false); setTourStep(-1); }} className="text-[8px] font-black uppercase tracking-widest text-neutral-500 hover:text-white">Skip Tour</button>
                  {tourStep < tourStops.length - 1 ? (
                    <button type="button" onClick={() => goTo(tourStep + 1)} className="rounded-xl bg-amber-500 px-5 py-3 text-[8px] font-black uppercase tracking-widest text-black hover:bg-orange-500">Next Stop →</button>
                  ) : (
                    <button type="button" onClick={() => { setShowAiGuide(false); setTourStep(-1); }} className="rounded-xl bg-amber-500 px-5 py-3 text-[8px] font-black uppercase tracking-widest text-black hover:bg-orange-500">Finish Tour</button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* LATEST UPDATES + COMMUNITY */}
        <section id="latest-updates" className="mt-16 grid gap-8 lg:grid-cols-12 scroll-mt-28">
          <div className="lg:col-span-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div className="border-l-4 border-amber-500 pl-4">
                <h2 className="text-3xl font-black uppercase text-white">Latest Updates</h2>
                <p className="mt-1 text-xs text-neutral-500">
                  News, training updates and important team announcements.
                </p>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => openEditor("update", "add")}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-amber-400 hover:bg-amber-500 hover:text-black"
                >
                  <Plus size={15} />
                  Add
                </button>
              )}
            </div>

            <div className="space-y-3">
              {updates.map((item, index) => (
                <article
                  key={item.id}
                  className="relative flex gap-4 rounded-2xl border border-neutral-800 bg-[#141412] p-5 transition hover:border-amber-500/30"
                >
                  {isAdmin && (
                    <AdminControls
                      onEdit={() => openEditor("update", "edit", item)}
                      onDelete={() => removeItem("update", item.id)}
                    />
                  )}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-sm font-black text-amber-400">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="pr-20">
                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-amber-400">
                      {item.category}
                    </p>
                    <h3 className="mt-1 text-sm font-black uppercase text-white">{item.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-neutral-500">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="h-full rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-[#141412] p-7">
              <Trophy size={30} className="text-amber-400" />
              <p className="mt-5 text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">
                J-Town Community
              </p>
              <h3 className="mt-2 text-2xl font-black uppercase text-white">
                Be Part Of The Movement
              </h3>
              <p className="mt-3 text-xs leading-6 text-neutral-400">
                {user
                  ? `Welcome back, ${user.name || user.fullName || user.teamName || "J-Town member"}. Explore everything happening around J-Town Hoops.`
                  : "Create an account, follow the team, support the clinic and become part of the J-Town Hoops community."}
              </p>
              <div className="mt-6 grid gap-3">
                <Link to="/register" className="rounded-xl bg-amber-500 px-5 py-4 text-center text-[9px] font-black uppercase tracking-widest text-black hover:bg-orange-500">
                  Register
                </Link>
                <Link to="/support" className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-center text-[9px] font-black uppercase tracking-widest text-white hover:border-amber-500 hover:text-amber-400">
                  Support Us
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </main>

      {/* ======================================================
          FOOTER — mybackground4.jpg as requested
          ====================================================== */}
      <footer
        className="relative mt-20 overflow-hidden border-t border-neutral-800 bg-cover bg-center"
        style={{ backgroundImage: `url(${footerBackground})` }}
      >
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-black/60" />

        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              {/* Rounded J-Town logo — same logo used by the Navbar */}
              <img
                src={jtownLogo}
                alt="J-Town Hoops Logo"
                className="mb-4 h-20 w-20 rounded-full border-2 border-amber-400/60 object-cover shadow-lg transition duration-500 hover:scale-105"
              />

              <h2 className="text-3xl font-black uppercase italic text-white">
                J-Town <span className="text-amber-400">Hoops</span>
              </h2>
              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">
                Education and Integrity Through Sports
              </p>
              <p className="mt-5 max-w-xl text-xs leading-6 text-neutral-300">
                Youth Basketball Clinic + Annual Tournaments. Training talent. Building character. Creating opportunities.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <a href="https://web.facebook.com/groups/1369591846844666/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white transition hover:border-amber-500 hover:bg-amber-500 hover:text-black"><FaFacebook /></a>
                <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white transition hover:border-amber-500 hover:bg-amber-500 hover:text-black"><FaXTwitter /></a>
                <a href="https://www.instagram.com/j_townhoops/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white transition hover:border-amber-500 hover:bg-amber-500 hover:text-black"><FaInstagram /></a>
                <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white transition hover:border-amber-500 hover:bg-amber-500 hover:text-black"><FaYoutube /></a>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white transition hover:border-amber-500 hover:bg-amber-500 hover:text-black"><MessageCircle /></a>
              </div>
            </div>

            <div>
              <h3 className="border-l-2 border-amber-500 pl-3 text-xs font-black uppercase tracking-[0.2em] text-white">
                Explore
              </h3>
              <div className="mt-5 grid gap-3 text-xs font-bold text-neutral-300">
                <Link to="/players" className="hover:text-amber-400">Players</Link>
                <Link to="/teams" className="hover:text-amber-400">Teams</Link>
                <Link to="/schedule" className="hover:text-amber-400">Schedule</Link>
                <Link to="/videos" className="hover:text-amber-400">Videos</Link>
                <Link to="/pictures" className="hover:text-amber-400">Pictures</Link>
                <Link to="/music" className="hover:text-amber-400">Music</Link>
              </div>
            </div>

            <div>
              <h3 className="border-l-2 border-amber-500 pl-3 text-xs font-black uppercase tracking-[0.2em] text-white">
                Get Involved
              </h3>
              <div className="mt-5 grid gap-3 text-xs font-bold text-neutral-300">
                <Link to="/register" className="hover:text-amber-400">Register</Link>
                <Link to="/support" className="hover:text-amber-400">Support Us</Link>
                <Link to="/aboutus" className="hover:text-amber-400">About Us</Link>
                <Link to="/ai-assistant" className="hover:text-amber-400">AI Assistant</Link>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">WhatsApp Admin</a>
              </div>
            </div>
          </div>

          <div className="my-9 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="flex flex-col gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 J-Town Hoops Arena Hub</p>
            <p>Built for the game. Driven by the culture.</p>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600" />
      </footer>

      {/* FLOATING WHATSAPP BADGE */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Message J-Town Hoops admin on WhatsApp"
        className="fixed bottom-5 left-5 z-[9000] flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-[9px] font-black uppercase tracking-wider text-white shadow-2xl transition hover:-translate-y-1 hover:bg-emerald-400"
      >
        <MessageCircle size={19} />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* RETURN TO TOP */}
      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Return to top"
          className="fixed bottom-5 right-5 z-[9000] flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/40 bg-[#141412]/90 text-amber-400 shadow-2xl backdrop-blur transition hover:-translate-y-1 hover:bg-amber-500 hover:text-black"
        >
          <ArrowUp size={19} />
        </button>
      )}
    </div>
  );
}
