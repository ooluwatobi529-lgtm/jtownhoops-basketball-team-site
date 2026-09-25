import React, { useEffect, useMemo, useState } from "react";
import {
  Trophy,
  Clock,
  Calendar,
  Compass,
  Sun,
  CloudSun,
  CloudRain,
  Cloud,
  CloudLightning,
  Snowflake,
  Wind,
  MapPin,
  Shield,
  Activity,
  Droplets,
  Map,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Bell,
  BellOff,
  CheckCircle,
  AlertTriangle,
  Calendar as CalendarIcon,
  Sunrise,
  Sunset,
  Navigation,
  RefreshCw,
  LocateFixed,
  Globe2,
  ThermometerSun,
  Gauge,
} from "lucide-react";
import myBackground from "../images/mybackground4.jpg";

/* ============================================================================
   J-TOWN WIDGET CONFIGURATION
   ----------------------------------------------------------------------------
   Keep editable data near the top so future changes are easy.
   Weather is fetched from Open-Meteo in the browser.
============================================================================ */

const WEATHER_LOCATIONS = [
  {
    id: "jos",
    label: "Jos",
    country: "Nigeria",
    timezone: "Africa/Lagos",
    latitude: 9.8965,
    longitude: 8.8583,
    mapQuery: "Azini Yako Youth Center, Jos, Plateau State, Nigeria",
  },
  {
    id: "lagos",
    label: "Lagos",
    country: "Nigeria",
    timezone: "Africa/Lagos",
    latitude: 6.5244,
    longitude: 3.3792,
    mapQuery: "Lagos, Nigeria",
  },
  {
    id: "london",
    label: "London",
    country: "United Kingdom",
    timezone: "Europe/London",
    latitude: 51.5072,
    longitude: -0.1276,
    mapQuery: "London, United Kingdom",
  },
  {
    id: "new-york",
    label: "New York",
    country: "United States",
    timezone: "America/New_York",
    latitude: 40.7128,
    longitude: -74.006,
    mapQuery: "New York, NY, USA",
  },
  {
    id: "south-africa",
    label: "Johannesburg",
    country: "South Africa",
    timezone: "Africa/Johannesburg",
    latitude: -26.2041,
    longitude: 28.0473,
    mapQuery: "Johannesburg, South Africa",
  },
  {
    id: "ghana",
    label: "Accra",
    country: "Ghana",
    timezone: "Africa/Accra",
    latitude: 5.6037,
    longitude: -0.187,
    mapQuery: "Accra, Ghana",
  },
];

const WORLD_CLOCKS = [
  { label: "Jos / Lagos", country: "Nigeria", timezone: "Africa/Lagos" },
  { label: "London", country: "UK", timezone: "Europe/London" },
  { label: "New York", country: "USA", timezone: "America/New_York" },
  { label: "Johannesburg", country: "South Africa", timezone: "Africa/Johannesburg" },
  { label: "Accra", country: "Ghana", timezone: "Africa/Accra" },
];

const REMINDER_STORAGE_KEY = "jtown-widget-reminders-v2";

function weatherMeta(code = 0) {
  if (code === 0) return { label: "Clear sky", icon: "sun" };
  if ([1, 2].includes(code)) return { label: "Partly cloudy", icon: "cloudSun" };
  if (code === 3) return { label: "Overcast", icon: "cloud" };
  if ([45, 48].includes(code)) return { label: "Foggy", icon: "cloud" };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { label: "Rain / showers", icon: "rain" };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { label: "Snow", icon: "snow" };
  if ([95, 96, 99].includes(code))
    return { label: "Thunderstorm", icon: "storm" };
  return { label: "Variable weather", icon: "cloudSun" };
}

function WeatherIcon({ code, className = "h-7 w-7" }) {
  const meta = weatherMeta(code);
  if (meta.icon === "sun") return <Sun className={`${className} text-amber-500`} />;
  if (meta.icon === "rain") return <CloudRain className={`${className} text-blue-400`} />;
  if (meta.icon === "snow") return <Snowflake className={`${className} text-sky-300`} />;
  if (meta.icon === "storm") return <CloudLightning className={`${className} text-violet-400`} />;
  if (meta.icon === "cloud") return <Cloud className={`${className} text-slate-400`} />;
  return <CloudSun className={`${className} text-orange-400`} />;
}

function formatTimeInZone(date, timezone, seconds = false) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    ...(seconds ? { second: "2-digit" } : {}),
    hour12: false,
  }).format(date);
}

function formatDateInZone(date, timezone) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Widget() {
  /* --------------------------------------------------------------------------
     REAL-TIME CLOCK
  -------------------------------------------------------------------------- */
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = formatTimeInZone(currentTime, "Africa/Lagos", true);
  const formattedDate = formatDateInZone(currentTime, "Africa/Lagos");

  /* --------------------------------------------------------------------------
     LIVE WEATHER
  -------------------------------------------------------------------------- */
  const [selectedLocationId, setSelectedLocationId] = useState("jos");
  const selectedLocation =
    WEATHER_LOCATIONS.find((item) => item.id === selectedLocationId) ||
    WEATHER_LOCATIONS[0];

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");

  const loadWeather = async (location = selectedLocation) => {
    setWeatherLoading(true);
    setWeatherError("");

    try {
      const params = new URLSearchParams({
        latitude: String(location.latitude),
        longitude: String(location.longitude),
        timezone: location.timezone,
        forecast_days: "8",
        current:
          "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure",
        daily:
          "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,wind_speed_10m_max",
      });

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params.toString()}`
      );

      if (!response.ok) throw new Error("Weather service did not respond.");

      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error(error);
      setWeatherError(
        "Live weather is temporarily unavailable. Check your internet connection and try again."
      );
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocationId]);

  const forecastDays = useMemo(() => {
    if (!weather?.daily?.time) return [];
    return weather.daily.time.map((date, index) => ({
      date,
      code: weather.daily.weather_code?.[index],
      max: weather.daily.temperature_2m_max?.[index],
      min: weather.daily.temperature_2m_min?.[index],
      rain: weather.daily.precipitation_probability_max?.[index],
      sunrise: weather.daily.sunrise?.[index],
      sunset: weather.daily.sunset?.[index],
      wind: weather.daily.wind_speed_10m_max?.[index],
    }));
  }, [weather]);

  const todayForecast = forecastDays[0];

  /* --------------------------------------------------------------------------
     REAL-LIFE NORTH COMPASS
     --------------------------------------------------------------------------
     IMPORTANT:
     - On iPhone/iPad Safari, webkitCompassHeading is used when available.
     - On other supported devices, absolute device orientation is used.
     - A laptop/desktop without a compass sensor cannot determine real North.
     - We do NOT fake a heading when a real sensor is unavailable.
  -------------------------------------------------------------------------- */
  const [heading, setHeading] = useState(null);
  const [compassStatus, setCompassStatus] = useState("idle");
  const [sensorMessage, setSensorMessage] = useState(
    "Tap Enable Real Compass on a phone or tablet to locate North."
  );
  const [compassAccuracy, setCompassAccuracy] = useState("Waiting for sensor");

  const normalizeHeading = (value) => ((value % 360) + 360) % 360;

  const cardinalDirection = (degrees) => {
    if (degrees === null || Number.isNaN(degrees)) return "—";
    const sectors = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return sectors[Math.round(normalizeHeading(degrees) / 45) % 8];
  };

  useEffect(() => {
    if (compassStatus !== "active") return undefined;

    let receivedRealHeading = false;

    const handleOrientation = (event) => {
      let realHeading = null;

      // iOS Safari exposes a magnetic compass heading directly.
      if (typeof event.webkitCompassHeading === "number") {
        realHeading = event.webkitCompassHeading;
        setCompassAccuracy(
          typeof event.webkitCompassAccuracy === "number"
            ? `±${Math.round(event.webkitCompassAccuracy)}°`
            : "Sensor active"
        );
      }
      // On browsers providing an ABSOLUTE orientation, alpha can be converted
      // to a compass heading. We intentionally avoid relative alpha readings.
      else if (event.absolute === true && typeof event.alpha === "number") {
        realHeading = 360 - event.alpha;
        setCompassAccuracy("Absolute orientation");
      }

      if (realHeading !== null) {
        receivedRealHeading = true;
        setHeading(normalizeHeading(realHeading));
        setSensorMessage(
          "Real device heading is active. Keep the phone flat and away from magnets or metal objects."
        );
      }
    };

    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
    window.addEventListener("deviceorientation", handleOrientation, true);

    const sensorTimeout = window.setTimeout(() => {
      if (!receivedRealHeading) {
        setCompassStatus("unavailable");
        setHeading(null);
        setCompassAccuracy("No heading received");
        setSensorMessage(
          "This device/browser is not providing a real compass heading. Try a sensor-equipped phone or tablet and allow motion/orientation access."
        );
      }
    }, 5000);

    return () => {
      window.clearTimeout(sensorTimeout);
      window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, [compassStatus]);

  const enableDeviceCompass = async () => {
    try {
      setHeading(null);
      setCompassAccuracy("Connecting...");
      setSensorMessage("Requesting access to the device compass...");

      if (!("DeviceOrientationEvent" in window)) {
        setCompassStatus("unavailable");
        setCompassAccuracy("Unsupported device");
        setSensorMessage(
          "No orientation sensor was detected. Real North requires a phone/tablet with a supported compass sensor."
        );
        return;
      }

      // iOS requires this request to happen directly after a user tap.
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== "granted") {
          setCompassStatus("denied");
          setCompassAccuracy("Permission denied");
          setSensorMessage(
            "Compass permission was not granted. Allow Motion & Orientation access, then try again."
          );
          return;
        }
      }

      setCompassStatus("active");
      setSensorMessage("Compass enabled. Waiting for a real heading from the device sensor...");
    } catch (error) {
      console.error(error);
      setCompassStatus("unavailable");
      setHeading(null);
      setCompassAccuracy("Sensor error");
      setSensorMessage(
        "The real compass could not start. Make sure the site is served over HTTPS and try a supported phone/tablet."
      );
    }
  };

  const resetCompass = () => {
    setCompassStatus("idle");
    setHeading(null);
    setCompassAccuracy("Waiting for sensor");
    setSensorMessage("Tap Enable Real Compass on a phone or tablet to locate North.");
  };

  /* --------------------------------------------------------------------------
     NOTIFICATION PERMISSION
  -------------------------------------------------------------------------- */
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "unsupported"
  );

  const requestNotificationAccess = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  /* --------------------------------------------------------------------------
     REAL CALENDAR + PERSISTENT REMINDERS
  -------------------------------------------------------------------------- */
  const [currentMonthDate, setCurrentMonthDate] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [activeToasts, setActiveToasts] = useState([]);

  const [reminders, setReminders] = useState(() => {
    try {
      const saved = localStorage.getItem(REMINDER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  const [todoTitle, setTodoTitle] = useState("");
  const [todoTime, setTodoTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  });
  const [todoCategory, setTodoCategory] = useState("Practice");

  useEffect(() => {
    const evaluateReminders = () => {
      const now = new Date();
      const nowDate = dateKey(now);
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      setReminders((previous) =>
        previous.map((reminder) => {
          if (reminder.completed || reminder.notified) return reminder;
          if (reminder.dateKey !== nowDate) return reminder;

          const [hour, minute] = reminder.timeString.split(":").map(Number);
          const reminderMinutes = hour * 60 + minute;

          if (nowMinutes >= reminderMinutes) {
            if (
              typeof Notification !== "undefined" &&
              Notification.permission === "granted"
            ) {
              new Notification("🏀 J-Town Hoops Reminder", {
                body: `${reminder.category}: ${reminder.title}`,
                icon: "/favicon.ico",
              });
            }

            setActiveToasts((toasts) => [
              ...toasts,
              {
                id: `${reminder.id}-${Date.now()}`,
                title: reminder.title,
                category: reminder.category,
                time: reminder.timeString,
              },
            ]);

            return { ...reminder, notified: true };
          }

          return reminder;
        })
      );
    };

    evaluateReminders();
    const timer = setInterval(evaluateReminders, 15000);
    return () => clearInterval(timer);
  }, []);

  const dismissToast = (id) => {
    setActiveToasts((items) => items.filter((item) => item.id !== id));
  };

  const activeYear = currentMonthDate.getFullYear();
  const activeMonth = currentMonthDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const totalDaysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
  const startingDayIndex = new Date(activeYear, activeMonth, 1).getDay();

  const handlePrevMonth = () =>
    setCurrentMonthDate(new Date(activeYear, activeMonth - 1, 1));

  const handleNextMonth = () =>
    setCurrentMonthDate(new Date(activeYear, activeMonth + 1, 1));

  const jumpToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const handleFormSubmission = (event) => {
    event.preventDefault();
    if (!todoTitle.trim()) return;

    const reminder = {
      id: Date.now(),
      dateKey: dateKey(selectedDate),
      timeString: todoTime,
      title: todoTitle.trim(),
      category: todoCategory,
      notified: false,
      completed: false,
    };

    setReminders((items) => [...items, reminder]);
    setTodoTitle("");
  };

  const deleteTodoItem = (id) => {
    setReminders((items) => items.filter((item) => item.id !== id));
  };

  const toggleTodoCompletion = (id) => {
    setReminders((items) =>
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const targetedDayTodos = reminders
    .filter((item) => item.dateKey === dateKey(selectedDate))
    .sort((a, b) => a.timeString.localeCompare(b.timeString));

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    selectedLocation.id === "jos"
      ? "Azini Yako Youth Center, Jos, Plateau State, Nigeria"
      : selectedLocation.mapQuery
  )}&output=embed`;

  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    selectedLocation.id === "jos"
      ? "Azini Yako Youth Center, Jos, Plateau State, Nigeria"
      : selectedLocation.mapQuery
  )}`;

  return (
    <div
      className="min-h-[calc(100vh-5rem)] text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300 relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.58),rgba(0,0,0,.70)), url(${myBackground})`,
      }}
    >
      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto space-y-8">
        {/* ====================================================================
            REAL-TIME ON-SCREEN REMINDER TOASTS
        ==================================================================== */}
        <div className="fixed bottom-5 right-5 z-[100] space-y-2 max-w-sm w-[calc(100%-2.5rem)] pointer-events-none">
          {activeToasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto bg-neutral-950 border-2 border-orange-500 text-white p-4 rounded-2xl shadow-2xl flex flex-col gap-2"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-[10px] uppercase font-mono font-black text-orange-500 tracking-wider flex items-center gap-1">
                  <Bell className="h-3 w-3" /> Reminder Now
                </span>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-neutral-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm font-black">{toast.title}</p>
              <p className="text-[10px] text-neutral-400 font-mono">
                {toast.category} • {toast.time}
              </p>
            </div>
          ))}
        </div>

        {/* ====================================================================
            WIDGET / DASHBOARD SECTION
        ==================================================================== */}
        <div className="space-y-6">
          {/* AZINI YAKO HEADER */}
          <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="flex items-start sm:items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner shrink-0">
                <MapPin className="h-8 w-8" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-100">
                  J-Town Hoops Community Base
                </p>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mt-1">
                  Azini Yako Youth Center
                </h1>
                <p className="text-xs sm:text-sm text-orange-100 font-mono mt-1">
                  Jos, Plateau State, Nigeria
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full lg:w-auto">
              <div className="bg-neutral-950/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <p className="text-[9px] uppercase font-black text-orange-100">Jos Time</p>
                <p className="font-mono font-black tabular-nums">{formattedTime}</p>
              </div>
              <div className="bg-neutral-950/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <p className="text-[9px] uppercase font-black text-orange-100">Status</p>
                <p className="text-xs font-black flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                  LIVE
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================================
              CORE WIDGET GRID
          ================================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CARD 1: LIVE DATE + JOS CLOCK */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-orange-500/40 transition-colors">
              <div>
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-orange-500" /> Jos Live Clock
                  </span>
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>

                <div className="py-4 text-center">
                  <div className="font-mono text-4xl font-black tracking-tighter text-slate-900 dark:text-white tabular-nums">
                    {formattedTime}
                  </div>
                  <div className="mt-2 text-xs font-mono font-bold text-orange-500 uppercase tracking-widest bg-orange-500/5 py-1 px-3 rounded-xl inline-block">
                    WAT • Africa/Lagos
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-900 flex items-start gap-2.5 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                <Calendar className="h-4 w-4 text-orange-500 shrink-0" />
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* CARD 2: WORLD CLOCKS */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm md:col-span-2 hover:border-orange-500/40 transition-colors">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Globe2 className="h-4 w-4 text-orange-500" /> World Time Board
                </span>
                <span className="text-[9px] font-mono font-bold text-green-500">LIVE</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                {WORLD_CLOCKS.map((clock) => (
                  <div
                    key={clock.timezone}
                    className="bg-slate-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-3"
                  >
                    <p className="text-[9px] font-black uppercase text-slate-400 truncate">
                      {clock.label}
                    </p>
                    <p className="font-mono font-black text-lg text-slate-900 dark:text-white mt-1 tabular-nums">
                      {formatTimeInZone(currentTime, clock.timezone)}
                    </p>
                    <p className="text-[9px] text-orange-500 font-bold mt-1">{clock.country}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 3: LIVE WEATHER + SELECTABLE 8-DAY PANEL */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm md:col-span-3 hover:border-orange-500/40 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-900 pb-4 mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CloudSun className="h-4 w-4 text-orange-500" /> Live Weather Forecast
                  </span>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Jos is the default • select another city for its live forecast
                  </p>
                </div>

                <button
                  onClick={() => loadWeather(selectedLocation)}
                  className="self-start lg:self-auto px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-[10px] font-black uppercase flex items-center gap-1.5 hover:border-orange-500 hover:text-orange-500"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${weatherLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-3">
                {WEATHER_LOCATIONS.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => setSelectedLocationId(location.id)}
                    className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide border transition-all ${
                      selectedLocationId === location.id
                        ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/10"
                        : "bg-slate-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-slate-500 dark:text-neutral-300 hover:border-orange-500/50"
                    }`}
                  >
                    {location.label}
                  </button>
                ))}
              </div>

              {weatherError ? (
                <div className="mt-4 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 text-xs">
                  {weatherError}
                </div>
              ) : weatherLoading && !weather ? (
                <div className="py-16 text-center text-sm text-neutral-400">
                  Loading live weather for {selectedLocation.label}...
                </div>
              ) : weather ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-5 py-4">
                    <div className="bg-slate-50 dark:bg-neutral-900/50 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-5">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                          <WeatherIcon code={weather.current?.weather_code} className="h-10 w-10" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-orange-500">
                            {selectedLocation.label}, {selectedLocation.country}
                          </p>
                          <div className="text-4xl font-black tracking-tight">
                            {Math.round(weather.current?.temperature_2m)}°C
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {weatherMeta(weather.current?.weather_code).label}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-5">
                        <div className="bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                          <p className="text-[9px] uppercase font-bold text-neutral-400">Feels Like</p>
                          <p className="font-mono font-black">{Math.round(weather.current?.apparent_temperature)}°C</p>
                        </div>
                        <div className="bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                          <p className="text-[9px] uppercase font-bold text-neutral-400">Humidity</p>
                          <p className="font-mono font-black">{weather.current?.relative_humidity_2m}%</p>
                        </div>
                        <div className="bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                          <p className="text-[9px] uppercase font-bold text-neutral-400">Wind</p>
                          <p className="font-mono font-black">{Math.round(weather.current?.wind_speed_10m)} km/h</p>
                        </div>
                        <div className="bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                          <p className="text-[9px] uppercase font-bold text-neutral-400">Pressure</p>
                          <p className="font-mono font-black">{Math.round(weather.current?.surface_pressure)} hPa</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {forecastDays.map((day, index) => {
                          const dayDate = new Date(`${day.date}T12:00:00`);
                          return (
                            <div
                              key={day.date}
                              className={`rounded-2xl border p-3 text-center ${
                                index === 0
                                  ? "border-orange-500 bg-orange-500/5"
                                  : "border-neutral-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/40"
                              }`}
                            >
                              <p className="text-[9px] uppercase font-black text-neutral-400">
                                {index === 0
                                  ? "Today"
                                  : dayDate.toLocaleDateString("en-US", { weekday: "short" })}
                              </p>
                              <p className="text-[9px] font-mono text-neutral-400 mb-2">
                                {dayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </p>
                              <div className="flex justify-center">
                                <WeatherIcon code={day.code} className="h-6 w-6" />
                              </div>
                              <p className="font-mono font-black text-xs mt-2">
                                {Math.round(day.max)}° / {Math.round(day.min)}°
                              </p>
                              <p className="text-[9px] text-blue-500 mt-1">
                                Rain {day.rain ?? 0}%
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {todayForecast && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-neutral-100 dark:border-neutral-900">
                      <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                        <Sunrise className="h-4 w-4 text-orange-500 mb-1" />
                        <p className="text-[9px] uppercase font-black text-neutral-400">Sunrise</p>
                        <p className="text-xs font-mono font-black">
                          {todayForecast.sunrise?.split("T")[1] || "—"}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                        <Sunset className="h-4 w-4 text-orange-500 mb-1" />
                        <p className="text-[9px] uppercase font-black text-neutral-400">Sunset</p>
                        <p className="text-xs font-mono font-black">
                          {todayForecast.sunset?.split("T")[1] || "—"}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                        <Wind className="h-4 w-4 text-orange-500 mb-1" />
                        <p className="text-[9px] uppercase font-black text-neutral-400">Max Wind</p>
                        <p className="text-xs font-mono font-black">
                          {Math.round(todayForecast.wind)} km/h
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                        <MapPin className="h-4 w-4 text-orange-500 mb-1" />
                        <p className="text-[9px] uppercase font-black text-neutral-400">Coordinates</p>
                        <p className="text-[10px] font-mono font-black">
                          {selectedLocation.latitude.toFixed(2)}, {selectedLocation.longitude.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* CARD 4: LOCATION MAP */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm md:col-span-3 flex flex-col gap-4 hover:border-orange-500/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-900 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Map className="h-4 w-4 text-orange-500" /> Location Navigator
                  </span>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    {selectedLocation.id === "jos"
                      ? "Azini Yako Youth Center • Jos, Plateau State, Nigeria"
                      : `${selectedLocation.label}, ${selectedLocation.country}`}
                  </p>
                </div>

                <a
                  href={externalMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[10px] uppercase font-black flex items-center gap-1.5 self-start"
                >
                  <Navigation className="h-3.5 w-3.5" /> Open Larger Map
                </a>
              </div>

              <div className="w-full h-80 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-inner bg-slate-100 dark:bg-neutral-900">
                <iframe
                  key={mapSrc}
                  title="J-Town Location Navigation Map"
                  src={mapSrc}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* CARD 5: REAL-LIFE NORTH COMPASS */}
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm md:col-span-3 flex flex-col lg:flex-row items-center justify-between gap-7 hover:border-orange-500/40 transition-colors">
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Compass className="h-4 w-4 text-orange-500" /> Real-Life North Compass
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">
                  Locate Real North
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
                  On a supported phone or tablet, this compass reads the device orientation sensor and points the red needle toward real-world North. It does not invent a direction when a real sensor is unavailable.
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={enableDeviceCompass}
                    className="px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase flex items-center gap-1.5"
                  >
                    <LocateFixed className="h-3.5 w-3.5" /> Enable Real Compass
                  </button>

                  <button
                    onClick={resetCompass}
                    className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] font-black uppercase"
                  >
                    Reset Compass
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  <div className="bg-slate-50 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <p className="text-[9px] uppercase font-bold text-neutral-400">Heading</p>
                    <p className="font-mono font-black text-orange-500">
                      {heading === null ? "—" : `${Math.round(heading)}°`}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <p className="text-[9px] uppercase font-bold text-neutral-400">Direction</p>
                    <p className="font-mono font-black">{cardinalDirection(heading)}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 col-span-2 sm:col-span-1">
                    <p className="text-[9px] uppercase font-bold text-neutral-400">Sensor</p>
                    <p className={`font-mono font-black uppercase text-[10px] ${
                      compassStatus === "active" && heading !== null
                        ? "text-green-500"
                        : compassStatus === "unavailable" || compassStatus === "denied"
                        ? "text-red-500"
                        : "text-neutral-500"
                    }`}>
                      {compassStatus === "active" && heading !== null
                        ? "REAL SENSOR"
                        : compassStatus}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/50 p-3">
                  <p className="text-[9px] uppercase font-black text-neutral-400">Calibration / Accuracy</p>
                  <p className="text-xs font-mono font-black mt-1">{compassAccuracy}</p>
                  <p className="text-[10px] text-neutral-400 mt-2 leading-relaxed">{sensorMessage}</p>
                </div>

                <p className="text-[10px] text-neutral-400 leading-relaxed">
                  Tip: hold your phone flat, keep it away from speakers, magnets and large metal objects, and move it in a figure-eight if the heading seems unstable. Sensor availability and calibration depend on the device/browser.
                </p>
              </div>

              <div className="relative h-64 w-64 flex items-center justify-center bg-slate-50 dark:bg-neutral-900 rounded-full border-4 border-neutral-200 dark:border-neutral-800 shadow-inner shrink-0">
                <div className="absolute inset-4 rounded-full border border-dashed border-neutral-300 dark:border-neutral-700">
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 font-black text-sm text-orange-500">N</span>
                  <span className="absolute top-1/2 -right-1 -translate-y-1/2 font-black text-sm">E</span>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 font-black text-sm">S</span>
                  <span className="absolute top-1/2 -left-1 -translate-y-1/2 font-black text-sm">W</span>
                  <span className="absolute top-[12%] right-[12%] text-[8px] font-black text-neutral-400">NE</span>
                  <span className="absolute bottom-[12%] right-[12%] text-[8px] font-black text-neutral-400">SE</span>
                  <span className="absolute bottom-[12%] left-[12%] text-[8px] font-black text-neutral-400">SW</span>
                  <span className="absolute top-[12%] left-[12%] text-[8px] font-black text-neutral-400">NW</span>
                </div>

                {heading !== null ? (
                  <div
                    className="w-full h-full flex items-center justify-center transition-transform duration-150 ease-out"
                    style={{ transform: `rotate(${-heading}deg)` }}
                  >
                    <svg className="w-36 h-36 drop-shadow-lg" viewBox="0 0 100 100">
                      <polygon points="50,5 62,50 50,43 38,50" fill="#f97316" />
                      <polygon points="50,95 62,50 50,57 38,50" fill="#737373" />
                      <circle cx="50" cy="50" r="6" fill="#ffffff" stroke="#f97316" strokeWidth="2" />
                    </svg>
                  </div>
                ) : (
                  <div className="h-28 w-28 rounded-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center text-center p-3 shadow-lg">
                    <Compass className="h-7 w-7 text-orange-500 mb-1" />
                    <span className="text-[9px] font-black uppercase text-neutral-500">Waiting for real sensor</span>
                  </div>
                )}

                <div className="absolute bottom-5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 px-3 py-1 rounded-full font-mono font-black text-xs shadow-lg text-orange-500">
                  {heading === null ? "NO HEADING" : `${Math.round(heading)}° ${cardinalDirection(heading)}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
            CALENDAR / REAL REMINDER SECTION
        ==================================================================== */}
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-orange-500" /> Court Master Calendar
            </h1>
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 max-w-2xl">
              The calendar opens on the real current month. Reminders are saved in this browser and
              can trigger both an on-screen alert and a browser notification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={jumpToToday}
              className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-black uppercase hover:border-orange-500 hover:text-orange-500"
            >
              Today
            </button>

            <div className="bg-slate-50 dark:bg-neutral-900 px-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl text-center">
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Jos Clock</p>
              <p className="font-mono text-sm font-black text-orange-500 tabular-nums">{formattedTime}</p>
            </div>

            <button
              onClick={requestNotificationAccess}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                notificationPermission === "granted"
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {notificationPermission === "granted" ? (
                <>
                  <Bell className="h-4 w-4" /> Notifications On
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4" /> Enable Reminder Alerts
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* INTERACTIVE CALENDAR */}
          <div className="lg:col-span-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-neutral-100">
                  {monthNames[activeMonth]}{" "}
                  <span className="text-orange-500 font-mono">{activeYear}</span>
                </h2>
                <p className="text-[10px] text-neutral-400">
                  Today: {formattedDate}
                </p>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-xl"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono py-1">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div>
              <div>Thu</div><div>Fri</div><div>Sat</div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {Array.from({ length: startingDayIndex }).map((_, index) => (
                <div
                  key={`blank-${index}`}
                  className="aspect-square bg-slate-50/20 dark:bg-neutral-900/5 rounded-xl opacity-20"
                />
              ))}

              {Array.from({ length: totalDaysInMonth }).map((_, index) => {
                const dayNumber = index + 1;
                const dateObject = new Date(activeYear, activeMonth, dayNumber);
                const isSelected = dateKey(dateObject) === dateKey(selectedDate);
                const isToday = dateKey(dateObject) === dateKey(new Date());
                const dayReminders = reminders.filter(
                  (item) => item.dateKey === dateKey(dateObject) && !item.completed
                );

                return (
                  <button
                    key={dayNumber}
                    onClick={() => setSelectedDate(dateObject)}
                    className={`aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-between p-1.5 sm:p-2 font-mono text-xs font-bold border transition-all relative ${
                      isSelected
                        ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/10 scale-[1.03]"
                        : isToday
                        ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 border-neutral-950 dark:border-white"
                        : "bg-slate-50 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-800/70 hover:border-orange-500/30"
                    }`}
                  >
                    <span className="self-start text-[10px] sm:text-[11px]">{dayNumber}</span>
                    <div className="flex gap-1">
                      {dayReminders.slice(0, 3).map((reminder) => (
                        <span
                          key={reminder.id}
                          className={`h-1.5 w-1.5 rounded-full ${
                            isSelected
                              ? "bg-white"
                              : reminder.category === "Game"
                              ? "bg-red-500"
                              : "bg-orange-500"
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* REMINDER SIDE PANEL */}
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="border-b border-neutral-100 dark:border-neutral-900 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Bell className="h-4 w-4 text-orange-500" /> Reminder Queue
                  </h3>
                  <p className="text-[9px] text-neutral-400 mt-1">
                    Saved automatically on this device
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-neutral-900 px-2 py-1 rounded text-neutral-500">
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <form onSubmit={handleFormSubmission} className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Reminder title..."
                  value={todoTitle}
                  onChange={(event) => setTodoTitle(event.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    required
                    value={todoTime}
                    onChange={(event) => setTodoTime(event.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-orange-500 font-mono text-center"
                  />
                  <select
                    value={todoCategory}
                    onChange={(event) => setTodoCategory(event.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-orange-500 font-bold"
                  >
                    <option value="Practice">Practice</option>
                    <option value="Game">Game</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Personal Run">Personal Run</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Add Real Reminder
                </button>
              </form>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1 pt-2">
                {targetedDayTodos.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-7 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                    No reminders for this date.
                  </p>
                ) : (
                  targetedDayTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`p-3 border rounded-xl ${
                        todo.completed
                          ? "bg-neutral-50 dark:bg-neutral-900/20 border-neutral-200 dark:border-neutral-800 opacity-50"
                          : "bg-slate-50 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex gap-2 items-start">
                          <button
                            type="button"
                            onClick={() => toggleTodoCompletion(todo.id)}
                            className={`mt-0.5 ${
                              todo.completed ? "text-green-500" : "text-neutral-400 hover:text-green-500"
                            }`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>

                          <div>
                            <p
                              className={`text-xs font-bold text-slate-800 dark:text-neutral-200 ${
                                todo.completed ? "line-through" : ""
                              }`}
                            >
                              {todo.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`text-[8px] font-black font-mono tracking-wider px-1.5 py-0.5 rounded uppercase ${
                                  todo.category === "Game"
                                    ? "bg-red-500/10 text-red-500"
                                    : "bg-orange-500/10 text-orange-500"
                                }`}
                              >
                                {todo.category}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono font-bold flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5" /> {todo.timeString}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteTodoItem(todo.id)}
                          className="text-neutral-400 hover:text-red-500 p-0.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {todo.notified && !todo.completed && (
                        <div className="mt-2 text-[9px] bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-1 rounded flex items-center gap-1 font-mono font-bold">
                          <AlertTriangle className="h-2.5 w-2.5" /> Reminder dispatched
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="text-[9px] text-center text-slate-400 uppercase tracking-widest font-mono font-bold border-t border-neutral-100 dark:border-neutral-900 pt-3 flex items-center justify-center gap-1">
              <Shield className="h-3.5 w-3.5 text-neutral-400" />
              Browser reminder engine active
            </div>
          </div>
        </div>

        {/* ====================================================================
            QUICK STATUS STRIP
        ==================================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-neutral-950/80 backdrop-blur border border-neutral-800 rounded-2xl p-4 text-white">
            <ThermometerSun className="h-5 w-5 text-orange-500 mb-2" />
            <p className="text-[9px] uppercase font-black text-neutral-500">Selected Weather</p>
            <p className="text-sm font-black">{selectedLocation.label}</p>
          </div>
          <div className="bg-neutral-950/80 backdrop-blur border border-neutral-800 rounded-2xl p-4 text-white">
            <Gauge className="h-5 w-5 text-orange-500 mb-2" />
            <p className="text-[9px] uppercase font-black text-neutral-500">Compass</p>
            <p className="text-sm font-black">{heading === null ? "Sensor not active" : `${Math.round(heading)}° ${cardinalDirection(heading)}`}</p>
          </div>
          <div className="bg-neutral-950/80 backdrop-blur border border-neutral-800 rounded-2xl p-4 text-white">
            <Bell className="h-5 w-5 text-orange-500 mb-2" />
            <p className="text-[9px] uppercase font-black text-neutral-500">Pending Reminders</p>
            <p className="text-sm font-black">
              {reminders.filter((item) => !item.completed).length}
            </p>
          </div>
          <div className="bg-neutral-950/80 backdrop-blur border border-neutral-800 rounded-2xl p-4 text-white">
            <MapPin className="h-5 w-5 text-orange-500 mb-2" />
            <p className="text-[9px] uppercase font-black text-neutral-500">Home Base</p>
            <p className="text-sm font-black">Jos, Plateau State</p>
          </div>
        </div>

        <p className="text-[10px] text-center text-white/60">
          Weather data updates through Open-Meteo. Reminder notifications require browser permission.
          Device compass support depends on the browser and hardware.
        </p>
      </div>
    </div>
  );
}
