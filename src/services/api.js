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
// Those large items are what caused the previous:
//
// QuotaExceededError
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
  //
  // User enters their email.
  //
  // Backend:
  //
  // 1. Finds the account
  // 2. Creates a secure reset token
  // 3. Stores the HASHED token
  // 4. Emails the reset link
  //
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
  //
  // This is called from:
  //
  // ResetPassword.jsx
  //
  // after the user clicks the link in their email.
  //
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
  //
  // User MUST already be signed in.
  //
  // JWT is automatically attached above.
  //
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
  //
  // User must:
  //
  // 1. Be signed in
  // 2. Enter their password
  // 3. Confirm DELETE
  //
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
// GENERAL API OBJECT
// ============================================================

export const api = {
  request,
  auth: authAPI,
};


// ============================================================
// EXPORT BACKEND URL
// ============================================================

export {
  API_URL,
};


export default API_URL;