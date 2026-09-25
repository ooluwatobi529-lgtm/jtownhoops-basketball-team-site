
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  Trophy,
  Calendar,
  User,
  Users,
  Newspaper,
  Lock,
  Filter,
} from "lucide-react";

import { useNotifications } from "../context/NotificationContext";

export default function Notifications() {
  const navigate = useNavigate();

  const {
    notificationFeed,
    unreadCount,
    markAsRead,
    markAllRead,
    incoming,
    dismissIncoming,
    isSignedIn,
  } = useNotifications();

  const [activeFilter, setActiveFilter] =
    useState("all");

  /*
   * FILTERS
   */
  const filters = [
    {
      id: "all",
      label: "All Logs",
    },
    {
      id: "games",
      label: "Match Results",
    },
    {
      id: "schedule",
      label: "Schedules",
    },
    {
      id: "players",
      label: "Player News",
    },
    {
      id: "teams",
      label: "Roster Updates",
    },
  ];

  /*
   * FILTER FEED
   */
  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") {
      return notificationFeed;
    }

    return notificationFeed.filter(
      (item) =>
        item.category === activeFilter
    );
  }, [
    notificationFeed,
    activeFilter,
  ]);

  /*
   * ICON
   */
  const getIcon = (category) => {
    if (category === "games") {
      return (
        <Trophy className="h-5 w-5 text-amber-500" />
      );
    }

    if (category === "schedule") {
      return (
        <Calendar className="h-5 w-5 text-blue-500" />
      );
    }

    if (category === "players") {
      return (
        <User className="h-5 w-5 text-orange-500" />
      );
    }

    if (category === "teams") {
      return (
        <Users className="h-5 w-5 text-emerald-500" />
      );
    }

    if (category === "news") {
      return (
        <Newspaper className="h-5 w-5 text-purple-500" />
      );
    }

    return (
      <Bell className="h-5 w-5 text-orange-500" />
    );
  };

  /*
   * SIGNED OUT SCREEN
   */
  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-black text-white pt-20">

        <div className="max-w-5xl mx-auto px-6 py-20">

          <div className="border border-neutral-800 bg-neutral-950 rounded-2xl p-10 text-center">

            <div className="mx-auto mb-6 w-16 h-16 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center">

              <Lock className="h-7 w-7 text-neutral-500" />

            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Notifications
            </h1>

            <p className="text-neutral-500 max-w-lg mx-auto">
              Sign in to activate your J-Town Hoops
              notification center.
            </p>

          </div>

        </div>

      </main>
    );
  }

  /*
   * MAIN PAGE
   */
  return (
    <main className="min-h-screen bg-black text-white pt-20">

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-10">

          <div className="flex items-center gap-5">

            <div className="relative">

              <div className="h-20 w-20 rounded-2xl bg-orange-950/40 border border-orange-500/30 flex items-center justify-center">

                <Bell className="h-10 w-10 text-orange-500" />

              </div>

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 h-7 min-w-7 px-2 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">

                  {unreadCount}

                </span>
              )}

            </div>

            <div>

              <h1 className="text-5xl md:text-6xl font-black tracking-tight">
                League Bulletin
              </h1>

              <p className="text-neutral-500 mt-3">
                Live updates from the J-Town Hoops
                court.
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2">

              <CheckCircle2 className="h-4 w-4 text-emerald-500" />

              <span className="text-sm text-neutral-300">
                System fully synced
              </span>

            </div>

          </div>

        </div>

        {/* DIVIDER */}
        <div className="border-t border-neutral-900 mb-8" />

        {/* FILTER BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div className="flex flex-wrap items-center gap-2">

            <div className="flex items-center gap-2 text-neutral-500 mr-2">

              <Filter className="h-4 w-4" />

              <span className="text-sm">
                Filter:
              </span>

            </div>

            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() =>
                  setActiveFilter(filter.id)
                }
                className={`
                  px-4
                  py-2
                  rounded-full
                  text-sm
                  font-semibold
                  transition-all
                  ${
                    activeFilter === filter.id
                      ? "bg-orange-500 text-black"
                      : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white hover:border-neutral-700"
                  }
                `}
              >
                {filter.label}
              </button>
            ))}

          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-sm text-neutral-400 hover:text-orange-500 transition-colors underline"
            >
              Mark all as read
            </button>
          )}

        </div>

        {/* NOTIFICATION LIST */}
        <div className="space-y-4">

          {filteredNotifications.length === 0 ? (
            <div className="border border-neutral-900 bg-neutral-950 rounded-2xl p-12 text-center">

              <Bell className="h-8 w-8 text-neutral-700 mx-auto mb-4" />

              <h2 className="text-lg font-semibold text-neutral-300">
                No notifications yet
              </h2>

              <p className="text-sm text-neutral-600 mt-2">
                New J-Town Hoops updates will appear
                here automatically.
              </p>

            </div>
          ) : (
            filteredNotifications.map((item) => (

              <button
                key={item.id}
                type="button"
                onClick={() => {
                  markAsRead(item.id);
                  navigate(item.link || "/notifications");
                }}
                className={`
                  w-full
                  text-left
                  border
                  rounded-2xl
                  p-6
                  transition-all
                  ${
                    item.read
                      ? "border-neutral-900 bg-neutral-950 hover:border-neutral-800"
                      : "border-orange-600/50 bg-orange-950/10 hover:border-orange-500"
                  }
                `}
              >

                <div className="flex gap-5">

                  {/* ICON */}
                  <div className="flex-shrink-0">

                    <div className="h-12 w-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">

                      {getIcon(item.category)}

                    </div>

                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 min-w-0">

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">

                      <div className="flex items-center gap-2">

                        <h2
                          className={`
                            text-lg
                            font-bold
                            ${
                              item.read
                                ? "text-neutral-300"
                                : "text-white"
                            }
                          `}
                        >
                          {item.title}
                        </h2>

                        {!item.read && (
                          <span className="h-2.5 w-2.5 rounded-full bg-orange-500 flex-shrink-0" />
                        )}

                      </div>

                      <span className="text-xs text-neutral-600">
                        {item.date}
                      </span>

                    </div>

                    <p className="text-sm text-neutral-500 mt-2">
                      {item.desc}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">

                      <span className="px-3 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] uppercase tracking-wider text-orange-500 font-bold">
                        {item.category}
                      </span>

                      {item.origin === "news" && (
                        <span className="px-3 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
                          FROM NEWS
                        </span>
                      )}

                    </div>

                  </div>

                </div>

              </button>

            ))
          )}

        </div>

      </div>

      {/* LIVE INCOMING TOAST */}
      {incoming && (
        <div className="fixed bottom-6 right-6 z-50 w-[min(380px,calc(100vw-2rem))]">

          <div className="bg-neutral-950 border border-orange-500/50 shadow-2xl rounded-2xl p-5">

            <div className="flex items-start gap-4">

              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">

                <Bell className="h-5 w-5 text-orange-500" />

              </div>

              <div className="flex-1">

                <p className="text-xs uppercase tracking-widest text-orange-500 font-bold mb-1">
                  New J-Town Hoops Update
                </p>

                <h3 className="font-bold text-white">
                  {incoming.title}
                </h3>

                <p className="text-xs text-neutral-500 mt-1">
                  {incoming.desc}
                </p>

              </div>

              <button
                type="button"
                onClick={dismissIncoming}
                className="text-neutral-600 hover:text-white"
              >
                ×
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}


