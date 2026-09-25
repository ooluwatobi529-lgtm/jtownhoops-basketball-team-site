import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import myBackground from "../images/mybackground4.jpg";

// ============================================================
// ABOUT / CAROUSEL IMAGES
// ============================================================
import about1 from "../images/about1.jpg";
import about2 from "../images/about2.jpg";
import about3 from "../images/about3.jpg";
import gallery1 from "../images/gallery1.jpg";
import gallery2 from "../images/gallery2.jpg";
import gallery4 from "../images/gallery4.jpg";

// ============================================================
// MAIN COMPONENT
// ============================================================
const AboutUs = () => {
  const navigate = useNavigate();
  // ============================================================
  // GENERAL STATES
  // ============================================================
  const [currentImage, setCurrentImage] = useState(0);
  const [activeRole, setActiveRole] = useState(null);
  const [showContact, setShowContact] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // ============================================================
  // REGISTRATION STATES
  // ============================================================
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    occupation: "",
    role: "",
  });

  // ============================================================
  // SUPPORT STATES
  // ============================================================
  const [selectedSupport, setSelectedSupport] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showPaymentPanel, setShowPaymentPanel] = useState(false);

  // ============================================================
  // CAROUSEL IMAGES
  // ============================================================
  const aboutImages = [
    {
      image: about1,
      title: "Built for the Game",
      subtitle: "J-Town Hoops",
    },
    {
      image: about2,
      title: "Passion Meets Basketball",
      subtitle: "J-Town Hoops",
    },
    {
      image: about3,
      title: "Developing Young Talent",
      subtitle: "J-Town Hoops",
    },
    {
      image: gallery1,
      title: "Community Through Sport",
      subtitle: "J-Town Hoops",
    },
    {
      image: gallery2,
      title: "Together We Rise",
      subtitle: "J-Town Hoops",
    },
    {
      image: gallery4,
      title: "Championship Mindset",
      subtitle: "J-Town Hoops",
    },
  ];

  // ============================================================
  // AUTOMATIC IMAGE SLIDER
  // ============================================================
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % aboutImages.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [aboutImages.length]);

  // ============================================================
  // REGISTRATION ROLES
  // ============================================================
  const registrationRoles = [
    {
      name: "Player",
      icon: "⭐",
      description:
        "Create a basketball player profile and showcase your skills, statistics and achievements.",
    },
    {
      name: "Team",
      icon: "🏀",
      description:
        "Register a basketball team and manage your roster, fixtures and team information.",
    },
    {
      name: "Manager",
      icon: "📋",
      description:
        "Manage players, teams, competitions, schedules and basketball activities.",
    },
    {
      name: "Organizer/Supporter",
      icon: "🏆",
      description:
        "Organize tournaments, competitions, basketball events and community activities.",
    },
  ];

  // ============================================================
  // SUPPORT OPTIONS
  // ============================================================
  const supportOptions = [
    {
      title: "Youth Basketball Development",
      icon: "🏀",
      description:
        "Support young athletes as they develop basketball skills, discipline and confidence.",
    },
    {
      title: "Basketball Clinics",
      icon: "🎓",
      description:
        "Help provide structured basketball training and development opportunities for young players.",
    },
    {
      title: "Annual Tournaments",
      icon: "🏆",
      description:
        "Support tournaments that bring teams and basketball communities together.",
    },
    {
      title: "Sports Equipment",
      icon: "👟",
      description:
        "Help provide basketballs, training equipment, jerseys and other sporting resources.",
    },
    {
      title: "Community Programs",
      icon: "🤝",
      description:
        "Support programs that use basketball to encourage teamwork, education and personal growth.",
    },
    {
      title: "Talent Development",
      icon: "⭐",
      description:
        "Help discover and develop talented young basketball players for future opportunities.",
    },
  ];

  // ============================================================
  // SUPPORT AMOUNTS
  // ============================================================
  const supportAmounts = {
    NGN: ["₦1,000", "₦2,500", "₦5,000", "₦10,000", "₦25,000"],
    USD: ["$5", "$10", "$25", "$50", "$100"],
    GBP: ["£5", "£10", "£25", "£50", "£100"],
  };

  // ============================================================
  // PAYMENT METHODS
  // ============================================================
  const paymentMethods = [
    {
      id: "paystack",
      name: "Paystack",
      icon: "💳",
      description: "Pay securely using your card or supported Paystack payment options.",
    },
    {
      id: "ussd",
      name: "USSD",
      icon: "📱",
      description: "Use your bank's USSD service to make your support payment.",
    },
    {
      id: "bank",
      name: "Bank Transfer",
      icon: "🏦",
      description: "Transfer your selected support amount directly to the J-Town Hoops account.",
    },
    {
      id: "palmpay",
      name: "PalmPay",
      icon: "📲",
      description: "Send your support using PalmPay.",
    },
    {
      id: "opay",
      name: "Opay",
      icon: "📲",
      description: "Send your support using Opay.",
    },
    {
      id: "moniepoint",
      name: "Moniepoint",
      icon: "💰",
      description: "Send your support using Moniepoint.",
    },
  ];

  // ============================================================
  // CAROUSEL CONTROLS
  // ============================================================
  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % aboutImages.length);
  };

  const previousImage = () => {
    setCurrentImage(
      (prev) => (prev - 1 + aboutImages.length) % aboutImages.length
    );
  };

  // ============================================================
  // FORM INPUT HANDLER
  // ============================================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setRegistrationSuccess(false);
  };

  // ============================================================
  // REGISTRATION SUBMIT
  // All registrations now go through ONE master Register.jsx page.
  // ============================================================
  const handleRegistrationSubmit = (e) => {
    e.preventDefault();

    const params = new URLSearchParams({
      role: formData.role || "user",
      name: formData.name || "",
      email: formData.email || "",
      phone: formData.phone || "",
      occupation: formData.occupation || "",
      from: "about",
    });

    navigate(`/register?${params.toString()}`);
  };

  // ============================================================
  // SELECT SUPPORT CATEGORY
  // ============================================================
  const handleSupportSelection = (support) => {
    setSelectedSupport(support);
    setSelectedAmount(null);
    setSelectedPaymentMethod(null);
    setShowPaymentPanel(false);
  };

  // ============================================================
  // CONTINUE TO PAYMENT
  // ============================================================
  const handleContinueToPayment = () => {
    if (!selectedAmount) {
      alert("Please select a support amount first.");
      return;
    }

    setShowPaymentPanel(true);
  };

  // ============================================================
  // PAYMENT METHOD SELECTION
  // ============================================================
  const handlePaymentMethod = (method) => {
    setSelectedPaymentMethod(method);
  };

  // ============================================================
  // DEMO PAYMENT ACTION
  // ============================================================
  const handlePaymentAction = () => {
    if (!selectedPaymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    alert(
      `Thank you for choosing ${selectedPaymentMethod.name} to support ${selectedSupport?.title} with ${selectedAmount}.\n\nThis is currently the frontend version. Your real payment gateway/backend will be connected here later.`
    );
  };

  // ============================================================
  // GET CONTACT DETAILS
  // ============================================================
  const contactDetails = {
    email: "support@jtownhoops.com",
    phone: "+234-800-123-4567",

    // ========================================================
    // IMPORTANT:
    // REPLACE THESE DEMO VALUES WITH YOUR REAL BANK DETAILS
    // ========================================================
    bankName: "YOUR BANK NAME",
    accountName: "J-TOWN HOOPS",
    accountNumber: "YOUR ACCOUNT NUMBER",

    // Replace these with your real wallet/account numbers
    palmPay: "YOUR PALMPAY NUMBER",
    opay: "YOUR OPAY NUMBER",
    moniepoint: "YOUR MONIEPOINT NUMBER",

    // Replace this with your actual USSD/payment instruction
    ussd: "*000#",
  };

  // ============================================================
  // PAYMENT DETAILS COMPONENT
  // ============================================================
  const renderPaymentDetails = () => {
    if (!selectedPaymentMethod) {
      return (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">💳</div>

          <h4 className="text-xl font-black uppercase text-white">
            Choose a Payment Method
          </h4>

          <p className="text-gray-400 mt-3 max-w-lg mx-auto">
            Select one of the payment options above to see the instructions
            for completing your support.
          </p>
        </div>
      );
    }

    // ==========================================================
    // PAYSTACK
    // ==========================================================
    if (selectedPaymentMethod.id === "paystack") {
      return (
        <div className="text-center">
          <div className="text-5xl mb-4">💳</div>

          <h4 className="text-2xl font-black uppercase text-orange-400">
            Paystack
          </h4>

          <p className="text-gray-300 mt-3 max-w-xl mx-auto">
            Paystack will be connected to this button when your backend and
            payment gateway are ready.
          </p>

          <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-5 max-w-lg mx-auto">
            <p className="text-sm text-gray-400 uppercase tracking-wider">
              Support Amount
            </p>

            <p className="text-3xl font-black text-orange-400 mt-2">
              {selectedAmount}
            </p>
          </div>

          <button
            type="button"
            onClick={handlePaymentAction}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-black px-8 py-4 rounded-lg font-black uppercase tracking-wider transition-all duration-300 hover:scale-105"
          >
            Proceed to Paystack
          </button>
        </div>
      );
    }

    // ==========================================================
    // USSD
    // ==========================================================
    if (selectedPaymentMethod.id === "ussd") {
      return (
        <div className="text-center">
          <div className="text-5xl mb-4">📱</div>

          <h4 className="text-2xl font-black uppercase text-orange-400">
            USSD Payment
          </h4>

          <p className="text-gray-300 mt-3">
            Use your mobile banking USSD service to make your support payment.
          </p>

          <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6 max-w-lg mx-auto">
            <p className="text-gray-400 text-sm uppercase tracking-wider">
              USSD Information
            </p>

            <p className="text-3xl font-black text-white mt-3">
              {contactDetails.ussd}
            </p>

            <p className="text-sm text-gray-400 mt-3">
              Replace the demo USSD code above with your actual bank/payment
              USSD instructions.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePaymentAction}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-black px-8 py-4 rounded-lg font-black uppercase tracking-wider transition-all duration-300 hover:scale-105"
          >
            Continue with USSD
          </button>
        </div>
      );
    }

    // ==========================================================
    // BANK TRANSFER
    // ==========================================================
    if (selectedPaymentMethod.id === "bank") {
      return (
        <div className="text-center">
          <div className="text-5xl mb-4">🏦</div>

          <h4 className="text-2xl font-black uppercase text-orange-400">
            Bank Transfer
          </h4>

          <p className="text-gray-300 mt-3">
            Transfer your selected support amount to the account below.
          </p>

          <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6 max-w-lg mx-auto text-left">
            <div className="border-b border-white/10 pb-4 mb-4">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Bank Name
              </p>

              <p className="text-lg font-bold text-white mt-1">
                {contactDetails.bankName}
              </p>
            </div>

            <div className="border-b border-white/10 pb-4 mb-4">
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Account Name
              </p>

              <p className="text-lg font-bold text-white mt-1">
                {contactDetails.accountName}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Account Number
              </p>

              <p className="text-2xl font-black text-orange-400 mt-1">
                {contactDetails.accountNumber}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-5">
            Replace the demo bank information with your real J-Town Hoops
            account details before launching the website.
          </p>

          <button
            type="button"
            onClick={handlePaymentAction}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-black px-8 py-4 rounded-lg font-black uppercase tracking-wider transition-all duration-300 hover:scale-105"
          >
            I Will Make the Transfer
          </button>
        </div>
      );
    }

    // ==========================================================
    // PALMPAY
    // ==========================================================
    if (selectedPaymentMethod.id === "palmpay") {
      return (
        <div className="text-center">
          <div className="text-5xl mb-4">📲</div>

          <h4 className="text-2xl font-black uppercase text-orange-400">
            PalmPay
          </h4>

          <p className="text-gray-300 mt-3">
            Send your selected support amount to the PalmPay account below.
          </p>

          <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6 max-w-lg mx-auto">
            <p className="text-xs uppercase tracking-widest text-gray-500">
              PalmPay Number
            </p>

            <p className="text-2xl font-black text-orange-400 mt-2">
              {contactDetails.palmPay}
            </p>

            <p className="text-sm text-gray-400 mt-3">
              Replace this demo number with your real PalmPay number.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePaymentAction}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-black px-8 py-4 rounded-lg font-black uppercase tracking-wider transition-all duration-300 hover:scale-105"
          >
            Continue with PalmPay
          </button>
        </div>
      );
    }

    // ==========================================================
    // OPAY
    // ==========================================================
    if (selectedPaymentMethod.id === "opay") {
      return (
        <div className="text-center">
          <div className="text-5xl mb-4">📲</div>

          <h4 className="text-2xl font-black uppercase text-orange-400">
            Opay
          </h4>

          <p className="text-gray-300 mt-3">
            Send your selected support amount to the Opay account below.
          </p>

          <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6 max-w-lg mx-auto">
            <p className="text-xs uppercase tracking-widest text-gray-500">
              Opay Number
            </p>

            <p className="text-2xl font-black text-orange-400 mt-2">
              {contactDetails.opay}
            </p>

            <p className="text-sm text-gray-400 mt-3">
              Replace this demo number with your real Opay number.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePaymentAction}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-black px-8 py-4 rounded-lg font-black uppercase tracking-wider transition-all duration-300 hover:scale-105"
          >
            Continue with Opay
          </button>
        </div>
      );
    }

    // ==========================================================
    // MONIEPOINT
    // ==========================================================
    if (selectedPaymentMethod.id === "moniepoint") {
      return (
        <div className="text-center">
          <div className="text-5xl mb-4">💰</div>

          <h4 className="text-2xl font-black uppercase text-orange-400">
            Moniepoint
          </h4>

          <p className="text-gray-300 mt-3">
            Send your selected support amount using the Moniepoint account
            below.
          </p>

          <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-6 max-w-lg mx-auto">
            <p className="text-xs uppercase tracking-widest text-gray-500">
              Moniepoint Number
            </p>

            <p className="text-2xl font-black text-orange-400 mt-2">
              {contactDetails.moniepoint}
            </p>

            <p className="text-sm text-gray-400 mt-3">
              Replace this demo number with your real Moniepoint number.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePaymentAction}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-black px-8 py-4 rounded-lg font-black uppercase tracking-wider transition-all duration-300 hover:scale-105"
          >
            Continue with Moniepoint
          </button>
        </div>
      );
    }

    return null;
  };

  // ============================================================
  // PAGE
  // ============================================================
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed text-white relative overflow-hidden"
      style={{ backgroundImage: `url(${myBackground})` }}
    >
      {/* ========================================================
          DARK OVERLAY
      ======================================================== */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>

      {/* ========================================================
          ALL PAGE CONTENT
      ======================================================== */}
      <div className="relative z-10 min-h-screen text-center">

        {/* ======================================================
            HERO
        ====================================================== */}
        <section className="px-6 pt-12 pb-8 text-center">
          <div className="max-w-5xl mx-auto flex flex-col items-center">

            <p className="text-orange-400 font-bold uppercase tracking-[0.3em] text-sm mb-3 animate-pulse">
              Welcome to the Home of Basketball
            </p>

            <h1 className="text-4xl md:text-6xl font-black uppercase mb-4 tracking-tight text-center">
              About{" "}
              <span className="text-orange-500">
                J-Town Hoops
              </span>
            </h1>

            <div className="w-24 h-1 bg-orange-500 mx-auto mt-5 mb-5"></div>

            <p className="w-full max-w-3xl mx-auto text-base md:text-lg text-gray-200 leading-relaxed text-center">
              J-Town Hoops 🏀 | Jos, Nigeria
              <br />
              Youth Basketball Clinic + Annual Tournaments
              <br />
              Training talent. Building character. Creating opportunities.
            </p>
          </div>
        </section>

        {/* ======================================================
            1. CAROUSEL
        ====================================================== */}
        <section className="px-5 md:px-10 py-8">
          <div className="max-w-6xl mx-auto">

            <div className="relative overflow-hidden bg-black/70 border border-white/10 shadow-2xl rounded-2xl transition-all duration-500 hover:border-orange-500/60">

              <div className="relative h-[260px] md:h-[430px]">

                <img
                  src={aboutImages[currentImage].image}
                  alt={aboutImages[currentImage].title}
                  className="w-full h-full object-cover transition-all duration-1000 hover:scale-105"
                  onError={(e) => {
                    console.error(
                      "Could not load carousel image:",
                      aboutImages[currentImage].image
                    );
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                <div className="absolute bottom-6 left-6 right-6 text-center">

                  <p className="text-orange-400 text-xs md:text-sm uppercase tracking-[0.25em] font-bold">
                    {aboutImages[currentImage].subtitle}
                  </p>

                  <h2 className="text-2xl md:text-4xl font-black uppercase mt-1">
                    {aboutImages[currentImage].title}
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={previousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 hover:bg-orange-500 border border-white/20 flex items-center justify-center text-xl transition-all duration-300 hover:scale-110"
                  aria-label="Previous image"
                >
                  ❮
                </button>

                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 hover:bg-orange-500 border border-white/20 flex items-center justify-center text-xl transition-all duration-300 hover:scale-110"
                  aria-label="Next image"
                >
                  ❯
                </button>

              </div>

              <div className="flex justify-center gap-2 py-4 bg-black/80">

                {aboutImages.map((_, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`h-2 rounded-full transition-all duration-500 hover:scale-125 ${
                      currentImage === index
                        ? "w-8 bg-orange-500"
                        : "w-2 bg-gray-500 hover:bg-gray-300"
                    }`}
                    aria-label={`Show image ${index + 1}`}
                  ></button>
                ))}

              </div>

            </div>
          </div>
        </section>

        {/* ======================================================
            2. BIOGRAPHY
        ====================================================== */}
        <section className="px-6 py-14">
          <div className="max-w-5xl mx-auto">

            <div className="bg-black/65 border border-white/10 p-7 md:p-12 shadow-xl rounded-2xl transition-all duration-500 hover:border-orange-500/60">

              <div className="text-center">

                <p className="text-orange-400 text-sm uppercase tracking-[0.3em] font-bold mb-3">
                  Our Story
                </p>

                <h2 className="text-3xl md:text-4xl font-black uppercase mb-6">
                  About J-Town Hoops
                </h2>

              </div>

              <div className="text-gray-200 text-base md:text-lg leading-relaxed text-center max-w-4xl mx-auto">

                <p>
                  <strong className="text-orange-400">
                    J-Town Hoops: Where Basketball Builds Futures.
                  </strong>{" "}
                  J-Town Hoops is a basketball factory for youths. We're here to
                  develop talent, build character, and create opportunities
                  through the game we love.
                </p>

                <br />

                <p>
                  <strong className="text-orange-400">
                    Our Story
                  </strong>
                </p>

                <br />

                <p>
                  J-Town Hoops was founded in 2022/2023 by Mr. Femi Emmanuel
                  Okunrinyo aka BIG FEMO. Born and bred in Jos, Plateau State,
                  and hailing from Kogi State, Coach Femo has lived basketball.
                  He played professionally at home and abroad and has coached
                  numerous teams and players over the years.
                </p>

                <br />

                <p>
                  He started J-Town Hoops to give back to the community that
                  raised him and to use basketball as a tool for education,
                  integrity, and personal growth.
                </p>

                {expanded && (
                  <div className="mt-6 text-gray-300 leading-relaxed text-center">

                    <p>
                      Our goal is to create an environment where athletes,
                      coaches, organizers and basketball supporters can connect,
                      compete and grow together.
                    </p>

                    <br />

                    <p>
                      <strong className="text-orange-400">
                        What We Do
                      </strong>
                    </p>

                    <br />

                    <p>
                      <strong className="text-white">
                        1. Youth Development & Basketball Clinic
                      </strong>
                    </p>

                    <br />

                    <p>
                      From your first dribble to playing like a pro. Our clinic
                      at the AziniYako Youth Center, Jos, Plateau State trains
                      young boys and girls with structure, discipline, and fun.
                    </p>

                    <br />

                    <p>
                      <strong className="text-white">
                        2. Skills, Character & Opportunity
                      </strong>
                    </p>

                    <br />

                    <p>
                      Basketball is more than a game to us. It's a way of life.
                    </p>

                    <br />

                    <p>
                      We focus on sports development, confidence, discipline,
                      talent hunting, character, integrity and education
                      through sports.
                    </p>

                    <br />

                    <p>
                      <strong className="text-white">
                        3. Tournaments & Community
                      </strong>
                    </p>

                    <br />

                    <p>
                      Every year, J-Town Hoops hosts tournaments that bring
                      together teams, coaches, and organizers from across
                      Nigeria and beyond.
                    </p>

                    <br />

                    <p>
                      <strong className="text-orange-400">
                        Join the Movement
                      </strong>
                    </p>

                    <br />

                    <p>
                      Are you a passionate player, a team, or an organizer?
                      Register on our website today and let's start your journey
                      to greatness.
                    </p>

                    <br />

                    <p>
                      We believe in changing lives for the better, one game at
                      a time.
                    </p>

                    <br />

                    <p>
                      <strong className="text-orange-400">
                        Visit Us
                      </strong>
                    </p>

                    <br />

                    <p>
                      J-Town Hoops Basketball Clinic
                      <br />
                      AziniYako Youth Center, Jos, Plateau State, Nigeria
                    </p>

                    <br />

                    <p>
                      J-Town Hoops. Be part of something big.
                      <br />
                      Be part of greatness.
                    </p>

                    <br />

                    <p>
                      See you on the court! 🏀
                    </p>

                    <br />

                    <p>
                      Through basketball, we encourage discipline, teamwork,
                      leadership, respect and excellence both on and off the
                      court.
                    </p>

                  </div>
                )}

              </div>

              <div className="text-center mt-7">

                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg font-bold uppercase text-sm tracking-wider transition-all duration-300 hover:scale-105"
                >
                  {expanded ? "Read Less" : "Read More"}
                </button>

              </div>

            </div>
          </div>
        </section>

        {/* ======================================================
            MISSION / VALUES
        ====================================================== */}
        <section className="px-6 pb-14">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">

            {[
              {
                icon: "🏀",
                title: "Basketball",
                text:
                  "Creating opportunities for players and teams to compete, improve and showcase their talent.",
              },
              {
                icon: "🎓",
                title: "Education",
                text:
                  "Encouraging discipline, learning, personal development and leadership through sport.",
              },
              {
                icon: "🤝",
                title: "Community",
                text:
                  "Building stronger relationships between athletes, supporters, organizers and the wider community.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-black/70 border border-white/10 p-7 text-center rounded-2xl transition-all duration-500 hover:border-orange-500 hover:-translate-y-2 hover:scale-[1.02]"
              >
                <div className="text-4xl mb-4">
                  {item.icon}
                </div>

                <h3 className="text-xl font-black uppercase text-orange-400">
                  {item.title}
                </h3>

                <p className="text-gray-300 mt-3 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}

          </div>
        </section>

        {/* ======================================================
            3. REGISTRATION
        ====================================================== */}
        <section className="px-6 py-14">
          <div className="max-w-6xl mx-auto flex flex-col items-center">

            <div className="text-center mb-10">

              <p className="text-orange-400 text-sm uppercase tracking-[0.3em] font-bold mb-3">
                Get Involved
              </p>

              <h2 className="text-3xl md:text-4xl font-black uppercase">
                Join J-Town Hoops
              </h2>

              <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
                Create your J-Town Hoops account and choose how you want to
                participate in the basketball community.
              </p>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

              {registrationRoles.map((role) => (
                <button
                  type="button"
                  key={role.name}
                  onClick={() => {
                    setActiveRole(role);

                    setFormData((prev) => ({
                      ...prev,
                      role: role.name,
                    }));

                    setShowRegistration(true);
                    setRegistrationSuccess(false);
                  }}
                  className={`text-center p-5 border rounded-xl transition-all duration-500 ${
                    activeRole?.name === role.name
                      ? "bg-orange-500 border-orange-500 text-black scale-[1.03]"
                      : "bg-black/70 border-white/10 hover:border-orange-500 hover:bg-black/85 hover:-translate-y-2"
                  }`}
                >

                  <div className="text-3xl mb-3">
                    {role.icon}
                  </div>

                  <h3 className="font-black uppercase text-lg">
                    {role.name}
                  </h3>

                  <p
                    className={`text-xs mt-2 ${
                      activeRole?.name === role.name
                        ? "text-black/70"
                        : "text-gray-300"
                    }`}
                  >
                    {role.description}
                  </p>

                </button>
              ))}

            </div>

            {/* ==================================================
                REGISTRATION FORM
            ================================================== */}
            {showRegistration && (
              <div className="mt-8 bg-black/80 border border-orange-500/40 rounded-2xl p-6 md:p-10 shadow-2xl">

                <div className="text-center mb-8">

                  <div className="text-4xl mb-3">
                    {activeRole?.icon}
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black uppercase">
                    Register as{" "}
                    <span className="text-orange-500">
                      {formData.role}
                    </span>
                  </h3>

                  <p className="text-gray-400 mt-2">
                    Fill in your information below to create your registration
                    request.
                  </p>

                </div>

                <form
                  onSubmit={handleRegistrationSubmit}
                  className="max-w-4xl mx-auto"
                >

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Full Name
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+234..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Email Address
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">
                        Occupation
                      </label>

                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        placeholder="Student, Coach, Business Owner..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-orange-500"
                        required
                      />
                    </div>

                  </div>

                  <div className="mt-5">

                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Register As
                    </label>

                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-orange-500"
                      required
                    >
                      <option value="">
                        Select your registration role
                      </option>

                      {registrationRoles.map((role) => (
                        <option key={role.name} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </select>

                  </div>

                  {registrationSuccess && (
                    <div className="mt-6 bg-green-500/15 border border-green-500/40 rounded-lg p-4 text-green-300 text-center">

                      <div className="text-2xl mb-1">
                        ✅
                      </div>

                      <p className="font-bold">
                        Registration request submitted successfully!
                      </p>

                      <p className="text-sm mt-1 text-green-200/80">
                        Backend integration can be connected later.
                      </p>

                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 mt-7">

                    <button
                      type="submit"
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-black py-4 rounded-lg font-black uppercase tracking-wider transition-all duration-300 hover:scale-[1.02]"
                    >
                      Create Registration
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowRegistration(false);
                        setActiveRole(null);
                      }}
                      className="border border-white/20 hover:border-red-500 hover:text-red-400 px-6 py-4 rounded-lg font-bold uppercase transition-all duration-300"
                    >
                      Cancel
                    </button>

                  </div>

                </form>
              </div>
            )}

          </div>
        </section>

        {/* ======================================================
            4. CONTACT SECTION
        ====================================================== */}
        <section className="px-6 py-14">
          <div className="max-w-5xl mx-auto flex flex-col items-center">

            <div className="bg-black/70 border border-white/10 p-8 md:p-12 text-center rounded-2xl shadow-xl">

              <p className="text-orange-400 text-sm uppercase tracking-[0.3em] font-bold mb-3">
                We Are Here to Help
              </p>

              <h2 className="text-3xl md:text-4xl font-black uppercase mb-5">
                Need Assistance?
              </h2>

              <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                Have questions about J-Town Hoops, registration, teams,
                players or basketball activities? Get in touch with us.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">

                <a
                  href={`mailto:${contactDetails.email}`}
                  className="bg-orange-500 hover:bg-orange-600 text-black px-6 py-4 rounded-lg font-bold transition-all duration-300 hover:scale-105"
                >
                  ✉ Email Us
                </a>

                <a
                  href={`tel:${contactDetails.phone}`}
                  className="border border-orange-500 hover:bg-orange-500 px-6 py-4 rounded-lg font-bold transition-all duration-300 hover:scale-105"
                >
                  ☎ Call Us
                </a>

                <button
                  type="button"
                  onClick={() => setShowContact(!showContact)}
                  className="border border-white/20 hover:border-orange-500 px-6 py-4 rounded-lg font-bold transition-all duration-300 hover:scale-105"
                >
                  Contact Details
                </button>

              </div>

              {showContact && (
                <div className="mt-8 border-t border-white/10 pt-7 text-center">

                  <p className="text-lg">
                    <span className="text-orange-400 font-bold">
                      Email:
                    </span>{" "}
                    {contactDetails.email}
                  </p>

                  <p className="text-lg mt-3">
                    <span className="text-orange-400 font-bold">
                      Phone:
                    </span>{" "}
                    {contactDetails.phone}
                  </p>

                  <p className="text-lg mt-3">
                    <span className="text-orange-400 font-bold">
                      Location:
                    </span>{" "}
                    Jos, Plateau State, Nigeria
                  </p>

                </div>
              )}

            </div>
          </div>
        </section>

        {/* ======================================================
            5. SUPPORT J-TOWN HOOPS
        ====================================================== */}
        <section className="px-6 py-14">
          <div className="max-w-6xl mx-auto flex flex-col items-center">

            {/* SUPPORT HEADING */}
            <div className="text-center mb-10">

              <p className="text-orange-400 text-sm uppercase tracking-[0.3em] font-bold mb-3">
                Support the Movement
              </p>

              <h2 className="text-3xl md:text-4xl font-black uppercase">
                Support J-Town Hoops
              </h2>

              <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
                Your support can help us develop young basketball talent,
                organize competitions and create more opportunities through
                sports.
              </p>

              <p className="text-orange-300 mt-4 text-sm font-semibold">
                Choose what you would like to support below.
              </p>

            </div>

            {/* ==================================================
                SUPPORT CARDS
            ================================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {supportOptions.map((support) => (
                <button
                  type="button"
                  key={support.title}
                  onClick={() => handleSupportSelection(support)}
                  className={`text-center p-6 rounded-2xl border transition-all duration-500 ${
                    selectedSupport?.title === support.title
                      ? "bg-orange-500 text-black border-orange-500 scale-[1.02] shadow-xl"
                      : "bg-black/70 border-white/10 hover:border-orange-500 hover:-translate-y-2 hover:scale-[1.02]"
                  }`}
                >

                  <div className="text-4xl mb-4">
                    {support.icon}
                  </div>

                  <h3 className="font-black uppercase text-lg">
                    {support.title}
                  </h3>

                  <p
                    className={`text-sm mt-3 leading-relaxed ${
                      selectedSupport?.title === support.title
                        ? "text-black/70"
                        : "text-gray-300"
                    }`}
                  >
                    {support.description}
                  </p>

                  <div className="mt-5 text-xs font-bold uppercase tracking-widest">
                    {selectedSupport?.title === support.title
                      ? "✓ Selected"
                      : "Click to Support"}
                  </div>

                </button>
              ))}

            </div>

            {/* ==================================================
                SUPPORT PAYMENT AREA
            ================================================== */}
            {selectedSupport && (
              <div className="mt-8 bg-black/85 border border-orange-500/50 rounded-2xl p-7 md:p-10 text-center shadow-xl">

                <div className="text-5xl mb-4">
                  {selectedSupport.icon}
                </div>

                <h3 className="text-2xl md:text-3xl font-black uppercase">
                  Support{" "}
                  <span className="text-orange-500">
                    {selectedSupport.title}
                  </span>
                </h3>

                <p className="text-gray-300 mt-3 max-w-2xl mx-auto">
                  Choose your currency and the amount you would like to
                  contribute.
                </p>

                {/* ==================================================
                    CURRENCY
                ================================================== */}
                <div className="mt-7">

                  <p className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-3">
                    Choose Currency
                  </p>

                  <div className="flex justify-center flex-wrap gap-3">

                    {[
                      { id: "NGN", label: "🇳🇬 Naira" },
                      { id: "USD", label: "🇺🇸 Dollar" },
                      { id: "GBP", label: "🇬🇧 Pound" },
                    ].map((currency) => (
                      <button
                        type="button"
                        key={currency.id}
                        onClick={() => {
                          setSelectedCurrency(currency.id);
                          setSelectedAmount(null);
                        }}
                        className={`px-6 py-3 rounded-lg font-black transition-all duration-300 ${
                          selectedCurrency === currency.id
                            ? "bg-orange-500 text-black scale-105"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {currency.label}
                      </button>
                    ))}

                  </div>

                </div>

                {/* ==================================================
                    AMOUNTS
                ================================================== */}
                <div className="mt-8">

                  <p className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-3">
                    Choose Support Amount
                  </p>

                  <div className="flex flex-wrap justify-center gap-3">

                    {supportAmounts[selectedCurrency].map((amount) => (
                      <button
                        type="button"
                        key={amount}
                        onClick={() => setSelectedAmount(amount)}
                        className={`px-5 py-3 rounded-lg font-black transition-all duration-300 hover:scale-110 ${
                          selectedAmount === amount
                            ? "bg-orange-500 text-black"
                            : "bg-white text-black hover:bg-orange-400"
                        }`}
                      >
                        {amount}
                      </button>
                    ))}

                  </div>

                </div>

                {/* ==================================================
                    SELECTED SUMMARY
                ================================================== */}
                {selectedAmount && (
                  <div className="mt-8 bg-orange-500/10 border border-orange-500/30 rounded-xl p-5 max-w-xl mx-auto">

                    <p className="text-xs uppercase tracking-widest text-gray-400">
                      Your Support
                    </p>

                    <p className="text-xl font-bold text-white mt-2">
                      {selectedSupport.title}
                    </p>

                    <p className="text-4xl font-black text-orange-400 mt-2">
                      {selectedAmount}
                    </p>

                  </div>
                )}

                {/* ==================================================
                    CONTINUE
                ================================================== */}
                <button
                  type="button"
                  onClick={handleContinueToPayment}
                  className="mt-7 bg-orange-500 hover:bg-orange-600 text-black px-8 py-4 rounded-lg font-black uppercase tracking-wider transition-all duration-300 hover:scale-105"
                >
                  Continue to Payment
                </button>

                {/* ==================================================
                    PAYMENT PANEL
                ================================================== */}
                {showPaymentPanel && (
                  <div className="mt-10 border-t border-white/10 pt-10">

                    <div className="text-center mb-8 flex flex-col items-center">

                      <p className="text-orange-400 text-sm flex flex-col items-center uppercase tracking-[0.3em] font-bold">
                        Choose How You Want to Pay
                      </p>

                      <h3 className="text-2xl md:text-3xl font-black uppercase mt-2">
                        Payment Methods
                      </h3>

                      <p className="text-gray-400 mt-3">
                        Select your preferred payment method.
                      </p>

                    </div>

                    {/* PAYMENT METHOD BUTTONS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                      {paymentMethods.map((method) => (
                        <button
                          type="button"
                          key={method.id}
                          onClick={() => handlePaymentMethod(method)}
                          className={`text-center p-5 rounded-xl border transition-all duration-300 ${
                            selectedPaymentMethod?.id === method.id
                              ? "bg-orange-500 text-black border-orange-500 scale-[1.03]"
                              : "bg-white/5 border-white/10 hover:border-orange-500 hover:bg-white/10"
                          }`}
                        >

                          <div className="text-3xl mb-3">
                            {method.icon}
                          </div>

                          <h4 className="font-black uppercase">
                            {method.name}
                          </h4>

                          <p
                            className={`text-xs mt-2 leading-relaxed ${
                              selectedPaymentMethod?.id === method.id
                                ? "text-black/70"
                                : "text-gray-400"
                            }`}
                          >
                            {method.description}
                          </p>

                        </button>
                      ))}

                    </div>

                    {/* PAYMENT DETAILS */}
                    <div className="mt-8 bg-black/70 border border-orange-500/30 rounded-xl p-6 md:p-8">
                      {renderPaymentDetails()}
                    </div>

                  </div>
                )}

                {/* ==================================================
                    SUPPORT CONTACT
                ================================================== */}
                <div className="mt-10 border-t border-white/10 pt-8">

                  <p className="text-orange-400 font-bold uppercase tracking-widest text-sm">
                    Need Help With Your Support?
                  </p>

                  <p className="text-gray-400 mt-3">
                    If you have any problem making your contribution, contact
                    our support team.
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center gap-4 mt-5">

                    <a
                      href={`mailto:${contactDetails.email}`}
                      className="bg-white/10 hover:bg-orange-500 hover:text-black px-5 py-3 rounded-lg font-bold transition-all duration-300"
                    >
                      ✉ {contactDetails.email}
                    </a>

                    <a
                      href={`tel:${contactDetails.phone}`}
                      className="bg-white/10 hover:bg-orange-500 hover:text-black px-5 py-3 rounded-lg font-bold transition-all duration-300"
                    >
                      ☎ {contactDetails.phone}
                    </a>

                  </div>

                </div>

              </div>
            )}

            {/* ==================================================
                PAYMENT NOTICE
            ================================================== */}
            <div className="text-center mt-10">

              <p className="text-xs text-gray-400 uppercase tracking-widest">
                Secure payment integration ready for backend connection
              </p>

              <p className="text-xs text-gray-500 mt-2">
                Paystack • Bank Transfer • USSD • PalmPay • Opay • Moniepoint
              </p>

            </div>

          </div>
        </section>

        {/* ======================================================
            6. FOOTER
        ====================================================== */}

        {/* ============================================================
            DEDICATED SUPPORT PAGE LINK
        ============================================================ */}
        <section className="px-4 sm:px-6 lg:px-8 pb-10">
          <div className="max-w-5xl mx-auto rounded-3xl border border-orange-500/20 bg-black/75 backdrop-blur-md p-6 sm:p-8 text-center shadow-2xl">
            <p className="text-[10px] uppercase tracking-[0.3em] text-orange-400 font-black">
              J-Town Hoops Support Center
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white">
              Want the complete support and payment experience?
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-sm text-neutral-400 leading-relaxed">
              Open the dedicated Support Us page for support amounts, currencies,
              payment methods and future backend payment integration.
            </p>
            <button
              type="button"
              onClick={() => navigate("/support")}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-orange-500 px-7 py-3.5 text-xs font-black uppercase tracking-wider text-black hover:bg-orange-400 transition"
            >
              Open Support Us Page
            </button>
          </div>
        </section>

        <footer className="px-6 py-10 text-center bg-black/85 border-t border-white/10">

          <div className="max-w-5xl mx-auto">

            <div className="text-orange-500 text-3xl mb-3">
              🏀
            </div>

            <h3 className="text-xl font-black uppercase">
              J-Town Hoops
            </h3>

            <p className="text-sm text-gray-400 mt-3">
              Mission of J-Town Hoops:
            </p>

            <p className="text-orange-400 font-bold mt-1">
              Education and Integrity through Sports
            </p>

            <div className="w-16 h-px bg-orange-500 mx-auto my-6"></div>

            <p className="text-xs text-gray-500 uppercase tracking-widest">
              © 2026 J-Town Hoops Arena Hub
            </p>

          </div>

        </footer>

      </div>
    </div>
  );
};

export default AboutUs;