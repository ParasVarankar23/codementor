"use client";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Check,
  ChevronRight,
  Code2,
  Gauge,
  GitBranch,
  Heart,
  LineChart,
  Mic,
  Moon,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { useTheme } from "@/context/ThemeContext";
import Header from "@/components/Header";

export default function Home() {
  const { mode } = useTheme();

  return (
    <main
      className="
                min-h-screen
                overflow-hidden
                bg-zinc-950
                text-white
                transition-colors duration-300

                light:bg-white
                light:text-zinc-950
            "
    >
      <Header />

      {/* =========================================
                HERO
            ========================================= */}

      <section className="relative flex min-h-screen items-center justify-center px-6 pt-28">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="
                            absolute left-1/2 top-0
                            h-[600px] w-[900px]
                            -translate-x-1/2
                            rounded-full
                            bg-white/[0.035]
                            blur-[120px]

                            light:bg-zinc-200/60
                        "
          />

          <div
            className="
                            absolute left-[15%] top-[30%]
                            h-2 w-2
                            rounded-full
                            bg-white/30
                            shadow-[0_0_25px_8px_rgba(255,255,255,0.08)]

                            light:bg-black/20
                        "
          />

          <div
            className="
                            absolute right-[18%] top-[25%]
                            h-2 w-2
                            rounded-full
                            bg-white/30
                            shadow-[0_0_25px_8px_rgba(255,255,255,0.08)]

                            light:bg-black/20
                        "
          />

          <div
            className="
                            absolute bottom-[15%] left-[30%]
                            h-1.5 w-1.5
                            rounded-full
                            bg-white/20
                        "
          />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div
            className="
                            mx-auto mb-8
                            inline-flex items-center gap-2
                            rounded-full
                            border border-zinc-700
                            bg-zinc-900/70
                            px-5 py-2
                            text-xs font-medium
                            uppercase tracking-[0.3em]
                            text-zinc-300
                            backdrop-blur

                            light:border-zinc-300
                            light:bg-zinc-100
                            light:text-zinc-600
                        "
          >
            <Sparkles size={14} />
            AI CODE MENTOR
          </div>

          {/* Heading */}
          <h1
            className="
                            text-5xl font-bold
                            leading-[1.05]
                            tracking-tight
                            sm:text-6xl
                            md:text-7xl
                            lg:text-8xl
                        "
          >
            Transform Your
            <br />
            Coding Journey Into
            <br />

            <span className="text-zinc-400 light:text-zinc-500">
              Interactive Learning
            </span>
          </h1>

          {/* Description */}
          <p
            className="
                            mx-auto mt-8
                            max-w-3xl
                            text-lg
                            leading-8
                            text-zinc-400
                            md:text-xl

                            light:text-zinc-600
                        "
          >
            An AI voice-enabled coding mentor that helps you
            debug, learn, and improve your code in real-time with
            live explanations.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/editor"
              className="
                                group
                                flex items-center gap-3
                                rounded-xl
                                bg-white
                                px-7 py-4
                                font-semibold
                                text-black
                                shadow-xl
                                transition-all
                                hover:-translate-y-1
                                hover:bg-zinc-200

                                light:bg-black
                                light:text-white
                                light:hover:bg-zinc-800
                            "
            >
              <Rocket size={19} />

              Start Coding Free

              <ArrowRight
                size={18}
                className="
                                    transition-transform
                                    group-hover:translate-x-1
                                "
              />
            </a>

            <a
              href="#features"
              className="
                                flex items-center gap-3
                                rounded-xl
                                border border-zinc-700
                                bg-zinc-900/50
                                px-7 py-4
                                font-semibold
                                text-white
                                backdrop-blur
                                transition-all
                                hover:-translate-y-1
                                hover:bg-zinc-800

                                light:border-zinc-300
                                light:bg-white
                                light:text-black
                                light:hover:bg-zinc-100
                            "
            >
              <BookOpen size={19} />

              Start Learning
            </a>
          </div>

          {/* Trust */}
          <div
            className="
                            mt-8
                            flex items-center justify-center gap-2
                            text-sm text-zinc-500
                        "
          >
            <span className="h-2 w-2 rounded-full bg-zinc-400" />
            No credit card required
            <span>•</span>
            Start learning in seconds
          </div>
        </div>
      </section>

      {/* =========================================
                FEATURES
            ========================================= */}

      <section
        id="features"
        className="relative px-6 py-28"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            badge="SMART LEARNING SYSTEM"
            title="Learn, Debug & Build Smarter"
            description="Your personal AI tutor that explains, corrects, and improves your code step-by-step."
          />

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<Code2 />}
              title="Live Code Debugging"
              description="Analyze existing code and get instant AI explanations and corrections."
            />

            <FeatureCard
              icon={<Mic />}
              title="Voice Interactive Tutor"
              description="Ask doubts while the AI speaks. Interrupt and clarify in real-time."
            />

            <FeatureCard
              icon={<BarChart3 />}
              title="Skill Level System"
              description="Choose beginner to advanced levels across modern programming technologies."
            />
          </div>
        </div>
      </section>

      {/* =========================================
                CODE ANALYTICS
            ========================================= */}

      <section className="px-6 py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div>
            <Badge>CODE INSIGHTS</Badge>

            <h2 className="mt-7 text-5xl font-bold tracking-tight md:text-6xl">
              Smarter Code
              <br />
              <span className="text-zinc-400 light:text-zinc-500">
                Improvements
              </span>
            </h2>

            <p
              className="
                                mt-7
                                max-w-xl
                                text-lg
                                leading-8
                                text-zinc-400

                                light:text-zinc-600
                            "
            >
              AI analyzes your logic, structure, and performance
              to suggest optimized solutions instantly.
            </p>

            <div className="mt-10 space-y-5">
              <ListItem
                icon={<LineChart />}
                text="Real-time Code Analysis"
              />

              <ListItem
                icon={<Rocket />}
                text="Performance Optimization Suggestions"
              />

              <ListItem
                icon={<ShieldCheck />}
                text="Security Best Practices"
              />
            </div>
          </div>

          <AnalyticsCard />
        </div>
      </section>

      {/* =========================================
                EFFICIENCY
            ========================================= */}

      <section className="px-6 py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <PerformanceCard />

          <div>
            <Badge>AUTOMATED LEARNING</Badge>

            <h2 className="mt-7 text-5xl font-bold tracking-tight md:text-6xl">
              Accelerated
              <br />
              <span className="text-zinc-400 light:text-zinc-500">
                Learning Efficiency
              </span>
            </h2>

            <p
              className="
                                mt-7
                                text-lg
                                leading-8
                                text-zinc-400
                                light:text-zinc-600
                            "
            >
              Spend less time stuck. Learn faster with AI
              guidance and live correction.
            </p>

            <div className="mt-10 space-y-5">
              <ListItem
                icon={<ShieldCheck />}
                text="Automated Error Detection"
              />

              <ListItem
                icon={<Rocket />}
                text="Live Refactoring Suggestions"
              />

              <ListItem
                icon={<LineChart />}
                text="Performance Analytics"
              />
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4">
              <StatBox
                value="10x"
                label="Faster Learning"
              />

              <StatBox
                value="24/7"
                label="AI Availability"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
                STUDENT INSIGHTS
            ========================================= */}

      <section className="px-6 py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div>
            <Badge>STUDENT INSIGHTS</Badge>

            <h2 className="mt-7 text-5xl font-bold tracking-tight md:text-6xl">
              Enhanced
              <br />
              <span className="text-zinc-400 light:text-zinc-500">
                Learning Experience
              </span>
            </h2>

            <p
              className="
                                mt-7
                                max-w-xl
                                text-lg
                                leading-8
                                text-zinc-400
                                light:text-zinc-600
                            "
            >
              Track your improvement journey and coding mastery
              over time with personalized insights and progress
              tracking.
            </p>

            <div className="mt-10 space-y-5">
              <ListItem
                icon={<Heart />}
                text="Personalized Learning Paths"
              />

              <ListItem
                icon={<Users />}
                text="Sentiment & Confidence Tracking"
              />

              <ListItem
                icon={<TrendingUp />}
                text="Skill Progress Analytics"
              />

              <ListItem
                icon={<Users />}
                text="Peer Comparison Metrics"
              />
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3">
              <StatBox
                value="95%"
                label="Satisfaction"
              />

              <StatBox
                value="10k+"
                label="Students"
              />

              <StatBox
                value="4.9★"
                label="Rating"
              />
            </div>
          </div>

          <ConfidenceCard />
        </div>
      </section>

      {/* =========================================
                CODING ENVIRONMENTS
            ========================================= */}

      <section
        id="practice"
        className="px-6 py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <Badge>TAKE FULL CONTROL OF YOUR LEARNING</Badge>

            <h2 className="mt-7 text-5xl font-bold tracking-tight md:text-6xl">
              Ready-to-use{" "}
              <span className="text-zinc-400 light:text-zinc-500">
                Coding Environments
              </span>
            </h2>

            <p
              className="
                                mx-auto mt-6 max-w-2xl
                                text-lg text-zinc-400
                                light:text-zinc-600
                            "
            >
              Practice with structured templates and live AI
              assistance.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            <EnvironmentCard
              icon={<Code2 />}
              title="Beginner Playground"
              description="Practice HTML & CSS basics with guided AI hints."
              items={[
                "HTML5 & CSS3 fundamentals",
                "Live preview",
                "AI hints on hover",
              ]}
            />

            <EnvironmentCard
              icon={<Terminal />}
              title="JavaScript Lab"
              description="Interactive JS debugging and logic building."
              items={[
                "ES6+ features",
                "Console playground",
                "AI debugging",
              ]}
            />

            <EnvironmentCard
              icon={<GitBranch />}
              title="React / Next Studio"
              description="Build modern applications with live mentor guidance."
              items={[
                "Component playground",
                "Next.js ready",
                "AI pair programming",
              ]}
            />
          </div>
        </div>
      </section>

      {/* =========================================
                CTA
            ========================================= */}

      <section className="px-6 py-32">
        <div
          className="
                        relative mx-auto max-w-6xl
                        overflow-hidden
                        rounded-3xl
                        border border-zinc-800
                        bg-zinc-900
                        px-6 py-24
                        text-center

                        light:border-zinc-200
                        light:bg-zinc-50
                    "
        >
          <div
            className="
                            pointer-events-none
                            absolute left-1/2 top-0
                            h-64 w-[600px]
                            -translate-x-1/2
                            rounded-full
                            bg-white/[0.04]
                            blur-[100px]

                            light:bg-zinc-300/40
                        "
          />

          <div className="relative">
            <Badge>START YOUR CODING JOURNEY TODAY</Badge>

            <h2
              className="
                                mx-auto mt-8
                                max-w-4xl
                                text-4xl font-bold
                                leading-tight
                                md:text-6xl
                            "
            >
              Unlock the power of{" "}
              <span className="text-zinc-400 light:text-zinc-500">
                AI mentorship
              </span>{" "}
              and master programming faster.
            </h2>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/editor"
                className="
                                    flex items-center justify-center gap-3
                                    rounded-xl
                                    bg-white
                                    px-8 py-4
                                    font-semibold
                                    text-black
                                    transition
                                    hover:bg-zinc-200

                                    light:bg-black
                                    light:text-white
                                    light:hover:bg-zinc-800
                                "
              >
                <Rocket size={19} />
                Start Coding Free
                <ArrowRight size={18} />
              </a>

              <a
                href="#features"
                className="
                                    flex items-center justify-center gap-3
                                    rounded-xl
                                    border border-zinc-700
                                    px-8 py-4
                                    font-semibold
                                    transition
                                    hover:bg-zinc-800

                                    light:border-zinc-300
                                    light:hover:bg-zinc-100
                                "
              >
                <Mic size={19} />
                Start Learning
              </a>
            </div>

            <p className="mt-7 text-sm text-zinc-500">
              No credit card required • Start learning in
              seconds
            </p>
          </div>
        </div>
      </section>

      {/* =========================================
                FOOTER
            ========================================= */}

      <Footer />
    </main>
  );
}

/* =====================================================
   SECTION HEADING
===================================================== */

function SectionHeading({
  badge,
  title,
  description,
}) {
  return (
    <div className="text-center">
      <Badge>{badge}</Badge>

      <h2 className="mt-7 text-5xl font-bold tracking-tight md:text-6xl">
        {title}
      </h2>

      <p
        className="
                    mx-auto mt-6
                    max-w-2xl
                    text-lg
                    leading-8
                    text-zinc-400
                    light:text-zinc-600
                "
      >
        {description}
      </p>
    </div>
  );
}

/* =====================================================
   BADGE
===================================================== */

function Badge({ children }) {
  return (
    <div
      className="
                inline-flex
                rounded-full
                border border-zinc-700
                bg-zinc-900
                px-5 py-2
                text-xs font-medium
                uppercase tracking-[0.25em]
                text-zinc-400

                light:border-zinc-300
                light:bg-zinc-100
                light:text-zinc-600
            "
    >
      {children}
    </div>
  );
}

/* =====================================================
   FEATURE CARD
===================================================== */

function FeatureCard({
  icon,
  title,
  description,
}) {
  return (
    <div
      className="
                group
                rounded-3xl
                border border-zinc-800
                bg-zinc-900/60
                p-10
                text-center
                transition-all duration-300
                hover:-translate-y-2
                hover:border-zinc-600
                hover:bg-zinc-900

                light:border-zinc-200
                light:bg-zinc-50
                light:hover:border-zinc-400
                light:hover:bg-white
            "
    >
      <div
        className="
                    mx-auto flex h-20 w-20
                    items-center justify-center
                    rounded-full
                    border border-zinc-700
                    bg-zinc-950
                    text-white
                    transition
                    group-hover:scale-110

                    light:border-zinc-300
                    light:bg-white
                    light:text-black
                "
      >
        {icon}
      </div>

      <h3 className="mt-8 text-2xl font-bold">
        {title}
      </h3>

      <p
        className="
                    mt-4
                    leading-7
                    text-zinc-400
                    light:text-zinc-600
                "
      >
        {description}
      </p>
    </div>
  );
}

/* =====================================================
   LIST ITEM
===================================================== */

function ListItem({ icon, text }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="
                    flex h-10 w-10 shrink-0
                    items-center justify-center
                    rounded-xl
                    border border-zinc-800
                    bg-zinc-900
                    text-white

                    light:border-zinc-200
                    light:bg-zinc-100
                    light:text-black
                "
      >
        {icon}
      </div>

      <span className="text-lg text-zinc-300 light:text-zinc-700">
        {text}
      </span>
    </div>
  );
}

/* =====================================================
   ANALYTICS CARD
===================================================== */

function AnalyticsCard() {
  return (
    <div
      className="
                rounded-3xl
                border border-zinc-800
                bg-zinc-900
                p-8
                shadow-2xl

                light:border-zinc-200
                light:bg-zinc-50
            "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            Code Quality Score
          </p>

          <div className="mt-2 text-5xl font-bold">
            85
            <span className="ml-1 text-xl text-zinc-500">
              %
            </span>
          </div>
        </div>

        <div
          className="
                        flex h-14 w-14
                        items-center justify-center
                        rounded-full
                        bg-white
                        text-black
                    "
        >
          <LineChart />
        </div>
      </div>

      <div className="mt-10 space-y-7">
        <Progress
          label="Original Code"
          value="62%"
          width="62%"
        />

        <Progress
          label="Optimized Code"
          value="85%"
          width="85%"
        />

        <Progress
          label="Best Practice"
          value="94%"
          width="94%"
        />
      </div>

      <div className="mt-8 border-t border-zinc-800 pt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            ● Live Analysis
          </span>

          <span className="text-zinc-300">
            ↑ 23% improvement
          </span>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   PROGRESS
===================================================== */

function Progress({
  label,
  value,
  width,
}) {
  return (
    <div>
      <div className="mb-3 flex justify-between">
        <span className="text-sm text-zinc-500">
          {label}
        </span>

        <span className="text-sm font-semibold">
          {value}
        </span>
      </div>

      <div className="h-2 rounded-full bg-zinc-800">
        <div
          className="
                        h-full
                        rounded-full
                        bg-white

                        light:bg-black
                    "
          style={{ width }}
        />
      </div>
    </div>
  );
}

/* =====================================================
   PERFORMANCE CARD
===================================================== */

function PerformanceCard() {
  return (
    <div
      className="
                rounded-3xl
                border border-zinc-800
                bg-zinc-900
                p-8
                shadow-2xl

                light:border-zinc-200
                light:bg-zinc-50
            "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            Performance Metrics
          </p>

          <h3 className="mt-2 text-3xl font-bold">
            Code Efficiency
          </h3>
        </div>

        <div
          className="
                        flex h-14 w-14 items-center
                        justify-center
                        rounded-full
                        bg-white
                        text-black
                    "
        >
          <Zap />
        </div>
      </div>

      {/* Graph */}
      <div className="mt-12 flex h-44 items-end justify-center gap-28">
        <div className="h-24 w-24 rounded-t-lg bg-zinc-500" />
        <div className="h-32 w-24 rounded-t-lg bg-white light:bg-black" />
      </div>

      <Metric
        icon={<Rocket />}
        title="Automated Refactor"
        value="84% faster"
        percentage="84%"
      />

      <Metric
        icon={<ShieldCheck />}
        title="Error Detection Rate"
        value="↑ 42%"
        percentage="42%"
      />

      <p className="mt-8 text-sm text-zinc-500">
        ● Live performance tracking • Updated in real-time
      </p>
    </div>
  );
}

function Metric({
  icon,
  title,
  value,
  percentage,
}) {
  return (
    <div
      className="
                mt-5
                rounded-2xl
                border border-zinc-800
                bg-zinc-950
                p-5

                light:border-zinc-200
                light:bg-white
            "
    >
      <div className="flex items-center gap-4">
        <div className="text-zinc-300 light:text-zinc-700">
          {icon}
        </div>

        <span className="flex-1 text-zinc-300 light:text-zinc-700">
          {title}
        </span>

        <strong>{value}</strong>
      </div>

      <div className="mt-4 h-2 rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-white light:bg-black"
          style={{
            width: percentage,
          }}
        />
      </div>
    </div>
  );
}

/* =====================================================
   STAT BOX
===================================================== */

function StatBox({ value, label }) {
  return (
    <div
      className="
                rounded-2xl
                border border-zinc-800
                bg-zinc-900
                p-5
                text-center

                light:border-zinc-200
                light:bg-zinc-50
            "
    >
      <div className="text-3xl font-bold">
        {value}
      </div>

      <div className="mt-1 text-sm text-zinc-500">
        {label}
      </div>
    </div>
  );
}

/* =====================================================
   CONFIDENCE CARD
===================================================== */

function ConfidenceCard() {
  return (
    <div
      className="
                rounded-3xl
                border border-zinc-800
                bg-zinc-900
                p-8

                light:border-zinc-200
                light:bg-zinc-50
            "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">
            Student Progress
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            Confidence Distribution
          </h3>
        </div>

        <div
          className="
                        flex h-14 w-14
                        items-center justify-center
                        rounded-full
                        bg-white
                        text-black
                    "
        >
          <TrendingUp />
        </div>
      </div>

      {/* Circle */}
      <div className="relative mx-auto mt-10 flex h-64 w-64 items-center justify-center">
        <div
          className="
                        absolute inset-0
                        rounded-full
                        border-[12px]
                        border-zinc-700
                    "
        />

        <div
          className="
                        absolute inset-0
                        rounded-full
                        border-[12px]
                        border-transparent
                        border-t-white
                        border-r-white
                        border-b-white
                        rotate-45
                    "
        />

        <div className="text-center">
          <div className="text-5xl font-bold">
            70%
          </div>

          <div className="mt-2 text-zinc-500">
            Confidence
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        <div>
          <strong className="text-xl">70%</strong>
          <p className="text-sm text-zinc-500">
            Confident
          </p>
        </div>

        <div>
          <strong className="text-xl">20%</strong>
          <p className="text-sm text-zinc-500">
            Improved
          </p>
        </div>

        <div>
          <strong className="text-xl">10%</strong>
          <p className="text-sm text-zinc-500">
            Practice
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex justify-between text-sm">
          <span className="text-zinc-500">
            Overall Mastery
          </span>

          <strong>70%</strong>
        </div>

        <div className="h-2 rounded-full bg-zinc-800">
          <div className="h-full w-[70%] rounded-full bg-white light:bg-black" />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   ENVIRONMENT CARD
===================================================== */

function EnvironmentCard({
  icon,
  title,
  description,
  items,
}) {
  return (
    <div
      className="
                group
                flex min-h-[440px]
                flex-col
                rounded-3xl
                border border-zinc-800
                bg-zinc-900
                p-10

                light:border-zinc-200
                light:bg-zinc-50
            "
    >
      <div
        className="
                    flex h-16 w-16
                    items-center justify-center
                    rounded-full
                    border border-zinc-700
                    bg-zinc-950
                    text-white

                    light:border-zinc-300
                    light:bg-white
                    light:text-black
                "
      >
        {icon}
      </div>

      <h3 className="mt-8 text-2xl font-bold">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-zinc-400 light:text-zinc-600">
        {description}
      </p>

      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-3 text-zinc-500"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white light:bg-black" />
            {item}
          </li>
        ))}
      </ul>

      <a
        href="/editor"
        className="
                    mt-auto
                    flex items-center justify-center gap-2
                    rounded-full
                    border border-zinc-700
                    py-3
                    font-semibold
                    transition
                    hover:bg-white
                    hover:text-black

                    light:border-zinc-300
                    light:hover:bg-black
                    light:hover:text-white
                "
      >
        Get Started Free
        <ArrowRight size={17} />
      </a>
    </div>
  );
}

/* =====================================================
   FOOTER
===================================================== */

function Footer() {
  return (
    <footer
      className="
                border-t border-zinc-800
                px-6 py-16

                light:border-zinc-200
            "
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div
                className="
                                    flex h-10 w-10
                                    items-center justify-center
                                    rounded-xl
                                    bg-white
                                    text-black

                                    light:bg-black
                                    light:text-white
                                "
              >
                <Code2 size={21} />
              </div>

              <span className="text-2xl font-bold">
                CodeMentor
              </span>
            </div>

            <p className="mt-5 max-w-sm text-zinc-500">
              AI-powered coding mentorship for developers who
              want to learn, build, debug, and improve faster.
            </p>

            <p className="mt-8 text-sm text-zinc-600">
              © 2026 CodeMentor AI. All rights reserved.
            </p>
          </div>

          <FooterColumn
            title="Company"
            links={[
              "About",
              "Careers",
            ]}
          />

          <FooterColumn
            title="Product"
            links={[
              "Features",
              "Pricing",
            ]}
          />

          <FooterColumn
            title="Developers"
            links={[
              "Docs",
              "API",
            ]}
          />
        </div>

        <div className="mt-14 flex justify-between border-t border-zinc-800 pt-8 light:border-zinc-200">
          <div className="flex gap-6 text-sm text-zinc-500">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>

          <div className="flex gap-4 text-zinc-500">
            <span>𝕏</span>
            <span>◈</span>
            <span>↗</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="font-semibold">
        {title}
      </h4>

      <div className="mt-5 space-y-4">
        {links.map((link) => (
          <a
            key={link}
            href="#"
            className="
                            block
                            text-zinc-500
                            transition
                            hover:text-white

                            light:hover:text-black
                        "
          >
            {link}
          </a>
        ))}
      </div>
    </div>
  );
}