import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { authAPI } from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  // ==========================================================
  // SEND RESET EMAIL
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const cleanEmail = email
      .trim()
      .toLowerCase();

    if (!cleanEmail) {
      setErrorMessage(
        "Please enter your email address."
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await authAPI.forgotPassword({
          email: cleanEmail,
        });

      setSuccessMessage(
        response?.message ||
          "If an account exists with that email address, a password reset link has been sent."
      );
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "We could not send the password reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-xl">

        {/* BACK TO SIGN IN */}

        <Link
          to="/account"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-neutral-400 transition hover:text-orange-400"
        >
          <ArrowLeft size={18} />

          Back to Sign In
        </Link>


        {/* MAIN CARD */}

        <section className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl">

          {/* TOP */}

          <div className="border-b border-neutral-800 bg-gradient-to-br from-neutral-950 via-black to-neutral-900 px-6 py-9 text-center sm:px-10">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/40 bg-orange-500/10 text-orange-400">
              <KeyRound size={32} />
            </div>

            <p className="mb-2 text-xs font-black uppercase tracking-[0.35em] text-orange-400">
              J-Town Hoops
            </p>

            <h1 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
              Forgot Password?
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-neutral-400">
              Enter the email address connected
              to your J-Town Hoops account and
              we'll send you a secure password
              reset link.
            </p>

          </div>


          {/* FORM */}

          <div className="p-6 sm:p-10">

            {/* SUCCESS */}

            {successMessage && (
              <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-4">
                <div className="flex items-start gap-3">

                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-green-400"
                    size={22}
                  />

                  <div>
                    <p className="font-bold text-green-300">
                      Check your email
                    </p>

                    <p className="mt-1 text-sm leading-6 text-green-100/80">
                      {successMessage}
                    </p>
                  </div>

                </div>
              </div>
            )}


            {/* ERROR */}

            {errorMessage && (
              <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold leading-6 text-red-300">
                {errorMessage}
              </div>
            )}


            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              <div>
                <label
                  htmlFor="forgot-email"
                  className="mb-2 block text-sm font-bold text-neutral-200"
                >
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
                  />

                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="Enter your registered email"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-neutral-700
                      bg-black
                      py-4
                      pl-12
                      pr-4
                      text-white
                      outline-none
                      placeholder:text-neutral-600
                      focus:border-orange-500
                      focus:ring-2
                      focus:ring-orange-500/20
                    "
                  />

                </div>
              </div>


              <button
                type="submit"
                disabled={loading}
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
                  disabled:opacity-60
                "
              >

                {loading ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />

                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={20} />

                    Send Reset Link
                  </>
                )}

              </button>

            </form>


            {/* SECURITY MESSAGE */}

            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-neutral-800 bg-black p-4">

              <ShieldCheck
                size={21}
                className="mt-0.5 shrink-0 text-orange-400"
              />

              <p className="text-xs leading-5 text-neutral-500">
                For account security, J-Town
                Hoops will show the same response
                whether or not an email address is
                registered. Password reset links
                expire after a short period.
              </p>

            </div>


            <div className="mt-8 text-center">

              <p className="text-sm text-neutral-500">
                Remembered your password?
              </p>

              <Link
                to="/account"
                className="mt-2 inline-block font-bold text-orange-400 transition hover:text-orange-300"
              >
                Return to Sign In
              </Link>

            </div>

          </div>

        </section>


        <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-neutral-700">
          J-Town Hoops • Jos, Nigeria
        </p>

      </div>
    </main>
  );
}