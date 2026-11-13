
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  Clock3,
  ExternalLink,
  FileText,
  Filter,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react";

import {
  getAllApplications,
  updateApplicationStatus,
} from "../../services/api.js";

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

const statusLabels = {
  applied: "Applied",
  under_review: "Under review",
  assessment: "Assessment",
  shortlisted: "Shortlisted",
  interview_scheduled: "Interview scheduled",
  selected: "Selected",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

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

const manageableStatuses = [
  "under_review",
  "assessment",
  "shortlisted",
  "interview_scheduled",
  "selected",
  "rejected",
];

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toDateTimeLocal = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().slice(0, 16);
};

const getStudent = (application) => {
  const value = application?.userId;

  return value && typeof value === "object" ? value : {};
};

const getJob = (application) => {
  const value = application?.jobId;

  return value && typeof value === "object" ? value : {};
};

const getCompany = (job) => {
  const value = job?.companyId;

  return value && typeof value === "object" ? value : {};
};

const getStatusLabel = (status) =>
  statusLabels[normalizeStatus(status)] || status || "Unknown";

const getStatusStyle = (status) =>
  statusStyles[normalizeStatus(status)] || statusStyles.applied;

const inputClass =
  "w-full rounded-xl border border-[#354955] bg-[#111B24] px-3.5 py-3 text-sm text-[#E1E9ED] outline-none transition placeholder:text-[#627681] focus:border-[#6F9E9E] focus:ring-2 focus:ring-[#5B9295]/10";

const labelClass =
  "mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#91A3AE]";

/* --------------------------------------------------
   Status editor
-------------------------------------------------- */

function ApplicationDetailsModal({
  application,
  onClose,
  onUpdate,
  updating,
}) {
  const student = getStudent(application);
  const job = getJob(application);
  const company = getCompany(job);

  const currentStatus = normalizeStatus(application.status);

  const [status, setStatus] = useState(currentStatus);
  const [interviewDate, setInterviewDate] = useState(
    toDateTimeLocal(application.interviewDate)
  );
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setStatus(currentStatus);
    setInterviewDate(toDateTimeLocal(application.interviewDate));
    setFormError("");
  }, [application, currentStatus]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    if (status === currentStatus) {
      setFormError("Choose a different application status.");
      return;
    }

    if (status === "interview_scheduled" && !interviewDate) {
      setFormError("Please select an interview date and time.");
      return;
    }

    onUpdate(application._id, {
      status,
      ...(status === "interview_scheduled"
        ? { interviewDate: new Date(interviewDate).toISOString() }
        : {}),
    });
  };

  const appliedDate =
    application.appliedAt || application.createdAt;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !updating) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.98 }}
        transition={{ duration: 0.24 }}
        className="my-auto max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-[#3B505D] bg-[#15212A] shadow-2xl"
      >
        {/* Modal header */}
        <div className="flex items-start justify-between border-b border-[#2E414C] px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#82A9B1]">
              Application review
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#EAF0F2]">
              Application details
            </h2>

            <p className="mt-1 text-xs text-[#8799A4]">
              Review candidate information and update progress.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            aria-label="Close application details"
            className="rounded-lg border border-[#354955] p-2 text-[#91A3AE] transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        <div className="max-h-[calc(92vh-82px)] overflow-y-auto">
          <div className="space-y-6 p-5 sm:p-7">
            {/* Candidate */}
            <section className="flex flex-col gap-4 rounded-xl border border-[#30444F] bg-[#111B24] p-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#3B505D] bg-[#20313A] text-sm font-semibold text-[#B7CCD3]">
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.fullname || "Student"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (student.fullname || "S")
                    .trim()
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-[#E5ECEF]">
                  {student.fullname || "Student information unavailable"}
                </h3>

                <p className="mt-1 break-all text-xs text-[#91A5B0]">
                  {student.email || "Email unavailable"}
                </p>

                <p className="mt-2 text-[10px] text-[#81939E]">
                  Applied on {formatDate(appliedDate)}
                </p>
              </div>

              <span
                className={`w-fit shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium ${getStatusStyle(currentStatus)}`}
              >
                {getStatusLabel(currentStatus)}
              </span>
            </section>

            {/* Position */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.13em] text-[#9BB3BE]">
                Position applied for
              </h3>

              <div className="mt-3 rounded-xl border border-[#2F424E] bg-[#111B24] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#3A505B] bg-[#20313A] text-sm font-semibold text-[#B7CCD3]">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name || "Company"}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      (company.name || "C").charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#DCE5E9]">
                      {job.title || "Job information unavailable"}
                    </p>

                    <p className="mt-1 text-xs text-[#91A3AE]">
                      {company.name || "Company information unavailable"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#2B3C47] pt-3 text-xs">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-[#718792]">
                      Job type
                    </p>
                    <p className="mt-1 text-[#BBC9D0]">
                      {job.jobType || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-[#718792]">
                      Work mode
                    </p>
                    <p className="mt-1 text-[#BBC9D0]">
                      {job.mode || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-[#718792]">
                      Location
                    </p>
                    <p className="mt-1 text-[#BBC9D0]">
                      {company.location || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-[#718792]">
                      Application deadline
                    </p>
                    <p className="mt-1 text-[#BBC9D0]">
                      {formatDate(job.applicationDeadline)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.13em] text-[#9BB3BE]">
                Candidate contact
              </h3>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#2F424E] bg-[#111B24] p-3.5">
                  <div className="flex items-center gap-2 text-[#8DAEB7]">
                    <Mail size={14} />
                    <span className="text-[10px] uppercase tracking-wider">
                      Email
                    </span>
                  </div>
                  <p className="mt-2 break-all text-xs text-[#D6E0E5]">
                    {student.email || "Not available"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#2F424E] bg-[#111B24] p-3.5">
                  <div className="flex items-center gap-2 text-[#8DAEB7]">
                    <Phone size={14} />
                    <span className="text-[10px] uppercase tracking-wider">
                      Mobile
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#D6E0E5]">
                    {student.mobile || "Not available"}
                  </p>
                </div>
              </div>
            </section>

            {/* Resume */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.13em] text-[#9BB3BE]">
                Submitted resume
              </h3>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2F424E] bg-[#111B24] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-[#5B9295]/25 bg-[#5B9295]/10 p-2.5 text-[#9BC4C1]">
                    <FileText size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-[#DCE5E9]">
                      Application resume
                    </p>
                    <p className="mt-1 text-[10px] text-[#82939E]">
                      Resume submitted with this application
                    </p>
                  </div>
                </div>

                {application.resumeUrl ? (
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-[#5B9295]/35 bg-[#5B9295]/10 px-3 py-2 text-[10px] font-medium text-[#A9CECC] transition hover:bg-[#5B9295]/20"
                  >
                    View resume
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-[10px] text-[#82939E]">
                    Resume unavailable
                  </span>
                )}
              </div>
            </section>

            {/* Existing interview */}
            {application.interviewDate && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.13em] text-[#9BB3BE]">
                  Interview date on record
                </h3>

                <div className="mt-3 flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
                  <CalendarClock
                    size={17}
                    className="text-amber-300"
                  />
                  <p className="text-xs text-amber-100">
                    {formatDateTime(application.interviewDate)}
                  </p>
                </div>
              </section>
            )}

            {/* Status update form */}
            <section className="border-t border-[#2E414C] pt-5">
              <div className="flex items-center gap-2">
                <ClipboardList size={16} className="text-[#8DB8B5]" />
                <h3 className="text-xs font-semibold uppercase tracking-[0.13em] text-[#9BB3BE]">
                  Update application status
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                {formError && (
                  <div className="flex gap-2 rounded-lg border border-rose-400/20 bg-rose-400/[0.06] p-3 text-xs text-rose-200">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    {formError}
                  </div>
                )}

                <div>
                  <label className={labelClass}>
                    New status
                  </label>

                  <select
                    value={status}
                    onChange={(event) => {
                      setStatus(event.target.value);
                      setFormError("");
                    }}
                    className={inputClass}
                  >
                    {!manageableStatuses.includes(currentStatus) && (
                      <option value={currentStatus}>
                        Current: {getStatusLabel(currentStatus)}
                      </option>
                    )}

                    {manageableStatuses.map((value) => (
                      <option key={value} value={value}>
                        {getStatusLabel(value)}
                      </option>
                    ))}
                  </select>
                </div>

                {status === "interview_scheduled" && (
                  <div>
                    <label className={labelClass}>
                      Interview date and time
                    </label>

                    <input
                      type="datetime-local"
                      value={interviewDate}
                      min={toDateTimeLocal(new Date())}
                      onChange={(event) => {
                        setInterviewDate(event.target.value);
                        setFormError("");
                      }}
                      className={inputClass}
                      required
                    />

                    <p className="mt-1 text-[10px] text-[#82939E]">
                      Required when scheduling an interview.
                    </p>
                  </div>
                )}

                <div className="flex flex-col-reverse justify-end gap-2 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={updating}
                    className="rounded-lg border border-[#40545F] px-5 py-2.5 text-xs font-medium text-[#B8C6CE] transition hover:bg-white/5 disabled:opacity-50"
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    disabled={updating || status === currentStatus}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6F9E9E] px-5 py-2.5 text-xs font-semibold text-[#101820] transition hover:bg-[#8BB5B4] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updating ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}

                    {updating ? "Updating..." : "Save status"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------------------------
   Main page
-------------------------------------------------- */

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadApplications = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await getAllApplications();
      setApplications(extractArray(response));
    } catch (err) {
      setError(err.message || "Unable to load applications.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const stats = useMemo(() => {
    const count = (status) =>
      applications.filter(
        (application) =>
          normalizeStatus(application.status) === status
      ).length;

    return {
      total: applications.length,
      review: count("applied") + count("under_review"),
      interviews: count("interview_scheduled"),
      selected: count("selected"),
      rejected: count("rejected"),
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const term = search.trim().toLowerCase();

    return [...applications]
      .filter((application) => {
        const student = getStudent(application);
        const job = getJob(application);
        const company = getCompany(job);

        const matchesSearch =
          !term ||
          [
            student.fullname,
            student.email,
            student.mobile,
            job.title,
            company.name,
          ].some((value) =>
            String(value || "").toLowerCase().includes(term)
          );

        const matchesStatus =
          statusFilter === "all" ||
          normalizeStatus(application.status) === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.appliedAt || b.createdAt || 0) -
          new Date(a.appliedAt || a.createdAt || 0)
      );
  }, [applications, search, statusFilter]);

  const handleUpdateStatus = async (applicationId, data) => {
    setUpdating(true);
    setError("");
    setNotice("");

    try {
      await updateApplicationStatus(applicationId, data);

      const refreshed = await getAllApplications();
      const nextApplications = extractArray(refreshed);

      setApplications(nextApplications);

      const updated = nextApplications.find(
        (application) => application._id === applicationId
      );

      setSelectedApplication(updated || null);
      setNotice("Application status updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update application status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1118] text-[#E6EDF1]">
      <main className="mx-auto w-full max-w-[1600px] px-4 pb-14 pt-24 sm:px-6 sm:pt-28 lg:px-9 lg:pt-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#83A8B1]">
              ADMINISTRATION / RECRUITMENT
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#EDF2F4]">
              Applications
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#91A3AE]">
              Review candidate submissions and manage recruitment progress.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadApplications(true)}
            disabled={refreshing || loading}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#354955] bg-[#17242D] px-4 py-3 text-xs font-medium text-[#C0CDD3] transition hover:border-[#6F9E9E] hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh applications
          </button>
        </motion.div>

        {/* Notices */}
        <AnimatePresence>
          {(error || notice) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mb-5 flex items-start gap-2 rounded-xl border p-3 text-xs ${
                error
                  ? "border-rose-400/20 bg-rose-400/[0.06] text-rose-200"
                  : "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-200"
              }`}
            >
              {error ? (
                <CircleAlert size={15} className="mt-0.5 shrink-0" />
              ) : (
                <Check size={15} className="mt-0.5 shrink-0" />
              )}

              <span>{error || notice}</span>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setNotice("");
                }}
                className="ml-auto opacity-70 hover:opacity-100"
                aria-label="Dismiss message"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="mb-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#2B3C47] bg-[#141F28] sm:grid-cols-5"
        >
          {[
            {
              label: "Total applications",
              value: stats.total,
              icon: ClipboardList,
              style: "text-[#9BC4C1] bg-[#5B9295]/10",
            },
            {
              label: "Awaiting review",
              value: stats.review,
              icon: Clock3,
              style: "text-sky-300 bg-sky-400/10",
            },
            {
              label: "Interviews",
              value: stats.interviews,
              icon: CalendarClock,
              style: "text-amber-300 bg-amber-400/10",
            },
            {
              label: "Selected",
              value: stats.selected,
              icon: Check,
              style: "text-emerald-300 bg-emerald-400/10",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              icon: X,
              style: "text-rose-300 bg-rose-400/10",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={`flex items-center gap-3 p-4 ${
                  index % 2 === 0 ? "border-r border-[#2B3C47]" : ""
                } ${
                  index < 4 ? "border-b border-[#2B3C47] sm:border-b-0" : ""
                } ${
                  index === 1 || index === 3 ? "sm:border-r" : ""
                } ${
                  index === 2 ? "sm:border-r" : ""
                }`}
              >
                <div className={`rounded-lg p-2.5 ${item.style}`}>
                  <Icon size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wider text-[#81939E]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-[#E6EDF1]">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.section>

        {/* Search and filters */}
        <section className="mb-5 rounded-2xl border border-[#2B3C47] bg-[#141F28] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#758A96]"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student, email, position or company..."
                className="w-full rounded-xl border border-[#354955] bg-[#101922] py-3 pl-10 pr-4 text-xs text-[#E1E9ED] outline-none transition placeholder:text-[#71848F] focus:border-[#6F9E9E]"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-[#354955] bg-[#101922] py-3 pl-3 pr-9 text-xs text-[#BDCAD1] outline-none focus:border-[#6F9E9E] lg:w-auto"
              >
                <option value="all">All statuses</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#82939E]"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] text-[#82939E]">
            <span>
              Showing {filteredApplications.length} of {applications.length} applications
            </span>

            {(search || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="text-[#91BDBA] hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Application queue */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="overflow-hidden rounded-2xl border border-[#2B3C47] bg-[#141F28]"
        >
          <div className="flex items-center justify-between border-b border-[#2B3C47] px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-[#E3EBEF]">
                Application review queue
              </h2>
              <p className="mt-1 text-[10px] text-[#82939E]">
                Candidate submissions across all job postings
              </p>
            </div>

            <span className="rounded-lg border border-[#354955] bg-[#1B2932] px-2.5 py-1.5 text-[10px] text-[#AABBC4]">
              {applications.length} records
            </span>
          </div>

          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-[#24333D]"
                />
              ))}
            </div>
          ) : error && applications.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <CircleAlert
                size={25}
                className="mx-auto text-rose-300"
              />
              <p className="mt-3 text-sm text-[#DCE5E9]">
                Unable to load applications
              </p>
              <button
                type="button"
                onClick={() => loadApplications()}
                className="mt-4 text-xs font-medium text-[#91BDBA] hover:text-white"
              >
                Try again
              </button>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <ClipboardList
                size={27}
                className="mx-auto text-[#748A96]"
              />

              <p className="mt-3 text-sm font-medium text-[#DCE5E9]">
                {search || statusFilter !== "all"
                  ? "No matching applications"
                  : "No applications received yet"}
              </p>

              <p className="mt-1 text-xs text-[#82939E]">
                {search || statusFilter !== "all"
                  ? "Try changing your search or status filter."
                  : "Student submissions will appear here."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[950px] text-left">
                  <thead className="bg-[#111A22]">
                    <tr className="text-[9px] uppercase tracking-[0.13em] text-[#7F929D]">
                      <th className="px-6 py-4 font-medium">Candidate</th>
                      <th className="px-4 py-4 font-medium">Position</th>
                      <th className="px-4 py-4 font-medium">Company</th>
                      <th className="px-4 py-4 font-medium">Applied on</th>
                      <th className="px-4 py-4 font-medium">Status</th>
                      <th className="px-5 py-4 text-right font-medium">Review</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredApplications.map((application, index) => {
                      const student = getStudent(application);
                      const job = getJob(application);
                      const company = getCompany(job);

                      return (
                        <motion.tr
                          key={application._id}
                          initial={{ opacity: 0, y: 7 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.025 }}
                          className="border-t border-[#293A44] transition-colors hover:bg-[#1A2932]/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#3A505B] bg-[#20313A] text-xs font-semibold text-[#B7CCD3]">
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
                                <p className="max-w-[160px] truncate text-xs font-semibold text-[#DEE7EB]">
                                  {student.fullname || "Student unavailable"}
                                </p>
                                <p className="max-w-[160px] truncate text-[10px] text-[#82939E]">
                                  {student.email || "Email unavailable"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <p className="max-w-[170px] truncate text-xs text-[#C2CED4]">
                              {job.title || "Job unavailable"}
                            </p>
                            <p className="mt-1 text-[10px] text-[#82939E]">
                              {job.jobType || "—"}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="max-w-[150px] truncate text-xs text-[#B8C6CD]">
                              {company.name || "Company unavailable"}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-[10px] text-[#91A2AC]">
                            {formatDate(
                              application.appliedAt || application.createdAt
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-medium ${getStatusStyle(application.status)}`}
                            >
                              {getStatusLabel(application.status)}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedApplication(application)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#405763] px-3 py-2 text-[10px] font-medium text-[#AFC5CD] transition hover:border-[#6F9E9E] hover:bg-[#5B9295]/10 hover:text-white"
                            >
                              Review
                              <ArrowUpRight size={12} />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredApplications.map((application) => {
                  const student = getStudent(application);
                  const job = getJob(application);
                  const company = getCompany(job);

                  return (
                    <div
                      key={application._id}
                      className="rounded-xl border border-[#354955] bg-[#111B24] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#3A505B] bg-[#20313A] text-xs font-semibold text-[#B7CCD3]">
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

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#E2EAEF]">
                            {student.fullname || "Student unavailable"}
                          </p>
                          <p className="mt-1 break-all text-xs text-[#82939E]">
                            {student.email || "Email unavailable"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2 py-1 text-[9px] ${getStatusStyle(application.status)}`}
                        >
                          {getStatusLabel(application.status)}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 border-t border-[#2B3C47] pt-3 text-xs">
                        <p className="text-[#C4D0D6]">
                          {job.title || "Job unavailable"}
                        </p>
                        <p className="text-[#82939E]">
                          {company.name || "Company unavailable"}
                        </p>
                        <p className="text-[10px] text-[#82939E]">
                          Applied {formatDate(application.appliedAt)}
                        </p>
                      </div>

                      <div className="mt-4 flex justify-end border-t border-[#2B3C47] pt-3">
                        <button
                          type="button"
                          onClick={() => setSelectedApplication(application)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#405763] px-3 py-2 text-[10px] font-medium text-[#AFC5CD]"
                        >
                          Review application
                          <ArrowUpRight size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </motion.section>

        <footer className="mt-6 border-t border-[#293945] pt-4 text-[10px] text-[#71848F]">
          Application status reflects the latest recorded decision.
        </footer>

        <AnimatePresence>
          {selectedApplication && (
            <ApplicationDetailsModal
              application={selectedApplication}
              onClose={() => {
                if (!updating) setSelectedApplication(null);
              }}
              onUpdate={handleUpdateStatus}
              updating={updating}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
