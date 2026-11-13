
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Zap,
} from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";

import { useAuth } from "../../context/AuthContext.jsx";
import { getAllJobs, getMyApplications } from "../../services/api.js";
import FullPageLoader from "../../components/common/FullPageLoader.jsx";

/* --------------------------------------------------
   Helpers
-------------------------------------------------- */

const extractArray = (response, possibleKeys = []) => {
  if (Array.isArray(response)) return response;

  const data = response?.data;

  if (Array.isArray(data)) return data;

  for (const key of possibleKeys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(response?.[key])) return response[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const normalizeStatus = (status = "") =>
  status.toLowerCase().replace(/[\s-]/g, "_");

const getStatusLabel = (status = "") => {
  const normalized = normalizeStatus(status);

  const labels = {
    applied: "Applied",
    under_review: "Under review",
    assessment: "Assessment",
    shortlisted: "Shortlisted",
    interview_scheduled: "Interview scheduled",
    selected: "Selected",
    rejected: "Not selected",
    withdrawn: "Withdrawn",
  };

  return labels[normalized] || status || "Unknown";
};

const getStatusStyle = (status = "") => {
  const normalized = normalizeStatus(status);

  const styles = {
    applied: "text-slate-300 bg-slate-400/10 border-slate-400/20",
    under_review: "text-sky-300 bg-sky-400/10 border-sky-400/20",
    assessment: "text-violet-300 bg-violet-400/10 border-violet-400/20",
    shortlisted: "text-cyan-300 bg-cyan-400/10 border-cyan-400/20",
    interview_scheduled: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    selected: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    rejected: "text-rose-300 bg-rose-400/10 border-rose-400/20",
    withdrawn: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  };

  return styles[normalized] || styles.applied;
};

const getJobFromApplication = (application) => {
  if (application?.jobId && typeof application.jobId === "object") {
    return application.jobId;
  }

  return application?.job || {};
};

const getCompany = (job) => {
  const company = job?.companyId || job?.company;

  if (company && typeof company === "object") {
    return company.name || "Company";
  }

  return job?.companyName || "Company";
};

const formatDate = (date) => {
  if (!date) return "Date not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date not available";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
};

const getFirstName = (user) => {
  const name = user?.fullname || user?.name || "there";
  return name.trim().split(" ")[0];
};

const getProfileCompletion = (user) => {
  if (!user) return 0;

  const checks = [
    Boolean(user.fullname || user.name),
    Boolean(user.email),
    Boolean(user.mobile),
    Boolean(user.avatar),
    Boolean(user.education && (
      Array.isArray(user.education)
        ? user.education.length
        : Object.keys(user.education || {}).length
    )),
    Boolean(user.skills?.length),
    Boolean(user.resumeUrl),
    Boolean(user.githubUrl || user.linkedinUrl),
    Boolean(user.projects?.length),
    Boolean(user.experience?.length),
  ];

  return Math.round(
    (checks.filter(Boolean).length / checks.length) * 100
  );
};

/* --------------------------------------------------
   Motion settings
-------------------------------------------------- */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 22,
    filter: "blur(5px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* --------------------------------------------------
   Animated number
-------------------------------------------------- */

function AnimatedNumber({ value }) {
  const motionValue = useMotionValue(0);
  const roundedValue = useTransform(motionValue, (latest) =>
    Math.round(latest)
  );

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(motionValue, Number(value) || 0, {
      duration: 1.1,
      ease: "easeOut",
      delay: 0.15,
    });

    const unsubscribe = roundedValue.on("change", (latest) => {
      setDisplayValue(latest);
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, motionValue, roundedValue]);

  return <span>{displayValue}</span>;
}

/* --------------------------------------------------
   Reusable metric card
-------------------------------------------------- */

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  accent = "teal",
  delay = 0,
}) {
  const accentStyles = {
    teal: "text-[#8DB8B5] bg-[#5B9295]/10 border-[#5B9295]/20",
    blue: "text-[#9ABBD0] bg-[#739BB5]/10 border-[#739BB5]/20",
    amber: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    green: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
  };

  return (
    <motion.div
      variants={itemVariants}
      transition={{ delay }}
      whileHover={{
        y: -5,
        borderColor: "rgba(112, 166, 167, 0.45)",
        transition: { duration: 0.2 },
      }}
      className="group relative overflow-hidden rounded-2xl border border-[#293945] bg-[#141F28]/85 p-5 backdrop-blur-xl"
    >
      <div className="absolute -right-9 -top-9 h-28 w-28 rounded-full bg-[#5B9295]/[0.07] blur-2xl transition-all duration-500 group-hover:bg-[#5B9295]/[0.16]" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8295A2]">
            {label}
          </p>

          <div className="mt-3 text-3xl font-semibold tracking-tight text-[#E8EEF1]">
            <AnimatedNumber value={value} />
          </div>

          <p className="mt-2 text-xs text-[#8495A0]">
            {description}
          </p>
        </div>

        <div
          className={`rounded-xl border p-3 ${accentStyles[accent]}`}
        >
          <Icon size={19} strokeWidth={1.7} />
        </div>
      </div>

      <div className="relative mt-5 h-[2px] overflow-hidden rounded-full bg-[#293945]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "68%" }}
          transition={{ duration: 1.1, delay: delay + 0.25 }}
          className="h-full rounded-full bg-gradient-to-r from-[#5B9295] to-[#9ABDC0]"
        />
      </div>
    </motion.div>
  );
}

/* --------------------------------------------------
   Application status pipeline
-------------------------------------------------- */

function ApplicationPipeline({ applications }) {
  const stages = [
    {
      label: "Applied",
      statuses: ["applied"],
      color: "bg-slate-400",
    },
    {
      label: "Under review",
      statuses: ["under_review"],
      color: "bg-sky-400",
    },
    {
      label: "Assessment",
      statuses: ["assessment"],
      color: "bg-violet-400",
    },
    {
      label: "Shortlisted",
      statuses: ["shortlisted"],
      color: "bg-cyan-400",
    },
    {
      label: "Interview",
      statuses: ["interview_scheduled"],
      color: "bg-amber-400",
    },
    {
      label: "Selected",
      statuses: ["selected"],
      color: "bg-emerald-400",
    },
  ];

  const stageCounts = stages.map((stage) => ({
    ...stage,
    count: applications.filter((application) =>
      stage.statuses.includes(
        normalizeStatus(application.status)
      )
    ).length,
  }));

  const maxCount = Math.max(
    ...stageCounts.map((stage) => stage.count),
    1
  );

  return (
    <motion.section
      variants={itemVariants}
      className="rounded-2xl border border-[#293945] bg-[#141F28]/85 p-5 backdrop-blur-xl sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={17} className="text-[#83B2B0]" />
            <h2 className="text-base font-semibold text-[#E5ECEF]">
              Application pipeline
            </h2>
          </div>

          <p className="mt-1 text-xs text-[#8295A2]">
            Where your applications stand right now
          </p>
        </div>

        <Link
          to="/student/applications"
          className="group flex items-center gap-1.5 text-xs font-medium text-[#8DB8B5] transition hover:text-[#C1DAD9]"
        >
          View applications
          <ArrowUpRight
            size={14}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      <div className="mt-7 space-y-5">
        {stageCounts.map((stage, index) => {
          const width = (stage.count / maxCount) * 100;

          return (
            <div key={stage.label}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-2 w-2 rounded-full ${stage.color}`}
                  />
                  <span className="text-sm text-[#B8C5CD]">
                    {stage.label}
                  </span>
                </div>

                <span className="text-sm font-semibold tabular-nums text-[#E1E9ED]">
                  {stage.count}
                </span>
              </div>

              <div className="h-[5px] overflow-hidden rounded-full bg-[#273640]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{
                    duration: 0.85,
                    delay: 0.25 + index * 0.08,
                    ease: "easeOut",
                  }}
                  className={`h-full rounded-full ${stage.color}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-[#293945] pt-4">
        <p className="text-[11px] leading-relaxed text-[#70838F]">
          Counts show each application’s latest recorded status.
          They do not represent historical stage transitions.
        </p>
      </div>
    </motion.section>
  );
}

/* --------------------------------------------------
   Recent applications
-------------------------------------------------- */

function RecentApplications({ applications }) {
  const recent = [...applications]
    .sort((a, b) => {
      const dateA = new Date(
        a.appliedAt || a.createdAt || 0
      ).getTime();

      const dateB = new Date(
        b.appliedAt || b.createdAt || 0
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 4);

  return (
    <motion.section
      variants={itemVariants}
      className="rounded-2xl border border-[#293945] bg-[#141F28]/85 p-5 backdrop-blur-xl sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText size={17} className="text-[#83B2B0]" />
            <h2 className="text-base font-semibold text-[#E5ECEF]">
              Recent applications
            </h2>
          </div>

          <p className="mt-1 text-xs text-[#8295A2]">
            Keep an eye on your recent activity
          </p>
        </div>

        <Link
          to="/student/applications"
          className="flex items-center gap-1 text-xs text-[#8DB8B5] transition hover:text-[#C1DAD9]"
        >
          See all <ArrowRight size={13} />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="mt-7 rounded-xl border border-dashed border-[#344652] bg-[#101923]/60 px-4 py-8 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#5B9295]/10 text-[#8DB8B5]">
            <BriefcaseBusiness size={19} />
          </div>

          <p className="mt-3 text-sm font-medium text-[#D5DFE4]">
            Your journey starts here
          </p>

          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-[#8295A2]">
            Once you apply for a job, your application activity
            will appear in this section.
          </p>

          <Link
            to="/student/jobs"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#5B9295]/40 bg-[#5B9295]/10 px-4 py-2 text-xs font-medium text-[#A7C8C7] transition hover:bg-[#5B9295]/20"
          >
            Explore jobs <ArrowUpRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="mt-5 divide-y divide-[#293945]">
          {recent.map((application, index) => {
            const job = getJobFromApplication(application);
            const companyName = getCompany(job);

            return (
              <motion.div
                key={application._id || application.id || index}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.08 }}
                className="flex flex-col gap-3 py-4 first:pt-1 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#354956] bg-[#1B2A34] text-sm font-semibold text-[#A8C4CE]">
                    {companyName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#DCE5E9]">
                      {job.title || "Job application"}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#81929E]">
                      {companyName}
                      <span className="mx-1.5 text-[#50616C]">·</span>
                      {formatDate(
                        application.appliedAt ||
                        application.createdAt
                      )}
                    </p>
                  </div>
                </div>

                <span
                  className={`w-fit shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium ${getStatusStyle(
                    application.status
                  )}`}
                >
                  {getStatusLabel(application.status)}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}

/* --------------------------------------------------
   Upcoming interview
-------------------------------------------------- */

function UpcomingInterview({ interview }) {
  return (
    <motion.section
      variants={itemVariants}
      className="relative overflow-hidden rounded-2xl border border-[#465044]/70 bg-gradient-to-br from-[#202B2C] via-[#18242B] to-[#141F28] p-5"
    >
      <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#8EAA83]/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays size={17} className="text-[#B6C79B]" />
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#B6C6A4]">
              Next interview
            </p>
          </div>

          {interview && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B6C79B] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#B6C79B]" />
            </span>
          )}
        </div>

        {interview ? (
          <>
            <h3 className="mt-5 text-lg font-semibold text-[#E4EBE2]">
              {getJobFromApplication(interview)?.title ||
                "Interview scheduled"}
            </h3>

            <p className="mt-1 text-sm text-[#A5B5AA]">
              {getCompany(getJobFromApplication(interview))}
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#899A78]/20 bg-black/10 p-3">
              <Clock3 size={16} className="text-[#B6C79B]" />
              <div>
                <p className="text-sm font-medium text-[#E4EBE2]">
                  {formatDate(interview.interviewDate)}
                </p>
                <p className="mt-0.5 text-[10px] text-[#9BAA9D]">
                  Check your application for further details
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-6">
            <p className="text-sm font-medium text-[#DCE5DF]">
              Nothing scheduled yet
            </p>

            <p className="mt-1 text-xs leading-relaxed text-[#91A49A]">
              Any upcoming interview scheduled through your
              applications will appear here.
            </p>

            <Link
              to="/student/applications"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[#B6C79B] transition hover:text-[#E1EACF]"
            >
              Track applications <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </motion.section>
  );
}

/* --------------------------------------------------
   Profile completion
-------------------------------------------------- */

function ProfileCompletion({ user, completion }) {
  const circumference = 2 * Math.PI * 43;
  const offset =
    circumference - (completion / 100) * circumference;

  return (
    <motion.section
      variants={itemVariants}
      className="rounded-2xl border border-[#293945] bg-[#141F28]/85 p-5 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2">
        <Target size={17} className="text-[#83B2B0]" />
        <h2 className="text-base font-semibold text-[#E5ECEF]">
          Profile strength
        </h2>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <div className="relative h-[102px] w-[102px] shrink-0">
          <svg
            viewBox="0 0 100 100"
            className="h-full w-full -rotate-90"
          >
            <circle
              cx="50"
              cy="50"
              r="43"
              fill="none"
              stroke="#2B3B46"
              strokeWidth="7"
            />

            <motion.circle
              cx="50"
              cy="50"
              r="43"
              fill="none"
              stroke="#78A9A8"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{
                duration: 1.3,
                delay: 0.3,
                ease: "easeOut",
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold text-[#E7EEF0]">
              {completion}%
            </span>
            <span className="text-[9px] uppercase tracking-wider text-[#8295A2]">
              Complete
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-[#DCE5E9]">
            {completion >= 100
              ? "Profile looks complete"
              : completion >= 70
                ? "You're nearly there"
                : "Build your profile"}
          </p>

          <p className="mt-1 text-xs leading-relaxed text-[#81929E]">
            {completion >= 100
              ? "Keep your information and resume up to date."
              : "A more complete profile gives recruiters a clearer picture of your background."}
          </p>

          <Link
            to="/student/profile"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#91BDBA] transition hover:text-[#C1DAD9]"
          >
            {completion >= 100 ? "Review profile" : "Improve profile"}
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      {user?.skills?.length > 0 && (
        <div className="mt-5 border-t border-[#293945] pt-4">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.13em] text-[#748793]">
            Your skills
          </p>

          <div className="flex flex-wrap gap-1.5">
            {user.skills.slice(0, 5).map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="rounded-md border border-[#344651] bg-[#1B2932] px-2 py-1 text-[10px] text-[#AFC1CB]"
              >
                {skill}
              </span>
            ))}

            {user.skills.length > 5 && (
              <span className="rounded-md border border-[#344651] bg-[#1B2932] px-2 py-1 text-[10px] text-[#8295A2]">
                +{user.skills.length - 5}
              </span>
            )}
          </div>
        </div>
      )}
    </motion.section>
  );
}

/* --------------------------------------------------
   Recent opportunities
-------------------------------------------------- */

function RecentOpportunities({ jobs }) {
  const recentJobs = [...jobs]
    .sort((a, b) => {
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    })
    .slice(0, 3);

  return (
    <motion.section
      variants={itemVariants}
      className="rounded-2xl border border-[#293945] bg-[#141F28]/85 p-5 backdrop-blur-xl sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={17} className="text-[#83B2B0]" />
            <h2 className="text-base font-semibold text-[#E5ECEF]">
              Fresh opportunities
            </h2>
          </div>

          <p className="mt-1 text-xs text-[#8295A2]">
            Recently added openings
          </p>
        </div>

        <Link
          to="/student/jobs"
          className="flex items-center gap-1 text-xs text-[#8DB8B5] transition hover:text-[#C1DAD9]"
        >
          Explore all <ArrowRight size={13} />
        </Link>
      </div>

      {recentJobs.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[#344652] px-4 py-7 text-center">
          <Search size={21} className="mx-auto text-[#718792]" />
          <p className="mt-3 text-sm text-[#C3D0D6]">
            No new opportunities to display
          </p>
          <p className="mt-1 text-xs text-[#8295A2]">
            Check the jobs section for available openings.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {recentJobs.map((job, index) => (
            <motion.div
              key={job._id || job.id || index}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group rounded-xl border border-[#2B3C47] bg-[#111B24] p-4 transition-colors hover:border-[#5B9295]/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#3A505B] bg-[#20313A] text-sm font-semibold text-[#A9C5CE]">
                  {getCompany(job).charAt(0).toUpperCase()}
                </div>

                <span className="rounded-full border border-[#5B9295]/25 bg-[#5B9295]/10 px-2 py-1 text-[9px] text-[#9BC4C1]">
                  {job.jobType || "Opportunity"}
                </span>
              </div>

              <h3 className="mt-4 line-clamp-1 text-sm font-semibold text-[#E0E8EC]">
                {job.title || "Untitled role"}
              </h3>

              <p className="mt-1 truncate text-xs text-[#8A9CA7]">
                {getCompany(job)}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] text-[#81929E]">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={11} />
                    {job.location}
                  </span>
                )}

                {job.mode && (
                  <span className="flex items-center gap-1">
                    <BriefcaseBusiness size={11} />
                    {job.mode}
                  </span>
                )}
              </div>

              <div className="mt-4 border-t border-[#293945] pt-3">
                <Link
                  to="/student/jobs"
                  className="flex items-center justify-between text-[11px] font-medium text-[#92B9B8] transition group-hover:text-[#C1DAD9]"
                >
                  View opportunity
                  <ArrowUpRight
                    size={14}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

/* --------------------------------------------------
   Quick actions
-------------------------------------------------- */

function QuickActions() {
  const actions = [
    {
      title: "Find opportunities",
      description: "Discover open positions",
      icon: Search,
      to: "/student/jobs",
    },
    {
      title: "Track applications",
      description: "Review your progress",
      icon: Activity,
      to: "/student/applications",
    },
    {
      title: "Update profile",
      description: "Keep your details current",
      icon: UserRound,
      to: "/student/profile",
    },
  ];

  return (
    <motion.section
      variants={itemVariants}
      className="rounded-2xl border border-[#293945] bg-[#141F28]/85 p-5 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2">
        <Zap size={17} className="text-[#83B2B0]" />
        <h2 className="text-base font-semibold text-[#E5ECEF]">
          Quick access
        </h2>
      </div>

      <div className="mt-4 space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              to={action.to}
              className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-[#354A55] hover:bg-[#1B2932]"
            >
              <div className="rounded-lg border border-[#344955] bg-[#20313A] p-2 text-[#9ABDBF]">
                <Icon size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[#D9E3E8]">
                  {action.title}
                </p>
                <p className="mt-0.5 text-[10px] text-[#8295A2]">
                  {action.description}
                </p>
              </div>

              <ArrowUpRight
                size={14}
                className="text-[#718792] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#9BC4C1]"
              />
            </Link>
          );
        })}
      </div>
    </motion.section>
  );
}

/* --------------------------------------------------
   Main dashboard
-------------------------------------------------- */

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setDataLoading(true);
      setDataError("");

      const [jobsResult, applicationsResult] =
        await Promise.allSettled([
          getAllJobs(),
          getMyApplications(),
        ]);

      if (!isMounted) return;

      if (jobsResult.status === "fulfilled") {
        setJobs(
          extractArray(jobsResult.value, ["jobs"])
        );
      }

      if (applicationsResult.status === "fulfilled") {
        setApplications(
          extractArray(applicationsResult.value, [
            "applications",
          ])
        );
      }

      if (
        jobsResult.status === "rejected" &&
        applicationsResult.status === "rejected"
      ) {
        setDataError(
          "We couldn't load your dashboard data. Please check your connection and try again."
        );
      } else if (
        jobsResult.status === "rejected" ||
        applicationsResult.status === "rejected"
      ) {
        setDataError(
          "Some dashboard information could not be loaded. Available information is still displayed."
        );
      }

      setDataLoading(false);
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const completion = useMemo(
    () => getProfileCompletion(user),
    [user]
  );

  const stats = useMemo(() => {
    const terminalStatuses = [
      "selected",
      "rejected",
      "withdrawn",
    ];

    const active = applications.filter(
      (application) =>
        !terminalStatuses.includes(
          normalizeStatus(application.status)
        )
    ).length;

    const interviews = applications.filter(
      (application) =>
        normalizeStatus(application.status) ===
        "interview_scheduled"
    ).length;

    const selected = applications.filter(
      (application) =>
        normalizeStatus(application.status) === "selected"
    ).length;

    return {
      total: applications.length,
      active,
      interviews,
      selected,
    };
  }, [applications]);

  const upcomingInterview = useMemo(() => {
    const now = new Date();

    return applications
      .filter((application) => {
        if (!application.interviewDate) return false;

        const date = new Date(application.interviewDate);

        return (
          !Number.isNaN(date.getTime()) &&
          date >= now &&
          normalizeStatus(application.status) !== "withdrawn" &&
          normalizeStatus(application.status) !== "rejected"
        );
      })
      .sort(
        (a, b) =>
          new Date(a.interviewDate) -
          new Date(b.interviewDate)
      )[0] || null;
  }, [applications]);

  if (authLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1118] text-[#E6EDF1]">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 35, -20, 0],
            y: [0, 24, -15, 0],
            scale: [1, 1.08, 0.95, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-40 -top-48 h-[480px] w-[480px] rounded-full bg-[#397477]/[0.12] blur-[130px]"
        />

        <motion.div
          animate={{
            x: [0, -30, 20, 0],
            y: [0, -20, 25, 0],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-48 top-[30%] h-[500px] w-[500px] rounded-full bg-[#536F8E]/[0.10] blur-[150px]"
        />

        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,172,185,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(139,172,185,0.13) 1px, transparent 1px)",
            backgroundSize: "54px 54px",
            maskImage:
              "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-14 pt-24 sm:px-6 sm:pt-28 lg:px-9 lg:pt-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.section
            variants={itemVariants}
            className="relative mb-8 overflow-hidden rounded-[26px] border border-[#344955]/80 bg-gradient-to-br from-[#1B2A33]/95 via-[#14212A]/95 to-[#111B24]/95 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.20)] sm:p-8 lg:p-9"
          >
            <div className="absolute -right-12 -top-24 h-80 w-80 rounded-full border border-[#7FA7AB]/[0.08]" />
            <div className="absolute -right-2 -top-14 h-64 w-64 rounded-full border border-[#7FA7AB]/[0.08]" />
            <div className="absolute -bottom-28 right-[17%] h-64 w-64 rounded-full bg-[#5B9295]/[0.09] blur-[85px]" />

            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <div className="mb-5 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8DB8B5] shadow-[0_0_12px_#8DB8B5]" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.23em] text-[#8EAFB7]">
                    Placement intelligence / Student workspace
                  </span>
                </div>

                <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[#F0F4F5] sm:text-4xl lg:text-[42px]">
                  {getGreeting()},
                  <br className="sm:hidden" />{" "}
                  <span className="bg-gradient-to-r from-[#C5D9DC] via-[#91B9BC] to-[#7D9EAD] bg-clip-text text-transparent">
                    {getFirstName(user)}.
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[#9DAFB9]">
                  Your placement journey, all in one workspace.
                  Track applications, stay ahead of interviews
                  and discover your next opportunity.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    to="/student/jobs"
                    className="group inline-flex items-center gap-2 rounded-xl bg-[#6F9E9E] px-5 py-3 text-xs font-semibold text-[#0C171B] shadow-[0_8px_24px_rgba(91,146,149,0.18)] transition hover:bg-[#8BB5B4]"
                  >
                    Explore opportunities
                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>

                  <Link
                    to="/student/applications"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#526976]/70 bg-white/[0.03] px-5 py-3 text-xs font-medium text-[#C2D0D6] transition hover:border-[#7CA7AA]/60 hover:bg-white/[0.06]"
                  >
                    <Activity size={14} />
                    Application activity
                  </Link>
                </div>
              </div>

              <div className="hidden min-w-[190px] flex-col items-end gap-3 lg:flex">
                <div className="flex items-center gap-2 rounded-full border border-[#547E80]/30 bg-[#5B9295]/[0.08] px-3 py-1.5">
                  <ShieldCheck
                    size={13}
                    className="text-[#9AC2BF]"
                  />
                  <span className="text-[10px] font-medium tracking-wide text-[#A9C5C5]">
                    PERSONAL WORKSPACE
                  </span>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#748D9A]">
                    Workspace overview
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#D6E0E5]">
                    {new Date().toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Data loading / errors */}
          <AnimatePresence>
            {dataError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-xs leading-relaxed text-amber-200/90">
                  {dataError}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex shrink-0 items-center gap-2 text-xs font-medium text-amber-200 transition hover:text-white"
                >
                  <RefreshCw size={13} />
                  Reload dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {dataLoading && (
            <div className="mb-5 flex items-center gap-2 text-xs text-[#8295A2]">
              <RefreshCw size={13} className="animate-spin" />
              Syncing your placement activity...
            </div>
          )}

          {/* Metric cards */}
          <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total applications"
              value={stats.total}
              description="Applications submitted"
              icon={BriefcaseBusiness}
              accent="teal"
            />

            <MetricCard
              label="Active applications"
              value={stats.active}
              description="Still in progress"
              icon={Activity}
              accent="blue"
              delay={0.08}
            />

            <MetricCard
              label="Interviews"
              value={stats.interviews}
              description="Scheduled interviews"
              icon={CalendarDays}
              accent="amber"
              delay={0.16}
            />

            <MetricCard
              label="Selected"
              value={stats.selected}
              description="Successful outcomes"
              icon={CheckCircle2}
              accent="green"
              delay={0.24}
            />
          </div>

          {/* Main workspace grid */}
          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
            {/* Left side */}
            <div className="min-w-0 space-y-5">
              <ApplicationPipeline
                applications={applications}
              />

              <RecentApplications
                applications={applications}
              />

              <RecentOpportunities jobs={jobs} />
            </div>

            {/* Right side */}
            <aside className="min-w-0 space-y-5">
              <ProfileCompletion
                user={user}
                completion={completion}
              />

              <UpcomingInterview
                interview={upcomingInterview}
              />

              <QuickActions />

              {/* Workspace footer detail */}
              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-2xl border border-[#344955]/60 bg-gradient-to-br from-[#1B2932]/80 to-[#111B24]/80 p-5"
              >
                <div className="absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-[#5B9295]/10 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center gap-2">
                    <GraduationCap
                      size={17}
                      className="text-[#8DB8B5]"
                    />
                    <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#A9BBC4]">
                      Stay prepared
                    </p>
                  </div>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-[#DCE5E9]">
                    Every application is a step forward.
                    Keep your profile ready and stay consistent.
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-[10px] text-[#8295A2]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#80A9A5]" />
                    Your placement workspace is up to date
                  </div>
                </div>
              </motion.div>
            </aside>
          </div>

          {/* Bottom footer */}
          <motion.footer
            variants={itemVariants}
            className="mt-9 flex flex-col items-center justify-between gap-3 border-t border-[#293945] pt-5 text-[10px] text-[#637783] sm:flex-row"
          >
            <p>
              PLACEMENT INTELLIGENCE
              <span className="mx-2 text-[#40525D]">/</span>
              STUDENT WORKSPACE
            </p>

            <p className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6F9E9E]" />
              Built to keep your career journey organised
            </p>
          </motion.footer>
        </motion.div>
      </main>
    </div>
  );
}
