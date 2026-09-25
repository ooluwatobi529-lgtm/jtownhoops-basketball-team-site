import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const NotificationContext = createContext(null);

const KEYS = {
  feed: "jtown-hoops-site-feed-v3",
  settings: "jtown-hoops-notification-settings-v3",
  schedule: "jtown-hoops-schedule-v3",
  teams: "jtown-hoops-teams-v3",
  players: "jtown-hoops-players-v3",
};

const DEFAULT_FEED = [
  { id: "default-1", category: "games", origin: "news", type: "news", title: "Championship Finals Set!", desc: "J-Town Hoops vs Eastside Wolves this Saturday night.", date: "10 Aug 2026, 07:30 PM", createdAt: "2026-08-10T18:30:00.000Z", read: true, showInNews: true, showInNotifications: true, link: "/schedule" },
  { id: "default-2", category: "schedule", origin: "system", type: "schedule", title: "Schedule Revision", desc: "Week 6 game timings have been pushed forward by 1 hour.", date: "09 Aug 2026, 04:15 PM", createdAt: "2026-08-09T15:15:00.000Z", read: true, showInNews: true, showInNotifications: true, link: "/schedule" },
  { id: "default-3", category: "players", origin: "news", type: "player", title: "Player MVP Race Update", desc: "Marcus Vance leads the league statistics chart this week.", date: "08 Aug 2026, 11:00 AM", createdAt: "2026-08-08T10:00:00.000Z", read: true, showInNews: true, showInNotifications: true, link: "/players" },
];

const DEFAULT_SCHEDULE = [
  { id: 1, status: "live", time: "Q4 - 02:45", date: "TODAY", venue: "City Dome Arena (Court A)", broadcast: "Sports Network Live", homeTeam: "J-Town Hoops", homeLogo: "/src/images/jtownteamlogo.jpg", homeScore: 92, awayTeam: "Eastside Wolves", awayLogo: "/src/images/jtownteamlogo.jpg", awayScore: 89, gameType: "Championship Finals - Game 1" },
  { id: 2, status: "upcoming", time: "7:30 PM", date: "Sat, Aug 15", venue: "City Dome Arena (Court A)", broadcast: "League Pass / YouTube", homeTeam: "Eastside Wolves", homeLogo: "/src/images/jtownteamlogo.jpg", homeScore: null, awayTeam: "J-Town Hoops", awayLogo: "/src/images/jtownteamlogo.jpg", awayScore: null, gameType: "Championship Finals - Game 2" },
  { id: 3, status: "completed", time: "FINAL", date: "Aug 04, 2026", venue: "Downtown Sports Complex", broadcast: "Recorded Stream Available", homeTeam: "J-Town Hoops", homeLogo: "/src/images/jtownteamlogo.jpg", homeScore: 98, awayTeam: "Metro Titans", awayLogo: "/src/images/jtownteamlogo.jpg", awayScore: 84, gameType: "Semi-Finals" },
];

const DEFAULT_TEAMS = [
  { id: 1, name: "J-Town Hoops", logo: "/src/images/jtownteamlogo.jpg", wins: 14, losses: 2, division: "North Conference", roster: [{ name: "Marcus Vance", number: "23", pos: "Forward", stat: "28.4 PPG" }, { name: "Tobi Adebayo", number: "04", pos: "Guard", stat: "8.9 APG" }, { name: "DeAndre Cole", number: "11", pos: "Center", stat: "11.5 RPG" }] },
  { id: 2, name: "Eastside Wolves", logo: "/src/images/jtownteamlogo.jpg", wins: 13, losses: 3, division: "North Conference", roster: [{ name: "DeAndre Cole", number: "11", pos: "Center", stat: "24.1 PPG" }, { name: "Kevin Hayes", number: "01", pos: "Guard", stat: "5.5 APG" }] },
  { id: 3, name: "Metro Titans", logo: "/src/images/jtownteamlogo.jpg", wins: 10, losses: 6, division: "South Conference", roster: [{ name: "Derrick Brooks", number: "99", pos: "Forward", stat: "22.3 PPG" }, { name: "Chris Paulson", number: "03", pos: "Guard", stat: "7.1 APG" }] },
];

const DEFAULT_PLAYERS = [
  { id: 1, name: "Marcus Vance", number: "23", position: "Guard / Forward", avatar: "/src/images/bigfemo.jpg", stats: { ppg: 28.4, apg: 6.2, rpg: 5.8 }, status: "MVP Candidate", isAllStar: true, bio: "Marcus Vance entered the league out of J-Town State University, immediately setting franchise scoring records.", height: "6'6\"", weight: "210 lbs", hometown: "J-Town City", experience: "5 Seasons", college: "J-Town State University" },
  { id: 2, name: "Tobi Emmanuel", number: "03", position: "Point Guard", avatar: "/src/images/jtownteamlogo.jpg", stats: { ppg: 30.5, apg: 15.9, rpg: 10.1 }, status: "Assists Leader", isAllStar: true, bio: "Tobi is the core floor general and engine room of J-Town Hoops. With elite court vision.", height: "5'9\"", weight: "185 lbs", hometown: "Jos, Nigeria", experience: "3 Seasons", college: "Plateau State University" },
  { id: 3, name: "Mike Okafo", number: "11", position: "Guard / Forward", avatar: "/src/images/bigfemo.jpg", stats: { ppg: 28.4, apg: 6.2, rpg: 5.8 }, status: "MVP Candidate", isAllStar: true, bio: "Mike entered the league out of J-Town State University, immediately setting franchise scoring records.", height: "6'6\"", weight: "210 lbs", hometown: "J-Town City", experience: "5 Seasons", college: "University of Jos" },
  { id: 4, name: "Ibrahim Musa", number: "14", position: "Point Guard", avatar: "/src/images/jtownteamlogo.jpg", stats: { ppg: 18.5, apg: 8.9, rpg: 4.1 }, status: "Assists Leader", isAllStar: true, bio: "Ibrahim is the core floor general and engine room of J-Town Hoops.", height: "6'1\"", weight: "185 lbs", hometown: "Lagos, Nigeria", experience: "3 Seasons", college: "Metropolitan Academy" },
  { id: 5, name: "Vincent Owaila", number: "13", position: "Guard / Forward", avatar: "/src/images/bigfemo.jpg", stats: { ppg: 28.4, apg: 6.2, rpg: 5.8 }, status: "MVP Candidate", isAllStar: true, bio: "Owaila entered the league out of J-Town State University, immediately setting franchise scoring records.", height: "6'6\"", weight: "210 lbs", hometown: "F.C.T", experience: "5 Seasons", college: "Abuja State University" },
  { id: 6, name: "Ade Yohanna", number: "06", position: "Point Guard", avatar: "/src/images/jtownteamlogo.jpg", stats: { ppg: 18.5, apg: 8.9, rpg: 4.1 }, status: "Assists Leader", isAllStar: true, bio: "Ade Yohanna is the core floor general and engine room of J-Town Hoops.", height: "6'1\"", weight: "185 lbs", hometown: "Benue, Nigeria", experience: "3 Seasons", college: "Nigerian Defence Academy" },
  { id: 7, name: "Bright Madaki", number: "07", position: "Guard / Forward", avatar: "/src/images/bigfemo.jpg", stats: { ppg: 28.4, apg: 6.2, rpg: 5.8 }, status: "MVP Candidate", isAllStar: true, bio: "Bright Madaki entered the league out of J-Town State University, immediately setting franchise scoring records.", height: "6'6\"", weight: "210 lbs", hometown: "Port Harcourt", experience: "5 Seasons", college: "University of Ibadan" },
  { id: 8, name: "Romeo Abbas", number: "10", position: "Point Guard", avatar: "/src/images/jtownteamlogo.jpg", stats: { ppg: 18.5, apg: 8.9, rpg: 4.1 }, status: "Assists Leader", isAllStar: true, bio: "Romeo is the core floor general and engine room of J-Town Hoops.", height: "6'1\"", weight: "185 lbs", hometown: "Lagos, Nigeria", experience: "3 Seasons", college: "Federal College of Education" },
];

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const formatDate = (date) => date.toLocaleString("en-NG", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const load = (key, fallback) => { try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : fallback; } catch { return fallback; } };

export function NotificationProvider({ children, user }) {
  const [feed, setFeed] = useState(() => load(KEYS.feed, DEFAULT_FEED));
  const [scheduleGames, setScheduleGames] = useState(() => load(KEYS.schedule, DEFAULT_SCHEDULE));
  const [teamsData, setTeamsData] = useState(() => load(KEYS.teams, DEFAULT_TEAMS));
  const [playersData, setPlayersData] = useState(() => load(KEYS.players, DEFAULT_PLAYERS));
  const [notificationSettings, setNotificationSettings] = useState(() => load(KEYS.settings, { enabled: true }));
  const [incoming, setIncoming] = useState(null);

  useEffect(() => localStorage.setItem(KEYS.feed, JSON.stringify(feed)), [feed]);
  useEffect(() => localStorage.setItem(KEYS.schedule, JSON.stringify(scheduleGames)), [scheduleGames]);
  useEffect(() => localStorage.setItem(KEYS.teams, JSON.stringify(teamsData)), [teamsData]);
  useEffect(() => localStorage.setItem(KEYS.players, JSON.stringify(playersData)), [playersData]);
  useEffect(() => localStorage.setItem(KEYS.settings, JSON.stringify(notificationSettings)), [notificationSettings]);

  const addSiteUpdate = useCallback(({ title, desc, category = "general", origin = "system", type = "system", link = "/notifications", showInNews = false, showInNotifications = true, ownerEmail = null }) => {
    const now = new Date();
    const update = { id: createId(), title, desc, category, origin, type, link, ownerEmail: ownerEmail ? String(ownerEmail).trim().toLowerCase() : null, createdAt: now.toISOString(), date: formatDate(now), read: false, showInNews, showInNotifications };
    setFeed((prev) => [update, ...prev]);
    if (user && notificationSettings.enabled && showInNotifications) setIncoming(update);
    return update;
  }, [user, notificationSettings.enabled]);

  const addNews = useCallback((data) => addSiteUpdate({ ...data, category: data.category || "general", origin: "news", type: "news", link: data.link || "/news", showInNews: true, showInNotifications: true }), [addSiteUpdate]);

  const updateNews = useCallback((id, changes) => { setFeed((prev) => prev.map((x) => x.id === id ? { ...x, ...changes } : x)); }, []);
  const removeNews = useCallback((id) => { setFeed((prev) => prev.filter((x) => x.id !== id)); }, []);
  const addMediaUpdate = useCallback(({ action = "updated", mediaType = "media", title = "J-Town media" }) => addSiteUpdate({ title: `${mediaType} ${action}`, desc: `${title} was ${action} by an administrator.`, category: mediaType.toLowerCase(), origin: mediaType.toLowerCase(), type: "media", link: `/${mediaType.toLowerCase()}`, showInNews: false, showInNotifications: true }), [addSiteUpdate]);

  const addScheduleGame = useCallback((game) => {
    const item = { ...game, id: game.id || createId() };
    setScheduleGames((prev) => [item, ...prev]);
    addSiteUpdate({ title: "New Game Added", desc: `${item.homeTeam} vs ${item.awayTeam} was added for ${item.date} at ${item.time}.`, category: "schedule", origin: "schedule", type: "schedule", link: "/schedule", showInNews: true });
    return item;
  }, [addSiteUpdate]);

  const updateScheduleGame = useCallback((id, changes) => {
    let updated;
    setScheduleGames((prev) => prev.map((game) => { if (game.id !== id) return game; updated = { ...game, ...changes }; return updated; }));
    const old = scheduleGames.find((g) => g.id === id);
    if (old) addSiteUpdate({ title: "Game Updated", desc: `${old.homeTeam} vs ${old.awayTeam} schedule/game information was updated.`, category: changes.homeScore !== undefined || changes.awayScore !== undefined ? "games" : "schedule", origin: "schedule", type: "schedule", link: "/schedule", showInNews: true });
    return updated;
  }, [scheduleGames, addSiteUpdate]);

  const removeScheduleGame = useCallback((id) => {
    const old = scheduleGames.find((g) => g.id === id);
    setScheduleGames((prev) => prev.filter((g) => g.id !== id));
    if (old) addSiteUpdate({ title: "Game Removed", desc: `${old.homeTeam} vs ${old.awayTeam} was removed from the schedule.`, category: "schedule", origin: "schedule", type: "schedule", link: "/schedule", showInNews: true });
  }, [scheduleGames, addSiteUpdate]);

  const addTeam = useCallback((team) => {
    const item = { ...team, id: team.id || createId(), roster: team.roster || [] };
    setTeamsData((prev) => [...prev, item]);
    addSiteUpdate({ title: "New Team Added", desc: `${item.name} joined the J-Town Hoops league standings.`, category: "teams", origin: "teams", type: "team", link: "/teams", showInNews: true });
    return item;
  }, [addSiteUpdate]);

  const updateTeam = useCallback((id, changes) => {
    const old = teamsData.find((t) => t.id === id);
    setTeamsData((prev) => prev.map((t) => t.id === id ? { ...t, ...changes } : t));
    if (old) addSiteUpdate({ title: "Team Updated", desc: `${old.name}'s team record or information was updated.`, category: "teams", origin: "teams", type: "team", link: "/teams", showInNews: true });
  }, [teamsData, addSiteUpdate]);

  const removeTeam = useCallback((id) => {
    const old = teamsData.find((t) => t.id === id);
    setTeamsData((prev) => prev.filter((t) => t.id !== id));
    if (old) addSiteUpdate({ title: "Team Removed", desc: `${old.name} was removed from the league standings.`, category: "teams", origin: "teams", type: "team", link: "/teams", showInNews: true });
  }, [teamsData, addSiteUpdate]);

  const addPlayer = useCallback((player) => {
    const item = { ...player, id: player.id || createId(), stats: player.stats || { ppg: 0, apg: 0, rpg: 0 } };
    setPlayersData((prev) => [...prev, item]);
    addSiteUpdate({ title: "New Player Added", desc: `${item.name} was added to the J-Town Hoops player roster.`, category: "players", origin: "players", type: "player", link: "/players", showInNews: true });
    return item;
  }, [addSiteUpdate]);

  const updatePlayer = useCallback((id, changes) => {
    const old = playersData.find((p) => p.id === id);
    setPlayersData((prev) => prev.map((p) => p.id === id ? { ...p, ...changes, stats: { ...p.stats, ...(changes.stats || {}) } } : p));
    if (old) addSiteUpdate({ title: "Player Updated", desc: `${old.name}'s player profile or statistics were updated.`, category: "players", origin: "players", type: "player", link: "/players", showInNews: true });
  }, [playersData, addSiteUpdate]);

  const removePlayer = useCallback((id) => {
    const old = playersData.find((p) => p.id === id);
    setPlayersData((prev) => prev.filter((p) => p.id !== id));
    if (old) addSiteUpdate({ title: "Player Removed", desc: `${old.name} was removed from the player roster.`, category: "players", origin: "players", type: "player", link: "/players", showInNews: true });
  }, [playersData, addSiteUpdate]);

  const markAsRead = useCallback((id) => setFeed((prev) => prev.map((x) => x.id === id ? { ...x, read: true } : x)), []);
  const markAllRead = useCallback(() => setFeed((prev) => prev.map((x) => ({ ...x, read: true }))), []);
  const removeUpdate = useCallback((id) => setFeed((prev) => prev.filter((x) => x.id !== id)), []);
  const clearAllUpdates = useCallback(() => setFeed([]), []);
  const dismissIncoming = useCallback(() => setIncoming(null), []);
  const setNotificationsEnabled = useCallback((enabled) => setNotificationSettings({ enabled }), []);

  const currentUserEmail = String(user?.email || "").trim().toLowerCase();

  const notificationFeed = useMemo(
    () => feed.filter((x) => {
      if (x.showInNotifications === false) return false;
      if (!x.ownerEmail) return true;
      return Boolean(currentUserEmail) && x.ownerEmail === currentUserEmail;
    }),
    [feed, currentUserEmail]
  );
  const newsFeed = useMemo(() => feed.filter((x) => x.showInNews !== false), [feed]);
  const unreadCount = user && notificationSettings.enabled ? notificationFeed.filter((x) => !x.read).length : 0;

  const value = { feed, notificationFeed, newsFeed, unreadCount, incoming, addSiteUpdate, addNews, updateNews, removeNews, addMediaUpdate, markAsRead, markAllRead, removeUpdate, clearAllUpdates, dismissIncoming, notificationsEnabled: notificationSettings.enabled, setNotificationsEnabled, isSignedIn: Boolean(user), scheduleGames, addScheduleGame, updateScheduleGame, removeScheduleGame, teamsData, addTeam, updateTeam, removeTeam, playersData, addPlayer, updatePlayer, removePlayer };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used inside NotificationProvider");
  return context;
}

export default NotificationContext;
