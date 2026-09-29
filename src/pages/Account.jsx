import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  User,
  Mail,
  Lock,
  LogOut,
  ShieldCheck,
  LogIn,
  Camera,
  Phone,
  Settings,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  MapPin,
  CalendarDays,
  Bell,
  Users,
  HeartHandshake,
  Home,
  X,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useNotifications,
} from "../context/NotificationContext";

import {
  authAPI,
} from "../services/api";


// ============================================================
// J-TOWN HOOPS ACCOUNT PAGE
// ============================================================
//
// IMPORTANT:
//
// Small text profile information:
// localStorage
//
// Large profile/cover images:
// IndexedDB
//
// This prevents profile pictures from filling localStorage.
// ============================================================


// ============================================================
// STORAGE
// ============================================================

const PROFILE_PREFIX =
  "jtown_hoops_profile_v2::";

const MEDIA_DB_NAME =
  "jtown-hoops-account-media";

const MEDIA_STORE_NAME =
  "profile-media";

const MEDIA_DB_VERSION = 1;

const TOKEN_KEY =
  "jtown-hoops-token";


// ============================================================
// EMPTY PROFILE
// ============================================================

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


// ============================================================
// ACCOUNT STORAGE KEY
// ============================================================

const accountKey = (user) =>
  String(user?.email || "")
    .trim()
    .toLowerCase();


const profileStorageKey = (user) => {
  const key = accountKey(user);

  return key
    ? `${PROFILE_PREFIX}${key}`
    : null;
};


const mediaStorageKey = (
  user,
  type
) => {
  const key = accountKey(user);

  return key
    ? `${key}::${type}`
    : null;
};


// ============================================================
// REMOVE LARGE MEDIA FROM LOCALSTORAGE PROFILE
// ============================================================

const profileWithoutMedia = (
  profile
) => {
  const {
    avatar,
    coverImage,
    ...smallProfile
  } = profile || {};

  return smallProfile;
};


// ============================================================
// LOAD SMALL PROFILE
// ============================================================

const loadProfileForUser = (
  user
) => {
  const key =
    profileStorageKey(user);

  if (!key) {
    return emptyProfile();
  }

  try {
    const saved =
      JSON.parse(
        localStorage.getItem(key) ||
          "{}"
      );

    const {
      avatar,
      coverImage,
      ...smallSaved
    } = saved || {};

    return {
      ...emptyProfile(),
      ...smallSaved,

      // Never restore large images
      // from localStorage.
      avatar: "",
      coverImage: "",
    };
  } catch {
    return emptyProfile();
  }
};


// ============================================================
// SAVE SMALL PROFILE
// ============================================================

function saveSmallProfile(
  user,
  profile
) {
  const key =
    profileStorageKey(user);

  if (!key) {
    return;
  }

  try {
    localStorage.setItem(
      key,
      JSON.stringify(
        profileWithoutMedia(profile)
      )
    );
  } catch (error) {
    console.warn(
      "Could not save account profile:",
      error
    );
  }
}


// ============================================================
// OPEN INDEXEDDB
// ============================================================

function openMediaDB() {
  return new Promise(
    (resolve, reject) => {
      if (
        !("indexedDB" in window)
      ) {
        reject(
          new Error(
            "This browser does not support profile media storage."
          )
        );

        return;
      }

      const request =
        indexedDB.open(
          MEDIA_DB_NAME,
          MEDIA_DB_VERSION
        );

      request.onerror = () => {
        reject(
          request.error ||
            new Error(
              "Could not open profile media storage."
            )
        );
      };

      request.onupgradeneeded =
        () => {
          const db =
            request.result;

          if (
            !db.objectStoreNames.contains(
              MEDIA_STORE_NAME
            )
          ) {
            db.createObjectStore(
              MEDIA_STORE_NAME
            );
          }
        };

      request.onsuccess = () => {
        resolve(request.result);
      };
    }
  );
}


// ============================================================
// SAVE MEDIA
// ============================================================

async function saveMedia(
  user,
  type,
  value
) {
  const key =
    mediaStorageKey(
      user,
      type
    );

  if (!key) {
    return;
  }

  const db =
    await openMediaDB();

  try {
    await new Promise(
      (resolve, reject) => {
        const transaction =
          db.transaction(
            MEDIA_STORE_NAME,
            "readwrite"
          );

        transaction
          .objectStore(
            MEDIA_STORE_NAME
          )
          .put(
            value,
            key
          );

        transaction.oncomplete =
          () => resolve();

        transaction.onerror =
          () =>
            reject(
              transaction.error ||
                new Error(
                  "Could not save profile media."
                )
            );
      }
    );
  } finally {
    db.close();
  }
}


// ============================================================
// LOAD MEDIA
// ============================================================

async function loadMedia(
  user,
  type
) {
  const key =
    mediaStorageKey(
      user,
      type
    );

  if (!key) {
    return "";
  }

  const db =
    await openMediaDB();

  try {
    return await new Promise(
      (resolve, reject) => {
        const transaction =
          db.transaction(
            MEDIA_STORE_NAME,
            "readonly"
          );

        const request =
          transaction
            .objectStore(
              MEDIA_STORE_NAME
            )
            .get(key);

        request.onsuccess =
          () =>
            resolve(
              request.result ||
                ""
            );

        request.onerror =
          () =>
            reject(
              request.error ||
                new Error(
                  "Could not load profile media."
                )
            );
      }
    );
  } finally {
    db.close();
  }
}


// ============================================================
// DELETE ACCOUNT MEDIA
// ============================================================

async function deleteAccountMedia(
  user
) {
  const keys = [
    mediaStorageKey(
      user,
      "avatar"
    ),

    mediaStorageKey(
      user,
      "cover"
    ),
  ].filter(Boolean);

  if (!keys.length) {
    return;
  }

  const db =
    await openMediaDB();

  try {
    await new Promise(
      (resolve, reject) => {
        const transaction =
          db.transaction(
            MEDIA_STORE_NAME,
            "readwrite"
          );

        const store =
          transaction.objectStore(
            MEDIA_STORE_NAME
          );

        keys.forEach(
          (key) =>
            store.delete(key)
        );

        transaction.oncomplete =
          () => resolve();

        transaction.onerror =
          () =>
            reject(
              transaction.error ||
                new Error(
                  "Could not remove profile media."
                )
            );
      }
    );
  } finally {
    db.close();
  }
}


// ============================================================
// IMAGE COMPRESSION
// ============================================================

function compressImage(
  file,
  {
    maxWidth,
    maxHeight,
    quality = 0.82,
  }
) {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onerror = () =>
        reject(
          new Error(
            "Could not read the selected image."
          )
        );

      reader.onload = () => {
        const image =
          new Image();

        image.onerror = () =>
          reject(
            new Error(
              "Could not process the selected image."
            )
          );

        image.onload = () => {
          let width =
            image.width;

          let height =
            image.height;

          const scale =
            Math.min(
              1,
              maxWidth / width,
              maxHeight / height
            );

          width =
            Math.max(
              1,
              Math.round(
                width * scale
              )
            );

          height =
            Math.max(
              1,
              Math.round(
                height * scale
              )
            );

          const canvas =
            document.createElement(
              "canvas"
            );

          canvas.width =
            width;

          canvas.height =
            height;

          const context =
            canvas.getContext(
              "2d"
            );

          context.drawImage(
            image,
            0,
            0,
            width,
            height
          );

          resolve(
            canvas.toDataURL(
              "image/jpeg",
              quality
            )
          );
        };

        image.src =
          reader.result;
      };

      reader.readAsDataURL(
        file
      );
    }
  );
}


// ============================================================
// ROLE ICON
// ============================================================

function roleIcon(role) {
  const cleanRole =
    String(
      role || "User"
    );

  if (
    cleanRole === "Team"
  ) {
    return (
      <Users size={18} />
    );
  }

  if (
    cleanRole ===
    "Supporter"
  ) {
    return (
      <HeartHandshake
        size={18}
      />
    );
  }

  if (
    cleanRole ===
      "Manager" ||
    cleanRole ===
      "Admin"
  ) {
    return (
      <ShieldCheck
        size={18}
      />
    );
  }

  return (
    <User size={18} />
  );
}


// ============================================================
// ACCOUNT
// ============================================================

export default function Account() {
  const {
    user,
    login,
    logout,
    isAdmin,
  } = useAuth();

  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const {
    addSiteUpdate,
  } = useNotifications();


  // ==========================================================
  // LOGIN
  // ==========================================================

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    isSigningIn,
    setIsSigningIn,
  ] = useState(false);


  // ==========================================================
  // PAGE VIEW
  // ==========================================================

  const [
    view,
    setView,
  ] = useState("auth");


  // ==========================================================
  // MESSAGES
  // ==========================================================

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  // ==========================================================
  // PROFILE
  // ==========================================================

  const [
    profile,
    setProfile,
  ] = useState(
    emptyProfile
  );


  // ==========================================================
  // CHANGE PASSWORD
  // ==========================================================

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmNewPassword,
    setConfirmNewPassword,
  ] = useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmNewPassword,
    setShowConfirmNewPassword,
  ] = useState(false);

  const [
    isChangingPassword,
    setIsChangingPassword,
  ] = useState(false);

  const [
    passwordChangeSuccess,
    setPasswordChangeSuccess,
  ] = useState("");

  const [
    passwordChangeError,
    setPasswordChangeError,
  ] = useState("");


  // ==========================================================
  // DELETE ACCOUNT
  // ==========================================================

  const [
    showDeleteModal,
    setShowDeleteModal,
  ] = useState(false);

  const [
    deletePassword,
    setDeletePassword,
  ] = useState("");

  const [
    deleteConfirmation,
    setDeleteConfirmation,
  ] = useState("");

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);


  // ==========================================================
  // IMAGE INPUTS
  // ==========================================================

  const fileInputRef =
    useRef(null);

  const coverInputRef =
    useRef(null);


  // ==========================================================
  // CLEAR GENERAL MESSAGES
  // ==========================================================

  const clearMessages =
    () => {
      setError("");
      setSuccess("");
    };


  // ==========================================================
  // LOAD USER PROFILE
  // ==========================================================

  useEffect(() => {
    let cancelled =
      false;

    const prepareAccount =
      async () => {
        if (!user) {
          setView("auth");

          setProfile(
            emptyProfile()
          );

          return;
        }

        setView(
          (current) =>
            current === "auth"
              ? "profile"
              : current
        );

        const saved =
          loadProfileForUser(
            user
          );

        const rawRole =
          isAdmin
            ? "Admin"
            : String(
                user.role ||
                  user.accountType ||
                  "User"
              );

        const role =
          rawRole
            .charAt(0)
            .toUpperCase() +
          rawRole
            .slice(1)
            .toLowerCase();

        let avatar = "";
        let coverImage = "";

        try {
          [
            avatar,
            coverImage,
          ] =
            await Promise.all([
              loadMedia(
                user,
                "avatar"
              ),

              loadMedia(
                user,
                "cover"
              ),
            ]);
        } catch (mediaError) {
          console.warn(
            "Could not restore account pictures:",
            mediaError
          );
        }

        if (cancelled) {
          return;
        }

        const next = {
          ...saved,

          name:
            saved.name ||
            user.name ||
            user.fullName ||
            user.teamName ||
            user.managerFullName ||
            "J-Town Member",

          email:
            user.email ||
            saved.email ||
            "",

          phone:
            saved.phone ||
            user.phone ||
            "",

          location:
            saved.location ||
            user.address ||
            "",

          role,

          avatar,

          coverImage,
        };

        saveSmallProfile(
          user,
          next
        );

        setProfile(next);

        window.dispatchEvent(
          new CustomEvent(
            "jtown-profile-updated",
            {
              detail: {
                email:
                  accountKey(
                    user
                  ),

                profile:
                  next,
              },
            }
          )
        );
      };

    prepareAccount();

    return () => {
      cancelled = true;
    };
  }, [
    user,
    isAdmin,
  ]);


  // ==========================================================
  // URL MESSAGES
  // ==========================================================

  useEffect(() => {
    if (
      searchParams.get(
        "registered"
      ) === "1"
    ) {
      setSuccess(
        "Registration successful. Sign in with the email and password you just created."
      );

      const registeredEmail =
        searchParams.get(
          "email"
        );

      if (
        registeredEmail
      ) {
        setEmail(
          registeredEmail
        );
      }
    }

    if (
      searchParams.get(
        "passwordReset"
      ) === "1"
    ) {
      setSuccess(
        "Your password was reset successfully. Sign in using your new password."
      );
    }

    if (
      searchParams.get(
        "deleted"
      ) === "1"
    ) {
      setSuccess(
        "Your J-Town Hoops account was permanently deleted."
      );
    }
  }, [
    searchParams,
  ]);


  // ==========================================================
  // SIGN IN
  // ==========================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      clearMessages();

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      if (!cleanEmail) {
        setError(
          "Please enter your email address."
        );

        return;
      }

      if (!password) {
        setError(
          "Please enter your password."
        );

        return;
      }

      setIsSigningIn(true);

      try {
        const signedInUser =
          await login({
            email:
              cleanEmail,

            password,
          });

        setPassword("");

        setSuccess(
          "Welcome back to J-Town Hoops."
        );

        try {
          addSiteUpdate?.({
            title:
              "Signed In",

            desc:
              `${
                signedInUser?.name ||
                "J-Town member"
              } signed in to J-Town Hoops.`,

            category:
              "account",

            origin:
              "account",

            type:
              "account",

            link:
              "/account",

            showInNews:
              false,

            showInNotifications:
              true,

            ownerEmail:
              signedInUser?.email ||
              cleanEmail,
          });
        } catch (
          notificationError
        ) {
          console.warn(
            "Sign-in notification failed:",
            notificationError
          );
        }
      } catch (loginError) {
        // IMPORTANT:
        // Do not throw the error again.
        // This keeps the page visible when
        // password/email is incorrect.

        setPassword("");

        setError(
          loginError?.message ||
            "Unable to sign in. Please check your credentials."
        );
      } finally {
        setIsSigningIn(
          false
        );
      }
    };


  // ==========================================================
  // SIGN OUT
  // ==========================================================

  const handleSignOut =
    async () => {
      const accepted =
        window.confirm(
          "Are you sure you want to sign out of J-Town Hoops?"
        );

      if (!accepted) {
        return;
      }

      try {
        // Backend sign-out is helpful,
        // but local logout must still work
        // if the network is unavailable.

        await authAPI.signOut();
      } catch (
        signOutError
      ) {
        console.warn(
          "Backend sign-out request failed:",
          signOutError
        );
      }

      logout();

      setProfile(
        emptyProfile()
      );

      setEmail("");
      setPassword("");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      clearMessages();

      navigate(
        "/account",
        {
          replace: true,
        }
      );
    };


  // ==========================================================
  // PROFILE PICTURE
  // ==========================================================

  const handleAvatar =
    async (event) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      clearMessages();

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setError(
          "Please choose an image file."
        );

        event.target.value =
          "";

        return;
      }

      try {
        const avatar =
          await compressImage(
            file,
            {
              maxWidth: 512,
              maxHeight: 512,
              quality: 0.82,
            }
          );

        await saveMedia(
          user,
          "avatar",
          avatar
        );

        const next = {
          ...profile,
          avatar,
        };

        setProfile(next);

        window.dispatchEvent(
          new CustomEvent(
            "jtown-profile-updated",
            {
              detail: {
                email:
                  accountKey(
                    user
                  ),

                profile:
                  next,
              },
            }
          )
        );

        setSuccess(
          "Profile picture updated."
        );
      } catch (
        avatarError
      ) {
        setError(
          avatarError?.message ||
            "Could not update profile picture."
        );
      } finally {
        event.target.value =
          "";
      }
    };


  // ==========================================================
  // COVER PICTURE
  // ==========================================================

  const handleCoverImage =
    async (event) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      clearMessages();

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        setError(
          "Please choose an image file."
        );

        event.target.value =
          "";

        return;
      }

      try {
        const coverImage =
          await compressImage(
            file,
            {
              maxWidth: 1600,
              maxHeight: 700,
              quality: 0.78,
            }
          );

        await saveMedia(
          user,
          "cover",
          coverImage
        );

        const next = {
          ...profile,
          coverImage,
        };

        setProfile(next);

        window.dispatchEvent(
          new CustomEvent(
            "jtown-profile-updated",
            {
              detail: {
                email:
                  accountKey(
                    user
                  ),

                profile:
                  next,
              },
            }
          )
        );

        setSuccess(
          "Cover photo updated successfully."
        );
      } catch (
        coverError
      ) {
        setError(
          coverError?.message ||
            "Could not update cover photo."
        );
      } finally {
        event.target.value =
          "";
      }
    };


  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const saveProfile =
    (event) => {
      event.preventDefault();

      clearMessages();

      if (
        !profile.name.trim()
      ) {
        setError(
          "Please enter your display name."
        );

        return;
      }

      if (
        !profile.email.trim()
      ) {
        setError(
          "Please enter your email."
        );

        return;
      }

      const next = {
        ...profile,

        role:
          isAdmin
            ? "Admin"
            : profile.role,
      };

      try {
        saveSmallProfile(
          user,
          next
        );
      } catch {
        setError(
          "Your account text settings could not be saved in this browser."
        );

        return;
      }

      setProfile(next);

      window.dispatchEvent(
        new CustomEvent(
          "jtown-profile-updated",
          {
            detail: {
              email:
                accountKey(
                  user
                ),

              profile:
                next,
            },
          }
        )
      );

      setSuccess(
        "Account settings saved successfully."
      );

      try {
        addSiteUpdate?.({
          title:
            "Profile Updated",

          desc:
            `${next.name} updated their J-Town Hoops profile.`,

          category:
            "account",

          origin:
            "account",

          type:
            "account",

          link:
            "/account",

          showInNews:
            false,

          showInNotifications:
            true,

          ownerEmail:
            user?.email,
        });
      } catch (
        notificationError
      ) {
        console.warn(
          "Profile notification failed:",
          notificationError
        );
      }
    };


  // ==========================================================
  // CHANGE PASSWORD
  // ==========================================================

  const handleChangePassword =
    async (event) => {
      event.preventDefault();

      setPasswordChangeError(
        ""
      );

      setPasswordChangeSuccess(
        ""
      );

      if (
        !currentPassword
      ) {
        setPasswordChangeError(
          "Enter your current password."
        );

        return;
      }

      if (!newPassword) {
        setPasswordChangeError(
          "Enter your new password."
        );

        return;
      }

      if (
        newPassword.length <
        6
      ) {
        setPasswordChangeError(
          "Your new password must be at least 6 characters."
        );

        return;
      }

      if (
        newPassword ===
        currentPassword
      ) {
        setPasswordChangeError(
          "Your new password must be different from your current password."
        );

        return;
      }

      if (
        !confirmNewPassword
      ) {
        setPasswordChangeError(
          "Confirm your new password."
        );

        return;
      }

      if (
        newPassword !==
        confirmNewPassword
      ) {
        setPasswordChangeError(
          "The new passwords do not match."
        );

        return;
      }

      setIsChangingPassword(
        true
      );

      try {
        const response =
          await authAPI.changePassword({
            currentPassword,
            newPassword,

            confirmPassword:
              confirmNewPassword,
          });

        // Backend returns a fresh JWT
        // after a password change.
        if (
          response?.token
        ) {
          try {
            localStorage.setItem(
              TOKEN_KEY,
              response.token
            );
          } catch (
            tokenError
          ) {
            console.warn(
              "Could not save refreshed authentication token:",
              tokenError
            );
          }
        }

        setCurrentPassword(
          ""
        );

        setNewPassword("");

        setConfirmNewPassword(
          ""
        );

        setShowCurrentPassword(
          false
        );

        setShowNewPassword(
          false
        );

        setShowConfirmNewPassword(
          false
        );

        setPasswordChangeSuccess(
          response?.message ||
            "Your J-Town Hoops password has been changed successfully."
        );

        try {
          addSiteUpdate?.({
            title:
              "Password Changed",

            desc:
              "Your J-Town Hoops account password was changed.",

            category:
              "account",

            origin:
              "account",

            type:
              "security",

            link:
              "/account",

            showInNews:
              false,

            showInNotifications:
              true,

            ownerEmail:
              user?.email,
          });
        } catch (
          notificationError
        ) {
          console.warn(
            "Password notification failed:",
            notificationError
          );
        }
      } catch (
        changeError
      ) {
        setPasswordChangeError(
          changeError?.message ||
            "Your password could not be changed."
        );
      } finally {
        setIsChangingPassword(
          false
        );
      }
    };


  // ==========================================================
  // OPEN DELETE ACCOUNT
  // ==========================================================

  const openDeleteAccount =
    () => {
      clearMessages();

      setDeletePassword(
        ""
      );

      setDeleteConfirmation(
        ""
      );

      setDeleteError("");

      setShowDeleteModal(
        true
      );
    };


  // ==========================================================
  // CLOSE DELETE ACCOUNT
  // ==========================================================

  const closeDeleteAccount =
    () => {
      if (isDeleting) {
        return;
      }

      setShowDeleteModal(
        false
      );

      setDeletePassword(
        ""
      );

      setDeleteConfirmation(
        ""
      );

      setDeleteError("");
    };


  // ==========================================================
  // DELETE ACCOUNT
  // ==========================================================

  const handleDeleteAccount =
    async (event) => {
      event.preventDefault();

      setDeleteError("");

      if (!deletePassword) {
        setDeleteError(
          "Enter your current password."
        );

        return;
      }

      if (
        deleteConfirmation
          .trim()
          .toUpperCase() !==
        "DELETE"
      ) {
        setDeleteError(
          'Type DELETE exactly to confirm.'
        );

        return;
      }

      const finalConfirmation =
        window.confirm(
          "FINAL WARNING:\n\nDeleting this account is permanent.\n\nYou will lose access to account-linked information and saved features.\n\nDo you still want to permanently delete this account?"
        );

      if (
        !finalConfirmation
      ) {
        return;
      }

      setIsDeleting(true);

      try {
        await authAPI.deleteAccount({
          password:
            deletePassword,

          confirmation:
            "DELETE",
        });

        const key =
          profileStorageKey(
            user
          );

        if (key) {
          try {
            localStorage.removeItem(
              key
            );
          } catch {
            // Ignore browser cleanup failure.
          }
        }

        try {
          await deleteAccountMedia(
            user
          );
        } catch (
          mediaError
        ) {
          console.warn(
            "Could not remove local profile pictures:",
            mediaError
          );
        }

        logout();

        setShowDeleteModal(
          false
        );

        setProfile(
          emptyProfile()
        );

        setEmail("");
        setPassword("");

        navigate(
          "/account?deleted=1",
          {
            replace: true,
          }
        );
      } catch (
        deleteAccountError
      ) {
        setDeleteError(
          deleteAccountError?.message ||
            "Your account could not be deleted. Nothing was removed."
        );
      } finally {
        setIsDeleting(
          false
        );
      }
    };


  // ==========================================================
  // NOT SIGNED IN
  // ==========================================================

  if (!user) {
    return (
      <Shell>
        <div className="w-full max-w-lg">

          <div className="mb-7 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-black shadow-xl shadow-orange-500/20">
              <LogIn
                size={36}
              />
            </div>

            <h1 className="mt-5 text-4xl font-black">
              Welcome Back
            </h1>

            <p className="mt-2 text-neutral-500">
              Sign in to your
              J-Town Hoops account.
            </p>

          </div>


          <form
            onSubmit={
              handleSubmit
            }
            autoComplete="off"
            className="rounded-3xl border border-neutral-800 bg-black p-6 shadow-2xl md:p-8"
          >

            {success && (
              <Message type="success">
                {success}
              </Message>
            )}

            {error && (
              <Message type="error">
                {error}
              </Message>
            )}


            <Input
              icon={
                <Mail />
              }
              type="email"
              placeholder="Email address"
              value={email}
              setValue={
                setEmail
              }
            />


            <PasswordInput
              value={
                password
              }
              setValue={
                setPassword
              }
              show={
                showPassword
              }
              setShow={
                setShowPassword
              }
              placeholder="Password"
              autoComplete="current-password"
            />


            <button
              type="button"
              onClick={() => {
                navigate(
                  "/forgot-password"
                );
              }}
              className="ml-auto mt-4 block text-sm font-bold text-orange-400 transition hover:text-orange-300"
            >
              Forgot password?
            </button>


            <button
              type="submit"
              disabled={
                isSigningIn
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningIn ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Signing In...
                </>
              ) : (
                <>
                  <LogIn
                    size={18}
                  />

                  Sign In
                </>
              )}
            </button>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/register"
                )
              }
              className="mt-5 w-full rounded-xl border border-neutral-800 bg-neutral-950 py-3.5 text-sm font-bold text-neutral-300 transition hover:border-orange-500/40 hover:text-orange-400"
            >
              New here? Create a
              J-Town Hoops account
            </button>

          </form>

        </div>
      </Shell>
    );
  }


  // ==========================================================
  // DISPLAY ROLE
  // ==========================================================

  const displayRole =
    isAdmin
      ? "Admin"
      : profile.role ||
        user.role ||
        "User";


  // ==========================================================
  // SIGNED-IN ACCOUNT
  // ==========================================================

  return (
    <Shell>

      <div className="w-full max-w-5xl">

        <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-black/80 shadow-2xl backdrop-blur-md">

          {/* EXIT */}

          <Link
            to="/"
            title="Back to Home"
            className="absolute left-3 top-3 z-40 flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/65 px-2.5 py-1.5 text-[11px] font-bold text-neutral-200 backdrop-blur-md transition hover:border-orange-500 hover:bg-orange-500 hover:text-black"
          >
            <Home
              size={13}
            />

            <span>
              Exit
            </span>

            <X size={11} />
          </Link>


          {/* ================================================= */}
          {/* COVER */}
          {/* ================================================= */}

          <div
            className="relative min-h-[300px] overflow-hidden border-b border-neutral-800"
            style={
              profile.coverImage
                ? {
                    backgroundImage:
                      `url(${profile.coverImage})`,

                    backgroundSize:
                      "cover",

                    backgroundPosition:
                      "center",
                  }
                : {
                    background:
                      "linear-gradient(135deg, #171717 0%, #262626 45%, #7c2d12 100%)",
                  }
            }
          >

            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/90" />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-orange-950/20 via-transparent to-black/20" />


            <button
              type="button"
              onClick={() =>
                coverInputRef
                  .current
                  ?.click()
              }
              className="absolute right-4 top-14 z-20 flex items-center gap-2 rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-md transition hover:border-orange-500 hover:bg-orange-500 hover:text-black"
            >
              <Camera
                size={15}
              />

              <span className="hidden sm:inline">
                Change Cover
              </span>
            </button>


            <input
              ref={
                coverInputRef
              }
              type="file"
              accept="image/*"
              onChange={
                handleCoverImage
              }
              className="hidden"
            />


            <div className="relative z-10 flex min-h-[300px] flex-col justify-end p-6 md:p-8">

              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">

                  {/* AVATAR */}

                  <div className="relative">

                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-orange-500 bg-neutral-900 shadow-2xl shadow-black/60">

                      {profile.avatar ? (
                        <img
                          src={
                            profile.avatar
                          }
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
                      onClick={() =>
                        fileInputRef
                          .current
                          ?.click()
                      }
                      title="Change profile picture"
                      className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-orange-500 text-black shadow-lg transition hover:scale-110 hover:bg-orange-400"
                    >
                      <Camera
                        size={17}
                      />
                    </button>


                    <input
                      ref={
                        fileInputRef
                      }
                      type="file"
                      accept="image/*"
                      onChange={
                        handleAvatar
                      }
                      className="hidden"
                    />

                  </div>


                  {/* USER INFORMATION */}

                  <div className="text-center sm:text-left">

                    <p className="text-[10px] font-black uppercase tracking-[.25em] text-orange-400">
                      J-Town Hoops
                      Account
                    </p>

                    <h1 className="mt-1 text-3xl font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.9)] md:text-4xl">
                      {profile.name ||
                        user.name ||
                        "J-Town Member"}
                    </h1>

                    <p className="mt-1 text-sm text-neutral-200 drop-shadow-[0_2px_4px_rgba(0,0,0,.9)]">
                      {profile.email ||
                        user.email}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-orange-500/50 bg-black/60 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-orange-400 backdrop-blur-md">

                      {roleIcon(
                        displayRole
                      )}

                      {displayRole}

                    </div>

                  </div>

                </div>


                {/* SIGN OUT */}

                <button
                  type="button"
                  onClick={
                    handleSignOut
                  }
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-red-400/40 bg-black/60 px-5 py-3 font-black text-red-300 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-red-500 hover:bg-red-500 hover:text-white md:mt-8"
                >
                  <LogOut
                    size={18}
                  />

                  Sign Out
                </button>

              </div>

            </div>

          </div>


          {/* ================================================= */}
          {/* TABS */}
          {/* ================================================= */}

          <div className="grid grid-cols-3 border-b border-neutral-800">

            <Tab
              active={
                view ===
                "profile"
              }
              onClick={() => {
                clearMessages();
                setView(
                  "profile"
                );
              }}
              icon={
                <User
                  size={18}
                />
              }
              label="Profile"
            />

            <Tab
              active={
                view ===
                "settings"
              }
              onClick={() => {
                clearMessages();
                setView(
                  "settings"
                );
              }}
              icon={
                <Settings
                  size={18}
                />
              }
              label="Settings"
            />

            <Tab
              active={
                view ===
                "security"
              }
              onClick={() => {
                clearMessages();

                setPasswordChangeError(
                  ""
                );

                setPasswordChangeSuccess(
                  ""
                );

                setView(
                  "security"
                );
              }}
              icon={
                <Lock
                  size={18}
                />
              }
              label="Security"
            />

          </div>


          {/* ================================================= */}
          {/* CONTENT */}
          {/* ================================================= */}

          <div className="p-6 md:p-8">

            {error && (
              <Message type="error">
                {error}
              </Message>
            )}

            {success && (
              <Message type="success">
                {success}
              </Message>
            )}


            {/* =============================================== */}
            {/* PROFILE */}
            {/* =============================================== */}

            {view ===
              "profile" && (
              <>

                <div className="grid gap-4 md:grid-cols-3">

                  <Info
                    icon={
                      <Mail />
                    }
                    label="Email"
                    value={
                      profile.email ||
                      user.email
                    }
                  />

                  <Info
                    icon={
                      <Phone />
                    }
                    label="Phone"
                    value={
                      profile.phone ||
                      "Not added"
                    }
                  />

                  <Info
                    icon={
                      <MapPin />
                    }
                    label="Location"
                    value={
                      profile.location ||
                      "Not added"
                    }
                  />

                </div>


                <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">

                  <h2 className="font-black">
                    About
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    {profile.bio ||
                      "Add a short bio from Account Settings."}
                  </p>

                </div>

              </>
            )}


            {/* =============================================== */}
            {/* SETTINGS */}
            {/* =============================================== */}

            {view ===
              "settings" && (
              <form
                onSubmit={
                  saveProfile
                }
              >

                <div className="grid gap-5 md:grid-cols-2">

                  <Setting
                    label="Display name"
                    value={
                      profile.name
                    }
                    onChange={(
                      value
                    ) =>
                      setProfile({
                        ...profile,
                        name:
                          value,
                      })
                    }
                    icon={
                      <User />
                    }
                  />


                  <Setting
                    label="Email"
                    type="email"
                    value={
                      profile.email
                    }
                    onChange={(
                      value
                    ) =>
                      setProfile({
                        ...profile,
                        email:
                          value,
                      })
                    }
                    icon={
                      <Mail />
                    }
                  />


                  <Setting
                    label="Phone"
                    type="tel"
                    value={
                      profile.phone
                    }
                    onChange={(
                      value
                    ) =>
                      setProfile({
                        ...profile,
                        phone:
                          value,
                      })
                    }
                    icon={
                      <Phone />
                    }
                  />


                  <Setting
                    label="Location"
                    value={
                      profile.location
                    }
                    onChange={(
                      value
                    ) =>
                      setProfile({
                        ...profile,
                        location:
                          value,
                      })
                    }
                    icon={
                      <MapPin />
                    }
                  />


                  <Setting
                    label="Birthday"
                    type="date"
                    value={
                      profile.birthday
                    }
                    onChange={(
                      value
                    ) =>
                      setProfile({
                        ...profile,
                        birthday:
                          value,
                      })
                    }
                    icon={
                      <CalendarDays />
                    }
                  />


                  <div>

                    <span className="text-sm font-bold text-neutral-300">
                      Account role
                    </span>

                    <div className="mt-2 flex min-h-[52px] items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 font-black text-orange-400">

                      {roleIcon(
                        displayRole
                      )}

                      {displayRole}

                    </div>

                    <p className="mt-2 text-[11px] text-neutral-600">
                      Role is controlled
                      by your registered
                      J-Town Hoops
                      account.
                    </p>

                  </div>


                  <label className="md:col-span-2">

                    <span className="text-sm font-bold text-neutral-300">
                      Bio
                    </span>

                    <textarea
                      rows={4}
                      value={
                        profile.bio
                      }
                      onChange={(
                        event
                      ) =>
                        setProfile({
                          ...profile,

                          bio:
                            event
                              .target
                              .value,
                        })
                      }
                      className="mt-2 w-full resize-none rounded-xl border border-neutral-800 bg-black px-4 py-3 text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                      placeholder="Tell the J-Town community a little about yourself..."
                    />

                  </label>

                </div>


                <button
                  type="submit"
                  className="mt-6 flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-black text-black transition hover:bg-orange-400"
                >
                  <Save
                    size={18}
                  />

                  Save Account
                  Settings
                </button>

              </form>
            )}


            {/* =============================================== */}
            {/* SECURITY */}
            {/* =============================================== */}

            {view ===
              "security" && (
              <>

                {/* CHANGE PASSWORD */}

                <div className="rounded-2xl border border-orange-500/20 bg-neutral-950 p-5 md:p-6">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                      <KeyRound
                        size={23}
                      />
                    </div>

                    <div>
                      <h2 className="text-xl font-black">
                        Change Password
                      </h2>

                      <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                        Change your
                        J-Town Hoops
                        password securely.
                        You must enter your
                        current password
                        first.
                      </p>
                    </div>

                  </div>


                  {passwordChangeError && (
                    <Message type="error">
                      {
                        passwordChangeError
                      }
                    </Message>
                  )}


                  {passwordChangeSuccess && (
                    <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">

                      <div className="flex items-start gap-3">

                        <CheckCircle2
                          size={20}
                          className="mt-0.5 shrink-0"
                        />

                        <div>
                          <p className="font-black">
                            Password
                            changed
                          </p>

                          <p className="mt-1 text-sm">
                            {
                              passwordChangeSuccess
                            }
                          </p>

                          <p className="mt-2 text-xs text-emerald-200/70">
                            A security
                            email will also
                            be sent when
                            email delivery
                            succeeds.
                          </p>
                        </div>

                      </div>

                    </div>
                  )}


                  <form
                    onSubmit={
                      handleChangePassword
                    }
                    className="mt-6"
                  >

                    <div className="grid gap-5">

                      <SecurityPasswordInput
                        label="Current Password"
                        value={
                          currentPassword
                        }
                        setValue={
                          setCurrentPassword
                        }
                        show={
                          showCurrentPassword
                        }
                        setShow={
                          setShowCurrentPassword
                        }
                        autoComplete="current-password"
                        placeholder="Enter your current password"
                      />


                      <SecurityPasswordInput
                        label="New Password"
                        value={
                          newPassword
                        }
                        setValue={
                          setNewPassword
                        }
                        show={
                          showNewPassword
                        }
                        setShow={
                          setShowNewPassword
                        }
                        autoComplete="new-password"
                        placeholder="Enter your new password"
                      />


                      <SecurityPasswordInput
                        label="Confirm New Password"
                        value={
                          confirmNewPassword
                        }
                        setValue={
                          setConfirmNewPassword
                        }
                        show={
                          showConfirmNewPassword
                        }
                        setShow={
                          setShowConfirmNewPassword
                        }
                        autoComplete="new-password"
                        placeholder="Enter the new password again"
                      />

                    </div>


                    <p className="mt-3 text-xs text-neutral-600">
                      Your new password
                      must contain at
                      least 6 characters
                      and must be
                      different from your
                      current password.
                    </p>


                    <button
                      type="submit"
                      disabled={
                        isChangingPassword
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-4 font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
                    >
                      {isChangingPassword ? (
                        <>
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />

                          Changing
                          Password...
                        </>
                      ) : (
                        <>
                          <ShieldCheck
                            size={18}
                          />

                          Change Password
                        </>
                      )}
                    </button>

                  </form>

                </div>


                {/* SECURITY INFORMATION */}

                <div className="mt-6 grid gap-5 md:grid-cols-3">

                  <Security
                    icon={
                      <Mail />
                    }
                    title="Recovery Email"
                    text={
                      profile.email ||
                      user.email ||
                      "No recovery email available."
                    }
                  />

                  <Security
                    icon={
                      <Phone />
                    }
                    title="Recovery Phone"
                    text={
                      profile.phone ||
                      "Add your phone number in Settings."
                    }
                  />

                  <Security
                    icon={
                      <Bell />
                    }
                    title="Security Notifications"
                    text="Important account and security activity can appear in your J-Town Hoops notifications."
                  />

                </div>


                {/* FORGOT PASSWORD */}

                <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 md:p-6">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <h3 className="font-black">
                        Forgot your
                        password?
                      </h3>

                      <p className="mt-1 text-sm text-neutral-500">
                        You can request a
                        secure password
                        reset link through
                        your registered
                        email address.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/forgot-password"
                        )
                      }
                      className="shrink-0 rounded-xl border border-orange-500/40 bg-orange-500/10 px-5 py-3 font-black text-orange-400 transition hover:bg-orange-500 hover:text-black"
                    >
                      Reset Password
                    </button>

                  </div>

                </div>


                {/* DANGER ZONE */}

                <div className="mt-7 rounded-2xl border border-red-500/30 bg-red-500/5 p-5 md:p-6">

                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                    <div>

                      <div className="flex items-center gap-2 text-red-300">

                        <AlertTriangle
                          size={20}
                        />

                        <h3 className="font-black">
                          Danger Zone
                        </h3>

                      </div>

                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
                        Permanently
                        delete this
                        J-Town Hoops
                        account. You will
                        lose access to
                        account-linked
                        information and
                        saved features.
                        This action
                        cannot be undone.
                      </p>

                    </div>


                    <button
                      type="button"
                      onClick={
                        openDeleteAccount
                      }
                      className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/50 bg-red-500/10 px-5 py-3 font-black text-red-300 transition hover:bg-red-500 hover:text-white"
                    >
                      <Trash2
                        size={18}
                      />

                      Delete Account
                    </button>

                  </div>

                </div>

              </>
            )}

          </div>

        </section>


        {/* ================================================= */}
        {/* DELETE ACCOUNT MODAL */}
        {/* ================================================= */}

        {showDeleteModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">

            <div className="w-full max-w-lg rounded-3xl border border-red-500/40 bg-neutral-950 p-6 shadow-2xl md:p-8">

              <div className="flex items-start justify-between gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                  <AlertTriangle
                    size={28}
                  />
                </div>

                <button
                  type="button"
                  onClick={
                    closeDeleteAccount
                  }
                  disabled={
                    isDeleting
                  }
                  className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-900 hover:text-white"
                >
                  <X
                    size={20}
                  />
                </button>

              </div>


              <h2 className="mt-5 text-2xl font-black text-white">
                Permanently delete
                this account?
              </h2>


              <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                This removes your
                J-Town Hoops account
                from the database.
                You will lose access
                to account-linked
                information and saved
                features.
              </p>


              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                <p className="text-sm font-bold text-red-300">
                  ⚠ This cannot be
                  undone.
                </p>

                <p className="mt-2 text-xs leading-5 text-neutral-400">
                  If you continue,
                  your account will be
                  permanently removed
                  from MongoDB after
                  your password and
                  DELETE confirmation
                  are verified.
                </p>

              </div>


              {deleteError && (
                <Message type="error">
                  {deleteError}
                </Message>
              )}


              <form
                onSubmit={
                  handleDeleteAccount
                }
                className="mt-5"
              >

                <label className="block">

                  <span className="text-sm font-bold text-neutral-300">
                    Current password
                  </span>

                  <input
                    type="password"
                    value={
                      deletePassword
                    }
                    onChange={(
                      event
                    ) =>
                      setDeletePassword(
                        event.target
                          .value
                      )
                    }
                    autoComplete="current-password"
                    placeholder="Enter your current password"
                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-black px-4 py-3.5 text-white outline-none placeholder:text-neutral-600 focus:border-red-500"
                  />

                </label>


                <label className="mt-4 block">

                  <span className="text-sm font-bold text-neutral-300">
                    Type DELETE to
                    confirm
                  </span>

                  <input
                    type="text"
                    value={
                      deleteConfirmation
                    }
                    onChange={(
                      event
                    ) =>
                      setDeleteConfirmation(
                        event.target
                          .value
                      )
                    }
                    autoComplete="off"
                    placeholder="DELETE"
                    className="mt-2 w-full rounded-xl border border-neutral-800 bg-black px-4 py-3.5 font-black uppercase text-white outline-none placeholder:text-neutral-600 focus:border-red-500"
                  />

                </label>


                <div className="mt-6 grid gap-3 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={
                      closeDeleteAccount
                    }
                    disabled={
                      isDeleting
                    }
                    className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3.5 font-black text-neutral-300 transition hover:bg-neutral-800"
                  >
                    Keep My Account
                  </button>


                  <button
                    type="submit"
                    disabled={
                      isDeleting ||
                      !deletePassword ||
                      deleteConfirmation
                        .trim()
                        .toUpperCase() !==
                        "DELETE"
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3.5 font-black text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    {isDeleting ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2
                          size={18}
                        />

                        Delete My
                        Account
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      </div>

    </Shell>
  );
}


// ============================================================
// PAGE SHELL
// ============================================================

function Shell({
  children,
}) {
  return (
    <div className="relative min-h-screen bg-[url('/src/images/mybackground4.jpg')] bg-cover bg-center bg-fixed px-4 py-10 text-white sm:px-6">

      <div className="absolute inset-0 bg-black/55" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-orange-950/10 via-transparent to-black/50" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center">
        {children}
      </div>

    </div>
  );
}


// ============================================================
// MESSAGE
// ============================================================

function Message({
  type,
  children,
}) {
  const successMessage =
    type === "success";

  return (
    <div
      className={`mt-5 rounded-xl border p-3 text-sm ${
        successMessage
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-red-500/30 bg-red-500/10 text-red-300"
      }`}
    >
      {children}
    </div>
  );
}


// ============================================================
// NORMAL INPUT
// ============================================================

function Input({
  icon,
  type = "text",
  placeholder,
  value,
  setValue,
}) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-800 bg-black px-4 focus-within:border-orange-500">

      <span className="text-neutral-500">
        {icon}
      </span>

      <input
        required
        type={type}
        placeholder={
          placeholder
        }
        value={value}
        onChange={(
          event
        ) =>
          setValue(
            event.target.value
          )
        }
        autoComplete="off"
        className="w-full bg-black py-4 text-white outline-none placeholder:text-neutral-600"
      />

    </div>
  );
}


// ============================================================
// LOGIN PASSWORD
// ============================================================

function PasswordInput({
  value,
  setValue,
  show,
  setShow,
  placeholder,
  autoComplete,
}) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-800 bg-black px-4 focus-within:border-orange-500">

      <Lock
        size={19}
        className="text-neutral-500"
      />

      <input
        required
        type={
          show
            ? "text"
            : "password"
        }
        placeholder={
          placeholder
        }
        value={value}
        onChange={(
          event
        ) =>
          setValue(
            event.target.value
          )
        }
        autoComplete={
          autoComplete
        }
        className="w-full bg-black py-4 text-white outline-none placeholder:text-neutral-600"
      />

      <button
        type="button"
        onClick={() =>
          setShow(!show)
        }
        className="text-neutral-500 transition hover:text-orange-400"
      >
        {show ? (
          <EyeOff
            size={18}
          />
        ) : (
          <Eye
            size={18}
          />
        )}
      </button>

    </div>
  );
}


// ============================================================
// CHANGE PASSWORD INPUT
// ============================================================

function SecurityPasswordInput({
  label,
  value,
  setValue,
  show,
  setShow,
  placeholder,
  autoComplete,
}) {
  return (
    <label className="block">

      <span className="text-sm font-bold text-neutral-300">
        {label}
      </span>

      <div className="mt-2 flex items-center gap-3 rounded-xl border border-neutral-800 bg-black px-4 focus-within:border-orange-500">

        <Lock
          size={18}
          className="shrink-0 text-neutral-500"
        />

        <input
          required
          type={
            show
              ? "text"
              : "password"
          }
          value={value}
          onChange={(
            event
          ) =>
            setValue(
              event.target.value
            )
          }
          placeholder={
            placeholder
          }
          autoComplete={
            autoComplete
          }
          className="w-full bg-black py-3.5 text-white outline-none placeholder:text-neutral-600"
        />

        <button
          type="button"
          onClick={() =>
            setShow(!show)
          }
          className="shrink-0 text-neutral-500 transition hover:text-orange-400"
        >
          {show ? (
            <EyeOff
              size={18}
            />
          ) : (
            <Eye
              size={18}
            />
          )}
        </button>

      </div>

    </label>
  );
}


// ============================================================
// TAB
// ============================================================

function Tab({
  active,
  onClick,
  icon,
  label,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 py-4 text-xs font-black transition sm:text-sm ${
        active
          ? "bg-orange-500/10 text-orange-400"
          : "text-neutral-500 hover:text-white"
      }`}
    >
      {icon}

      <span>
        {label}
      </span>
    </button>
  );
}


// ============================================================
// PROFILE INFO
// ============================================================

function Info({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">

      <div className="text-orange-400">
        {icon}
      </div>

      <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-neutral-600">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-bold">
        {value}
      </p>

    </div>
  );
}


// ============================================================
// SETTINGS INPUT
// ============================================================

function Setting({
  label,
  type = "text",
  value,
  onChange,
  icon,
}) {
  return (
    <label>

      <span className="text-sm font-bold text-neutral-300">
        {label}
      </span>

      <div className="mt-2 flex items-center gap-3 rounded-xl border border-neutral-800 bg-black px-4 focus-within:border-orange-500">

        <span className="text-neutral-500">
          {icon}
        </span>

        <input
          type={type}
          value={
            value || ""
          }
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
          className="w-full bg-black py-3.5 text-white outline-none"
        />

      </div>

    </label>
  );
}


// ============================================================
// SECURITY CARD
// ============================================================

function Security({
  icon,
  title,
  text,
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
        {icon}
      </div>

      <h3 className="mt-4 font-black">
        {title}
      </h3>

      <p className="mt-2 break-words text-sm leading-relaxed text-neutral-500">
        {text}
      </p>

    </div>
  );
}