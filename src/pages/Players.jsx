import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  User,
  Star,
  X,
  MapPin,
  Award,
  Plus,
  Pencil,
  Trash2,
  Search,
  Save,
  Upload,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

import playersBackground from "../images/mybackground4.jpg";
import jtownTeamLogo from "../images/jtownteamlogo.jpg";

import {
  playerAPI,
  mediaAPI,
} from "../services/api";

import { useAuth } from "../context/AuthContext";


// ============================================================
// EMPTY PLAYER FORM
// ============================================================

const blankPlayer = {
  name: "",
  number: "",
  position: "Point Guard",

  age: "",

  avatar: "",

  ppg: 0,
  apg: 0,
  rpg: 0,

  status: "Active",

  isAllStar: false,

  bio: "",

  height: "",
  weight: "",

  hometown: "",
  experience: "",
  college: "",
};


// ============================================================
// NORMALIZE PLAYER
// ============================================================
//
// MongoDB uses:
// _id
//
// Older frontend code used:
// id
//
// We support both.
//
// ============================================================

function normalizePlayer(
  player
) {
  if (!player) {
    return null;
  }

  return {
    ...player,

    id:
      player._id ||
      player.id,

    avatar:
      player.avatar ||
      "",

    stats: {
      ppg:
        Number(
          player.stats?.ppg
        ) || 0,

      apg:
        Number(
          player.stats?.apg
        ) || 0,

      rpg:
        Number(
          player.stats?.rpg
        ) || 0,
    },
  };
}


// ============================================================
// EXTRACT CLOUDINARY URL
// ============================================================
//
// Supports our CURRENT backend:
//
// response.media.url
//
// And fallback formats:
//
// response.url
// response.secureUrl
// response.image.url
// response.file.url
//
// This prevents the Teams upload bug from happening again.
//
// ============================================================

function getUploadedImageUrl(
  response
) {
  return (
    response?.media?.url ||
    response?.media?.secureUrl ||
    response?.media?.secure_url ||

    response?.url ||
    response?.secureUrl ||
    response?.secure_url ||

    response?.image?.url ||
    response?.image?.secureUrl ||
    response?.image?.secure_url ||

    response?.file?.url ||
    response?.file?.secureUrl ||
    response?.file?.secure_url ||

    ""
  );
}


// ============================================================
// PLAYERS PAGE
// ============================================================

export default function Players() {
  const { isAdmin } =
    useAuth();

  // ==========================================================
  // DATA
  // ==========================================================

  const [
    players,
    setPlayers,
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
  // FILTERS
  // ==========================================================

  const [
    statFilter,
    setStatFilter,
  ] = useState("ppg");

  const [
    search,
    setSearch,
  ] = useState("");


  // ==========================================================
  // PROFILE MODAL
  // ==========================================================

  const [
    selectedPlayer,
    setSelectedPlayer,
  ] = useState(null);


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
    form,
    setForm,
  ] = useState({
    ...blankPlayer,
  });


  // ==========================================================
  // IMAGE UPLOAD
  // ==========================================================

  const [
    selectedPhotoFile,
    setSelectedPhotoFile,
  ] = useState(null);

  const [
    photoPreview,
    setPhotoPreview,
  ] = useState("");

  const [
    uploadingPhoto,
    setUploadingPhoto,
  ] = useState(false);


  // ==========================================================
  // SAVE / DELETE STATE
  // ==========================================================

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);


  // ==========================================================
  // MESSAGES
  // ==========================================================

  const [
    editorError,
    setEditorError,
  ] = useState("");

  const [
    editorSuccess,
    setEditorSuccess,
  ] = useState("");

  const [
    pageMessage,
    setPageMessage,
  ] = useState("");


  // ==========================================================
  // LOAD PLAYERS
  // ==========================================================

  const loadPlayers =
    async () => {
      try {
        setLoading(true);

        setLoadError("");

        const response =
          await playerAPI.getAll();

        const incomingPlayers =
          Array.isArray(
            response?.players
          )
            ? response.players
            : [];

        setPlayers(
          incomingPlayers
            .map(normalizePlayer)
            .filter(Boolean)
        );
      } catch (error) {
        console.error(
          "LOAD PLAYERS ERROR:",
          error
        );

        setLoadError(
          error?.message ||
            "Could not load players."
        );
      } finally {
        setLoading(false);
      }
    };


  // ==========================================================
  // LOAD ON PAGE OPEN
  // ==========================================================

  useEffect(() => {
    loadPlayers();
  }, []);


  // ==========================================================
  // CLEAN PREVIEW OBJECT URL
  // ==========================================================

  useEffect(() => {
    return () => {
      if (
        photoPreview?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          photoPreview
        );
      }
    };
  }, [photoPreview]);


  // ==========================================================
  // FILTER / SORT
  // ==========================================================

  const visiblePlayers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return [...players]
        .filter((player) => {
          const searchable =
            `
              ${player.name || ""}
              ${player.position || ""}
              ${player.status || ""}
              ${player.number || ""}
              ${player.hometown || ""}
              ${player.college || ""}
              ${player.age ?? ""}
            `.toLowerCase();

          return searchable.includes(
            query
          );
        })
        .sort(
          (a, b) =>
            (b.stats?.[
              statFilter
            ] || 0) -
            (a.stats?.[
              statFilter
            ] || 0)
        );
    }, [
      players,
      search,
      statFilter,
    ]);


  // ==========================================================
  // OPEN ADD PLAYER
  // ==========================================================

  const openAdd = () => {
    setEditingId(null);

    setForm({
      ...blankPlayer,
    });

    setSelectedPhotoFile(
      null
    );

    setPhotoPreview("");

    setEditorError("");

    setEditorSuccess("");

    setShowEditor(true);
  };


  // ==========================================================
  // OPEN EDIT PLAYER
  // ==========================================================

  const openEdit = (
    player
  ) => {
    setEditingId(
      player.id
    );

    setForm({
      name:
        player.name || "",

      number:
        player.number || "",

      position:
        player.position ||
        "Point Guard",

      age:
        player.age ?? "",

      avatar:
        player.avatar || "",

      ppg:
        player.stats?.ppg ??
        0,

      apg:
        player.stats?.apg ??
        0,

      rpg:
        player.stats?.rpg ??
        0,

      status:
        player.status ||
        "Active",

      isAllStar:
        Boolean(
          player.isAllStar
        ),

      bio:
        player.bio || "",

      height:
        player.height || "",

      weight:
        player.weight || "",

      hometown:
        player.hometown || "",

      experience:
        player.experience || "",

      college:
        player.college || "",
    });

    setSelectedPhotoFile(
      null
    );

    setPhotoPreview(
      player.avatar || ""
    );

    setEditorError("");

    setEditorSuccess("");

    setShowEditor(true);
  };


  // ==========================================================
  // CLOSE EDITOR
  // ==========================================================

  const closeEditor = () => {
    if (
      saving ||
      uploadingPhoto
    ) {
      return;
    }

    setShowEditor(false);

    setEditingId(null);

    setSelectedPhotoFile(
      null
    );

    setPhotoPreview("");

    setEditorError("");

    setEditorSuccess("");
  };


  // ==========================================================
  // SELECT PHOTO FROM COMPUTER
  // ==========================================================

  const handlePhotoSelection =
    (event) => {
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
        setEditorError(
          "Please choose a JPG, JPEG, PNG or WEBP image."
        );

        event.target.value =
          "";

        return;
      }

      const maximumSize =
        5 * 1024 * 1024;

      if (
        file.size >
        maximumSize
      ) {
        setEditorError(
          "The player photo must be smaller than 5 MB."
        );

        event.target.value =
          "";

        return;
      }

      if (
        photoPreview?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          photoPreview
        );
      }

      const preview =
        URL.createObjectURL(
          file
        );

      setSelectedPhotoFile(
        file
      );

      setPhotoPreview(
        preview
      );

      setEditorError("");

      setEditorSuccess(
        "Photo selected. It will upload when you save the player."
      );
    };


  // ==========================================================
  // UPLOAD SELECTED PHOTO
  // ==========================================================

  const uploadSelectedPhoto =
    async () => {
      if (!selectedPhotoFile) {
        if (form.avatar) {
          return form.avatar;
        }

        throw new Error(
          "Please choose a player photo first."
        );
      }

      try {
        setUploadingPhoto(
          true
        );

        setEditorError("");

        setEditorSuccess(
          "Uploading player photo..."
        );

        const response =
          await mediaAPI.uploadImage({
            file:
              selectedPhotoFile,

            folder:
              "players",
          });

        const uploadedUrl =
          getUploadedImageUrl(
            response
          );

        if (!uploadedUrl) {
          throw new Error(
            "The image uploaded, but the backend did not return its Cloudinary URL."
          );
        }

        setForm(
          (previous) => ({
            ...previous,

            avatar:
              uploadedUrl,
          })
        );

        setSelectedPhotoFile(
          null
        );

        setPhotoPreview(
          uploadedUrl
        );

        setEditorSuccess(
          "Player photo uploaded successfully."
        );

        return uploadedUrl;
      } finally {
        setUploadingPhoto(
          false
        );
      }
    };


  // ==========================================================
  // MANUAL UPLOAD BUTTON
  // ==========================================================

  const handleManualUpload =
    async () => {
      try {
        await uploadSelectedPhoto();
      } catch (error) {
        console.error(
          "PLAYER PHOTO UPLOAD ERROR:",
          error
        );

        setEditorError(
          error?.message ||
            "Could not upload the player photo."
        );

        setEditorSuccess("");
      }
    };


  // ==========================================================
  // BUILD PLAYER PAYLOAD
  // ==========================================================

  const buildPayload = (
    avatarUrl
  ) => {
    const cleanAge =
      form.age === "" ||
      form.age === null
        ? null
        : Number(form.age);

    return {
      name:
        form.name.trim(),

      number:
        String(
          form.number || ""
        ).trim(),

      position:
        String(
          form.position ||
            "Point Guard"
        ).trim(),

      age:
        cleanAge,

      status:
        form.status ||
        "Active",

      avatar:
        String(
          avatarUrl || ""
        ).trim(),

      stats: {
        ppg:
          Math.max(
            0,
            Number(form.ppg) ||
              0
          ),

        apg:
          Math.max(
            0,
            Number(form.apg) ||
              0
          ),

        rpg:
          Math.max(
            0,
            Number(form.rpg) ||
              0
          ),
      },

      isAllStar:
        Boolean(
          form.isAllStar
        ),

      bio:
        String(
          form.bio || ""
        ).trim(),

      height:
        String(
          form.height || ""
        ).trim(),

      weight:
        String(
          form.weight || ""
        ).trim(),

      hometown:
        String(
          form.hometown || ""
        ).trim(),

      experience:
        String(
          form.experience || ""
        ).trim(),

      college:
        String(
          form.college || ""
        ).trim(),
    };
  };


  // ==========================================================
  // SAVE PLAYER
  // ==========================================================

  const savePlayer =
    async (event) => {
      event.preventDefault();

      if (
        !form.name.trim()
      ) {
        setEditorError(
          "Player name is required."
        );

        return;
      }

      if (
        form.age !== "" &&
        form.age !== null
      ) {
        const numericAge =
          Number(form.age);

        if (
          !Number.isFinite(
            numericAge
          ) ||
          numericAge < 5 ||
          numericAge > 100
        ) {
          setEditorError(
            "Player age must be between 5 and 100."
          );

          return;
        }
      }

      try {
        setSaving(true);

        setEditorError("");

        setEditorSuccess(
          "Saving player..."
        );

        // ====================================================
        // AUTO-UPLOAD COMPUTER PHOTO
        // ====================================================

        let finalAvatar =
          form.avatar || "";

        if (
          selectedPhotoFile
        ) {
          finalAvatar =
            await uploadSelectedPhoto();
        }

        // ====================================================
        // BUILD DATA
        // ====================================================

        const payload =
          buildPayload(
            finalAvatar
          );

        // ====================================================
        // CREATE / UPDATE
        // ====================================================

        let response;

        if (editingId) {
          response =
            await playerAPI.update(
              editingId,
              payload
            );
        } else {
          response =
            await playerAPI.create(
              payload
            );
        }

        const savedPlayer =
          normalizePlayer(
            response?.player
          );

        // ====================================================
        // UPDATE SCREEN IMMEDIATELY
        // ====================================================

        if (savedPlayer) {
          setPlayers(
            (previous) => {
              if (editingId) {
                return previous.map(
                  (player) =>
                    player.id ===
                    editingId
                      ? savedPlayer
                      : player
                );
              }

              return [
                ...previous,
                savedPlayer,
              ];
            }
          );
        } else {
          await loadPlayers();
        }

        setPageMessage(
          editingId
            ? "Player updated successfully."
            : "Player added successfully."
        );

        setShowEditor(false);

        setEditingId(null);

        setSelectedPhotoFile(
          null
        );

        setPhotoPreview("");

        setEditorError("");

        setEditorSuccess("");

        window.setTimeout(
          () => {
            setPageMessage("");
          },
          4000
        );
      } catch (error) {
        console.error(
          "SAVE PLAYER ERROR:",
          error
        );

        setEditorError(
          error?.message ||
            "Could not save the player."
        );

        setEditorSuccess("");
      } finally {
        setSaving(false);
      }
    };


  // ==========================================================
  // DELETE PLAYER
  // ==========================================================

  const deletePlayer =
    async (player) => {
      const confirmed =
        window.confirm(
          `Remove ${player.name} from the J-Town Hoops Players Hub?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          player.id
        );

        await playerAPI.remove(
          player.id
        );

        setPlayers(
          (previous) =>
            previous.filter(
              (item) =>
                item.id !==
                player.id
            )
        );

        if (
          selectedPlayer?.id ===
          player.id
        ) {
          setSelectedPlayer(
            null
          );
        }

        setPageMessage(
          `${player.name} was removed successfully.`
        );

        window.setTimeout(
          () => {
            setPageMessage("");
          },
          4000
        );
      } catch (error) {
        console.error(
          "DELETE PLAYER ERROR:",
          error
        );

        window.alert(
          error?.message ||
            "Could not delete the player."
        );
      } finally {
        setDeletingId(
          null
        );
      }
    };


  // ==========================================================
  // IMAGE FALLBACK
  // ==========================================================

  const handleImageError =
    (event) => {
      if (
        event.currentTarget.src !==
        jtownTeamLogo
      ) {
        event.currentTarget.src =
          jtownTeamLogo;
      }
    };


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div
      className="
        min-h-screen
        text-white
        px-4
        sm:px-6
        py-10
        bg-cover
        bg-center
        bg-fixed
      "
      style={{
        backgroundImage:
          `linear-gradient(rgba(5,5,5,.58),rgba(5,5,5,.65)),url(${playersBackground})`,
      }}
    >
      <div className="max-w-7xl mx-auto">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-end
            lg:justify-between
            gap-5
            mb-8
          "
        >
          <div>
            <p
              className="
                text-orange-400
                text-xs
                font-black
                uppercase
                tracking-[.35em]
              "
            >
              J-Town Hoops • Roster Control
            </p>

            <h1
              className="
                text-4xl
                sm:text-5xl
                font-black
                uppercase
                mt-2
              "
            >
              Players{" "}
              <span className="text-orange-500">
                Hub
              </span>
            </h1>

            <p className="text-neutral-400 mt-2 max-w-2xl">
              Explore J-Town Hoops player profiles,
              statistics and basketball information.
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={openAdd}
              className="
                cursor-pointer
                inline-flex
                items-center
                justify-center
                gap-2
                bg-orange-500
                hover:bg-orange-400
                text-black
                font-black
                px-5
                py-3
                rounded-xl
                shadow-lg
                shadow-orange-500/20
                transition
              "
            >
              <Plus size={18} />

              Add Player
            </button>
          )}
        </div>


        {/* ====================================================
            SUCCESS MESSAGE
        ==================================================== */}

        {pageMessage && (
          <div
            className="
              mb-6
              bg-green-500/10
              border
              border-green-500/30
              text-green-300
              rounded-xl
              p-4
              flex
              items-center
              gap-3
            "
          >
            <CheckCircle2 size={20} />

            {pageMessage}
          </div>
        )}


        {/* ====================================================
            SEARCH / STAT FILTER
        ==================================================== */}

        <div
          className="
            grid
            md:grid-cols-[1fr_auto]
            gap-4
            mb-7
          "
        >
          <div className="relative">
            <Search
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-neutral-500
              "
              size={18}
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search player, position, status, age, hometown..."
              className="
                w-full
                bg-black/70
                border
                border-neutral-800
                rounded-xl
                py-3
                pl-11
                pr-4
                outline-none
                focus:border-orange-500
              "
            />
          </div>

          <div
            className="
              flex
              gap-2
              bg-black/70
              border
              border-neutral-800
              rounded-xl
              p-1
            "
          >
            {[
              "ppg",
              "apg",
              "rpg",
            ].map((stat) => (
              <button
                key={stat}
                type="button"
                onClick={() =>
                  setStatFilter(
                    stat
                  )
                }
                className={`
                  cursor-pointer
                  px-4
                  py-2
                  rounded-lg
                  uppercase
                  text-xs
                  font-black
                  transition

                  ${
                    statFilter ===
                    stat
                      ? "bg-orange-500 text-black"
                      : "text-neutral-300 hover:bg-neutral-900"
                  }
                `}
              >
                {stat}
              </button>
            ))}
          </div>
        </div>


        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div
            className="
              min-h-[320px]
              flex
              flex-col
              items-center
              justify-center
              bg-black/50
              border
              border-neutral-800
              rounded-3xl
            "
          >
            <Loader2
              className="
                animate-spin
                text-orange-500
              "
              size={38}
            />

            <p className="text-neutral-400 mt-4">
              Loading J-Town Hoops players...
            </p>
          </div>
        )}


        {/* ====================================================
            LOAD ERROR
        ==================================================== */}

        {!loading &&
          loadError && (
            <div
              className="
                bg-red-500/10
                border
                border-red-500/30
                rounded-2xl
                p-6
                text-center
              "
            >
              <AlertCircle
                className="
                  mx-auto
                  text-red-400
                "
                size={34}
              />

              <p className="mt-3 text-red-300">
                {loadError}
              </p>

              <button
                type="button"
                onClick={loadPlayers}
                className="
                  cursor-pointer
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  bg-orange-500
                  text-black
                  font-black
                  px-5
                  py-3
                  rounded-xl
                "
              >
                <RefreshCw
                  size={17}
                />

                Try Again
              </button>
            </div>
          )}


        {/* ====================================================
            EMPTY PLAYERS
        ==================================================== */}

        {!loading &&
          !loadError &&
          visiblePlayers.length ===
            0 && (
            <div
              className="
                min-h-[320px]
                flex
                flex-col
                items-center
                justify-center
                text-center
                bg-black/60
                border
                border-neutral-800
                rounded-3xl
                p-8
              "
            >
              <User
                className="text-orange-500"
                size={44}
              />

              <h2
                className="
                  text-2xl
                  font-black
                  mt-4
                "
              >
                {players.length === 0
                  ? "No players yet"
                  : "No matching players"}
              </h2>

              <p
                className="
                  text-neutral-400
                  mt-2
                  max-w-md
                "
              >
                {players.length === 0
                  ? isAdmin
                    ? "Use Add Player to create the first J-Town Hoops player profile."
                    : "Player profiles will appear here when they are added."
                  : "Try changing your search."}
              </p>

              {isAdmin &&
                players.length ===
                  0 && (
                  <button
                    type="button"
                    onClick={openAdd}
                    className="
                      cursor-pointer
                      mt-6
                      bg-orange-500
                      hover:bg-orange-400
                      text-black
                      font-black
                      px-5
                      py-3
                      rounded-xl
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <Plus
                      size={18}
                    />

                    Add First Player
                  </button>
                )}
            </div>
          )}


        {/* ====================================================
            PLAYER CARDS
        ==================================================== */}

        {!loading &&
          !loadError &&
          visiblePlayers.length >
            0 && (
            <div
              className="
                grid
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
                gap-5
              "
            >
              {visiblePlayers.map(
                (player) => (
                  <article
                    key={
                      player.id
                    }
                    className="
                      group
                      bg-black/75
                      border
                      border-neutral-800
                      hover:border-orange-500/60
                      rounded-2xl
                      overflow-hidden
                      shadow-xl
                      transition-all
                      hover:-translate-y-1
                    "
                  >
                    {/* PHOTO */}

                    <div
                      className="
                        relative
                        h-56
                        overflow-hidden
                      "
                    >
                      <img
                        src={
                          player.avatar ||
                          jtownTeamLogo
                        }
                        alt={
                          player.name
                        }
                        onError={
                          handleImageError
                        }
                        className="
                          w-full
                          h-full
                          object-cover
                          group-hover:scale-105
                          transition-transform
                          duration-500
                        "
                      />

                      <div
                        className="
                          absolute
                          inset-0
                          bg-gradient-to-t
                          from-black
                          via-transparent
                          to-transparent
                        "
                      />

                      {player.isAllStar && (
                        <span
                          className="
                            absolute
                            top-3
                            left-3
                            bg-orange-500
                            text-black
                            text-[10px]
                            font-black
                            px-2
                            py-1
                            rounded-full
                            flex
                            gap-1
                            items-center
                          "
                        >
                          <Star
                            size={11}
                            fill="currentColor"
                          />

                          ALL STAR
                        </span>
                      )}

                      {player.age !==
                        null &&
                        player.age !==
                          undefined && (
                          <span
                            className="
                              absolute
                              top-3
                              right-3
                              bg-black/75
                              border
                              border-white/10
                              text-white
                              text-[10px]
                              font-black
                              px-2
                              py-1
                              rounded-full
                            "
                          >
                            AGE{" "}
                            {
                              player.age
                            }
                          </span>
                        )}

                      <span
                        className="
                          absolute
                          bottom-3
                          left-4
                          text-4xl
                          font-black
                          text-white/25
                        "
                      >
                        #
                        {
                          player.number
                        }
                      </span>
                    </div>


                    {/* INFORMATION */}

                    <div className="p-5">
                      <h2
                        className="
                          text-xl
                          font-black
                        "
                      >
                        {
                          player.name
                        }
                      </h2>

                      <p
                        className="
                          text-orange-400
                          text-xs
                          uppercase
                          font-bold
                          mt-1
                        "
                      >
                        {
                          player.position
                        }
                      </p>

                      <p
                        className="
                          text-neutral-500
                          text-xs
                          mt-1
                        "
                      >
                        {
                          player.status
                        }
                      </p>

                      <div
                        className="
                          grid
                          grid-cols-3
                          gap-2
                          my-4
                        "
                      >
                        {[
                          "ppg",
                          "apg",
                          "rpg",
                        ].map(
                          (
                            stat
                          ) => (
                            <div
                              key={
                                stat
                              }
                              className="
                                bg-neutral-900
                                rounded-lg
                                p-2
                                text-center
                              "
                            >
                              <div className="font-black">
                                {player
                                  .stats?.[
                                  stat
                                ] ??
                                  0}
                              </div>

                              <div
                                className="
                                  text-[9px]
                                  text-neutral-500
                                  uppercase
                                "
                              >
                                {
                                  stat
                                }
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedPlayer(
                              player
                            )
                          }
                          className="
                            cursor-pointer
                            flex-1
                            bg-white/5
                            hover:bg-white/10
                            rounded-lg
                            py-2
                            text-xs
                            font-bold
                          "
                        >
                          Profile
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() =>
                              openEdit(
                                player
                              )
                            }
                            className="
                              cursor-pointer
                              p-2
                              bg-orange-500/10
                              text-orange-400
                              rounded-lg
                              hover:bg-orange-500
                              hover:text-black
                            "
                            title="Edit player"
                          >
                            <Pencil
                              size={16}
                            />
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            type="button"
                            disabled={
                              deletingId ===
                              player.id
                            }
                            onClick={() =>
                              deletePlayer(
                                player
                              )
                            }
                            className="
                              cursor-pointer
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                              p-2
                              bg-red-500/10
                              text-red-400
                              rounded-lg
                              hover:bg-red-500
                              hover:text-white
                            "
                            title="Delete player"
                          >
                            {deletingId ===
                            player.id ? (
                              <Loader2
                                size={
                                  16
                                }
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={
                                  16
                                }
                              />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
      </div>


      {/* ======================================================
          PLAYER PROFILE MODAL
      ====================================================== */}

      {selectedPlayer && (
        <div
          className="
            fixed
            inset-0
            z-[12000]
            bg-black/80
            backdrop-blur-sm
            p-4
            flex
            items-center
            justify-center
            overflow-y-auto
          "
          onClick={() =>
            setSelectedPlayer(
              null
            )
          }
        >
          <div
            className="
              w-full
              max-w-2xl
              bg-[#111]
              border
              border-neutral-800
              rounded-3xl
              p-6
              sm:p-8
              relative
              my-8
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={() =>
                setSelectedPlayer(
                  null
                )
              }
              className="
                cursor-pointer
                absolute
                right-5
                top-5
                text-neutral-400
                hover:text-white
              "
            >
              <X />
            </button>

            <div
              className="
                flex
                flex-col
                sm:flex-row
                gap-6
              "
            >
              <img
                src={
                  selectedPlayer.avatar ||
                  jtownTeamLogo
                }
                alt={
                  selectedPlayer.name
                }
                onError={
                  handleImageError
                }
                className="
                  w-32
                  h-32
                  rounded-2xl
                  object-cover
                  border
                  border-neutral-800
                "
              />

              <div className="pr-8">
                <p
                  className="
                    text-orange-400
                    font-black
                  "
                >
                  #
                  {
                    selectedPlayer.number
                  }
                </p>

                <h2
                  className="
                    text-3xl
                    font-black
                  "
                >
                  {
                    selectedPlayer.name
                  }
                </h2>

                <p className="text-neutral-400">
                  {
                    selectedPlayer.position
                  }
                </p>

                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                    mt-3
                  "
                >
                  {selectedPlayer.age !==
                    null &&
                    selectedPlayer.age !==
                      undefined && (
                      <span
                        className="
                          bg-orange-500/10
                          text-orange-300
                          border
                          border-orange-500/20
                          rounded-full
                          px-3
                          py-1
                          text-xs
                          font-bold
                        "
                      >
                        Age{" "}
                        {
                          selectedPlayer.age
                        }
                      </span>
                    )}

                  <span
                    className="
                      bg-white/5
                      text-neutral-300
                      border
                      border-white/10
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-bold
                    "
                  >
                    {
                      selectedPlayer.status
                    }
                  </span>

                  {selectedPlayer.isAllStar && (
                    <span
                      className="
                        bg-orange-500
                        text-black
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        font-black
                        flex
                        items-center
                        gap-1
                      "
                    >
                      <Star
                        size={12}
                        fill="currentColor"
                      />

                      All Star
                    </span>
                  )}
                </div>
              </div>
            </div>


            {/* BIO */}

            {selectedPlayer.bio && (
              <p
                className="
                  mt-6
                  text-neutral-300
                  leading-relaxed
                "
              >
                {
                  selectedPlayer.bio
                }
              </p>
            )}


            {/* PROFILE DETAILS */}

            <div
              className="
                grid
                sm:grid-cols-2
                gap-3
                mt-6
                text-sm
              "
            >
              <ProfileInfo
                icon={CalendarDays}
                label="Age"
                value={
                  selectedPlayer.age ??
                  "Not provided"
                }
              />

              <ProfileInfo
                icon={MapPin}
                label="Hometown"
                value={
                  selectedPlayer.hometown ||
                  "Not provided"
                }
              />

              <ProfileInfo
                icon={Award}
                label="College"
                value={
                  selectedPlayer.college ||
                  "Not provided"
                }
              />

              <ProfileInfo
                icon={User}
                label="Height / Weight"
                value={
                  `${selectedPlayer.height || "—"} • ${selectedPlayer.weight || "—"}`
                }
              />

              <ProfileInfo
                icon={Star}
                label="Experience"
                value={
                  selectedPlayer.experience ||
                  "Not provided"
                }
              />

              <ProfileInfo
                icon={Award}
                label="Status"
                value={
                  selectedPlayer.status ||
                  "Active"
                }
              />
            </div>


            {/* STATS */}

            <div
              className="
                grid
                grid-cols-3
                gap-3
                mt-6
              "
            >
              {[
                "ppg",
                "apg",
                "rpg",
              ].map((stat) => (
                <div
                  key={stat}
                  className="
                    bg-neutral-900
                    border
                    border-neutral-800
                    rounded-xl
                    p-4
                    text-center
                  "
                >
                  <p
                    className="
                      text-2xl
                      font-black
                      text-orange-400
                    "
                  >
                    {selectedPlayer
                      .stats?.[
                      stat
                    ] ?? 0}
                  </p>

                  <p
                    className="
                      text-neutral-500
                      uppercase
                      text-xs
                      font-bold
                      mt-1
                    "
                  >
                    {stat}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* ======================================================
          ADD / EDIT PLAYER
      ====================================================== */}

      {showEditor &&
        isAdmin && (
          <Editor
            title={
              editingId
                ? "Edit Player"
                : "Add Player"
            }
            onClose={
              closeEditor
            }
            onSubmit={
              savePlayer
            }
            saving={
              saving
            }
          >

            {/* ================================================
                PLAYER PHOTO
            ================================================ */}

            <div
              className="
                md:col-span-2
                bg-neutral-950
                border
                border-neutral-800
                rounded-2xl
                p-4
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  mb-4
                "
              >
                <ImageIcon
                  className="text-orange-400"
                  size={20}
                />

                <h3 className="font-black">
                  Player Photo
                </h3>
              </div>

              <div
                className="
                  grid
                  md:grid-cols-[150px_1fr]
                  gap-5
                  items-start
                "
              >
                {/* PREVIEW */}

                <div
                  className="
                    w-[150px]
                    h-[150px]
                    rounded-2xl
                    overflow-hidden
                    border
                    border-neutral-800
                    bg-black
                  "
                >
                  <img
                    src={
                      photoPreview ||
                      form.avatar ||
                      jtownTeamLogo
                    }
                    alt="Player preview"
                    onError={
                      handleImageError
                    }
                    className="
                      w-full
                      h-full
                      object-cover
                    "
                  />
                </div>


                {/* CONTROLS */}

                <div>
                  <label
                    className="
                      block
                      text-sm
                      text-neutral-400
                      mb-2
                    "
                  >
                    Choose a picture
                    directly from your
                    computer
                  </label>

                  <input
                    type="file"
                    accept="
                      image/jpeg,
                      image/png,
                      image/webp
                    "
                    onChange={
                      handlePhotoSelection
                    }
                    className="
                      block
                      w-full
                      text-sm
                      text-neutral-400
                      file:cursor-pointer
                      file:mr-4
                      file:py-2
                      file:px-4
                      file:rounded-xl
                      file:border-0
                      file:bg-orange-500
                      file:text-black
                      file:font-black
                    "
                  />

                  {selectedPhotoFile && (
                    <p
                      className="
                        text-xs
                        text-neutral-500
                        mt-2
                      "
                    >
                      Selected:{" "}
                      {
                        selectedPhotoFile.name
                      }
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={
                      handleManualUpload
                    }
                    disabled={
                      !selectedPhotoFile ||
                      uploadingPhoto ||
                      saving
                    }
                    className="
                      cursor-pointer
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                      mt-3
                      inline-flex
                      items-center
                      gap-2
                      bg-white/10
                      hover:bg-white/15
                      border
                      border-neutral-700
                      rounded-xl
                      px-4
                      py-2
                      text-sm
                      font-bold
                    "
                  >
                    {uploadingPhoto ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Upload
                        size={16}
                      />
                    )}

                    {uploadingPhoto
                      ? "Uploading..."
                      : "Upload Photo"}
                  </button>

                  <p
                    className="
                      text-xs
                      text-neutral-600
                      mt-3
                    "
                  >
                    JPG, PNG or WEBP.
                    Maximum 5 MB. You
                    can also simply
                    choose the photo
                    and press Save
                    Player — it will
                    upload
                    automatically.
                  </p>
                </div>
              </div>


              {/* MANUAL URL */}

              <div className="mt-5">
                <label
                  className="
                    text-sm
                    text-neutral-400
                  "
                >
                  Or paste an existing
                  image URL
                </label>

                <input
                  type="url"
                  value={
                    form.avatar
                  }
                  onChange={(
                    event
                  ) => {
                    const value =
                      event.target
                        .value;

                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        avatar:
                          value,
                      })
                    );

                    if (
                      !selectedPhotoFile
                    ) {
                      setPhotoPreview(
                        value
                      );
                    }
                  }}
                  placeholder="https://..."
                  className="
                    mt-1
                    w-full
                    bg-black
                    border
                    border-neutral-800
                    rounded-xl
                    p-3
                    outline-none
                    focus:border-orange-500
                  "
                />
              </div>
            </div>


            {/* ================================================
                FORM FIELDS
            ================================================ */}

            <Field
              label="Name"
              value={form.name}
              onChange={(value) =>
                setForm({
                  ...form,
                  name: value,
                })
              }
              required
            />

            <Field
              label="Jersey Number"
              value={
                form.number
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  number:
                    value,
                })
              }
            />

            <SelectField
              label="Position"
              value={
                form.position
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  position:
                    value,
                })
              }
              options={[
                "Point Guard",
                "Shooting Guard",
                "Small Forward",
                "Power Forward",
                "Center",
                "Guard",
                "Forward",
              ]}
            />

            <Field
              label="Age"
              type="number"
              min="5"
              max="100"
              step="1"
              value={form.age}
              onChange={(value) =>
                setForm({
                  ...form,
                  age: value,
                })
              }
            />

            <SelectField
              label="Status"
              value={
                form.status
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  status:
                    value,
                })
              }
              options={[
                "Active",
                "Inactive",
                "Injured",
                "Suspended",
              ]}
            />

            <Field
              label="PPG"
              type="number"
              min="0"
              step="0.1"
              value={form.ppg}
              onChange={(value) =>
                setForm({
                  ...form,
                  ppg: value,
                })
              }
            />

            <Field
              label="APG"
              type="number"
              min="0"
              step="0.1"
              value={form.apg}
              onChange={(value) =>
                setForm({
                  ...form,
                  apg: value,
                })
              }
            />

            <Field
              label="RPG"
              type="number"
              min="0"
              step="0.1"
              value={form.rpg}
              onChange={(value) =>
                setForm({
                  ...form,
                  rpg: value,
                })
              }
            />

            <Field
              label="Height"
              placeholder="Example: 6'4&quot;"
              value={
                form.height
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  height:
                    value,
                })
              }
            />

            <Field
              label="Weight"
              placeholder="Example: 85 kg"
              value={
                form.weight
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  weight:
                    value,
                })
              }
            />

            <Field
              label="Hometown"
              value={
                form.hometown
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  hometown:
                    value,
                })
              }
            />

            <Field
              label="Experience"
              placeholder="Example: 3 years"
              value={
                form.experience
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  experience:
                    value,
                })
              }
            />

            <Field
              label="College / School"
              value={
                form.college
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  college:
                    value,
                })
              }
            />


            {/* BIOGRAPHY */}

            <label
              className="
                md:col-span-2
                text-sm
              "
            >
              <span className="text-neutral-400">
                Biography
              </span>

              <textarea
                value={form.bio}
                onChange={(event) =>
                  setForm({
                    ...form,

                    bio:
                      event.target
                        .value,
                  })
                }
                rows={4}
                placeholder="Tell visitors about this player..."
                className="
                  mt-1
                  w-full
                  bg-neutral-950
                  border
                  border-neutral-800
                  rounded-xl
                  p-3
                  outline-none
                  focus:border-orange-500
                  resize-y
                "
              />
            </label>


            {/* ALL STAR */}

            <label
              className="
                md:col-span-2
                flex
                items-center
                gap-3
                bg-neutral-950
                border
                border-neutral-800
                rounded-xl
                p-4
                cursor-pointer
              "
            >
              <input
                type="checkbox"
                checked={
                  form.isAllStar
                }
                onChange={(
                  event
                ) =>
                  setForm({
                    ...form,

                    isAllStar:
                      event
                        .target
                        .checked,
                  })
                }
                className="
                  w-4
                  h-4
                  accent-orange-500
                "
              />

              <Star
                className="text-orange-400"
                size={18}
              />

              <span className="font-bold">
                All-Star player
              </span>
            </label>


            {/* ERROR */}

            {editorError && (
              <div
                className="
                  md:col-span-2
                  bg-red-500/10
                  border
                  border-red-500/30
                  text-red-300
                  rounded-xl
                  p-4
                  flex
                  gap-3
                  items-start
                "
              >
                <AlertCircle
                  size={19}
                  className="shrink-0 mt-0.5"
                />

                <span>
                  {
                    editorError
                  }
                </span>
              </div>
            )}


            {/* SUCCESS */}

            {editorSuccess && (
              <div
                className="
                  md:col-span-2
                  bg-green-500/10
                  border
                  border-green-500/30
                  text-green-300
                  rounded-xl
                  p-4
                  flex
                  gap-3
                  items-start
                "
              >
                <CheckCircle2
                  size={19}
                  className="shrink-0 mt-0.5"
                />

                <span>
                  {
                    editorSuccess
                  }
                </span>
              </div>
            )}
          </Editor>
        )}
    </div>
  );
}


// ============================================================
// PROFILE INFO
// ============================================================

function ProfileInfo({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        bg-neutral-900
        rounded-xl
        p-3
        flex
        gap-3
      "
    >
      <Icon
        className="
          text-orange-400
          shrink-0
        "
        size={18}
      />

      <div>
        <p
          className="
            text-neutral-500
            text-xs
          "
        >
          {label}
        </p>

        <p className="font-bold">
          {value}
        </p>
      </div>
    </div>
  );
}


// ============================================================
// INPUT FIELD
// ============================================================

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  min,
  max,
  step,
}) {
  return (
    <label className="text-sm">
      <span className="text-neutral-400">
        {label}
      </span>

      <input
        type={type}
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        required={required}
        min={min}
        max={max}
        step={
          step ||
          (type === "number"
            ? "0.1"
            : undefined)
        }
        className="
          mt-1
          w-full
          bg-neutral-950
          border
          border-neutral-800
          rounded-xl
          p-3
          outline-none
          focus:border-orange-500
        "
      />
    </label>
  );
}


// ============================================================
// SELECT FIELD
// ============================================================

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="text-sm">
      <span className="text-neutral-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="
          mt-1
          w-full
          bg-neutral-950
          border
          border-neutral-800
          rounded-xl
          p-3
          outline-none
          focus:border-orange-500
        "
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}
      </select>
    </label>
  );
}


// ============================================================
// EDITOR MODAL
// ============================================================

function Editor({
  title,
  onClose,
  onSubmit,
  children,
  saving,
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[12000]
        bg-black/80
        backdrop-blur-sm
        p-4
        overflow-y-auto
      "
    >
      <div
        className="
          max-w-3xl
          mx-auto
          my-8
          bg-[#111]
          border
          border-neutral-800
          rounded-3xl
          p-6
        "
      >
        <div
          className="
            flex
            justify-between
            items-center
            gap-4
            mb-5
          "
        >
          <div>
            <p
              className="
                text-orange-400
                text-xs
                uppercase
                tracking-[.25em]
                font-black
              "
            >
              J-Town Hoops
            </p>

            <h2
              className="
                text-2xl
                font-black
                mt-1
              "
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="
              cursor-pointer
              disabled:cursor-not-allowed
              text-neutral-400
              hover:text-white
              p-2
            "
          >
            <X />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
        >
          <div
            className="
              grid
              md:grid-cols-2
              gap-4
            "
          >
            {children}
          </div>

          <div
            className="
              flex
              flex-col-reverse
              sm:flex-row
              justify-end
              gap-3
              mt-6
            "
          >
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="
                cursor-pointer
                disabled:cursor-not-allowed
                disabled:opacity-50
                px-5
                py-3
                rounded-xl
                bg-neutral-800
                hover:bg-neutral-700
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                cursor-pointer
                disabled:cursor-not-allowed
                disabled:opacity-60
                px-5
                py-3
                rounded-xl
                bg-orange-500
                hover:bg-orange-400
                text-black
                font-black
                flex
                items-center
                justify-center
                gap-2
              "
            >
              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save
                    size={17}
                  />

                  Save Player
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}