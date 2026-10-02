// src/services/api.js

// ============================================================
// J-TOWN HOOPS API SERVICE
// ============================================================
//
// FRONTEND
//    ↓
// api.js
//    ↓
// Render Backend
//    ↓
// Express
//    ↓
// MongoDB Atlas
//
// ============================================================


// ============================================================
// BACKEND URL
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://jtownhoops-backend.onrender.com";


// ============================================================
// LOCAL STORAGE
// ============================================================
//
// IMPORTANT:
//
// We ONLY keep the small JWT token here.
//
// DO NOT store:
//
// profile pictures
// cover pictures
// videos
// music
// large base64 files
//
// in localStorage.
//
// ============================================================

const TOKEN_KEY = "jtown-hoops-token";


// ============================================================
// GET JWT TOKEN
// ============================================================

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error(
      "Could not read authentication token:",
      error
    );

    return null;
  }
}


// ============================================================
// GENERAL REQUEST FUNCTION
// ============================================================

async function request(
  endpoint,
  options = {}
) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };


  // ==========================================================
  // ATTACH JWT
  // ==========================================================

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }


  try {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers,
      }
    );


    // ========================================================
    // READ BACKEND RESPONSE
    // ========================================================

    let data = {};

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";


    if (
      contentType.includes(
        "application/json"
      )
    ) {
      data =
        await response.json();
    } else {
      const text =
        await response.text();

      if (text) {
        data = {
          message: text,
        };
      }
    }


    // ========================================================
    // HANDLE BACKEND ERROR
    // ========================================================

    if (!response.ok) {
      const error =
        new Error(
          data?.message ||
            data?.error ||
            `Request failed with status ${response.status}`
        );

      error.status =
        response.status;

      error.data =
        data;

      throw error;
    }


    // ========================================================
    // SUCCESS
    // ========================================================

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
// AUTHENTICATION API
// ============================================================

export const authAPI = {


  // ==========================================================
  // REGISTER
  // POST /api/v1/auth/sign-up
  // ==========================================================

  register: async (
    userData
  ) => {
    return request(
      "/api/v1/auth/sign-up",
      {
        method: "POST",

        body: JSON.stringify(
          userData
        ),
      }
    );
  },


  // ==========================================================
  // LOGIN
  // POST /api/v1/auth/sign-in
  // ==========================================================

  login: async ({
    email,
    password,
  }) => {
    return request(
      "/api/v1/auth/sign-in",
      {
        method: "POST",

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );
  },


  // ==========================================================
  // SIGN OUT
  // POST /api/v1/auth/sign-out
  // ==========================================================

  signOut: async () => {
    return request(
      "/api/v1/auth/sign-out",
      {
        method: "POST",
      }
    );
  },


  // ==========================================================
  // FORGOT PASSWORD
  // POST /api/v1/auth/forgot-password
  // ==========================================================

  forgotPassword: async ({
    email,
  }) => {
    return request(
      "/api/v1/auth/forgot-password",
      {
        method: "POST",

        body: JSON.stringify({
          email,
        }),
      }
    );
  },


  // ==========================================================
  // RESET PASSWORD
  // POST /api/v1/auth/reset-password
  // ==========================================================

  resetPassword: async ({
    token,
    password,
    confirmPassword,
  }) => {
    return request(
      "/api/v1/auth/reset-password",
      {
        method: "POST",

        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      }
    );
  },


  // ==========================================================
  // CHANGE PASSWORD
  // PATCH /api/v1/auth/change-password
  // ==========================================================

  changePassword: async ({
    currentPassword,
    newPassword,
    confirmPassword,
  }) => {
    return request(
      "/api/v1/auth/change-password",
      {
        method: "PATCH",

        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      }
    );
  },


  // ==========================================================
  // DELETE CURRENT ACCOUNT
  // DELETE /api/v1/auth/account
  // ==========================================================

  deleteAccount: async ({
    password,
    confirmation = "DELETE",
  }) => {
    return request(
      "/api/v1/auth/account",
      {
        method: "DELETE",

        body: JSON.stringify({
          password,
          confirmation,
        }),
      }
    );
  },


  // ==========================================================
  // CURRENT USER PROFILE
  // GET /api/v1/protected/profile
  // ==========================================================

  profile: async () => {
    return request(
      "/api/v1/protected/profile",
      {
        method: "GET",
      }
    );
  },


  // ==========================================================
  // ADMIN ACCESS
  // GET /api/v1/protected/admin
  // ==========================================================

  admin: async () => {
    return request(
      "/api/v1/protected/admin",
      {
        method: "GET",
      }
    );
  },


  // ==========================================================
  // MANAGEMENT ACCESS
  // GET /api/v1/protected/management
  // ==========================================================

  management: async () => {
    return request(
      "/api/v1/protected/management",
      {
        method: "GET",
      }
    );
  },
};


// ============================================================
// TEAMS API
// ============================================================
//
// PUBLIC:
//
// GET    /api/v1/teams
// GET    /api/v1/teams/:id
//
// ADMIN:
//
// POST   /api/v1/teams
// PUT    /api/v1/teams/:id
// DELETE /api/v1/teams/:id
//
// JWT is automatically attached by request() whenever
// a J-Town Hoops user is signed in.
//
// ============================================================

export const teamAPI = {


  // ==========================================================
  // GET ALL TEAMS
  // PUBLIC
  // ==========================================================

  getAll: async () => {
    return request(
      "/api/v1/teams",
      {
        method: "GET",
      }
    );
  },


  // ==========================================================
  // GET ONE TEAM
  // PUBLIC
  // ==========================================================

  getOne: async (
    teamId
  ) => {
    return request(
      `/api/v1/teams/${teamId}`,
      {
        method: "GET",
      }
    );
  },


  // ==========================================================
  // CREATE TEAM
  // ADMIN ONLY
  // ==========================================================

  create: async (
    teamData
  ) => {
    return request(
      "/api/v1/teams",
      {
        method: "POST",

        body: JSON.stringify(
          teamData
        ),
      }
    );
  },


  // ==========================================================
  // UPDATE TEAM
  // ADMIN ONLY
  // ==========================================================

  update: async (
    teamId,
    teamData
  ) => {
    return request(
      `/api/v1/teams/${teamId}`,
      {
        method: "PUT",

        body: JSON.stringify(
          teamData
        ),
      }
    );
  },


  // ==========================================================
  // DELETE TEAM
  // ADMIN ONLY
  // ==========================================================

  remove: async (
    teamId
  ) => {
    return request(
      `/api/v1/teams/${teamId}`,
      {
        method: "DELETE",
      }
    );
  },
};


// ============================================================
// GENERAL API OBJECT
// ============================================================

export const api = {
  request,
  auth: authAPI,
  teams: teamAPI,
};


// ============================================================
// EXPORT BACKEND URL
// ============================================================

export {
  API_URL,
};


export default API_URL;