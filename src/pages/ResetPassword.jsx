import { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { authAPI } from "../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  // ==========================================================
  // GET TOKEN FROM EMAIL LINK
  // ==========================================================
  //
  // Example:
  //
  // /reset-password?token=abc123
  //
  // ==========================================================

  const token =
    searchParams.get("token") || "";

  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    resetComplete,
    setResetComplete,
  ] = useState(false);

  // ==========================================================
  // RESET PASSWORD
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    // --------------------------------------------------------
    // TOKEN CHECK
    // --------------------------------------------------------

    if (!token) {
      setErrorMessage(
        "This password reset link is missing its security token. Please request a new password reset email."
      );

      return;
    }

    // --------------------------------------------------------
    // PASSWORD CHECK
    // --------------------------------------------------------

    if (!password) {
      setErrorMessage(
        "Please enter your new password."
      );

      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        "Your new password must be at least 6 characters."
      );

      return;
    }

    if (!confirmPassword) {
      setErrorMessage(
        "Please confirm your new password."
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setErrorMessage(
        "The passwords do not match."
      );

      return;
    }

    // --------------------------------------------------------
    // SEND TO BACKEND
    // --------------------------------------------------------

    try {
      setLoading(true);

      const response =
        await authAPI.resetPassword({
          token,
          password,
          confirmPassword,
        });

      setResetComplete(true);

      setPassword("");
      setConfirmPassword("");

      setSuccessMessage(
        response?.message ||
          "Your password has been reset successfully."
      );
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "We could not reset your password. The reset link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white text-center sm:px-6">

      <div className="mx-auto w-full max-w-xl">

        {/* BACK */}

        <Link
          to="/account"
          className="
            mb-8
            inline-flex
            items-center
            gap-2
            text-sm
            font-bold
            text-neutral-400
            transition
            hover:text-orange-400
          "
        >
          <ArrowLeft size={18} />

          Back to Sign In
        </Link>


        {/* MAIN CARD */}

        <section
          className="
            overflow-hidden
            rounded-3xl
            border
            border-neutral-800
            bg-neutral-950
            shadow-2xl
          "
        >

          {/* HEADER */}

          <div
            className="
              border-b
              border-neutral-800
              bg-gradient-to-br
              from-neutral-950
              via-black
              to-neutral-900
              px-6
              py-9
              text-center
              sm:px-10
            "
          >

            <div
              className="
                mx-auto
                mb-5
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                border
                border-orange-500/40
                bg-orange-500/10
                text-orange-400
              "
            >
              <LockKeyhole size={32} />
            </div>

            <p
              className="
                mb-2
                text-xs
                font-black
                uppercase
                tracking-[0.35em]
                text-orange-400
              "
            >
              J-Town Hoops
            </p>

            <h1
              className="
                text-3xl
                font-black
                uppercase
                tracking-tight
                sm:text-4xl
              "
            >
              Reset Password
            </h1>

            <p
              className="
                mx-auto
                mt-4
                max-w-md
                text-sm
                leading-6
                text-neutral-400
              "
            >
              Create a new password for your
              J-Town Hoops account.
            </p>

          </div>


          {/* BODY */}

          <div className="p-6 sm:p-10">

            {/* MISSING TOKEN */}

            {!token && (
              <div
                className="
                  mb-6
                  rounded-2xl
                  border
                  border-red-500/30
                  bg-red-500/10
                  p-4
                "
              >
                <div className="flex items-start gap-3">

                  <TriangleAlert
                    size={22}
                    className="
                      mt-0.5
                      shrink-0
                      text-red-400
                    "
                  />

                  <div>
                    <p className="font-bold text-red-300">
                      Invalid reset link
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        leading-6
                        text-red-200/80
                      "
                    >
                      This link does not contain
                      a password reset token.
                      Please request a new link.
                    </p>

                    <Link
                      to="/forgot-password"
                      className="
                        mt-3
                        inline-block
                        font-bold
                        text-orange-400
                        hover:text-orange-300
                      "
                    >
                      Request New Reset Link
                    </Link>
                  </div>

                </div>
              </div>
            )}


            {/* SUCCESS */}

            {successMessage && (
              <div
                className="
                  mb-6
                  rounded-2xl
                  border
                  border-green-500/30
                  bg-green-500/10
                  p-4
                "
              >
                <div className="flex items-start gap-3">

                  <CheckCircle2
                    size={22}
                    className="
                      mt-0.5
                      shrink-0
                      text-green-400
                    "
                  />

                  <div>
                    <p className="font-bold text-green-300">
                      Password Updated
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        leading-6
                        text-green-100/80
                      "
                    >
                      {successMessage}
                    </p>
                  </div>

                </div>
              </div>
            )}


            {/* ERROR */}

            {errorMessage && (
              <div
                className="
                  mb-6
                  rounded-2xl
                  border
                  border-red-500/30
                  bg-red-500/10
                  p-4
                "
              >
                <div className="flex items-start gap-3">

                  <TriangleAlert
                    size={21}
                    className="
                      mt-0.5
                      shrink-0
                      text-red-400
                    "
                  />

                  <p
                    className="
                      text-sm
                      font-semibold
                      leading-6
                      text-red-300
                    "
                  >
                    {errorMessage}
                  </p>

                </div>
              </div>
            )}


            {/* SUCCESS VIEW */}

            {resetComplete ? (
              <div className="text-center">

                <div
                  className="
                    mx-auto
                    mb-5
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-green-500/30
                    bg-green-500/10
                  "
                >
                  <CheckCircle2
                    size={40}
                    className="text-green-400"
                  />
                </div>

                <h2
                  className="
                    text-2xl
                    font-black
                    uppercase
                  "
                >
                  You're Ready
                </h2>

                <p
                  className="
                    mx-auto
                    mt-3
                    max-w-sm
                    text-sm
                    leading-6
                    text-neutral-400
                  "
                >
                  Your new password has been
                  saved. You can now sign in to
                  J-Town Hoops using the new
                  password.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/account?passwordReset=1"
                    )
                  }
                  className="
                    mt-7
                    w-full
                    rounded-xl
                    bg-orange-500
                    px-5
                    py-4
                    font-black
                    uppercase
                    tracking-wider
                    text-black
                    transition
                    hover:bg-orange-400
                  "
                >
                  Continue to Sign In
                </button>

              </div>
            ) : (
              /* RESET FORM */

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                {/* NEW PASSWORD */}

                <div>

                  <label
                    htmlFor="new-password"
                    className="
                      mb-2
                      block
                      text-sm
                      font-bold
                      text-neutral-200
                    "
                  >
                    New Password
                  </label>

                  <div className="relative">

                    <KeyRound
                      size={19}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-neutral-500
                      "
                    />

                    <input
                      id="new-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      disabled={!token || loading}
                      placeholder="Enter new password"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-neutral-700
                        bg-black
                        py-4
                        pl-12
                        pr-12
                        text-white
                        outline-none
                        placeholder:text-neutral-600
                        focus:border-orange-500
                        focus:ring-2
                        focus:ring-orange-500/20
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      disabled={!token}
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-neutral-500
                        transition
                        hover:text-white
                      "
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>

                  </div>

                  <p
                    className="
                      mt-2
                      text-xs
                      text-neutral-600
                    "
                  >
                    Use at least 6 characters.
                  </p>

                </div>


                {/* CONFIRM PASSWORD */}

                <div>

                  <label
                    htmlFor="confirm-new-password"
                    className="
                      mb-2
                      block
                      text-sm
                      font-bold
                      text-neutral-200
                    "
                  >
                    Confirm New Password
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={19}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-neutral-500
                      "
                    />

                    <input
                      id="confirm-new-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      disabled={!token || loading}
                      placeholder="Enter new password again"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-neutral-700
                        bg-black
                        py-4
                        pl-12
                        pr-12
                        text-white
                        outline-none
                        placeholder:text-neutral-600
                        focus:border-orange-500
                        focus:ring-2
                        focus:ring-orange-500/20
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      disabled={!token}
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-neutral-500
                        transition
                        hover:text-white
                      "
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>

                  </div>

                </div>


                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !token
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-orange-500
                    px-5
                    py-4
                    font-black
                    uppercase
                    tracking-wider
                    text-black
                    transition
                    hover:bg-orange-400
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {loading ? (
                    <>
                      <Loader2
                        size={20}
                        className="animate-spin"
                      />

                      Updating Password...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={20} />

                      Reset Password
                    </>
                  )}

                </button>

              </form>
            )}


            {/* SECURITY NOTE */}

            {!resetComplete && (
              <div
                className="
                  mt-8
                  flex
                  items-start
                  gap-3
                  rounded-2xl
                  border
                  border-neutral-800
                  bg-black
                  p-4
                "
              >

                <ShieldCheck
                  size={21}
                  className="
                    mt-0.5
                    shrink-0
                    text-orange-400
                  "
                />

                <p
                  className="
                    text-xs
                    leading-5
                    text-neutral-500
                  "
                >
                  Your reset link can only be
                  used while it is valid. After
                  your password is changed, the
                  reset token is removed from
                  your account.
                </p>

              </div>
            )}

          </div>

        </section>


        <p
          className="
            mt-6
            text-center
            text-xs
            uppercase
            tracking-[0.2em]
            text-neutral-700
          "
        >
          J-Town Hoops • Jos, Nigeria
        </p>

      </div>

    </main>
  );
}