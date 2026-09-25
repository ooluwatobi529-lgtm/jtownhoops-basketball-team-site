import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaVideo,
  FaPlay,
  FaPause,
  FaEdit,
  FaTrash,
  FaDownload,
  FaEllipsisV,
  FaUpload,
  FaSearch,
  FaTimes,
  FaExpand,
  FaFilm,
} from "react-icons/fa";

import myBackground from "../images/mybackground4.jpg";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

// ======================================================
// INDEXEDDB SETTINGS
// ======================================================

const DB_NAME = "JTownHoopsVideoDB";
const DB_VERSION = 1;
const STORE_NAME = "videos";

const openVideoDatabase = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const getAllVideosFromDB = async () => {
  const db = await openVideoDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

const saveVideoToDB = async (video) => {
  const db = await openVideoDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(video);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

const deleteVideoFromDB = async (id) => {
  const db = await openVideoDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error);
  });
};

const createVideoUrls = (video) => ({
  ...video,
  videoUrl: video.video ? URL.createObjectURL(video.video) : "",
  thumbnailUrl: video.thumbnail ? URL.createObjectURL(video.thumbnail) : "",
});

const revokeVideoUrls = (videos) => {
  videos.forEach((video) => {
    if (video.videoUrl) URL.revokeObjectURL(video.videoUrl);
    if (video.thumbnailUrl) URL.revokeObjectURL(video.thumbnailUrl);
  });
};

const emptyForm = {
  title: "",
  description: "",
  category: "Highlights",
  externalLink: "",
  video: null,
  thumbnail: null,
};

// ======================================================
// VIDEO HUB
// ======================================================

export default function Videos() {
  const { isAdmin } = useAuth();
  const { addSiteUpdate } = useNotifications();

  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [form, setForm] = useState(emptyForm);

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let loaded = [];

    const loadVideos = async () => {
      try {
        const stored = await getAllVideosFromDB();
        loaded = stored
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map(createVideoUrls);

        if (mounted) setVideos(loaded);
      } catch (error) {
        console.error("Could not load videos:", error);
      }
    };

    loadVideos();

    return () => {
      mounted = false;
      revokeVideoUrls(loaded);
    };
  }, []);

  useEffect(() => {
    const closeMenu = () => setOpenMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const categories = useMemo(() => {
    const values = [...new Set(videos.map((video) => video.category).filter(Boolean))];
    return ["All", ...values];
  }, [videos]);

  const filteredVideos = useMemo(() => {
    const term = search.trim().toLowerCase();

    return videos.filter((video) => {
      const matchesCategory = category === "All" || video.category === category;
      const matchesSearch =
        !term ||
        video.title?.toLowerCase().includes(term) ||
        video.description?.toLowerCase().includes(term) ||
        video.category?.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [videos, search, category]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowAdminForm(false);

    if (videoInputRef.current) videoInputRef.current.value = "";
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const reloadVideos = async () => {
    const stored = await getAllVideosFromDB();
    const nextVideos = stored
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(createVideoUrls);

    setVideos((current) => {
      revokeVideoUrls(current);
      return nextVideos;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      alert("Only J-Town Hoops administrators can modify videos.");
      return;
    }

    if (!form.title.trim()) {
      alert("Please enter a video title.");
      return;
    }

    const existing = editingId
      ? videos.find((video) => video.id === editingId)
      : null;

    if (!existing && !(form.video instanceof File) && !form.externalLink.trim()) {
      alert("Please select a video file or provide an external video link.");
      return;
    }

    setIsSaving(true);

    try {
      const videoData = {
        id:
          editingId ||
          `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category || "Highlights",
        externalLink: form.externalLink.trim(),
        video: form.video instanceof File ? form.video : existing?.video || null,
        thumbnail:
          form.thumbnail instanceof File
            ? form.thumbnail
            : existing?.thumbnail || null,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveVideoToDB(videoData);
      await reloadVideos();

      addSiteUpdate?.({
        title: editingId ? "Video Updated" : "New Video Added",
        desc: editingId
          ? `${videoData.title} was updated in the J-Town Hoops Video Hub.`
          : `${videoData.title} was added to the J-Town Hoops Video Hub.`,
        category: "videos",
        origin: "videos",
        type: "video",
        link: "/videos",
        showInNews: false,
        showInNotifications: true,
      });

      alert(editingId ? "Video updated successfully!" : "Video uploaded successfully!");
      resetForm();
    } catch (error) {
      console.error("Could not save video:", error);
      alert("The video could not be saved. Large files may exceed your browser storage limit.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (video) => {
    if (!isAdmin) return;

    setForm({
      title: video.title || "",
      description: video.description || "",
      category: video.category || "Highlights",
      externalLink: video.externalLink || "",
      video: null,
      thumbnail: null,
    });

    setEditingId(video.id);
    setShowAdminForm(true);
    setOpenMenu(null);

    setTimeout(() => {
      document.getElementById("video-admin-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleDelete = async (video) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      `Delete "${video.title}" from the J-Town Hoops Video Hub?`
    );

    if (!confirmed) return;

    try {
      await deleteVideoFromDB(video.id);

      if (selectedVideo?.id === video.id) setSelectedVideo(null);

      setVideos((current) => {
        const target = current.find((item) => item.id === video.id);
        if (target?.videoUrl) URL.revokeObjectURL(target.videoUrl);
        if (target?.thumbnailUrl) URL.revokeObjectURL(target.thumbnailUrl);
        return current.filter((item) => item.id !== video.id);
      });

      addSiteUpdate?.({
        title: "Video Removed",
        desc: `${video.title} was removed from the J-Town Hoops Video Hub.`,
        category: "videos",
        origin: "videos",
        type: "video",
        link: "/videos",
        showInNews: false,
        showInNotifications: true,
      });

      setOpenMenu(null);
    } catch (error) {
      console.error("Could not delete video:", error);
      alert("The video could not be deleted.");
    }
  };

  const handleDownload = (video) => {
    if (!video.videoUrl) {
      if (video.externalLink) window.open(video.externalLink, "_blank", "noopener,noreferrer");
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = video.videoUrl;
    anchor.download = video.video?.name || `${video.title || "jtown-video"}.mp4`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const openVideo = (video) => {
    if (video.videoUrl) {
      setSelectedVideo(video);
    } else if (video.externalLink) {
      window.open(video.externalLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className="min-h-screen text-gray-100 py-12 px-4 md:px-6 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.58),rgba(0,0,0,.64)), url(${myBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* HERO */}
      <section className="max-w-7xl mx-auto mb-10">
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-black/75 backdrop-blur-md p-6 md:p-9 shadow-2xl">
          <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-amber-400">
                <FaVideo /> J-Town Hoops Visuals
              </div>

              <h1 className="mt-4 text-4xl md:text-6xl font-extrabold text-amber-500 uppercase tracking-widest">
                Video Hub
              </h1>

              <p className="mt-3 max-w-2xl text-gray-300 leading-relaxed">
                Watch game highlights, interviews, training sessions, community moments,
                tournament action and exclusive J-Town Hoops videos.
              </p>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    if (showAdminForm && !editingId) {
                      resetForm();
                    } else {
                      setEditingId(null);
                      setForm(emptyForm);
                      setShowAdminForm(true);
                    }
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-black text-black hover:bg-amber-400 active:scale-[0.98] transition"
                >
                  <FaUpload />
                  Upload Video
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 min-w-[270px]">
              <div className="rounded-2xl border border-neutral-700 bg-neutral-950/80 p-4 text-center">
                <div className="text-3xl font-black text-amber-400">{videos.length}</div>
                <div className="mt-1 text-[11px] uppercase tracking-widest text-gray-500">
                  J-Town Videos
                </div>
              </div>

              <div
                className={`rounded-2xl border p-4 text-center ${
                  isAdmin
                    ? "border-amber-500/40 bg-amber-500/10"
                    : "border-neutral-700 bg-neutral-950/80"
                }`}
              >
                <div className="text-sm font-black uppercase tracking-wider text-white">
                  {isAdmin ? "Admin" : "Member"}
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-widest text-gray-500">
                  Access Mode
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH + FILTER */}
      <section className="max-w-7xl mx-auto mb-8">
        <div className="rounded-2xl border border-neutral-800 bg-black/70 backdrop-blur-md p-4 md:p-5">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-2xl">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search videos, highlights, interviews..."
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 py-3 pl-11 pr-4 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
                    category === item
                      ? "bg-amber-500 text-black"
                      : "border border-neutral-700 bg-neutral-950 text-neutral-300 hover:border-amber-500/50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EMPTY STATE */}
      {filteredVideos.length === 0 && (
        <section className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-dashed border-neutral-700 bg-black/65 p-12 text-center backdrop-blur">
            <FaFilm className="mx-auto text-5xl text-amber-500/70" />
            <h2 className="mt-5 text-2xl font-black text-white">
              {videos.length === 0 ? "The Video Hub is ready" : "No videos found"}
            </h2>
            <p className="mt-2 text-neutral-400">
              {videos.length === 0
                ? isAdmin
                  ? "Upload the first J-Town Hoops video using the admin button above."
                  : "J-Town Hoops videos will appear here when an administrator publishes them."
                : "Try another search or category."}
            </p>
          </div>
        </section>
      )}

      {/* VIDEO GRID */}
      {filteredVideos.length > 0 && (
        <section className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {filteredVideos.map((video) => (
              <article
                key={video.id}
                className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-black/75 shadow-xl backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:border-amber-500/50 hover:shadow-amber-500/10"
              >
                <button
                  type="button"
                  onClick={() => openVideo(video)}
                  className="relative block aspect-video w-full overflow-hidden bg-neutral-950 text-left"
                >
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={`${video.title} thumbnail`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : video.videoUrl ? (
                    <video
                      src={video.videoUrl}
                      className="h-full w-full object-cover opacity-80"
                      preload="metadata"
                      muted
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-900 to-black">
                      <FaVideo className="text-6xl text-amber-500/50" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/5" />

                  <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/70 text-amber-400 backdrop-blur transition group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black">
                    <FaPlay className="ml-1" />
                  </span>

                  <span className="absolute left-3 top-3 rounded-full border border-amber-500/30 bg-black/75 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-400">
                    {video.category || "Video"}
                  </span>
                </button>

                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-xl font-black text-white transition group-hover:text-amber-400">
                        {video.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-relaxed text-neutral-400">
                        {video.description || "J-Town Hoops video."}
                      </p>

                      <p className="mt-4 text-[11px] uppercase tracking-widest text-neutral-600">
                        {new Date(video.createdAt).toLocaleDateString("en-NG", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenu((current) =>
                            current === video.id ? null : video.id
                          );
                        }}
                        className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                        aria-label="Video options"
                      >
                        <FaEllipsisV />
                      </button>

                      {openMenu === video.id && (
                        <div
                          onClick={(event) => event.stopPropagation()}
                          className="absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-950 shadow-2xl"
                        >
                          <button
                            type="button"
                            onClick={() => handleDownload(video)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-neutral-200 hover:bg-neutral-800"
                          >
                            <FaDownload className="text-amber-400" />
                            {video.videoUrl ? "Download" : "Open Link"}
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleEdit(video)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-neutral-200 hover:bg-neutral-800"
                              >
                                <FaEdit className="text-blue-400" />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(video)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10"
                              >
                                <FaTrash />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openVideo(video)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-3 font-black text-amber-400 transition hover:bg-amber-500 hover:text-black"
                  >
                    <FaPlay />
                    Watch Video
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ADMIN PANEL */}
      {isAdmin && showAdminForm && (
        <section id="video-admin-panel" className="max-w-4xl mx-auto mt-14 scroll-mt-24">
          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-black/85 p-6 md:p-8 shadow-2xl backdrop-blur-md"
          >
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-amber-500/10 blur-3xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">
                  Admin Studio
                </p>
                <h2 className="mt-2 text-3xl font-black text-white">
                  {editingId ? "Edit Video" : "Upload New Video"}
                </h2>
                <p className="mt-2 text-sm text-neutral-400">
                  Publish highlights, interviews, training clips and tournament moments.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-neutral-400 hover:text-white"
                aria-label="Close admin form"
              >
                <FaTimes />
              </button>
            </div>

            <div className="relative mt-7 grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="block">
                <span className="text-sm font-bold text-neutral-300">Video title</span>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-amber-500"
                  placeholder="J-Town Hoops Championship Highlights"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-neutral-300">Category</span>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, category: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-amber-500"
                >
                  <option>Highlights</option>
                  <option>Games</option>
                  <option>Interviews</option>
                  <option>Training</option>
                  <option>Community</option>
                  <option>Behind The Scenes</option>
                  <option>Announcements</option>
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-neutral-300">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-amber-500"
                  placeholder="Tell viewers what this video is about..."
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-neutral-300">
                  Video file {editingId && "(optional when editing)"}
                </span>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      video: event.target.files?.[0] || null,
                    }))
                  }
                  className="mt-2 block w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:font-black file:text-black"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-neutral-300">
                  Thumbnail image {editingId && "(optional)"}
                </span>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      thumbnail: event.target.files?.[0] || null,
                    }))
                  }
                  className="mt-2 block w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-700 file:px-4 file:py-2 file:font-bold file:text-white"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-neutral-300">
                  External video link (optional)
                </span>
                <input
                  type="url"
                  value={form.externalLink}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      externalLink: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-amber-500"
                  placeholder="https://..."
                />
              </label>
            </div>

            <div className="relative mt-7 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-xl bg-amber-500 px-5 py-4 font-black text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : editingId
                  ? "Save Video Changes"
                  : "Publish Video"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-neutral-700 bg-neutral-900 px-6 py-4 font-bold text-neutral-300 hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* PLAYER MODAL */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 md:p-6 backdrop-blur-sm"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="w-full max-w-6xl overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 md:px-5">
              <div className="min-w-0">
                <h2 className="truncate font-black text-white">{selectedVideo.title}</h2>
                <p className="text-xs uppercase tracking-wider text-amber-400">
                  {selectedVideo.category}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="rounded-lg p-3 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="bg-black">
              <video
                key={selectedVideo.videoUrl}
                src={selectedVideo.videoUrl}
                controls
                autoPlay
                className="max-h-[75vh] w-full"
              />
            </div>

            {selectedVideo.description && (
              <p className="p-5 text-sm leading-relaxed text-neutral-400">
                {selectedVideo.description}
              </p>
            )}
          </div>
        </div>
      )}

      <footer className="max-w-7xl mx-auto mt-16 border-t border-neutral-800 pt-7 text-center text-xs uppercase tracking-[0.2em] text-neutral-600">
        J-Town Hoops Video Hub • Jos, Nigeria
      </footer>
    </div>
  );
}
