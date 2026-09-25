import React, { useEffect, useMemo, useState } from "react";
import {
  Camera,
  Image as ImageIcon,
  Plus,
  Trash2,
  Pencil,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
  X,
  UploadCloud,
  FileImage,
  MoreVertical,
  Search,
  Images,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

// LOCAL J-TOWN HOOPS IMAGES — src/images
import about1 from "../images/about1.jpg";
import about2 from "../images/about2.jpg";
import about3 from "../images/about3.jpg";
import aipart from "../images/aipart.jpg";
import aipart2 from "../images/aipart2.jpg";
import bigfemo from "../images/bigfemo.jpg";
import gallery1 from "../images/gallery1.jpg";
import gallery2 from "../images/gallery2.jpg";
import gallery4 from "../images/gallery4.jpg";
import gallery5 from "../images/gallery5.jpg";
import image8e72 from "../images/image_8e72b46a.png";
import imageB149 from "../images/image_b149a1ff.png";
import imageBc7 from "../images/image_bc7dadf0.png";


const STORAGE_KEY = "jtown_hoops_picture_gallery_v3";

const starterGallery = [
  { id: 1, title: "J-Town Game Day", description: "Action, energy and memorable basketball moments from J-Town Hoops.", url: gallery1, category: "In-Game Action", date: "Aug 08, 2026", likes: 42 },
  { id: 2, title: "J-Town Team Moment", description: "Players coming together and building chemistry on and off the court.", url: gallery2, category: "Team Chemistry", date: "Aug 10, 2026", likes: 31 },
  { id: 3, title: "Training and Development", description: "A focused J-Town Hoops training moment built around growth and hard work.", url: gallery4, category: "Practice", date: "Aug 11, 2026", likes: 19 },
  { id: 4, title: "J-Town Basketball Family", description: "Celebrating the players, coaches, supporters and community behind J-Town Hoops.", url: gallery5, category: "Fan Zone", date: "Aug 12, 2026", likes: 27 },
  { id: 5, title: "Player Spotlight", description: "A featured J-Town Hoops player moment from our local picture collection.", url: bigfemo, category: "In-Game Action", date: "Aug 13, 2026", likes: 35 },
  { id: 6, title: "J-Town Spotlight", description: "Another special moment from the J-Town Hoops picture archive.", url: imageBc7, category: "Fan Zone", date: "Aug 14, 2026", likes: 22 },
];

const backgroundLoopImages = [
  about1, about2, about3, aipart, aipart2, bigfemo,
  gallery1, gallery2, gallery4, gallery5,
  image8e72, imageB149, imageBc7,
];

const carouselHighlights = [
  { id: 101, url: about1, title: "J-Town Hoops", description: "Celebrating basketball, teamwork and the J-Town Hoops community." },
  { id: 102, url: about2, title: "Building Through Basketball", description: "Developing talent, confidence, teamwork and character through the game." },
  { id: 103, url: about3, title: "Our Basketball Family", description: "Players, coaches, supporters and fans growing together through J-Town Hoops." },
  { id: 104, url: bigfemo, title: "Player Spotlight", description: "Highlighting talent and memorable moments from the J-Town Hoops family." },
  { id: 105, url: gallery1, title: "Game Day", description: "Action and excitement captured from the J-Town Hoops court." },
  { id: 106, url: gallery2, title: "Basketball Highlights", description: "Capturing unforgettable moments from games, training and team activities." },
  { id: 107, url: gallery4, title: "Training Moments", description: "Hard work, development and another memorable J-Town Hoops training session." },
  { id: 108, url: gallery5, title: "Hoops Gallery", description: "Celebrating the people and moments that make J-Town Hoops special." },
  { id: 109, url: image8e72, title: "J-Town Spotlight", description: "A featured image from the J-Town Hoops local picture collection." },
  { id: 110, url: imageB149, title: "Team Spotlight", description: "Another featured moment from our growing basketball community." },
  { id: 111, url: imageBc7, title: "J-Town Hoops Highlights", description: "Basketball, community and unforgettable J-Town Hoops moments." },
];

const categories = [
  "All",
  "In-Game Action",
  "Practice",
  "Team Chemistry",
  "Fan Zone",
];

function safeLoadGallery() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return Array.isArray(saved) && saved.length ? saved : starterGallery;
  } catch {
    return starterGallery;
  }
}

export default function Pictures() {
  const { isAdmin } = useAuth();
  const { addSiteUpdate } = useNotifications();

  const [galleryItems, setGalleryItems] = useState(safeLoadGallery);
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoDescription, setPhotoDescription] = useState("");
  const [photoCategory, setPhotoCategory] = useState("In-Game Action");
  const [photoUrl, setPhotoUrl] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(galleryItems));
  }, [galleryItems]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselHighlights.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const closeMenu = () => setActiveMenuId(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const filteredGallery = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return galleryItems.filter((item) => {
      const categoryMatch =
        activeCategory === "All" || item.category === activeCategory;

      const textMatch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return categoryMatch && textMatch;
    });
  }, [galleryItems, searchQuery, activeCategory]);

  const handlePrevSlide = () => {
    setActiveSlide(
      (prev) =>
        (prev - 1 + carouselHighlights.length) % carouselHighlights.length
    );
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % carouselHighlights.length);
  };

  const resetEditor = () => {
    setEditingId(null);
    setPhotoTitle("");
    setPhotoDescription("");
    setPhotoCategory("In-Game Action");
    setPhotoUrl("");
    setSelectedFileName("");
  };

  const openAddEditor = () => {
    if (!isAdmin) return;
    resetEditor();
    setShowEditor(true);
  };

  const openEditEditor = (item) => {
    if (!isAdmin) return;

    setEditingId(item.id);
    setPhotoTitle(item.title);
    setPhotoDescription(item.description);
    setPhotoCategory(item.category);
    setPhotoUrl(item.url);
    setSelectedFileName("");
    setShowEditor(true);
    setActiveMenuId(null);
  };

  const handleLocalFileSelection = (e) => {
    if (!isAdmin) return;

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Please choose an image smaller than 5 MB for now.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPhotoUrl(reader.result);
      setSelectedFileName(file.name);
    };

    reader.readAsDataURL(file);
  };

  const handleSavePhoto = (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!photoTitle.trim() || !photoDescription.trim()) {
      alert("Please enter a title and description.");
      return;
    }

    const existing = galleryItems.find((item) => item.id === editingId);

    const finalUrl =
      photoUrl.trim() ||
      existing?.url ||
      `https://placehold.co/1000x700/171717/f97316?text=${encodeURIComponent(
        photoTitle.trim()
      )}`;

    const savedItem = {
      id: editingId || Date.now(),
      title: photoTitle.trim(),
      description: photoDescription.trim(),
      category: photoCategory,
      url: finalUrl,
      date:
        existing?.date ||
        new Date().toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      likes: existing?.likes || 0,
    };

    if (editingId) {
      setGalleryItems((current) =>
        current.map((item) => (item.id === editingId ? savedItem : item))
      );

      addSiteUpdate?.({
        title: "Picture Updated",
        desc: `${savedItem.title} was updated in the J-Town Hoops gallery.`,
        category: "pictures",
        origin: "pictures",
        type: "pictures",
        link: "/pictures",
        showInNews: true,
        showInNotifications: true,
      });
    } else {
      setGalleryItems((current) => [savedItem, ...current]);

      addSiteUpdate?.({
        title: "New Picture Added",
        desc: `${savedItem.title} was added to the J-Town Hoops gallery.`,
        category: "pictures",
        origin: "pictures",
        type: "pictures",
        link: "/pictures",
        showInNews: true,
        showInNotifications: true,
      });
    }

    resetEditor();
    setShowEditor(false);
  };

  const handleDeletePhoto = (item) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      `Delete "${item.title}" from the J-Town Hoops gallery?`
    );

    if (!confirmed) return;

    setGalleryItems((current) =>
      current.filter((photo) => photo.id !== item.id)
    );

    if (activeLightboxImage?.id === item.id) {
      setActiveLightboxImage(null);
    }

    setActiveMenuId(null);

    addSiteUpdate?.({
      title: "Picture Removed",
      desc: `${item.title} was removed from the J-Town Hoops gallery.`,
      category: "pictures",
      origin: "pictures",
      type: "pictures",
      link: "/pictures",
      showInNews: false,
      showInNotifications: true,
    });
  };

  const handleLikePhoto = (id, e) => {
    e?.stopPropagation();

    setGalleryItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, likes: item.likes + 1 } : item
      )
    );
  };

  return (
    <div
      className="
        min-h-[calc(100vh-5rem)]
        bg-[url('/src/images/mybackground4.jpg')]
        bg-cover
        bg-center
        bg-fixed
        p-4
        text-white
        sm:p-6
        lg:p-8
      "
    >
      <style>{`
        @keyframes pictureBounce {
          0%, 100% {
            transform: translateY(-9px);
            animation-timing-function: cubic-bezier(.8,0,1,1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0,0,.2,1);
          }
        }

        @keyframes pictureMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .picture-bounce {
          animation: pictureBounce 2.4s infinite;
        }

        .picture-marquee {
          animation: pictureMarquee 32s linear infinite;
        }

        .picture-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="mx-auto max-w-7xl space-y-8">
        {/* =====================================================
            1. CONTINUOUS CAROUSEL — FIRST THING ON THE PAGE
        ====================================================== */}
        <section className="relative h-44 overflow-hidden rounded-3xl border border-orange-500/30 bg-black shadow-[0_20px_60px_rgba(0,0,0,.45)] sm:h-52">
          <div className="picture-marquee absolute inset-y-0 left-0 flex w-max">
            {[...backgroundLoopImages, ...backgroundLoopImages].map(
              (image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="h-full w-[320px] shrink-0 sm:w-[430px]"
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover opacity-60"
                  />
                </div>
              )
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/25" />

          <div className="absolute inset-0 z-10 flex items-center p-6 sm:p-8">
            <div className="max-w-2xl">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-[.25em] text-orange-400">
                  J-Town Media
                </span>

                {isAdmin && (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-emerald-400">
                    <ShieldCheck size={11} />
                    Admin
                  </span>
                )}
              </div>

              <h1 className="flex items-center gap-3 text-3xl font-black uppercase tracking-tight sm:text-4xl">
                <Camera className="text-orange-500" />
                Picture Hub
              </h1>

              <p className="mt-2 max-w-xl text-xs leading-relaxed text-neutral-300 sm:text-sm">
                Game-day action, team memories, training moments and the
                people behind J-Town Hoops.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            2. BOUNCING FEATURED CAROUSEL
        ====================================================== */}
        <section className="picture-bounce group relative h-72 overflow-hidden rounded-3xl border border-orange-500/30 bg-black shadow-[0_20px_60px_rgba(0,0,0,.5)] sm:h-[25rem]">
          {carouselHighlights.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === activeSlide
                  ? "z-10 opacity-100"
                  : "z-0 opacity-0"
              }`}
            >
              <img
                src={slide.url}
                alt={slide.title}
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 z-20 max-w-2xl sm:bottom-8 sm:left-8">
                <span className="rounded-md bg-orange-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-black">
                  Featured Moment
                </span>

                <h2 className="mt-3 text-2xl font-black uppercase tracking-tight sm:text-3xl">
                  {slide.title}
                </h2>

                <p className="mt-2 text-xs leading-relaxed text-neutral-200 sm:text-sm">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handlePrevSlide}
            className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2.5 text-white opacity-0 backdrop-blur-md transition hover:bg-orange-500 hover:text-black group-hover:opacity-100"
          >
            <ChevronLeft size={19} />
          </button>

          <button
            type="button"
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2.5 text-white opacity-0 backdrop-blur-md transition hover:bg-orange-500 hover:text-black group-hover:opacity-100"
          >
            <ChevronRight size={19} />
          </button>

          <div className="absolute bottom-5 right-6 z-30 flex items-center gap-1.5">
            {carouselHighlights.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  activeSlide === index
                    ? "w-7 bg-orange-500"
                    : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </section>

        {/* =====================================================
            3. GALLERY — IMMEDIATELY AFTER CAROUSELS
        ====================================================== */}
        <section className="rounded-3xl border border-neutral-800 bg-black/75 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-orange-400">
                <Images size={18} />
                <span className="text-[10px] font-black uppercase tracking-[.25em]">
                  J-Town Gallery
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight sm:text-3xl">
                Picture Collection
              </h2>

              <p className="mt-1 text-xs text-neutral-400">
                {galleryItems.length} memories in the J-Town Hoops collection.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
              <div className="relative min-w-0 lg:w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pictures..."
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-orange-500"
                />
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={openAddEditor}
                  className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black transition hover:bg-orange-400 hover:scale-[1.02]"
                >
                  <Plus size={17} />
                  Add Picture
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-wider transition ${
                  activeCategory === category
                    ? "border-orange-500 bg-orange-500 text-black"
                    : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-orange-500/50 hover:text-orange-400"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredGallery.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-neutral-700 bg-neutral-950/70 py-16 text-center">
              <ImageIcon className="mx-auto text-neutral-600" size={36} />
              <h3 className="mt-4 font-black">No pictures found</h3>
              <p className="mt-1 text-xs text-neutral-500">
                Try another search or gallery category.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGallery.map((item) => (
                <article
                  key={item.id}
                  onClick={() => setActiveLightboxImage(item)}
                  className="group cursor-pointer overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-[0_20px_45px_rgba(249,115,22,.12)]"
                >
                  <div className="relative h-56 overflow-hidden bg-neutral-900">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15" />

                    <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/65 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-orange-400 backdrop-blur-md">
                      {item.category}
                    </span>

                    <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/60 p-2 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100">
                      <Maximize2 size={15} />
                    </div>

                    {isAdmin && (
                      <div
                        className="absolute right-3 top-3 z-30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId((current) =>
                              current === item.id ? null : item.id
                            );
                          }}
                          className="rounded-full border border-white/10 bg-black/70 p-2 text-white backdrop-blur-md transition hover:bg-orange-500 hover:text-black"
                          title="Picture options"
                        >
                          <MoreVertical size={17} />
                        </button>

                        {activeMenuId === item.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-11 z-40 w-36 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-950 p-1 shadow-2xl"
                          >
                            <button
                              type="button"
                              onClick={() => openEditEditor(item)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-neutral-200 hover:bg-neutral-800 hover:text-orange-400"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(item)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="truncate text-base font-black uppercase tracking-tight">
                      {item.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-[40px] text-xs leading-relaxed text-neutral-400">
                      {item.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4">
                      <button
                        type="button"
                        onClick={(e) => handleLikePhoto(item.id, e)}
                        className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 transition hover:text-red-400"
                      >
                        <Heart
                          size={15}
                          className="text-red-500/70"
                        />
                        {item.likes}
                      </button>

                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500">
                        <Calendar size={13} />
                        {item.date}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            4. ADMIN ADD / EDIT PICTURE AREA
            NORMAL USERS DO NOT SEE THIS
        ====================================================== */}
        {isAdmin && (
          <section className="overflow-hidden rounded-3xl border border-orange-500/25 bg-black/80 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() => {
                if (showEditor) {
                  setShowEditor(false);
                  resetEditor();
                } else {
                  openAddEditor();
                }
              }}
              className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-400">
                  <UploadCloud size={22} />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.25em] text-orange-400">
                    Admin Picture Manager
                  </p>
                  <h2 className="mt-1 text-lg font-black uppercase">
                    {editingId ? "Edit Picture" : "Add Pictures"}
                  </h2>
                  <p className="mt-1 text-xs text-neutral-500">
                    Add a new J-Town memory or edit an existing gallery item.
                  </p>
                </div>
              </div>

              <Plus
                className={`text-orange-400 transition ${
                  showEditor ? "rotate-45" : ""
                }`}
              />
            </button>

            {showEditor && (
              <form
                onSubmit={handleSavePhoto}
                className="border-t border-neutral-800 p-5 sm:p-6"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <label>
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Picture Title
                    </span>
                    <input
                      required
                      value={photoTitle}
                      onChange={(e) => setPhotoTitle(e.target.value)}
                      placeholder="e.g. Championship Celebration"
                      className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                    />
                  </label>

                  <label>
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Category
                    </span>
                    <select
                      value={photoCategory}
                      onChange={(e) => setPhotoCategory(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm outline-none focus:border-orange-500"
                    >
                      {categories
                        .filter((category) => category !== "All")
                        .map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                    </select>
                  </label>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Upload Picture
                    </span>

                    <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-400 transition hover:border-orange-500/60 hover:text-orange-400">
                      <FileImage size={18} />
                      <span className="truncate">
                        {selectedFileName || "Choose image from computer..."}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLocalFileSelection}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <label>
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Or Image URL
                    </span>
                    <input
                      type="url"
                      value={
                        photoUrl.startsWith("data:") ? "" : photoUrl
                      }
                      onChange={(e) => {
                        setPhotoUrl(e.target.value);
                        setSelectedFileName("");
                      }}
                      placeholder="https://..."
                      className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Description
                    </span>
                    <textarea
                      required
                      rows={3}
                      value={photoDescription}
                      onChange={(e) => setPhotoDescription(e.target.value)}
                      placeholder="Describe this J-Town Hoops moment..."
                      className="mt-2 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                    />
                  </label>
                </div>

                {photoUrl && (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
                    <img
                      src={photoUrl}
                      alt="Picture preview"
                      className="h-52 w-full object-cover sm:h-64"
                    />
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditor(false);
                      resetEditor();
                    }}
                    className="rounded-xl border border-neutral-700 bg-neutral-900 px-5 py-3 text-xs font-black uppercase tracking-wider text-neutral-300 transition hover:bg-neutral-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-black transition hover:bg-orange-400 hover:scale-[1.02]"
                  >
                    <Sparkles size={16} />
                    {editingId ? "Save Changes" : "Add Picture"}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
      </div>

      {/* =====================================================
          LIGHTBOX
      ====================================================== */}
      {activeLightboxImage && (
        <div
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setActiveLightboxImage(null)}
              className="absolute right-4 top-4 z-30 rounded-full border border-white/10 bg-black/70 p-2.5 text-white backdrop-blur-md transition hover:bg-red-500"
            >
              <X size={20} />
            </button>

            <div className="flex min-h-[340px] items-center justify-center bg-black sm:min-h-[520px]">
              <img
                src={activeLightboxImage.url}
                alt={activeLightboxImage.title}
                className="max-h-[70vh] w-full object-contain"
              />
            </div>

            <div className="p-6 sm:p-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-orange-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-orange-400">
                  {activeLightboxImage.category}
                </span>

                <span className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500">
                  <Calendar size={13} />
                  {activeLightboxImage.date}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-black uppercase tracking-tight">
                {activeLightboxImage.title}
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-400">
                {activeLightboxImage.description}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-neutral-800 pt-5">
                <button
                  type="button"
                  onClick={(e) =>
                    handleLikePhoto(activeLightboxImage.id, e)
                  }
                  className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm font-bold text-neutral-300 transition hover:border-red-500/40 hover:text-red-400"
                >
                  <Heart size={17} className="text-red-500" />
                  {galleryItems.find(
                    (item) => item.id === activeLightboxImage.id
                  )?.likes ?? activeLightboxImage.likes}
                </button>

                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveLightboxImage(null);
                        openEditEditor(activeLightboxImage);
                      }}
                      className="flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-xs font-black text-orange-400 transition hover:bg-orange-500 hover:text-black"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeletePhoto(activeLightboxImage)
                      }
                      className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-black text-red-400 transition hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
