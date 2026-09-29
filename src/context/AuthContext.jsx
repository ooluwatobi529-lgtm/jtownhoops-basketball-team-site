// src/context/AuthContext.jsx

import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import { authAPI } from "../services/api";

// ============================================================
// J-TOWN HOOPS AUTH CONTEXT
// ============================================================

const AuthContext = createContext(null);

// ============================================================
// LOCAL STORAGE KEYS
// ============================================================
//
// IMPORTANT:
//
// LocalStorage should contain ONLY SMALL authentication data.
//
// DO NOT store:
// - profile pictures
// - cover pictures
// - Base64 images
// - uploaded media
// - large arrays
//
// MongoDB/backend should eventually hold persistent profile
// media.
//
// ============================================================

const USER_KEY =
  "jtown-hoops-current-user-v3";

const TOKEN_KEY =
  "jtown-hoops-token";

// ============================================================
// CREATE SMALL STORAGE USER
// ============================================================
//
// This is the most important part of this fix.
//
// We deliberately choose the small values that are allowed
// to enter localStorage instead of copying the entire user.
//
// ============================================================

function createStorageUser(account) {
  if (!account) {
    return null;
  }

  return {
    id:
      account.id ||
      account._id ||
      "",

    name:
      account.name ||
      "",

    email:
      account.email ||
      "",

    role:
      account.role ||
      "user",

    phone:
      account.phone ||
      "",

    address:
      account.address ||
      "",

    nationality:
      account.nationality ||
      "",

    occupation:
      account.occupation ||
      "",

    bio:
      account.bio ||
      "",

    isActive:
      account.isActive ??
      true,

    isVerified:
      account.isVerified ??
      false,

    lastLogin:
      account.lastLogin ||
      null,

    createdAt:
      account.createdAt ||
      null,

    updatedAt:
      account.updatedAt ||
      null,
  };
}

// ============================================================
// SAFE LOCAL STORAGE SET
// ============================================================
//
// A storage problem must NEVER destroy a successful login.
//
// If the browser refuses localStorage, React can still keep
// the signed-in user for the current session.
//
// ============================================================

function safeSetItem(key, value) {
  try {
    localStorage.setItem(
      key,
      value
    );

    return true;
  } catch (error) {
    console.warn(
      `Could not save ${key} to localStorage:`,
      error
    );

    return false;
  }
}

// ============================================================
// SAFE LOCAL STORAGE REMOVE
// ============================================================

function safeRemoveItem(key) {
  try {
    localStorage.removeItem(
      key
    );
  } catch (error) {
    console.warn(
      `Could not remove ${key} from localStorage:`,
      error
    );
  }
}

// ============================================================
// LOAD SAVED USER
// ============================================================

function loadUser() {
  try {
    const savedUser =
      localStorage.getItem(
        USER_KEY
      );

    if (!savedUser) {
      return null;
    }

    const parsedUser =
      JSON.parse(
        savedUser
      );

    if (
      !parsedUser ||
      !parsedUser.email
    ) {
      return null;
    }

    // --------------------------------------------------------
    // CLEAN OLD V3 DATA IF NECESSARY
    // --------------------------------------------------------

    const smallUser =
      createStorageUser(
        parsedUser
      );

    safeSetItem(
      USER_KEY,
      JSON.stringify(
        smallUser
      )
    );

    return smallUser;
  } catch (error) {
    console.error(
      "Could not restore signed-in user:",
      error
    );

    safeRemoveItem(
      USER_KEY
    );

    return null;
  }
}

// ============================================================
// AUTH PROVIDER
// ============================================================

export function AuthProvider({
  children,
}) {
  // ==========================================================
  // CURRENT USER
  // ==========================================================

  const [
    user,
    setUserState,
  ] = useState(
    loadUser
  );

  // ==========================================================
  // AUTH LOADING STATE
  // ==========================================================

  const [
    authLoading,
    setAuthLoading,
  ] = useState(false);

  // ==========================================================
  // SET CURRENT USER
  // ==========================================================

  const setUser = (
    nextUser
  ) => {
    const value =
      typeof nextUser ===
      "function"
        ? nextUser(user)
        : nextUser;

    // --------------------------------------------------------
    // REMOVE USER
    // --------------------------------------------------------

    if (!value) {
      safeRemoveItem(
        USER_KEY
      );

      setUserState(
        null
      );

      return;
    }

    // --------------------------------------------------------
    // CREATE SMALL USER
    // --------------------------------------------------------

    const smallUser =
      createStorageUser(
        value
      );

    // --------------------------------------------------------
    // SAVE ONLY SMALL USER
    // --------------------------------------------------------

    safeSetItem(
      USER_KEY,
      JSON.stringify(
        smallUser
      )
    );

    // --------------------------------------------------------
    // UPDATE REACT
    // --------------------------------------------------------

    setUserState(
      smallUser
    );
  };

  // ==========================================================
  // REGISTER
  // ==========================================================
  //
  // Registration creates the account in MongoDB.
  //
  // It DOES NOT automatically log the new member in.
  //
  // App.jsx will redirect the member to /account.
  //
  // ==========================================================

  const register = async (
    data
  ) => {
    setAuthLoading(true);

    try {
      const response =
        await authAPI.register(
          data
        );

      if (
        !response?.success
      ) {
        throw new Error(
          response?.message ||
            "Registration failed."
        );
      }

      // ------------------------------------------------------
      // DO NOT AUTO LOGIN
      // ------------------------------------------------------

      safeRemoveItem(
        USER_KEY
      );

      safeRemoveItem(
        TOKEN_KEY
      );

      setUserState(
        null
      );

      return (
        response.user ||
        response
      );
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      throw error;
    } finally {
      setAuthLoading(
        false
      );
    }
  };

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async ({
    email,
    password,
  }) => {
    setAuthLoading(true);

    try {
      // ------------------------------------------------------
      // SEND CREDENTIALS TO BACKEND
      // ------------------------------------------------------

      const response =
        await authAPI.login({
          email,
          password,
        });

      // ------------------------------------------------------
      // CHECK RESPONSE
      // ------------------------------------------------------

      if (
        !response?.success
      ) {
        throw new Error(
          response?.message ||
            "Login failed."
        );
      }

      // ------------------------------------------------------
      // CHECK TOKEN
      // ------------------------------------------------------

      if (!response.token) {
        throw new Error(
          "The backend did not return an authentication token."
        );
      }

      // ------------------------------------------------------
      // CHECK USER
      // ------------------------------------------------------

      if (!response.user) {
        throw new Error(
          "The backend did not return the user account."
        );
      }

      // ------------------------------------------------------
      // CREATE SMALL USER FIRST
      // ------------------------------------------------------

      const signedInUser =
        createStorageUser(
          response.user
        );

      // ------------------------------------------------------
      // SAVE TOKEN
      // ------------------------------------------------------

      safeSetItem(
        TOKEN_KEY,
        response.token
      );

      // ------------------------------------------------------
      // SAVE SMALL USER
      // ------------------------------------------------------

      safeSetItem(
        USER_KEY,
        JSON.stringify(
          signedInUser
        )
      );

      // ------------------------------------------------------
      // UPDATE REACT
      // ------------------------------------------------------

      setUserState(
        signedInUser
      );

      // ------------------------------------------------------
      // LOGIN SUCCESS
      // ------------------------------------------------------

      return signedInUser;
    } catch (error) {
      // ------------------------------------------------------
      // FAILED LOGIN
      // ------------------------------------------------------
      //
      // Wrong password / wrong email should NOT crash the page.
      //
      // We remove only the failed authentication session.
      //
      // ------------------------------------------------------

      safeRemoveItem(
        TOKEN_KEY
      );

      safeRemoveItem(
        USER_KEY
      );

      setUserState(
        null
      );

      console.error(
        "Login error:",
        error
      );

      // Account.jsx receives this and can display:
      //
      // Incorrect email or password.
      //
      throw error;
    } finally {
      setAuthLoading(
        false
      );
    }
  };

  // ==========================================================
  // REFRESH PROFILE
  // ==========================================================
  //
  // GET /api/v1/protected/profile
  //
  // ==========================================================

  const refreshProfile =
    async () => {
      setAuthLoading(true);

      try {
        const response =
          await authAPI.profile();

        if (
          !response?.success
        ) {
          throw new Error(
            response?.message ||
              "Could not load profile."
          );
        }

        if (
          response?.user
        ) {
          // --------------------------------------------------
          // CREATE SMALL VERSION
          // --------------------------------------------------

          const updatedUser =
            createStorageUser(
              response.user
            );

          // --------------------------------------------------
          // SAVE SMALL VERSION ONLY
          // --------------------------------------------------

          safeSetItem(
            USER_KEY,
            JSON.stringify(
              updatedUser
            )
          );

          // --------------------------------------------------
          // UPDATE REACT
          // --------------------------------------------------

          setUserState(
            updatedUser
          );

          return updatedUser;
        }

        return null;
      } catch (error) {
        console.error(
          "Could not refresh profile:",
          error
        );

        throw error;
      } finally {
        setAuthLoading(
          false
        );
      }
    };

  // ==========================================================
  // CHECK ADMIN ACCESS
  // ==========================================================

  const checkAdminAccess =
    async () => {
      try {
        const response =
          await authAPI.admin();

        return response;
      } catch (error) {
        console.error(
          "Admin access denied:",
          error
        );

        throw error;
      }
    };

  // ==========================================================
  // CHECK MANAGEMENT ACCESS
  // ==========================================================

  const checkManagementAccess =
    async () => {
      try {
        const response =
          await authAPI.management();

        return response;
      } catch (error) {
        console.error(
          "Management access denied:",
          error
        );

        throw error;
      }
    };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = async () => {
    try {
      // ------------------------------------------------------
      // TELL BACKEND
      // ------------------------------------------------------

      await authAPI.signOut();
    } catch (error) {
      // ------------------------------------------------------
      // RENDER MAY BE ASLEEP/OFFLINE.
      //
      // THIS MUST NOT PREVENT LOGOUT.
      // ------------------------------------------------------

      console.warn(
        "Backend sign-out request failed:",
        error
      );
    } finally {
      // ------------------------------------------------------
      // REMOVE TOKEN
      // ------------------------------------------------------

      safeRemoveItem(
        TOKEN_KEY
      );

      // ------------------------------------------------------
      // REMOVE CURRENT V3 USER ONLY
      // ------------------------------------------------------
      //
      // IMPORTANT:
      //
      // We DO NOT touch:
      //
      // jtown-hoops-current-user-v1
      //
      // so your old admin account data remains untouched.
      //
      // ------------------------------------------------------

      safeRemoveItem(
        USER_KEY
      );

      // ------------------------------------------------------
      // CLEAR REACT USER
      // ------------------------------------------------------

      setUserState(
        null
      );
    }
  };

  // ==========================================================
  // ROLE VALUES
  // ==========================================================

  const userRole =
    user?.role
      ? String(
          user.role
        ).toLowerCase()
      : null;

  const isAdmin =
    userRole ===
    "admin";

  const isManager =
    userRole ===
    "manager";

  const isManagement =
    isAdmin ||
    isManager;

  const isSignedIn =
    Boolean(user);

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value =
    useMemo(
      () => ({
        // ----------------------------------------------------
        // CURRENT USER
        // ----------------------------------------------------

        user,

        setUser,

        // ----------------------------------------------------
        // AUTHENTICATION
        // ----------------------------------------------------

        login,

        register,

        logout,

        // ----------------------------------------------------
        // BACKEND PROFILE
        // ----------------------------------------------------

        refreshProfile,

        // ----------------------------------------------------
        // BACKEND ROLE CHECKS
        // ----------------------------------------------------

        checkAdminAccess,

        checkManagementAccess,

        // ----------------------------------------------------
        // LOADING
        // ----------------------------------------------------

        authLoading,

        // ----------------------------------------------------
        // CONVENIENCE VALUES
        // ----------------------------------------------------

        isSignedIn,

        isAdmin,

        isManager,

        isManagement,

        userRole,
      }),
      [
        user,
        authLoading,
        userRole,
        isAdmin,
        isManager,
        isManagement,
        isSignedIn,
      ]
    );

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// USE AUTH
// ============================================================

export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}