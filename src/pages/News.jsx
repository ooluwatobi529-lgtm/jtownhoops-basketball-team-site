import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Newspaper,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Search,
  Calendar,
  Star,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import myBackground from "../images/mybackground4.jpg";

import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

import {
  newsAPI,
  mediaAPI,
} from "../services/api";

// ============================================================
// BLANK NEWS ARTICLE
// ============================================================

const blankNews = {
  title: "",
  desc: "",
  category: "general",
  link: "/news",
  image: "",
  imagePublicId: "",
  featured: false,
};

// ============================================================
// CATEGORIES
// ============================================================

const categories = [
  "all",
  "general",
  "games",
  "schedule",
  "players",
  "teams",
  "pictures",
  "videos",
  "music",
];

// ============================================================
// NEWS PAGE
// ============================================================

export default function News() {
  const { isAdmin } =
    useAuth();

  // NotificationContext is now used for ANNOUNCEMENTS.
  // MongoDB is the permanent News database.

  const { addSiteUpdate } =
    useNotifications();

  // ==========================================================
  // DATABASE NEWS
  // ==========================================================

  const [
    newsFeed,
    setNewsFeed,
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
  // FILTERING
  // ==========================================================

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("all");

  // ==========================================================
  // EDITOR
  // ==========================================================

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState(blankNews);

  // ==========================================================
  // IMAGE
  // ==========================================================

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
    status,
    setStatus,
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
    setStatus(message);
    setStatusType(type);

    window.setTimeout(() => {
      setStatus("");
    }, 4500);
  };

  // ==========================================================
  // LOAD NEWS FROM MONGODB
  // ==========================================================

  const loadNews = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const response =
        await newsAPI.getAll();

      setNewsFeed(
        Array.isArray(response?.news)
          ? response.news
          : []
      );
    } catch (error) {
      console.error(
        "LOAD NEWS ERROR:",
        error
      );

      setLoadError(
        error?.message ||
          "Could not load J-Town Hoops news."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  // ==========================================================
  // CLEAN OBJECT URL
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
  // FILTER NEWS
  // ==========================================================

  const visibleNews =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return newsFeed.filter(
        (article) => {
          const categoryMatch =
            activeCategory ===
              "all" ||
            article.category ===
              activeCategory;

          const searchMatch =
            !query ||
            `${article.title || ""} ${
              article.desc || ""
            } ${
              article.category || ""
            }`
              .toLowerCase()
              .includes(query);

          return (
            categoryMatch &&
            searchMatch
          );
        }
      );
    }, [
      newsFeed,
      search,
      activeCategory,
    ]);

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

    setEditing(null);

    setForm({
      ...blankNews,
    });

    setSelectedFile(null);

    setSelectedFileName("");

    setPreviewUrl("");
  };

  // ==========================================================
  // ADD
  // ==========================================================

  const startAdd = () => {
    resetEditor();

    setOpen(true);
  };

  // ==========================================================
  // EDIT
  // ==========================================================

  const startEdit = (
    article
  ) => {
    resetEditor();

    setEditing(
      article.id
    );

    setForm({
      title:
        article.title || "",

      desc:
        article.desc || "",

      category:
        article.category ||
        "general",

      link:
        article.link ||
        "/news",

      image:
        article.image || "",

      imagePublicId:
        article.imagePublicId ||
        "",

      featured:
        Boolean(
          article.featured
        ),
    });

    setPreviewUrl(
      article.image || ""
    );

    setOpen(true);
  };

  // ==========================================================
  // SELECT COMPUTER IMAGE
  // ==========================================================

  const selectImage = (
    event
  ) => {
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
        "Please select a JPG, PNG or WEBP image.",
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
        "Please select an image smaller than 5 MB.",
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

    const temporaryUrl =
      URL.createObjectURL(file);

    setSelectedFile(file);

    setSelectedFileName(
      file.name
    );

    setPreviewUrl(
      temporaryUrl
    );
  };

  // ==========================================================
  // SAVE
  // ==========================================================

  const save = async (
    event
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    if (
      !form.title.trim()
    ) {
      showStatus(
        "Please enter a headline.",
        "error"
      );

      return;
    }

    if (
      !form.desc.trim()
    ) {
      showStatus(
        "Please enter the news story.",
        "error"
      );

      return;
    }

    try {
      setSaving(true);

      let image =
        form.image || "";

      let imagePublicId =
        form.imagePublicId ||
        "";

      // ======================================================
      // CLOUDINARY
      // ======================================================

      if (selectedFile) {
        const uploadResponse =
          await mediaAPI.uploadImage(
            {
              file:
                selectedFile,

              folder:
                "news",
            }
          );

        if (
          !uploadResponse?.media
            ?.url
        ) {
          throw new Error(
            "The image uploaded but no Cloudinary URL was returned."
          );
        }

        image =
          uploadResponse.media.url;

        imagePublicId =
          uploadResponse.media
            .publicId || "";
      }

      const payload = {
        title:
          form.title.trim(),

        desc:
          form.desc.trim(),

        category:
          form.category,

        link:
          form.link ||
          "/news",

        image,

        imagePublicId,

        featured:
          Boolean(
            form.featured
          ),
      };

      // ======================================================
      // UPDATE
      // ======================================================

      if (editing) {
        const response =
          await newsAPI.update(
            editing,
            payload
          );

        const updated =
          response?.news;

        if (!updated) {
          throw new Error(
            "The backend did not return the updated article."
          );
        }

        setNewsFeed(
          (current) =>
            current.map(
              (article) =>
                article.id ===
                editing
                  ? updated
                  : article
            )
        );

        addSiteUpdate?.({
          title:
            "News Updated",

          desc:
            `${updated.title} was updated.`,

          category:
            "news",

          origin:
            "news",

          type:
            "news",

          link:
            "/news",

          showInNews:
            false,

          showInNotifications:
            true,
        });

        showStatus(
          "News updated successfully."
        );
      }

      // ======================================================
      // CREATE
      // ======================================================

      else {
        const response =
          await newsAPI.create(
            payload
          );

        const article =
          response?.news;

        if (!article) {
          throw new Error(
            "The backend did not return the published article."
          );
        }

        setNewsFeed(
          (current) => [
            article,
            ...current,
          ]
        );

        addSiteUpdate?.({
          title:
            article.title,

          desc:
            article.desc,

          category:
            article.category,

          origin:
            "news",

          type:
            "news",

          link:
            article.link ||
            "/news",

          showInNews:
            false,

          showInNotifications:
            true,
        });

        showStatus(
          "News published successfully."
        );
      }

      resetEditor();

      setOpen(false);
    } catch (error) {
      console.error(
        "SAVE NEWS ERROR:",
        error
      );

      showStatus(
        error?.message ||
          "The news article could not be saved.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const deleteNews = async (
    article
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${article.title}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        article.id
      );

      await newsAPI.remove(
        article.id
      );

      setNewsFeed(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              article.id
          )
      );

      addSiteUpdate?.({
        title:
          "News Removed",

        desc:
          `${article.title} was removed from the news feed.`,

        category:
          "news",

        origin:
          "news",

        type:
          "news",

        link:
          "/news",

        showInNews:
          false,

        showInNotifications:
          true,
      });

      showStatus(
        "News deleted successfully."
      );
    } catch (error) {
      console.error(
        "DELETE NEWS ERROR:",
        error
      );

      showStatus(
        error?.message ||
          "The article could not be deleted.",
        "error"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed px-4 py-10 text-white sm:px-6"
      style={{
        backgroundImage: `
          linear-gradient(
            rgba(0,0,0,.58),
            rgba(0,0,0,.65)
          ),
          url(${myBackground})
        `,
      }}
    >
      {/* STATUS */}

      {status && (
        <div
          className={`
            fixed right-4 top-24
            z-[20000]
            flex max-w-sm
            items-start gap-3
            rounded-2xl border
            p-4 shadow-2xl
            backdrop-blur-xl
            ${
              statusType ===
              "error"
                ? "border-red-500/40 bg-red-950/90"
                : "border-emerald-500/40 bg-emerald-950/90"
            }
          `}
        >
          {statusType ===
          "error" ? (
            <AlertCircle
              size={19}
              className="text-red-400"
            />
          ) : (
            <CheckCircle2
              size={19}
              className="text-emerald-400"
            />
          )}

          <p className="text-xs font-bold">
            {status}
          </p>

          <button
            type="button"
            onClick={() =>
              setStatus("")
            }
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.35em] text-orange-400">
              J-Town Media Centre
            </p>

            <h1 className="mt-2 flex items-center gap-3 text-4xl font-black sm:text-5xl">
              <Newspaper className="text-orange-500" />
              News Feed
            </h1>

            <p className="mt-2 text-neutral-400">
              Official stories,
              roster changes,
              game updates and
              J-Town Hoops news.
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={
                startAdd
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-black text-black transition hover:bg-orange-400"
            >
              <Plus
                size={18}
              />
              Publish News
            </button>
          )}
        </div>

        {/* SEARCH */}

        <div className="mb-5 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
            />

            <input
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Search news..."
              className="w-full rounded-xl border border-neutral-800 bg-black/75 py-3 pl-11 pr-4 outline-none focus:border-orange-500"
            />
          </div>

          <button
            type="button"
            onClick={
              loadNews
            }
            disabled={
              loading
            }
            className="flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-black/75 px-5 py-3 text-xs font-black uppercase text-neutral-300"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* CATEGORIES */}

        <div className="mb-7 flex gap-2 overflow-x-auto pb-2">
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
                className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-wider ${
                  activeCategory ===
                  category
                    ? "border-orange-500 bg-orange-500 text-black"
                    : "border-neutral-800 bg-black/75 text-neutral-400 hover:text-orange-400"
                }`}
              >
                {category}
              </button>
            )
          )}
        </div>

        {/* LOADING */}

        {loading && (
          <div className="flex min-h-64 items-center justify-center rounded-3xl border border-neutral-800 bg-black/75">
            <div className="text-center">
              <Loader2
                className="mx-auto animate-spin text-orange-500"
                size={35}
              />

              <p className="mt-3 text-xs font-black uppercase tracking-wider text-neutral-400">
                Loading News
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}

        {!loading &&
          loadError && (
            <div className="rounded-3xl border border-red-500/30 bg-red-950/30 p-8 text-center">
              <AlertCircle
                className="mx-auto text-red-400"
                size={34}
              />

              <p className="mt-3 font-bold">
                {loadError}
              </p>

              <button
                type="button"
                onClick={
                  loadNews
                }
                className="mt-4 rounded-xl bg-red-500 px-5 py-2 text-xs font-black"
              >
                Try Again
              </button>
            </div>
          )}

        {/* EMPTY */}

        {!loading &&
          !loadError &&
          visibleNews.length ===
            0 && (
            <div className="rounded-3xl border border-dashed border-neutral-700 bg-black/70 py-16 text-center">
              <Newspaper
                size={40}
                className="mx-auto text-neutral-600"
              />

              <h2 className="mt-4 text-xl font-black">
                No news found
              </h2>

              <p className="mt-2 text-sm text-neutral-500">
                {newsFeed.length ===
                0
                  ? "The MongoDB news feed is currently empty."
                  : "Try another search or category."}
              </p>
            </div>
          )}

        {/* NEWS */}

        {!loading &&
          !loadError && (
            <div className="space-y-5">
              {visibleNews.map(
                (article) => (
                  <article
                    key={
                      article.id
                    }
                    className={`overflow-hidden rounded-2xl border bg-black/80 shadow-xl transition hover:border-orange-500/50 ${
                      article.featured
                        ? "border-orange-500/50"
                        : "border-neutral-800"
                    }`}
                  >
                    {/* NEWS IMAGE */}

                    {article.image && (
                      <div className="relative h-52 overflow-hidden sm:h-72">
                        <img
                          src={
                            article.image
                          }
                          alt={
                            article.title
                          }
                          className="h-full w-full object-cover transition duration-700 hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                        {article.featured && (
                          <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase text-black">
                            <Star
                              size={
                                12
                              }
                              fill="currentColor"
                            />
                            Featured
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex gap-4">
                        <div className="h-fit rounded-xl bg-orange-500/10 p-3">
                          <Newspaper className="text-orange-400" />
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap justify-between gap-3">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                                {
                                  article.category
                                }
                              </span>

                              <h2 className="mt-1 text-xl font-black sm:text-2xl">
                                {
                                  article.title
                                }
                              </h2>
                            </div>

                            <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                              <Calendar
                                size={
                                  13
                                }
                              />

                              {article.date ||
                                (article.createdAt
                                  ? new Date(
                                      article.createdAt
                                    ).toLocaleDateString()
                                  : "")}
                            </span>
                          </div>

                          <p className="mt-4 whitespace-pre-line leading-relaxed text-neutral-300">
                            {
                              article.desc
                            }
                          </p>

                          {article.authorName && (
                            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                              Published by{" "}
                              {
                                article.authorName
                              }
                            </p>
                          )}

                          {isAdmin && (
                            <div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-800 pt-4">
                              <button
                                type="button"
                                onClick={() =>
                                  startEdit(
                                    article
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-400 transition hover:bg-orange-500 hover:text-black"
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
                                  article.id
                                }
                                onClick={() =>
                                  deleteNews(
                                    article
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                              >
                                {deletingId ===
                                article.id ? (
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
                  </article>
                )
              )}
            </div>
          )}
      </div>

      {/* ======================================================
          NEWS EDITOR
      ====================================================== */}

      {open && isAdmin && (
        <div className="fixed inset-0 z-[12000] overflow-y-auto bg-black/85 p-4 backdrop-blur-sm">
          <form
            onSubmit={save}
            className="mx-auto my-8 w-full max-w-2xl rounded-3xl border border-neutral-800 bg-[#111] p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.25em] text-orange-400">
                  J-Town Media
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  {editing
                    ? "Edit News"
                    : "Publish News"}
                </h2>
              </div>

              <button
                type="button"
                disabled={
                  saving
                }
                onClick={() => {
                  setOpen(false);
                  resetEditor();
                }}
                className="rounded-full bg-neutral-900 p-2 text-neutral-400 hover:text-white"
              >
                <X />
              </button>
            </div>

            <div className="mt-6 space-y-4">

              {/* HEADLINE */}

              <Field
                label="Headline"
                value={
                  form.title
                }
                set={(value) =>
                  setForm({
                    ...form,
                    title:
                      value,
                  })
                }
              />

              {/* CATEGORY */}

              <label className="block text-sm text-neutral-400">
                Category

                <select
                  value={
                    form.category
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      category:
                        event.target
                          .value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-white outline-none focus:border-orange-500"
                >
                  {categories
                    .filter(
                      (
                        category
                      ) =>
                        category !==
                        "all"
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

              {/* STORY */}

              <label className="block text-sm text-neutral-400">
                Story

                <textarea
                  rows="7"
                  value={
                    form.desc
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      desc:
                        event.target
                          .value,
                    })
                  }
                  className="mt-1 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-white outline-none focus:border-orange-500"
                  placeholder="Write the full J-Town Hoops story..."
                />
              </label>

              {/* IMAGE */}

              <div>
                <span className="text-sm text-neutral-400">
                  News Picture
                </span>

                <label className="mt-1 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-neutral-700 bg-neutral-950 p-4 text-neutral-400 transition hover:border-orange-500 hover:text-orange-400">
                  <UploadCloud
                    size={20}
                  />

                  <span className="truncate text-sm">
                    {selectedFileName ||
                      "Choose picture from computer"}
                  </span>

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={
                      selectImage
                    }
                    className="hidden"
                  />
                </label>

                <p className="mt-2 text-[10px] text-neutral-600">
                  JPG, PNG or WEBP
                  • maximum 5 MB •
                  uploaded through
                  Cloudinary
                </p>
              </div>

              {/* PREVIEW */}

              {previewUrl && (
                <div className="overflow-hidden rounded-2xl border border-neutral-800">
                  <img
                    src={
                      previewUrl
                    }
                    alt="News preview"
                    className="h-52 w-full object-cover"
                  />
                </div>
              )}

              {/* FEATURED */}

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <input
                  type="checkbox"
                  checked={
                    form.featured
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      featured:
                        event.target
                          .checked,
                    })
                  }
                  className="h-4 w-4"
                />

                <div>
                  <p className="text-sm font-bold text-white">
                    Featured Story
                  </p>

                  <p className="text-[10px] text-neutral-500">
                    Highlight this
                    article as an
                    important J-Town
                    Hoops story.
                  </p>
                </div>
              </label>
            </div>

            {/* SAVE */}

            <button
              disabled={
                saving
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  {selectedFile
                    ? "Uploading & Saving..."
                    : "Saving..."}
                </>
              ) : (
                <>
                  {previewUrl ? (
                    <ImageIcon
                      size={17}
                    />
                  ) : (
                    <Save
                      size={17}
                    />
                  )}

                  {editing
                    ? "Save Changes"
                    : "Publish News"}
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ============================================================
// FIELD
// ============================================================

function Field({
  label,
  value,
  set,
}) {
  return (
    <label className="block text-sm text-neutral-400">
      {label}

      <input
        value={value}
        onChange={(event) =>
          set(
            event.target.value
          )
        }
        className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-white outline-none focus:border-orange-500"
      />
    </label>
  );
}