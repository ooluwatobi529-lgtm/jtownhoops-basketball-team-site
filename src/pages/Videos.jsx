import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  FaVideo,
  FaPlay,
  FaEdit,
  FaTrash,
  FaDownload,
  FaEllipsisV,
  FaUpload,
  FaSearch,
  FaTimes,
  FaFilm,
  FaCloudUploadAlt,
  FaLink,
  FaImage,
  FaSpinner,
} from "react-icons/fa";

import myBackground from "../images/mybackground4.jpg";

import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

import {
  videoAPI,
  mediaAPI,
} from "../services/api";


// ======================================================
// EMPTY FORM
// ======================================================

const emptyForm = {
  title: "",
  description: "",
  category: "Highlights",
  externalLink: "",
  video: null,
  thumbnail: null,
};


// ======================================================
// NORMALIZE VIDEO
// ======================================================
//
// MongoDB normally gives us _id.
// The old frontend used id.
//
// Supporting both keeps the UI simple.
// ======================================================

const normalizeVideo = (video = {}) => ({
  ...video,

  id:
    video.id ||
    video._id ||
    "",

  title:
    video.title || "",

  description:
    video.description || "",

  category:
    video.category || "Highlights",

  videoUrl:
    video.videoUrl ||
    video.url ||
    video.video?.url ||
    "",

  videoPublicId:
    video.videoPublicId ||
    video.publicId ||
    video.video?.publicId ||
    "",

  thumbnailUrl:
    video.thumbnailUrl ||
    video.thumbnail ||
    video.thumbnail?.url ||
    "",

  thumbnailPublicId:
    video.thumbnailPublicId ||
    video.thumbnail?.publicId ||
    "",

  externalLink:
    video.externalLink ||
    "",

  createdAt:
    video.createdAt ||
    new Date().toISOString(),
});


// ======================================================
// EXTRACT VIDEO LIST FROM API RESPONSE
// ======================================================

const extractVideos = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.videos)) {
    return response.videos;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.videos)) {
    return response.data.videos;
  }

  return [];
};


// ======================================================
// VIDEO HUB
// ======================================================

export default function Videos() {
  const { isAdmin } = useAuth();

  const { addSiteUpdate } =
    useNotifications();

  const [videos, setVideos] =
    useState([]);

  const [
    selectedVideo,
    setSelectedVideo,
  ] = useState(null);

  const [
    openMenu,
    setOpenMenu,
  ] = useState(null);

  const [
    showAdminForm,
    setShowAdminForm,
  ] = useState(false);

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    loadingMessage,
    setLoadingMessage,
  ] = useState(
    "Loading J-Town Hoops videos..."
  );

  const [
    pageError,
    setPageError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("All");

  const [
    form,
    setForm,
  ] = useState(emptyForm);

  const [
    videoPreview,
    setVideoPreview,
  ] = useState("");

  const [
    thumbnailPreview,
    setThumbnailPreview,
  ] = useState("");

  const videoInputRef =
    useRef(null);

  const thumbnailInputRef =
    useRef(null);


  // ====================================================
  // LOAD VIDEOS FROM MONGODB
  // ====================================================

  const loadVideos =
    async () => {
      try {
        setIsLoading(true);

        setPageError("");

        const response =
          await videoAPI.getAll();

        const loaded =
          extractVideos(response)
            .map(normalizeVideo)
            .sort(
              (a, b) =>
                new Date(
                  b.createdAt || 0
                ) -
                new Date(
                  a.createdAt || 0
                )
            );

        setVideos(loaded);

      } catch (error) {
        console.error(
          "Could not load videos:",
          error
        );

        setPageError(
          error?.message ||
            "The Video Hub could not be loaded."
        );

      } finally {
        setIsLoading(false);
      }
    };


  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadVideos();
  }, []);


  // ====================================================
  // CLOSE 3-DOT MENU
  // ====================================================

  useEffect(() => {
    const closeMenu = () =>
      setOpenMenu(null);

    window.addEventListener(
      "click",
      closeMenu
    );

    return () =>
      window.removeEventListener(
        "click",
        closeMenu
      );
  }, []);


  // ====================================================
  // CLEAN LOCAL PREVIEW URLS
  // ====================================================

  useEffect(() => {
    return () => {
      if (
        videoPreview?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          videoPreview
        );
      }

      if (
        thumbnailPreview?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          thumbnailPreview
        );
      }
    };
  }, [
    videoPreview,
    thumbnailPreview,
  ]);


  // ====================================================
  // CATEGORIES
  // ====================================================

  const categories =
    useMemo(() => {
      const values = [
        ...new Set(
          videos
            .map(
              (video) =>
                video.category
            )
            .filter(Boolean)
        ),
      ];

      return [
        "All",
        ...values,
      ];
    }, [videos]);


  // ====================================================
  // SEARCH + FILTER
  // ====================================================

  const filteredVideos =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return videos.filter(
        (video) => {
          const matchesCategory =
            category === "All" ||
            video.category ===
              category;

          const matchesSearch =
            !term ||
            video.title
              ?.toLowerCase()
              .includes(term) ||
            video.description
              ?.toLowerCase()
              .includes(term) ||
            video.category
              ?.toLowerCase()
              .includes(term);

          return (
            matchesCategory &&
            matchesSearch
          );
        }
      );
    }, [
      videos,
      search,
      category,
    ]);


  // ====================================================
  // RESET FORM
  // ====================================================

  const resetForm = () => {
    setForm({
      ...emptyForm,
    });

    setEditingId(null);

    setShowAdminForm(false);

    if (
      videoPreview?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        videoPreview
      );
    }

    if (
      thumbnailPreview?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        thumbnailPreview
      );
    }

    setVideoPreview("");
    setThumbnailPreview("");

    if (
      videoInputRef.current
    ) {
      videoInputRef.current.value =
        "";
    }

    if (
      thumbnailInputRef.current
    ) {
      thumbnailInputRef.current.value =
        "";
    }
  };


  // ====================================================
  // OPEN ADD FORM
  // ====================================================

  const openAddForm = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
    });

    setVideoPreview("");
    setThumbnailPreview("");

    setShowAdminForm(true);

    setTimeout(() => {
      document
        .getElementById(
          "video-admin-panel"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };


  // ====================================================
  // SELECT VIDEO FILE
  // ====================================================

  const handleVideoFileChange = (
    event
  ) => {
    const file =
      event.target.files?.[0] ||
      null;

    if (!file) {
      setForm(
        (current) => ({
          ...current,
          video: null,
        })
      );

      return;
    }

    const maximumSize =
      100 * 1024 * 1024;

    if (
      file.size >
      maximumSize
    ) {
      alert(
        "The video is too large. Please choose a video smaller than 100 MB."
      );

      event.target.value = "";

      return;
    }

    if (
      videoPreview?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        videoPreview
      );
    }

    setForm(
      (current) => ({
        ...current,
        video: file,
      })
    );

    setVideoPreview(
      URL.createObjectURL(file)
    );
  };


  // ====================================================
  // SELECT THUMBNAIL
  // ====================================================

  const handleThumbnailChange = (
    event
  ) => {
    const file =
      event.target.files?.[0] ||
      null;

    if (!file) {
      setForm(
        (current) => ({
          ...current,
          thumbnail: null,
        })
      );

      return;
    }

    const maximumSize =
      5 * 1024 * 1024;

    if (
      file.size >
      maximumSize
    ) {
      alert(
        "The thumbnail is too large. Please choose an image smaller than 5 MB."
      );

      event.target.value = "";

      return;
    }

    if (
      thumbnailPreview?.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        thumbnailPreview
      );
    }

    setForm(
      (current) => ({
        ...current,
        thumbnail: file,
      })
    );

    setThumbnailPreview(
      URL.createObjectURL(file)
    );
  };


  // ====================================================
  // SAVE VIDEO
  // ====================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!isAdmin) {
        alert(
          "Only J-Town Hoops administrators can modify videos."
        );

        return;
      }

      if (
        !form.title.trim()
      ) {
        alert(
          "Please enter a video title."
        );

        return;
      }

      const existing =
        editingId
          ? videos.find(
              (video) =>
                video.id ===
                editingId
            )
          : null;

      const hasExistingMedia =
        Boolean(
          existing?.videoUrl ||
            existing?.externalLink
        );

      if (
        !hasExistingMedia &&
        !form.video &&
        !form.externalLink.trim()
      ) {
        alert(
          "Please select a video file or provide an external video link."
        );

        return;
      }

      setIsSaving(true);

      try {
        let videoUrl =
          existing?.videoUrl ||
          "";

        let videoPublicId =
          existing?.videoPublicId ||
          "";

        let thumbnailUrl =
          existing?.thumbnailUrl ||
          "";

        let thumbnailPublicId =
          existing?.thumbnailPublicId ||
          "";


        // ================================================
        // 1. UPLOAD VIDEO TO CLOUDINARY
        // ================================================

        if (
          form.video instanceof
          File
        ) {
          setLoadingMessage(
            "Uploading video to Cloudinary..."
          );

          const uploadResponse =
            await mediaAPI.uploadVideo({
              file:
                form.video,

              folder:
                "videos",
            });

          videoUrl =
            uploadResponse?.media
              ?.url || "";

          videoPublicId =
            uploadResponse?.media
              ?.publicId || "";

          if (!videoUrl) {
            throw new Error(
              "Cloudinary uploaded the video but did not return a video URL."
            );
          }
        }


        // ================================================
        // 2. UPLOAD THUMBNAIL TO CLOUDINARY
        // ================================================

        if (
          form.thumbnail instanceof
          File
        ) {
          setLoadingMessage(
            "Uploading video thumbnail..."
          );

          const thumbnailResponse =
            await mediaAPI.uploadImage({
              file:
                form.thumbnail,

              folder:
                "videos",
            });

          thumbnailUrl =
            thumbnailResponse?.media
              ?.url || "";

          thumbnailPublicId =
            thumbnailResponse?.media
              ?.publicId || "";

          if (!thumbnailUrl) {
            throw new Error(
              "The thumbnail upload did not return an image URL."
            );
          }
        }


        // ================================================
        // 3. CREATE MONGODB PAYLOAD
        // ================================================

        const videoData = {
          title:
            form.title.trim(),

          description:
            form.description.trim(),

          category:
            form.category ||
            "Highlights",

          videoUrl,

          videoPublicId,

          thumbnailUrl,

          thumbnailPublicId,

          externalLink:
            form.externalLink.trim(),
        };


        // ================================================
        // 4. SAVE TO MONGODB
        // ================================================

        if (editingId) {
          setLoadingMessage(
            "Saving video changes..."
          );

          await videoAPI.update(
            editingId,
            videoData
          );

        } else {
          setLoadingMessage(
            "Publishing video..."
          );

          await videoAPI.create(
            videoData
          );
        }


        // ================================================
        // 5. RELOAD FROM DATABASE
        // ================================================

        await loadVideos();


        // ================================================
        // 6. NOTIFICATION
        // ================================================

        addSiteUpdate?.({
          title:
            editingId
              ? "Video Updated"
              : "New Video Added",

          desc:
            editingId
              ? `${videoData.title} was updated in the J-Town Hoops Video Hub.`
              : `${videoData.title} was added to the J-Town Hoops Video Hub.`,

          category:
            "videos",

          origin:
            "videos",

          type:
            "video",

          link:
            "/videos",

          showInNews:
            false,

          showInNotifications:
            true,
        });


        alert(
          editingId
            ? "Video updated successfully!"
            : "Video published successfully!"
        );

        resetForm();

      } catch (error) {
        console.error(
          "Could not save video:",
          error
        );

        alert(
          error?.message ||
            "The video could not be saved."
        );

      } finally {
        setIsSaving(false);

        setLoadingMessage(
          "Loading J-Town Hoops videos..."
        );
      }
    };


  // ====================================================
  // EDIT VIDEO
  // ====================================================

  const handleEdit = (
    video
  ) => {
    if (!isAdmin) return;

    setForm({
      title:
        video.title || "",

      description:
        video.description || "",

      category:
        video.category ||
        "Highlights",

      externalLink:
        video.externalLink ||
        "",

      video: null,

      thumbnail: null,
    });

    setVideoPreview(
      video.videoUrl || ""
    );

    setThumbnailPreview(
      video.thumbnailUrl || ""
    );

    setEditingId(
      video.id
    );

    setShowAdminForm(true);

    setOpenMenu(null);

    setTimeout(() => {
      document
        .getElementById(
          "video-admin-panel"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  };


  // ====================================================
  // DELETE VIDEO
  // ====================================================

  const handleDelete =
    async (video) => {
      if (!isAdmin) return;

      const confirmed =
        window.confirm(
          `Delete "${video.title}" from the J-Town Hoops Video Hub?`
        );

      if (!confirmed) {
        return;
      }

      try {
        await videoAPI.remove(
          video.id
        );

        if (
          selectedVideo?.id ===
          video.id
        ) {
          setSelectedVideo(
            null
          );
        }

        setVideos(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                video.id
            )
        );

        addSiteUpdate?.({
          title:
            "Video Removed",

          desc:
            `${video.title} was removed from the J-Town Hoops Video Hub.`,

          category:
            "videos",

          origin:
            "videos",

          type:
            "video",

          link:
            "/videos",

          showInNews:
            false,

          showInNotifications:
            true,
        });

        setOpenMenu(null);

        alert(
          "Video deleted successfully."
        );

      } catch (error) {
        console.error(
          "Could not delete video:",
          error
        );

        alert(
          error?.message ||
            "The video could not be deleted."
        );
      }
    };


  // ====================================================
  // DOWNLOAD / OPEN LINK
  // ====================================================

  const handleDownload = (
    video
  ) => {
    if (video.videoUrl) {
      window.open(
        video.videoUrl,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    if (
      video.externalLink
    ) {
      window.open(
        video.externalLink,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };


  // ====================================================
  // OPEN VIDEO
  // ====================================================

  const openVideo = (
    video
  ) => {
    if (
      video.videoUrl
    ) {
      setSelectedVideo(
        video
      );

      return;
    }

    if (
      video.externalLink
    ) {
      window.open(
        video.externalLink,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };


  // ====================================================
  // DATE FORMATTER
  // ====================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "";
    }

    return parsed.toLocaleDateString(
      "en-NG",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ====================================================
  // UI
  // ====================================================

  return (
    <div
      className="min-h-screen text-gray-100 py-12 px-4 md:px-6 relative"
      style={{
        backgroundImage:
          `linear-gradient(rgba(0,0,0,.58),rgba(0,0,0,.64)), url(${myBackground})`,

        backgroundSize:
          "cover",

        backgroundPosition:
          "center",

        backgroundAttachment:
          "fixed",
      }}
    >

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="max-w-7xl mx-auto mb-10">

        <div className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-black/75 backdrop-blur-md p-6 md:p-9 shadow-2xl">

          <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />


          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-amber-400">

                <FaVideo />

                J-Town Hoops Visuals

              </div>


              <h1 className="mt-4 text-4xl md:text-6xl font-extrabold text-amber-500 uppercase tracking-widest">

                Video Hub

              </h1>


              <p className="mt-3 max-w-2xl text-gray-300 leading-relaxed">

                Watch game highlights, interviews,
                training sessions, community moments,
                tournament action and exclusive
                J-Town Hoops videos.

              </p>


              {isAdmin && (

                <button
                  type="button"
                  onClick={() => {
                    if (
                      showAdminForm &&
                      !editingId
                    ) {
                      resetForm();
                    } else {
                      openAddForm();
                    }
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 font-black text-black hover:bg-amber-400 active:scale-[0.98] transition cursor-pointer"
                >

                  <FaUpload />

                  {showAdminForm &&
                  !editingId
                    ? "Close Upload"
                    : "Upload Video"}

                </button>

              )}

            </div>


            <div className="grid grid-cols-2 gap-3 min-w-[270px]">

              <div className="rounded-2xl border border-neutral-700 bg-neutral-950/80 p-4 text-center">

                <div className="text-3xl font-black text-amber-400">

                  {videos.length}

                </div>

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

                  {isAdmin
                    ? "Admin"
                    : "Member"}

                </div>

                <div className="mt-2 text-[11px] uppercase tracking-widest text-gray-500">

                  Access Mode

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          ERROR
      ================================================== */}

      {pageError && (

        <section className="max-w-7xl mx-auto mb-6">

          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-red-300">

            <strong>
              Video Hub Error:
            </strong>{" "}

            {pageError}

            <button
              type="button"
              onClick={loadVideos}
              className="ml-4 underline font-bold cursor-pointer"
            >
              Try again
            </button>

          </div>

        </section>

      )}


      {/* ==================================================
          SEARCH + FILTER
      ================================================== */}

      <section className="max-w-7xl mx-auto mb-8">

        <div className="rounded-2xl border border-neutral-800 bg-black/70 backdrop-blur-md p-4 md:p-5">

          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

            <div className="relative flex-1 max-w-2xl">

              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search videos, highlights, interviews..."
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 py-3 pl-11 pr-4 outline-none focus:border-amber-500"
              />

            </div>


            <div className="flex gap-2 overflow-x-auto pb-1">

              {categories.map(
                (item) => (

                  <button
                    type="button"
                    key={item}
                    onClick={() =>
                      setCategory(item)
                    }
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                      category === item
                        ? "bg-amber-500 text-black"
                        : "border border-neutral-700 bg-neutral-950 text-neutral-300 hover:border-amber-500/50"
                    }`}
                  >

                    {item}

                  </button>

                )
              )}

            </div>

          </div>

        </div>

      </section>


      {/* ==================================================
          LOADING
      ================================================== */}

      {isLoading && (

        <section className="max-w-4xl mx-auto">

          <div className="rounded-3xl border border-neutral-700 bg-black/70 p-12 text-center">

            <FaSpinner className="mx-auto text-5xl text-amber-500 animate-spin" />

            <h2 className="mt-5 text-xl font-black">

              Loading Video Hub

            </h2>

            <p className="mt-2 text-neutral-400">

              {loadingMessage}

            </p>

          </div>

        </section>

      )}


      {/* ==================================================
          EMPTY STATE
      ================================================== */}

      {!isLoading &&
      filteredVideos.length === 0 && (

        <section className="max-w-4xl mx-auto">

          <div className="rounded-3xl border border-dashed border-neutral-700 bg-black/65 p-12 text-center backdrop-blur">

            <FaFilm className="mx-auto text-5xl text-amber-500/70" />

            <h2 className="mt-5 text-2xl font-black text-white">

              {videos.length === 0
                ? "The Video Hub is ready"
                : "No videos found"}

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


      {/* ==================================================
          VIDEO GRID
      ================================================== */}

      {!isLoading &&
      filteredVideos.length > 0 && (

        <section className="max-w-7xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">

            {filteredVideos.map(
              (video) => (

                <article
                  key={video.id}
                  className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-black/75 shadow-xl backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:border-amber-500/50 hover:shadow-amber-500/10"
                >

                  {/* THUMBNAIL */}

                  <button
                    type="button"
                    onClick={() =>
                      openVideo(video)
                    }
                    className="relative block aspect-video w-full overflow-hidden bg-neutral-950 text-left cursor-pointer"
                  >

                    {video.thumbnailUrl ? (

                      <img
                        src={
                          video.thumbnailUrl
                        }
                        alt={`${video.title} thumbnail`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                    ) : video.videoUrl ? (

                      <video
                        src={
                          video.videoUrl
                        }
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

                      {video.category ||
                        "Video"}

                    </span>

                  </button>


                  {/* INFORMATION */}

                  <div className="p-5">

                    <div className="flex items-start gap-3">

                      <div className="min-w-0 flex-1">

                        <h2 className="truncate text-xl font-black text-white transition group-hover:text-amber-400">

                          {video.title}

                        </h2>


                        <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-relaxed text-neutral-400">

                          {video.description ||
                            "J-Town Hoops video."}

                        </p>


                        <p className="mt-4 text-[11px] uppercase tracking-widest text-neutral-600">

                          {formatDate(
                            video.createdAt
                          )}

                        </p>

                      </div>


                      {/* 3 DOT MENU */}

                      <div className="relative">

                        <button
                          type="button"
                          onClick={(
                            event
                          ) => {
                            event.stopPropagation();

                            setOpenMenu(
                              (
                                current
                              ) =>
                                current ===
                                video.id
                                  ? null
                                  : video.id
                            );
                          }}
                          className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white cursor-pointer"
                          aria-label="Video options"
                        >

                          <FaEllipsisV />

                        </button>


                        {openMenu ===
                          video.id && (

                          <div
                            onClick={(
                              event
                            ) =>
                              event.stopPropagation()
                            }
                            className="absolute right-0 top-10 z-30 w-44 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-950 shadow-2xl"
                          >

                            <button
                              type="button"
                              onClick={() =>
                                handleDownload(
                                  video
                                )
                              }
                              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-neutral-200 hover:bg-neutral-800 cursor-pointer"
                            >

                              <FaDownload className="text-amber-400" />

                              {video.videoUrl
                                ? "Open Video"
                                : "Open Link"}

                            </button>


                            {isAdmin && (
                              <>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEdit(
                                      video
                                    )
                                  }
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-neutral-200 hover:bg-neutral-800 cursor-pointer"
                                >

                                  <FaEdit className="text-blue-400" />

                                  Edit

                                </button>


                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      video
                                    )
                                  }
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 cursor-pointer"
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
                      onClick={() =>
                        openVideo(video)
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-3 font-black text-amber-400 transition hover:bg-amber-500 hover:text-black cursor-pointer"
                    >

                      <FaPlay />

                      Watch Video

                    </button>

                  </div>

                </article>

              )
            )}

          </div>

        </section>

      )}


      {/* ==================================================
          ADMIN FORM
      ================================================== */}

      {isAdmin &&
      showAdminForm && (

        <section
          id="video-admin-panel"
          className="max-w-4xl mx-auto mt-14 scroll-mt-24"
        >

          <form
            onSubmit={
              handleSubmit
            }
            className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-black/85 p-6 md:p-8 shadow-2xl backdrop-blur-md"
          >

            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-amber-500/10 blur-3xl" />


            <div className="relative flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-400">

                  Admin Studio

                </p>

                <h2 className="mt-2 text-3xl font-black text-white">

                  {editingId
                    ? "Edit Video"
                    : "Upload New Video"}

                </h2>

                <p className="mt-2 text-sm text-neutral-400">

                  Videos are uploaded to Cloudinary and their information is saved permanently in MongoDB.

                </p>

              </div>


              <button
                type="button"
                onClick={
                  resetForm
                }
                className="rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-neutral-400 hover:text-white cursor-pointer"
              >

                <FaTimes />

              </button>

            </div>


            <div className="relative mt-7 grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* TITLE */}

              <label className="block">

                <span className="text-sm font-bold text-neutral-300">

                  Video title

                </span>

                <input
                  required
                  value={
                    form.title
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,

                        title:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-amber-500"
                  placeholder="J-Town Hoops Championship Highlights"
                />

              </label>


              {/* CATEGORY */}

              <label className="block">

                <span className="text-sm font-bold text-neutral-300">

                  Category

                </span>

                <select
                  value={
                    form.category
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,

                        category:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-amber-500"
                >

                  <option>
                    Highlights
                  </option>

                  <option>
                    Games
                  </option>

                  <option>
                    Interviews
                  </option>

                  <option>
                    Training
                  </option>

                  <option>
                    Community
                  </option>

                  <option>
                    Behind The Scenes
                  </option>

                  <option>
                    Announcements
                  </option>

                </select>

              </label>


              {/* DESCRIPTION */}

              <label className="block md:col-span-2">

                <span className="text-sm font-bold text-neutral-300">

                  Description

                </span>

                <textarea
                  value={
                    form.description
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,

                        description:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-amber-500"
                  placeholder="Tell viewers what this video is about..."
                />

              </label>


              {/* VIDEO FILE */}

              <label className="block">

                <span className="flex items-center gap-2 text-sm font-bold text-neutral-300">

                  <FaCloudUploadAlt className="text-amber-400" />

                  Video file

                  {editingId &&
                    " (optional)"}

                </span>

                <input
                  ref={
                    videoInputRef
                  }
                  type="file"
                  accept=".mp4,.webm,.mov,.m4v,video/mp4,video/webm,video/quicktime,video/x-m4v"
                  onChange={
                    handleVideoFileChange
                  }
                  className="mt-2 block w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:font-black file:text-black cursor-pointer"
                />

                <p className="mt-2 text-xs text-neutral-500">

                  MP4, WEBM, MOV or M4V. Maximum 100 MB.

                </p>

              </label>


              {/* THUMBNAIL */}

              <label className="block">

                <span className="flex items-center gap-2 text-sm font-bold text-neutral-300">

                  <FaImage className="text-amber-400" />

                  Thumbnail image

                  {editingId &&
                    " (optional)"}

                </span>

                <input
                  ref={
                    thumbnailInputRef
                  }
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleThumbnailChange
                  }
                  className="mt-2 block w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-neutral-700 file:px-4 file:py-2 file:font-bold file:text-white cursor-pointer"
                />

                <p className="mt-2 text-xs text-neutral-500">

                  JPG, PNG or WEBP. Maximum 5 MB.

                </p>

              </label>


              {/* VIDEO PREVIEW */}

              {videoPreview && (

                <div className="md:col-span-2 overflow-hidden rounded-2xl border border-neutral-700 bg-black">

                  <div className="border-b border-neutral-800 px-4 py-3">

                    <p className="text-xs font-black uppercase tracking-widest text-amber-400">

                      Video Preview

                    </p>

                  </div>

                  <video
                    src={
                      videoPreview
                    }
                    controls
                    className="max-h-80 w-full bg-black"
                  />

                </div>

              )}


              {/* THUMBNAIL PREVIEW */}

              {thumbnailPreview && (

                <div className="md:col-span-2">

                  <p className="mb-2 text-xs font-black uppercase tracking-widest text-amber-400">

                    Thumbnail Preview

                  </p>

                  <img
                    src={
                      thumbnailPreview
                    }
                    alt="Video thumbnail preview"
                    className="h-48 w-full max-w-md rounded-2xl border border-neutral-700 object-cover"
                  />

                </div>

              )}


              {/* EXTERNAL LINK */}

              <label className="block md:col-span-2">

                <span className="flex items-center gap-2 text-sm font-bold text-neutral-300">

                  <FaLink className="text-amber-400" />

                  External video link

                  <span className="font-normal text-neutral-500">
                    (optional)
                  </span>

                </span>

                <input
                  type="url"
                  value={
                    form.externalLink
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        current
                      ) => ({
                        ...current,

                        externalLink:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 outline-none focus:border-amber-500"
                  placeholder="https://..."
                />

                <p className="mt-2 text-xs text-neutral-500">

                  You can publish an external link instead of uploading a video file.

                </p>

              </label>

            </div>


            {/* SAVE BUTTONS */}

            <div className="relative mt-7 flex flex-col sm:flex-row gap-3">

              <button
                type="submit"
                disabled={
                  isSaving
                }
                className="flex-1 rounded-xl bg-amber-500 px-5 py-4 font-black text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >

                {isSaving ? (

                  <span className="flex items-center justify-center gap-3">

                    <FaSpinner className="animate-spin" />

                    {loadingMessage}

                  </span>

                ) : editingId ? (

                  "Save Video Changes"

                ) : (

                  "Publish Video"

                )}

              </button>


              <button
                type="button"
                disabled={
                  isSaving
                }
                onClick={
                  resetForm
                }
                className="rounded-xl border border-neutral-700 bg-neutral-900 px-6 py-4 font-bold text-neutral-300 hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
              >

                Cancel

              </button>

            </div>

          </form>

        </section>

      )}


      {/* ==================================================
          VIDEO PLAYER MODAL
      ================================================== */}

      {selectedVideo && (

        <div
          className="fixed inset-0 z-[12000] flex items-center justify-center bg-black/90 p-3 md:p-6 backdrop-blur-sm"
          onClick={() =>
            setSelectedVideo(
              null
            )
          }
        >

          <div
            className="w-full max-w-6xl overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950 shadow-2xl"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 md:px-5">

              <div className="min-w-0">

                <h2 className="truncate font-black text-white">

                  {selectedVideo.title}

                </h2>

                <p className="text-xs uppercase tracking-wider text-amber-400">

                  {
                    selectedVideo.category
                  }

                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setSelectedVideo(
                    null
                  )
                }
                className="rounded-lg p-3 text-neutral-400 hover:bg-neutral-800 hover:text-white cursor-pointer"
              >

                <FaTimes />

              </button>

            </div>


            <div className="bg-black">

              <video
                key={
                  selectedVideo.videoUrl
                }
                src={
                  selectedVideo.videoUrl
                }
                poster={
                  selectedVideo.thumbnailUrl ||
                  undefined
                }
                controls
                autoPlay
                playsInline
                className="max-h-[75vh] w-full"
              />

            </div>


            {selectedVideo.description && (

              <p className="p-5 text-sm leading-relaxed text-neutral-400">

                {
                  selectedVideo.description
                }

              </p>

            )}

          </div>

        </div>

      )}


      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="max-w-7xl mx-auto mt-16 border-t border-neutral-800 pt-7 text-center text-xs uppercase tracking-[0.2em] text-neutral-600">

        J-Town Hoops Video Hub • Jos, Nigeria

      </footer>

    </div>
  );
}