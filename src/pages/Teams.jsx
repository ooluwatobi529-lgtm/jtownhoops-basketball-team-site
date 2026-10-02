import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Trophy,
  Plus,
  Minus,
  X,
  Pencil,
  Trash2,
  Save,
  Users,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import backgroundImage from "../images/mybackground4.jpg";
import jtownTeamLogo from "../images/jtownteamlogo.jpg";

import {
  useNotifications,
} from "../context/NotificationContext";

import {
  useAuth,
} from "../context/AuthContext";

import {
  teamAPI,
} from "../services/api";


// ============================================================
// J-TOWN HOOPS TEAMS PAGE
// ============================================================
//
// DATA FLOW:
//
// Teams.jsx
//     ↓
// teamAPI
//     ↓
// Render Backend
//     ↓
// MongoDB Atlas
//
// Notifications:
//
// Successful team change
//     ↓
// addSiteUpdate()
//     ↓
// News / Notifications
//
// ============================================================


// ============================================================
// EMPTY TEAM FORM
// ============================================================

const createBlankTeam = () => ({
  name: "",
  logo: "",
  wins: 0,
  losses: 0,
  division: "North Conference",
  roster: [],
});


// ============================================================
// TEAM ID HELPER
// ============================================================
//
// MongoDB uses:
//
// _id
//
// Some older frontend data used:
//
// id
//
// Supporting both makes the transition safer.
//
// ============================================================

const getTeamId = (team) =>
  team?._id || team?.id || "";


// ============================================================
// TEAM LOGO HELPER
// ============================================================
//
// MongoDB may contain:
//
// logo: ""
//
// If there is no uploaded/remote logo yet,
// use your existing J-Town team logo.
//
// ============================================================

const getTeamLogo = (team) =>
  team?.logo || jtownTeamLogo;


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Teams() {

  // ==========================================================
  // AUTHENTICATION
  // ==========================================================

  const {
    isAdmin,
  } = useAuth();


  // ==========================================================
  // NOTIFICATION SYSTEM
  // ==========================================================

  const {
    addSiteUpdate,
  } = useNotifications();


  // ==========================================================
  // DATABASE TEAM STATE
  // ==========================================================

  const [
    teams,
    setTeams,
  ] = useState([]);


  // ==========================================================
  // UI STATE
  // ==========================================================

  const [
    selectedTeamId,
    setSelectedTeamId,
  ] = useState(null);

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
  ] = useState(
    createBlankTeam()
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    actionId,
    setActionId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  // ==========================================================
  // LOAD TEAMS FROM MONGODB
  // ==========================================================

  const loadTeams = async ({
    showLoader = true,
  } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const response =
        await teamAPI.getAll();

      const databaseTeams =
        Array.isArray(response?.teams)
          ? response.teams
          : [];

      setTeams(databaseTeams);

    } catch (error) {
      console.error(
        "Could not load teams:",
        error
      );

      setError(
        error?.message ||
          "Could not load the J-Town Hoops teams."
      );

    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };


  // ==========================================================
  // INITIAL DATABASE LOAD
  // ==========================================================

  useEffect(() => {
    loadTeams();
  }, []);


  // ==========================================================
  // AUTO-CLEAR SUCCESS MESSAGE
  // ==========================================================

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () =>
      clearTimeout(timer);

  }, [successMessage]);


  // ==========================================================
  // RANK TEAMS
  // ==========================================================
  //
  // Your original page ranked teams using win percentage.
  //
  // We preserve that behavior.
  //
  // ==========================================================

  const rankedTeams = useMemo(
    () =>
      [...teams].sort(
        (a, b) => {
          const aGames =
            Number(a.wins || 0) +
            Number(a.losses || 0);

          const bGames =
            Number(b.wins || 0) +
            Number(b.losses || 0);

          const aPercentage =
            aGames > 0
              ? Number(a.wins || 0) /
                aGames
              : 0;

          const bPercentage =
            bGames > 0
              ? Number(b.wins || 0) /
                bGames
              : 0;

          return (
            bPercentage -
            aPercentage
          );
        }
      ),
    [teams]
  );


  // ==========================================================
  // CURRENT SELECTED TEAM
  // ==========================================================

  const active = useMemo(
    () =>
      selectedTeamId
        ? teams.find(
            (team) =>
              getTeamId(team) ===
              selectedTeamId
          ) || null
        : null,
    [
      teams,
      selectedTeamId,
    ]
  );


  // ==========================================================
  // OPEN ADD TEAM FORM
  // ==========================================================

  const openAdd = () => {
    setEditingId(null);

    setForm(
      createBlankTeam()
    );

    setError("");
    setShowEditor(true);
  };


  // ==========================================================
  // OPEN EDIT TEAM FORM
  // ==========================================================

  const openEdit = (team) => {
    const teamId =
      getTeamId(team);

    setEditingId(teamId);

    setForm({
      name:
        team.name || "",

      logo:
        team.logo || "",

      wins:
        Number(team.wins) || 0,

      losses:
        Number(team.losses) || 0,

      division:
        team.division ||
        "North Conference",

      roster:
        Array.isArray(team.roster)
          ? team.roster
          : [],
    });

    setError("");
    setShowEditor(true);
  };


  // ==========================================================
  // CLOSE EDITOR
  // ==========================================================

  const closeEditor = () => {
    if (saving) {
      return;
    }

    setShowEditor(false);
    setEditingId(null);

    setForm(
      createBlankTeam()
    );
  };


  // ==========================================================
  // SAVE TEAM
  // ==========================================================
  //
  // New team:
  //
  // POST /api/v1/teams
  //
  // Existing team:
  //
  // PUT /api/v1/teams/:id
  //
  // ==========================================================

  const save = async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      setError(
        "Administrator access is required."
      );

      return;
    }

    const cleanName =
      String(
        form.name || ""
      ).trim();

    if (!cleanName) {
      setError(
        "Please enter a team name."
      );

      return;
    }

    const payload = {
      name: cleanName,

      logo:
        String(
          form.logo || ""
        ).trim(),

      division:
        String(
          form.division ||
            "North Conference"
        ).trim() ||
        "North Conference",

      wins:
        Math.max(
          0,
          Number(form.wins) || 0
        ),

      losses:
        Math.max(
          0,
          Number(form.losses) || 0
        ),

      roster:
        Array.isArray(form.roster)
          ? form.roster
          : [],
    };

    try {
      setSaving(true);
      setError("");

      // ======================================================
      // EDIT EXISTING TEAM
      // ======================================================

      if (editingId) {
        const response =
          await teamAPI.update(
            editingId,
            payload
          );

        const updatedTeam =
          response?.team;

        if (!updatedTeam) {
          throw new Error(
            "The backend did not return the updated team."
          );
        }

        setTeams((previous) =>
          previous.map((team) =>
            getTeamId(team) ===
            editingId
              ? updatedTeam
              : team
          )
        );

        addSiteUpdate({
          title:
            "Team Updated",

          desc:
            `${updatedTeam.name}'s team record or information was updated.`,

          category:
            "teams",

          origin:
            "teams",

          type:
            "team",

          link:
            "/teams",

          showInNews:
            true,

          showInNotifications:
            true,
        });

        setSuccessMessage(
          `${updatedTeam.name} was updated successfully.`
        );
      }

      // ======================================================
      // CREATE NEW TEAM
      // ======================================================

      else {
        const response =
          await teamAPI.create(
            payload
          );

        const createdTeam =
          response?.team;

        if (!createdTeam) {
          throw new Error(
            "The backend did not return the new team."
          );
        }

        setTeams((previous) => [
          ...previous,
          createdTeam,
        ]);

        addSiteUpdate({
          title:
            "New Team Added",

          desc:
            `${createdTeam.name} joined the J-Town Hoops league standings.`,

          category:
            "teams",

          origin:
            "teams",

          type:
            "team",

          link:
            "/teams",

          showInNews:
            true,

          showInNotifications:
            true,
        });

        setSuccessMessage(
          `${createdTeam.name} was added successfully.`
        );
      }

      setShowEditor(false);
      setEditingId(null);

      setForm(
        createBlankTeam()
      );

    } catch (error) {
      console.error(
        "SAVE TEAM ERROR:",
        error
      );

      setError(
        error?.message ||
          "Could not save the team."
      );

    } finally {
      setSaving(false);
    }
  };


  // ==========================================================
  // ADJUST WINS / LOSSES
  // ==========================================================

  const adjust = async (
    team,
    field,
    delta
  ) => {
    if (!isAdmin) {
      return;
    }

    const teamId =
      getTeamId(team);

    if (!teamId) {
      return;
    }

    const oldValue =
      Number(
        team[field] || 0
      );

    const newValue =
      Math.max(
        0,
        oldValue + delta
      );

    // No database request if nothing changed.
    if (
      newValue === oldValue
    ) {
      return;
    }

    try {
      setActionId(teamId);
      setError("");

      const response =
        await teamAPI.update(
          teamId,
          {
            [field]:
              newValue,
          }
        );

      const updatedTeam =
        response?.team;

      if (!updatedTeam) {
        throw new Error(
          "The backend did not return the updated team."
        );
      }

      setTeams((previous) =>
        previous.map((item) =>
          getTeamId(item) ===
          teamId
            ? updatedTeam
            : item
        )
      );

      addSiteUpdate({
        title:
          "Team Updated",

        desc:
          `${updatedTeam.name}'s team record was updated to ${updatedTeam.wins} win(s) and ${updatedTeam.losses} loss(es).`,

        category:
          "teams",

        origin:
          "teams",

        type:
          "team",

        link:
          "/teams",

        showInNews:
          true,

        showInNotifications:
          true,
      });

    } catch (error) {
      console.error(
        "UPDATE TEAM RECORD ERROR:",
        error
      );

      setError(
        error?.message ||
          "Could not update the team record."
      );

    } finally {
      setActionId(null);
    }
  };


  // ==========================================================
  // DELETE TEAM
  // ==========================================================

  const del = async (team) => {
    if (!isAdmin) {
      return;
    }

    const teamId =
      getTeamId(team);

    if (!teamId) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${team.name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(teamId);
      setError("");

      await teamAPI.remove(
        teamId
      );

      setTeams((previous) =>
        previous.filter(
          (item) =>
            getTeamId(item) !==
            teamId
        )
      );

      if (
        selectedTeamId ===
        teamId
      ) {
        setSelectedTeamId(
          null
        );
      }

      addSiteUpdate({
        title:
          "Team Removed",

        desc:
          `${team.name} was removed from the league standings.`,

        category:
          "teams",

        origin:
          "teams",

        type:
          "team",

        link:
          "/teams",

        showInNews:
          true,

        showInNotifications:
          true,
      });

      setSuccessMessage(
        `${team.name} was removed successfully.`
      );

    } catch (error) {
      console.error(
        "DELETE TEAM ERROR:",
        error
      );

      setError(
        error?.message ||
          "Could not delete the team."
      );

    } finally {
      setActionId(null);
    }
  };


  // ==========================================================
  // MANUAL REFRESH
  // ==========================================================

  const refreshTeams =
    async () => {
      await loadTeams({
        showLoader: false,
      });
    };


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div
      className="
        min-h-screen
        text-white
        py-10
        px-4
        sm:px-6
        bg-cover
        bg-center
        bg-fixed
      "
      style={{
        backgroundImage:
          `linear-gradient(rgba(0,0,0,.58),rgba(0,0,0,.64)),url(${backgroundImage})`,
      }}
    >
      <div
        className="
          max-w-6xl
          mx-auto
        "
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-end
            sm:justify-between
            gap-5
            border-b
            border-neutral-800
            pb-6
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
              League Control Centre
            </p>

            <h1
              className="
                text-4xl
                font-black
                uppercase
                flex
                items-center
                gap-3
                mt-2
              "
            >
              <Trophy
                className="
                  text-orange-500
                "
              />

              League Standings
            </h1>

            <p
              className="
                text-neutral-400
                mt-2
              "
            >
              Records auto-rank by win
              percentage. Team information
              is now synchronized with the
              J-Town Hoops database.
            </p>
          </div>


          {/* HEADER BUTTONS */}

          <div
            className="
              flex
              gap-2
              flex-wrap
            "
          >
            <button
              type="button"
              onClick={
                refreshTeams
              }
              disabled={loading}
              className="
                bg-neutral-900
                hover:bg-neutral-800
                disabled:opacity-50
                border
                border-neutral-800
                text-white
                font-bold
                px-4
                py-3
                rounded-xl
                flex
                items-center
                justify-center
                gap-2
              "
            >
              <RefreshCw
                size={17}
              />

              Refresh
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={openAdd}
                className="
                  bg-orange-500
                  hover:bg-orange-400
                  text-black
                  font-black
                  px-5
                  py-3
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >
                <Plus
                  size={18}
                />

                Add Team
              </button>
            )}
          </div>
        </div>


        {/* ====================================================
            SUCCESS MESSAGE
        ==================================================== */}

        {successMessage && (
          <div
            className="
              mb-6
              bg-green-500/10
              border
              border-green-500/30
              text-green-300
              rounded-xl
              px-4
              py-3
            "
          >
            {successMessage}
          </div>
        )}


        {/* ====================================================
            ERROR MESSAGE
        ==================================================== */}

        {error && (
          <div
            className="
              mb-6
              bg-red-500/10
              border
              border-red-500/30
              text-red-300
              rounded-xl
              px-4
              py-3
              flex
              items-start
              gap-3
            "
          >
            <AlertCircle
              size={19}
              className="
                shrink-0
                mt-0.5
              "
            />

            <div>
              <p
                className="
                  font-bold
                "
              >
                Something went wrong
              </p>

              <p
                className="
                  text-sm
                  mt-1
                "
              >
                {error}
              </p>
            </div>
          </div>
        )}


        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading && (
          <div
            className="
              min-h-[300px]
              flex
              flex-col
              items-center
              justify-center
              text-neutral-400
            "
          >
            <Loader2
              size={36}
              className="
                animate-spin
                text-orange-500
              "
            />

            <p
              className="
                mt-4
                font-bold
              "
            >
              Loading league standings...
            </p>
          </div>
        )}


        {/* ====================================================
            EMPTY DATABASE
        ==================================================== */}

        {!loading &&
          rankedTeams.length ===
            0 && (
            <div
              className="
                bg-black/75
                border
                border-neutral-800
                rounded-2xl
                p-10
                text-center
              "
            >
              <Trophy
                size={42}
                className="
                  mx-auto
                  text-orange-500
                "
              />

              <h2
                className="
                  text-2xl
                  font-black
                  mt-4
                "
              >
                No Teams Yet
              </h2>

              <p
                className="
                  text-neutral-400
                  mt-2
                "
              >
                There are currently no
                active teams in the
                J-Town Hoops database.
              </p>

              {isAdmin && (
                <button
                  type="button"
                  onClick={openAdd}
                  className="
                    mt-6
                    bg-orange-500
                    hover:bg-orange-400
                    text-black
                    font-black
                    px-5
                    py-3
                    rounded-xl
                    inline-flex
                    items-center
                    gap-2
                  "
                >
                  <Plus
                    size={18}
                  />

                  Add First Team
                </button>
              )}
            </div>
          )}


        {/* ====================================================
            TEAM STANDINGS
        ==================================================== */}

        {!loading && (
          <div
            className="
              space-y-4
            "
          >
            {rankedTeams.map(
              (
                team,
                index
              ) => {

                const teamId =
                  getTeamId(
                    team
                  );

                const wins =
                  Number(
                    team.wins ||
                      0
                  );

                const losses =
                  Number(
                    team.losses ||
                      0
                  );

                const games =
                  wins +
                  losses;

                const pct =
                  games > 0
                    ? Math.round(
                        (
                          wins /
                          games
                        ) *
                          100
                      )
                    : 0;

                const busy =
                  actionId ===
                  teamId;

                return (
                  <article
                    key={
                      teamId
                    }
                    className="
                      bg-black/75
                      border
                      border-neutral-800
                      hover:border-orange-500/50
                      rounded-2xl
                      p-5
                      transition-all
                    "
                  >
                    <div
                      className="
                        grid
                        lg:grid-cols-[70px_1fr_180px_220px]
                        gap-5
                        items-center
                      "
                    >

                      {/* RANK */}

                      <div
                        className="
                          text-center
                        "
                      >
                        <span
                          className="
                            text-3xl
                            font-black
                            text-orange-500
                          "
                        >
                          #{index + 1}
                        </span>
                      </div>


                      {/* TEAM */}

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedTeamId(
                            teamId
                          )
                        }
                        className="
                          flex
                          items-center
                          gap-4
                          text-left
                        "
                      >
                        <img
                          src={
                            getTeamLogo(
                              team
                            )
                          }
                          alt={
                            team.name
                          }
                          className="
                            w-16
                            h-16
                            rounded-2xl
                            object-cover
                            border
                            border-neutral-700
                          "
                        />

                        <div>
                          <h2
                            className="
                              text-xl
                              font-black
                            "
                          >
                            {team.name}
                          </h2>

                          <p
                            className="
                              text-xs
                              text-neutral-400
                              uppercase
                            "
                          >
                            {
                              team.division
                            }
                          </p>

                          <div
                            className="
                              h-1.5
                              w-40
                              max-w-full
                              bg-neutral-800
                              rounded-full
                              mt-2
                              overflow-hidden
                            "
                          >
                            <div
                              className="
                                h-full
                                bg-orange-500
                              "
                              style={{
                                width:
                                  `${pct}%`,
                              }}
                            />
                          </div>

                          <p
                            className="
                              text-[10px]
                              text-neutral-500
                              mt-1
                            "
                          >
                            {pct}% win
                            rate
                          </p>
                        </div>
                      </button>


                      {/* RECORD */}

                      <div
                        className="
                          text-center
                          bg-neutral-900
                          rounded-xl
                          py-3
                        "
                      >
                        <div
                          className="
                            text-2xl
                            font-black
                          "
                        >
                          {wins}

                          <span
                            className="
                              text-neutral-600
                              mx-2
                            "
                          >
                            -
                          </span>

                          {losses}
                        </div>

                        <div
                          className="
                            text-[10px]
                            uppercase
                            text-neutral-500
                          "
                        >
                          Wins • Losses
                        </div>
                      </div>


                      {/* ADMIN CONTROLS */}

                      <div
                        className="
                          flex
                          justify-end
                          gap-2
                          flex-wrap
                        "
                      >
                        {isAdmin && (
                          <>
                            <Mini
                              disabled={
                                busy
                              }
                              onClick={() =>
                                adjust(
                                  team,
                                  "wins",
                                  1
                                )
                              }
                              icon={
                                <Plus
                                  size={
                                    14
                                  }
                                />
                              }
                              text="Win"
                            />

                            <Mini
                              disabled={
                                busy
                              }
                              onClick={() =>
                                adjust(
                                  team,
                                  "wins",
                                  -1
                                )
                              }
                              icon={
                                <Minus
                                  size={
                                    14
                                  }
                                />
                              }
                              text="Win"
                            />

                            <Mini
                              disabled={
                                busy
                              }
                              onClick={() =>
                                adjust(
                                  team,
                                  "losses",
                                  1
                                )
                              }
                              icon={
                                <Plus
                                  size={
                                    14
                                  }
                                />
                              }
                              text="Loss"
                            />

                            <button
                              type="button"
                              disabled={
                                busy
                              }
                              onClick={() =>
                                openEdit(
                                  team
                                )
                              }
                              className="
                                p-2.5
                                rounded-lg
                                bg-orange-500/10
                                text-orange-400
                                hover:bg-orange-500
                                hover:text-black
                                disabled:opacity-40
                              "
                              title="Edit team"
                            >
                              <Pencil
                                size={
                                  16
                                }
                              />
                            </button>

                            <button
                              type="button"
                              disabled={
                                busy
                              }
                              onClick={() =>
                                del(
                                  team
                                )
                              }
                              className="
                                p-2.5
                                rounded-lg
                                bg-red-500/10
                                text-red-400
                                hover:bg-red-500
                                hover:text-white
                                disabled:opacity-40
                              "
                              title="Delete team"
                            >
                              {busy ? (
                                <Loader2
                                  size={
                                    16
                                  }
                                  className="
                                    animate-spin
                                  "
                                />
                              ) : (
                                <Trash2
                                  size={
                                    16
                                  }
                                />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>


      {/* ======================================================
          TEAM DETAILS MODAL
      ====================================================== */}

      {active && (
        <div
          className="
            fixed
            inset-0
            z-[12000]
            bg-black/80
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-4
          "
          onClick={() =>
            setSelectedTeamId(
              null
            )
          }
        >
          <div
            className="
              w-full
              max-w-xl
              bg-[#111]
              border
              border-neutral-800
              rounded-3xl
              p-6
              max-h-[90vh]
              overflow-y-auto
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className="
                flex
                justify-between
                gap-4
              "
            >
              <div
                className="
                  flex
                  gap-4
                "
              >
                <img
                  src={
                    getTeamLogo(
                      active
                    )
                  }
                  alt={
                    active.name
                  }
                  className="
                    w-20
                    h-20
                    rounded-2xl
                    object-cover
                    border
                    border-neutral-700
                  "
                />

                <div>
                  <h2
                    className="
                      text-2xl
                      font-black
                    "
                  >
                    {active.name}
                  </h2>

                  <p
                    className="
                      text-orange-400
                    "
                  >
                    {
                      active.division
                    }
                  </p>

                  <p
                    className="
                      text-neutral-500
                      text-sm
                      mt-1
                    "
                  >
                    {
                      Number(
                        active.wins ||
                          0
                      )
                    }{" "}
                    wins •{" "}
                    {
                      Number(
                        active.losses ||
                          0
                      )
                    }{" "}
                    losses
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTeamId(
                    null
                  )
                }
                className="
                  self-start
                  p-2
                  rounded-lg
                  hover:bg-neutral-900
                "
              >
                <X />
              </button>
            </div>


            {/* ROSTER */}

            <h3
              className="
                font-black
                mt-6
                flex
                gap-2
                items-center
              "
            >
              <Users
                size={18}
              />

              Roster
            </h3>

            <div
              className="
                mt-3
                space-y-2
              "
            >
              {Array.isArray(
                active.roster
              ) &&
              active.roster.length >
                0 ? (
                active.roster.map(
                  (
                    player,
                    index
                  ) => (
                    <div
                      key={
                        player?._id ||
                        `${player?.name}-${index}`
                      }
                      className="
                        bg-neutral-900
                        rounded-xl
                        p-3
                        flex
                        justify-between
                        gap-3
                      "
                    >
                      <span>
                        {player?.number !==
                          undefined &&
                        player?.number !==
                          null
                          ? `#${player.number} `
                          : ""}

                        <b>
                          {
                            player?.name
                          }
                        </b>

                        {player?.pos
                          ? ` • ${player.pos}`
                          : ""}
                      </span>

                      {player?.stat && (
                        <span
                          className="
                            text-orange-400
                            text-right
                          "
                        >
                          {
                            player.stat
                          }
                        </span>
                      )}
                    </div>
                  )
                )
              ) : (
                <p
                  className="
                    text-neutral-500
                  "
                >
                  No roster entries
                  yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}


      {/* ======================================================
          ADD / EDIT TEAM MODAL
      ====================================================== */}

      {showEditor &&
        isAdmin && (
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
            "
          >
            <form
              onSubmit={save}
              className="
                w-full
                max-w-xl
                bg-[#111]
                border
                border-neutral-800
                rounded-3xl
                p-6
                max-h-[90vh]
                overflow-y-auto
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
                <h2
                  className="
                    text-2xl
                    font-black
                  "
                >
                  {editingId
                    ? "Edit Team"
                    : "Add Team"}
                </h2>

                <button
                  type="button"
                  disabled={
                    saving
                  }
                  onClick={
                    closeEditor
                  }
                  className="
                    p-2
                    rounded-lg
                    hover:bg-neutral-900
                    disabled:opacity-40
                  "
                >
                  <X />
                </button>
              </div>


              {/* FORM ERROR */}

              {error && (
                <div
                  className="
                    mb-5
                    bg-red-500/10
                    border
                    border-red-500/30
                    text-red-300
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                  "
                >
                  {error}
                </div>
              )}


              <div
                className="
                  grid
                  sm:grid-cols-2
                  gap-4
                "
              >
                <Field
                  label="Team Name"
                  value={
                    form.name
                  }
                  set={(value) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,
                        name: value,
                      })
                    )
                  }
                  required
                />

                <Field
                  label="Division"
                  value={
                    form.division
                  }
                  set={(value) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,
                        division:
                          value,
                      })
                    )
                  }
                />

                <Field
                  label="Wins"
                  type="number"
                  min="0"
                  value={
                    form.wins
                  }
                  set={(value) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,
                        wins: value,
                      })
                    )
                  }
                />

                <Field
                  label="Losses"
                  type="number"
                  min="0"
                  value={
                    form.losses
                  }
                  set={(value) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,
                        losses:
                          value,
                      })
                    )
                  }
                />

                <div
                  className="
                    sm:col-span-2
                  "
                >
                  <Field
                    label="Logo path / URL"
                    value={
                      form.logo
                    }
                    set={(value) =>
                      setForm(
                        (
                          previous
                        ) => ({
                          ...previous,
                          logo: value,
                        })
                      )
                    }
                    placeholder="Leave empty to use the default J-Town logo"
                  />
                </div>
              </div>


              {/* LOGO PREVIEW */}

              <div
                className="
                  mt-5
                  bg-neutral-950
                  border
                  border-neutral-800
                  rounded-xl
                  p-4
                  flex
                  items-center
                  gap-4
                "
              >
                <img
                  src={
                    form.logo ||
                    jtownTeamLogo
                  }
                  alt="Team logo preview"
                  className="
                    w-14
                    h-14
                    object-cover
                    rounded-xl
                    border
                    border-neutral-700
                  "
                  onError={(
                    event
                  ) => {
                    event.currentTarget.src =
                      jtownTeamLogo;
                  }}
                />

                <div>
                  <p
                    className="
                      text-sm
                      font-bold
                    "
                  >
                    Logo Preview
                  </p>

                  <p
                    className="
                      text-xs
                      text-neutral-500
                      mt-1
                    "
                  >
                    An empty logo
                    uses your default
                    J-Town team logo.
                  </p>
                </div>
              </div>


              {/* SAVE BUTTON */}

              <button
                type="submit"
                disabled={
                  saving
                }
                className="
                  mt-6
                  w-full
                  bg-orange-500
                  hover:bg-orange-400
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  text-black
                  font-black
                  py-3
                  rounded-xl
                  flex
                  justify-center
                  items-center
                  gap-2
                "
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="
                        animate-spin
                      "
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save
                      size={17}
                    />

                    {editingId
                      ? "Save Changes"
                      : "Save Team"}
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
// SMALL ADMIN BUTTON
// ============================================================

function Mini({
  onClick,
  icon,
  text,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="
        px-3
        py-2
        rounded-lg
        bg-neutral-900
        hover:bg-neutral-800
        disabled:opacity-40
        disabled:cursor-not-allowed
        text-xs
        font-bold
        flex
        items-center
        gap-1
      "
    >
      {icon}
      {text}
    </button>
  );
}


// ============================================================
// FORM FIELD
// ============================================================

function Field({
  label,
  value,
  set,
  type = "text",
  min,
  placeholder = "",
  required = false,
}) {
  return (
    <label
      className="
        text-sm
        text-neutral-400
      "
    >
      {label}

      <input
        type={type}
        min={min}
        required={required}
        value={
          value ?? ""
        }
        placeholder={
          placeholder
        }
        onChange={(
          event
        ) =>
          set(
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
          text-white
          outline-none
          focus:border-orange-500
        "
      />
    </label>
  );
}