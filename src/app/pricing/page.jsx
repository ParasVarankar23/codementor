// app/pricing/page.jsx
"use client";

import Navbar from "@/components/landing/Navbar";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { FaArrowRight, FaCheck, FaCreditCard, FaCrown, FaLock, FaRocket, FaShieldAlt, FaStar, FaTimes } from "react-icons/fa";

export default function PricingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "per month",
      description: "Explore the product and power small, personal projects.",
      icon: <FaRocket className="text-blue-400" />,
      gradient: "from-blue-500/20 to-cyan-500/20",
      borderGradient: "from-blue-500 to-cyan-500",
      features: [
        { name: "500 Encrypts", included: true },
        { name: "500 Decrypts", included: true },
        { name: "250 Cage Runs", included: true },
      ],
      buttonText: "Get Started",
      buttonGradient: "from-blue-500 to-cyan-500",
      popular: false
    },
    {
      name: "Pro",
      price: "$395",
      period: "per month",
      description: "Run production apps with full functionality.",
      icon: <FaCrown className="text-[#FF5A1F]" />,
      gradient: "from-[#FF5A1F]/20 to-[#d93d0b]/20",
      borderGradient: "from-[#FF5A1F] to-[#d93d0b]",
      features: [
        { name: "Unlimited Encrypts", included: true },
        { name: "5,000 Decrypts", included: true, extra: "Then $0.02 per Decrypt" },
        { name: "2,500 Cage Runs", included: true, extra: "Then $0.04 per Cage Run" },
      ],
      buttonText: "Start Free Trial",
      secondaryButton: "Contact Sales",
      buttonGradient: "from-[#FF5A1F] to-[#d93d0b]",
      popular: true,
      trial: "Try Pro for free with a 30-day trial."
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "Run compliant production apps with full functionality, onboarding and support.",
      icon: <FaShieldAlt className="text-purple-400" />,
      gradient: "from-purple-500/20 to-pink-500/20",
      borderGradient: "from-purple-500 to-pink-500",
      features: [
        { name: "Unlimited Encrypts", included: true },
        { name: "Custom Decrypts", included: true },
        { name: "Custom Cage Runs", included: true },
        { name: "Fast-tracked PCI & HIPAA", included: true },
      ],
      buttonText: "Contact Sales",
      buttonGradient: "from-purple-500 to-pink-500",
      popular: false
    }
  ];

  const comparisonFeatures = [
    { name: "Encrypts included", free: "500 p/m", pro: "Unlimited", enterprise: "Unlimited" },
    { name: "Decrypts included", free: "500 p/m", pro: "5,000 p/m", enterprise: "Custom" },
    { name: "Cage Runs included", free: "250 p/m", pro: "2,500 p/m", enterprise: "Custom" },
    { name: "Multiple Users per Team", free: false, pro: true, enterprise: true },
    { name: "Multiple Teams", free: false, pro: true, enterprise: true },
    { name: "Compliance Onboarding", free: false, pro: false, enterprise: true },
    { name: "Solutions Engineer Support", free: false, pro: false, enterprise: true },
    { name: "Dedicated Account Manager", free: false, pro: false, enterprise: true },
    { name: "SLA for 99.99% Uptime", free: false, pro: false, enterprise: true },
    { name: "Email Support", free: true, pro: true, enterprise: true },
    { name: "Advanced Support Scope", free: false, pro: false, enterprise: true },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: "#0B0B0F" }}>
      <Navbar />
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#FF5A1F] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-4000"></div>

        {/* Grid overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,90,31,0.05) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mt-5 mx-auto px-4 py-20">
        {/* Header with glass effect */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF5A1F] via-[#be6747] to-[#d93d0b] blur-2xl opacity-30"></div>
              <h1 className="relative text-6xl md:text-7xl font-bold">
                <span className="bg-gradient-to-r from-[#FF5A1F] via-[#f47b4e] to-[#d93d0b] bg-clip-text text-transparent">
                  Pricing
                </span>
              </h1>
            </div>
          </div>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Safely collect, process, and share your data with the plan that's right for you.
          </p>

          {/* Decorative line */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-16 h-1 bg-gradient-to-r from-[#FF5A1F] to-transparent rounded-full"></div>
            <div className="w-4 h-1 bg-[#FF5A1F] rounded-full"></div>
            <div className="w-16 h-1 bg-gradient-to-l from-[#FF5A1F] to-transparent rounded-full"></div>
          </div>
        </div>

        {/* Pricing Cards with Glass Effect */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${plan.borderGradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>

              {/* Card */}
              <div className={`relative h-full backdrop-blur-xl bg-[#1a1c22]/80 rounded-2xl border ${plan.popular
                  ? 'border-transparent bg-gradient-to-r p-[2px]'
                  : 'border-[#2a2e3a] hover:border-[#FF5A1F]/30'
                } transition-all duration-500 overflow-hidden`}>

                {plan.popular && (
                  <>
                    <div className={`absolute inset-0 bg-gradient-to-r ${plan.borderGradient} rounded-2xl`}></div>
                    <div className="absolute inset-0 bg-[#1a1c22] rounded-2xl m-[1px]"></div>
                  </>
                )}

                <div className={`relative p-8 ${plan.popular ? 'bg-[#1a1c22] rounded-2xl' : ''}`}>
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] blur-md opacity-50"></div>
                        <div className="relative bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl flex items-center gap-1">
                          <FaStar className="text-xs" />
                          MOST POPULAR
                          <FaStar className="text-xs" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Icon with gradient background */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} backdrop-blur-xl border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-3xl">{plan.icon}</div>
                  </div>

                  {/* Title and price */}
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{plan.price}</span>
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-8 leading-relaxed">{plan.description}</p>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 group/feature">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FF5A1F]/20 to-[#d93d0b]/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/feature:scale-110 transition-transform">
                          <FaCheck className="text-[#FF5A1F] text-xs" />
                        </div>
                        <div>
                          <span className="text-gray-300 text-sm font-medium">{feature.name}</span>
                          {feature.extra && (
                            <span className="text-gray-500 text-xs block mt-1">{feature.extra}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Trial message */}
                  {plan.trial && (
                    <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-[#FF5A1F]/10 to-[#d93d0b]/10 border border-[#FF5A1F]/20 backdrop-blur-sm">
                      <p className="text-xs text-gray-300 text-center">{plan.trial}</p>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push(plan.name === "Enterprise" ? "/contact" : "/")}
                      className={`group/btn relative w-full px-4 py-3.5 rounded-xl font-semibold overflow-hidden transition-all duration-300 ${plan.popular
                          ? 'hover:scale-105 shadow-lg shadow-[#FF5A1F]/25'
                          : 'hover:scale-105'
                        }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${plan.buttonGradient} opacity-100 group-hover/btn:opacity-90 transition-opacity`}></div>
                      <span className="relative flex items-center justify-center gap-2 text-white">
                        {plan.buttonText}
                        <FaArrowRight className="text-xs group-hover/btn:translate-x-1 transition-transform" />
                      </span>
                    </button>

                    {plan.secondaryButton && (
                      <button
                        onClick={() => router.push("/contact")}
                        className="w-full px-4 py-3 rounded-xl border border-[#2a2e3a] text-gray-300 hover:bg-white/5 hover:border-[#FF5A1F]/30 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-2 group/sec"
                      >
                        {plan.secondaryButton}
                        <FaArrowRight className="text-xs opacity-0 group-hover/sec:opacity-100 group-hover/sec:translate-x-1 transition-all" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compare Plans with Glass Effect */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] bg-clip-text text-transparent">
                Compare plans
              </span>
            </h2>
            <p className="text-gray-400">Find one that's right for you</p>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative backdrop-blur-xl bg-[#1a1c22]/80 rounded-2xl border border-[#2a2e3a] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2e3a]">
                      <th className="text-left p-6 text-white font-semibold bg-gradient-to-r from-transparent to-[#FF5A1F]/5">Features</th>
                      <th className="text-center p-6 text-white font-semibold bg-gradient-to-b from-blue-500/10 to-transparent">Free</th>
                      <th className="text-center p-6 text-white font-semibold bg-gradient-to-b from-[#FF5A1F]/20 to-transparent relative">
                        <div className="absolute inset-x-0 -top-3 flex justify-center">

                        </div>
                        Pro
                      </th>
                      <th className="text-center p-6 text-white font-semibold bg-gradient-to-b from-purple-500/10 to-transparent">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, index) => (
                      <tr
                        key={index}
                        className="border-b border-[#2a2e3a] last:border-0 hover:bg-white/5 transition-colors duration-300"
                      >
                        <td className="p-6 text-gray-300 font-medium">{feature.name}</td>
                        <td className="text-center p-6">
                          {typeof feature.free === 'boolean' ? (
                            <div className="flex justify-center">
                              {feature.free ? (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                                  <FaCheck className="text-green-500 text-xs" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                                  <FaTimes className="text-gray-600 text-xs" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300 font-medium">{feature.free}</span>
                          )}
                        </td>
                        <td className="text-center p-6 bg-gradient-to-r from-[#FF5A1F]/5 to-transparent">
                          {typeof feature.pro === 'boolean' ? (
                            <div className="flex justify-center">
                              {feature.pro ? (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF5A1F]/20 to-[#d93d0b]/20 flex items-center justify-center">
                                  <FaCheck className="text-[#FF5A1F] text-xs" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                                  <FaTimes className="text-gray-600 text-xs" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300 font-medium">{feature.pro}</span>
                          )}
                        </td>
                        <td className="text-center p-6">
                          {typeof feature.enterprise === 'boolean' ? (
                            <div className="flex justify-center">
                              {feature.enterprise ? (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                  <FaCheck className="text-purple-500 text-xs" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                                  <FaTimes className="text-gray-600 text-xs" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300 font-medium">{feature.enterprise}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Cards with Glass Effect */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {/* PCI DSS */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative backdrop-blur-xl bg-[#1a1c22]/80 rounded-2xl p-8 border border-[#2a2e3a] hover:border-blue-500/30 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                    <FaCreditCard className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">PCI DSS</h3>
                    <span className="text-xs text-gray-500">Payment Card Industry</span>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Included with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold">Enterprise</span> plans. Any organisation that accepts or processes payment cards must validate compliance with PCI DSS. Evervault does the heavy lifting for PCI compliance allowing you to stay focused on building your core product.
                </p>
                <button
                  onClick={() => router.push("/contact")}
                  className="group/btn inline-flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold hover:gap-3 transition-all"
                >
                  Contact Sales
                  <FaArrowRight className="text-blue-500 text-xs group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* PII & HIPAA */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative backdrop-blur-xl bg-[#1a1c22]/80 rounded-2xl p-8 border border-[#2a2e3a] hover:border-purple-500/30 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
                    <FaLock className="text-white text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">PII & HIPAA</h3>
                    <span className="text-xs text-gray-500">Data Privacy & Healthcare</span>
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Included with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] font-semibold">All</span> plans. Use Evervault to secure, process, and transmit Personally Identifiable Information (GDPR) and ePHI (HIPAA).
                </p>
                <button
                  onClick={() => router.push("/contact")}
                  className="group/btn inline-flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 font-semibold hover:gap-3 transition-all"
                >
                  Contact Sales
                  <FaArrowRight className="text-purple-500 text-xs group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Glass Effect */}
        <footer className="relative mt-20">
          <div className="absolute inset-0 bg-gradient-to-t from-[#FF5A1F]/5 to-transparent rounded-3xl"></div>
          <div className="relative backdrop-blur-xl bg-[#1a1c22]/40 rounded-3xl border border-[#2a2e3a] p-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-2xl font-bold bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] bg-clip-text text-transparent mb-4">CodeMentor AI</h4>
                <p className="text-gray-500 text-sm">Intelligent coding assistance for everyone</p>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-4">Resources</h5>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-500 hover:text-[#FF5A1F] transition-colors flex items-center gap-2 group">Documentation <FaArrowRight className="text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" /></a></li>
                  <li><a href="#" className="text-gray-500 hover:text-[#FF5A1F] transition-colors flex items-center gap-2 group">API Reference <FaArrowRight className="text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" /></a></li>
                  <li><a href="#" className="text-gray-500 hover:text-[#FF5A1F] transition-colors flex items-center gap-2 group">Blog <FaArrowRight className="text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" /></a></li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-4">Legal</h5>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-500 hover:text-[#FF5A1F] transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="text-gray-500 hover:text-[#FF5A1F] transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-500 hover:text-[#FF5A1F] transition-colors">Cookies Policy</a></li>
                  <li><a href="#" className="text-gray-500 hover:text-[#FF5A1F] transition-colors">Data Processing Agreement</a></li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-semibold mb-4">Company</h5>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-500 hover:text-[#FF5A1F] transition-colors">About</a></li>
                  <li><a href="#" className="text-gray-500 hover:text-[#FF5A1F] transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="text-center text-gray-600 text-sm mt-12 pt-8 border-t border-[#2a2e3a]">
              © 2024 CodeMentor AI. All rights reserved.
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}