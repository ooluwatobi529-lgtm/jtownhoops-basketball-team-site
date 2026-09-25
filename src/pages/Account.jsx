import { useEffect, useRef, useState } from "react";
import {
  User, Mail, Lock, LogOut, ShieldCheck, UserPlus, LogIn, Camera,
  Phone, Settings, KeyRound, ArrowLeft, Send, Smartphone, CheckCircle2,
  Eye, EyeOff, Save, MapPin, CalendarDays, Bell, Users, HeartHandshake, Home, X
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

const PROFILE_PREFIX = "jtown_hoops_profile_v2::";

const emptyProfile = () => ({
  name: "", email: "", phone: "", location: "", birthday: "",
  bio: "", avatar: "", coverImage: "", role: "User"
});

const accountKey = (user) => String(user?.email || "").trim().toLowerCase();
const profileStorageKey = (user) => {
  const key = accountKey(user);
  return key ? `${PROFILE_PREFIX}${key}` : null;
};

const loadProfileForUser = (user) => {
  const key = profileStorageKey(user);
  if (!key) return emptyProfile();
  try {
    return { ...emptyProfile(), ...JSON.parse(localStorage.getItem(key) || "{}") };
  } catch {
    return emptyProfile();
  }
};
const PUBLIC_ROLES = ["User", "Player", "Team", "Supporter", "Manager"];

const roleIcon = (role) => {
  if (role === "Player") return <User size={18} />;
  if (role === "Team") return <Users size={18} />;
  if (role === "Supporter") return <HeartHandshake size={18} />;
  if (role === "Manager") return <ShieldCheck size={18} />;
  if (role === "Admin") return <ShieldCheck size={18} />;
  return <User size={18} />;
};


function compressImage(file, { maxWidth, maxHeight, quality = 0.82 }) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read the selected image."));

    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("Could not process the selected image."));

      image.onload = () => {
        let width = image.width;
        let height = image.height;
        const scale = Math.min(1, maxWidth / width, maxHeight / height);

        width = Math.max(1, Math.round(width * scale));
        height = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

export default function Account() {
  const { user, login, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addSiteUpdate } = useNotifications();

  const [view, setView] = useState("auth");
  const [isSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState("User");

  const [name, setName] = useState("");
  // Keep the sign-in form empty. The browser should not reuse a previous
  // account's visible credentials on this screen.
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [recoveryMethod, setRecoveryMethod] = useState("email");
  const [recoveryValue, setRecoveryValue] = useState("");
  const [recoveryStep, setRecoveryStep] = useState("choose");
  const [recoveryCode, setRecoveryCode] = useState("");

  const [profile, setProfile] = useState(emptyProfile);

  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setView("auth");
      setProfile(emptyProfile());
      return;
    }

    setView((v) => (v === "auth" ? "profile" : v));

    const saved = loadProfileForUser(user);
    const rawRole = isAdmin ? "Admin" : String(user.role || user.accountType || "User");
    const role = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

    const next = {
      ...saved,
      name: saved.name || user.name || user.fullName || user.teamName || user.managerFullName || "J-Town Member",
      email: user.email || saved.email || "",
      role,
    };

    const key = profileStorageKey(user);
    if (key) localStorage.setItem(key, JSON.stringify(next));

    setProfile(next);
    window.dispatchEvent(new Event("jtown-profile-updated"));
  }, [user, isAdmin]);

  const clearMessages = () => { setError(""); setSuccess(""); };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearMessages();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return setError("Please enter your email address.");
    }

    if (!password) {
      return setError("Please enter your password.");
    }

    try {
      const signedInUser = login({
        email: cleanEmail,
        password,
      });

      const signedInName =
        signedInUser?.name ||
        signedInUser?.fullName ||
        signedInUser?.teamName ||
        signedInUser?.managerFullName ||
        "J-Town member";

      addSiteUpdate?.({
        title: "Signed In",
        desc: `${signedInName} signed in to J-Town Hoops.`,
        category: "account",
        origin: "account",
        type: "account",
        link: "/account",
        showInNews: false,
        showInNotifications: true,
        ownerEmail: signedInUser?.email || cleanEmail,
      });

      setSuccess("Welcome back to J-Town Hoops.");
      setPassword("");
    } catch (err) {
      setError(err?.message || "Unable to sign in. Please check your credentials.");
    }
  };

  const handleSignOut = () => {
    if (!window.confirm("Are you sure you want to sign out of J-Town Hoops?")) return;
    try {
      addSiteUpdate?.({
        title: "Signed Out",
        desc: `${profile.name || user?.name || "User"} signed out of J-Town Hoops.`,
        category: "account", origin: "account", type: "account",
        link: "/account", showInNews: false, showInNotifications: true,
        ownerEmail: user?.email,
      });
    } finally {
      logout();
      setView("auth");
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearMessages();

    if (!file.type.startsWith("image/")) {
      return setError("Please choose an image file.");
    }

    try {
      // Compress profile pictures so localStorage does not overflow.
      const avatar = await compressImage(file, {
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.82,
      });

      const next = { ...profile, avatar };
      setProfile(next);

      // Notify Navbar FIRST so the image changes immediately even if
      // browser storage is nearly full.
      window.dispatchEvent(
        new CustomEvent("jtown-profile-updated", {
          detail: { email: accountKey(user), profile: next },
        })
      );

      const key = profileStorageKey(user);
      if (key) {
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch (storageError) {
          console.error("Could not persist profile picture:", storageError);
          setError(
            "The picture is showing now, but browser storage is full. Delete some old uploaded media before refreshing."
          );
          return;
        }
      }

      setSuccess("Profile picture updated.");
    } catch (err) {
      setError(err?.message || "Could not update profile picture.");
    } finally {
      e.target.value = "";
    }
  };

  const handleCoverImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearMessages();

    if (!file.type.startsWith("image/")) {
      return setError("Please choose an image file.");
    }

    try {
      const coverImage = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 700,
        quality: 0.78,
      });

      const next = { ...profile, coverImage };
      setProfile(next);

      window.dispatchEvent(
        new CustomEvent("jtown-profile-updated", {
          detail: { email: accountKey(user), profile: next },
        })
      );

      const key = profileStorageKey(user);
      if (key) {
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch (storageError) {
          console.error("Could not persist cover photo:", storageError);
          setError(
            "The cover is showing now, but browser storage is full. Delete some old uploaded media before refreshing."
          );
          return;
        }
      }

      setSuccess("Cover photo updated successfully.");
    } catch (err) {
      setError(err?.message || "Could not update cover photo.");
    } finally {
      e.target.value = "";
    }
  };

  const saveProfile = (e) => {
    e.preventDefault();
    clearMessages();
    if (!profile.name.trim()) return setError("Please enter your display name.");
    if (!profile.email.trim()) return setError("Please enter your email.");

    const next = { ...profile, role: isAdmin ? "Admin" : profile.role };
    const key = profileStorageKey(user);
      if (key) localStorage.setItem(key, JSON.stringify(next));
    setProfile(next);
    window.dispatchEvent(
      new CustomEvent("jtown-profile-updated", {
        detail: { email: accountKey(user), profile: next },
      })
    );
    setSuccess("Account settings saved successfully.");
    addSiteUpdate?.({
      title: "Profile Updated", desc: `${next.name} updated their J-Town Hoops profile.`,
      category: "account", origin: "account", type: "account",
      link: "/account", showInNews: false, showInNotifications: true,
      ownerEmail: user?.email,
    });
  };

  const sendRecovery = (e) => {
    e.preventDefault();
    clearMessages();
    if (!recoveryValue.trim()) return setError("Enter your recovery email or phone number.");
    setRecoveryStep("sent");
    setSuccess(
      recoveryMethod === "email"
        ? `A password recovery email will be sent to ${recoveryValue} when the backend mail service is connected.`
        : `A verification code will be sent to ${recoveryValue} when the backend SMS service is connected.`
    );
  };

  const verifyCode = (e) => {
    e.preventDefault();
    clearMessages();
    if (recoveryCode.trim().length < 4) return setError("Enter the verification code.");
    setRecoveryStep("verified");
    setSuccess("Verification UI completed. The final password reset will be connected to your backend.");
  };

  if (!user && view === "forgot") {
    return (
      <Shell>
        <div className="w-full max-w-2xl">
          <button onClick={() => { clearMessages(); setRecoveryStep("choose"); setView("auth"); }}
            className="mb-5 flex items-center gap-2 text-sm font-bold text-neutral-300 hover:text-orange-400">
            <ArrowLeft size={17}/> Back to sign in
          </button>
          <div className="rounded-3xl border border-neutral-800 bg-black p-6 md:p-9 shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-black">
              <KeyRound size={30}/>
            </div>
            <div className="mt-5 text-center">
              <p className="text-xs font-black uppercase tracking-[.28em] text-orange-400">Account Recovery</p>
              <h1 className="mt-2 text-3xl font-black">Forgot your password?</h1>
              <p className="mt-2 text-sm text-neutral-400">Choose how you want to recover your J-Town Hoops account.</p>
            </div>
            {searchParams.get("registered") === "1" && (
              <Message type="success">
                Registration successful. Sign in with the email and password you just created.
              </Message>
            )}
            {error && <Message type="error">{error}</Message>}
            {success && <Message type="success">{success}</Message>}

            {recoveryStep === "choose" && (
              <form onSubmit={sendRecovery} className="mt-7">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Choice active={recoveryMethod==="email"} onClick={()=>setRecoveryMethod("email")}
                    icon={<Mail/>} title="Email recovery" text="Receive a secure reset link."/>
                  <Choice active={recoveryMethod==="phone"} onClick={()=>setRecoveryMethod("phone")}
                    icon={<Smartphone/>} title="Phone recovery" text="Receive a one-time SMS code."/>
                </div>
                <Input icon={recoveryMethod==="email"?<Mail/>:<Phone/>}
                  type={recoveryMethod==="email"?"email":"tel"}
                  placeholder={recoveryMethod==="email"?"Account email":"Phone number"}
                  value={recoveryValue} setValue={setRecoveryValue}/>
                <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 font-black text-black hover:bg-orange-400">
                  <Send size={18}/> Send Recovery
                </button>
              </form>
            )}

            {recoveryStep === "sent" && (
              <form onSubmit={verifyCode} className="mt-7">
                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 text-center">
                  <CheckCircle2 className="mx-auto text-orange-400" size={34}/>
                  <h2 className="mt-3 font-black">Recovery request ready</h2>
                  <p className="mt-2 text-sm text-neutral-400">Enter the verification code when your backend delivery service is connected.</p>
                </div>
                <Input icon={<KeyRound/>} placeholder="Verification code" value={recoveryCode} setValue={setRecoveryCode}/>
                <button className="mt-5 w-full rounded-xl bg-orange-500 py-4 font-black text-black">Verify Code</button>
              </form>
            )}

            {recoveryStep === "verified" && (
              <div className="mt-7 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
                <CheckCircle2 className="mx-auto text-emerald-400" size={38}/>
                <h2 className="mt-3 text-xl font-black">Identity verified</h2>
                <p className="mt-2 text-sm text-neutral-400">Your backend will place the new-password form here.</p>
                <button onClick={()=>{setRecoveryStep("choose");setView("auth");}}
                  className="mt-5 rounded-xl bg-orange-500 px-6 py-3 font-black text-black">Return to Sign In</button>
              </div>
            )}
          </div>
        </div>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <div className="w-full max-w-lg">
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-black shadow-xl shadow-orange-500/20">
              {isSignUp?<UserPlus size={36}/>:<LogIn size={36}/>}
            </div>
            <h1 className="mt-5 text-4xl font-black">{isSignUp?"Create Account":"Welcome Back"}</h1>
            <p className="mt-2 text-neutral-500">{isSignUp?"Join the J-Town Hoops community.":"Sign in to your account."}</p>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off" className="rounded-3xl border border-neutral-800 bg-black p-6 md:p-8 shadow-2xl">
            {error && <Message type="error">{error}</Message>}

            {isSignUp && (
              <>
                <Input icon={<User/>} placeholder="Full name" value={name} setValue={setName}/>
                <Input icon={<Phone/>} type="tel" placeholder="Phone number" value={phone} setValue={setPhone}/>
                <div className="mt-5">
                  <p className="mb-3 text-sm font-bold text-neutral-300">Register as</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PUBLIC_ROLES.map((role) => (
                      <button key={role} type="button" onClick={()=>setSelectedRole(role)}
                        className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-black transition ${
                          selectedRole===role ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-600"
                        }`}>
                        {roleIcon(role)} {role}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-neutral-600">Admin cannot be selected here. Admin access is assigned only through your admin-email configuration.</p>
                </div>
              </>
            )}

            <Input icon={<Mail/>} type="email" placeholder="Email address" value={email} setValue={setEmail}/>
            <Password value={password} setValue={setPassword} show={showPassword} setShow={setShowPassword} placeholder="Password"/>
            {isSignUp && <Password value={confirmPassword} setValue={setConfirmPassword} show={showPassword} setShow={setShowPassword} placeholder="Confirm password"/>}

            {!isSignUp && (
              <button type="button" onClick={()=>{setRecoveryValue(email);clearMessages();setView("forgot");}}
                className="mt-4 block ml-auto text-sm font-bold text-orange-400 hover:text-orange-300">
                Forgot password?
              </button>
            )}

            <button type="submit" className="mt-6 w-full rounded-xl bg-orange-500 py-4 font-black text-black hover:bg-orange-400">
              {isSignUp?"Create Account":"Sign In"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="mt-5 w-full rounded-xl border border-neutral-800 bg-neutral-950 py-3.5 text-sm font-bold text-neutral-300 hover:border-orange-500/40 hover:text-orange-400"
            >
              New here? Create a J-Town Hoops account
            </button>
          </form>
        </div>
      </Shell>
    );
  }

  const displayRole = isAdmin ? "Admin" : (profile.role || user.role || "User");

  return (
    <Shell>
      <div className="w-full max-w-5xl">
        <section className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-black/80 backdrop-blur-md shadow-2xl">
          {/* Small exit button inside the account box */}
          <Link
            to="/"
            title="Back to Home"
            className="absolute left-3 top-3 z-40 flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/65 px-2.5 py-1.5 text-[11px] font-bold text-neutral-200 backdrop-blur-md transition hover:border-orange-500 hover:bg-orange-500 hover:text-black"
          >
            <Home size={13}/><span>Exit</span><X size={11}/>
          </Link>

          {/* Facebook-style user cover area */}
          <div
            className="relative min-h-[300px] overflow-hidden border-b border-neutral-800"
            style={profile.coverImage ? {
              backgroundImage: `url(${profile.coverImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            } : {
              background: "linear-gradient(135deg, #171717 0%, #262626 45%, #7c2d12 100%)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/90"/>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-orange-950/20 via-transparent to-black/20"/>

            <button
              type="button"
              onClick={()=>coverInputRef.current?.click()}
              className="absolute right-4 top-14 z-20 flex items-center gap-2 rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-xs font-bold text-white backdrop-blur-md shadow-lg transition hover:border-orange-500 hover:bg-orange-500 hover:text-black"
            >
              <Camera size={15}/><span className="hidden sm:inline">Change Cover</span>
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverImage} className="hidden"/>

            <div className="relative z-10 flex min-h-[300px] flex-col justify-end p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-end">
                  <div className="relative">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-orange-500 bg-neutral-900 shadow-2xl shadow-black/60">
                      {profile.avatar ? <img src={profile.avatar} alt="Profile" className="h-full w-full object-cover"/> : <User size={48} className="text-orange-400"/>}
                    </div>
                    <button
                      type="button"
                      onClick={()=>fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-orange-500 text-black shadow-lg transition hover:scale-110 hover:bg-orange-400"
                      title="Change profile picture"
                    >
                      <Camera size={17}/>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden"/>
                  </div>

                  <div className="text-center sm:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[.25em] text-orange-400">J-Town Hoops Account</p>
                    <h1 className="mt-1 text-3xl font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.9)] md:text-4xl">{profile.name || user.name || "J-Town Member"}</h1>
                    <p className="mt-1 text-sm text-neutral-200 drop-shadow-[0_2px_4px_rgba(0,0,0,.9)]">{profile.email || user.email}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-orange-500/50 bg-black/60 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-orange-400 backdrop-blur-md">
                      {roleIcon(displayRole)} {displayRole}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-red-400/40 bg-black/60 px-5 py-3 font-black text-red-300 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-red-500 hover:bg-red-500 hover:text-white md:mt-8"
                >
                  <LogOut size={18}/> Sign Out
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 border-b border-neutral-800">
            <Tab active={view==="profile"} onClick={()=>setView("profile")} icon={<User size={18}/>} label="Profile"/>
            <Tab active={view==="settings"} onClick={()=>setView("settings")} icon={<Settings size={18}/>} label="Settings"/>
            <Tab active={view==="security"} onClick={()=>setView("security")} icon={<Lock size={18}/>} label="Security"/>
          </div>

          <div className="p-6 md:p-8">
            {error && <Message type="error">{error}</Message>}
            {success && <Message type="success">{success}</Message>}

            {view==="profile" && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Info icon={<Mail/>} label="Email" value={profile.email || user.email}/>
                  <Info icon={<Phone/>} label="Phone" value={profile.phone || "Not added"}/>
                  <Info icon={<MapPin/>} label="Location" value={profile.location || "Not added"}/>
                </div>
                <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                  <h2 className="font-black">About</h2>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">{profile.bio || "Add a short bio from Account Settings."}</p>
                </div>
              </>
            )}

            {view==="settings" && (
              <form onSubmit={saveProfile}>
                <div className="grid gap-5 md:grid-cols-2">
                  <Setting label="Display name" value={profile.name} onChange={(v)=>setProfile({...profile,name:v})} icon={<User/>}/>
                  <Setting label="Email" type="email" value={profile.email} onChange={(v)=>setProfile({...profile,email:v})} icon={<Mail/>}/>
                  <Setting label="Phone" type="tel" value={profile.phone} onChange={(v)=>setProfile({...profile,phone:v})} icon={<Phone/>}/>
                  <Setting label="Location" value={profile.location} onChange={(v)=>setProfile({...profile,location:v})} icon={<MapPin/>}/>
                  <Setting label="Birthday" type="date" value={profile.birthday} onChange={(v)=>setProfile({...profile,birthday:v})} icon={<CalendarDays/>}/>
                  <div>
                    <span className="text-sm font-bold text-neutral-300">Account role</span>
                    <div className="mt-2 flex min-h-[52px] items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 text-orange-400 font-black">
                      {roleIcon(displayRole)} {displayRole}
                    </div>
                    <p className="mt-2 text-[11px] text-neutral-600">Role is chosen at registration. Admin status is controlled separately.</p>
                  </div>
                  <label className="md:col-span-2">
                    <span className="text-sm font-bold text-neutral-300">Bio</span>
                    <textarea rows={4} value={profile.bio} onChange={(e)=>setProfile({...profile,bio:e.target.value})}
                      className="mt-2 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 outline-none focus:border-orange-500"
                      placeholder="Tell the J-Town community a little about yourself..."/>
                  </label>
                </div>
                <button className="mt-6 flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-black text-black hover:bg-orange-400">
                  <Save size={18}/> Save Account Settings
                </button>
              </form>
            )}

            {view==="security" && (
              <div className="grid gap-5 md:grid-cols-2">
                <Security icon={<KeyRound/>} title="Change password" text="Connect this to your backend password endpoint later."/>
                <Security icon={<Smartphone/>} title="Recovery phone" text={profile.phone || "Add a recovery phone in Settings."}/>
                <Security icon={<Mail/>} title="Recovery email" text={profile.email || user.email}/>
                <Security icon={<Bell/>} title="Security notifications" text="Account events are connected to your J-Town notification system."/>
              </div>
            )}
          </div>
        </section>
      </div>
    </Shell>
  );
}

function Shell({children}) {
  return (
    <div className="relative min-h-screen bg-[url('/src/images/mybackground4.jpg')] bg-cover bg-center bg-fixed px-4 py-10 text-white sm:px-6">
      <div className="absolute inset-0 bg-black/55"/>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-orange-950/10 via-transparent to-black/50"/>
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center">{children}</div>
    </div>
  );
}
function Message({type,children}) {
  return <div className={`mt-5 rounded-xl border p-3 text-sm ${type==="success"?"border-emerald-500/30 bg-emerald-500/10 text-emerald-300":"border-red-500/30 bg-red-500/10 text-red-300"}`}>{children}</div>;
}
function Input({icon,type="text",placeholder,value,setValue}) {
  const autoComplete = type === "email" ? "off" : "off";
  return <div className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 focus-within:border-orange-500"><span className="text-neutral-500">{icon}</span><input required name={`jtown-${type}-${placeholder.replace(/\\s+/g,"-").toLowerCase()}`} autoComplete={autoComplete} type={type} placeholder={placeholder} value={value} onChange={(e)=>setValue(e.target.value)} className="w-full bg-transparent py-4 outline-none placeholder:text-neutral-600"/></div>;
}
function Password({value,setValue,show,setShow,placeholder}) {
  return <div className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 focus-within:border-orange-500"><Lock size={19} className="text-neutral-500"/><input required name="jtown-login-password" autoComplete="new-password" type={show?"text":"password"} placeholder={placeholder} value={value} onChange={(e)=>setValue(e.target.value)} className="w-full bg-transparent py-4 outline-none placeholder:text-neutral-600"/><button type="button" onClick={()=>setShow(!show)} className="text-neutral-500 hover:text-orange-400">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>;
}
function Choice({active,onClick,icon,title,text}) {
  return <button type="button" onClick={onClick} className={`rounded-2xl border p-5 text-left ${active?"border-orange-500 bg-orange-500/10":"border-neutral-800 bg-neutral-950"}`}><span className="text-orange-400">{icon}</span><h3 className="mt-3 font-black">{title}</h3><p className="mt-1 text-xs text-neutral-500">{text}</p></button>;
}
function Tab({active,onClick,icon,label}) {
  return <button type="button" onClick={onClick} className={`flex items-center justify-center gap-2 px-3 py-4 text-xs sm:text-sm font-black ${active?"bg-orange-500/10 text-orange-400":"text-neutral-500 hover:text-white"}`}>{icon}<span>{label}</span></button>;
}
function Info({icon,label,value}) {
  return <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="text-orange-400">{icon}</div><p className="mt-4 text-[10px] font-black uppercase tracking-widest text-neutral-600">{label}</p><p className="mt-1 break-words text-sm font-bold">{value}</p></div>;
}
function Setting({label,type="text",value,onChange,icon}) {
  return <label><span className="text-sm font-bold text-neutral-300">{label}</span><div className="mt-2 flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 focus-within:border-orange-500"><span className="text-neutral-500">{icon}</span><input type={type} value={value||""} onChange={(e)=>onChange(e.target.value)} className="w-full bg-transparent py-3.5 outline-none"/></div></label>;
}
function Security({icon,title,text}) {
  return <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">{icon}</div><h3 className="mt-4 font-black">{title}</h3><p className="mt-2 text-sm leading-relaxed text-neutral-500">{text}</p></div>;
}
