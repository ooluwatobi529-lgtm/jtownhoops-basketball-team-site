import React, { useState, useEffect } from "react";
import "./SidebarWidget.css";
import {
  FaPuzzlePiece,
  FaCalendarAlt,
  FaGamepad,
  FaMusic,
  FaVideo,
  FaImage,
  FaUserPlus,
  FaNewspaper,
  FaUserCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom"; // ✅ use React Router for navigation

export default function SidebarWidget() {
  const [isPaused, setIsPaused] = useState(false);
  const [position, setPosition] = useState(-250);

  const menuItems = [
    { title: "About Us", icon: <FaInfoCircle />, path: "/aboutus" },
    { title: "Widget", icon: <FaPuzzlePiece />, path: "/widget" },
    { title: "Games", icon: <FaGamepad />, path: "/games" },
    { title: "Music", icon: <FaMusic />, path: "/music" },
    { title: "Videos", icon: <FaVideo />, path: "/videos" },
    { title: "Pictures", icon: <FaImage />, path: "/pictures" },
    { title: "Register Now", icon: <FaUserPlus />, path: "/register" },
    { title: "News", icon: <FaNewspaper />, path: "/News" },
    //{ title: "Account", icon: <FaUserCircle />, path: "/account" },

  ];

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setPosition((prev) => (prev === -250 ? 0 : -250));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  return (
    <div
      className="sidebar"
      style={{ right: `${position}px` }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <ul>
        {menuItems.map((item, index) => (
          <li key={index} className="sidebar-item">
            {item.icon}
            <Link to={item.path} className="sidebar-link">
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
