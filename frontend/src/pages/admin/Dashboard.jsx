
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  MapPin,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

import { useAuth } from "../../context/AuthContext.jsx";
import {
  getAllJobs,
  getAllStudents,
  getAllApplications,
  getAllCompanies,
} from "../../services/api.js";
import FullPageLoader from "../../components/common/FullPageLoader.jsx";

/* --------------------------------------------------
   Helpers
-------------------------------------------------- */

const extractArray = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const normalizeStatus = (status = "") =>
  status.toLowerCase().replace(/[\s-]/g, "_");

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getCompanyName = (job) => {
  const company = job?.companyId || job?.company;

  if (company && typeof company === "object") {
    return company.name || "Company";
  }

  return job?.companyName || "Company";
};

const getJob = (application) => {
  const job = application?.jobId;

  return job && typeof job === "object" ? job : {};
};

const getStudent = (application) => {
  const student = application?.userId;

  return student && typeof student === "object"
    ? student
    : {};
};

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
};

/* --------------------------------------------------
   Animation settings
-------------------------------------------------- */

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const revealVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* --------------------------------------------------
   Metric card
-------------------------------------------------- */

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  accent,
  index,
}) {
  return (
    <motion.div
      variants={revealVariants}
      whileHover={{
        y: -4,
        borderColor: "rgba(112, 165, 165, 0.45)",
      }}
      className="group relative overflow-hidden rounded-2xl border border-[#2B3C47] bg-[#151F28]/90 p-5 transition-colors"
    >
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#5B9295]/[0.07] blur-2xl transition group-hover:bg-[#5B9295]/[0.14]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#8395A1]">
            {label}
          </p>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + index * 0.1, duration: 0.5 }}
            className="mt-3 text-3xl font-semibold tracking-tight text-[#E9EFF2]"
          >
            {value.toLocaleString("en-IN")}
          </motion.p>

          <p className="mt-2 text-[11px] text-[#82939E]">
            {description}
          </p>
        </div>

        <div className={`rounded-xl border p-3 ${accent}`}>
          <Icon size={20} strokeWidth={1.7} />
        </div>
      </div>

      <div className="relative mt-5 h-[2px] overflow-hidden rounded-full bg-[#293A45]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "72%" }}
          transition={{
            duration: 1,
            delay: 0.3 + index * 0.1,
            ease: "easeOut",
          }}
          className="h-full rounded-full bg-gradient-to-r from-[#5B9295] to-[#9BBFC0]"
        />
      </div>
    </motion.div>
  );
}

/* --------------------------------------------------
   Application status overview
-------------------------------------------------- */

function ApplicationOverview({ applications }) {
  const stages = [
    {
      key: "applied",
      label: "New applications",
      color: "bg-slate-400",
      text: "text-slate-300",
    },
    {
      key: "under_review",
      label: "Under review",
      color: "bg-sky-400",
      text: "text-sky-300",
    },
    {
      key: "assessment",
      label: "Assessment",
      color: "bg-violet-400",
      text: "text-violet-300",
    },
    {
      key: "shortlisted",
      label: "Shortlisted",
      color: "bg-cyan-400",
      text: "text-cyan-300",
    },
    {
      key: "interview_scheduled",
      label: "Interview scheduled",
      color: "bg-amber-400",
      text: "text-amber-300",
    },
    {
      key: "selected",
      label: "Selected",
      color: "bg-emerald-400",
      text: "text-emerald-300",
    },
    {
      key: "rejected",
      label: "Rejected",
      color: "bg-rose-400",
      text: "text-rose-300",
    },
    {
      key: "withdrawn",
      label: "Withdrawn",
      color: "bg-slate-500",
      text: "text-slate-400",
    },
  ];

  const counts = stages.map((stage) => ({
    ...stage,
    count: applications.filter(
      (application) =>
        normalizeStatus(application.status) === stage.key
    ).length,
  }));

  const total = applications.length || 1;

  return (
    <motion.section
      variants={revealVariants}
      className="rounded-2xl border border-[#2B3C47] bg-[#151F28]/90 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={17} className="text-[#8DB8B5]" />
            <h2 className="text-base font-semibold text-[#E5ECEF]">
              Recruitment pipeline
            </h2>
          </div>
          <p className="mt-1 text-xs text-[#82939E]">
            Current distribution of submitted applications
          </p>
        </div>

        <span className="rounded-full border border-[#425966] bg-[#1B2A34] px-3 py-1 text-[10px] text-[#AFC1CA]">
          {applications.length} total
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="mt-7 rounded-xl border border-dashed border-[#354955] px-4 py-9 text-center">
          <ClipboardList
            size={22}
            className="mx-auto text-[#718792]"
          />
          <p className="mt-3 text-sm text-[#C4D0D6]">
            No applications recorded yet
          </p>
          <p className="mt-1 text-xs text-[#82939E]">
            Application data will appear here when students apply.
          </p>
        </div>
      ) : (
        <div className="mt-7 space-y-4">
          {counts.map((stage, index) => {
            const percentage = (stage.count / total) * 100;

            return (
              <div key={stage.key}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 rounded-full ${stage.color}`} />
                    <span className="text-xs text-[#B6C4CC]">
                      {stage.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[#788B97]">
                      {percentage.toFixed(0)}%
                    </span>
                    <span className={`min-w-5 text-right text-xs font-semibold ${stage.text}`}>
                      {stage.count}
                    </span>
                  </div>
                </div>

                <div className="h-[5px] overflow-hidden rounded-full bg-[#2A3943]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                      duration: 0.85,
                      delay: 0.2 + index * 0.06,
                      ease: "easeOut",
                    }}
                    className={`h-full rounded-full ${stage.color}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}

/* --------------------------------------------------
   Recent application queue
-------------------------------------------------- */

function RecentApplications({ applications }) {
  const recentApplications = [...applications]
    .sort(
      (a, b) =>
        new Date(b.appliedAt || b.createdAt || 0) -
        new Date(a.appliedAt || a.createdAt || 0)
    )
    .slice(0, 5);

  const statusStyles = {
    applied: "border-slate-400/20 bg-slate-400/10 text-slate-300",
    under_review: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    assessment: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    shortlisted: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    interview_scheduled: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    selected: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    rejected: "border-rose-400/20 bg-rose-400/10 text-rose-300",
    withdrawn: "border-slate-500/20 bg-slate-500/10 text-slate-400",
  };

  return (
    <motion.section
      variants={revealVariants}
      className="rounded-2xl border border-[#2B3C47] bg-[#151F28]/90 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 size={17} className="text-[#8DB8B5]" />
            <h2 className="text-base font-semibold text-[#E5ECEF]">
              Latest applications
            </h2>
          </div>
          <p className="mt-1 text-xs text-[#82939E]">
            Recently submitted student applications
          </p>
        </div>

        <Link
          to="/admin/applications"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8DB8B5] transition hover:text-[#C5DDDB]"
        >
          Manage all <ArrowUpRight size={14} />
        </Link>
      </div>

      {recentApplications.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[#354955] px-4 py-8 text-center">
          <p className="text-sm text-[#C4D0D6]">
            No recent applications
          </p>
          <p className="mt-1 text-xs text-[#82939E]">
            New submissions will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[590px] text-left">
            <thead>
              <tr className="border-b border-[#2B3C47] text-[9px] uppercase tracking-[0.13em] text-[#738792]">
                <th className="pb-3 font-medium">Student</th>
                <th className="pb-3 font-medium">Position</th>
                <th className="pb-3 font-medium">Applied</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentApplications.map((application, index) => {
                const student = getStudent(application);
                const job = getJob(application);
                const status = normalizeStatus(application.status);

                return (
                  <motion.tr
                    key={application._id || index}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + index * 0.06 }}
                    className="border-b border-[#263640] last:border-0"
                  >
                    <td className="py-4 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#3C515D] bg-[#21323D] text-[11px] font-semibold text-[#B6CFD5]">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.fullname || "Student"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            (student.fullname || "S")
                              .charAt(0)
                              .toUpperCase()
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[130px] truncate text-xs font-medium text-[#D7E1E6]">
                            {student.fullname || "Student"}
                          </p>
                          <p className="max-w-[130px] truncate text-[10px] text-[#7F929D]">
                            {student.email || "Email unavailable"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 pr-3">
                      <p className="max-w-[145px] truncate text-xs text-[#C2CED4]">
                        {job.title || "Position"}
                      </p>
                      <p className="mt-1 max-w-[145px] truncate text-[10px] text-[#7F929D]">
                        {getCompanyName(job)}
                      </p>
                    </td>

                    <td className="py-4 pr-3 text-[10px] text-[#91A1AB]">
                      {formatDate(application.appliedAt)}
                    </td>

                    <td className="py-4">
                      <span
                        className={`whitespace-nowrap rounded-full border px-2 py-1 text-[9px] font-medium ${
                          statusStyles[status] ||
                          statusStyles.applied
                        }`}
                      >
                        {status.replaceAll("_", " ")}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.section>
  );
}

/* --------------------------------------------------
   Recent jobs
-------------------------------------------------- */

function RecentJobs({ jobs }) {
  const recentJobs = [...jobs]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 4);

  return (
    <motion.section
      variants={revealVariants}
      className="rounded-2xl border border-[#2B3C47] bg-[#151F28]/90 p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BriefcaseBusiness size={17} className="text-[#8DB8B5]" />
            <h2 className="text-base font-semibold text-[#E5ECEF]">
              Active job openings
            </h2>
          </div>
          <p className="mt-1 text-xs text-[#82939E]">
            Latest active and non-expired postings
          </p>
        </div>

        <Link
          to="/admin/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8DB8B5] transition hover:text-[#C5DDDB]"
        >
          Manage jobs <ArrowUpRight size={14} />
        </Link>
      </div>

      {recentJobs.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[#354955] px-4 py-8 text-center">
          <BriefcaseBusiness
            size={21}
            className="mx-auto text-[#718792]"
          />
          <p className="mt-3 text-sm text-[#C4D0D6]">
            No active openings found
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {recentJobs.map((job, index) => {
            const company = job.companyId;
            const companyName = getCompanyName(job);

            return (
              <motion.div
                key={job._id || index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.08 }}
                whileHover={{ y: -3 }}
                className="rounded-xl border border-[#2B3D48] bg-[#111B24] p-4 transition-colors hover:border-[#5B9295]/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#3A505B] bg-[#20313A] text-sm font-semibold text-[#A9C5CE]">
                    {company?.logo ? (
                      <img
                        src={company.logo}
                        alt={companyName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      companyName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-[#DDE6EA]">
                      {job.title}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-[#82939E]">
                      {companyName}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#293945] pt-3">
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[9px] text-emerald-300">
                    Active
                  </span>

                  <span className="text-[10px] text-[#81939E]">
                    Deadline: {formatDate(job.applicationDeadline)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}

/* --------------------------------------------------
   Company directory preview
-------------------------------------------------- */

function CompanyPreview({ companies }) {
  const recentCompanies = [...companies]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    )
    .slice(0, 4);

  return (
    <motion.section
      variants={revealVariants}
      className="rounded-2xl border border-[#2B3C47] bg-[#151F28]/90 p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 size={17} className="text-[#8DB8B5]" />
            <h2 className="text-base font-semibold text-[#E5ECEF]">
              Company directory
            </h2>
          </div>
          <p className="mt-1 text-xs text-[#82939E]">
            Registered recruitment partners
          </p>
        </div>

        <Link
          to="/admin/companies"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#8DB8B5] transition hover:text-[#C5DDDB]"
        >
          View all <ArrowUpRight size={14} />
        </Link>
      </div>

      {recentCompanies.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-[#354955] px-4 py-7 text-center text-xs text-[#82939E]">
          No registered companies found.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {recentCompanies.map((company, index) => (
            <motion.div
              key={company._id || index}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + index * 0.07 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#354B57] bg-[#20313A] text-xs font-semibold text-[#B7CCD3]">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (company.name || "C").charAt(0).toUpperCase()
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[#D8E2E7]">
                  {company.name}
                </p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-[#82939E]">
                  <MapPin size={10} />
                  {company.location || "Location unavailable"}
                </p>
              </div>

              <span className="text-[9px] text-[#718792]">
                {formatDate(company.createdAt)}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

/* --------------------------------------------------
   Admin dashboard
-------------------------------------------------- */

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();

  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [dataLoading, setDataLoading] = useState(true);
  const [dataErrors, setDataErrors] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setDataLoading(true);
      setDataErrors([]);

      const results = await Promise.allSettled([
        getAllStudents(),
        getAllCompanies(),
        getAllJobs(),
        getAllApplications(),
      ]);

      if (!active) return;

      const setters = [
        setStudents,
        setCompanies,
        setJobs,
        setApplications,
      ];

      const names = [
        "Students",
        "Companies",
        "Jobs",
        "Applications",
      ];

      const errors = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          setters[index](extractArray(result.value));
        } else {
          errors.push(names[index]);
        }
      });

      setDataErrors(errors);
      setDataLoading(false);
    };

    loadData();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  const summary = useMemo(() => {
    const selected = applications.filter(
      (application) =>
        normalizeStatus(application.status) === "selected"
    ).length;

    const interviews = applications.filter(
      (application) =>
        normalizeStatus(application.status) === "interview_scheduled"
    ).length;

    const pending = applications.filter((application) =>
      ["applied", "under_review"].includes(
        normalizeStatus(application.status)
      )
    ).length;

    const selectionRate = applications.length
      ? Math.round((selected / applications.length) * 100)
      : 0;

    return {
      selected,
      interviews,
      pending,
      selectionRate,
    };
  }, [applications]);

  if (authLoading) {
    return <FullPageLoader />;
  }

  const firstName =
    user?.fullname?.trim().split(/\s+/)[0] || "Administrator";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B1118] text-[#E6EDF1]">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 35, -20, 0],
            y: [0, 20, -15, 0],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-44 -top-44 h-[490px] w-[490px] rounded-full bg-[#397477]/[0.12] blur-[135px]"
        />

        <motion.div
          animate={{
            x: [0, -25, 20, 0],
            y: [0, -20, 20, 0],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-48 top-[25%] h-[500px] w-[500px] rounded-full bg-[#536F8E]/[0.09] blur-[145px]"
        />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,172,185,0.13) 1px, transparent 1px), linear-gradient(90deg, rgba(139,172,185,0.13) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "linear-gradient(to bottom, black, transparent 85%)",
          }}
        />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-14 pt-24 sm:px-6 sm:pt-28 lg:px-9 lg:pt-28">
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.section
            variants={revealVariants}
            className="relative mb-7 overflow-hidden rounded-[26px] border border-[#344955]/80 bg-gradient-to-br from-[#1B2A33]/95 via-[#14212A]/95 to-[#111B24]/95 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.2)] sm:p-8 lg:p-9"
          >
            <div className="absolute -right-10 -top-20 h-72 w-72 rounded-full border border-[#7FA7AB]/[0.08]" />
            <div className="absolute right-8 top-[-50px] h-56 w-56 rounded-full border border-[#7FA7AB]/[0.08]" />
            <div className="absolute -bottom-28 right-[20%] h-64 w-64 rounded-full bg-[#5B9295]/[0.10] blur-[85px]" />

            <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <div className="mb-5 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8DB8B5] shadow-[0_0_12px_#8DB8B5]" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.23em] text-[#8EAFB7]">
                    Placement intelligence / Administration
                  </span>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-[#F0F4F5] sm:text-4xl lg:text-[42px]">
                  {getGreeting()},
                  <br className="sm:hidden" />{" "}
                  <span className="bg-gradient-to-r from-[#C5D9DC] via-[#91B9BC] to-[#7D9EAD] bg-clip-text text-transparent">
                    {firstName}.
                  </span>
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[#9DAFB9]">
                  Welcome to your placement operations centre.
                  Monitor recruitment activity, oversee company
                  partnerships and keep the placement process moving.
                </p>
              </div>

              <div className="relative flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
                <div className="flex items-center gap-2 rounded-full border border-[#547E80]/30 bg-[#5B9295]/[0.08] px-3 py-2">
                  <ShieldCheck size={14} className="text-[#9AC2BF]" />
                  <span className="text-[10px] font-medium tracking-wide text-[#A9C5C5]">
                    ADMIN CONTROL CENTRE
                  </span>
                </div>

                <div className="text-xs text-[#9AADB7]">
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Refresh / partial errors */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#748995]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#78A9A8]" />
              Institutional overview
              {dataLoading && (
                <span className="ml-2 normal-case tracking-normal text-[#91A5B0]">
                  · Syncing records
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              disabled={dataLoading}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#354955] bg-[#18242D] px-3 py-2 text-[11px] font-medium text-[#B8C8CF] transition hover:border-[#5B9295]/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={dataLoading ? "animate-spin" : ""}
              />
              Refresh overview
            </button>
          </div>

          {dataErrors.length > 0 && (
            <motion.div
              variants={revealVariants}
              className="mb-5 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4"
            >
              <p className="text-xs font-medium text-amber-200">
                Some records could not be loaded: {dataErrors.join(", ")}.
              </p>
              <p className="mt-1 text-[11px] text-amber-100/70">
                Check the corresponding admin endpoint and try refreshing.
                The other available sections remain visible.
              </p>
            </motion.div>
          )}

          {/* Main metrics */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Registered students"
              value={students.length}
              description="Student accounts in the system"
              icon={GraduationCap}
              accent="border-[#5B9295]/25 bg-[#5B9295]/10 text-[#9BC4C1]"
              index={0}
            />

            <MetricCard
              label="Company partners"
              value={companies.length}
              description="Registered organisations"
              icon={Building2}
              accent="border-[#739BB5]/25 bg-[#739BB5]/10 text-[#A4C3D3]"
              index={1}
            />

            <MetricCard
              label="Active job openings"
              value={jobs.length}
              description="Active and non-expired postings"
              icon={BriefcaseBusiness}
              accent="border-amber-400/25 bg-amber-400/10 text-amber-300"
              index={2}
            />

            <MetricCard
              label="Total applications"
              value={applications.length}
              description="Applications across all jobs"
              icon={FileCheck2}
              accent="border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
              index={3}
            />
          </div>

          {/* Secondary indicators */}
          <motion.section
            variants={revealVariants}
            className="mb-6 grid grid-cols-1 overflow-hidden rounded-2xl border border-[#2B3C47] bg-[#121D26]/90 sm:grid-cols-3"
          >
            <div className="flex items-center gap-3 border-b border-[#2B3C47] p-4 sm:border-b-0 sm:border-r">
              <div className="rounded-lg bg-sky-400/10 p-2.5 text-sky-300">
                <ClipboardList size={17} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#81939E]">
                  Awaiting review
                </p>
                <p className="mt-1 text-lg font-semibold text-[#E2E9ED]">
                  {summary.pending}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-b border-[#2B3C47] p-4 sm:border-b-0 sm:border-r">
              <div className="rounded-lg bg-amber-400/10 p-2.5 text-amber-300">
                <CalendarClock size={17} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#81939E]">
                  Interviews scheduled
                </p>
                <p className="mt-1 text-lg font-semibold text-[#E2E9ED]">
                  {summary.interviews}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-emerald-400/10 p-2.5 text-emerald-300">
                <TrendingUp size={17} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#81939E]">
                  Selected applications
                </p>
                <p className="mt-1 text-lg font-semibold text-[#E2E9ED]">
                  {summary.selected}
                  <span className="ml-2 text-[10px] font-medium text-emerald-300">
                    {summary.selectionRate}% of applications
                  </span>
                </p>
              </div>
            </div>
          </motion.section>

          {/* Operational grid */}
          <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,0.85fr)]">
            <div className="min-w-0 space-y-5">
              <ApplicationOverview applications={applications} />
              <RecentApplications applications={applications} />
              <RecentJobs jobs={jobs} />
            </div>

            <aside className="min-w-0 space-y-5">
              <CompanyPreview companies={companies} />

              {/* Management shortcuts */}
              <motion.section
                variants={revealVariants}
                className="rounded-2xl border border-[#2B3C47] bg-[#151F28]/90 p-5 sm:p-6"
              >
                <div className="flex items-center gap-2">
                  <Activity size={17} className="text-[#8DB8B5]" />
                  <h2 className="text-base font-semibold text-[#E5ECEF]">
                    Management desk
                  </h2>
                </div>

                <p className="mt-1 text-xs text-[#82939E]">
                  Access core placement operations
                </p>

                <div className="mt-5 space-y-2">
                  {[
                    {
                      title: "Company management",
                      detail: "Register and maintain partners",
                      icon: Building2,
                      to: "/admin/companies",
                    },
                    {
                      title: "Job management",
                      detail: "Publish and manage openings",
                      icon: BriefcaseBusiness,
                      to: "/admin/jobs",
                    },
                    {
                      title: "Student records",
                      detail: "View registered students",
                      icon: Users,
                      to: "/admin/students",
                    },
                    {
                      title: "Application review",
                      detail: "Review and update applications",
                      icon: FileCheck2,
                      to: "/admin/applications",
                    },
                  ].map((action, index) => {
                    const Icon = action.icon;

                    return (
                      <Link
                        key={action.title}
                        to={action.to}
                        className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition hover:border-[#354955] hover:bg-[#1B2932]"
                      >
                        <div className="rounded-lg border border-[#344955] bg-[#20313A] p-2.5 text-[#9ABDBF]">
                          <Icon size={16} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-[#D9E3E8]">
                            {action.title}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#82939E]">
                            {action.detail}
                          </p>
                        </div>

                        <ArrowRight
                          size={14}
                          className="text-[#718792] transition group-hover:translate-x-1 group-hover:text-[#9BC4C1]"
                        />
                      </Link>
                    );
                  })}
                </div>
              </motion.section>

              {/* Operational summary */}
              <motion.section
                variants={revealVariants}
                className="relative overflow-hidden rounded-2xl border border-[#354955]/70 bg-gradient-to-br from-[#1B2932]/90 to-[#111B24]/90 p-5"
              >
                <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-[#5B9295]/10 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={17} className="text-[#8DB8B5]" />
                    <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#A9BBC4]">
                      Operations snapshot
                    </p>
                  </div>

                  <p className="mt-4 text-sm font-medium leading-relaxed text-[#DCE5E9]">
                    A central view of the placement ecosystem:
                    student records, hiring partners, job openings
                    and application progress.
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-[10px] text-[#82939E]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#80A9A5]" />
                    Data is sourced from your backend
                  </div>
                </div>
              </motion.section>
            </aside>
          </div>

          {/* Footer */}
          <motion.footer
            variants={revealVariants}
            className="mt-9 flex flex-col items-center justify-between gap-3 border-t border-[#293945] pt-5 text-[10px] text-[#637783] sm:flex-row"
          >
            <p>
              PLACEMENT INTELLIGENCE
              <span className="mx-2 text-[#40525D]">/</span>
              ADMINISTRATION
            </p>

            <p className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6F9E9E]" />
              Placement operations overview
            </p>
          </motion.footer>
        </motion.div>
      </main>
    </div>
  );
}
