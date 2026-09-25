import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

// ============================================================
// LOCAL STORAGE KEYS
// ============================================================

const USER_KEY = "jtown-hoops-current-user-v2";

const ACCOUNTS_KEY =
  "jtown-hoops-registered-accounts-v1";

// ============================================================
// LOAD CURRENT SIGNED-IN USER
// ============================================================

function loadUser() {
  try {
    const saved = JSON.parse(localStorage.getItem(USER_KEY) || "null");
    return saved && saved.email ? saved : null;
  } catch (error) {
    console.error("Could not restore signed-in user:", error);
    return null;
  }
}

// ============================================================
// LOAD REGISTERED ACCOUNTS
// ============================================================

function loadAccounts() {
  try {
    const savedAccounts = JSON.parse(
      localStorage.getItem(ACCOUNTS_KEY) || "[]"
    );

    return Array.isArray(savedAccounts)
      ? savedAccounts
      : [];
  } catch (error) {
    console.error(
      "Could not load registered accounts:",
      error
    );

    return [];
  }
}

function getAdminEmails() {
  const plural = String(import.meta.env.VITE_ADMIN_EMAILS || "");
  const singular = String(import.meta.env.VITE_ADMIN_EMAIL || "");

  return [...plural.split(","), singular]
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

// ============================================================
// CLEAN / VALIDATE ROLE
// ============================================================

function cleanRole(role) {
  const value = String(role || "user")
    .trim()
    .toLowerCase();

  const allowedRoles = [
    "user",
    "player",
    "team",
    "supporter",
    "manager",
    "admin",
  ];

  return allowedRoles.includes(value)
    ? value
    : "user";
}

// ============================================================
// REMOVE PASSWORD BEFORE PUTTING USER INTO APP STATE
// ============================================================

function publicUser(account) {
  if (!account) return null;

  const {
    password,
    confirmPassword,
    ...safeUser
  } = account;

  return safeUser;
}

// ============================================================
// AUTH PROVIDER
// ============================================================


const PROFILE_PREFIX = "jtown_hoops_profile_v2::";

function profileKeyForEmail(email) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  return cleanEmail ? `${PROFILE_PREFIX}${cleanEmail}` : null;
}

function createCleanProfileForAccount(account) {
  const key = profileKeyForEmail(account?.email);
  if (!key) return;

  const role = String(account?.role || account?.accountType || "user");
  const normalizedRole =
    role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

  const profile = {
    name:
      account?.name ||
      account?.fullName ||
      account?.teamName ||
      account?.managerFullName ||
      "J-Town Member",
    email: account?.email || "",
    phone: account?.phone || "",
    location: account?.location || account?.address || "",
    birthday: account?.birthday || account?.dateOfBirth || "",
    bio: account?.bio || "",
    avatar: "",
    coverImage: "",
    role: normalizedRole,
  };

  localStorage.setItem(key, JSON.stringify(profile));
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(loadUser);

  const [accounts, setAccounts] =
    useState(loadAccounts);

  // ==========================================================
  // SET CURRENT USER
  // ==========================================================

  const setUser = (nextUser) => {
    const value =
      typeof nextUser === "function"
        ? nextUser(user)
        : nextUser;

    // Keep the CURRENT authenticated account across refreshes.
    // This stores only the public user object; passwords are never stored here.
    if (value) {
      localStorage.setItem(USER_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(USER_KEY);
    }

    setUserState(value);
  };

  // ==========================================================
  // REGISTER
  //
  // ALL REGISTRATION SOURCES USE THIS FUNCTION:
  //
  // About Us
  // Account -> Create Account
  // Register.jsx
  //
  // Registration DOES NOT automatically sign the person in.
  // ==========================================================

  const register = (data) => {
    const email = String(data?.email || "")
      .trim()
      .toLowerCase();

    const password = String(
      data?.password || ""
    );

    // --------------------------------------------------------
    // VALIDATE EMAIL
    // --------------------------------------------------------

    if (!email) {
      throw new Error(
        "An email address is required."
      );
    }

    // --------------------------------------------------------
    // VALIDATE PASSWORD
    // --------------------------------------------------------

    if (password.length < 6) {
      throw new Error(
        "Password must contain at least 6 characters."
      );
    }

    // --------------------------------------------------------
    // PREVENT DUPLICATE EMAILS
    // --------------------------------------------------------

    const existingAccount = accounts.some(
      (account) =>
        String(account.email || "")
          .trim()
          .toLowerCase() === email
    );

    if (existingAccount) {
      throw new Error(
        "An account with this email already exists. Please sign in."
      );
    }

    // --------------------------------------------------------
    // PRESERVE REGISTRATION ROLE
    // --------------------------------------------------------

    const role = cleanRole(
      data?.role || data?.accountType
    );

    // --------------------------------------------------------
    // CREATE ACCOUNT
    // --------------------------------------------------------

    const newAccount = {
      ...data,

      id:
        data?.id ||
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}`,

      email,

      password,

      role,

      accountType: role,

      createdAt:
        data?.createdAt ||
        new Date().toISOString(),
    };

    // --------------------------------------------------------
    // SAVE ACCOUNT
    // --------------------------------------------------------

    const updatedAccounts = [
      ...accounts,
      newAccount,
    ];

    localStorage.setItem(
      ACCOUNTS_KEY,
      JSON.stringify(updatedAccounts)
    );

    setAccounts(updatedAccounts);

    // Create a completely separate profile for this newly registered account.
    // This intentionally does NOT copy avatar/cover data from any previous user.
    const newProfileKey = profileKeyForEmail(newAccount.email);
    if (newProfileKey && !localStorage.getItem(newProfileKey)) {
      createCleanProfileForAccount(newAccount);
    }

    // ========================================================
    // CLEAR ANY PREVIOUS SIGNED-IN SESSION
    // ========================================================
    //
    // If Admin (or any other account) is currently signed in
    // while a new User / Player / Team / Supporter / Manager
    // account is registered, the previous session must end.
    //
    // The new account is created successfully, but it is NOT
    // automatically signed in. The person must sign in using
    // the credentials they just registered.
    // ========================================================

    localStorage.removeItem(USER_KEY);
    setUserState(null);

    return publicUser(newAccount);
  };

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = ({ email, password }) => {
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (!cleanEmail) {
      throw new Error("Please enter your email address.");
    }

    if (!cleanPassword) {
      throw new Error("Please enter your password.");
    }

    const account = accounts.find(
      (item) =>
        String(item.email || "").trim().toLowerCase() === cleanEmail
    );

    const adminEmails = getAdminEmails();
    const isConfiguredAdmin = adminEmails.includes(cleanEmail);
    const configuredAdminPassword = String(
      import.meta.env.VITE_ADMIN_PASSWORD || ""
    );

    // ========================================================
    // ADMIN LOGIN
    // Supports BOTH:
    //   VITE_ADMIN_EMAILS=email1,email2
    // and:
    //   VITE_ADMIN_EMAIL=email
    //
    // If VITE_ADMIN_PASSWORD exists, it is authoritative.
    // Otherwise an existing registered record for that admin email
    // supplies the password. This keeps compatibility with the
    // earlier J-Town setup without turning normal users into admins.
    // ========================================================
    if (isConfiguredAdmin) {
      if (configuredAdminPassword) {
        if (cleanPassword !== configuredAdminPassword) {
          throw new Error("Incorrect email or password.");
        }
      } else if (account?.password) {
        if (String(account.password) !== cleanPassword) {
          throw new Error("Incorrect email or password.");
        }
      }

      const adminUser = publicUser({
        ...(account || {}),
        id: account?.id || "jtown-admin",
        name:
          account?.name ||
          account?.fullName ||
          account?.managerFullName ||
          "J-Town Admin",
        email: cleanEmail,
        role: "admin",
        accountType: "admin",
      });

      const adminProfileKey = profileKeyForEmail(adminUser.email);
      if (adminProfileKey && !localStorage.getItem(adminProfileKey)) {
        createCleanProfileForAccount(adminUser);
      }

      setUser(adminUser);
      return adminUser;
    }

    // ========================================================
    // NORMAL REGISTERED ACCOUNT LOGIN
    // ========================================================
    if (!account) {
      throw new Error(
        "No J-Town Hoops account was found with this email."
      );
    }

    if (String(account.password || "") !== cleanPassword) {
      throw new Error("Incorrect email or password.");
    }

    const signedInUser = publicUser({
      ...account,
      role: cleanRole(account.role || account.accountType),
      accountType: cleanRole(account.accountType || account.role),
    });

    const signedInProfileKey = profileKeyForEmail(signedInUser.email);
    if (
      signedInProfileKey &&
      !localStorage.getItem(signedInProfileKey)
    ) {
      createCleanProfileForAccount(signedInUser);
    }

    setUser(signedInUser);
    return signedInUser;
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {
    setUser(null);
  };

  // ==========================================================
  // AUTH VALUES AVAILABLE THROUGHOUT WEBSITE
  // ==========================================================

  const value = useMemo(
    () => ({
      // Current signed-in user
      user,

      // Allows profile/account updates
      setUser,

      // Authentication
      login,
      register,
      logout,

      // Convenience values
      isAdmin: user?.role === "admin",

      isSignedIn: Boolean(user),

      userRole:
        user?.role || null,
    }),
    [user, accounts]
  );

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// USE AUTH HOOK
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