import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Tv,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Radio,
  Upload,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import scheduleBackground from "../images/mybackground4.jpg";
import defaultTeamLogo from "../images/jtownteamlogo.jpg";

import { useAuth } from "../context/AuthContext";
import { scheduleAPI, mediaAPI } from "../services/api";


// ============================================================
// 🗓️ EMPTY SCHEDULE FORM
// ============================================================

const createBlankGame = () => ({
  status: "upcoming",

  time: "7:30 PM",

  date: "",

  venue: "City Dome Arena",

  broadcast: "League Pass / YouTube",

  homeTeam: "J-Town Hoops",

  homeLogo: "",

  homeLogoPublicId: "",

  homeScore: "",

  awayTeam: "",

  awayLogo: "",

  awayLogoPublicId: "",

  awayScore: "",

  gameType: "League Game",

  description: "",

  isPublished: true,
});


// ============================================================
// 🏀 SCHEDULE PAGE
// ============================================================

export default function Schedule() {
  const { isAdmin } = useAuth();


  // ==========================================================
  // DATABASE DATA
  // ==========================================================

  const [scheduleGames, setScheduleGames] =
    useState([]);


  // ==========================================================
  // PAGE STATE
  // ==========================================================

  const [filter, setFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");


  // ==========================================================
  // EDITOR STATE
  // ==========================================================

  const [showEditor, setShowEditor] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState(createBlankGame());

  const [saving, setSaving] =
    useState(false);


  // ==========================================================
  // IMAGE UPLOAD STATE
  // ==========================================================

  const [uploadingHomeLogo, setUploadingHomeLogo] =
    useState(false);

  const [uploadingAwayLogo, setUploadingAwayLogo] =
    useState(false);


  // ==========================================================
  // LOAD SCHEDULE FROM MONGODB
  // ==========================================================

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await scheduleAPI.getAll();

      setScheduleGames(
        Array.isArray(response?.schedules)
          ? response.schedules
          : []
      );
    } catch (err) {
      console.error(
        "LOAD SCHEDULE ERROR:",
        err
      );

      setError(
        err?.message ||
          "The J-Town Hoops schedule could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadSchedule();
  }, []);


  // ==========================================================
  // CLEAR SUCCESS MESSAGE AUTOMATICALLY
  // ==========================================================

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        setSuccessMessage("");
      }, 4000);

    return () =>
      window.clearTimeout(timer);
  }, [successMessage]);


  // ==========================================================
  // FILTER SCHEDULE
  // ==========================================================

  const matches = useMemo(() => {
    if (filter === "all") {
      return scheduleGames;
    }

    return scheduleGames.filter(
      (game) =>
        game.status === filter
    );
  }, [
    scheduleGames,
    filter,
  ]);


  // ==========================================================
  // OPEN ADD GAME
  // ==========================================================

  const openAdd = () => {
    setEditingId(null);

    setForm(
      createBlankGame()
    );

    setError("");

    setShowEditor(true);
  };


  // ==========================================================
  // OPEN EDIT GAME
  // ==========================================================

  const openEdit = (game) => {
    setEditingId(
      game.id || game._id
    );

    setForm({
      status:
        game.status ||
        "upcoming",

      time:
        game.time ||
        "7:30 PM",

      date:
        game.date ||
        "",

      venue:
        game.venue ||
        "City Dome Arena",

      broadcast:
        game.broadcast ||
        "League Pass / YouTube",

      homeTeam:
        game.homeTeam ||
        "",

      homeLogo:
        game.homeLogo ||
        "",

      homeLogoPublicId:
        game.homeLogoPublicId ||
        "",

      homeScore:
        game.homeScore ??
        "",

      awayTeam:
        game.awayTeam ||
        "",

      awayLogo:
        game.awayLogo ||
        "",

      awayLogoPublicId:
        game.awayLogoPublicId ||
        "",

      awayScore:
        game.awayScore ??
        "",

      gameType:
        game.gameType ||
        "League Game",

      description:
        game.description ||
        "",

      isPublished:
        game.isPublished !== false,
    });

    setError("");

    setShowEditor(true);
  };


  // ==========================================================
  // CLOSE EDITOR
  // ==========================================================

  const closeEditor = () => {
    if (
      saving ||
      uploadingHomeLogo ||
      uploadingAwayLogo
    ) {
      return;
    }

    setShowEditor(false);

    setEditingId(null);

    setForm(
      createBlankGame()
    );
  };


  // ==========================================================
  // UPLOAD HOME TEAM LOGO
  // ==========================================================

  const uploadHomeLogo = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setUploadingHomeLogo(true);
      setError("");

      const response =
        await mediaAPI.uploadImage(
          file,
          "general"
        );

      if (!response?.media?.url) {
        throw new Error(
          "The server did not return the uploaded image."
        );
      }

      setForm((current) => ({
        ...current,

        homeLogo:
          response.media.url,

        homeLogoPublicId:
          response.media.publicId ||
          "",
      }));

      setSuccessMessage(
        "Home team logo uploaded successfully."
      );
    } catch (err) {
      console.error(
        "HOME LOGO UPLOAD ERROR:",
        err
      );

      setError(
        err?.message ||
          "The home team logo could not be uploaded."
      );
    } finally {
      setUploadingHomeLogo(false);
    }
  };


  // ==========================================================
  // UPLOAD AWAY TEAM LOGO
  // ==========================================================

  const uploadAwayLogo = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setUploadingAwayLogo(true);
      setError("");

      const response =
        await mediaAPI.uploadImage(
          file,
          "general"
        );

      if (!response?.media?.url) {
        throw new Error(
          "The server did not return the uploaded image."
        );
      }

      setForm((current) => ({
        ...current,

        awayLogo:
          response.media.url,

        awayLogoPublicId:
          response.media.publicId ||
          "",
      }));

      setSuccessMessage(
        "Away team logo uploaded successfully."
      );
    } catch (err) {
      console.error(
        "AWAY LOGO UPLOAD ERROR:",
        err
      );

      setError(
        err?.message ||
          "The away team logo could not be uploaded."
      );
    } finally {
      setUploadingAwayLogo(false);
    }
  };


  // ==========================================================
  // SAVE GAME
  // ==========================================================

  const save = async (event) => {
    event.preventDefault();

    if (
      !form.homeTeam.trim() ||
      !form.awayTeam.trim()
    ) {
      setError(
        "Please enter both the home team and away team."
      );

      return;
    }

    if (!form.date.trim()) {
      setError(
        "Please enter the game date."
      );

      return;
    }

    if (
      form.homeTeam
        .trim()
        .toLowerCase() ===
      form.awayTeam
        .trim()
        .toLowerCase()
    ) {
      setError(
        "The home team and away team cannot be the same."
      );

      return;
    }

    const payload = {
      homeTeam:
        form.homeTeam.trim(),

      awayTeam:
        form.awayTeam.trim(),

      date:
        form.date.trim(),

      time:
        form.time.trim(),

      venue:
        form.venue.trim(),

      broadcast:
        form.broadcast.trim(),

      gameType:
        form.gameType.trim(),

      status:
        form.status,

      homeScore:
        form.homeScore === ""
          ? null
          : Number(
              form.homeScore
            ),

      awayScore:
        form.awayScore === ""
          ? null
          : Number(
              form.awayScore
            ),

      homeLogo:
        form.homeLogo,

      homeLogoPublicId:
        form.homeLogoPublicId,

      awayLogo:
        form.awayLogo,

      awayLogoPublicId:
        form.awayLogoPublicId,

      description:
        form.description.trim(),

      isPublished:
        form.isPublished,
    };

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        const response =
          await scheduleAPI.update(
            editingId,
            payload
          );

        const updatedGame =
          response?.schedule;

        if (!updatedGame) {
          throw new Error(
            "The server did not return the updated game."
          );
        }

        setScheduleGames(
          (current) =>
            current.map(
              (game) =>
                (game.id ||
                  game._id) ===
                editingId
                  ? updatedGame
                  : game
            )
        );

        setSuccessMessage(
          "Schedule game updated successfully."
        );
      } else {
        const response =
          await scheduleAPI.create(
            payload
          );

        const newGame =
          response?.schedule;

        if (!newGame) {
          throw new Error(
            "The server did not return the new game."
          );
        }

        setScheduleGames(
          (current) => [
            newGame,
            ...current,
          ]
        );

        setSuccessMessage(
          "Game added to the schedule successfully."
        );
      }

      setShowEditor(false);

      setEditingId(null);

      setForm(
        createBlankGame()
      );
    } catch (err) {
      console.error(
        "SAVE SCHEDULE ERROR:",
        err
      );

      setError(
        err?.message ||
          "The schedule game could not be saved."
      );
    } finally {
      setSaving(false);
    }
  };


  // ==========================================================
  // DELETE GAME
  // ==========================================================

  const deleteGame = async (
    game
  ) => {
    const id =
      game.id ||
      game._id;

    const confirmed =
      window.confirm(
        `Delete ${game.homeTeam} vs ${game.awayTeam}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await scheduleAPI.remove(
        id
      );

      setScheduleGames(
        (current) =>
          current.filter(
            (item) =>
              (item.id ||
                item._id) !== id
          )
      );

      setSuccessMessage(
        "Schedule game deleted successfully."
      );
    } catch (err) {
      console.error(
        "DELETE SCHEDULE ERROR:",
        err
      );

      setError(
        err?.message ||
          "The schedule game could not be deleted."
      );
    }
  };


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div
      className="min-h-screen text-white px-4 sm:px-6 py-10 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          `linear-gradient(rgba(0,0,0,.58),rgba(0,0,0,.64)),url(${scheduleBackground})`,
      }}
    >
      <div className="max-w-6xl mx-auto">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">

          <div>
            <p className="text-orange-400 text-xs font-black uppercase tracking-[.35em]">
              Master Game Calendar
            </p>

            <h1 className="text-4xl font-black uppercase mt-2 flex gap-3 items-center">
              <Calendar className="text-orange-500" />

              Schedule
            </h1>

            <p className="text-neutral-400 mt-2">
              Official J-Town Hoops game schedule,
              results and upcoming fixtures.
            </p>
          </div>


          {/* ADMIN ONLY */}

          {isAdmin && (
            <button
              type="button"
              onClick={openAdd}
              className="cursor-pointer bg-orange-500 hover:bg-orange-400 text-black font-black px-5 py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Plus size={18} />

              Add Game
            </button>
          )}
        </div>


        {/* ====================================================
            MESSAGES
        ==================================================== */}

        {successMessage && (
          <div className="mb-5 border border-green-500/30 bg-green-500/10 text-green-300 rounded-xl px-4 py-3">
            {successMessage}
          </div>
        )}


        {error && (
          <div className="mb-5 border border-red-500/30 bg-red-500/10 text-red-300 rounded-xl px-4 py-3 flex items-start gap-3">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              {error}
            </div>
          </div>
        )}


        {/* ====================================================
            FILTERS
        ==================================================== */}

        <div className="flex flex-wrap gap-2 mb-7">
          {[
            "all",
            "live",
            "upcoming",
            "completed",
            "postponed",
            "cancelled",
          ].map((item) => (
            <button
              type="button"
              key={item}
              onClick={() =>
                setFilter(item)
              }
              className={`cursor-pointer px-4 py-2 rounded-full text-xs uppercase font-black ${
                filter === item
                  ? "bg-orange-500 text-black"
                  : "bg-black/70 border border-neutral-800 text-neutral-300 hover:border-orange-500/50"
              }`}
            >
              {item}
            </button>
          ))}
        </div>


        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div className="bg-black/70 border border-neutral-800 rounded-2xl p-12 text-center">
            <Loader2
              className="animate-spin mx-auto text-orange-500"
              size={35}
            />

            <p className="text-neutral-400 mt-4">
              Loading J-Town Hoops schedule...
            </p>
          </div>
        )}


        {/* ====================================================
            GAMES
        ==================================================== */}

        {!loading && (
          <div className="space-y-5">

            {matches.map((game) => {
              const gameId =
                game.id ||
                game._id;

              return (
                <article
                  key={gameId}
                  className={`bg-black/75 border rounded-2xl p-5 sm:p-6 ${
                    game.status === "live"
                      ? "border-red-500/60 shadow-lg shadow-red-500/10"
                      : "border-neutral-800"
                  }`}
                >
                  <div className="flex flex-col xl:flex-row gap-5 xl:items-center">

                    {/* DATE / STATUS */}

                    <div className="xl:w-44">
                      <StatusBadge
                        status={
                          game.status
                        }
                      />

                      <p className="font-black mt-2">
                        {game.date}
                      </p>

                      <p className="text-orange-400 text-sm">
                        {game.gameType}
                      </p>
                    </div>


                    {/* TEAMS */}

                    <div className="flex-1 grid grid-cols-[1fr_auto_1fr] gap-4 items-center">

                      <Team
                        logo={
                          game.homeLogo
                        }
                        name={
                          game.homeTeam
                        }
                        label="Home"
                      />


                      {/* SCORE / VS */}

                      <div className="text-center">

                        {game.homeScore !==
                          null &&
                        game.homeScore !==
                          undefined &&
                        game.awayScore !==
                          null &&
                        game.awayScore !==
                          undefined ? (
                          <div className="text-3xl font-black font-mono">
                            {
                              game.homeScore
                            }

                            <span className="text-neutral-600 mx-2">
                              :
                            </span>

                            {
                              game.awayScore
                            }
                          </div>
                        ) : (
                          <div className="text-orange-400 font-black">
                            VS
                          </div>
                        )}

                        <div className="text-xs text-neutral-400 mt-1 flex justify-center items-center gap-1">
                          <Clock
                            size={12}
                          />

                          {game.time}
                        </div>
                      </div>


                      <Team
                        logo={
                          game.awayLogo
                        }
                        name={
                          game.awayTeam
                        }
                        label="Away"
                      />
                    </div>


                    {/* VENUE */}

                    <div className="xl:w-64 text-sm text-neutral-400 space-y-2">

                      <p className="flex gap-2">
                        <MapPin
                          size={16}
                          className="text-orange-400 shrink-0"
                        />

                        {game.venue}
                      </p>

                      <p className="flex gap-2">
                        <Tv
                          size={16}
                          className="shrink-0"
                        />

                        {game.broadcast}
                      </p>

                      {game.description && (
                        <p className="text-xs text-neutral-500 pt-1">
                          {
                            game.description
                          }
                        </p>
                      )}
                    </div>


                    {/* ADMIN BUTTONS */}

                    {isAdmin && (
                      <div className="flex gap-2">

                        <button
                          type="button"
                          title="Edit game"
                          onClick={() =>
                            openEdit(
                              game
                            )
                          }
                          className="cursor-pointer p-3 bg-orange-500/10 text-orange-400 rounded-xl hover:bg-orange-500 hover:text-black"
                        >
                          <Pencil
                            size={17}
                          />
                        </button>


                        <button
                          type="button"
                          title="Delete game"
                          onClick={() =>
                            deleteGame(
                              game
                            )
                          }
                          className="cursor-pointer p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}


            {/* EMPTY */}

            {!matches.length && (
              <div className="border border-dashed border-neutral-700 bg-black/50 rounded-2xl p-12 text-center">

                <Calendar
                  size={36}
                  className="mx-auto text-neutral-600"
                />

                <p className="text-neutral-500 mt-4">
                  No games in this category.
                </p>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={openAdd}
                    className="cursor-pointer mt-5 inline-flex items-center gap-2 bg-orange-500 text-black font-black px-5 py-3 rounded-xl"
                  >
                    <Plus
                      size={17}
                    />

                    Add First Game
                  </button>
                )}
              </div>
            )}
          </div>
        )}


        {/* REFRESH */}

        {!loading && (
          <div className="mt-7 flex justify-center">
            <button
              type="button"
              onClick={
                loadSchedule
              }
              className="cursor-pointer inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-orange-400"
            >
              <RefreshCw
                size={14}
              />

              Refresh schedule
            </button>
          </div>
        )}
      </div>


      {/* ======================================================
          ADMIN EDITOR
      ====================================================== */}

      {showEditor &&
        isAdmin && (
          <div className="fixed inset-0 z-[12000] bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">

            <form
              onSubmit={save}
              className="max-w-3xl mx-auto my-8 bg-[#111] border border-neutral-800 rounded-3xl p-6"
            >

              {/* HEADER */}

              <div className="flex justify-between gap-5 mb-5">

                <div>
                  <h2 className="text-2xl font-black">
                    {editingId
                      ? "Edit Game"
                      : "Add Game"}
                  </h2>

                  <p className="text-sm text-neutral-500 mt-1">
                    Games are saved permanently
                    to the J-Town Hoops database.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeEditor
                  }
                  className="cursor-pointer text-neutral-400 hover:text-white h-fit"
                >
                  <X />
                </button>
              </div>


              {/* FORM */}

              <div className="grid md:grid-cols-2 gap-4">

                <Field
                  label="Home Team"
                  value={
                    form.homeTeam
                  }
                  set={(value) =>
                    setForm({
                      ...form,
                      homeTeam:
                        value,
                    })
                  }
                />


                <Field
                  label="Away Team"
                  value={
                    form.awayTeam
                  }
                  set={(value) =>
                    setForm({
                      ...form,
                      awayTeam:
                        value,
                    })
                  }
                />


                {/* HOME LOGO */}

                <LogoUploader
                  label="Home Team Logo"
                  logo={
                    form.homeLogo
                  }
                  teamName={
                    form.homeTeam
                  }
                  uploading={
                    uploadingHomeLogo
                  }
                  onChange={
                    uploadHomeLogo
                  }
                  onRemove={() =>
                    setForm({
                      ...form,
                      homeLogo: "",
                      homeLogoPublicId:
                        "",
                    })
                  }
                />


                {/* AWAY LOGO */}

                <LogoUploader
                  label="Away Team Logo"
                  logo={
                    form.awayLogo
                  }
                  teamName={
                    form.awayTeam
                  }
                  uploading={
                    uploadingAwayLogo
                  }
                  onChange={
                    uploadAwayLogo
                  }
                  onRemove={() =>
                    setForm({
                      ...form,
                      awayLogo: "",
                      awayLogoPublicId:
                        "",
                    })
                  }
                />


                <Field
                  label="Date"
                  type="date"
                  value={
                    form.date
                  }
                  set={(value) =>
                    setForm({
                      ...form,
                      date: value,
                    })
                  }
                />


                <Field
                  label="Time"
                  value={
                    form.time
                  }
                  set={(value) =>
                    setForm({
                      ...form,
                      time: value,
                    })
                  }
                  placeholder="7:30 PM"
                />


                <Field
                  label="Venue"
                  value={
                    form.venue
                  }
                  set={(value) =>
                    setForm({
                      ...form,
                      venue: value,
                    })
                  }
                />


                <Field
                  label="Broadcast"
                  value={
                    form.broadcast
                  }
                  set={(value) =>
                    setForm({
                      ...form,
                      broadcast:
                        value,
                    })
                  }
                />


                <Field
                  label="Game Type"
                  value={
                    form.gameType
                  }
                  set={(value) =>
                    setForm({
                      ...form,
                      gameType:
                        value,
                    })
                  }
                />


                {/* STATUS */}

                <label className="text-sm text-neutral-400">
                  Status

                  <select
                    value={
                      form.status
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,

                        status:
                          event
                            .target
                            .value,
                      })
                    }
                    className="cursor-pointer mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white outline-none focus:border-orange-500"
                  >
                    <option value="upcoming">
                      Upcoming
                    </option>

                    <option value="live">
                      Live
                    </option>

                    <option value="completed">
                      Completed
                    </option>

                    <option value="postponed">
                      Postponed
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>
                  </select>
                </label>


                <Field
                  label="Home Score (optional)"
                  type="number"
                  value={
                    form.homeScore
                  }
                  set={(value) =>
                    setForm({
                      ...form,
                      homeScore:
                        value,
                    })
                  }
                />


                <Field
                  label="Away Score (optional)"
                  type="number"
                  value={
                    form.awayScore
                  }
                  set={(value) =>
                    setForm({
                      ...form,
                      awayScore:
                        value,
                    })
                  }
                />


                {/* DESCRIPTION */}

                <label className="md:col-span-2 text-sm text-neutral-400">
                  Description

                  <textarea
                    rows={4}
                    value={
                      form.description
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,

                        description:
                          event
                            .target
                            .value,
                      })
                    }
                    placeholder="Optional information about this game..."
                    className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white outline-none focus:border-orange-500 resize-y"
                  />
                </label>


                {/* PUBLISHED */}

                <label className="md:col-span-2 cursor-pointer flex items-center gap-3 bg-neutral-950 border border-neutral-800 rounded-xl p-4">

                  <input
                    type="checkbox"
                    checked={
                      form.isPublished
                    }
                    onChange={(
                      event
                    ) =>
                      setForm({
                        ...form,

                        isPublished:
                          event
                            .target
                            .checked,
                      })
                    }
                    className="cursor-pointer"
                  />

                  <div>
                    <p className="font-bold text-white">
                      Published
                    </p>

                    <p className="text-xs text-neutral-500">
                      Show this game
                      publicly on the
                      J-Town Hoops
                      schedule.
                    </p>
                  </div>
                </label>
              </div>


              {/* SAVE */}

              <button
                type="submit"
                disabled={
                  saving ||
                  uploadingHomeLogo ||
                  uploadingAwayLogo
                }
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 mt-6 w-full bg-orange-500 hover:bg-orange-400 text-black font-black py-3 rounded-xl flex justify-center gap-2 items-center"
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

                    {editingId
                      ? "Update Game"
                      : "Save Game"}
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
// 🏀 TEAM
// ============================================================

function Team({
  logo,
  name,
  label,
}) {
  return (
    <div className="text-center">

      <img
        src={
          logo ||
          defaultTeamLogo
        }
        alt={
          name ||
          "Team"
        }
        onError={(event) => {
          event.currentTarget.src =
            defaultTeamLogo;
        }}
        className="w-14 h-14 rounded-full object-cover mx-auto border border-neutral-700"
      />

      <p className="font-black mt-2 text-sm">
        {name}
      </p>

      <p className="text-[9px] text-neutral-500 uppercase">
        {label}
      </p>
    </div>
  );
}


// ============================================================
// 🚦 STATUS BADGE
// ============================================================

function StatusBadge({
  status = "upcoming",
}) {
  const styles = {
    live:
      "bg-red-500/20 text-red-400",

    completed:
      "bg-green-500/20 text-green-400",

    postponed:
      "bg-yellow-500/20 text-yellow-400",

    cancelled:
      "bg-neutral-500/20 text-neutral-400",

    upcoming:
      "bg-blue-500/20 text-blue-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
        styles[status] ||
        styles.upcoming
      }`}
    >
      {status === "live" && (
        <Radio
          size={11}
        />
      )}

      {status}
    </span>
  );
}


// ============================================================
// 📤 LOGO UPLOADER
// ============================================================

function LogoUploader({
  label,
  logo,
  teamName,
  uploading,
  onChange,
  onRemove,
}) {
  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">

      <p className="text-sm text-neutral-400 mb-3">
        {label}
      </p>

      <div className="flex items-center gap-4">

        <img
          src={
            logo ||
            defaultTeamLogo
          }
          alt={
            teamName ||
            label
          }
          onError={(event) => {
            event.currentTarget.src =
              defaultTeamLogo;
          }}
          className="w-16 h-16 rounded-full object-cover border border-neutral-700"
        />

        <div className="flex-1">

          <label className="cursor-pointer inline-flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-black font-bold px-4 py-2 rounded-lg transition-colors">

            {uploading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Upload
                size={16}
              />
            )}

            {uploading
              ? "Uploading..."
              : "Choose Logo"}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                onChange
              }
              disabled={
                uploading
              }
              className="hidden"
            />
          </label>

          {logo && (
            <button
              type="button"
              onClick={
                onRemove
              }
              className="cursor-pointer block text-xs text-red-400 hover:text-red-300 mt-2"
            >
              Remove selected logo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


// ============================================================
// 📝 FIELD
// ============================================================

function Field({
  label,
  value,
  set,
  type = "text",
  placeholder,
}) {
  return (
    <label className="text-sm text-neutral-400">

      {label}

      <input
        type={type}
        placeholder={
          placeholder
        }
        value={
          value ?? ""
        }
        min={
          type === "number"
            ? "0"
            : undefined
        }
        onChange={(
          event
        ) =>
          set(
            event.target.value
          )
        }
        className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white outline-none focus:border-orange-500"
      />
    </label>
  );
}