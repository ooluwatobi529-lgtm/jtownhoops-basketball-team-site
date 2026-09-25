import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Copy,
  CreditCard,
  HeartHandshake,
  Landmark,
  Smartphone,
  WalletCards,
} from "lucide-react";
import myBackground from "../images/mybackground4.jpg";

const amounts = {
  NGN: ["₦1,000", "₦2,500", "₦5,000", "₦10,000", "₦25,000"],
  USD: ["$5", "$10", "$25", "$50", "$100"],
  GBP: ["£5", "£10", "£25", "£50", "£100"],
};

const methods = [
  { id: "paystack", name: "Paystack", icon: CreditCard, text: "Card and supported Paystack payment options." },
  { id: "ussd", name: "USSD", icon: Smartphone, text: "Pay with your bank's USSD service." },
  { id: "bank", name: "Bank Transfer", icon: Landmark, text: "Transfer directly to the official J-Town Hoops support account." },
  { id: "opay", name: "OPay", icon: WalletCards, text: "Support J-Town Hoops through OPay." },
  { id: "moniepoint", name: "Moniepoint", icon: Banknote, text: "Support through Moniepoint." },
  { id: "palmpay", name: "PalmPay", icon: Smartphone, text: "Support through PalmPay." },
];

export default function SupportUs() {
  const [currency, setCurrency] = useState("NGN");
  const [amount, setAmount] = useState("₦5,000");
  const [method, setMethod] = useState("paystack");
  const [copied, setCopied] = useState(false);

  const selected = methods.find((item) => item.id === method);

  const copyPlaceholder = async () => {
    // Replace with your real backend/payment account details later.
    const text = "J-Town Hoops support payment details will be connected to the backend.";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-fixed text-white"
      style={{ backgroundImage: `url(${myBackground})` }}
    >
      <div className="min-h-screen bg-black/25 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link
              to="/aboutus"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-black/70 px-4 py-2.5 text-xs font-black uppercase tracking-wider hover:border-orange-500/50"
            >
              <ArrowLeft size={16} />
              About Us
            </Link>

            <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-orange-400">
              Support Center
            </span>
          </div>

          <section className="overflow-hidden rounded-[2rem] border border-neutral-800 bg-black/75 p-6 shadow-2xl backdrop-blur-md sm:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-black shadow-xl shadow-orange-500/20">
                <HeartHandshake size={32} />
              </div>

              <h1 className="mt-6 text-3xl font-black sm:text-5xl">
                Support J-Town Hoops
              </h1>

              <p className="mt-4 text-sm leading-7 text-neutral-300 sm:text-base">
                Your support can help us develop young basketball talent,
                organize competitions and create more opportunities through sports.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <section className="rounded-3xl border border-neutral-800 bg-neutral-950/90 p-5 sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-400">
                  1. Currency
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {["NGN", "USD", "GBP"].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setCurrency(item);
                        setAmount(amounts[item][2]);
                      }}
                      className={`rounded-xl border px-3 py-3 text-xs font-black transition ${
                        currency === item
                          ? "border-orange-500 bg-orange-500 text-black"
                          : "border-neutral-800 bg-black text-neutral-300 hover:border-orange-500/40"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <p className="mt-7 text-[10px] font-black uppercase tracking-[0.25em] text-orange-400">
                  2. Amount
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {amounts[currency].map((item) => (
                    <button
                      key={item}
                      onClick={() => setAmount(item)}
                      className={`rounded-xl border px-3 py-3 text-sm font-black transition ${
                        amount === item
                          ? "border-orange-500 bg-orange-500/15 text-orange-400"
                          : "border-neutral-800 bg-black text-neutral-300 hover:border-orange-500/40"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="mt-7 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
                  <p className="text-xs text-neutral-500">Selected support</p>
                  <p className="mt-1 text-3xl font-black text-orange-400">{amount}</p>
                </div>
              </section>

              <section className="rounded-3xl border border-neutral-800 bg-neutral-950/90 p-5 sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-400">
                  3. Payment Method
                </p>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {methods.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setMethod(item.id)}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                          method === item.id
                            ? "border-orange-500 bg-orange-500/10"
                            : "border-neutral-800 bg-black hover:border-orange-500/40"
                        }`}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-orange-400">
                          <Icon size={18} />
                        </div>
                        <span className="text-xs font-black">{item.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl border border-neutral-800 bg-black p-5">
                  <p className="text-lg font-black">{selected?.name}</p>
                  <p className="mt-2 text-xs leading-6 text-neutral-400">{selected?.text}</p>

                  <div className="mt-5 rounded-xl border border-dashed border-neutral-700 bg-neutral-950 p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                      Backend-ready payment area
                    </p>
                    <p className="mt-2 text-xs leading-5 text-neutral-300">
                      We have intentionally not invented bank account, USSD or payment gateway details.
                      Your verified J-Town Hoops payment information can be connected here when we build the backend.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={copyPlaceholder}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-xs font-black uppercase tracking-wider text-black hover:bg-orange-400"
                  >
                    {copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}
                    {copied ? "Copied" : "Payment Details"}
                  </button>
                </div>
              </section>
            </div>

            <div className="mt-7 rounded-2xl border border-neutral-800 bg-black/80 p-5 text-center">
              <p className="text-sm font-black">Training talent. Building character. Creating opportunities.</p>
              <p className="mt-2 text-xs text-neutral-500">
                J-Town Hoops • Jos, Nigeria
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
