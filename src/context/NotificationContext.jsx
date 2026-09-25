import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// ============================================================
// J-TOWN HOOPS LOCAL IMAGES
// Imported through Vite so they also work correctly on Vercel.
// ============================================================
import jtownTeamLogo from "../images/jtownteamlogo.jpg";
import bigFemoImage from "../images/bigfemo.jpg";

const NotificationContext = createContext(null);

// ============================================================
// LOCAL STORAGE KEYS
// We keep your existing keys so your current structure remains.
// ============================================================
const KEYS = {
  feed: "jtown-hoops-site-feed-v3",
  settings: "jtown-hoops-notification-settings-v3",
  schedule: "jtown-hoops-schedule-v3",
  teams: "jtown-hoops-teams-v3",
  players: "jtown-hoops-players-v3",
};

// ============================================================
// DEFAULT NOTIFICATIONS / NEWS
// ============================================================
const DEFAULT_FEED = [
  {
    id: "default-1",
    category: "games",
    origin: "news",
    type: "news",
    title: "Championship Finals Set!",
    desc: "J-Town Hoops vs Eastside Wolves this Saturday night.",
    date: "10 Aug 2026, 07:30 PM",
    createdAt: "2026-08-10T18:30:00.000Z",
    read: true,
    showInNews: true,
    showInNotifications: true,
    link: "/schedule",
  },
  {
    id: "default-2",
    category: "schedule",
    origin: "system",
    type: "schedule",
    title: "Schedule Revision",
    desc: "Week 6 game timings have been pushed forward by 1 hour.",
    date: "09 Aug 2026, 04:15 PM",
    createdAt: "2026-08-09T15:15:00.000Z",
    read: true,
    showInNews: true,
    showInNotifications: true,
    link: "/schedule",
  },
  {
    id: "default-3",
    category: "players",
    origin: "news",
    type: "player",
    title: "Player MVP Race Update",
    desc: "Marcus Vance leads the league statistics chart this week.",
    date: "08 Aug 2026, 11:00 AM",
    createdAt: "2026-08-08T10:00:00.000Z",
    read: true,
    showInNews: true,
    showInNotifications: true,
    link: "/players",
  },
];

// ============================================================
// DEFAULT SCHEDULE
//
// IMPORTANT:
// The old version used:
// "/src/images/jtownteamlogo.jpg"
//
// We now use the imported image variable so Vite creates the
// correct production URL for Vercel.
// ============================================================
const DEFAULT_SCHEDULE = [
  {
    id: 1,
    status: "live",
    time: "Q4 - 02:45",
    date: "TODAY",
    venue: "City Dome Arena (Court A)",
    broadcast: "Sports Network Live",

    homeTeam: "J-Town Hoops",
    homeLogo: jtownTeamLogo,
    homeScore: 92,

    awayTeam: "Eastside Wolves",
    awayLogo: jtownTeamLogo,
    awayScore: 89,

    gameType: "Championship Finals - Game 1",
  },

  {
    id: 2,
    status: "upcoming",
    time: "7:30 PM",
    date: "Sat, Aug 15",
    venue: "City Dome Arena (Court A)",
    broadcast: "League Pass / YouTube",

    homeTeam: "Eastside Wolves",
    homeLogo: jtownTeamLogo,
    homeScore: null,

    awayTeam: "J-Town Hoops",
    awayLogo: jtownTeamLogo,
    awayScore: null,

    gameType: "Championship Finals - Game 2",
  },

  {
    id: 3,
    status: "completed",
    time: "FINAL",
    date: "Aug 04, 2026",
    venue: "Downtown Sports Complex",
    broadcast: "Recorded Stream Available",

    homeTeam: "J-Town Hoops",
    homeLogo: jtownTeamLogo,
    homeScore: 98,

    awayTeam: "Metro Titans",
    awayLogo: jtownTeamLogo,
    awayScore: 84,

    gameType: "Semi-Finals",
  },
];

// ============================================================
// DEFAULT TEAMS
// ============================================================
const DEFAULT_TEAMS = [
  {
    id: 1,
    name: "J-Town Hoops",
    logo: jtownTeamLogo,
    wins: 14,
    losses: 2,
    division: "North Conference",

    roster: [
      {
        name: "Marcus Vance",
        number: "23",
        pos: "Forward",
        stat: "28.4 PPG",
      },
      {
        name: "Tobi Adebayo",
        number: "04",
        pos: "Guard",
        stat: "8.9 APG",
      },
      {
        name: "DeAndre Cole",
        number: "11",
        pos: "Center",
        stat: "11.5 RPG",
      },
    ],
  },

  {
    id: 2,
    name: "Eastside Wolves",
    logo: jtownTeamLogo,
    wins: 13,
    losses: 3,
    division: "North Conference",

    roster: [
      {
        name: "DeAndre Cole",
        number: "11",
        pos: "Center",
        stat: "24.1 PPG",
      },
      {
        name: "Kevin Hayes",
        number: "01",
        pos: "Guard",
        stat: "5.5 APG",
      },
    ],
  },

  {
    id: 3,
    name: "Metro Titans",
    logo: jtownTeamLogo,
    wins: 10,
    losses: 6,
    division: "South Conference",

    roster: [
      {
        name: "Derrick Brooks",
        number: "99",
        pos: "Forward",
        stat: "22.3 PPG",
      },
      {
        name: "Chris Paulson",
        number: "03",
        pos: "Guard",
        stat: "7.1 APG",
      },
    ],
  },
];

// ============================================================
// DEFAULT PLAYERS
// All old "/src/images/..." avatar paths have been removed.
// ============================================================
const DEFAULT_PLAYERS = [
  {
    id: 1,
    name: "Marcus Vance",
    number: "23",
    position: "Guard / Forward",
    avatar: bigFemoImage,

    stats: {
      ppg: 28.4,
      apg: 6.2,
      rpg: 5.8,
    },

    status: "MVP Candidate",
    isAllStar: true,

    bio: "Marcus Vance entered the league out of J-Town State University, immediately setting franchise scoring records.",

    height: "6'6\"",
    weight: "210 lbs",
    hometown: "J-Town City",
    experience: "5 Seasons",
    college: "J-Town State University",
  },

  {
    id: 2,
    name: "Tobi Emmanuel",
    number: "03",
    position: "Point Guard",
    avatar: jtownTeamLogo,

    stats: {
      ppg: 30.5,
      apg: 15.9,
      rpg: 10.1,
    },

    status: "Assists Leader",
    isAllStar: true,

    bio: "Tobi is the core floor general and engine room of J-Town Hoops. With elite court vision.",

    height: "5'9\"",
    weight: "185 lbs",
    hometown: "Jos, Nigeria",
    experience: "3 Seasons",
    college: "Plateau State University",
  },

  {
    id: 3,
    name: "Mike Okafo",
    number: "11",
    position: "Guard / Forward",
    avatar: bigFemoImage,

    stats: {
      ppg: 28.4,
      apg: 6.2,
      rpg: 5.8,
    },

    status: "MVP Candidate",
    isAllStar: true,

    bio: "Mike entered the league out of J-Town State University, immediately setting franchise scoring records.",

    height: "6'6\"",
    weight: "210 lbs",
    hometown: "J-Town City",
    experience: "5 Seasons",
    college: "University of Jos",
  },

  {
    id: 4,
    name: "Ibrahim Musa",
    number: "14",
    position: "Point Guard",
    avatar: jtownTeamLogo,

    stats: {
      ppg: 18.5,
      apg: 8.9,
      rpg: 4.1,
    },

    status: "Assists Leader",
    isAllStar: true,

    bio: "Ibrahim is the core floor general and engine room of J-Town Hoops.",

    height: "6'1\"",
    weight: "185 lbs",
    hometown: "Lagos, Nigeria",
    experience: "3 Seasons",
    college: "Metropolitan Academy",
  },

  {
    id: 5,
    name: "Vincent Owaila",
    number: "13",
    position: "Guard / Forward",
    avatar: bigFemoImage,

    stats: {
      ppg: 28.4,
      apg: 6.2,
      rpg: 5.8,
    },

    status: "MVP Candidate",
    isAllStar: true,

    bio: "Owaila entered the league out of J-Town State University, immediately setting franchise scoring records.",

    height: "6'6\"",
    weight: "210 lbs",
    hometown: "F.C.T",
    experience: "5 Seasons",
    college: "Abuja State University",
  },

  {
    id: 6,
    name: "Ade Yohanna",
    number: "06",
    position: "Point Guard",
    avatar: jtownTeamLogo,

    stats: {
      ppg: 18.5,
      apg: 8.9,
      rpg: 4.1,
    },

    status: "Assists Leader",
    isAllStar: true,

    bio: "Ade Yohanna is the core floor general and engine room of J-Town Hoops.",

    height: "6'1\"",
    weight: "185 lbs",
    hometown: "Benue, Nigeria",
    experience: "3 Seasons",
    college: "Nigerian Defence Academy",
  },

  {
    id: 7,
    name: "Bright Madaki",
    number: "07",
    position: "Guard / Forward",
    avatar: bigFemoImage,

    stats: {
      ppg: 28.4,
      apg: 6.2,
      rpg: 5.8,
    },

    status: "MVP Candidate",
    isAllStar: true,

    bio: "Bright Madaki entered the league out of J-Town State University, immediately setting franchise scoring records.",

    height: "6'6\"",
    weight: "210 lbs",
    hometown: "Port Harcourt",
    experience: "5 Seasons",
    college: "University of Ibadan",
  },

  {
    id: 8,
    name: "Romeo Abbas",
    number: "10",
    position: "Point Guard",
    avatar: jtownTeamLogo,

    stats: {
      ppg: 18.5,
      apg: 8.9,
      rpg: 4.1,
    },

    status: "Assists Leader",
    isAllStar: true,

    bio: "Romeo is the core floor general and engine room of J-Town Hoops.",

    height: "6'1\"",
    weight: "185 lbs",
    hometown: "Lagos, Nigeria",
    experience: "3 Seasons",
    college: "Federal College of Education",
  },
];

// ============================================================
// HELPERS
// ============================================================
const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const formatDate = (date) =>
  date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const load = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);

    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

// ============================================================
// NOTIFICATION PROVIDER
// ============================================================
export function NotificationProvider({ children, user }) {
  const [feed, setFeed] = useState(() =>
    load(KEYS.feed, DEFAULT_FEED)
  );

  const [scheduleGames, setScheduleGames] = useState(() =>
    load(KEYS.schedule, DEFAULT_SCHEDULE)
  );

  const [teamsData, setTeamsData] = useState(() =>
    load(KEYS.teams, DEFAULT_TEAMS)
  );

  const [playersData, setPlayersData] = useState(() =>
    load(KEYS.players, DEFAULT_PLAYERS)
  );

  const [notificationSettings, setNotificationSettings] = useState(() =>
    load(KEYS.settings, { enabled: true })
  );

  const [incoming, setIncoming] = useState(null);

  // ==========================================================
  // SAVE CURRENT DATA TO LOCAL STORAGE
  // Temporary frontend persistence until backend is connected.
  // ==========================================================
  useEffect(() => {
    localStorage.setItem(KEYS.feed, JSON.stringify(feed));
  }, [feed]);

  useEffect(() => {
    localStorage.setItem(
      KEYS.schedule,
      JSON.stringify(scheduleGames)
    );
  }, [scheduleGames]);

  useEffect(() => {
    localStorage.setItem(
      KEYS.teams,
      JSON.stringify(teamsData)
    );
  }, [teamsData]);

  useEffect(() => {
    localStorage.setItem(
      KEYS.players,
      JSON.stringify(playersData)
    );
  }, [playersData]);

  useEffect(() => {
    localStorage.setItem(
      KEYS.settings,
      JSON.stringify(notificationSettings)
    );
  }, [notificationSettings]);

  // ==========================================================
  // CREATE SITE UPDATE / NOTIFICATION
  // ==========================================================
  const addSiteUpdate = useCallback(
    ({
      title,
      desc,
      category = "general",
      origin = "system",
      type = "system",
      link = "/notifications",
      showInNews = false,
      showInNotifications = true,
      ownerEmail = null,
    }) => {
      const now = new Date();

      const update = {
        id: createId(),
        title,
        desc,
        category,
        origin,
        type,
        link,

        ownerEmail: ownerEmail
          ? String(ownerEmail).trim().toLowerCase()
          : null,

        createdAt: now.toISOString(),
        date: formatDate(now),

        read: false,
        showInNews,
        showInNotifications,
      };

      setFeed((prev) => [update, ...prev]);

      if (
        user &&
        notificationSettings.enabled &&
        showInNotifications
      ) {
        setIncoming(update);
      }

      return update;
    },
    [user, notificationSettings.enabled]
  );

  // ==========================================================
  // NEWS
  // ==========================================================
  const addNews = useCallback(
    (data) =>
      addSiteUpdate({
        ...data,
        category: data.category || "general",
        origin: "news",
        type: "news",
        link: data.link || "/news",
        showInNews: true,
        showInNotifications: true,
      }),
    [addSiteUpdate]
  );

  const updateNews = useCallback((id, changes) => {
    setFeed((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...changes }
          : item
      )
    );
  }, []);

  const removeNews = useCallback((id) => {
    setFeed((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }, []);

  // ==========================================================
  // MEDIA UPDATES
  // ==========================================================
  const addMediaUpdate = useCallback(
    ({
      action = "updated",
      mediaType = "media",
      title = "J-Town media",
    }) =>
      addSiteUpdate({
        title: `${mediaType} ${action}`,
        desc: `${title} was ${action} by an administrator.`,
        category: mediaType.toLowerCase(),
        origin: mediaType.toLowerCase(),
        type: "media",
        link: `/${mediaType.toLowerCase()}`,
        showInNews: false,
        showInNotifications: true,
      }),
    [addSiteUpdate]
  );

  // ==========================================================
  // SCHEDULE / GAMES
  // ==========================================================
  const addScheduleGame = useCallback(
    (game) => {
      const item = {
        ...game,
        id: game.id || createId(),
      };

      setScheduleGames((prev) => [
        item,
        ...prev,
      ]);

      addSiteUpdate({
        title: "New Game Added",
        desc: `${item.homeTeam} vs ${item.awayTeam} was added for ${item.date} at ${item.time}.`,
        category: "schedule",
        origin: "schedule",
        type: "schedule",
        link: "/schedule",
        showInNews: true,
      });

      return item;
    },
    [addSiteUpdate]
  );

  const updateScheduleGame = useCallback(
    (id, changes) => {
      let updated;

      setScheduleGames((prev) =>
        prev.map((game) => {
          if (game.id !== id) {
            return game;
          }

          updated = {
            ...game,
            ...changes,
          };

          return updated;
        })
      );

      const old = scheduleGames.find(
        (game) => game.id === id
      );

      if (old) {
        addSiteUpdate({
          title: "Game Updated",
          desc: `${old.homeTeam} vs ${old.awayTeam} schedule/game information was updated.`,
          category:
            changes.homeScore !== undefined ||
            changes.awayScore !== undefined
              ? "games"
              : "schedule",
          origin: "schedule",
          type: "schedule",
          link: "/schedule",
          showInNews: true,
        });
      }

      return updated;
    },
    [scheduleGames, addSiteUpdate]
  );

  const removeScheduleGame = useCallback(
    (id) => {
      const old = scheduleGames.find(
        (game) => game.id === id
      );

      setScheduleGames((prev) =>
        prev.filter((game) => game.id !== id)
      );

      if (old) {
        addSiteUpdate({
          title: "Game Removed",
          desc: `${old.homeTeam} vs ${old.awayTeam} was removed from the schedule.`,
          category: "schedule",
          origin: "schedule",
          type: "schedule",
          link: "/schedule",
          showInNews: true,
        });
      }
    },
    [scheduleGames, addSiteUpdate]
  );

  // ==========================================================
  // TEAMS
  // ==========================================================
  const addTeam = useCallback(
    (team) => {
      const item = {
        ...team,
        id: team.id || createId(),
        roster: team.roster || [],
      };

      setTeamsData((prev) => [
        ...prev,
        item,
      ]);

      addSiteUpdate({
        title: "New Team Added",
        desc: `${item.name} joined the J-Town Hoops league standings.`,
        category: "teams",
        origin: "teams",
        type: "team",
        link: "/teams",
        showInNews: true,
      });

      return item;
    },
    [addSiteUpdate]
  );

  const updateTeam = useCallback(
    (id, changes) => {
      const old = teamsData.find(
        (team) => team.id === id
      );

      setTeamsData((prev) =>
        prev.map((team) =>
          team.id === id
            ? {
                ...team,
                ...changes,
              }
            : team
        )
      );

      if (old) {
        addSiteUpdate({
          title: "Team Updated",
          desc: `${old.name}'s team record or information was updated.`,
          category: "teams",
          origin: "teams",
          type: "team",
          link: "/teams",
          showInNews: true,
        });
      }
    },
    [teamsData, addSiteUpdate]
  );

  const removeTeam = useCallback(
    (id) => {
      const old = teamsData.find(
        (team) => team.id === id
      );

      setTeamsData((prev) =>
        prev.filter((team) => team.id !== id)
      );

      if (old) {
        addSiteUpdate({
          title: "Team Removed",
          desc: `${old.name} was removed from the league standings.`,
          category: "teams",
          origin: "teams",
          type: "team",
          link: "/teams",
          showInNews: true,
        });
      }
    },
    [teamsData, addSiteUpdate]
  );

  // ==========================================================
  // PLAYERS
  // ==========================================================
  const addPlayer = useCallback(
    (player) => {
      const item = {
        ...player,
        id: player.id || createId(),

        stats:
          player.stats || {
            ppg: 0,
            apg: 0,
            rpg: 0,
          },
      };

      setPlayersData((prev) => [
        ...prev,
        item,
      ]);

      addSiteUpdate({
        title: "New Player Added",
        desc: `${item.name} was added to the J-Town Hoops player roster.`,
        category: "players",
        origin: "players",
        type: "player",
        link: "/players",
        showInNews: true,
      });

      return item;
    },
    [addSiteUpdate]
  );

  const updatePlayer = useCallback(
    (id, changes) => {
      const old = playersData.find(
        (player) => player.id === id
      );

      setPlayersData((prev) =>
        prev.map((player) =>
          player.id === id
            ? {
                ...player,
                ...changes,

                stats: {
                  ...player.stats,
                  ...(changes.stats || {}),
                },
              }
            : player
        )
      );

      if (old) {
        addSiteUpdate({
          title: "Player Updated",
          desc: `${old.name}'s player profile or statistics were updated.`,
          category: "players",
          origin: "players",
          type: "player",
          link: "/players",
          showInNews: true,
        });
      }
    },
    [playersData, addSiteUpdate]
  );

  const removePlayer = useCallback(
    (id) => {
      const old = playersData.find(
        (player) => player.id === id
      );

      setPlayersData((prev) =>
        prev.filter(
          (player) => player.id !== id
        )
      );

      if (old) {
        addSiteUpdate({
          title: "Player Removed",
          desc: `${old.name} was removed from the player roster.`,
          category: "players",
          origin: "players",
          type: "player",
          link: "/players",
          showInNews: true,
        });
      }
    },
    [playersData, addSiteUpdate]
  );

  // ==========================================================
  // NOTIFICATION CONTROLS
  // ==========================================================
  const markAsRead = useCallback((id) => {
    setFeed((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              read: true,
            }
          : item
      )
    );
  }, []);

  const markAllRead = useCallback(() => {
    setFeed((prev) =>
      prev.map((item) => ({
        ...item,
        read: true,
      }))
    );
  }, []);

  const removeUpdate = useCallback((id) => {
    setFeed((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }, []);

  const clearAllUpdates = useCallback(() => {
    setFeed([]);
  }, []);

  const dismissIncoming = useCallback(() => {
    setIncoming(null);
  }, []);

  const setNotificationsEnabled = useCallback(
    (enabled) => {
      setNotificationSettings({
        enabled,
      });
    },
    []
  );

  // ==========================================================
  // CURRENT USER NOTIFICATIONS
  // ==========================================================
  const currentUserEmail = String(
    user?.email || ""
  )
    .trim()
    .toLowerCase();

  const notificationFeed = useMemo(
    () =>
      feed.filter((item) => {
        if (
          item.showInNotifications === false
        ) {
          return false;
        }

        // Public/global notification
        if (!item.ownerEmail) {
          return true;
        }

        // Personal notification
        return (
          Boolean(currentUserEmail) &&
          item.ownerEmail === currentUserEmail
        );
      }),
    [feed, currentUserEmail]
  );

  const newsFeed = useMemo(
    () =>
      feed.filter(
        (item) =>
          item.showInNews !== false
      ),
    [feed]
  );

  const unreadCount =
    user && notificationSettings.enabled
      ? notificationFeed.filter(
          (item) => !item.read
        ).length
      : 0;

  // ==========================================================
  // SHARED CONTEXT VALUE
  // Keep these names unchanged because Navbar, News,
  // Notifications, Schedule, Teams and Players may use them.
  // ==========================================================
  const value = {
    feed,
    notificationFeed,
    newsFeed,
    unreadCount,
    incoming,

    addSiteUpdate,

    addNews,
    updateNews,
    removeNews,

    addMediaUpdate,

    markAsRead,
    markAllRead,
    removeUpdate,
    clearAllUpdates,
    dismissIncoming,

    notificationsEnabled:
      notificationSettings.enabled,

    setNotificationsEnabled,

    isSignedIn: Boolean(user),

    scheduleGames,
    addScheduleGame,
    updateScheduleGame,
    removeScheduleGame,

    teamsData,
    addTeam,
    updateTeam,
    removeTeam,

    playersData,
    addPlayer,
    updatePlayer,
    removePlayer,
  };

  return (
    <NotificationContext.Provider
      value={value}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ============================================================
// CUSTOM HOOK
// ============================================================
export function useNotifications() {
  const context = useContext(
    NotificationContext
  );

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}

export default NotificationContext;