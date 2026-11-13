
import { useEffect, useMemo, useState } from "react";

import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Clock3,
  CalendarDays,
  ArrowUpRight,
  SlidersHorizontal,
  X,
  CheckCircle2,
  FileText,
  RefreshCw,
  ChevronDown,
  RotateCcw,
} from "lucide-react";

import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

import { useAuth } from "../../context/AuthContext.jsx";

import {
  getAllJobs,
  getMyApplications,
  createApplication,
} from "../../services/api.js";


// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const getResponseArray = (response) => {
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.jobs)) {
    return response.data.jobs;
  }

  return [];
};


const getJobCompany = (job) => {
  return job?.companyId &&
    typeof job.companyId === "object"
    ? job.companyId
    : {};
};


const getCompanyInitials = (name = "Company") => {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};


const formatSalary = (salary) => {
  if (
    salary === undefined ||
    salary === null ||
    salary === ""
  ) {
    return "Not disclosed";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(salary));
};


const getDaysLeft = (deadline) => {
  const difference =
    new Date(deadline).getTime() - Date.now();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
};


const formatDeadline = (deadline) => {
  if (!deadline) return "Deadline unavailable";

  return new Date(deadline).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};


const formatDate = (date) => {
  if (!date) return "Recently posted";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};


const isRecentlyPosted = (createdAt) => {
  if (!createdAt) return false;

  const difference =
    Date.now() - new Date(createdAt).getTime();

  return difference <= 7 * 24 * 60 * 60 * 1000;
};


// --------------------------------------------------
// STYLING
// --------------------------------------------------

const inputClass =
  "w-full rounded-lg border border-[#354652] " +
  "bg-[#111820] px-3 py-2.5 text-sm text-[#E1E7EB] " +
  "outline-none transition focus:border-[#5B9295] " +
  "focus:ring-1 focus:ring-[#5B9295]";


// --------------------------------------------------
// JOBS PAGE
// --------------------------------------------------

const Jobs = () => {

  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("all");
  const [mode, setMode] = useState("all");
  const [skillFilter, setSkillFilter] = useState("");

  const [sortBy, setSortBy] = useState("newest");

  const [selectedJob, setSelectedJob] = useState(null);

  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState("");

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  const [refreshing, setRefreshing] = useState(false);


  // ------------------------------------------------
  // FETCH JOBS AND APPLICATIONS
  // ------------------------------------------------

  const loadJobs = async (showRefresh = false) => {

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {

      const [jobResult, applicationResult] =
        await Promise.allSettled([
          getAllJobs(),
          getMyApplications(),
        ]);

      if (jobResult.status === "rejected") {
        throw jobResult.reason;
      }

      setJobs(getResponseArray(jobResult.value));

      if (applicationResult.status === "fulfilled") {
        setApplications(
          getResponseArray(applicationResult.value)
        );
      }

    } catch (err) {

      setError(
        err.message || "Unable to load job opportunities."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  };


  useEffect(() => {
    loadJobs();
  }, []);


  // ------------------------------------------------
  // APPLIED JOB IDS
  // ------------------------------------------------

  const appliedJobIds = useMemo(() => {

    return new Set(
      applications.map((application) => {

        const job = application.jobId;

        return typeof job === "object"
          ? job?._id
          : job;

      }).filter(Boolean)
    );

  }, [applications]);


  // ------------------------------------------------
  // FILTER AND SORT JOBS
  // ------------------------------------------------

  const filteredJobs = useMemo(() => {

    let result = [...jobs];

    const query = search.trim().toLowerCase();
    const skillQuery = skillFilter.trim().toLowerCase();

    // Search across job information
    if (query) {

      result = result.filter((job) => {

        const company = getJobCompany(job);

        const searchable = [
          job.title,
          job.description,
          company.name,
          company.location,
          ...(job.skills || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(query);

      });

    }


    // Employment type
    if (jobType !== "all") {

      result = result.filter(
        (job) => job.jobType === jobType
      );

    }


    // Work mode
    if (mode !== "all") {

      result = result.filter(
        (job) => job.mode === mode
      );

    }


    // Skill filter
    if (skillQuery) {

      result = result.filter((job) =>
        (job.skills || []).some((skill) =>
          skill.toLowerCase().includes(skillQuery)
        )
      );

    }


    // Sorting
    if (sortBy === "newest") {

      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );

    } else if (sortBy === "deadline") {

      result.sort(
        (a, b) =>
          new Date(a.applicationDeadline) -
          new Date(b.applicationDeadline)
      );

    } else if (sortBy === "salary") {

      result.sort(
        (a, b) => Number(b.salary || 0) - Number(a.salary || 0)
      );

    }

    return result;

  }, [jobs, search, jobType, mode, skillFilter, sortBy]);


  // ------------------------------------------------
  // ACTIVE FILTER COUNT
  // ------------------------------------------------

  const activeFilterCount = [
    jobType !== "all",
    mode !== "all",
    Boolean(skillFilter.trim()),
  ].filter(Boolean).length;


  // ------------------------------------------------
  // CLEAR FILTERS
  // ------------------------------------------------

  const clearFilters = () => {

    setSearch("");
    setJobType("all");
    setMode("all");
    setSkillFilter("");
    setSortBy("newest");

  };


  // ------------------------------------------------
  // APPLY FOR JOB
  // ------------------------------------------------

  const handleApply = async () => {

    if (!selectedJob) return;

    if (appliedJobIds.has(selectedJob._id)) {
      return;
    }

    setApplyError("");
    setApplySuccess("");

    // Require profile resume
    if (!user?.resumeUrl) {
      setApplyError(
        "Please upload your resume in your Student Profile before applying."
      );
      return;
    }

    setApplyLoading(true);

    try {

      const response = await createApplication(
        selectedJob._id
      );

      // Add submitted application to local state
      if (response?.data) {
        setApplications((prev) => [
          ...prev,
          response.data,
        ]);
      }

      setApplySuccess(
        response.message ||
        "Your application has been submitted successfully!"
      );

    } catch (err) {

      setApplyError(
        err.message || "Unable to submit application."
      );

    } finally {

      setApplyLoading(false);

    }

  };


  // ------------------------------------------------
  // LOADING STATE
  // ------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111820]
      px-5 pt-36">

        <div className="mx-auto max-w-7xl animate-pulse">

          <div className="h-4 w-36 rounded bg-[#273640]" />
          <div className="mt-5 h-10 w-80 rounded bg-[#273640]" />
          <div className="mt-5 h-14 rounded-lg bg-[#273640]" />

          <div className="mt-10 grid gap-6 lg:grid-cols-[260px_1fr]">

            <div className="h-96 rounded-xl bg-[#1C2933]" />

            <div className="space-y-4">
              <div className="h-48 rounded-xl bg-[#1C2933]" />
              <div className="h-48 rounded-xl bg-[#1C2933]" />
              <div className="h-48 rounded-xl bg-[#1C2933]" />
            </div>

          </div>

        </div>

      </div>
    );
  }


  // ------------------------------------------------
  // JOB DETAILS DIALOG
  // ------------------------------------------------

  const company = selectedJob
    ? getJobCompany(selectedJob)
    : {};

  const alreadyApplied = selectedJob
    ? appliedJobIds.has(selectedJob._id)
    : false;


  return (

    <div className="min-h-screen bg-[#111820]
    px-4 pb-16 pt-28 sm:px-6 lg:px-12">

      <div className="mx-auto max-w-7xl">


        {/* ------------------------------------------
            PAGE HEADER
        ------------------------------------------ */}

        <div className="mb-8">

          <div className="flex flex-wrap items-center
          justify-between gap-3">

            <p className="text-xs font-semibold
            tracking-[0.2em] text-[#5B9295]">
              STUDENT PORTAL / OPPORTUNITIES
            </p>

            <button
              type="button"
              onClick={() => loadJobs(true)}
              disabled={refreshing}
              className="flex items-center gap-2
              text-xs font-medium text-[#91AFC0]
              transition hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin" : ""}
              />

              Refresh listings
            </button>

          </div>


          <div className="mt-4 flex flex-col
          justify-between gap-5 md:flex-row md:items-end">

            <div>

              <h1 className="text-3xl font-bold
              tracking-tight text-[#F0F3F5]
              sm:text-4xl">
                Find your next move.
              </h1>

              <p className="mt-3 max-w-xl text-sm
              leading-7 text-[#AAB7C2]">
                Explore opportunities, discover new companies
                and find roles that match your career direction.
              </p>

            </div>


            <div className="flex items-center gap-3
            rounded-lg border border-[#354652]
            bg-[#1C2933] px-4 py-3">

              <div className="flex h-9 w-9 items-center
              justify-center rounded-lg bg-[#5B9295]/15
              text-[#91AFC0]">
                <Briefcase size={18}/>
              </div>

              <div>
                <p className="text-lg font-bold text-[#F0F3F5]">
                  {jobs.length}
                </p>

                <p className="text-xs text-[#8796A2]">
                  Open opportunities
                </p>
              </div>

            </div>

          </div>

        </div>


        {/* ------------------------------------------
            SEARCH BAR
        ------------------------------------------ */}

        <div className="mb-8 flex flex-col gap-3
        rounded-xl border border-[#354652]
        bg-[#1C2933] p-3 sm:flex-row">

          <div className="relative flex-1">

            <Search
              size={19}
              className="absolute left-4 top-1/2
              -translate-y-1/2 text-[#8796A2]"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search job title, company, location or skill..."
              className="w-full rounded-lg border border-transparent
              bg-[#111820] py-3 pl-12 pr-4
              text-sm text-[#E1E7EB] outline-none
              placeholder:text-[#71808C]
              transition focus:border-[#5B9295]"
            />

          </div>


          <button
            type="button"
            onClick={() =>
              setMobileFiltersOpen((prev) => !prev)
            }
            className="flex items-center justify-center
            gap-2 rounded-lg border border-[#455967]
            px-5 py-3 text-sm font-medium
            text-[#C5D0D6] hover:bg-white/5
            lg:hidden"
          >
            <SlidersHorizontal size={17}/>
            Filters

            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center
              justify-center rounded-full bg-[#5B9295]
              text-xs text-[#101820]">
                {activeFilterCount}
              </span>
            )}

          </button>

        </div>


        {/* ------------------------------------------
            ERROR
        ------------------------------------------ */}

        {error && (
          <div className="mb-6 flex flex-col
          justify-between gap-3 rounded-lg
          border border-red-500/30 bg-red-500/10
          p-4 sm:flex-row sm:items-center">

            <p className="text-sm text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadJobs()}
              className="text-sm font-semibold text-red-200"
            >
              Try Again
            </button>

          </div>
        )}


        {/* ------------------------------------------
            MAIN CONTENT
        ------------------------------------------ */}

        <div className="grid items-start gap-6
        lg:grid-cols-[250px_minmax(0,1fr)]">


          {/* ----------------------------------------
              FILTER SIDEBAR
          ---------------------------------------- */}

          <AnimatePresence>
            {(mobileFiltersOpen || window.innerWidth >= 1024) && (
              <motion.aside
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`rounded-xl border border-[#354652]
                bg-[#1C2933] p-5
                ${mobileFiltersOpen ? "block lg:block" : "hidden lg:block"}`}
              >

                <div className="mb-6 flex items-center
                justify-between">

                  <div>
                    <h2 className="font-semibold text-[#F0F3F5]">
                      Refine results
                    </h2>

                    <p className="mt-1 text-xs text-[#8796A2]">
                      Narrow your search
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={clearFilters}
                    title="Clear filters"
                    className="text-[#91AFC0] hover:text-white"
                  >
                    <RotateCcw size={16}/>
                  </button>

                </div>


                {/* Job Type */}
                <div className="mb-6">

                  <h3 className="mb-3 text-sm
                  font-semibold text-[#D5DEE4]">
                    Employment type
                  </h3>

                  <div className="space-y-3">

                    {[
                      ["all", "All opportunities"],
                      ["Full-Time", "Full-time"],
                      ["Internship", "Internships"],
                    ].map(([value, label]) => (

                      <label key={value}
                        className="flex cursor-pointer
                        items-center gap-3 text-sm text-[#AAB7C2]"
                      >

                        <input
                          type="radio"
                          name="jobType"
                          checked={jobType === value}
                          onChange={() => setJobType(value)}
                          className="accent-[#5B9295]"
                        />

                        {label}

                      </label>

                    ))}

                  </div>

                </div>


                <div className="my-5 border-t border-[#354652]"/>


                {/* Work Mode */}
                <div className="mb-6">

                  <h3 className="mb-3 text-sm
                  font-semibold text-[#D5DEE4]">
                    Work arrangement
                  </h3>

                  <div className="space-y-3">

                    {[
                      ["all", "Any arrangement"],
                      ["Remote", "Remote"],
                      ["Hybrid", "Hybrid"],
                      ["On-site", "On-site"],
                    ].map(([value, label]) => (

                      <label
                        key={value}
                        className="flex cursor-pointer
                        items-center gap-3 text-sm text-[#AAB7C2]"
                      >

                        <input
                          type="radio"
                          name="mode"
                          checked={mode === value}
                          onChange={() => setMode(value)}
                          className="accent-[#5B9295]"
                        />

                        {label}

                      </label>

                    ))}

                  </div>

                </div>


                <div className="my-5 border-t border-[#354652]"/>


                {/* Skills */}
                <div>

                  <h3 className="mb-3 text-sm
                  font-semibold text-[#D5DEE4]">
                    Required skill
                  </h3>

                  <input
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    placeholder="e.g. React, Python"
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs leading-5 text-[#71808C]">
                    Results must include this skill.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() => {
                    clearFilters();
                    setMobileFiltersOpen(false);
                  }}
                  className="mt-7 w-full rounded-lg
                  border border-[#455967] py-2.5
                  text-sm font-semibold text-[#AAB7C2]
                  transition hover:bg-white/5"
                >
                  Clear all filters
                </button>

              </motion.aside>
            )}
          </AnimatePresence>


          {/* ----------------------------------------
              JOB LISTINGS
          ---------------------------------------- */}

          <main className="min-w-0">


            {/* Results Toolbar */}
            <div className="mb-5 flex flex-col
            justify-between gap-3 sm:flex-row sm:items-center">

              <div>

                <h2 className="text-lg font-semibold text-[#F0F3F5]">
                  Available opportunities
                </h2>

                <p className="mt-1 text-xs text-[#8796A2]">
                  Showing {filteredJobs.length} of {jobs.length} jobs
                </p>

              </div>


              <div className="flex items-center gap-2">

                <span className="shrink-0 text-xs text-[#8796A2]">
                  Sort by
                </span>

                <div className="relative">

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none rounded-lg
                    border border-[#455967] bg-[#1C2933]
                    py-2.5 pl-3 pr-9 text-xs font-medium
                    text-[#D5DEE4] outline-none
                    focus:border-[#5B9295]"
                  >
                    <option value="newest">Newest first</option>
                    <option value="deadline">Closing soon</option>
                    <option value="salary">Listed compensation</option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute
                    right-3 top-1/2 -translate-y-1/2
                    text-[#8796A2]"
                  />

                </div>

              </div>

            </div>


            {/* Job List */}
            <div className="space-y-4">

              {filteredJobs.map((job) => {

                const company = getJobCompany(job);

                const companyName =
                  company.name || "Company";

                const daysLeft = getDaysLeft(
                  job.applicationDeadline
                );

                const applied = appliedJobIds.has(job._id);

                return (

                  <motion.article
                    key={job._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="group rounded-xl border
                    border-[#354652] bg-[#1C2933]
                    p-5 transition duration-200
                    hover:border-[#5B9295]/70
                    sm:p-6"
                  >

                    {/* Card Header */}
                    <div className="flex flex-col
                    justify-between gap-4 sm:flex-row">

                      <div className="flex min-w-0 gap-4">

                        {/* Company Logo */}
                        <div className="flex h-12 w-12 shrink-0
                        items-center justify-center overflow-hidden
                        rounded-lg border border-[#455967]
                        bg-[#111820] text-sm font-bold
                        text-[#A5C3CE]">

                          {company.logo ? (
                            <img
                              src={company.logo}
                              alt={companyName}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            getCompanyInitials(companyName)
                          )}

                        </div>


                        <div className="min-w-0">

                          <h3 className="text-lg font-semibold
                          text-[#F0F3F5] transition
                          group-hover:text-[#B5D1D4]">
                            {job.title}
                          </h3>

                          <div className="mt-2 flex flex-wrap
                          items-center gap-x-4 gap-y-2
                          text-xs text-[#AAB7C2]">

                            <span className="flex items-center gap-1.5">
                              <Building2 size={14}/>
                              {companyName}
                            </span>

                            <span className="flex items-center gap-1.5">
                              <MapPin size={14}/>
                              {company.location || "Location not listed"}
                            </span>

                          </div>

                        </div>

                      </div>


                      <div className="flex flex-wrap
                      items-start gap-2">

                        {isRecentlyPosted(job.createdAt) && (
                          <span className="rounded-md
                          border border-[#5B9295]/40
                          bg-[#5B9295]/10 px-2.5 py-1
                          text-[10px] font-semibold tracking-wider
                          text-[#A5C3C6]">
                            NEW
                          </span>
                        )}

                        {applied && (
                          <span className="rounded-md
                          border border-emerald-500/30
                          bg-emerald-500/10 px-2.5 py-1
                          text-[10px] font-semibold
                          text-emerald-300">
                            APPLIED
                          </span>
                        )}

                      </div>

                    </div>


                    {/* Description */}
                    <p className="mt-5 line-clamp-2
                    text-sm leading-7 text-[#AAB7C2]">
                      {job.description}
                    </p>


                    {/* Skills */}
                    <div className="mt-4 flex flex-wrap gap-2">

                      {(job.skills || []).slice(0, 5).map((skill) => (

                        <span
                          key={skill}
                          className="rounded-md border
                          border-[#455967] bg-[#111820]
                          px-2.5 py-1.5 text-xs
                          text-[#B8C9D0]"
                        >
                          {skill}
                        </span>

                      ))}

                      {(job.skills || []).length > 5 && (
                        <span className="px-2 py-1.5
                        text-xs text-[#8796A2]">
                          +{job.skills.length - 5} more
                        </span>
                      )}

                    </div>


                    {/* Divider */}
                    <div className="my-5 border-t border-[#354652]"/>


                    {/* Card Footer */}
                    <div className="flex flex-col
                    justify-between gap-4
                    sm:flex-row sm:items-center">

                      <div className="flex flex-wrap gap-x-6 gap-y-3">

                        <div>
                          <p className="text-[10px]
                          font-medium tracking-wider
                          text-[#71808C]">
                            LISTED COMPENSATION
                          </p>

                          <p className="mt-1 text-sm
                          font-semibold text-[#E1E7EB]">
                            {formatSalary(job.salary)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px]
                          font-medium tracking-wider
                          text-[#71808C]">
                            EMPLOYMENT
                          </p>

                          <p className="mt-1 text-sm text-[#C5D0D6]">
                            {job.jobType}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px]
                          font-medium tracking-wider
                          text-[#71808C]">
                            WORK MODE
                          </p>

                          <p className="mt-1 text-sm text-[#C5D0D6]">
                            {job.mode}
                          </p>
                        </div>

                      </div>


                      <div className="flex items-center
                      justify-between gap-4 sm:justify-end">

                        <div className="text-right">

                          <p className="flex items-center
                          justify-end gap-1.5 text-xs
                          text-[#8796A2]">
                            <Clock3 size={13}/>
                            {daysLeft <= 0
                              ? "Deadline passed"
                              : daysLeft <= 3
                              ? `Closes in ${daysLeft} days`
                              : `Apply by ${formatDeadline(job.applicationDeadline)}`
                            }
                          </p>

                          <p className="mt-1 text-[10px] text-[#71808C]">
                            Posted {formatDate(job.createdAt)}
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedJob(job);
                            setApplyError("");
                            setApplySuccess("");
                          }}
                          className="flex shrink-0 items-center
                          gap-2 rounded-lg bg-[#5B9295]
                          px-4 py-2.5 text-xs font-semibold
                          text-[#101820] transition
                          hover:bg-[#70A5A5]"
                        >
                          View role
                          <ArrowUpRight size={15}/>
                        </button>

                      </div>

                    </div>

                  </motion.article>

                );

              })}


              {/* Empty State */}
              {!error && filteredJobs.length === 0 && (

                <div className="rounded-xl border
                border-dashed border-[#455967]
                bg-[#1C2933]/60 px-6 py-16 text-center">

                  <div className="mx-auto flex h-14 w-14
                  items-center justify-center rounded-xl
                  bg-[#5B9295]/10 text-[#91AFC0]">
                    <Search size={25}/>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold
                  text-[#E1E7EB]">
                    No matching opportunities
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm
                  text-sm leading-6 text-[#8796A2]">
                    Try changing your search or removing
                    some filters to see more opportunities.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-lg border
                    border-[#455967] px-5 py-2.5
                    text-sm font-semibold text-[#A5C3C6]
                    hover:bg-white/5"
                  >
                    Clear search and filters
                  </button>

                </div>

              )}

            </div>

          </main>

        </div>

      </div>


      {/* --------------------------------------------
          JOB DETAILS PANEL
      -------------------------------------------- */}

      <AnimatePresence>

        {selectedJob && (

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedJob(null)}
            className="fixed inset-0 z-[100]
            flex items-end justify-center
            bg-black/70 p-0 backdrop-blur-sm
            sm:items-center sm:p-5"
          >

            <motion.div
              initial={{ y: 35, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 35, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="job-detail-title"
              className="relative flex max-h-[92vh]
              w-full max-w-3xl flex-col overflow-hidden
              rounded-t-2xl border border-[#455967]
              bg-[#1C2933] shadow-2xl sm:rounded-2xl"
            >

              {/* Dialog Header */}
              <div className="flex items-start justify-between
              border-b border-[#354652] p-5 sm:p-7">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12
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
                      getCompanyInitials(company.name)
                    )}

                  </div>

                  <div>

                    <h2
                      id="job-detail-title"
                      className="text-lg font-bold text-[#F0F3F5]"
                    >
                      {selectedJob.title}
                    </h2>

                    <p className="mt-1 text-sm text-[#AAB7C2]">
                      {company.name || "Company"}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  aria-label="Close job details"
                  className="rounded-lg border border-[#455967]
                  p-2 text-[#AAB7C2] hover:bg-white/5
                  hover:text-white"
                >
                  <X size={19}/>
                </button>

              </div>


              {/* Dialog Content */}
              <div className="flex-1 space-y-7 overflow-y-auto p-5 sm:p-7">

                {/* Role Details */}
                <div className="grid gap-4 sm:grid-cols-3">

                  <div className="rounded-lg bg-[#111820] p-4">
                    <Briefcase size={18} className="text-[#91AFC0]"/>
                    <p className="mt-3 text-xs text-[#8796A2]">
                      Employment
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#E1E7EB]">
                      {selectedJob.jobType}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#111820] p-4">
                    <Building2 size={18} className="text-[#91AFC0]"/>
                    <p className="mt-3 text-xs text-[#8796A2]">
                      Work mode
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#E1E7EB]">
                      {selectedJob.mode}
                    </p>
                  </div>

                  <div className="rounded-lg bg-[#111820] p-4">
                    <MapPin size={18} className="text-[#91AFC0]"/>
                    <p className="mt-3 text-xs text-[#8796A2]">
                      Location
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#E1E7EB]">
                      {company.location || "Not specified"}
                    </p>
                  </div>

                </div>


                {/* Description */}
                <section>

                  <h3 className="mb-3 text-base font-semibold text-[#F0F3F5]">
                    About this role
                  </h3>

                  <p className="whitespace-pre-wrap
                  text-sm leading-8 text-[#B8C2CB]">
                    {selectedJob.description}
                  </p>

                </section>


                {/* Skills */}
                <section>

                  <h3 className="mb-3 text-base font-semibold text-[#F0F3F5]">
                    Required skills
                  </h3>

                  {selectedJob.skills?.length ? (

                    <div className="flex flex-wrap gap-2">

                      {selectedJob.skills.map((skill) => (

                        <span key={skill} className="rounded-md
                        border border-[#455967] bg-[#111820]
                        px-3 py-2 text-xs text-[#C5D0D6]">
                          {skill}
                        </span>

                      ))}

                    </div>

                  ) : (
                    <p className="text-sm text-[#8796A2]">
                      No specific skills listed.
                    </p>
                  )}

                </section>


                {/* Compensation */}
                <section>

                  <h3 className="mb-3 text-base font-semibold text-[#F0F3F5]">
                    Compensation
                  </h3>

                  <p className="text-lg font-semibold text-[#A5C3C6]">
                    {formatSalary(selectedJob.salary)}
                  </p>

                  <p className="mt-1 text-xs text-[#8796A2]">
                    Amount as recorded by the company. Salary period
                    is not specified in the listing.
                  </p>

                </section>


                {/* Deadline */}
                <section className="rounded-lg border
                border-[#455967] bg-[#111820] p-4">

                  <div className="flex items-center gap-3">

                    <CalendarDays size={19} className="text-[#91AFC0]"/>

                    <div>
                      <p className="text-xs text-[#8796A2]">
                        Application deadline
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#E1E7EB]">
                        {formatDeadline(selectedJob.applicationDeadline)}
                      </p>
                    </div>

                  </div>

                </section>


                {/* Application Feedback */}
                {applyError && (

                  <div className="rounded-lg border
                  border-amber-500/30 bg-amber-500/10 p-4">

                    <p className="text-sm text-amber-200">
                      {applyError}
                    </p>

                    {!user?.resumeUrl && (
                      <Link
                        to="/student/profile"
                        onClick={() => setSelectedJob(null)}
                        className="mt-3 inline-flex items-center
                        gap-2 text-sm font-semibold
                        text-[#A5C3C6] hover:text-white"
                      >
                        <FileText size={15}/>
                        Update your profile
                        <ArrowUpRight size={14}/>
                      </Link>
                    )}

                  </div>

                )}


                {applySuccess && (

                  <div className="flex items-center gap-2
                  rounded-lg border border-emerald-500/30
                  bg-emerald-500/10 p-4 text-sm text-emerald-300">

                    <CheckCircle2 size={18}/>
                    {applySuccess}

                  </div>

                )}

              </div>


              {/* Dialog Footer */}
              <div className="flex flex-col-reverse
              justify-between gap-3 border-t
              border-[#354652] bg-[#111820] p-5
              sm:flex-row sm:items-center sm:px-7">

                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="text-sm font-medium text-[#AAB7C2]
                  hover:text-white"
                >
                  Close details
                </button>


                {alreadyApplied ? (

                  <button
                    type="button"
                    disabled
                    className="flex items-center justify-center
                    gap-2 rounded-lg border border-emerald-500/30
                    bg-emerald-500/10 px-6 py-3
                    text-sm font-semibold text-emerald-300"
                  >
                    <CheckCircle2 size={17}/>
                    Already Applied
                  </button>

                ) : (

                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={applyLoading || Boolean(applySuccess)}
                    className="flex items-center justify-center
                    gap-2 rounded-lg bg-[#5B9295]
                    px-7 py-3 text-sm font-semibold
                    text-[#101820] transition hover:bg-[#70A5A5]
                    disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {applyLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin
                        rounded-full border-2 border-[#101820]/30
                        border-t-[#101820]"/>
                        Submitting...
                      </>
                    ) : applySuccess ? (
                      <>
                        <CheckCircle2 size={17}/>
                        Application Submitted
                      </>
                    ) : (
                      <>
                        Apply for this role
                        <ArrowUpRight size={17}/>
                      </>
                    )}

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

export default Jobs;
