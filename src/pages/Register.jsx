import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import myBackground from "../images/mybackground4.jpg";
import {
  User,
  Mail,
  Lock,
  Trophy,
  ArrowRight,
  Shield,
  AlertCircle,
  Phone,
  MapPin,
  Briefcase,
  Users,
  Building2,
  Calendar,
  Ruler,
  Hash,
  Globe,
  FileText,
  ChevronDown,
  UserRoundCheck,
  CircleUserRound,
} from "lucide-react";

export default function Register({ onRegisterSuccess, onToggleLogin }) {
  const [searchParams] = useSearchParams();

  const requestedRole = String(searchParams.get("role") || "user").toLowerCase();
  const allowedRoles = ["user", "supporter", "player", "team", "manager"];
  const initialRole = allowedRoles.includes(requestedRole) ? requestedRole : "user";
  // =========================================================
  // ACCOUNT / REGISTRATION TYPE
  // =========================================================
  const [registrationType, setRegistrationType] = useState(initialRole);

  // =========================================================
  // COMMON USER INFORMATION
  // =========================================================
  const [fullName, setFullName] = useState(searchParams.get("name") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [address, setAddress] = useState("");
  const [occupation, setOccupation] = useState(searchParams.get("occupation") || "");

  // =========================================================
  // SECURITY
  // =========================================================
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // =========================================================
  // SUPPORTER / ORGANISER
  // =========================================================
  const [organisationName, setOrganisationName] = useState("");
  const [organisationRole, setOrganisationRole] = useState("");
  const [eventExperience, setEventExperience] = useState("");

  // =========================================================
  // PLAYER INFORMATION
  // =========================================================
  const [playerTeam, setPlayerTeam] = useState("");
  const [playerPosition, setPlayerPosition] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [yearsPlaying, setYearsPlaying] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [height, setHeight] = useState("");
  const [previousTeam, setPreviousTeam] = useState("");
  const [playerBio, setPlayerBio] = useState("");

  // =========================================================
  // TEAM INFORMATION
  // =========================================================
  const [teamName, setTeamName] = useState("");
  const [teamLocation, setTeamLocation] = useState("");
  const [teamManager, setTeamManager] = useState("");
  const [teamFounded, setTeamFounded] = useState("");
  const [teamType, setTeamType] = useState("");
  const [numberOfPlayers, setNumberOfPlayers] = useState("");
  const [teamDescription, setTeamDescription] = useState("");

  // =========================================================
  // MANAGER INFORMATION
  // =========================================================
  const [managerRole, setManagerRole] = useState("");
  const [managerTeam, setManagerTeam] = useState("");
  const [managerOrganisation, setManagerOrganisation] = useState("");
  const [coordinatorId, setCoordinatorId] = useState("");
  const [securityEmail, setSecurityEmail] = useState("");
  const [managementExperience, setManagementExperience] = useState("");

  // =========================================================
  // FRANCHISE / CONFERENCE
  // =========================================================
  const [selectedConference, setSelectedConference] =
    useState("North Conference");

  // =========================================================
  // VALIDATION / UI STATES
  // =========================================================
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // =========================================================
  // CHANGE REGISTRATION TYPE
  // =========================================================
  const handleRegistrationTypeChange = (e) => {
    setRegistrationType(e.target.value);
    setError("");
    setSuccess("");
  };

  // =========================================================
  // PAGE TITLES
  // =========================================================
  const getRegistrationTitle = () => {
    switch (registrationType) {
      case "supporter":
        return "Supporter Registration";

      case "player":
        return "Player Registration";

      case "team":
        return "Team Registration";

      case "manager":
        return "Manager Registration";

      default:
        return "Create Your Account";
    }
  };

  const getRegistrationDescription = () => {
    switch (registrationType) {
      case "supporter":
        return "Join the J-Town Hoops community and support the game.";

      case "player":
        return "Create your player profile and connect with your basketball team.";

      case "team":
        return "Register your basketball team and establish your team profile.";

      case "manager":
        return "Register your management credentials and manage your basketball organisation.";

      default:
        return "Create your J-Town Hoops account and join the basketball community.";
    }
  };

  // =========================================================
  // IMPORTANT:
  // These reusable field components are declared OUTSIDE Register
  // at the bottom of this file.
  //
  // Why?
  // When they were declared inside Register(), React received a new
  // component type after every keystroke. The input was therefore
  // unmounted/remounted and lost focus after each character.
  // =========================================================

  // =========================================================
  // FORM VALIDATION
  // =========================================================
  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Common required fields
    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !occupation.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Please complete all required account information.");
      return;
    }

    // Password validation
    if (password !== confirmPassword) {
      setError("Your passwords do not match. Please check both password fields.");
      return;
    }

    if (password.length < 6) {
      setError("Your password must contain at least 6 characters.");
      return;
    }

    // =======================================================
    // ROLE-SPECIFIC VALIDATION
    // =======================================================

    if (registrationType === "player") {
      if (!playerTeam.trim() || !playerPosition || !yearsPlaying.trim()) {
        setError(
          "Please complete your team, playing position and basketball experience."
        );
        return;
      }
    }

    if (registrationType === "team") {
      if (
        !teamName.trim() ||
        !teamLocation.trim() ||
        !teamManager.trim() ||
        !teamType
      ) {
        setError(
          "Please complete the required team information before registering."
        );
        return;
      }
    }

    if (registrationType === "manager") {
      if (
        !managerRole ||
        !managerTeam.trim() ||
        !securityEmail.trim() ||
        !coordinatorId.trim()
      ) {
        setError(
          "Please complete the required manager identity and security information."
        );
        return;
      }
    }

    if (registrationType === "supporter") {
      if (!organisationName.trim() || !organisationRole.trim()) {
        setError(
          "Please provide your organisation name and supporter/organiser role."
        );
        return;
      }
    }

    setIsLoading(true);

    // =======================================================
    // BUILD REGISTRATION DATA
    // =======================================================
    const registeredUserData = {
      id: Date.now(),
      name: fullName,
      email,
      phone,
      address,
      occupation,
      password,
      role: registrationType,

      // Common account information
      accountType: registrationType,

      // Supporter / organiser
      supporter: {
        organisationName,
        organisationRole,
        eventExperience,
      },

      // Player
      player: {
        team: playerTeam,
        position: playerPosition,
        jerseyNumber,
        yearsPlaying,
        dateOfBirth,
        nationality,
        height,
        previousTeam,
        bio: playerBio,
      },

      // Team
      team: {
        name: teamName,
        location: teamLocation,
        manager: teamManager,
        founded: teamFounded,
        type: teamType,
        numberOfPlayers,
        description: teamDescription,
        conference: selectedConference,
      },

      // Manager
      manager: {
        role: managerRole,
        team: managerTeam,
        organisation: managerOrganisation,
        coordinatorId,
        securityEmail,
        managementExperience,
        conference: selectedConference,
      },

      // Preserve your original franchise structure
      franchise: {
        name: registrationType === "team" ? teamName : managerTeam,
        conference: selectedConference,
        wins: 0,
        losses: 0,
        roster: [],
      },
    };

    // =======================================================
    // SIMULATED REGISTRATION
    // Replace this later with your backend API call.
    // =======================================================
    setTimeout(() => {
      setIsLoading(false);
      setSuccess("Registration completed successfully!");

      if (onRegisterSuccess) {
        onRegisterSuccess(registeredUserData);
      }
    }, 1000);
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
<div className="min-h-screen bg-cover bg-center bg-fixed relative flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans" 
style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.58), rgba(0,0,0,0.64)), url(${myBackground})`, }} >

      {/* =====================================================
          HEADER / BRANDING
      ====================================================== */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">

        <div className="flex justify-center items-center gap-2.5 mb-4">
          <div className="bg-orange-500 p-2.5 rounded-2xl text-white shadow-md shadow-orange-500/20">
            <Trophy className="h-6 w-6" />
          </div>

          <span className="font-mono font-black text-2xl uppercase tracking-wider text-orange-500">
            J-Town Hoops
          </span>
        </div>

        <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
          {getRegistrationTitle()}
        </h2>

        <p className="mt-2 text-center text-sm text-slate-500 dark:text-neutral-400 max-w-xl mx-auto">
          {getRegistrationDescription()}
        </p>
      </div>

      {/* =====================================================
          MAIN CARD
      ====================================================== */}
      <div className="mt-8 sm:mx-auto w-full max-w-3xl">

        <div className="bg-white dark:bg-neutral-950 py-8 px-5 shadow-xl border border-neutral-200/60 dark:border-neutral-800/80 rounded-3xl sm:px-8">

          {/* =================================================
              REGISTRATION TYPE SELECTOR
          ================================================== */}
          <div className="mb-7 p-5 bg-orange-500/[0.04] border border-orange-500/15 rounded-2xl">

            <div className="flex items-center gap-2 mb-3">
              <UserRoundCheck className="h-4 w-4 text-orange-500" />

              <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-500">
                Choose Account Type
              </span>
            </div>

            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Register As <span className="text-orange-500">*</span>
            </label>

            <div className="relative">
              <select
                value={registrationType}
                onChange={handleRegistrationTypeChange}
                className="w-full px-4 py-3 pr-10 text-sm font-semibold bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 text-slate-900 dark:text-white appearance-none"
              >
                <option value="user">User / General Member</option>
                <option value="supporter">Supporter / Organiser</option>
                <option value="player">Player</option>
                <option value="team">Team</option>
                <option value="manager">Manager</option>
              </select>

              <ChevronDown className="absolute right-4 top-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
            </div>

            <p className="mt-2 text-[10px] text-slate-400">
              Select the account type that best describes how you will
              participate in J-Town Hoops.
            </p>
          </div>

          {/* =================================================
              ERROR
          ================================================== */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-3 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================== */}
          {success && (
            <div className="mb-5 flex items-start gap-2.5 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold p-3 rounded-xl">
              <UserRoundCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* =================================================
              FORM
          ================================================== */}
          <form onSubmit={handleSubmit} className="space-y-7">

            {/* =================================================
                SECTION 1 — BASIC IDENTITY
            ================================================== */}
            <section>

              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-900">
                <CircleUserRound className="h-4 w-4 text-orange-500" />

                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 dark:text-neutral-200">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <InputField
                  label={
                    registrationType === "manager"
                      ? "Full Manager Identity"
                      : "Full Name"
                  }
                  value={fullName}
                  onChange={setFullName}
                  placeholder="e.g. Tobi Adebayo"
                  icon={User}
                  required
                />

                <InputField
                  label={
                    registrationType === "manager"
                      ? "Secure Email Coordinates"
                      : "Email Address"
                  }
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  type="email"
                  icon={Mail}
                  required
                />

                <InputField
                  label="Phone Number"
                  value={phone}
                  onChange={setPhone}
                  placeholder="+234 800 000 0000"
                  type="tel"
                  icon={Phone}
                  required
                />

                <InputField
                  label="Occupation"
                  value={occupation}
                  onChange={setOccupation}
                  placeholder="e.g. Student, Coach, Business Owner"
                  icon={Briefcase}
                  required
                />

              </div>

              <div className="mt-4">
                <InputField
                  label="Residential / Contact Address"
                  value={address}
                  onChange={setAddress}
                  placeholder="Enter your full address"
                  icon={MapPin}
                  required
                />
              </div>

            </section>

            {/* =================================================
                SECTION 2 — SUPPORTER / ORGANISER
            ================================================== */}
            {registrationType === "supporter" && (
              <section className="p-5 bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl">

                <div className="flex items-center gap-2 mb-5">
                  <Users className="h-4 w-4 text-orange-500" />

                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 dark:text-neutral-200">
                      Supporter / Organiser Profile
                    </h3>

                    <p className="text-[10px] text-slate-400 mt-1">
                      Tell us how you participate in the J-Town Hoops community.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <InputField
                    label="Organisation / Community Name"
                    value={organisationName}
                    onChange={setOrganisationName}
                    placeholder="e.g. J-Town Basketball Fans"
                    icon={Building2}
                    required
                  />

                  <InputField
                    label="Your Organiser Role"
                    value={organisationRole}
                    onChange={setOrganisationRole}
                    placeholder="e.g. Event Organiser"
                    icon={Briefcase}
                    required
                  />

                </div>

                <div className="mt-4">
                  <TextAreaField
                    label="Organising / Support Experience"
                    value={eventExperience}
                    onChange={setEventExperience}
                    placeholder="Tell us about your basketball, event or community experience..."
                  />
                </div>

              </section>
            )}

            {/* =================================================
                SECTION 3 — PLAYER
            ================================================== */}
            {registrationType === "player" && (
              <section className="p-5 bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl">

                <div className="flex items-center gap-2 mb-5">
                  <Trophy className="h-4 w-4 text-orange-500" />

                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 dark:text-neutral-200">
                      Player Identity
                    </h3>

                    <p className="text-[10px] text-slate-400 mt-1">
                      Build your J-Town Hoops player profile.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <InputField
                    label="Current Team"
                    value={playerTeam}
                    onChange={setPlayerTeam}
                    placeholder="e.g. J-Town Warriors"
                    icon={Users}
                    required
                  />

                  <SelectField
                    label="Playing Position"
                    value={playerPosition}
                    onChange={setPlayerPosition}
                    icon={Trophy}
                    required
                    options={[
                      {
                        value: "",
                        label: "Select playing position",
                      },
                      {
                        value: "Point Guard",
                        label: "Point Guard",
                      },
                      {
                        value: "Shooting Guard",
                        label: "Shooting Guard",
                      },
                      {
                        value: "Small Forward",
                        label: "Small Forward",
                      },
                      {
                        value: "Power Forward",
                        label: "Power Forward",
                      },
                      {
                        value: "Center",
                        label: "Center",
                      },
                    ]}
                  />

                  <InputField
                    label="Jersey Number"
                    value={jerseyNumber}
                    onChange={setJerseyNumber}
                    placeholder="e.g. 23"
                    icon={Hash}
                  />

                  <InputField
                    label="Years Playing Basketball"
                    value={yearsPlaying}
                    onChange={setYearsPlaying}
                    placeholder="e.g. 5 years"
                    icon={Calendar}
                    required
                  />

                  <InputField
                    label="Date of Birth"
                    value={dateOfBirth}
                    onChange={setDateOfBirth}
                    placeholder=""
                    type="date"
                    icon={Calendar}
                  />

                  <InputField
                    label="Nationality"
                    value={nationality}
                    onChange={setNationality}
                    placeholder="e.g. Nigerian"
                    icon={Globe}
                  />

                  <InputField
                    label="Height"
                    value={height}
                    onChange={setHeight}
                    placeholder="e.g. 6'4 / 193 cm"
                    icon={Ruler}
                  />

                  <InputField
                    label="Previous Team"
                    value={previousTeam}
                    onChange={setPreviousTeam}
                    placeholder="Enter previous team"
                    icon={Users}
                  />

                </div>

                <div className="mt-4">
                  <TextAreaField
                    label="Player Bio"
                    value={playerBio}
                    onChange={setPlayerBio}
                    placeholder="Tell us about your playing style, experience, achievements and basketball goals..."
                  />
                </div>

              </section>
            )}

            {/* =================================================
                SECTION 4 — TEAM
            ================================================== */}
            {registrationType === "team" && (
              <section className="p-5 bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl">

                <div className="flex items-center gap-2 mb-5">
                  <Building2 className="h-4 w-4 text-orange-500" />

                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 dark:text-neutral-200">
                      Team Information
                    </h3>

                    <p className="text-[10px] text-slate-400 mt-1">
                      Register your team and create its J-Town Hoops identity.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <InputField
                    label="Team Name"
                    value={teamName}
                    onChange={setTeamName}
                    placeholder="e.g. J-Town Warriors"
                    icon={Trophy}
                    required
                  />

                  <InputField
                    label="Team Location"
                    value={teamLocation}
                    onChange={setTeamLocation}
                    placeholder="e.g. Port Harcourt"
                    icon={MapPin}
                    required
                  />

                  <InputField
                    label="Team Manager / Contact Person"
                    value={teamManager}
                    onChange={setTeamManager}
                    placeholder="Manager full name"
                    icon={User}
                    required
                  />

                  <InputField
                    label="Year Founded"
                    value={teamFounded}
                    onChange={setTeamFounded}
                    placeholder="e.g. 2024"
                    icon={Calendar}
                  />

                  <SelectField
                    label="Team Type"
                    value={teamType}
                    onChange={setTeamType}
                    icon={Users}
                    required
                    options={[
                      {
                        value: "",
                        label: "Select team type",
                      },
                      {
                        value: "Professional",
                        label: "Professional Team",
                      },
                      {
                        value: "Semi Professional",
                        label: "Semi Professional",
                      },
                      {
                        value: "Amateur",
                        label: "Amateur Team",
                      },
                      {
                        value: "School",
                        label: "School Team",
                      },
                      {
                        value: "Community",
                        label: "Community Team",
                      },
                      {
                        value: "Academy",
                        label: "Basketball Academy",
                      },
                    ]}
                  />

                  <InputField
                    label="Number of Players"
                    value={numberOfPlayers}
                    onChange={setNumberOfPlayers}
                    placeholder="e.g. 15"
                    type="number"
                    icon={Users}
                  />

                  <SelectField
                    label="Conference"
                    value={selectedConference}
                    onChange={setSelectedConference}
                    icon={Trophy}
                    options={[
                      {
                        value: "North Conference",
                        label: "North Conference",
                      },
                      {
                        value: "South Conference",
                        label: "South Conference",
                      },
                    ]}
                  />

                </div>

                <div className="mt-4">
                  <TextAreaField
                    label="Team Description"
                    value={teamDescription}
                    onChange={setTeamDescription}
                    placeholder="Tell us about your team, playing style, achievements and goals..."
                  />
                </div>

              </section>
            )}

            {/* =================================================
                SECTION 5 — MANAGER
            ================================================== */}
            {registrationType === "manager" && (
              <section className="p-5 bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl">

                <div className="flex items-center gap-2 mb-5">
                  <Shield className="h-4 w-4 text-orange-500" />

                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 dark:text-neutral-200">
                      Manager Identity & Security
                    </h3>

                    <p className="text-[10px] text-slate-400 mt-1">
                      Manager accounts contain additional verification information.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <SelectField
                    label="Manager Role"
                    value={managerRole}
                    onChange={setManagerRole}
                    icon={Briefcase}
                    required
                    options={[
                      {
                        value: "",
                        label: "Select manager role",
                      },
                      {
                        value: "Team Manager",
                        label: "Team Manager",
                      },
                      {
                        value: "General Manager",
                        label: "General Manager",
                      },
                      {
                        value: "Club Manager",
                        label: "Club Manager",
                      },
                      {
                        value: "League Coordinator",
                        label: "League Coordinator",
                      },
                      {
                        value: "Team Coordinator",
                        label: "Team Coordinator",
                      },
                      {
                        value: "Administrator",
                        label: "Administrator",
                      },
                    ]}
                  />

                  <InputField
                    label="Team / Franchise"
                    value={managerTeam}
                    onChange={setManagerTeam}
                    placeholder="e.g. J-Town Warriors"
                    icon={Trophy}
                    required
                  />

                  <InputField
                    label="Organisation"
                    value={managerOrganisation}
                    onChange={setManagerOrganisation}
                    placeholder="Club or organisation name"
                    icon={Building2}
                  />

                  <InputField
                    label="Coordinator ID"
                    value={coordinatorId}
                    onChange={setCoordinatorId}
                    placeholder="Enter coordinator ID"
                    icon={Hash}
                    required
                  />

                  <InputField
                    label="Security / Recovery Email"
                    value={securityEmail}
                    onChange={setSecurityEmail}
                    placeholder="security@example.com"
                    type="email"
                    icon={Mail}
                    required
                  />

                  <InputField
                    label="Management Experience"
                    value={managementExperience}
                    onChange={setManagementExperience}
                    placeholder="e.g. 4 years"
                    icon={Calendar}
                  />

                  <SelectField
                    label="Conference"
                    value={selectedConference}
                    onChange={setSelectedConference}
                    icon={Trophy}
                    options={[
                      {
                        value: "North Conference",
                        label: "North Conference",
                      },
                      {
                        value: "South Conference",
                        label: "South Conference",
                      },
                    ]}
                  />

                </div>

                <div className="mt-4 p-4 bg-neutral-900 text-white rounded-xl border border-neutral-800">

                  <div className="flex items-start gap-3">

                    <Shield className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider">
                        Manager Verification
                      </p>

                      <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                        Manager accounts can later be connected to your backend
                        verification system. Coordinator IDs, security emails
                        and team associations can be verified before granting
                        administrative privileges.
                      </p>
                    </div>

                  </div>

                </div>

              </section>
            )}

            {/* =================================================
                SECTION 6 — USER ACCOUNT
            ================================================== */}
            <section>

              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-900">

                <Lock className="h-4 w-4 text-orange-500" />

                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 dark:text-neutral-200">
                  Account Security
                </h3>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <InputField
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  type="password"
                  icon={Lock}
                  required
                />

                <InputField
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="••••••••"
                  type="password"
                  icon={Lock}
                  required
                />

              </div>

              <p className="mt-2 text-[10px] text-slate-400">
                Your password must contain at least 6 characters.
              </p>

            </section>

            {/* =================================================
                SUBMIT BUTTON
            ================================================== */}
            <div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-orange-500/10 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              >

                {isLoading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                    <span>
                      Creating Your J-Town Hoops Account...
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      Create{" "}
                      {registrationType === "user"
                        ? "Account"
                        : registrationType === "supporter"
                        ? "Supporter Profile"
                        : registrationType === "player"
                        ? "Player Profile"
                        : registrationType === "team"
                        ? "Team Account"
                        : "Manager Account"}
                    </span>

                    <ArrowRight className="h-4 w-4" />
                  </>
                )}

              </button>

            </div>

          </form>

          {/* =================================================
              LOGIN
          ================================================== */}
          <div className="mt-7 text-center border-t border-neutral-100 dark:border-neutral-900 pt-5">

            <p className="text-xs text-slate-500 dark:text-neutral-400">

              Already have a J-Town Hoops account?{" "}

              <button
                type="button"
                onClick={onToggleLogin}
                className="font-bold text-orange-500 hover:text-orange-600 transition-colors focus:outline-none"
              >
                Sign In to Portal
              </button>

            </p>

          </div>

        </div>

        {/* ===================================================
            FOOTER INFORMATION
        ==================================================== */}
        <div className="text-center mt-5">

          <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-neutral-600">
            J-Town Hoops • Basketball Community • Player • Team • Manager
          </p>

        </div>

      </div>
    </div>
  );
}

// =========================================================
// REUSABLE FORM FIELDS
// Keep these OUTSIDE the Register component.
// This preserves input focus while typing.
// =========================================================
function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  required = false,
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
        {label}
        {required && <span className="text-orange-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={type === "password" ? "new-password" : undefined}
          className={`w-full ${
            Icon ? "pl-11" : "pl-4"
          } pr-4 py-2.5 text-sm bg-slate-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 text-slate-900 dark:text-white placeholder-slate-400 transition-all`}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  icon: Icon,
  required = false,
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
        {label}
        {required && <span className="text-orange-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
        )}

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`w-full ${
            Icon ? "pl-11" : "pl-4"
          } pr-10 py-2.5 text-sm bg-slate-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 text-slate-900 dark:text-white transition-all appearance-none`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="absolute right-3.5 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
      </div>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
        {label}
        {required && <span className="text-orange-500 ml-1">*</span>}
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 text-slate-900 dark:text-white placeholder-slate-400 transition-all resize-none"
      />
    </div>
  );
}

