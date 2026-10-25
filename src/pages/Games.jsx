import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Radio,
  CalendarDays,
  MapPin,
  Tv,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  FaChessKnight,
  FaBasketballBall,
  FaFutbol,
  FaCar,
  FaPuzzlePiece,
  FaCrown,
  FaGamepad,
  FaCrosshairs,
} from "react-icons/fa";

import myBackground from "../images/mybackground4.jpg";
import defaultTeamLogo from "../images/jtownteamlogo.jpg";

import { scheduleAPI } from "../services/api";

// ============================================================
// 🎮 J-TOWN HOOPS GAMES PAGE
// ============================================================
//
// Schedule.jsx is the master control.
//
// Schedule.jsx
//      ↓
// /api/v1/schedules
//      ↓
// MongoDB Atlas
//      ↓
// Games.jsx
//
// Add/Edit/Delete happens from Schedule.jsx.
// Games.jsx displays the same MongoDB records.
//
// ============================================================

export default function Games() {
  // ==========================================================
  // SCHEDULE DATA
  // ==========================================================

  const [scheduleGames, setScheduleGames] = useState([]);

  // ==========================================================
  // PAGE STATE
  // ==========================================================

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD SCHEDULE FROM BACKEND / MONGODB
  // ==========================================================

  const loadSchedule = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await scheduleAPI.getAll();

      // Support a few possible response shapes safely.
      const schedules = Array.isArray(response)
        ? response
        : Array.isArray(response?.schedules)
        ? response.schedules
        : Array.isArray(response?.data?.schedules)
        ? response.data.schedules
        : [];

      setScheduleGames(schedules);
    } catch (err) {
      console.error("GAMES SCHEDULE LOAD ERROR:", err);

      setError(
        err?.message ||
          "The J-Town Hoops game schedule could not be loaded."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ==========================================================
  // LOAD WHEN PAGE OPENS
  // ==========================================================

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  // ==========================================================
  // GROUP BASKETBALL GAMES
  // ==========================================================

  const grouped = useMemo(() => {
    return {
      live: scheduleGames.filter(
        (game) => String(game.status).toLowerCase() === "live"
      ),

      upcoming: scheduleGames.filter(
        (game) => String(game.status).toLowerCase() === "upcoming"
      ),

      completed: scheduleGames.filter(
        (game) => String(game.status).toLowerCase() === "completed"
      ),
    };
  }, [scheduleGames]);

  const totalBasketballGames =
    grouped.live.length +
    grouped.upcoming.length +
    grouped.completed.length;

  // ==========================================================
  // ONLINE GAMES PORTAL
  // ==========================================================

  const games = [
    {
      title: "Chess",
      description: "Challenge your mind with classic chess.",
      icon: <FaChessKnight size={40} className="text-amber-400" />,
      link: "https://www.chess.com/play",
    },
    {
      title: "Basketball Legends",
      description: "Play exciting online basketball matches.",
      icon: <FaBasketballBall size={40} className="text-orange-500" />,
      link: "https://www.crazygames.com/game/basketball-legends",
    },
    {
      title: "Football Soccer",
      description: "Kick off fun soccer matches online.",
      icon: <FaFutbol size={40} className="text-green-500" />,
      link: "https://www.miniclip.com/games/soccer-stars/",
    },
    {
      title: "Car Racing",
      description: "Speed through thrilling race tracks.",
      icon: <FaCar size={40} className="text-red-500" />,
      link: "https://www.crazygames.com/t/car",
    },
    {
      title: "Block Puzzle",
      description: "Relax with addictive block puzzles.",
      icon: <FaPuzzlePiece size={40} className="text-blue-500" />,
      link: "https://www.blockpuzzle.com/",
    },
    {
      title: "Royal Match",
      description: "Match colorful tiles in royal style.",
      icon: <FaCrown size={40} className="text-yellow-400" />,
      link:
        "https://play.google.com/store/apps/details?id=com.dreamgames.royalmatch",
    },
    {
      title: "Arcade Games",
      description: "Classic arcade fun at your fingertips.",
      icon: <FaGamepad size={40} className="text-purple-500" />,
      link: "https://www.crazygames.com/t/arcade",
    },
    {
      title: "Pool",
      description: "Classic 8-ball pool online.",
      icon: <FaGamepad size={40} className="text-teal-400" />,
      link: "https://www.miniclip.com/games/8-ball-pool/",
    },
    {
      title: "Zuma Marble Blast",
      description: "Shoot marbles to clear the path.",
      icon: <FaPuzzlePiece size={40} className="text-pink-500" />,
      link: "https://www.crazygames.com/game/zuma",
    },
    {
      title: "Call of Duty",
      description: "Legendary FPS action game.",
      icon: <FaCrosshairs size={40} className="text-gray-300" />,
      link: "https://www.callofduty.com/play",
    },
    {
      title: "Purge",
      description: "Survive intense shooting battles.",
      icon: <FaCrosshairs size={40} className="text-red-600" />,
      link: "https://www.crazygames.com/game/purge",
    },
  ];

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div
      className="min-h-screen text-gray-100 py-12 px-4 sm:px-6 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.58),rgba(0,0,0,.64)),url(${myBackground})`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* ====================================================
            J-TOWN BASKETBALL GAME ROSTER
        ==================================================== */}

        <section className="mb-16">
          <div className="text-center mb-8">
            <p className="text-orange-400 text-xs font-black uppercase tracking-[.35em]">
              Synced directly from Schedule
            </p>

            <h1 className="text-4xl sm:text-5xl font-black uppercase mt-2">
              J-Town Game{" "}
              <span className="text-orange-500">Roster</span>
            </h1>

            <p className="text-neutral-400 mt-3 max-w-2xl mx-auto">
              Every live, upcoming and completed basketball game is pulled
              directly from the same J-Town Hoops master schedule.
            </p>

            {!loading && !error && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                <span className="text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-full">
                  Database connected
                </span>

                <span className="text-xs bg-black/50 border border-neutral-800 text-neutral-400 px-3 py-1.5 rounded-full">
                  {totalBasketballGames} basketball{" "}
                  {totalBasketballGames === 1 ? "game" : "games"}
                </span>

                <button
                  type="button"
                  onClick={() => loadSchedule({ silent: true })}
                  disabled={refreshing}
                  className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center gap-2 text-xs bg-black/50 border border-neutral-800 hover:border-orange-500/50 text-neutral-400 hover:text-orange-400 px-3 py-1.5 rounded-full transition-colors"
                >
                  <RefreshCw
                    size={13}
                    className={refreshing ? "animate-spin" : ""}
                  />

                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            )}
          </div>

          {/* ERROR */}

          {error && (
            <div className="max-w-3xl mx-auto mb-7 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />

                <div className="flex-1">
                  <p className="font-bold">
                    We could not load the basketball schedule.
                  </p>

                  <p className="text-sm mt-1 text-red-300/80">{error}</p>

                  <button
                    type="button"
                    onClick={() => loadSchedule()}
                    className="cursor-pointer mt-4 inline-flex items-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    <RefreshCw size={15} />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LOADING */}

          {loading && (
            <div className="bg-black/60 border border-neutral-800 rounded-2xl p-12 text-center">
              <Loader2
                size={38}
                className="animate-spin text-orange-500 mx-auto"
              />

              <p className="text-neutral-400 mt-4">
                Loading basketball games from J-Town Hoops...
              </p>
            </div>
          )}

          {/* GAME COLUMNS */}

          {!loading && !error && (
            <div className="grid lg:grid-cols-3 gap-6">
              <GameColumn
                title="Live Now"
                icon={<Radio size={18} />}
                games={grouped.live}
                empty="No live game right now."
                type="live"
              />

              <GameColumn
                title="Upcoming"
                icon={<CalendarDays size={18} />}
                games={grouped.upcoming}
                empty="No upcoming games."
                type="upcoming"
              />

              <GameColumn
                title="Completed"
                icon={<FaBasketballBall />}
                games={grouped.completed}
                empty="No completed games yet."
                type="completed"
              />
            </div>
          )}
        </section>

        {/* ====================================================
            ONLINE GAMES PORTAL
        ==================================================== */}

        <section className="border-t border-neutral-800 pt-12">
          <h2 className="text-4xl font-extrabold text-center text-amber-500 uppercase tracking-widest mb-3 animate-pulse">
            Games Portal
          </h2>

          <p className="text-center text-gray-400 mb-12">
            Explore and play exciting games online. Works on mobile and
            laptops!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game) => (
              <a
                key={game.title}
                href={game.link}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer group bg-[#141412] rounded-xl overflow-hidden shadow-lg border border-neutral-800 hover:border-amber-500/40 transition-all transform hover:-translate-y-2 hover:shadow-amber-500/20 p-6 flex flex-col items-center text-center"
              >
                <div className="mb-4 group-hover:scale-110 transition-transform duration-500">
                  {game.icon}
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                  {game.title}
                </h3>

                <p className="text-sm text-gray-400 mt-2">
                  {game.description}
                </p>

                <span className="mt-5 text-xs uppercase font-black tracking-wider text-amber-400">
                  Play now →
                </span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ============================================================
// 🏀 GAME COLUMN
// ============================================================

function GameColumn({ title, icon, games, empty, type }) {
  return (
    <div
      className={`bg-black/60 border rounded-2xl p-4 ${
        type === "live" ? "border-red-500/30" : "border-neutral-800"
      }`}
    >
      <h2
        className={`font-black uppercase flex items-center gap-2 mb-4 ${
          type === "live" ? "text-red-400" : "text-orange-400"
        }`}
      >
        {icon}

        {title}

        <span className="ml-auto text-xs bg-neutral-900 px-2 py-1 rounded-full text-neutral-400">
          {games.length}
        </span>
      </h2>

      <div className="space-y-3">
        {games.length ? (
          games.map((game) => (
            <BasketballGameCard
              key={game.id || game._id}
              game={game}
            />
          ))
        ) : (
          <div className="border border-dashed border-neutral-800 rounded-xl p-6 text-center text-neutral-600 text-sm">
            {empty}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 🏀 BASKETBALL GAME CARD
// ============================================================

function BasketballGameCard({ game }) {
  const hasScore =
    game.homeScore !== null &&
    game.homeScore !== undefined &&
    game.awayScore !== null &&
    game.awayScore !== undefined;

  return (
    <div
      className={`bg-[#141412] border rounded-xl p-4 transition-colors ${
        game.status === "live"
          ? "border-red-500/30"
          : "border-neutral-800 hover:border-orange-500/30"
      }`}
    >
      {/* TYPE + STATUS */}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase text-orange-400 font-black">
          {game.gameType || "Basketball Game"}
        </p>

        {game.status === "live" && (
          <span className="flex items-center gap-1 text-[9px] uppercase font-black bg-red-500/15 text-red-400 px-2 py-1 rounded-full animate-pulse">
            <Radio size={9} />
            Live
          </span>
        )}
      </div>

      {/* TEAMS */}

      <div className="flex items-center justify-between gap-3 my-3">
        <Team
          logo={game.homeLogo}
          name={game.homeTeam}
        />

        {/* SCORE */}

        <div className="text-center shrink-0">
          {hasScore ? (
            <p className="text-xl font-black font-mono">
              {game.homeScore}
              <span className="text-neutral-600 mx-1">:</span>
              {game.awayScore}
            </p>
          ) : (
            <p className="font-black text-orange-400">VS</p>
          )}

          <p className="text-[10px] text-neutral-500 mt-1">
            {game.time || "TBA"}
          </p>
        </div>

        <Team
          logo={game.awayLogo}
          name={game.awayTeam}
        />
      </div>

      {/* GAME INFORMATION */}

      <div className="text-[11px] text-neutral-500 border-t border-neutral-800 pt-3 space-y-1.5">
        <p className="flex gap-2 items-start">
          <CalendarDays size={13} className="shrink-0 mt-[1px]" />
          <span>{game.date || "Date TBA"}</span>
        </p>

        <p className="flex gap-2 items-start">
          <MapPin size={13} className="shrink-0 mt-[1px]" />
          <span>{game.venue || "Venue TBA"}</span>
        </p>

        <p className="flex gap-2 items-start">
          <Tv size={13} className="shrink-0 mt-[1px]" />
          <span>{game.broadcast || "Broadcast TBA"}</span>
        </p>

        {game.description && (
          <p className="pt-2 mt-2 border-t border-neutral-800/60 text-neutral-400 leading-relaxed">
            {game.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 🏆 TEAM
// ============================================================

function Team({ logo, name }) {
  return (
    <div className="flex-1 text-center min-w-0">
      <img
        src={logo || defaultTeamLogo}
        alt={name || "Basketball team"}
        onError={(event) => {
          // Prevent an infinite error loop if the fallback itself fails.
          event.currentTarget.onerror = null;
          event.currentTarget.src = defaultTeamLogo;
        }}
        className="w-11 h-11 rounded-full object-cover mx-auto border border-neutral-700"
      />

      <p
        className="text-xs font-bold mt-1 truncate"
        title={name || "Team"}
      >
        {name || "Team"}
      </p>
    </div>
  );
}