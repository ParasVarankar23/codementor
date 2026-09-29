"use client";

import Navbar from "@/components/landing/Navbar";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import {
  FaCheck,
  FaCrown,
  FaRocket,
  FaCode,
} from "react-icons/fa";

export default function PricingPage() {
  const { theme } = useTheme();
  const router = useRouter();

  const plans = [
    {
      name: "Free",
      description: "Start learning and exploring CodeMentor AI.",
      price: "₹0",
      period: "/month",
      icon: <FaCode />,
      popular: false,

      features: [
        "Basic AI code assistance",
        "5 AI questions per day",
        "Basic code debugging",
        "Learning roadmap",
        "Basic coding practice",
      ],

      buttonText: "Get Started",
      buttonStyle:
        "border border-[var(--border)] bg-[var(--surface)] hover:border-indigo-500",
    },

    {
      name: "Pro",
      description: "For students and developers who want more.",
      price: "₹199",
      period: "/month",
      icon: <FaRocket />,
      popular: true,

      features: [
        "Unlimited AI questions",
        "Advanced code debugging",
        "AI code explanations",
        "Personalized learning roadmap",
        "Coding practice",
        "Chat history",
        "Voice-enabled learning",
        "Priority AI assistance",
      ],

      buttonText: "Start Pro",
      buttonStyle:
        "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30",
    },

    {
      name: "Premium",
      description: "For serious learners and developers.",
      price: "₹399",
      period: "/month",
      icon: <FaCrown />,
      popular: false,

      features: [
        "Everything in Pro",
        "Advanced AI assistance",
        "Unlimited code analysis",
        "Advanced learning roadmap",
        "Voice coding assistant",
        "Advanced practice problems",
        "Progress tracking",
        "Priority support",
      ],

      buttonText: "Choose Premium",
      buttonStyle:
        "border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20",
    },
  ];

  return (
    <div
      className="min-h-screen"
      data-theme={theme}
      style={{
        backgroundColor: "var(--page-background)",
        color: "var(--text-primary)",
      }}
    >
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">

        {/* Header */}
        <section className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-500">
            <FaRocket />
            Simple & Flexible Pricing
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              Learning Plan
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
            Start for free and upgrade whenever you need more powerful
            AI-powered coding and learning features.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="grid gap-6 lg:grid-cols-3 lg:items-stretch">

          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 sm:p-8 ${plan.popular
                  ? "border-indigo-500/60 bg-[var(--surface)] shadow-xl shadow-indigo-500/10"
                  : "border-[var(--border)] bg-[var(--surface)] hover:-translate-y-1 hover:border-indigo-500/40"
                }`}
            >

              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                  <div className="whitespace-nowrap rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/20">
                    MOST POPULAR
                  </div>
                </div>
              )}

              {/* Plan Icon */}
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${plan.popular
                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
                    : "bg-indigo-500/10 text-indigo-500"
                  }`}
              >
                {plan.icon}
              </div>

              {/* Plan Name */}
              <h2 className="text-2xl font-bold">
                {plan.name}
              </h2>

              <p className="mt-2 min-h-[48px] text-sm leading-6 text-[var(--text-secondary)]">
                {plan.description}
              </p>

              {/* Price */}
              <div className="mt-7 flex items-end gap-1">
                <span className="text-4xl font-bold">
                  {plan.price}
                </span>

                <span className="mb-1 text-sm text-[var(--text-muted)]">
                  {plan.period}
                </span>
              </div>

              {/* Divider */}
              <div className="my-7 h-px bg-[var(--border)]" />

              {/* Features */}
              <div className="flex-1 space-y-4">
                {plan.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10">
                      <FaCheck className="text-[10px] text-indigo-500" />
                    </div>

                    <span className="text-sm leading-5 text-[var(--text-secondary)]">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Button */}
              <button
                onClick={() => {
                  if (plan.name === "Free") {
                    router.push("/problem-solver");
                  } else {
                    router.push("/login");
                  }
                }}
                className={`mt-8 flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </section>

        {/* Bottom Note */}
        <section className="mt-12 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            No complicated setup. Start learning with CodeMentor AI today.
          </p>
        </section>

      </main>
    </div>
  );
}