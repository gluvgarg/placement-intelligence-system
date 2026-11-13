
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowUpDown,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Edit3,
  Filter,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  getAllJobsForAdmin,
  getAllCompanies,
  createJob,
  updateJob,
  deleteJob,
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

const getCompanyId = (job) => {
  if (job?.companyId && typeof job.companyId === "object") {
    return job.companyId._id || "";
  }

  return job?.companyId || "";
};

const getCompanyName = (job) => {
  if (job?.companyId && typeof job.companyId === "object") {
    return job.companyId.name || "Company unavailable";
  }

  return "Company unavailable";
};

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

const toDateInputValue = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Save the selected calendar date at 23:59:59 local time.
const toEndOfDayISO = (dateValue) => {
  const [year, month, day] = dateValue.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day,
    23,
    59,
    59,
    999
  ).toISOString();
};

const getLifecycle = (job) => {
  const deadline = new Date(job.applicationDeadline);

  if (
    job.applicationDeadline &&
    !Number.isNaN(deadline.getTime()) &&
    deadline < new Date()
  ) {
    return "expired";
  }

  return job.status === "closed" ? "closed" : "active";
};

const getLifecycleLabel = (lifecycle) => {
  const labels = {
    active: "Active",
    closed: "Closed",
    expired: "Expired",
  };

  return labels[lifecycle] || "Unknown";
};

const lifecycleStyles = {
  active: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  closed: "border-slate-400/20 bg-slate-400/10 text-slate-300",
  expired: "border-rose-400/20 bg-rose-400/10 text-rose-300",
};

const inputClass =
  "w-full rounded-xl border border-[#354955] bg-[#111B24] px-3.5 py-3 text-sm text-[#E1E9ED] outline-none transition placeholder:text-[#627681] focus:border-[#6F9E9E] focus:ring-2 focus:ring-[#5B9295]/10";

const labelClass =
  "mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#91A3AE]";

/* --------------------------------------------------
   Job form modal
-------------------------------------------------- */

function JobModal({
  job,
  companies,
  onClose,
  onSave,
  saving,
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    companyId: "",
    jobType: "Full-Time",
    mode: "On-site",
    salary: "",
    applicationDeadline: "",
    skillsText: "",
    status: "active",
  });

  const [formError, setFormError] = useState("");

  useEffect(() => {
    setForm({
      title: job?.title || "",
      description: job?.description || "",
      companyId: getCompanyId(job),
      jobType: job?.jobType || "Full-Time",
      mode: job?.mode || "On-site",
      salary: job?.salary ?? "",
      applicationDeadline: toDateInputValue(
        job?.applicationDeadline
      ),
      skillsText: Array.isArray(job?.skills)
        ? job.skills.join(", ")
        : "",
      status: job?.status || "active",
    });

    setFormError("");
  }, [job]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.companyId) {
      setFormError("Please select a company.");
      return;
    }

    const deadlineISO = toEndOfDayISO(
      form.applicationDeadline
    );

    if (form.status === "active" && new Date(deadlineISO) <= new Date()) {
      setFormError(
        "An active job must have a future application deadline."
      );
      return;
    }

    const salaryValue = Number(form.salary);

    if (!Number.isFinite(salaryValue) || salaryValue < 0) {
      setFormError("Enter a valid salary amount.");
      return;
    }

    const skills = form.skillsText
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      companyId: form.companyId,
      jobType: form.jobType,
      mode: form.mode,
      salary: salaryValue,
      applicationDeadline: deadlineISO,
      skills,
      ...(job ? { status: form.status } : {}),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.98 }}
        transition={{ duration: 0.24 }}
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#3B505D] bg-[#15212A] shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#2E414C] px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#82A9B1]">
              Recruitment operations
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#EAF0F2]">
              {job ? "Edit job posting" : "Create job posting"}
            </h2>

            <p className="mt-1 text-xs text-[#8799A4]">
              {job
                ? "Update the position details and availability."
                : "Publish a new opportunity under a registered company."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close modal"
            className="rounded-lg border border-[#354955] p-2 text-[#91A3AE] transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[68vh] space-y-5 overflow-y-auto px-5 py-6 sm:px-7">
            {formError && (
              <div className="flex gap-2 rounded-lg border border-rose-400/20 bg-rose-400/[0.06] p-3 text-xs text-rose-200">
                <CircleAlert size={15} className="mt-0.5 shrink-0" />
                {formError}
              </div>
            )}

            <div>
              <label className={labelClass}>
                Job title <span className="text-rose-400">*</span>
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Software Development Engineer"
                className={inputClass}
                required
                maxLength={120}
              />
            </div>

            <div>
              <label className={labelClass}>
                Company <span className="text-rose-400">*</span>
              </label>

              <select
                name="companyId"
                value={form.companyId}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select a registered company</option>

                {companies.map((company) => (
                  <option key={company._id} value={company._id}>
                    {company.name}
                  </option>
                ))}
              </select>

              {companies.length === 0 && (
                <p className="mt-2 text-[10px] text-amber-300">
                  Register a company before creating a job.
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Job description <span className="text-rose-400">*</span>
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities and requirements..."
                rows={5}
                maxLength={10000}
                className={`${inputClass} resize-y`}
                required
              />

              <p className="mt-1 text-right text-[10px] text-[#6E828E]">
                {form.description.length}/10000
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Employment type
                </label>

                <select
                  name="jobType"
                  value={form.jobType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Work mode
                </label>

                <select
                  name="mode"
                  value={form.mode}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Salary amount (₹) <span className="text-rose-400">*</span>
                </label>

                <input
                  type="number"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                  placeholder="e.g. 600000"
                  min="0"
                  step="any"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Application deadline <span className="text-rose-400">*</span>
                </label>

                <input
                  type="date"
                  name="applicationDeadline"
                  value={form.applicationDeadline}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Required skills
              </label>

              <input
                name="skillsText"
                value={form.skillsText}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB, Java"
                className={inputClass}
              />

              <p className="mt-1 text-[10px] text-[#738894]">
                Separate skills with commas.
              </p>
            </div>

            {job && (
              <div>
                <label className={labelClass}>
                  Posting status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>

                <p className="mt-1 text-[10px] text-[#738894]">
                  Reopening an expired job also requires extending its deadline.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse justify-end gap-2 border-t border-[#2E414C] px-5 py-4 sm:flex-row sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-[#40545F] px-5 py-2.5 text-xs font-medium text-[#B8C6CE] transition hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || companies.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6F9E9E] px-5 py-2.5 text-xs font-semibold text-[#101820] transition hover:bg-[#8BB5B4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}

              {saving
                ? "Saving..."
                : job
                  ? "Save changes"
                  : "Create job"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------------------------
   Delete confirmation
-------------------------------------------------- */

function DeleteModal({
  job,
  onCancel,
  onConfirm,
  deleting,
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12 }}
        className="w-full max-w-md rounded-2xl border border-[#67434A] bg-[#1A222A] p-6 shadow-2xl"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-400/10 text-rose-300">
          <Trash2 size={20} />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-[#EDF1F3]">
          Delete this job?
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#A0ADB5]">
          You are about to permanently delete{" "}
          <span className="font-semibold text-[#E7EEF1]">
            {job?.title}
          </span>
          .
        </p>

        <div className="mt-4 flex gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-3">
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0 text-amber-300"
          />

          <p className="text-[11px] leading-5 text-amber-100/80">
            Existing applications are not automatically deleted
            with this job. Their job reference may no longer resolve.
            Consider closing the job instead.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg border border-[#455967] px-4 py-2.5 text-xs font-medium text-[#C0CCD2] transition hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
          >
            {deleting && (
              <RefreshCw size={13} className="animate-spin" />
            )}
            {deleting ? "Deleting..." : "Delete job"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------------------------
   Job Management page
-------------------------------------------------- */

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    const [jobsResult, companiesResult] = await Promise.allSettled([
      getAllJobsForAdmin(),
      getAllCompanies(),
    ]);

    const errors = [];

    if (jobsResult.status === "fulfilled") {
      setJobs(extractArray(jobsResult.value));
    } else {
      errors.push(
        jobsResult.reason?.message || "Unable to load job postings."
      );
    }

    if (companiesResult.status === "fulfilled") {
      setCompanies(extractArray(companiesResult.value));
    } else {
      errors.push(
        companiesResult.reason?.message || "Unable to load companies."
      );
    }

    if (errors.length) {
      setError(errors.join(" "));
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const active = jobs.filter(
      (job) => getLifecycle(job) === "active"
    ).length;

    const closed = jobs.filter(
      (job) => getLifecycle(job) === "closed"
    ).length;

    const expired = jobs.filter(
      (job) => getLifecycle(job) === "expired"
    ).length;

    return {
      total: jobs.length,
      active,
      closed,
      expired,
    };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = jobs.filter((job) => {
      const lifecycle = getLifecycle(job);
      const companyName = getCompanyName(job);

      const matchesSearch =
        !term ||
        [
          job.title,
          companyName,
          job.jobType,
          job.mode,
          ...(Array.isArray(job.skills) ? job.skills : []),
        ].some((value) =>
          String(value || "").toLowerCase().includes(term)
        );

      const matchesStatus =
        statusFilter === "all" || lifecycle === statusFilter;

      const matchesType =
        typeFilter === "all" || job.jobType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    return filtered.sort((a, b) => {
      if (sortOrder === "oldest") {
        return new Date(a.createdAt || 0) -
          new Date(b.createdAt || 0);
      }

      if (sortOrder === "deadline") {
        return new Date(a.applicationDeadline || 0) -
          new Date(b.applicationDeadline || 0);
      }

      return new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0);
    });
  }, [jobs, search, statusFilter, typeFilter, sortOrder]);

  const openCreateModal = () => {
    setSelectedJob(null);
    setModalOpen(true);
    setError("");
    setNotice("");
  };

  const openEditModal = (job) => {
    setSelectedJob(job);
    setModalOpen(true);
    setError("");
    setNotice("");
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setSelectedJob(null);
  };

  const handleSaveJob = async (jobData) => {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (selectedJob) {
        await updateJob(selectedJob._id, jobData);
        setNotice("Job details updated successfully.");
      } else {
        const { companyId, ...payload } = jobData;
        await createJob(companyId, payload);
        setNotice("Job posting created successfully.");
      }

      setModalOpen(false);
      setSelectedJob(null);
      await loadData(true);
    } catch (err) {
      setError(err.message || "Unable to save job posting.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete?._id) return;

    setDeleting(true);
    setError("");
    setNotice("");

    try {
      await deleteJob(jobToDelete._id);

      setJobs((previous) =>
        previous.filter((job) => job._id !== jobToDelete._id)
      );

      setNotice(`"${jobToDelete.title}" was deleted.`);
      setJobToDelete(null);
    } catch (err) {
      setError(err.message || "Unable to delete job.");
    } finally {
      setDeleting(false);
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
              Job postings
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#91A3AE]">
              Create and manage recruitment opportunities across
              registered companies.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            disabled={companies.length === 0}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-[#6F9E9E] px-5 py-3 text-xs font-semibold text-[#101820] transition hover:bg-[#8BB5B4] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
            Create job
          </button>
        </motion.div>

        {/* Messages */}
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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="mb-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#2B3C47] bg-[#141F28] sm:grid-cols-4"
        >
          {[
            {
              label: "All postings",
              value: stats.total,
              icon: BriefcaseBusiness,
              style: "text-[#9BC4C1] bg-[#5B9295]/10",
            },
            {
              label: "Active",
              value: stats.active,
              icon: Check,
              style: "text-emerald-300 bg-emerald-400/10",
            },
            {
              label: "Closed",
              value: stats.closed,
              icon: X,
              style: "text-slate-300 bg-slate-400/10",
            },
            {
              label: "Expired",
              value: stats.expired,
              icon: Clock3,
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
                  index < 2 ? "border-b border-[#2B3C47] sm:border-b-0" : ""
                } ${
                  index === 1 ? "sm:border-r" : ""
                } ${
                  index === 2 ? "sm:border-r" : ""
                }`}
              >
                <div className={`rounded-lg p-2.5 ${item.style}`}>
                  <Icon size={17} />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#81939E]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-[#E6EDF1]">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Filters */}
        <section className="mb-5 rounded-2xl border border-[#2B3C47] bg-[#141F28] p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#758A96]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search job title, company or skill..."
                className="w-full rounded-xl border border-[#354955] bg-[#101922] py-3 pl-10 pr-4 text-xs text-[#E1E9ED] outline-none transition placeholder:text-[#71848F] focus:border-[#6F9E9E]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="appearance-none rounded-xl border border-[#354955] bg-[#101922] py-3 pl-3 pr-8 text-xs text-[#BDCAD1] outline-none focus:border-[#6F9E9E]"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="expired">Expired</option>
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#82939E]"
                />
              </div>

              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="appearance-none rounded-xl border border-[#354955] bg-[#101922] py-3 pl-3 pr-8 text-xs text-[#BDCAD1] outline-none focus:border-[#6F9E9E]"
                >
                  <option value="all">All job types</option>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Internship">Internship</option>
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#82939E]"
                />
              </div>

              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="appearance-none rounded-xl border border-[#354955] bg-[#101922] py-3 pl-3 pr-8 text-xs text-[#BDCAD1] outline-none focus:border-[#6F9E9E]"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="deadline">Deadline</option>
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#82939E]"
                />
              </div>

              <button
                type="button"
                onClick={() => loadData(true)}
                disabled={refreshing || loading}
                title="Refresh job postings"
                className="rounded-xl border border-[#354955] bg-[#1B2932] p-3 text-[#AFC0C8] transition hover:border-[#6F9E9E] hover:text-white disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] text-[#82939E]">
            <span>
              Showing {filteredJobs.length} of {jobs.length} postings
            </span>

            {(search || statusFilter !== "all" || typeFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
                className="text-[#91BDBA] hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Job records */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="overflow-hidden rounded-2xl border border-[#2B3C47] bg-[#141F28]"
        >
          <div className="flex items-center justify-between border-b border-[#2B3C47] px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-[#E3EBEF]">
                Job directory
              </h2>
              <p className="mt-1 text-[10px] text-[#82939E]">
                Job postings across registered companies
              </p>
            </div>

            <span className="rounded-lg border border-[#354955] bg-[#1B2932] px-2.5 py-1.5 text-[10px] text-[#AABBC4]">
              {jobs.length} records
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
          ) : filteredJobs.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <BriefcaseBusiness
                size={27}
                className="mx-auto text-[#748A96]"
              />

              <p className="mt-3 text-sm font-medium text-[#DCE5E9]">
                {search || statusFilter !== "all" || typeFilter !== "all"
                  ? "No matching job postings"
                  : "No jobs registered yet"}
              </p>

              <p className="mt-1 text-xs text-[#82939E]">
                {search || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try changing your search or filters."
                  : "Create a job posting for one of your registered companies."}
              </p>

              {jobs.length === 0 && companies.length > 0 && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#6F9E9E] px-4 py-2.5 text-xs font-semibold text-[#101820] hover:bg-[#8BB5B4]"
                >
                  <Plus size={14} /> Create job
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1000px] text-left">
                  <thead className="bg-[#111A22]">
                    <tr className="text-[9px] uppercase tracking-[0.13em] text-[#7F929D]">
                      <th className="px-6 py-4 font-medium">Position</th>
                      <th className="px-4 py-4 font-medium">Type / Mode</th>
                      <th className="px-4 py-4 font-medium">Salary</th>
                      <th className="px-4 py-4 font-medium">Deadline</th>
                      <th className="px-4 py-4 font-medium">Status</th>
                      <th className="px-5 py-4 text-right font-medium">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredJobs.map((job, index) => {
                      const lifecycle = getLifecycle(job);
                      const company = job.companyId;
                      const companyLogo =
                        company && typeof company === "object"
                          ? company.logo
                          : "";

                      return (
                        <motion.tr
                          key={job._id}
                          initial={{ opacity: 0, y: 7 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.025 }}
                          className="border-t border-[#293A44] transition-colors hover:bg-[#1A2932]/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#3A505B] bg-[#20313A] text-sm font-semibold text-[#B7CCD3]">
                                {companyLogo ? (
                                  <img
                                    src={companyLogo}
                                    alt={getCompanyName(job)}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  getCompanyName(job)
                                    .charAt(0)
                                    .toUpperCase()
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[230px] truncate text-xs font-semibold text-[#DEE7EB]">
                                  {job.title}
                                </p>
                                <p className="mt-1 max-w-[230px] truncate text-[10px] text-[#82939E]">
                                  {getCompanyName(job)}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <p className="text-xs text-[#C2CED4]">
                              {job.jobType}
                            </p>
                            <p className="mt-1 text-[10px] text-[#82939E]">
                              {job.mode}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-xs text-[#B8C6CD]">
                            {Number(job.salary || 0).toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            })}
                          </td>

                          <td className="px-4 py-4">
                            <p className="text-xs text-[#B8C6CD]">
                              {formatDate(job.applicationDeadline)}
                            </p>
                            <p className="mt-1 text-[10px] text-[#82939E]">
                              Posted {formatDate(job.createdAt)}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-medium ${lifecycleStyles[lifecycle]}`}
                            >
                              {getLifecycleLabel(lifecycle)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(job)}
                                title="Edit job"
                                className="rounded-lg border border-[#405763] p-2 text-[#9DB8C1] transition hover:border-[#6F9E9E] hover:bg-[#5B9295]/10 hover:text-white"
                              >
                                <Edit3 size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setJobToDelete(job)}
                                title="Delete job"
                                className="rounded-lg border border-[#60434A] p-2 text-[#D69A9F] transition hover:border-rose-400/60 hover:bg-rose-400/10 hover:text-rose-200"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredJobs.map((job) => {
                  const lifecycle = getLifecycle(job);
                  const company = job.companyId;
                  const companyLogo =
                    company && typeof company === "object"
                      ? company.logo
                      : "";

                  return (
                    <div
                      key={job._id}
                      className="rounded-xl border border-[#354955] bg-[#111B24] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#3A505B] bg-[#20313A] text-sm font-semibold text-[#B7CCD3]">
                          {companyLogo ? (
                            <img
                              src={companyLogo}
                              alt={getCompanyName(job)}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            getCompanyName(job).charAt(0).toUpperCase()
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#E2EAEF]">
                            {job.title}
                          </p>
                          <p className="mt-1 text-xs text-[#82939E]">
                            {getCompanyName(job)}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2 py-1 text-[9px] ${lifecycleStyles[lifecycle]}`}
                        >
                          {getLifecycleLabel(lifecycle)}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#2B3C47] pt-3 text-xs">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-[#718792]">
                            Employment
                          </p>
                          <p className="mt-1 text-[#B8C6CD]">
                            {job.jobType} · {job.mode}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-[#718792]">
                            Salary
                          </p>
                          <p className="mt-1 text-[#B8C6CD]">
                            {Number(job.salary || 0).toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-[#718792]">
                            Deadline
                          </p>
                          <p className="mt-1 text-[#B8C6CD]">
                            {formatDate(job.applicationDeadline)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-[#718792]">
                            Posted
                          </p>
                          <p className="mt-1 text-[#B8C6CD]">
                            {formatDate(job.createdAt)}
                          </p>
                        </div>
                      </div>

                      {job.skills?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {job.skills.slice(0, 5).map((skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className="rounded-md border border-[#344955] bg-[#1B2932] px-2 py-1 text-[9px] text-[#AFC1CB]"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 5 && (
                            <span className="rounded-md border border-[#344955] bg-[#1B2932] px-2 py-1 text-[9px] text-[#82939E]">
                              +{job.skills.length - 5}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex justify-end gap-2 border-t border-[#2B3C47] pt-3">
                        <button
                          type="button"
                          onClick={() => openEditModal(job)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#405763] px-3 py-2 text-[10px] text-[#B8C9D0]"
                        >
                          <Edit3 size={12} /> Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => setJobToDelete(job)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#60434A] px-3 py-2 text-[10px] text-[#D69A9F]"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </motion.section>

        {/* Modals */}
        <AnimatePresence>
          {modalOpen && (
            <JobModal
              job={selectedJob}
              companies={companies}
              onClose={closeModal}
              onSave={handleSaveJob}
              saving={saving}
            />
          )}

          {jobToDelete && (
            <DeleteModal
              job={jobToDelete}
              onCancel={() => {
                if (!deleting) setJobToDelete(null);
              }}
              onConfirm={handleDeleteJob}
              deleting={deleting}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
