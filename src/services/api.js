
/*
============================================================
🏀 J-TOWN HOOPS API SERVICE
JWT + HTTP-ONLY COOKIE AUTHENTICATION

Supports:
- Authentication and account management
- Profile and cover pictures
- Teams and players
- Roster highlights
- Gallery pictures
- News
- Videos
- Music and audio
- Schedules
- Cloudinary media uploads

IMPORTANT:
New account-media and roster-highlight endpoints
must be implemented in the backend before use.
============================================================
*/

const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://jtownhoops-backend-1.onrender.com")
).replace(/\/+$/, "");

const TOKEN_KEY = "jtown-hoops-token";

// ============================================================
// JWT TOKEN
// ============================================================

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Could not read JWT:", error);
    return null;
  }
}

// ============================================================
// SHARED REQUEST
// ============================================================

async function request(endpoint, options = {}) {
  const token = getToken();

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = new Headers(options.headers || {});

  if (!isFormData && options.body != null) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  // Keep JWT authentication.
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,

        // Keep HTTP-only cookie authentication.
        credentials: "include",

        headers,
      }
    );

    const contentType =
      response.headers.get("content-type") || "";

    let data = {};

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const responseText = await response.text();

      if (responseText) {
        data = { message: responseText };
      }
    }

    if (!response.ok) {
      const error = new Error(
        data?.message ||
          data?.error ||
          `Request failed (${response.status})`
      );

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;
  } catch (error) {
    console.error(
      `J-Town Hoops API error (${endpoint}):`,
      error
    );

    throw error;
  }
}

// ============================================================
// HELPERS
// ============================================================

function requireId(id, label = "Item") {
  if (
    id === undefined ||
    id === null ||
    String(id).trim() === ""
  ) {
    throw new Error(`${label} ID is required.`);
  }

  return encodeURIComponent(String(id));
}

function requireFile(file, label = "file") {
  if (!file) {
    throw new Error(`Please select a ${label}.`);
  }
}

function validateFile(file, allowedTypes, maxMB, label) {
  requireFile(file, label);

  if (
    file.type &&
    !allowedTypes.includes(file.type)
  ) {
    throw new Error(`Unsupported ${label} format.`);
  }

  if (file.size > maxMB * 1024 * 1024) {
    throw new Error(
      `${label} must be smaller than ${maxMB} MB.`
    );
  }
}

function makeFormData(file, fieldName, folder) {
  const formData = new FormData();

  formData.append(fieldName, file);
  formData.append("folder", folder);

  return formData;
}

function jsonRequest(endpoint, method, data) {
  return request(endpoint, {
    method,
    ...(data !== undefined
      ? { body: JSON.stringify(data) }
      : {}),
  });
}

// ============================================================
// AUTHENTICATION
// ============================================================

export const authAPI = {
  register: (userData) =>
    jsonRequest(
      "/api/v1/auth/sign-up",
      "POST",
      userData
    ),

  login: ({ email, password }) =>
    jsonRequest(
      "/api/v1/auth/sign-in",
      "POST",
      { email, password }
    ),

  signOut: () =>
    jsonRequest(
      "/api/v1/auth/sign-out",
      "POST"
    ),

  forgotPassword: ({ email }) =>
    jsonRequest(
      "/api/v1/auth/forgot-password",
      "POST",
      { email }
    ),

  resetPassword: ({
    token,
    password,
    confirmPassword,
  }) =>
    jsonRequest(
      "/api/v1/auth/reset-password",
      "POST",
      { token, password, confirmPassword }
    ),

  changePassword: ({
    currentPassword,
    newPassword,
    confirmPassword,
  }) =>
    jsonRequest(
      "/api/v1/auth/change-password",
      "PATCH",
      {
        currentPassword,
        newPassword,
        confirmPassword,
      }
    ),

  deleteAccount: ({
    password,
    confirmation = "DELETE",
  }) =>
    jsonRequest(
      "/api/v1/auth/account",
      "DELETE",
      { password, confirmation }
    ),

  profile: () =>
    request("/api/v1/protected/profile", {
      method: "GET",
    }),

  admin: () =>
    request("/api/v1/protected/admin", {
      method: "GET",
    }),

  management: () =>
    request("/api/v1/protected/management", {
      method: "GET",
    }),

  // NEW BACKEND ENDPOINTS - NOT YET IMPLEMENTED

  updateProfile: (profileData) =>
    jsonRequest(
      "/api/v1/profile",
      "PATCH",
      profileData
    ),

  uploadProfilePicture: (file) => {
    validateFile(
      file,
      ["image/jpeg", "image/png", "image/webp"],
      5,
      "Profile picture"
    );

    return request("/api/v1/profile/avatar", {
      method: "POST",
      body: makeFormData(
        file,
        "image",
        "profiles"
      ),
    });
  },

  uploadCoverPicture: (file) => {
    validateFile(
      file,
      ["image/jpeg", "image/png", "image/webp"],
      5,
      "Cover picture"
    );

    return request("/api/v1/profile/cover", {
      method: "POST",
      body: makeFormData(
        file,
        "image",
        "covers"
      ),
    });
  },
};

// ============================================================
// TEAMS
// ============================================================

export const teamAPI = {
  getAll: () =>
    request("/api/v1/teams", {
      method: "GET",
    }),

  getOne: (teamId) =>
    request(
      `/api/v1/teams/${requireId(teamId, "Team")}`,
      { method: "GET" }
    ),

  create: (teamData) =>
    jsonRequest(
      "/api/v1/teams",
      "POST",
      teamData
    ),

  update: (teamId, teamData) =>
    jsonRequest(
      `/api/v1/teams/${requireId(teamId, "Team")}`,
      "PUT",
      teamData
    ),

  remove: (teamId) =>
    request(
      `/api/v1/teams/${requireId(teamId, "Team")}`,
      { method: "DELETE" }
    ),
};

// ============================================================
// PLAYERS AND ROSTER
// ============================================================

export const playerAPI = {
  getAll: () =>
    request("/api/v1/players", {
      method: "GET",
    }),

  getOne: (playerId) =>
    request(
      `/api/v1/players/${requireId(playerId, "Player")}`,
      { method: "GET" }
    ),

  create: (playerData) =>
    jsonRequest(
      "/api/v1/players",
      "POST",
      playerData
    ),

  update: (playerId, playerData) =>
    jsonRequest(
      `/api/v1/players/${requireId(playerId, "Player")}`,
      "PUT",
      playerData
    ),

  remove: (playerId) =>
    request(
      `/api/v1/players/${requireId(playerId, "Player")}`,
      { method: "DELETE" }
    ),
};

// Existing Home roster endpoint.
export const rosterAPI = {
  getAll: () =>
    request("/api/v1/roster", {
      method: "GET",
    }),

  // NEW BACKEND ENDPOINTS - NOT YET IMPLEMENTED

  addHighlight: (playerId, highlightData) =>
    jsonRequest(
      `/api/v1/roster/${requireId(
        playerId,
        "Player"
      )}/highlights`,
      "POST",
      highlightData
    ),

  removeHighlight: (playerId, highlightId) =>
    request(
      `/api/v1/roster/${requireId(
        playerId,
        "Player"
      )}/highlights/${requireId(
        highlightId,
        "Highlight"
      )}`,
      { method: "DELETE" }
    ),
};

// ============================================================
// GALLERY PICTURES
// ============================================================

export const pictureAPI = {
  getAll: () =>
    request("/api/v1/pictures", {
      method: "GET",
    }),

  getOne: (pictureId) =>
    request(
      `/api/v1/pictures/${requireId(
        pictureId,
        "Picture"
      )}`,
      { method: "GET" }
    ),

  create: (pictureData) =>
    jsonRequest(
      "/api/v1/pictures",
      "POST",
      pictureData
    ),

  update: (pictureId, pictureData) =>
    jsonRequest(
      `/api/v1/pictures/${requireId(
        pictureId,
        "Picture"
      )}`,
      "PUT",
      pictureData
    ),

  remove: (pictureId) =>
    request(
      `/api/v1/pictures/${requireId(
        pictureId,
        "Picture"
      )}`,
      { method: "DELETE" }
    ),

  like: (pictureId) =>
    request(
      `/api/v1/pictures/${requireId(
        pictureId,
        "Picture"
      )}/like`,
      { method: "PATCH" }
    ),
};

// ============================================================
// NEWS
// ============================================================

export const newsAPI = {
  getAll: () =>
    request("/api/v1/news", {
      method: "GET",
    }),

  getOne: (newsId) =>
    request(
      `/api/v1/news/${requireId(newsId, "News")}`,
      { method: "GET" }
    ),

  create: (newsData) =>
    jsonRequest(
      "/api/v1/news",
      "POST",
      newsData
    ),

  update: (newsId, newsData) =>
    jsonRequest(
      `/api/v1/news/${requireId(newsId, "News")}`,
      "PUT",
      newsData
    ),

  remove: (newsId) =>
    request(
      `/api/v1/news/${requireId(newsId, "News")}`,
      { method: "DELETE" }
    ),
};

// ============================================================
// VIDEOS
// ============================================================

export const videoAPI = {
  getAll: () =>
    request("/api/v1/videos", {
      method: "GET",
    }),

  getOne: (videoId) =>
    request(
      `/api/v1/videos/${requireId(videoId, "Video")}`,
      { method: "GET" }
    ),

  create: (videoData) =>
    jsonRequest(
      "/api/v1/videos",
      "POST",
      videoData
    ),

  update: (videoId, videoData) =>
    jsonRequest(
      `/api/v1/videos/${requireId(videoId, "Video")}`,
      "PUT",
      videoData
    ),

  remove: (videoId) =>
    request(
      `/api/v1/videos/${requireId(videoId, "Video")}`,
      { method: "DELETE" }
    ),
};

// ============================================================
// MUSIC
// ============================================================

export const musicAPI = {
  getAll: () =>
    request("/api/v1/music", {
      method: "GET",
    }),

  getOne: (musicId) =>
    request(
      `/api/v1/music/${requireId(musicId, "Music")}`,
      { method: "GET" }
    ),

  create: (musicData) =>
    jsonRequest(
      "/api/v1/music",
      "POST",
      musicData
    ),

  update: (musicId, musicData) =>
    jsonRequest(
      `/api/v1/music/${requireId(musicId, "Music")}`,
      "PUT",
      musicData
    ),

  remove: (musicId) =>
    request(
      `/api/v1/music/${requireId(musicId, "Music")}`,
      { method: "DELETE" }
    ),
};

// ============================================================
// SCHEDULE
// ============================================================

export const scheduleAPI = {
  getAll: () =>
    request("/api/v1/schedules", {
      method: "GET",
    }),

  getOne: (scheduleId) =>
    request(
      `/api/v1/schedules/${requireId(
        scheduleId,
        "Schedule"
      )}`,
      { method: "GET" }
    ),

  create: (scheduleData) =>
    jsonRequest(
      "/api/v1/schedules",
      "POST",
      scheduleData
    ),

  update: (scheduleId, scheduleData) =>
    jsonRequest(
      `/api/v1/schedules/${requireId(
        scheduleId,
        "Schedule"
      )}`,
      "PUT",
      scheduleData
    ),

  remove: (scheduleId) =>
    request(
      `/api/v1/schedules/${requireId(
        scheduleId,
        "Schedule"
      )}`,
      { method: "DELETE" }
    ),
};

// ============================================================
// CLOUDINARY MEDIA UPLOADS
// ============================================================

export const mediaAPI = {
  // Existing image upload API.
  uploadImage: ({
    file,
    folder = "general",
  }) => {
    validateFile(
      file,
      [
        "image/jpeg",
        "image/png",
        "image/webp",
      ],
      5,
      "Image"
    );

    return request("/api/v1/uploads/image", {
      method: "POST",
      body: makeFormData(
        file,
        "image",
        folder
      ),
    });
  },

  // Existing video upload API.
  uploadVideo: ({
    file,
    folder = "videos",
  }) => {
    validateFile(
      file,
      [
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-m4v",
      ],
      100,
      "Video"
    );

    return request("/api/v1/uploads/video", {
      method: "POST",
      body: makeFormData(
        file,
        "video",
        folder
      ),
    });
  },

  // Existing audio upload API.
  uploadAudio: ({
    file,
    folder = "music",
  }) => {
    requireFile(file, "audio file");

    const allowedTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/wave",
      "audio/webm",
      "audio/mp4",
      "audio/x-m4a",
      "audio/aac",
      "audio/ogg",
    ];

    const allowedExtensions = [
      ".mp3",
      ".wav",
      ".webm",
      ".m4a",
      ".aac",
      ".ogg",
    ];

    const name = String(
      file.name || ""
    ).toLowerCase();

    const validExtension =
      allowedExtensions.some((extension) =>
        name.endsWith(extension)
      );

    const validType =
      !file.type ||
      allowedTypes.includes(file.type);

    if (!validType && !validExtension) {
      throw new Error(
        "Only MP3, WAV, WEBM, M4A, AAC and OGG audio files are allowed."
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      throw new Error(
        "Audio file must be smaller than 50 MB."
      );
    }

    return request("/api/v1/uploads/audio", {
      method: "POST",
      body: makeFormData(
        file,
        "audio",
        folder
      ),
    });
  },

  // Convenience helpers for individual sections.
  // These upload media; they do not automatically
  // save content records in MongoDB.

  uploadGalleryPicture: (file) =>
    mediaAPI.uploadImage({
      file,
      folder: "gallery",
    }),

  uploadRosterPicture: (file) =>
    mediaAPI.uploadImage({
      file,
      folder: "roster",
    }),

  uploadRosterHighlight: (file) =>
    mediaAPI.uploadVideo({
      file,
      folder: "roster-highlights",
    }),

  uploadMusicFile: (file) =>
    mediaAPI.uploadAudio({
      file,
      folder: "music",
    }),

  uploadMusicCover: (file) =>
    mediaAPI.uploadImage({
      file,
      folder: "music-covers",
    }),

  uploadVideoFile: (file) =>
    mediaAPI.uploadVideo({
      file,
      folder: "videos",
    }),

  uploadVideoThumbnail: (file) =>
    mediaAPI.uploadImage({
      file,
      folder: "video-thumbnails",
    }),

  uploadNewsPicture: (file) =>
    mediaAPI.uploadImage({
      file,
      folder: "news",
    }),

  uploadTeamLogo: (file) =>
    mediaAPI.uploadImage({
      file,
      folder: "teams",
    }),
};

// ============================================================
// GENERAL API OBJECT
// ============================================================

export const api = {
  request,
  auth: authAPI,
  teams: teamAPI,
  players: playerAPI,
  roster: rosterAPI,
  pictures: pictureAPI,
  news: newsAPI,
  videos: videoAPI,
  music: musicAPI,
  schedules: scheduleAPI,
  media: mediaAPI,
};

// ============================================================
// EXPORTS
// ============================================================

export { API_URL };

export default API_URL;
