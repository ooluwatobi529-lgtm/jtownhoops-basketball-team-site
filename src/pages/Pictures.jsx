import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

import {
  pictureAPI,
  mediaAPI,
} from "../services/api";

// ============================================================
// LOCAL J-TOWN HOOPS DESIGN IMAGES
// ============================================================
//
// These remain local because they are part of the permanent
// visual design of the page.
//
// Uploaded gallery pictures are stored in Cloudinary/MongoDB.
//
// ============================================================

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

// ============================================================
// BACKGROUND MARQUEE
// ============================================================

const backgroundLoopImages = [
  about1,
  about2,
  about3,
  aipart,
  aipart2,
  bigfemo,
  gallery1,
  gallery2,
  gallery4,
  gallery5,
  image8e72,
  imageB149,
  imageBc7,
];

// ============================================================
// FEATURED CAROUSEL
// ============================================================

const carouselHighlights = [
  {
    id: 101,
    url: about1,
    title: "J-Town Hoops",
    description:
      "Celebrating basketball, teamwork and the J-Town Hoops community.",
  },
  {
    id: 102,
    url: about2,
    title: "Building Through Basketball",
    description:
      "Developing talent, confidence, teamwork and character through the game.",
  },
  {
    id: 103,
    url: about3,
    title: "Our Basketball Family",
    description:
      "Players, coaches, supporters and fans growing together through J-Town Hoops.",
  },
  {
    id: 104,
    url: bigfemo,
    title: "Player Spotlight",
    description:
      "Highlighting talent and memorable moments from the J-Town Hoops family.",
  },
  {
    id: 105,
    url: gallery1,
    title: "Game Day",
    description:
      "Action and excitement captured from the J-Town Hoops court.",
  },
  {
    id: 106,
    url: gallery2,
    title: "Basketball Highlights",
    description:
      "Capturing unforgettable moments from games, training and team activities.",
  },
  {
    id: 107,
    url: gallery4,
    title: "Training Moments",
    description:
      "Hard work, development and another memorable J-Town Hoops training session.",
  },
  {
    id: 108,
    url: gallery5,
    title: "Hoops Gallery",
    description:
      "Celebrating the people and moments that make J-Town Hoops special.",
  },
  {
    id: 109,
    url: image8e72,
    title: "J-Town Spotlight",
    description:
      "A featured image from the J-Town Hoops local picture collection.",
  },
  {
    id: 110,
    url: imageB149,
    title: "Team Spotlight",
    description:
      "Another featured moment from our growing basketball community.",
  },
  {
    id: 111,
    url: imageBc7,
    title: "J-Town Hoops Highlights",
    description:
      "Basketball, community and unforgettable J-Town Hoops moments.",
  },
];

// ============================================================
// CATEGORIES
// ============================================================

const categories = [
  "All",
  "In-Game Action",
  "Practice",
  "Team Chemistry",
  "Fan Zone",
];

// ============================================================
// PICTURES PAGE
// ============================================================

export default function Pictures() {
  const { isAdmin } = useAuth();

  const { addSiteUpdate } =
    useNotifications();

  // ==========================================================
  // DATABASE GALLERY
  // ==========================================================

  const [
    galleryItems,
    setGalleryItems,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  // ==========================================================
  // CAROUSEL / LIGHTBOX
  // ==========================================================

  const [
    activeSlide,
    setActiveSlide,
  ] = useState(0);

  const [
    activeLightboxImage,
    setActiveLightboxImage,
  ] = useState(null);

  const [
    activeMenuId,
    setActiveMenuId,
  ] = useState(null);

  // ==========================================================
  // SEARCH / FILTER
  // ==========================================================

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("All");

  // ==========================================================
  // EDITOR
  // ==========================================================

  const [
    showEditor,
    setShowEditor,
  ] = useState(false);

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    photoTitle,
    setPhotoTitle,
  ] = useState("");

  const [
    photoDescription,
    setPhotoDescription,
  ] = useState("");

  const [
    photoCategory,
    setPhotoCategory,
  ] = useState(
    "In-Game Action"
  );

  const [
    photoUrl,
    setPhotoUrl,
  ] = useState("");

  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);

  const [
    selectedFileName,
    setSelectedFileName,
  ] = useState("");

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState("");

  const [
    existingPublicId,
    setExistingPublicId,
  ] = useState("");

  // ==========================================================
  // ACTION STATES
  // ==========================================================

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    likingId,
    setLikingId,
  ] = useState(null);

  const [
    statusMessage,
    setStatusMessage,
  ] = useState("");

  const [
    statusType,
    setStatusType,
  ] = useState("success");

  // ==========================================================
  // STATUS MESSAGE
  // ==========================================================

  const showStatus = (
    message,
    type = "success"
  ) => {
    setStatusMessage(message);
    setStatusType(type);

    window.setTimeout(() => {
      setStatusMessage("");
    }, 4500);
  };

  // ==========================================================
  // LOAD PICTURES FROM MONGODB
  // ==========================================================

  const loadPictures = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const response =
        await pictureAPI.getAll();

      const pictures =
        Array.isArray(
          response?.pictures
        )
          ? response.pictures
          : [];

      setGalleryItems(
        pictures
      );
    } catch (error) {
      console.error(
        "Could not load pictures:",
        error
      );

      setLoadError(
        error?.message ||
          "Could not load the J-Town Hoops gallery."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL DATABASE LOAD
  // ==========================================================

  useEffect(() => {
    loadPictures();
  }, []);

  // ==========================================================
  // FEATURED CAROUSEL TIMER
  // ==========================================================

  useEffect(() => {
    const timer =
      setInterval(() => {
        setActiveSlide(
          (previous) =>
            (previous + 1) %
            carouselHighlights.length
        );
      }, 5000);

    return () =>
      clearInterval(timer);
  }, []);

  // ==========================================================
  // CLOSE THREE-DOT MENU
  // ==========================================================

  useEffect(() => {
    const closeMenu = () => {
      setActiveMenuId(null);
    };

    document.addEventListener(
      "click",
      closeMenu
    );

    return () =>
      document.removeEventListener(
        "click",
        closeMenu
      );
  }, []);

  // ==========================================================
  // CLEAN PREVIEW OBJECT URL
  // ==========================================================

  useEffect(() => {
    return () => {
      if (
        previewUrl &&
        previewUrl.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    };
  }, [previewUrl]);

  // ==========================================================
  // FILTERED GALLERY
  // ==========================================================

  const filteredGallery =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return galleryItems.filter(
        (item) => {
          const categoryMatch =
            activeCategory ===
              "All" ||
            item.category ===
              activeCategory;

          const title =
            item.title || "";

          const description =
            item.description || "";

          const category =
            item.category || "";

          const textMatch =
            !query ||
            title
              .toLowerCase()
              .includes(query) ||
            description
              .toLowerCase()
              .includes(query) ||
            category
              .toLowerCase()
              .includes(query);

          return (
            categoryMatch &&
            textMatch
          );
        }
      );
    }, [
      galleryItems,
      searchQuery,
      activeCategory,
    ]);

  // ==========================================================
  // CAROUSEL CONTROLS
  // ==========================================================

  const handlePrevSlide = () => {
    setActiveSlide(
      (previous) =>
        (previous -
          1 +
          carouselHighlights.length) %
        carouselHighlights.length
    );
  };

  const handleNextSlide = () => {
    setActiveSlide(
      (previous) =>
        (previous + 1) %
        carouselHighlights.length
    );
  };

  // ==========================================================
  // RESET EDITOR
  // ==========================================================

  const resetEditor = () => {
    if (
      previewUrl &&
      previewUrl.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setEditingId(null);

    setPhotoTitle("");

    setPhotoDescription("");

    setPhotoCategory(
      "In-Game Action"
    );

    setPhotoUrl("");

    setSelectedFile(null);

    setSelectedFileName("");

    setPreviewUrl("");

    setExistingPublicId("");
  };

  // ==========================================================
  // OPEN ADD EDITOR
  // ==========================================================

  const openAddEditor = () => {
    if (!isAdmin) {
      return;
    }

    resetEditor();

    setShowEditor(true);
  };

  // ==========================================================
  // OPEN EDIT EDITOR
  // ==========================================================

  const openEditEditor = (
    item
  ) => {
    if (!isAdmin) {
      return;
    }

    resetEditor();

    setEditingId(
      item.id
    );

    setPhotoTitle(
      item.title || ""
    );

    setPhotoDescription(
      item.description || ""
    );

    setPhotoCategory(
      item.category ||
        "In-Game Action"
    );

    setPhotoUrl(
      item.url || ""
    );

    setPreviewUrl(
      item.url || ""
    );

    setExistingPublicId(
      item.publicId || ""
    );

    setShowEditor(true);

    setActiveMenuId(null);
  };

  // ==========================================================
  // SELECT IMAGE FROM COMPUTER
  // ==========================================================
  //
  // IMPORTANT:
  //
  // We do NOT convert this to Base64.
  //
  // We only create a temporary browser preview.
  //
  // The actual file is uploaded to Cloudinary when Save is
  // pressed.
  //
  // ==========================================================

  const handleLocalFileSelection = (
    event
  ) => {
    if (!isAdmin) {
      return;
    }

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      showStatus(
        "Please choose a JPG, JPEG, PNG or WEBP image.",
        "error"
      );

      event.target.value = "";

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      showStatus(
        "Please choose an image smaller than 5 MB.",
        "error"
      );

      event.target.value = "";

      return;
    }

    if (
      previewUrl &&
      previewUrl.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    const temporaryPreview =
      URL.createObjectURL(file);

    setSelectedFile(file);

    setSelectedFileName(
      file.name
    );

    setPreviewUrl(
      temporaryPreview
    );

    // A computer upload takes priority over a manually
    // entered URL.
    setPhotoUrl("");
  };

  // ==========================================================
  // MANUAL IMAGE URL
  // ==========================================================

  const handleImageUrlChange = (
    event
  ) => {
    const value =
      event.target.value;

    if (
      previewUrl &&
      previewUrl.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setSelectedFile(null);

    setSelectedFileName("");

    setPhotoUrl(value);

    setPreviewUrl(value);
  };

  // ==========================================================
  // SAVE PICTURE
  // ==========================================================

  const handleSavePhoto =
    async (event) => {
      event.preventDefault();

      if (!isAdmin) {
        return;
      }

      if (saving) {
        return;
      }

      const cleanTitle =
        photoTitle.trim();

      const cleanDescription =
        photoDescription.trim();

      if (
        !cleanTitle ||
        !cleanDescription
      ) {
        showStatus(
          "Please enter a title and description.",
          "error"
        );

        return;
      }

      const existing =
        galleryItems.find(
          (item) =>
            item.id === editingId
        );

      if (
        !selectedFile &&
        !photoUrl.trim() &&
        !existing?.url
      ) {
        showStatus(
          "Please choose a picture from your computer or enter an image URL.",
          "error"
        );

        return;
      }

      try {
        setSaving(true);

        let finalUrl =
          photoUrl.trim() ||
          existing?.url ||
          "";

        let finalPublicId =
          existingPublicId ||
          existing?.publicId ||
          "";

        let finalResourceType =
          existing?.resourceType ||
          "image";

        // ====================================================
        // CLOUDINARY UPLOAD
        // ====================================================

        if (selectedFile) {
          const uploadResponse =
            await mediaAPI.uploadImage(
              {
                file:
                  selectedFile,

                folder:
                  "gallery",
              }
            );

          const media =
            uploadResponse?.media;

          if (!media?.url) {
            throw new Error(
              "The picture uploaded, but Cloudinary did not return an image URL."
            );
          }

          finalUrl =
            media.url;

          finalPublicId =
            media.publicId ||
            "";

          finalResourceType =
            media.resourceType ||
            "image";
        }

        const payload = {
          title:
            cleanTitle,

          description:
            cleanDescription,

          category:
            photoCategory,

          url:
            finalUrl,

          publicId:
            finalPublicId,

          resourceType:
            finalResourceType,
        };

        let response;

        // ====================================================
        // UPDATE EXISTING PICTURE
        // ====================================================

        if (editingId) {
          response =
            await pictureAPI.update(
              editingId,
              payload
            );

          const updatedPicture =
            response?.picture;

          if (
            !updatedPicture
          ) {
            throw new Error(
              "The backend did not return the updated picture."
            );
          }

          setGalleryItems(
            (current) =>
              current.map(
                (item) =>
                  item.id ===
                  editingId
                    ? updatedPicture
                    : item
              )
          );

          if (
            activeLightboxImage?.id ===
            editingId
          ) {
            setActiveLightboxImage(
              updatedPicture
            );
          }

          addSiteUpdate?.({
            title:
              "Picture Updated",

            desc:
              `${updatedPicture.title} was updated in the J-Town Hoops gallery.`,

            category:
              "pictures",

            origin:
              "pictures",

            type:
              "pictures",

            link:
              "/pictures",

            showInNews:
              true,

            showInNotifications:
              true,
          });

          showStatus(
            "Picture updated successfully."
          );
        }

        // ====================================================
        // CREATE NEW PICTURE
        // ====================================================

        else {
          response =
            await pictureAPI.create(
              payload
            );

          const newPicture =
            response?.picture;

          if (!newPicture) {
            throw new Error(
              "The backend did not return the new picture."
            );
          }

          setGalleryItems(
            (current) => [
              newPicture,
              ...current,
            ]
          );

          addSiteUpdate?.({
            title:
              "New Picture Added",

            desc:
              `${newPicture.title} was added to the J-Town Hoops gallery.`,

            category:
              "pictures",

            origin:
              "pictures",

            type:
              "pictures",

            link:
              "/pictures",

            showInNews:
              true,

            showInNotifications:
              true,
          });

          showStatus(
            "Picture uploaded and saved successfully."
          );
        }

        resetEditor();

        setShowEditor(false);
      } catch (error) {
        console.error(
          "SAVE PICTURE ERROR:",
          error
        );

        showStatus(
          error?.message ||
            "The picture could not be saved.",
          "error"
        );
      } finally {
        setSaving(false);
      }
    };

  // ==========================================================
  // DELETE PICTURE
  // ==========================================================

  const handleDeletePhoto =
    async (item) => {
      if (!isAdmin) {
        return;
      }

      if (
        deletingId === item.id
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Delete "${item.title}" from the J-Town Hoops gallery?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          item.id
        );

        await pictureAPI.remove(
          item.id
        );

        setGalleryItems(
          (current) =>
            current.filter(
              (photo) =>
                photo.id !==
                item.id
            )
        );

        if (
          activeLightboxImage?.id ===
          item.id
        ) {
          setActiveLightboxImage(
            null
          );
        }

        setActiveMenuId(null);

        addSiteUpdate?.({
          title:
            "Picture Removed",

          desc:
            `${item.title} was removed from the J-Town Hoops gallery.`,

          category:
            "pictures",

          origin:
            "pictures",

          type:
            "pictures",

          link:
            "/pictures",

          showInNews:
            false,

          showInNotifications:
            true,
        });

        showStatus(
          "Picture removed successfully."
        );
      } catch (error) {
        console.error(
          "DELETE PICTURE ERROR:",
          error
        );

        showStatus(
          error?.message ||
            "The picture could not be deleted.",
          "error"
        );
      } finally {
        setDeletingId(null);
      }
    };

  // ==========================================================
  // LIKE PICTURE
  // ==========================================================

  const handleLikePhoto =
    async (
      id,
      event
    ) => {
      event?.stopPropagation();

      if (
        likingId === id
      ) {
        return;
      }

      try {
        setLikingId(id);

        const response =
          await pictureAPI.like(
            id
          );

        const updatedPicture =
          response?.picture;

        if (
          !updatedPicture
        ) {
          return;
        }

        setGalleryItems(
          (current) =>
            current.map(
              (item) =>
                item.id === id
                  ? updatedPicture
                  : item
            )
        );

        if (
          activeLightboxImage?.id ===
          id
        ) {
          setActiveLightboxImage(
            updatedPicture
          );
        }
      } catch (error) {
        console.error(
          "LIKE PICTURE ERROR:",
          error
        );

        showStatus(
          error?.message ||
            "Could not like this picture.",
          "error"
        );
      } finally {
        setLikingId(null);
      }
    };

  // ==========================================================
  // PAGE
  // ==========================================================

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
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
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

      {/* ======================================================
          STATUS MESSAGE
      ====================================================== */}

      {statusMessage && (
        <div
          className={`
            fixed
            right-4
            top-24
            z-[1000001]
            flex
            max-w-sm
            items-start
            gap-3
            rounded-2xl
            border
            px-4
            py-3
            shadow-2xl
            backdrop-blur-xl
            ${
              statusType ===
              "error"
                ? "border-red-500/40 bg-red-950/90 text-red-100"
                : "border-emerald-500/40 bg-emerald-950/90 text-emerald-100"
            }
          `}
        >
          {statusType ===
          "error" ? (
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />
          ) : (
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0"
            />
          )}

          <p className="text-xs font-bold leading-relaxed">
            {statusMessage}
          </p>

          <button
            type="button"
            onClick={() =>
              setStatusMessage("")
            }
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-8">

        {/* ====================================================
            1. CONTINUOUS CAROUSEL
        ==================================================== */}

        <section className="relative h-44 overflow-hidden rounded-3xl border border-orange-500/30 bg-black shadow-[0_20px_60px_rgba(0,0,0,.45)] sm:h-52">
          <div className="picture-marquee absolute inset-y-0 left-0 flex w-max">
            {[
              ...backgroundLoopImages,
              ...backgroundLoopImages,
            ].map(
              (
                image,
                index
              ) => (
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
                    <ShieldCheck
                      size={11}
                    />
                    Admin
                  </span>
                )}
              </div>

              <h1 className="flex items-center gap-3 text-3xl font-black uppercase tracking-tight sm:text-4xl">
                <Camera className="text-orange-500" />
                Picture Hub
              </h1>

              <p className="mt-2 max-w-xl text-xs leading-relaxed text-neutral-300 sm:text-sm">
                Game-day action,
                team memories,
                training moments and
                the people behind
                J-Town Hoops.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================
            2. BOUNCING FEATURED CAROUSEL
        ==================================================== */}

        <section className="picture-bounce group relative h-72 overflow-hidden rounded-3xl border border-orange-500/30 bg-black shadow-[0_20px_60px_rgba(0,0,0,.5)] sm:h-[25rem]">
          {carouselHighlights.map(
            (
              slide,
              index
            ) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index ===
                  activeSlide
                    ? "z-10 opacity-100"
                    : "z-0 opacity-0"
                }`}
              >
                <img
                  src={slide.url}
                  alt={
                    slide.title
                  }
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 z-20 max-w-2xl sm:bottom-8 sm:left-8">
                  <span className="rounded-md bg-orange-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-black">
                    Featured Moment
                  </span>

                  <h2 className="mt-3 text-2xl font-black uppercase tracking-tight sm:text-3xl">
                    {
                      slide.title
                    }
                  </h2>

                  <p className="mt-2 text-xs leading-relaxed text-neutral-200 sm:text-sm">
                    {
                      slide.description
                    }
                  </p>
                </div>
              </div>
            )
          )}

          <button
            type="button"
            onClick={
              handlePrevSlide
            }
            className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2.5 text-white opacity-0 backdrop-blur-md transition hover:bg-orange-500 hover:text-black group-hover:opacity-100"
          >
            <ChevronLeft
              size={19}
            />
          </button>

          <button
            type="button"
            onClick={
              handleNextSlide
            }
            className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2.5 text-white opacity-0 backdrop-blur-md transition hover:bg-orange-500 hover:text-black group-hover:opacity-100"
          >
            <ChevronRight
              size={19}
            />
          </button>

          <div className="absolute bottom-5 right-6 z-30 flex items-center gap-1.5">
            {carouselHighlights.map(
              (
                slide,
                index
              ) => (
                <button
                  key={
                    slide.id
                  }
                  type="button"
                  onClick={() =>
                    setActiveSlide(
                      index
                    )
                  }
                  className={`h-1.5 rounded-full transition-all ${
                    activeSlide ===
                    index
                      ? "w-7 bg-orange-500"
                      : "w-2 bg-white/50"
                  }`}
                />
              )
            )}
          </div>
        </section>

        {/* ====================================================
            3. DATABASE GALLERY
        ==================================================== */}

        <section className="rounded-3xl border border-neutral-800 bg-black/75 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-orange-400">
                <Images
                  size={18}
                />

                <span className="text-[10px] font-black uppercase tracking-[.25em]">
                  J-Town Gallery
                </span>
              </div>

              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight sm:text-3xl">
                Picture Collection
              </h2>

              <p className="mt-1 text-xs text-neutral-400">
                {loading
                  ? "Loading J-Town Hoops memories..."
                  : `${galleryItems.length} memories in the J-Town Hoops collection.`}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
              <div className="relative min-w-0 lg:w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
                />

                <input
                  value={
                    searchQuery
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchQuery(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search pictures..."
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-2.5 pl-10 pr-4 text-xs outline-none transition focus:border-orange-500"
                />
              </div>

              <button
                type="button"
                onClick={
                  loadPictures
                }
                disabled={
                  loading
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-neutral-300 transition hover:border-orange-500/50 hover:text-orange-400 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={
                    openAddEditor
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-black transition hover:scale-[1.02] hover:bg-orange-400"
                >
                  <Plus
                    size={17}
                  />
                  Add Picture
                </button>
              )}
            </div>
          </div>

          {/* CATEGORY FILTERS */}

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {categories.map(
              (category) => (
                <button
                  key={
                    category
                  }
                  type="button"
                  onClick={() =>
                    setActiveCategory(
                      category
                    )
                  }
                  className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-wider transition ${
                    activeCategory ===
                    category
                      ? "border-orange-500 bg-orange-500 text-black"
                      : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-orange-500/50 hover:text-orange-400"
                  }`}
                >
                  {category}
                </button>
              )
            )}
          </div>

          {/* LOADING */}

          {loading && (
            <div className="mt-6 flex min-h-56 flex-col items-center justify-center rounded-3xl border border-neutral-800 bg-neutral-950/70">
              <Loader2
                size={34}
                className="animate-spin text-orange-500"
              />

              <p className="mt-4 text-xs font-black uppercase tracking-wider text-neutral-400">
                Loading Gallery
              </p>
            </div>
          )}

          {/* LOAD ERROR */}

          {!loading &&
            loadError && (
              <div className="mt-6 rounded-3xl border border-red-500/30 bg-red-950/30 px-5 py-10 text-center">
                <AlertCircle
                  className="mx-auto text-red-400"
                  size={34}
                />

                <h3 className="mt-3 font-black">
                  Gallery could
                  not be loaded
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-xs text-red-200/70">
                  {loadError}
                </p>

                <button
                  type="button"
                  onClick={
                    loadPictures
                  }
                  className="mt-5 rounded-xl bg-red-500 px-5 py-2.5 text-xs font-black uppercase text-white"
                >
                  Try Again
                </button>
              </div>
            )}

          {/* EMPTY GALLERY */}

          {!loading &&
            !loadError &&
            filteredGallery.length ===
              0 && (
              <div className="mt-6 rounded-3xl border border-dashed border-neutral-700 bg-neutral-950/70 py-16 text-center">
                <ImageIcon
                  className="mx-auto text-neutral-600"
                  size={36}
                />

                <h3 className="mt-4 font-black">
                  No pictures
                  found
                </h3>

                <p className="mt-1 text-xs text-neutral-500">
                  {galleryItems.length ===
                  0
                    ? "The MongoDB gallery is currently empty."
                    : "Try another search or gallery category."}
                </p>

                {isAdmin &&
                  galleryItems.length ===
                    0 && (
                    <button
                      type="button"
                      onClick={
                        openAddEditor
                      }
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-xs font-black uppercase text-black"
                    >
                      <Plus
                        size={
                          16
                        }
                      />
                      Add First
                      Picture
                    </button>
                  )}
              </div>
            )}

          {/* PICTURE GRID */}

          {!loading &&
            !loadError &&
            filteredGallery.length >
              0 && (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGallery.map(
                  (item) => (
                    <article
                      key={
                        item.id
                      }
                      onClick={() =>
                        setActiveLightboxImage(
                          item
                        )
                      }
                      className="group cursor-pointer overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-[0_20px_45px_rgba(249,115,22,.12)]"
                    >
                      <div className="relative h-56 overflow-hidden bg-neutral-900">
                        <img
                          src={
                            item.url
                          }
                          alt={
                            item.title
                          }
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/15" />

                        <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/65 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-orange-400 backdrop-blur-md">
                          {
                            item.category
                          }
                        </span>

                        <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/60 p-2 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100">
                          <Maximize2
                            size={
                              15
                            }
                          />
                        </div>

                        {isAdmin && (
                          <div
                            className="absolute right-3 top-3 z-30"
                            onClick={(
                              event
                            ) =>
                              event.stopPropagation()
                            }
                          >
                            <button
                              type="button"
                              onClick={(
                                event
                              ) => {
                                event.stopPropagation();

                                setActiveMenuId(
                                  (
                                    current
                                  ) =>
                                    current ===
                                    item.id
                                      ? null
                                      : item.id
                                );
                              }}
                              className="rounded-full border border-white/10 bg-black/70 p-2 text-white backdrop-blur-md transition hover:bg-orange-500 hover:text-black"
                              title="Picture options"
                            >
                              <MoreVertical
                                size={
                                  17
                                }
                              />
                            </button>

                            {activeMenuId ===
                              item.id && (
                              <div
                                onClick={(
                                  event
                                ) =>
                                  event.stopPropagation()
                                }
                                className="absolute right-0 top-11 z-40 w-36 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-950 p-1 shadow-2xl"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditEditor(
                                      item
                                    )
                                  }
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-neutral-200 hover:bg-neutral-800 hover:text-orange-400"
                                >
                                  <Pencil
                                    size={
                                      14
                                    }
                                  />
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    deletingId ===
                                    item.id
                                  }
                                  onClick={() =>
                                    handleDeletePhoto(
                                      item
                                    )
                                  }
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                                >
                                  {deletingId ===
                                  item.id ? (
                                    <Loader2
                                      size={
                                        14
                                      }
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2
                                      size={
                                        14
                                      }
                                    />
                                  )}

                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="truncate text-base font-black uppercase tracking-tight">
                          {
                            item.title
                          }
                        </h3>

                        <p className="mt-2 line-clamp-2 min-h-[40px] text-xs leading-relaxed text-neutral-400">
                          {
                            item.description
                          }
                        </p>

                        <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-4">
                          <button
                            type="button"
                            disabled={
                              likingId ===
                              item.id
                            }
                            onClick={(
                              event
                            ) =>
                              handleLikePhoto(
                                item.id,
                                event
                              )
                            }
                            className="flex items-center gap-1.5 text-xs font-bold text-neutral-400 transition hover:text-red-400 disabled:opacity-60"
                          >
                            {likingId ===
                            item.id ? (
                              <Loader2
                                size={
                                  15
                                }
                                className="animate-spin"
                              />
                            ) : (
                              <Heart
                                size={
                                  15
                                }
                                className="text-red-500/70"
                              />
                            )}

                            {item.likes ??
                              0}
                          </button>

                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500">
                            <Calendar
                              size={
                                13
                              }
                            />

                            {item.date ||
                              ""}
                          </span>
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
        </section>

        {/* ====================================================
            4. ADMIN PICTURE MANAGER
        ==================================================== */}

        {isAdmin && (
          <section className="overflow-hidden rounded-3xl border border-orange-500/25 bg-black/80 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() => {
                if (
                  showEditor
                ) {
                  setShowEditor(
                    false
                  );

                  resetEditor();
                } else {
                  openAddEditor();
                }
              }}
              className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-400">
                  <UploadCloud
                    size={22}
                  />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.25em] text-orange-400">
                    Admin Picture
                    Manager
                  </p>

                  <h2 className="mt-1 text-lg font-black uppercase">
                    {editingId
                      ? "Edit Picture"
                      : "Add Pictures"}
                  </h2>

                  <p className="mt-1 text-xs text-neutral-500">
                    Upload directly
                    from your
                    computer or use
                    an image URL.
                  </p>
                </div>
              </div>

              <Plus
                className={`text-orange-400 transition ${
                  showEditor
                    ? "rotate-45"
                    : ""
                }`}
              />
            </button>

            {showEditor && (
              <form
                onSubmit={
                  handleSavePhoto
                }
                className="border-t border-neutral-800 p-5 sm:p-6"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  {/* TITLE */}

                  <label>
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Picture Title
                    </span>

                    <input
                      required
                      value={
                        photoTitle
                      }
                      onChange={(
                        event
                      ) =>
                        setPhotoTitle(
                          event.target
                            .value
                        )
                      }
                      placeholder="e.g. Championship Celebration"
                      className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                    />
                  </label>

                  {/* CATEGORY */}

                  <label>
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Category
                    </span>

                    <select
                      value={
                        photoCategory
                      }
                      onChange={(
                        event
                      ) =>
                        setPhotoCategory(
                          event.target
                            .value
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm outline-none focus:border-orange-500"
                    >
                      {categories
                        .filter(
                          (
                            category
                          ) =>
                            category !==
                            "All"
                        )
                        .map(
                          (
                            category
                          ) => (
                            <option
                              key={
                                category
                              }
                              value={
                                category
                              }
                            >
                              {
                                category
                              }
                            </option>
                          )
                        )}
                    </select>
                  </label>

                  {/* COMPUTER UPLOAD */}

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Upload Picture
                    </span>

                    <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-400 transition hover:border-orange-500/60 hover:text-orange-400">
                      <FileImage
                        size={18}
                      />

                      <span className="truncate">
                        {selectedFileName ||
                          "Choose image from computer..."}
                      </span>

                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={
                          handleLocalFileSelection
                        }
                        className="hidden"
                      />
                    </label>

                    <p className="mt-2 text-[10px] text-neutral-600">
                      JPG, PNG or
                      WEBP • Maximum
                      5 MB
                    </p>
                  </div>

                  {/* URL */}

                  <label>
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Or Image URL
                    </span>

                    <input
                      type="url"
                      value={
                        photoUrl
                      }
                      onChange={
                        handleImageUrlChange
                      }
                      placeholder="https://..."
                      className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                    />

                    <p className="mt-2 text-[10px] text-neutral-600">
                      Selecting a
                      computer image
                      will use the
                      Cloudinary
                      upload instead.
                    </p>
                  </label>

                  {/* DESCRIPTION */}

                  <label className="md:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Description
                    </span>

                    <textarea
                      required
                      rows={3}
                      value={
                        photoDescription
                      }
                      onChange={(
                        event
                      ) =>
                        setPhotoDescription(
                          event.target
                            .value
                        )
                      }
                      placeholder="Describe this J-Town Hoops moment..."
                      className="mt-2 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm outline-none transition focus:border-orange-500"
                    />
                  </label>
                </div>

                {/* PREVIEW */}

                {previewUrl && (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
                    <div className="border-b border-neutral-800 px-4 py-3">
                      <p className="text-[9px] font-black uppercase tracking-[.2em] text-neutral-500">
                        Picture Preview
                      </p>
                    </div>

                    <img
                      src={
                        previewUrl
                      }
                      alt="Picture preview"
                      className="h-52 w-full object-cover sm:h-64"
                    />
                  </div>
                )}

                {/* ACTIONS */}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={
                      saving
                    }
                    onClick={() => {
                      setShowEditor(
                        false
                      );

                      resetEditor();
                    }}
                    className="rounded-xl border border-neutral-700 bg-neutral-900 px-5 py-3 text-xs font-black uppercase tracking-wider text-neutral-300 transition hover:bg-neutral-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-black transition hover:scale-[1.02] hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={
                            16
                          }
                          className="animate-spin"
                        />

                        {selectedFile
                          ? "Uploading..."
                          : "Saving..."}
                      </>
                    ) : (
                      <>
                        <Sparkles
                          size={
                            16
                          }
                        />

                        {editingId
                          ? "Save Changes"
                          : "Add Picture"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
      </div>

      {/* ======================================================
          LIGHTBOX
      ====================================================== */}

      {activeLightboxImage && (
        <div
          onClick={() =>
            setActiveLightboxImage(
              null
            )
          }
          className="fixed inset-0 z-[1000000] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
        >
          <div
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl"
          >
            <button
              type="button"
              onClick={() =>
                setActiveLightboxImage(
                  null
                )
              }
              className="absolute right-4 top-4 z-30 rounded-full border border-white/10 bg-black/70 p-2.5 text-white backdrop-blur-md transition hover:bg-red-500"
            >
              <X size={20} />
            </button>

            <div className="flex min-h-[340px] items-center justify-center bg-black sm:min-h-[520px]">
              <img
                src={
                  activeLightboxImage.url
                }
                alt={
                  activeLightboxImage.title
                }
                className="max-h-[70vh] w-full object-contain"
              />
            </div>

            <div className="p-6 sm:p-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-orange-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-orange-400">
                  {
                    activeLightboxImage.category
                  }
                </span>

                <span className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500">
                  <Calendar
                    size={13}
                  />

                  {activeLightboxImage.date ||
                    ""}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-black uppercase tracking-tight">
                {
                  activeLightboxImage.title
                }
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-400">
                {
                  activeLightboxImage.description
                }
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-5">
                <button
                  type="button"
                  disabled={
                    likingId ===
                    activeLightboxImage.id
                  }
                  onClick={(
                    event
                  ) =>
                    handleLikePhoto(
                      activeLightboxImage.id,
                      event
                    )
                  }
                  className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-sm font-bold text-neutral-300 transition hover:border-red-500/40 hover:text-red-400 disabled:opacity-60"
                >
                  {likingId ===
                  activeLightboxImage.id ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Heart
                      size={17}
                      className="text-red-500"
                    />
                  )}

                  {galleryItems.find(
                    (item) =>
                      item.id ===
                      activeLightboxImage.id
                  )?.likes ??
                    activeLightboxImage.likes ??
                    0}
                </button>

                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const picture =
                          galleryItems.find(
                            (
                              item
                            ) =>
                              item.id ===
                              activeLightboxImage.id
                          ) ||
                          activeLightboxImage;

                        setActiveLightboxImage(
                          null
                        );

                        openEditEditor(
                          picture
                        );
                      }}
                      className="flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-xs font-black text-orange-400 transition hover:bg-orange-500 hover:text-black"
                    >
                      <Pencil
                        size={
                          15
                        }
                      />
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={
                        deletingId ===
                        activeLightboxImage.id
                      }
                      onClick={() =>
                        handleDeletePhoto(
                          activeLightboxImage
                        )
                      }
                      className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-black text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                    >
                      {deletingId ===
                      activeLightboxImage.id ? (
                        <Loader2
                          size={
                            15
                          }
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2
                          size={
                            15
                          }
                        />
                      )}

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