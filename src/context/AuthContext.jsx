
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { authAPI } from "../services/api";

// ============================================================
// 🏀 J-TOWN HOOPS AUTHENTICATION CONTEXT
// ============================================================
// Backend-verified authentication
// MongoDB profile synchronization
// Cloudinary profile and cover images
// Session restoration without sign-in flicker
// JWT + HTTP-only cookie compatibility
// ============================================================

const AuthContext = createContext(null);

const USER_KEY = "jtown-hoops-current-user-v3";
const TOKEN_KEY = "jtown-hoops-token";

// ============================================================
// SAFE STORAGE
// ============================================================

function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn("Storage write failed:", error);
    return false;
  }
}

function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore unavailable browser storage.
  }
}

// ============================================================
// SAFE MEDIA URL
// ============================================================

function safeMediaUrl(value) {
  if (typeof value !== "string") return "";

  const url = value.trim();

  if (!url || url.length > 2048) return "";

  try {
    const parsed = new URL(url);

    return parsed.protocol === "https:" ? url : "";
  } catch {
    return "";
  }
}

// ============================================================
// NORMALIZE USER
// ============================================================

function normalizeUser(account) {
  if (!account) return null;

  return {
    id: String(account.id || account._id || ""),

    name: account.name || "",
    email: account.email || "",
    role: account.role || "user",

    phone: account.phone || "",
    address: account.address || "",
    nationality: account.nationality || "",
    occupation: account.occupation || "",

    birthday: account.birthday || "",
    bio: account.bio || "",

    profilePicture: safeMediaUrl(
      account.profilePicture ||
        account.avatarUrl ||
        account.avatar ||
        ""
    ),

    coverImage: safeMediaUrl(
      account.coverImage ||
        account.coverPicture ||
        account.coverPhoto ||
        ""
    ),

    playerInfo: account.playerInfo || {},
    teamInfo: account.teamInfo || {},
    managerInfo: account.managerInfo || {},

    isActive: account.isActive ?? true,
    isVerified: account.isVerified ?? false,

    lastLogin: account.lastLogin || null,
    createdAt: account.createdAt || null,
    updatedAt: account.updatedAt || null,
  };
}

// ============================================================
// USER CACHE
// ============================================================
// Cached profile data is for display/storage only.
// It never proves that a session is authenticated.
// ============================================================

function saveUser(account) {
  const normalized = normalizeUser(account);

  if (normalized) {
    safeSetItem(
      USER_KEY,
      JSON.stringify(normalized)
    );
  } else {
    safeRemoveItem(USER_KEY);
  }

  return normalized;
}

function loadCachedUser() {
  try {
    const stored = safeGetItem(USER_KEY);

    if (!stored) return null;

    const parsed = JSON.parse(stored);

    if (!parsed?.email) return null;

    return normalizeUser(parsed);
  } catch {
    return null;
  }
}

function clearLocalAuth() {
  safeRemoveItem(TOKEN_KEY);
  safeRemoveItem(USER_KEY);
}

// ============================================================
// ACCOUNT IDENTITY
// ============================================================

function isSameAccount(first, second) {
  if (!first || !second) return false;

  const firstId = first.id || first._id;
  const secondId = second.id || second._id;

  if (firstId && secondId) {
    return String(firstId) === String(secondId);
  }

  return Boolean(
    first.email &&
      second.email &&
      first.email.toLowerCase() ===
        second.email.toLowerCase()
  );
}

// ============================================================
// AUTH PROVIDER
// ============================================================

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [authInitialized, setAuthInitialized] =
    useState(false);

  // Each authentication operation receives a version.
  // Older session responses cannot overwrite newer ones.
  const authVersion = useRef(0);

  // ==========================================================
  // SET USER
  // ==========================================================

  const setUser = useCallback((nextUser) => {
    setUserState((previousUser) => {
      const resolved =
        typeof nextUser === "function"
          ? nextUser(previousUser)
          : nextUser;

      if (!resolved) {
        saveUser(null);
        return null;
      }

      const merged =
        isSameAccount(previousUser, resolved)
          ? { ...previousUser, ...resolved }
          : resolved;

      return saveUser(merged);
    });
  }, []);

  // ==========================================================
  // RESTORE AUTHENTICATED SESSION
  // ==========================================================
  // Do not show the sign-in interface until the
  // backend has completed its initial session check.
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const version = ++authVersion.current;

    async function restoreSession() {
      setAuthLoading(true);
      setAuthInitialized(false);

      try {
        const response = await authAPI.profile();

        if (!response?.success || !response?.user) {
          throw new Error(
            "The backend did not verify the session."
          );
        }

        if (
          cancelled ||
          version !== authVersion.current
        ) {
          return;
        }

        const verifiedUser = saveUser(
          response.user
        );

        setUserState(verifiedUser);
      } catch (error) {
        if (
          cancelled ||
          version !== authVersion.current
        ) {
          return;
        }

        if (
          error?.status === 401 ||
          error?.status === 403
        ) {
          clearLocalAuth();
        }

        // Never authenticate from cached data alone.
        setUserState(null);

        console.warn(
          "Session restoration failed:",
          error
        );
      } finally {
        if (
          !cancelled &&
          version === authVersion.current
        ) {
          setAuthLoading(false);
          setAuthInitialized(true);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = useCallback(
    async ({ email, password }) => {
      const version = ++authVersion.current;

      setAuthLoading(true);

      try {
        const response = await authAPI.login({
          email,
          password,
        });

        if (!response?.success || !response?.user) {
          throw new Error(
            response?.message || "Sign-in failed."
          );
        }

        if (!response?.token) {
          throw new Error(
            "The backend did not return a JWT token."
          );
        }

        if (version !== authVersion.current) {
          throw new Error(
            "This sign-in attempt was superseded."
          );
        }

        safeSetItem(TOKEN_KEY, response.token);

        const signedInUser = saveUser(
          response.user
        );

        setUserState(signedInUser);

        return signedInUser;
      } catch (error) {
        if (version === authVersion.current) {
          clearLocalAuth();
          setUserState(null);
        }

        throw error;
      } finally {
        if (version === authVersion.current) {
          setAuthLoading(false);
          setAuthInitialized(true);
        }
      }
    },
    []
  );

  // ==========================================================
  // REGISTER
  // ==========================================================

  const register = useCallback(async (data) => {
    const version = ++authVersion.current;

    setAuthLoading(true);

    try {
      const response = await authAPI.register(data);

      if (!response?.success) {
        throw new Error(
          response?.message || "Registration failed."
        );
      }

      if (version === authVersion.current) {
        clearLocalAuth();
        setUserState(null);
      }

      return response.user || response;
    } finally {
      if (version === authVersion.current) {
        setAuthLoading(false);
        setAuthInitialized(true);
      }
    }
  }, []);

  // ==========================================================
  // REFRESH PROFILE
  // ==========================================================

  const refreshProfile = useCallback(async () => {
    const version = authVersion.current;

    setAuthLoading(true);

    try {
      const response = await authAPI.profile();

      if (!response?.success || !response?.user) {
        throw new Error(
          response?.message ||
            "Could not refresh your profile."
        );
      }

      if (version !== authVersion.current) {
        return null;
      }

      const updatedUser = saveUser(
        response.user
      );

      setUserState(updatedUser);

      return updatedUser;
    } catch (error) {
      if (
        version === authVersion.current &&
        (error?.status === 401 ||
          error?.status === 403)
      ) {
        clearLocalAuth();
        setUserState(null);
      }

      throw error;
    } finally {
      if (version === authVersion.current) {
        setAuthLoading(false);
      }
    }
  }, []);

  // ==========================================================
  // UPDATE PROFILE MEDIA
  // ==========================================================

  const updateProfileMedia = useCallback(
    ({ profilePicture, coverImage } = {}) => {
      setUserState((previousUser) => {
        if (!previousUser) return null;

        const changes = {};

        if (profilePicture !== undefined) {
          changes.profilePicture =
            safeMediaUrl(profilePicture);
        }

        if (coverImage !== undefined) {
          changes.coverImage =
            safeMediaUrl(coverImage);
        }

        return saveUser({
          ...previousUser,
          ...changes,
        });
      });
    },
    []
  );

  // ==========================================================
  // ADMIN ACCESS
  // ==========================================================

  const checkAdminAccess = useCallback(
    async () => {
      return authAPI.admin();
    },
    []
  );

  // ==========================================================
  // MANAGEMENT ACCESS
  // ==========================================================

  const checkManagementAccess = useCallback(
    async () => {
      return authAPI.management();
    },
    []
  );

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = useCallback(async () => {
    const version = ++authVersion.current;

    setAuthLoading(true);

    try {
      await authAPI.signOut();
    } catch (error) {
      console.warn(
        "Backend sign-out failed:",
        error
      );
    } finally {
      if (version === authVersion.current) {
        clearLocalAuth();
        setUserState(null);
        setAuthLoading(false);
        setAuthInitialized(true);
      }
    }
  }, []);

  // ==========================================================
  // USER ROLES
  // ==========================================================

  const userRole = user?.role
    ? String(user.role).toLowerCase()
    : null;

  const isAdmin = userRole === "admin";
  const isManager = userRole === "manager";

  const isManagement =
    isAdmin || isManager;

  const isSignedIn =
    authInitialized && Boolean(user);

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = useMemo(
    () => ({
      user,
      setUser,

      login,
      register,
      logout,

      refreshProfile,
      updateProfileMedia,

      checkAdminAccess,
      checkManagementAccess,

      authLoading,
      authInitialized,

      isSignedIn,
      isAdmin,
      isManager,
      isManagement,
      userRole,

      cachedUser: loadCachedUser(),
    }),
    [
      user,
      setUser,
      login,
      register,
      logout,
      refreshProfile,
      updateProfileMedia,
      checkAdminAccess,
      checkManagementAccess,
      authLoading,
      authInitialized,
      isSignedIn,
      isAdmin,
      isManager,
      isManagement,
      userRole,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// USE AUTH
// ============================================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
