// src/pages/Teams.jsx

import {
  useEffect,
  useMemo,
  useRef,
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
  Upload,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

import backgroundImage from "../images/mybackground4.jpg";
import jtownTeamLogo from "../images/jtownteamlogo.jpg";

import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

import {
  teamAPI,
  mediaAPI,
} from "../services/api";

// ============================================================
// EMPTY TEAM
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
// HELPERS
// ============================================================

const getTeamId = (team) =>
  team?._id || team?.id || "";

const getTeamLogo = (team) =>
  team?.logo || jtownTeamLogo;

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Teams() {
  const { isAdmin } = useAuth();
  const { addSiteUpdate } = useNotifications();

  // ==========================================================
  // DATABASE STATE
  // ==========================================================

  const [teams, setTeams] = useState([]);

  // ==========================================================
  // UI STATE
  // ==========================================================

  const [selectedTeamId, setSelectedTeamId] =
    useState(null);

  const [showEditor, setShowEditor] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState(createBlankTeam());

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [actionId, setActionId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  // ==========================================================
  // IMAGE UPLOAD STATE
  // ==========================================================

  const [selectedLogoFile, setSelectedLogoFile] =
    useState(null);

  const [logoPreview, setLogoPreview] =
    useState("");

  const [uploadingLogo, setUploadingLogo] =
    useState(false);

  const [logoUploadSuccess, setLogoUploadSuccess] =
    useState(false);

  const fileInputRef = useRef(null);

  // ==========================================================
  // LOAD TEAMS
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

  useEffect(() => {
    loadTeams();
  }, []);

  // ==========================================================
  // SUCCESS MESSAGE TIMER
  // ==========================================================

  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => clearTimeout(timer);
  }, [successMessage]);

  // ==========================================================
  // CLEAN OBJECT URL
  // ==========================================================

  useEffect(() => {
    return () => {
      if (
        logoPreview &&
        logoPreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  // ==========================================================
  // RANK TEAMS
  // ==========================================================

  const rankedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      const aGames =
        Number(a.wins || 0) +
        Number(a.losses || 0);

      const bGames =
        Number(b.wins || 0) +
        Number(b.losses || 0);

      const aPercentage =
        aGames > 0
          ? Number(a.wins || 0) / aGames
          : 0;

      const bPercentage =
        bGames > 0
          ? Number(b.wins || 0) / bGames
          : 0;

      return bPercentage - aPercentage;
    });
  }, [teams]);

  // ==========================================================
  // SELECTED TEAM
  // ==========================================================

  const active = useMemo(() => {
    if (!selectedTeamId) {
      return null;
    }

    return (
      teams.find(
        (team) =>
          getTeamId(team) === selectedTeamId
      ) || null
    );
  }, [teams, selectedTeamId]);

  // ==========================================================
  // RESET IMAGE STATE
  // ==========================================================

  const resetLogoUploadState = () => {
    if (
      logoPreview &&
      logoPreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(logoPreview);
    }

    setSelectedLogoFile(null);
    setLogoPreview("");
    setUploadingLogo(false);
    setLogoUploadSuccess(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================================
  // OPEN ADD
  // ==========================================================

  const openAdd = () => {
    resetLogoUploadState();

    setEditingId(null);
    setForm(createBlankTeam());
    setError("");
    setShowEditor(true);
  };

  // ==========================================================
  // OPEN EDIT
  // ==========================================================

  const openEdit = (team) => {
    resetLogoUploadState();

    const teamId = getTeamId(team);

    setEditingId(teamId);

    setForm({
      name: team.name || "",
      logo: team.logo || "",
      wins: Number(team.wins) || 0,
      losses: Number(team.losses) || 0,
      division:
        team.division ||
        "North Conference",
      roster: Array.isArray(team.roster)
        ? team.roster
        : [],
    });

    setLogoPreview(team.logo || "");

    setError("");
    setShowEditor(true);
  };

  // ==========================================================
  // CLOSE EDITOR
  // ==========================================================

  const closeEditor = () => {
    if (saving || uploadingLogo) {
      return;
    }

    resetLogoUploadState();

    setShowEditor(false);
    setEditingId(null);
    setForm(createBlankTeam());
    setError("");
  };

  // ==========================================================
  // CHOOSE LOGO FROM COMPUTER
  // ==========================================================

  const handleLogoSelection = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setLogoUploadSuccess(false);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please choose a JPG, JPEG, PNG or WEBP image."
      );

      event.target.value = "";
      return;
    }

    const maximumSize =
      5 * 1024 * 1024;

    if (file.size > maximumSize) {
      setError(
        "The team logo is too large. Please choose an image smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    if (
      logoPreview &&
      logoPreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(logoPreview);
    }

    const preview =
      URL.createObjectURL(file);

    setSelectedLogoFile(file);
    setLogoPreview(preview);
  };

  // ==========================================================
  // UPLOAD LOGO TO CLOUDINARY
  // ==========================================================

  const uploadSelectedLogo = async () => {
    if (!selectedLogoFile) {
      setError(
        "Please choose a team logo from your computer first."
      );

      return null;
    }

    if (!isAdmin) {
      setError(
        "Administrator access is required."
      );

      return null;
    }

    try {
      setUploadingLogo(true);
      setLogoUploadSuccess(false);
      setError("");

      const response =
        await mediaAPI.uploadImage({
          file: selectedLogoFile,
          folder: "teams",
        });

      // Support a few sensible backend response names.
      // Your upload controller only needs to return one of them.

const uploadedUrl =
  // CURRENT J-TOWN HOOPS BACKEND FORMAT
  response?.media?.url ||
  response?.media?.secureUrl ||
  response?.media?.secure_url ||

  // OTHER SUPPORTED FORMATS
  response?.url ||
  response?.secureUrl ||
  response?.secure_url ||
  response?.image?.url ||
  response?.image?.secureUrl ||
  response?.image?.secure_url ||
  response?.file?.url ||
  response?.file?.secureUrl ||
  response?.file?.secure_url ||
  "";

      if (!uploadedUrl) {
        throw new Error(
          "The image uploaded, but the backend did not return its Cloudinary URL."
        );
      }

      setForm((previous) => ({
        ...previous,
        logo: uploadedUrl,
      }));

      setLogoPreview(uploadedUrl);
      setSelectedLogoFile(null);
      setLogoUploadSuccess(true);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return uploadedUrl;
    } catch (error) {
      console.error(
        "TEAM LOGO UPLOAD ERROR:",
        error
      );

      setError(
        error?.message ||
          "Could not upload the team logo."
      );

      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  // ==========================================================
  // REMOVE LOGO
  // ==========================================================

  const removeLogo = () => {
    if (uploadingLogo) return;

    if (
      logoPreview &&
      logoPreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(logoPreview);
    }

    setSelectedLogoFile(null);
    setLogoPreview("");
    setLogoUploadSuccess(false);

    setForm((previous) => ({
      ...previous,
      logo: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ==========================================================
  // SAVE TEAM
  // ==========================================================

  const save = async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      setError(
        "Administrator access is required."
      );
      return;
    }

    if (uploadingLogo) {
      setError(
        "Please wait for the team logo to finish uploading."
      );
      return;
    }

    const cleanName =
      String(form.name || "").trim();

    if (!cleanName) {
      setError(
        "Please enter a team name."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      // ======================================================
      // AUTO-UPLOAD SELECTED LOGO BEFORE SAVING
      // ======================================================
      //
      // This means the admin can:
      //
      // Choose Logo
      //      ↓
      // Save Team
      //
      // without needing to press Upload Logo first.
      //
      // ======================================================

      let finalLogo =
        String(form.logo || "").trim();

      if (selectedLogoFile) {
        const uploadedUrl =
          await uploadSelectedLogo();

        if (!uploadedUrl) {
          return;
        }

        finalLogo = uploadedUrl;
      }

      const payload = {
        name: cleanName,

        logo: finalLogo,

        division:
          String(
            form.division ||
              "North Conference"
          ).trim() ||
          "North Conference",

        wins: Math.max(
          0,
          Number(form.wins) || 0
        ),

        losses: Math.max(
          0,
          Number(form.losses) || 0
        ),

        roster:
          Array.isArray(form.roster)
            ? form.roster
            : [],
      };

      // ======================================================
      // UPDATE
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
            getTeamId(team) === editingId
              ? updatedTeam
              : team
          )
        );

        addSiteUpdate({
          title: "Team Updated",
          desc: `${updatedTeam.name}'s team record or information was updated.`,
          category: "teams",
          origin: "teams",
          type: "team",
          link: "/teams",
          showInNews: true,
          showInNotifications: true,
        });

        setSuccessMessage(
          `${updatedTeam.name} was updated successfully.`
        );
      }

      // ======================================================
      // CREATE
      // ======================================================

      else {
        const response =
          await teamAPI.create(payload);

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
          title: "New Team Added",
          desc: `${createdTeam.name} joined the J-Town Hoops league standings.`,
          category: "teams",
          origin: "teams",
          type: "team",
          link: "/teams",
          showInNews: true,
          showInNotifications: true,
        });

        setSuccessMessage(
          `${createdTeam.name} was added successfully.`
        );
      }

      resetLogoUploadState();

      setShowEditor(false);
      setEditingId(null);
      setForm(createBlankTeam());
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
  // ADJUST RECORD
  // ==========================================================

  const adjust = async (
    team,
    field,
    delta
  ) => {
    if (!isAdmin) return;

    const teamId = getTeamId(team);

    if (!teamId) return;

    const oldValue =
      Number(team[field] || 0);

    const newValue =
      Math.max(0, oldValue + delta);

    if (newValue === oldValue) {
      return;
    }

    try {
      setActionId(teamId);
      setError("");

      const response =
        await teamAPI.update(
          teamId,
          {
            [field]: newValue,
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
          getTeamId(item) === teamId
            ? updatedTeam
            : item
        )
      );

      addSiteUpdate({
        title: "Team Updated",
        desc: `${updatedTeam.name}'s team record was updated to ${updatedTeam.wins} win(s) and ${updatedTeam.losses} loss(es).`,
        category: "teams",
        origin: "teams",
        type: "team",
        link: "/teams",
        showInNews: true,
        showInNotifications: true,
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
    if (!isAdmin) return;

    const teamId = getTeamId(team);

    if (!teamId) return;

    const confirmed =
      window.confirm(
        `Delete ${team.name}?`
      );

    if (!confirmed) return;

    try {
      setActionId(teamId);
      setError("");

      await teamAPI.remove(teamId);

      setTeams((previous) =>
        previous.filter(
          (item) =>
            getTeamId(item) !== teamId
        )
      );

      if (
        selectedTeamId === teamId
      ) {
        setSelectedTeamId(null);
      }

      addSiteUpdate({
        title: "Team Removed",
        desc: `${team.name} was removed from the league standings.`,
        category: "teams",
        origin: "teams",
        type: "team",
        link: "/teams",
        showInNews: true,
        showInNotifications: true,
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
  // REFRESH
  // ==========================================================

  const refreshTeams = async () => {
    await loadTeams({
      showLoader: false,
    });
  };

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div
      className="min-h-screen text-white py-10 px-4 sm:px-6 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.58),rgba(0,0,0,.64)),url(${backgroundImage})`,
      }}
    >
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 border-b border-neutral-800 pb-6 mb-8">
          <div>
            <p className="text-orange-400 text-xs font-black uppercase tracking-[.35em]">
              League Control Centre
            </p>

            <h1 className="text-4xl font-black uppercase flex items-center gap-3 mt-2">
              <Trophy className="text-orange-500" />
              League Standings
            </h1>

            <p className="text-neutral-400 mt-2">
              Records auto-rank by win percentage.
              Team information is synchronized with
              the J-Town Hoops database.
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={refreshTeams}
              disabled={loading}
              className="bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 border border-neutral-800 text-white font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={openAdd}
                className="bg-orange-500 hover:bg-orange-400 text-black font-black px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={18} />
                Add Team
              </button>
            )}
          </div>
        </div>

        {/* SUCCESS */}

        {successMessage && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-300 rounded-xl px-4 py-3">
            {successMessage}
          </div>
        )}

        {/* ERROR */}

        {error && !showEditor && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 flex items-start gap-3">
            <AlertCircle
              size={19}
              className="shrink-0 mt-0.5"
            />

            <div>
              <p className="font-bold">
                Something went wrong
              </p>

              <p className="text-sm mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* LOADING */}

        {loading && (
          <div className="min-h-[300px] flex flex-col items-center justify-center text-neutral-400">
            <Loader2
              size={36}
              className="animate-spin text-orange-500"
            />

            <p className="mt-4 font-bold">
              Loading league standings...
            </p>
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          rankedTeams.length === 0 && (
            <div className="bg-black/75 border border-neutral-800 rounded-2xl p-10 text-center">
              <Trophy
                size={42}
                className="mx-auto text-orange-500"
              />

              <h2 className="text-2xl font-black mt-4">
                No Teams Yet
              </h2>

              <p className="text-neutral-400 mt-2">
                There are currently no active
                teams in the J-Town Hoops database.
              </p>

              {isAdmin && (
                <button
                  type="button"
                  onClick={openAdd}
                  className="mt-6 bg-orange-500 hover:bg-orange-400 text-black font-black px-5 py-3 rounded-xl inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={18} />
                  Add First Team
                </button>
              )}
            </div>
          )}

        {/* TEAMS */}

        {!loading && (
          <div className="space-y-4">
            {rankedTeams.map(
              (team, index) => {
                const teamId =
                  getTeamId(team);

                const wins =
                  Number(team.wins || 0);

                const losses =
                  Number(team.losses || 0);

                const games =
                  wins + losses;

                const pct =
                  games > 0
                    ? Math.round(
                        (wins / games) * 100
                      )
                    : 0;

                const busy =
                  actionId === teamId;

                return (
                  <article
                    key={teamId}
                    className="bg-black/75 border border-neutral-800 hover:border-orange-500/50 rounded-2xl p-5 transition-all"
                  >
                    <div className="grid lg:grid-cols-[70px_1fr_180px_220px] gap-5 items-center">

                      <div className="text-center">
                        <span className="text-3xl font-black text-orange-500">
                          #{index + 1}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedTeamId(
                            teamId
                          )
                        }
                        className="flex items-center gap-4 text-left cursor-pointer"
                      >
                        <img
                          src={getTeamLogo(team)}
                          alt={team.name}
                          className="w-16 h-16 rounded-2xl object-cover border border-neutral-700"
                          onError={(event) => {
                            event.currentTarget.src =
                              jtownTeamLogo;
                          }}
                        />

                        <div>
                          <h2 className="text-xl font-black">
                            {team.name}
                          </h2>

                          <p className="text-xs text-neutral-400 uppercase">
                            {team.division}
                          </p>

                          <div className="h-1.5 w-40 max-w-full bg-neutral-800 rounded-full mt-2 overflow-hidden">
                            <div
                              className="h-full bg-orange-500"
                              style={{
                                width: `${pct}%`,
                              }}
                            />
                          </div>

                          <p className="text-[10px] text-neutral-500 mt-1">
                            {pct}% win rate
                          </p>
                        </div>
                      </button>

                      <div className="text-center bg-neutral-900 rounded-xl py-3">
                        <div className="text-2xl font-black">
                          {wins}

                          <span className="text-neutral-600 mx-2">
                            -
                          </span>

                          {losses}
                        </div>

                        <div className="text-[10px] uppercase text-neutral-500">
                          Wins • Losses
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 flex-wrap">
                        {isAdmin && (
                          <>
                            <Mini
                              disabled={busy}
                              onClick={() =>
                                adjust(
                                  team,
                                  "wins",
                                  1
                                )
                              }
                              icon={
                                <Plus size={14} />
                              }
                              text="Win"
                            />

                            <Mini
                              disabled={busy}
                              onClick={() =>
                                adjust(
                                  team,
                                  "wins",
                                  -1
                                )
                              }
                              icon={
                                <Minus size={14} />
                              }
                              text="Win"
                            />

                            <Mini
                              disabled={busy}
                              onClick={() =>
                                adjust(
                                  team,
                                  "losses",
                                  1
                                )
                              }
                              icon={
                                <Plus size={14} />
                              }
                              text="Loss"
                            />

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                openEdit(team)
                              }
                              className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-black disabled:opacity-40 cursor-pointer"
                              title="Edit team"
                            >
                              <Pencil
                                size={16}
                              />
                            </button>

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                del(team)
                              }
                              className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white disabled:opacity-40 cursor-pointer"
                              title="Delete team"
                            >
                              {busy ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={16}
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

      {/* TEAM DETAILS MODAL */}

      {active && (
        <div
          className="fixed inset-0 z-[12000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() =>
            setSelectedTeamId(null)
          }
        >
          <div
            className="w-full max-w-xl bg-[#111] border border-neutral-800 rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex justify-between gap-4">
              <div className="flex gap-4">
                <img
                  src={getTeamLogo(active)}
                  alt={active.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-neutral-700"
                  onError={(event) => {
                    event.currentTarget.src =
                      jtownTeamLogo;
                  }}
                />

                <div>
                  <h2 className="text-2xl font-black">
                    {active.name}
                  </h2>

                  <p className="text-orange-400">
                    {active.division}
                  </p>

                  <p className="text-neutral-500 text-sm mt-1">
                    {Number(
                      active.wins || 0
                    )}{" "}
                    wins •{" "}
                    {Number(
                      active.losses || 0
                    )}{" "}
                    losses
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTeamId(null)
                }
                className="self-start p-2 rounded-lg hover:bg-neutral-900 cursor-pointer"
              >
                <X />
              </button>
            </div>

            <h3 className="font-black mt-6 flex gap-2 items-center">
              <Users size={18} />
              Roster
            </h3>

            <div className="mt-3 space-y-2">
              {Array.isArray(
                active.roster
              ) &&
              active.roster.length > 0 ? (
                active.roster.map(
                  (player, index) => (
                    <div
                      key={
                        player?._id ||
                        `${player?.name}-${index}`
                      }
                      className="bg-neutral-900 rounded-xl p-3 flex justify-between gap-3"
                    >
                      <span>
                        {player?.number !==
                          undefined &&
                        player?.number !==
                          null
                          ? `#${player.number} `
                          : ""}

                        <b>
                          {player?.name}
                        </b>

                        {player?.pos
                          ? ` • ${player.pos}`
                          : ""}
                      </span>

                      {player?.stat && (
                        <span className="text-orange-400 text-right">
                          {player.stat}
                        </span>
                      )}
                    </div>
                  )
                )
              ) : (
                <p className="text-neutral-500">
                  No roster entries yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}

      {showEditor && isAdmin && (
        <div className="fixed inset-0 z-[12000] bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
          <form
            onSubmit={save}
            className="w-full max-w-2xl bg-[#111] border border-neutral-800 rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-black">
                  {editingId
                    ? "Edit Team"
                    : "Add Team"}
                </h2>

                <p className="text-neutral-500 text-sm mt-1">
                  Team information is stored
                  in MongoDB. Uploaded logos
                  are stored in Cloudinary.
                </p>
              </div>

              <button
                type="button"
                disabled={
                  saving ||
                  uploadingLogo
                }
                onClick={closeEditor}
                className="p-2 rounded-lg hover:bg-neutral-900 disabled:opacity-40 cursor-pointer"
              >
                <X />
              </button>
            </div>

            {/* FORM ERROR */}

            {error && (
              <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm flex gap-3">
                <AlertCircle
                  size={18}
                  className="shrink-0 mt-0.5"
                />

                <span>{error}</span>
              </div>
            )}

            {/* BASIC FIELDS */}

            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Team Name"
                value={form.name}
                set={(value) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      name: value,
                    })
                  )
                }
                required
              />

              <Field
                label="Division"
                value={form.division}
                set={(value) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      division: value,
                    })
                  )
                }
              />

              <Field
                label="Wins"
                type="number"
                min="0"
                value={form.wins}
                set={(value) =>
                  setForm(
                    (previous) => ({
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
                value={form.losses}
                set={(value) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      losses: value,
                    })
                  )
                }
              />
            </div>

            {/* ==================================================
                TEAM LOGO UPLOAD
            ================================================== */}

            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon
                  size={19}
                  className="text-orange-400"
                />

                <h3 className="font-black">
                  Team Logo
                </h3>
              </div>

              <div className="border border-neutral-800 bg-neutral-950 rounded-2xl p-5">

                {/* PREVIEW */}

                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="shrink-0">
                    <img
                      src={
                        logoPreview ||
                        form.logo ||
                        jtownTeamLogo
                      }
                      alt="Team logo preview"
                      className="w-28 h-28 rounded-2xl object-cover border border-neutral-700 bg-black"
                      onError={(event) => {
                        event.currentTarget.src =
                          jtownTeamLogo;
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <p className="font-bold">
                      Choose a logo from
                      your computer
                    </p>

                    <p className="text-neutral-500 text-sm mt-1">
                      JPG, PNG or WEBP.
                      Maximum size: 5 MB.
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={
                        handleLogoSelection
                      }
                      className="hidden"
                    />

                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        type="button"
                        disabled={
                          uploadingLogo ||
                          saving
                        }
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black font-black px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
                      >
                        <ImageIcon
                          size={17}
                        />

                        {selectedLogoFile
                          ? "Change Logo"
                          : "Choose Logo"}
                      </button>

                      {selectedLogoFile && (
                        <button
                          type="button"
                          disabled={
                            uploadingLogo ||
                            saving
                          }
                          onClick={
                            uploadSelectedLogo
                          }
                          className="bg-blue-500/15 hover:bg-blue-500 text-blue-300 hover:text-white border border-blue-500/30 font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
                        >
                          {uploadingLogo ? (
                            <>
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload
                                size={17}
                              />
                              Upload Logo
                            </>
                          )}
                        </button>
                      )}

                      {(form.logo ||
                        selectedLogoFile) && (
                        <button
                          type="button"
                          disabled={
                            uploadingLogo ||
                            saving
                          }
                          onClick={removeLogo}
                          className="bg-red-500/10 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/20 font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2
                            size={16}
                          />
                          Remove
                        </button>
                      )}
                    </div>

                    {selectedLogoFile && (
                      <div className="mt-3 text-xs text-neutral-400">
                        Selected:{" "}
                        <span className="text-white font-bold">
                          {
                            selectedLogoFile.name
                          }
                        </span>
                      </div>
                    )}

                    {logoUploadSuccess && (
                      <div className="mt-3 flex items-center gap-2 text-green-400 text-sm font-bold">
                        <CheckCircle2
                          size={17}
                        />
                        Logo uploaded successfully.
                      </div>
                    )}
                  </div>
                </div>

                {/* URL OPTION */}

                <div className="border-t border-neutral-800 mt-5 pt-5">
                  <p className="text-xs text-neutral-500 mb-2">
                    Or paste an existing
                    image URL:
                  </p>

                  <input
                    type="text"
                    value={form.logo}
                    disabled={
                      uploadingLogo ||
                      saving
                    }
                    placeholder="https://..."
                    onChange={(event) => {
                      const value =
                        event.target.value;

                      setForm(
                        (previous) => ({
                          ...previous,
                          logo: value,
                        })
                      );

                      if (
                        !selectedLogoFile
                      ) {
                        setLogoPreview(
                          value
                        );
                      }

                      setLogoUploadSuccess(
                        false
                      );
                    }}
                    className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-white outline-none focus:border-orange-500 disabled:opacity-50"
                  />
                </div>

                <p className="text-xs text-neutral-600 mt-3">
                  If no logo is supplied,
                  the default J-Town team
                  logo will be displayed.
                </p>
              </div>
            </div>

            {/* SAVE */}

            <button
              type="submit"
              disabled={
                saving ||
                uploadingLogo
              }
              className="mt-6 w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-3 rounded-xl flex justify-center items-center gap-2 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  {selectedLogoFile
                    ? "Uploading & Saving..."
                    : "Saving..."}
                </>
              ) : uploadingLogo ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Uploading Logo...
                </>
              ) : (
                <>
                  <Save size={17} />

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
// MINI BUTTON
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
      className="px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold flex items-center gap-1 cursor-pointer"
    >
      {icon}
      {text}
    </button>
  );
}

// ============================================================
// FIELD
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
    <label className="text-sm text-neutral-400">
      {label}

      <input
        type={type}
        min={min}
        required={required}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(event) =>
          set(event.target.value)
        }
        className="mt-1 w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white outline-none focus:border-orange-500"
      />
    </label>
  );
}