
import { useEffect, useRef, useState } from "react";
import {
  User, Mail, Lock, LogOut, ShieldCheck, LogIn,
  Camera, Phone, Settings, KeyRound, Eye, EyeOff,
  Save, MapPin, CalendarDays, Bell, Users,
  HeartHandshake, Home, X, Trash2, AlertTriangle,
  Loader2, CheckCircle2,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { authAPI } from "../services/api";

// ============================================================
// J-TOWN HOOPS ACCOUNT
// Cloudinary + MongoDB-ready account media
// JWT + HTTP-only cookie authentication
// ============================================================

const PROFILE_PREFIX = "jtown_hoops_profile_v2::";

const emptyProfile = () => ({
  name: "",
  email: "",
  phone: "",
  location: "",
  birthday: "",
  bio: "",
  avatar: "",
  coverImage: "",
  role: "User",
});

const accountKey = (user) =>
  String(user?.email || "").trim().toLowerCase();

const profileStorageKey = (user) =>
  `${PROFILE_PREFIX}${accountKey(user)}`;

function readLocalProfile(user) {
  if (!user?.email) return {};

  try {
    return JSON.parse(
      localStorage.getItem(profileStorageKey(user)) || "{}"
    );
  } catch {
    return {};
  }
}

function saveLocalProfile(user, profile) {
  if (!user?.email) return;

  const {
    avatar,
    coverImage,
    role,
    email,
    ...smallProfile
  } = profile;

  try {
    localStorage.setItem(
      profileStorageKey(user),
      JSON.stringify(smallProfile)
    );
  } catch (error) {
    console.warn("Could not save local profile:", error);
  }
}

function roleIcon(role) {
  const value = String(role || "").toLowerCase();

  if (value === "team") return <Users size={18} />;
  if (value === "supporter") {
    return <HeartHandshake size={18} />;
  }
  if (value === "admin" || value === "manager") {
    return <ShieldCheck size={18} />;
  }
  return <User size={18} />;
}

function normalizeMediaResponse(response, type) {
  const user = response?.user || response?.data?.user;

  const value =
    type === "avatar"
      ? user?.profilePicture ||
        response?.profilePicture ||
        response?.data?.profilePicture ||
        response?.url ||
        response?.secure_url ||
        response?.data?.url
      : user?.coverImage ||
        response?.coverImage ||
        response?.data?.coverImage ||
        response?.url ||
        response?.secure_url ||
        response?.data?.url;

  if (
    response?.success !== true ||
    typeof value !== "string" ||
    !value.startsWith("https://")
  ) {
    throw new Error(
      "The server did not confirm that your picture was saved."
    );
  }

  return value;
}

function validateImage(file) {
  if (!file) throw new Error("Choose an image first.");

  if (
    !["image/jpeg", "image/png", "image/webp"].includes(
      file.type
    )
  ) {
    throw new Error("Only JPG, PNG and WEBP images are supported.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Please choose an image smaller than 5 MB.");
  }
}

function Shell({ children }) {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-12 text-white sm:px-6">
      <div className="mx-auto flex min-h-[65vh] max-w-6xl items-center justify-center">
        {children}
      </div>
    </main>
  );
}

function Message({ type = "error", children }) {
  return (
    <div
      className={`mb-5 rounded-xl border p-4 text-sm font-medium ${
        type === "success"
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/30 bg-red-500/10 text-red-300"
      }`}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-neutral-300">
        {label}
      </span>
      <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-black px-4 focus-within:border-orange-500">
        {Icon && <Icon size={18} className="text-orange-400" />}
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[50px] w-full bg-transparent py-3 text-white outline-none placeholder:text-neutral-600 disabled:opacity-60"
        />
      </div>
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-neutral-300">
        {label}
      </span>
      <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-black px-4 focus-within:border-orange-500">
        <Lock size={18} className="text-orange-400" />
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="min-h-[50px] w-full bg-transparent py-3 text-white outline-none placeholder:text-neutral-600"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="cursor-pointer text-neutral-400 hover:text-orange-400"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
        <Icon size={16} className="text-orange-400" />
        {label}
      </div>
      <p className="mt-2 break-words font-semibold text-white">
        {value || "Not added"}
      </p>
    </div>
  );
}

const buttonClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50";

// ============================================================
// ACCOUNT COMPONENT
// ============================================================

export default function Account() {
  const {
    user,
    login,
    logout,
    isAdmin,
    authInitialized,
    updateProfileMedia,
    setUser,
  } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addSiteUpdate } = useNotifications();

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const [view, setView] = useState("profile");
  const [profile, setProfile] = useState(emptyProfile);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const notify = (title, description) => {
    try {
      addSiteUpdate?.({
        title,
        desc: description,
        category: "account",
        origin: "account",
        type: "account",
        link: "/account",
        showInNews: false,
        showInNotifications: true,
        ownerEmail: user?.email,
      });
    } catch (notificationError) {
      console.warn("Account notification failed:", notificationError);
    }
  };

  const announceProfileUpdate = (next) => {
    window.dispatchEvent(
      new CustomEvent("jtown-profile-updated", {
        detail: {
          email: accountKey(user),
          profile: next,
        },
      })
    );
  };

  // ==========================================================
  // RESTORE PROFILE
  // ==========================================================

  useEffect(() => {
    if (!user) {
      setProfile(emptyProfile());
      return;
    }

    const saved = readLocalProfile(user);
    const rawRole = isAdmin ? "Admin" : user.role || "User";
    const role =
      rawRole.charAt(0).toUpperCase() +
      rawRole.slice(1).toLowerCase();

    setProfile({
      ...emptyProfile(),
      ...saved,
      name: saved.name || user.name || "J-Town Member",
      email: user.email || "",
      phone: saved.phone || user.phone || "",
      location: saved.location || user.address || "",
      bio: saved.bio || user.bio || "",
      avatar: user.profilePicture || "",
      coverImage: user.coverImage || "",
      role,
    });
  }, [
    user?.id,
    user?.email,
    user?.name,
    user?.phone,
    user?.address,
    user?.bio,
    user?.profilePicture,
    user?.coverImage,
    user?.role,
    isAdmin,
  ]);

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setSuccess(
        "Registration successful. Please sign in."
      );
      setEmail(searchParams.get("email") || "");
    } else if (searchParams.get("passwordReset") === "1") {
      setSuccess(
        "Password reset successful. Please sign in."
      );
    } else if (searchParams.get("deleted") === "1") {
      setSuccess(
        "Your J-Town Hoops account was deleted."
      );
    }
  }, [searchParams]);

  // ==========================================================
  // SIGN IN
  // ==========================================================

  const handleSignIn = async (event) => {
    event.preventDefault();
    clearMessages();
    setSigningIn(true);

    try {
      const signedInUser = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      setPassword("");
      setView("profile");
      setSuccess("Welcome back to J-Town Hoops!");

      try {
        addSiteUpdate?.({
          title: "Signed In",
          desc: `${signedInUser?.name || "A member"} signed in.`,
          category: "account",
          origin: "account",
          type: "account",
          link: "/account",
          showInNews: false,
          showInNotifications: true,
          ownerEmail: signedInUser?.email,
        });
      } catch {
        // Notification failures must not interrupt sign-in.
      }
    } catch (loginError) {
      setPassword("");
      setError(loginError.message || "Sign-in failed.");
    } finally {
      setSigningIn(false);
    }
  };

  // ==========================================================
  // SIGN OUT
  // ==========================================================

  const handleSignOut = async () => {
    if (
      !window.confirm(
        "Are you sure you want to sign out of J-Town Hoops?"
      )
    ) {
      return;
    }

    await logout();
    setProfile(emptyProfile());
    setEmail("");
    setPassword("");
    clearMessages();
    navigate("/account", { replace: true });
  };

  // ==========================================================
  // PROFILE + COVER UPLOAD
  // ==========================================================

  const handleMediaUpload = async (event, type) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    clearMessages();

    const isAvatar = type === "avatar";
    const setUploading = isAvatar
      ? setUploadingAvatar
      : setUploadingCover;

    try {
      validateImage(file);
      setUploading(true);

      const response = isAvatar
        ? await authAPI.uploadProfilePicture(file)
        : await authAPI.uploadCoverPicture(file);

      const url = normalizeMediaResponse(response, type);

      const mediaChange = isAvatar
        ? { profilePicture: url }
        : { coverImage: url };

      updateProfileMedia(mediaChange);

      const next = {
        ...profile,
        ...(isAvatar
          ? { avatar: url }
          : { coverImage: url }),
      };

      setProfile(next);
      announceProfileUpdate(next);

      setSuccess(
        isAvatar
          ? "Profile picture saved successfully."
          : "Cover picture saved successfully."
      );

      notify(
        "Account Picture Updated",
        isAvatar
          ? "Your profile picture was updated."
          : "Your cover picture was updated."
      );
    } catch (uploadError) {
      setError(
        uploadError?.status === 404
          ? "The media upload endpoint is not ready yet. We need to finish the backend."
          : uploadError?.message ||
              "The picture could not be uploaded."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // ==========================================================
  // SAVE ACCOUNT SETTINGS
  // ==========================================================

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!profile.name.trim()) {
      setError("Please enter your display name.");
      return;
    }

    if (!profile.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    // Email and role changes require separate backend
    // verification; this form cannot change either.
    if (
      profile.email.trim().toLowerCase() !==
      user.email.trim().toLowerCase()
    ) {
      setError(
        "Email changes require a separate verified account process."
      );
      return;
    }

    setSavingProfile(true);

    try {
      const payload = {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        address: profile.location.trim(),
        bio: profile.bio.trim(),
        birthday: profile.birthday || "",
      };

      const response = await authAPI.updateProfile(payload);

      if (!response?.success || !response?.user) {
        throw new Error(
          "The server did not confirm the profile update."
        );
      }

      setUser({
        ...user,
        ...response.user,
      });

      saveLocalProfile(user, profile);

      announceProfileUpdate(profile);
      setSuccess("Account settings saved successfully.");

      notify(
        "Profile Updated",
        "Your J-Town Hoops account settings were updated."
      );
    } catch (saveError) {
      setError(
        saveError?.status === 404
          ? "Permanent profile editing will become available after the backend is connected."
          : saveError.message || "Could not save profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // ==========================================================
  // CHANGE PASSWORD
  // ==========================================================

  const handleChangePassword = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please complete all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must contain at least 6 characters.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("Choose a password different from the current one.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await authAPI.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (response?.success === false) {
        throw new Error(
          response.message || "Password change failed."
        );
      }

      if (response?.token) {
        try {
          localStorage.setItem(
            "jtown-hoops-token",
            response.token
          );
        } catch (storageError) {
          console.warn("Could not store refreshed JWT:", storageError);
        }
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(
        response?.message || "Password changed successfully."
      );

      notify(
        "Password Changed",
        "Your J-Town Hoops password was changed."
      );
    } catch (passwordError) {
      setError(
        passwordError.message || "Could not change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  // ==========================================================
  // DELETE ACCOUNT
  // ==========================================================

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!deletePassword) {
      setError("Enter your current password.");
      return;
    }

    if (deleteConfirmation.trim() !== "DELETE") {
      setError('Type "DELETE" exactly to confirm.');
      return;
    }

    if (
      !window.confirm(
        "FINAL WARNING: Permanently delete your J-Town Hoops account?"
      )
    ) {
      return;
    }

    setDeleting(true);

    try {
      const response = await authAPI.deleteAccount({
        password: deletePassword,
        confirmation: "DELETE",
      });

      if (response?.success === false) {
        throw new Error(
          response.message || "Account deletion failed."
        );
      }

      try {
        localStorage.removeItem(profileStorageKey(user));
      } catch {
        // Ignore browser cleanup failures.
      }

      await logout();
      setShowDeleteModal(false);
      setProfile(emptyProfile());

      navigate("/account?deleted=1", {
        replace: true,
      });
    } catch (deleteError) {
      setError(
        deleteError.message ||
          "Account could not be deleted."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================================
  // AUTHENTICATION INITIALIZATION
  // ==========================================================

  if (!authInitialized) {
    return (
      <Shell>
        <div className="text-center">
          <Loader2
            size={42}
            className="mx-auto animate-spin text-orange-500"
          />
          <p className="mt-5 font-semibold text-neutral-400">
            Restoring your J-Town Hoops session...
          </p>
        </div>
      </Shell>
    );
  }

  // ==========================================================
  // SIGN-IN SCREEN
  // ==========================================================

  if (!user) {
    return (
      <Shell>
        <div className="w-full max-w-lg">
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-black shadow-xl shadow-orange-500/20">
              <LogIn size={36} />
            </div>
            <h1 className="mt-5 text-4xl font-black">
              Welcome Back
            </h1>
            <p className="mt-2 text-neutral-500">
              Sign in to your J-Town Hoops account.
            </p>
          </div>

          <form
            onSubmit={handleSignIn}
            className="rounded-3xl border border-neutral-800 bg-black p-6 shadow-2xl md:p-8"
          >
            {error && <Message>{error}</Message>}
            {success && (
              <Message type="success">{success}</Message>
            )}

            <div className="space-y-5">
              <Field
                label="Email address"
                icon={Mail}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Enter your email"
              />
              <PasswordField
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="ml-auto mt-4 block cursor-pointer text-sm font-bold text-orange-400 hover:text-orange-300"
            >
              Forgot password?
            </button>

            <button
              type="submit"
              disabled={signingIn}
              className={`${buttonClass} mt-6 w-full py-4`}
            >
              {signingIn ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="mt-5 w-full cursor-pointer rounded-xl border border-neutral-800 bg-neutral-950 py-3.5 text-sm font-bold text-neutral-300 transition hover:border-orange-500 hover:text-orange-400"
            >
              New here? Create a J-Town Hoops account
            </button>
          </form>
        </div>
      </Shell>
    );
  }

  // ==========================================================
  // SIGNED-IN ACCOUNT
  // ==========================================================

  const displayRole = isAdmin
    ? "Admin"
    : profile.role || user.role || "User";

  return (
    <Shell>
      <div className="w-full max-w-5xl">
        <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-black/80 shadow-2xl backdrop-blur-md">

          {/* COVER AND ACCOUNT HEADER */}

          <div
            className="relative min-h-[300px] overflow-hidden border-b border-neutral-800"
            style={
              profile.coverImage
                ? {
                    backgroundImage: `url("${profile.coverImage}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {
                    background:
                      "linear-gradient(135deg,#171717 0%,#262626 45%,#7c2d12 100%)",
                  }
            }
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/90" />

            <Link
              to="/"
              className="absolute left-3 top-3 z-30 flex items-center gap-2 rounded-lg border border-white/20 bg-black/65 px-3 py-2 text-xs font-bold text-white hover:bg-orange-500 hover:text-black"
            >
              <Home size={14} />
              Exit
              <X size={12} />
            </Link>

            <button
              type="button"
              disabled={uploadingCover}
              onClick={() => coverInputRef.current?.click()}
              className="absolute right-4 top-14 z-20 flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-xs font-bold text-white backdrop-blur-md hover:bg-orange-500 hover:text-black disabled:opacity-50"
            >
              {uploadingCover ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Camera size={15} />
              )}
              {uploadingCover ? "Uploading..." : "Change Cover"}
            </button>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                handleMediaUpload(event, "cover")
              }
              className="hidden"
            />

            <div className="relative z-10 flex min-h-[300px] flex-col justify-end p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">

                  <div className="relative">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-orange-500 bg-neutral-900 shadow-2xl shadow-black/60">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User
                          size={48}
                          className="text-orange-400"
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() =>
                        avatarInputRef.current?.click()
                      }
                      title="Change profile picture"
                      className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-black bg-orange-500 text-black hover:scale-110 hover:bg-orange-400 disabled:opacity-50"
                    >
                      {uploadingAvatar ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Camera size={17} />
                      )}
                    </button>

                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        handleMediaUpload(event, "avatar")
                      }
                      className="hidden"
                    />
                  </div>

                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[.25em] text-orange-400">
                      J-Town Hoops Account
                    </p>
                    <h1 className="mt-1 text-3xl font-black text-white md:text-4xl">
                      {profile.name || user.name || "J-Town Member"}
                    </h1>
                    <p className="mt-1 text-sm text-neutral-200">
                      {user.email}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-orange-500/50 bg-black/60 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-orange-400">
                      {roleIcon(displayRole)}
                      {displayRole}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-400/40 bg-black/60 px-5 py-3 font-black text-red-300 hover:border-red-500 hover:bg-red-500 hover:text-white md:mt-8"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* ACCOUNT TABS */}

          <div className="grid grid-cols-3 border-b border-neutral-800">
            {[
              { key: "profile", label: "Profile", icon: User },
              { key: "settings", label: "Settings", icon: Settings },
              { key: "security", label: "Security", icon: Lock },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  clearMessages();
                  setView(key);
                }}
                className={`flex cursor-pointer items-center justify-center gap-2 border-b-2 px-2 py-5 text-sm font-bold transition ${
                  view === key
                    ? "border-orange-500 bg-orange-500/10 text-orange-400"
                    : "border-transparent text-neutral-500 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          {/* ACCOUNT CONTENT */}

          <div className="p-6 md:p-8">
            {error && <Message>{error}</Message>}
            {success && (
              <Message type="success">{success}</Message>
            )}

            {/* PROFILE TAB */}

            {view === "profile" && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Info
                    icon={Mail}
                    label="Email"
                    value={user.email}
                  />
                  <Info
                    icon={Phone}
                    label="Phone"
                    value={profile.phone}
                  />
                  <Info
                    icon={MapPin}
                    label="Location"
                    value={profile.location}
                  />
                </div>

                <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                  <h2 className="font-black">About</h2>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    {profile.bio ||
                      "Add a short bio from Account Settings."}
                  </p>
                </div>
              </>
            )}

            {/* SETTINGS TAB */}

            {view === "settings" && (
              <form onSubmit={handleSaveProfile}>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Display name"
                    icon={User}
                    value={profile.name}
                    onChange={(name) =>
                      setProfile((p) => ({ ...p, name }))
                    }
                  />
                  <Field
                    label="Email (verified account)"
                    icon={Mail}
                    type="email"
                    value={user.email}
                    disabled
                  />
                  <Field
                    label="Phone"
                    icon={Phone}
                    type="tel"
                    value={profile.phone}
                    onChange={(phone) =>
                      setProfile((p) => ({ ...p, phone }))
                    }
                  />
                  <Field
                    label="Location"
                    icon={MapPin}
                    value={profile.location}
                    onChange={(location) =>
                      setProfile((p) => ({ ...p, location }))
                    }
                  />
                  <Field
                    label="Birthday"
                    icon={CalendarDays}
                    type="date"
                    value={profile.birthday}
                    onChange={(birthday) =>
                      setProfile((p) => ({ ...p, birthday }))
                    }
                  />

                  <div>
                    <p className="mb-2 text-sm font-bold text-neutral-300">
                      Account role
                    </p>
                    <div className="flex min-h-[50px] items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 font-black text-orange-400">
                      {roleIcon(displayRole)}
                      {displayRole}
                    </div>
                    <p className="mt-2 text-xs text-neutral-500">
                      Your account role is controlled by the server.
                    </p>
                  </div>

                  <label className="md:col-span-2">
                    <span className="mb-2 block text-sm font-bold text-neutral-300">
                      Bio
                    </span>
                    <textarea
                      rows={4}
                      value={profile.bio}
                      onChange={(event) =>
                        setProfile((p) => ({
                          ...p,
                          bio: event.target.value,
                        }))
                      }
                      placeholder="Tell the J-Town community a little about yourself..."
                      className="w-full resize-none rounded-xl border border-neutral-800 bg-black px-4 py-3 text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className={`${buttonClass} mt-6`}
                >
                  {savingProfile ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {savingProfile
                    ? "Saving..."
                    : "Save Account Settings"}
                </button>
              </form>
            )}

            {/* SECURITY TAB */}

            {view === "security" && (
              <>
                <div className="rounded-2xl border border-orange-500/20 bg-neutral-950 p-5 md:p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                      <KeyRound size={23} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black">
                        Change Password
                      </h2>
                      <p className="mt-1 text-sm text-neutral-500">
                        Secure your J-Town Hoops account.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleChangePassword}
                    className="mt-6 space-y-5"
                  >
                    <PasswordField
                      label="Current Password"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      placeholder="Current password"
                      autoComplete="current-password"
                    />
                    <PasswordField
                      label="New Password"
                      value={newPassword}
                      onChange={setNewPassword}
                      placeholder="New password"
                      autoComplete="new-password"
                    />
                    <PasswordField
                      label="Confirm New Password"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                    />

                    <button
                      type="submit"
                      disabled={changingPassword}
                      className={buttonClass}
                    >
                      {changingPassword ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <ShieldCheck size={18} />
                      )}
                      {changingPassword
                        ? "Changing Password..."
                        : "Change Password"}
                    </button>
                  </form>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <Info
                    icon={Mail}
                    label="Recovery Email"
                    value={user.email}
                  />
                  <Info
                    icon={Phone}
                    label="Recovery Phone"
                    value={profile.phone}
                  />
                  <Info
                    icon={Bell}
                    label="Security Notifications"
                    value="Account activity notifications"
                  />
                </div>

                <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-black">
                      Forgot your password?
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Request a password reset link by email.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="cursor-pointer rounded-xl border border-orange-500/40 px-5 py-3 font-bold text-orange-400 hover:bg-orange-500 hover:text-black"
                  >
                    Reset Password
                  </button>
                </div>

                <div className="mt-7 rounded-2xl border border-red-500/30 bg-red-500/5 p-5 md:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-black text-red-300">
                        <AlertTriangle size={20} />
                        Danger Zone
                      </div>
                      <p className="mt-2 text-sm text-neutral-400">
                        Permanently delete your J-Town Hoops account.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        clearMessages();
                        setShowDeleteModal(true);
                      }}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/40 px-5 py-3 font-bold text-red-300 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={18} />
                      Delete Account
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-neutral-600">
          J-Town Hoops — Training talent. Building character.
          Creating opportunities.
        </p>
      </div>

      {/* DELETE ACCOUNT CONFIRMATION */}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-neutral-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-black text-red-300">
                <AlertTriangle size={22} />
                Delete Account
              </h2>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                className="cursor-pointer text-neutral-400 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <p className="mt-4 text-sm text-neutral-400">
              This action is permanent. Enter your password and
              type DELETE to continue.
            </p>

            <form
              onSubmit={handleDeleteAccount}
              className="mt-5 space-y-4"
            >
              <PasswordField
                label="Current Password"
                value={deletePassword}
                onChange={setDeletePassword}
                placeholder="Your password"
                autoComplete="current-password"
              />
              <Field
                label='Type "DELETE"'
                value={deleteConfirmation}
                onChange={setDeleteConfirmation}
                placeholder="DELETE"
              />

              <button
                type="submit"
                disabled={deleting}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-black text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
                {deleting
                  ? "Deleting Account..."
                  : "Permanently Delete Account"}
              </button>
            </form>

            {error && (
              <div className="mt-4">
                <Message>{error}</Message>
              </div>
            )}
          </div>
        </div>
      )}
    </Shell>
  );
}
