
import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Building2,
  MapPin,
  CalendarDays,
  Clock3,
  FileText,
  ArrowUpRight,
  X,
  CheckCircle2,
  CircleDot,
  RefreshCw,
  RotateCcw,
  Briefcase,
  AlertCircle,
  Ban,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import {
  getMyApplications,
  withdrawApplication as withdrawApplicationRequest,
} from "../../services/api.js";


// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const STATUS_META = {
  applied: {
    label: "Applied",
    color: "blue",
    step: 1,
  },
  under_review: {
    label: "Under Review",
    color: "blue",
    step: 2,
  },
  assessment: {
    label: "Assessment",
    color: "violet",
    step: 2,
  },
  shortlisted: {
    label: "Shortlisted",
    color: "teal",
    step: 3,
  },
  interview_scheduled: {
    label: "Interview Scheduled",
    color: "amber",
    step: 4,
  },
  selected: {
    label: "Selected",
    color: "green",
    step: 5,
  },
  rejected: {
    label: "Not Selected",
    color: "red",
    step: 0,
  },
  withdrawn: {
    label: "Withdrawn",
    color: "gray",
    step: 0,
  },
};

const ACTIVE_STATUSES = [
  "applied",
  "under_review",
  "assessment",
  "shortlisted",
  "interview_scheduled",
];

const FINAL_STATUSES = [
  "selected",
  "rejected",
  "withdrawn",
];

const PROGRESS_STAGES = [
  "Applied",
  "Review",
  "Shortlisted",
  "Interview",
  "Decision",
];


// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const getApplications = (response) => {
  return Array.isArray(response?.data)
    ? response.data
    : [];
};


const getJob = (application) => {
  return application?.jobId &&
    typeof application.jobId === "object"
    ? application.jobId
    : null;
};


const getCompany = (job) => {
  return job?.companyId &&
    typeof job.companyId === "object"
    ? job.companyId
    : {};
};


const getInitials = (name = "Company") => {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};


const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};


const formatDateTime = (value) => {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};


const getStatusMeta = (status) => {
  return STATUS_META[status] || {
    label: status || "Unknown",
    color: "gray",
    step: 0,
  };
};


const getStatusClass = (color) => {
  const colors = {
    blue: "border-blue-400/30 bg-blue-400/10 text-blue-300",
    violet: "border-violet-400/30 bg-violet-400/10 text-violet-300",
    teal: "border-[#5B9295]/40 bg-[#5B9295]/10 text-[#A5C3C6]",
    amber: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    red: "border-red-400/30 bg-red-400/10 text-red-300",
    gray: "border-[#455967] bg-[#354652]/40 text-[#AAB7C2]",
  };

  return colors[color] || colors.gray;
};


// --------------------------------------------------
// STATUS PROGRESS
// --------------------------------------------------

const ApplicationProgress = ({ status }) => {

  const meta = getStatusMeta(status);

  if (status === "rejected" || status === "withdrawn") {
    return null;
  }

  return (
    <div className="mt-5">

      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-[#8796A2]">
          Placement progress
        </p>

        <p className="text-xs text-[#A5C3C6]">
          {meta.label}
        </p>
      </div>

      <div className="flex items-center">

        {PROGRESS_STAGES.map((stage, index) => {

          const active = index + 1 <= meta.step;

          return (
            <div key={stage} className="flex min-w-0 flex-1 items-center">

              <div className="flex flex-col items-center">

                <div className={`flex h-6 w-6 items-center
                justify-center rounded-full border
                ${active
                  ? "border-[#5B9295] bg-[#5B9295]/20 text-[#A5C3C6]"
                  : "border-[#455967] bg-[#111820] text-[#71808C]"
                }`}>

                  {active
                    ? <CheckCircle2 size={14}/>
                    : <CircleDot size={13}/>
                  }

                </div>

                <span className={`mt-2 text-[9px] sm:text-[10px]
                ${active ? "text-[#A5C3C6]" : "text-[#71808C]"}`}>
                  {stage}
                </span>

              </div>

              {index < PROGRESS_STAGES.length - 1 && (
                <div className={`mb-5 h-px flex-1
                ${index + 1 < meta.step
                  ? "bg-[#5B9295]"
                  : "bg-[#354652]"
                }`} />
              )}

            </div>
          );

        })}

      </div>

    </div>
  );
};


// --------------------------------------------------
// APPLICATION CARD
// --------------------------------------------------

const ApplicationCard = ({
  application,
  onView,
}) => {

  const job = getJob(application);

  const company = getCompany(job);

  const status = getStatusMeta(application.status);

  const canWithdraw =
    !FINAL_STATUSES.includes(application.status);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#354652]
      bg-[#1C2933] p-5 transition
      hover:border-[#5B9295]/60 sm:p-6"
    >

      {/* Header */}
      <div className="flex items-start justify-between gap-3">

        <div className="flex min-w-0 items-start gap-4">

          <div className="flex h-12 w-12 shrink-0
          items-center justify-center overflow-hidden
          rounded-lg border border-[#455967]
          bg-[#111820] text-sm font-bold text-[#A5C3CE]">

            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name || "Company"}
                className="h-full w-full object-contain"
              />
            ) : (
              getInitials(company.name)
            )}

          </div>

          <div className="min-w-0">

            <h3 className="truncate text-lg font-semibold text-[#F0F3F5]">
              {job?.title || "Job no longer available"}
            </h3>

            <p className="mt-1 text-sm text-[#AAB7C2]">
              {company.name || "Company information unavailable"}
            </p>

            {company.location && (
              <p className="mt-2 flex items-center gap-1.5
              text-xs text-[#8796A2]">
                <MapPin size={13}/>
                {company.location}
              </p>
            )}

          </div>

        </div>


        <span className={`shrink-0 rounded-md border
        px-2.5 py-1.5 text-[10px] font-semibold
        ${getStatusClass(status.color)}`}>
          {status.label}
        </span>

      </div>


      {/* Application Information */}
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3
      border-y border-[#354652] py-4">

        <div>
          <p className="text-[10px] tracking-wider text-[#71808C]">
            APPLICATION DATE
          </p>

          <p className="mt-1 flex items-center gap-1.5
          text-xs text-[#C5D0D6]">
            <CalendarDays size={13}/>
            {formatDate(application.appliedAt)}
          </p>
        </div>

        <div>
          <p className="text-[10px] tracking-wider text-[#71808C]">
            EMPLOYMENT
          </p>

          <p className="mt-1 text-xs text-[#C5D0D6]">
            {job?.jobType || "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] tracking-wider text-[#71808C]">
            LAST UPDATED
          </p>

          <p className="mt-1 flex items-center gap-1.5
          text-xs text-[#C5D0D6]">
            <Clock3 size={13}/>
            {formatDate(application.statusUpdatedAt)}
          </p>
        </div>

      </div>


      {/* Progress */}
      <ApplicationProgress status={application.status}/>


      {/* Footer */}
      <div className="mt-5 flex flex-wrap
      justify-between gap-3">

        {application.interviewDate && (
          <p className="flex items-center gap-2
          text-xs text-amber-300">
            <CalendarDays size={14}/>
            Interview: {formatDateTime(application.interviewDate)}
          </p>
        )}

        <button
          type="button"
          onClick={() => onView(application)}
          className="ml-auto flex items-center gap-2
          text-sm font-semibold text-[#91AFC0]
          transition hover:text-white"
        >
          View details
          <ArrowUpRight size={16}/>
        </button>

      </div>

      {canWithdraw && (
        <p className="mt-3 text-[10px] text-[#71808C]">
          You can withdraw this application while it is in progress.
        </p>
      )}

    </motion.article>
  );
};


// --------------------------------------------------
// MAIN APPLICATIONS PAGE
// --------------------------------------------------

const Applications = () => {

  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedApplication, setSelectedApplication] = useState(null);

  const [withdrawing, setWithdrawing] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");


  // ------------------------------------------------
  // FETCH APPLICATIONS
  // ------------------------------------------------

  const loadApplications = async (refresh = false) => {

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {

      const response = await getMyApplications();

      setApplications(getApplications(response));

    } catch (err) {

      setError(
        err.message || "Unable to load your applications."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  };


  useEffect(() => {
    loadApplications();
  }, []);


  // ------------------------------------------------
  // APPLICATION STATISTICS
  // ------------------------------------------------

  const statistics = useMemo(() => {

    return {
      total: applications.length,

      active: applications.filter((item) =>
        ACTIVE_STATUSES.includes(item.status)
      ).length,

      interviews: applications.filter(
        (item) => item.status === "interview_scheduled"
      ).length,

      outcomes: applications.filter((item) =>
        ["selected", "rejected"].includes(item.status)
      ).length,
    };

  }, [applications]);


  // ------------------------------------------------
  // SEARCH AND FILTER
  // ------------------------------------------------

  const filteredApplications = useMemo(() => {

    const query = search.trim().toLowerCase();

    return [...applications]
      .filter((application) => {

        const job = getJob(application);
        const company = getCompany(job);

        const matchesSearch = !query || [
          job?.title,
          company.name,
          company.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" &&
            ACTIVE_STATUSES.includes(application.status)) ||
          (statusFilter === "interview" &&
            application.status === "interview_scheduled") ||
          (statusFilter === "selected" &&
            application.status === "selected") ||
          (statusFilter === "rejected" &&
            application.status === "rejected") ||
          (statusFilter === "withdrawn" &&
            application.status === "withdrawn");

        return matchesSearch && matchesStatus;

      })
      .sort(
        (a, b) =>
          new Date(b.appliedAt || 0) -
          new Date(a.appliedAt || 0)
      );

  }, [applications, search, statusFilter]);


  // ------------------------------------------------
  // WITHDRAW APPLICATION
  // ------------------------------------------------

  const handleWithdraw = async () => {

    if (!selectedApplication) return;

    setWithdrawing(true);
    setActionError("");
    setNotice("");

    try {

      const response = await withdrawApplicationRequest(
        selectedApplication._id
      );

      const updatedApplication = {
        ...selectedApplication,
        ...(response?.data || {}),
        status: "withdrawn",
        statusUpdatedAt: response?.data?.statusUpdatedAt ||
          new Date().toISOString(),
      };

      setApplications((prev) =>
        prev.map((item) =>
          item._id === selectedApplication._id
            ? {
                ...item,
                status: "withdrawn",
                statusUpdatedAt: updatedApplication.statusUpdatedAt,
              }
            : item
        )
      );

      setSelectedApplication(updatedApplication);

      setConfirmWithdraw(false);

      setNotice("Application withdrawn successfully.");

    } catch (err) {

      setActionError(
        err.message || "Unable to withdraw application."
      );

    } finally {

      setWithdrawing(false);

    }

  };


  // ------------------------------------------------
  // RESET FILTERS
  // ------------------------------------------------

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };


  // ------------------------------------------------
  // LOADING STATE
  // ------------------------------------------------

  if (loading) {

    return (
      <div className="min-h-screen bg-[#111820]
      px-5 pt-36">

        <div className="mx-auto max-w-7xl animate-pulse">

          <div className="h-4 w-44 rounded bg-[#273640]"/>
          <div className="mt-5 h-10 w-80 rounded bg-[#273640]"/>

          <div className="mt-8 grid grid-cols-2 gap-3
          lg:grid-cols-4">

            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-24 rounded-xl bg-[#1C2933]"/>
            ))}

          </div>

          <div className="mt-8 space-y-4">
            <div className="h-52 rounded-xl bg-[#1C2933]"/>
            <div className="h-52 rounded-xl bg-[#1C2933]"/>
          </div>

        </div>

      </div>
    );

  }


  // ------------------------------------------------
  // DETAIL PANEL DATA
  // ------------------------------------------------

  const selectedJob = getJob(selectedApplication);
  const selectedCompany = getCompany(selectedJob);

  const selectedStatus = getStatusMeta(
    selectedApplication?.status
  );

  const canWithdraw = selectedApplication &&
    !FINAL_STATUSES.includes(selectedApplication.status);


  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------

  return (

    <div className="min-h-screen bg-[#111820]
    px-4 pb-16 pt-28 sm:px-6 lg:px-12">

      <div className="mx-auto max-w-7xl">


        {/* PAGE HEADER */}
        <div className="mb-8">

          <div className="flex items-center justify-between gap-3">

            <p className="text-xs font-semibold
            tracking-[0.2em] text-[#5B9295]">
              STUDENT PORTAL / PLACEMENT ACTIVITY
            </p>

            <button
              type="button"
              onClick={() => loadApplications(true)}
              disabled={refreshing}
              className="flex items-center gap-2
              text-xs font-medium text-[#91AFC0]
              hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

          </div>


          <h1 className="mt-4 text-3xl font-bold
          tracking-tight text-[#F0F3F5] sm:text-4xl">
            My Applications
          </h1>

          <p className="mt-3 max-w-xl text-sm
          leading-7 text-[#AAB7C2]">
            Keep track of the opportunities you've pursued
            and stay updated on your placement progress.
          </p>

        </div>


        {/* PAGE ERROR */}
        {error && (
          <div className="mb-6 flex flex-wrap items-center
          justify-between gap-3 rounded-lg
          border border-red-500/30 bg-red-500/10 p-4">

            <p className="text-sm text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadApplications()}
              className="text-sm font-semibold text-red-200"
            >
              Try again
            </button>

          </div>
        )}


        {/* STATISTICS */}
        <div className="mb-8 grid grid-cols-2
        gap-3 lg:grid-cols-4">

          {[
            {
              label: "Total applications",
              value: statistics.total,
              icon: Briefcase,
            },
            {
              label: "In process",
              value: statistics.active,
              icon: Clock3,
            },
            {
              label: "Interviews",
              value: statistics.interviews,
              icon: CalendarDays,
            },
            {
              label: "Final outcomes",
              value: statistics.outcomes,
              icon: CheckCircle2,
            },
          ].map((stat) => {

            const Icon = stat.icon;

            return (
              <div key={stat.label}
                className="rounded-xl border
                border-[#354652] bg-[#1C2933] p-4 sm:p-5">

                <div className="flex items-center
                justify-between">

                  <p className="text-xs text-[#8796A2]">
                    {stat.label}
                  </p>

                  <Icon size={18} className="text-[#91AFC0]"/>

                </div>

                <p className="mt-4 text-3xl font-bold
                tracking-tight text-[#F0F3F5]">
                  {stat.value}
                </p>

              </div>
            );

          })}

        </div>


        {/* APPLICATION FILTERS */}
        <div className="mb-6 rounded-xl
        border border-[#354652] bg-[#1C2933] p-3">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">

              <Search size={17} className="absolute
              left-4 top-1/2 -translate-y-1/2
              text-[#8796A2]"/>

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by job title or company..."
                className="w-full rounded-lg
                border border-[#354652] bg-[#111820]
                py-3 pl-11 pr-4 text-sm text-[#E1E7EB]
                outline-none placeholder:text-[#71808C]
                focus:border-[#5B9295]"
              />

            </div>


            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-[#354652]
              bg-[#111820] px-4 py-3 text-sm
              text-[#D5DEE4] outline-none
              focus:border-[#5B9295]"
            >
              <option value="all">All applications</option>
              <option value="active">In process</option>
              <option value="interview">Interviews</option>
              <option value="selected">Selected</option>
              <option value="rejected">Not selected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>


            {(search || statusFilter !== "all") && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center justify-center
                gap-2 rounded-lg border border-[#455967]
                px-4 py-3 text-xs font-semibold
                text-[#AAB7C2] hover:bg-white/5"
              >
                <RotateCcw size={14}/>
                Reset
              </button>
            )}

          </div>

        </div>


        {/* RESULTS HEADER */}
        <div className="mb-4 flex items-center justify-between">

          <div>
            <h2 className="font-semibold text-[#F0F3F5]">
              Application records
            </h2>

            <p className="mt-1 text-xs text-[#8796A2]">
              {filteredApplications.length} records found
            </p>
          </div>

        </div>


        {/* APPLICATION LIST */}
        <div className="space-y-4">

          {filteredApplications.map((application) => (

            <ApplicationCard
              key={application._id}
              application={application}
              onView={(item) => {
                setSelectedApplication(item);
                setConfirmWithdraw(false);
                setActionError("");
                setNotice("");
              }}
            />

          ))}


          {/* EMPTY STATE */}
          {filteredApplications.length === 0 && (

            <div className="rounded-xl border
            border-dashed border-[#455967]
            bg-[#1C2933]/60 px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14
              items-center justify-center rounded-xl
              bg-[#5B9295]/10 text-[#91AFC0]">
                <FileText size={25}/>
              </div>

              <h3 className="mt-5 text-lg font-semibold text-[#E1E7EB]">
                {applications.length === 0
                  ? "No applications yet"
                  : "No matching applications"
                }
              </h3>

              <p className="mx-auto mt-2 max-w-sm
              text-sm leading-6 text-[#8796A2]">
                {applications.length === 0
                  ? "Once you apply for an opportunity, your application details and progress will appear here."
                  : "Try changing your search or status filter."
                }
              </p>

              {applications.length === 0 ? (

                <a
                  href="/student/jobs"
                  className="mt-5 inline-flex items-center
                  gap-2 rounded-lg bg-[#5B9295]
                  px-5 py-2.5 text-sm font-semibold
                  text-[#101820] hover:bg-[#70A5A5]"
                >
                  Explore opportunities
                  <ArrowUpRight size={16}/>
                </a>

              ) : (

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-lg border
                  border-[#455967] px-5 py-2.5
                  text-sm font-semibold text-[#A5C3C6]
                  hover:bg-white/5"
                >
                  Clear filters
                </button>

              )}

            </div>

          )}

        </div>

      </div>


      {/* --------------------------------------------
          APPLICATION DETAILS PANEL
      -------------------------------------------- */}

      <AnimatePresence>

        {selectedApplication && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedApplication(null)}
            className="fixed inset-0 z-[100]
            flex items-end justify-center
            bg-black/70 backdrop-blur-sm
            sm:items-center sm:p-5"
          >

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              className="flex max-h-[92vh]
              w-full max-w-2xl flex-col
              overflow-hidden rounded-t-2xl
              border border-[#455967] bg-[#1C2933]
              shadow-2xl sm:rounded-2xl"
            >

              {/* Panel Header */}
              <div className="flex items-start
              justify-between gap-4 border-b
              border-[#354652] p-5 sm:p-7">

                <div className="flex min-w-0 gap-4">

                  <div className="flex h-12 w-12
                  shrink-0 items-center justify-center
                  overflow-hidden rounded-lg
                  border border-[#455967] bg-[#111820]
                  text-sm font-bold text-[#A5C3CE]">

                    {selectedCompany.logo ? (
                      <img
                        src={selectedCompany.logo}
                        alt={selectedCompany.name || "Company"}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      getInitials(selectedCompany.name)
                    )}

                  </div>

                  <div className="min-w-0">

                    <h2 className="text-lg font-bold text-[#F0F3F5]">
                      {selectedJob?.title || "Job details unavailable"}
                    </h2>

                    <p className="mt-1 text-sm text-[#AAB7C2]">
                      {selectedCompany.name || "Company"}
                    </p>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  aria-label="Close application details"
                  className="rounded-lg border
                  border-[#455967] p-2
                  text-[#AAB7C2] hover:text-white"
                >
                  <X size={18}/>
                </button>

              </div>


              {/* Panel Content */}
              <div className="flex-1 space-y-7 overflow-y-auto p-5 sm:p-7">


                {/* Status */}
                <section>

                  <p className="mb-3 text-xs font-semibold
                  tracking-wider text-[#8796A2]">
                    CURRENT APPLICATION STATUS
                  </p>

                  <div className="flex flex-wrap
                  items-center justify-between gap-3">

                    <span className={`rounded-md border
                    px-3 py-2 text-sm font-semibold
                    ${getStatusClass(selectedStatus.color)}`}>
                      {selectedStatus.label}
                    </span>

                    <span className="text-xs text-[#8796A2]">
                      Updated {formatDate(selectedApplication.statusUpdatedAt)}
                    </span>

                  </div>

                  {selectedApplication.status === "rejected" && (
                    <p className="mt-3 rounded-lg bg-red-500/10
                    p-3 text-sm text-red-300">
                      This application was marked as not selected.
                    </p>
                  )}

                  {selectedApplication.status === "selected" && (
                    <p className="mt-3 rounded-lg bg-emerald-500/10
                    p-3 text-sm text-emerald-300">
                      Congratulations! Your application was marked as selected.
                    </p>
                  )}

                  {selectedApplication.status === "withdrawn" && (
                    <p className="mt-3 rounded-lg bg-[#354652]/50
                    p-3 text-sm text-[#AAB7C2]">
                      You withdrew this application.
                    </p>
                  )}

                </section>


                {/* Progress */}
                {selectedApplication.status !== "rejected" &&
                 selectedApplication.status !== "withdrawn" && (

                  <section className="rounded-lg
                  border border-[#354652] bg-[#111820] p-4">

                    <h3 className="mb-5 text-sm font-semibold text-[#E1E7EB]">
                      Progress overview
                    </h3>

                    <ApplicationProgress
                      status={selectedApplication.status}
                    />

                  </section>

                )}


                {/* Application Details */}
                <section>

                  <h3 className="mb-4 text-sm font-semibold text-[#E1E7EB]">
                    Application details
                  </h3>

                  <div className="grid gap-5 sm:grid-cols-2">

                    <div>
                      <p className="text-xs text-[#8796A2]">
                        Applied on
                      </p>

                      <p className="mt-1 text-sm text-[#E1E7EB]">
                        {formatDateTime(selectedApplication.appliedAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#8796A2]">
                        Last status update
                      </p>

                      <p className="mt-1 text-sm text-[#E1E7EB]">
                        {formatDateTime(selectedApplication.statusUpdatedAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#8796A2]">
                        Employment type
                      </p>

                      <p className="mt-1 text-sm text-[#E1E7EB]">
                        {selectedJob?.jobType || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#8796A2]">
                        Work mode
                      </p>

                      <p className="mt-1 text-sm text-[#E1E7EB]">
                        {selectedJob?.mode || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#8796A2]">
                        Application deadline
                      </p>

                      <p className="mt-1 text-sm text-[#E1E7EB]">
                        {formatDate(selectedJob?.applicationDeadline)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#8796A2]">
                        Location
                      </p>

                      <p className="mt-1 text-sm text-[#E1E7EB]">
                        {selectedCompany.location || "—"}
                      </p>
                    </div>

                  </div>

                </section>


                {/* Interview Details */}
                {selectedApplication.interviewDate && (

                  <section className="rounded-lg border
                  border-amber-500/30 bg-amber-500/10 p-4">

                    <div className="flex items-center gap-3">

                      <CalendarDays size={20} className="text-amber-300"/>

                      <div>
                        <h3 className="text-sm font-semibold text-amber-200">
                          Scheduled interview
                        </h3>

                        <p className="mt-1 text-sm text-amber-100/80">
                          {formatDateTime(selectedApplication.interviewDate)}
                        </p>
                      </div>

                    </div>

                  </section>

                )}


                {/* Resume */}
                <section className="rounded-lg border
                border-[#354652] bg-[#111820] p-4">

                  <div className="flex items-center
                  justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <FileText size={20} className="text-[#91AFC0]"/>

                      <div>
                        <h3 className="text-sm font-semibold text-[#E1E7EB]">
                          Submitted resume
                        </h3>

                        <p className="mt-1 text-xs text-[#8796A2]">
                          Resume used for this application
                        </p>
                      </div>

                    </div>

                    {selectedApplication.resumeUrl && (
                      <a
                        href={selectedApplication.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex shrink-0 items-center
                        gap-2 text-xs font-semibold
                        text-[#91AFC0] hover:text-white"
                      >
                        View
                        <ArrowUpRight size={14}/>
                      </a>
                    )}

                  </div>

                </section>


                {/* Action Feedback */}
                {actionError && (
                  <div className="rounded-lg border
                  border-red-500/30 bg-red-500/10 p-3
                  text-sm text-red-300">
                    {actionError}
                  </div>
                )}

                {notice && (
                  <div className="rounded-lg border
                  border-emerald-500/30 bg-emerald-500/10
                  p-3 text-sm text-emerald-300">
                    {notice}
                  </div>
                )}


                {/* Withdraw Confirmation */}
                {confirmWithdraw && (

                  <div className="rounded-lg border
                  border-red-500/30 bg-red-500/10 p-4">

                    <p className="text-sm font-semibold text-red-200">
                      Withdraw this application?
                    </p>

                    <p className="mt-2 text-xs leading-5 text-red-200/70">
                      This action will change your application status
                      to Withdrawn.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">

                      <button
                        type="button"
                        onClick={() => setConfirmWithdraw(false)}
                        disabled={withdrawing}
                        className="rounded-lg border
                        border-[#455967] px-4 py-2
                        text-xs text-[#D5DEE4]"
                      >
                        Keep application
                      </button>

                      <button
                        type="button"
                        onClick={handleWithdraw}
                        disabled={withdrawing}
                        className="rounded-lg bg-red-500/80
                        px-4 py-2 text-xs font-semibold
                        text-white disabled:opacity-50"
                      >
                        {withdrawing
                          ? "Withdrawing..."
                          : "Confirm withdrawal"}
                      </button>

                    </div>

                  </div>

                )}

              </div>


              {/* Panel Footer */}
              <div className="flex flex-wrap
              justify-between gap-3 border-t
              border-[#354652] bg-[#111820] p-5 sm:px-7">

                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="text-sm text-[#AAB7C2] hover:text-white"
                >
                  Close
                </button>


                {canWithdraw && !confirmWithdraw && (
                  <button
                    type="button"
                    onClick={() => {
                      setNotice("");
                      setActionError("");
                      setConfirmWithdraw(true);
                    }}
                    className="flex items-center gap-2
                    rounded-lg border border-red-500/30
                    px-4 py-2.5 text-sm font-semibold
                    text-red-300 hover:bg-red-500/10"
                  >
                    <Ban size={16}/>
                    Withdraw application
                  </button>
                )}

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>

  );

};

export default Applications;
