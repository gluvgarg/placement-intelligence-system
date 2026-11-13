
import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Code2,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Link2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import { getAllStudents } from "../../services/api.js";

/* --------------------------------------------------
   Helpers
-------------------------------------------------- */

const extractArray = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
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

const getInitials = (name = "") => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "S";
};

const getProfileIndicators = (student) => {
  return {
    resume: Boolean(student.resumeUrl),
    skills: Boolean(student.skills?.length),
    education: Boolean(student.education?.length),
    projects: Boolean(student.projects?.length),
    contact: Boolean(student.mobile),
  };
};

const inputClass =
  "w-full rounded-xl border border-[#354955] bg-[#111B24] px-3.5 py-3 text-sm text-[#E1E9ED] outline-none transition placeholder:text-[#627681] focus:border-[#6F9E9E] focus:ring-2 focus:ring-[#5B9295]/10";

/* --------------------------------------------------
   Profile details modal
-------------------------------------------------- */

function StudentDetailsModal({ student, onClose }) {
  if (!student) return null;

  const indicators = getProfileIndicators(student);

  const education = Array.isArray(student.education)
    ? student.education
    : [];

  const projects = Array.isArray(student.projects)
    ? student.projects
    : [];

  const experience = Array.isArray(student.experience)
    ? student.experience
    : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.98 }}
        transition={{ duration: 0.24 }}
        className="my-auto max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-[#3B505D] bg-[#15212A] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#2E414C] px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#82A9B1]">
              Student records
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#EAF0F2]">
              Student profile
            </h2>

            <p className="mt-1 text-xs text-[#8799A4]">
              Registration and academic information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close student details"
            className="rounded-lg border border-[#354955] p-2 text-[#91A3AE] transition hover:bg-white/5 hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        <div className="max-h-[calc(92vh-82px)] overflow-y-auto">
          {/* Student identity */}
          <div className="flex flex-col gap-4 border-b border-[#2E414C] bg-[#192731] p-5 sm:flex-row sm:items-center sm:p-7">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#48616D] bg-[#263A45] text-lg font-semibold text-[#B9D1D8]">
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.fullname}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(student.fullname)
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-[#E8EEF1]">
                {student.fullname || "Unnamed student"}
              </h3>

              <p className="mt-1 break-all text-xs text-[#91A5B0]">
                {student.email}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#5B9295]/25 bg-[#5B9295]/10 px-2.5 py-1 text-[9px] font-medium uppercase tracking-wide text-[#A5C8C7]">
                  Student account
                </span>

                <span className="text-[10px] text-[#82939E]">
                  Joined {formatDate(student.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-7">
            {/* Contact details */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.13em] text-[#9BB3BE]">
                Contact information
              </h3>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[#2F424E] bg-[#111B24] p-4">
                  <div className="flex items-center gap-2 text-[#8DAEB7]">
                    <Mail size={14} />
                    <span className="text-[10px] uppercase tracking-wider">
                      Email
                    </span>
                  </div>
                  <p className="mt-2 break-all text-xs text-[#D6E0E5]">
                    {student.email || "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl border border-[#2F424E] bg-[#111B24] p-4">
                  <div className="flex items-center gap-2 text-[#8DAEB7]">
                    <Phone size={14} />
                    <span className="text-[10px] uppercase tracking-wider">
                      Mobile
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#D6E0E5]">
                    {student.mobile || "Not provided"}
                  </p>
                </div>
              </div>
            </section>

            {/* Profile indicators */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.13em] text-[#9BB3BE]">
                Profile information
              </h3>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {[
                  { label: "Resume", value: indicators.resume },
                  { label: "Skills", value: indicators.skills },
                  { label: "Education", value: indicators.education },
                  { label: "Projects", value: indicators.projects },
                  { label: "Contact", value: indicators.contact },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-[#2F424E] bg-[#111B24] p-3"
                  >
                    <div className="flex items-center gap-1.5">
                      {item.value ? (
                        <Check
                          size={13}
                          className="text-emerald-300"
                        />
                      ) : (
                        <X
                          size={13}
                          className="text-[#71848F]"
                        />
                      )}

                      <span
                        className={`text-[10px] ${
                          item.value
                            ? "text-[#B8D5CD]"
                            : "text-[#82939E]"
                        }`}
                      >
                        {item.value ? "Added" : "Missing"}
                      </span>
                    </div>

                    <p className="mt-2 text-[10px] font-medium text-[#C6D2D8]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Resume and social links */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.13em] text-[#9BB3BE]">
                Resume and links
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {student.resumeUrl && (
                  <a
                    href={student.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-[#5B9295]/35 bg-[#5B9295]/10 px-3 py-2.5 text-xs font-medium text-[#A9CECC] transition hover:bg-[#5B9295]/20"
                  >
                    <FileText size={14} />
                    View resume
                    <ArrowUpRight size={12} />
                  </a>
                )}

                {student.githubUrl && (
                  <a
                    href={student.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-[#40545F] px-3 py-2.5 text-xs text-[#BCCBD2] transition hover:border-[#6F9E9E] hover:text-white"
                  >
                    <Code2 size={14} />
                    GitHub
                    <ArrowUpRight size={12} />
                  </a>
                )}

                {student.linkedinUrl && (
                  <a
                    href={student.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-[#40545F] px-3 py-2.5 text-xs text-[#BCCBD2] transition hover:border-[#6F9E9E] hover:text-white"
                  >
                    <Link2 size={14} />
                    LinkedIn
                    <ArrowUpRight size={12} />
                  </a>
                )}

                {!student.resumeUrl &&
                  !student.githubUrl &&
                  !student.linkedinUrl && (
                    <p className="text-xs text-[#82939E]">
                      No resume or external links added.
                    </p>
                  )}
              </div>
            </section>

            {/* Skills */}
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-[0.13em] text-[#9BB3BE]">
                Skills
              </h3>

              {student.skills?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {student.skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg border border-[#354955] bg-[#1B2932] px-3 py-2 text-[11px] text-[#B9CBD2]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-[#82939E]">
                  No skills added to this profile.
                </p>
              )}
            </section>

            {/* Education */}
            <section>
              <div className="flex items-center gap-2">
                <GraduationCap size={16} className="text-[#8DB8B5]" />
                <h3 className="text-xs font-semibold uppercase tracking-[0.13em] text-[#9BB3BE]">
                  Education
                </h3>
              </div>

              {education.length ? (
                <div className="mt-3 space-y-3">
                  {education.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="rounded-xl border border-[#2F424E] bg-[#111B24] p-4"
                    >
                      <p className="text-sm font-medium text-[#DCE5E9]">
                        {item.degree || "Degree not specified"}
                      </p>

                      <p className="mt-1 text-xs text-[#A0B1BA]">
                        {item.college || "Institution not specified"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-[#82939E]">
                        <span>
                          Passing year: {item.yearOfPassing || "—"}
                        </span>
                        <span>
                          CGPA: {item.cgpa ?? "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-[#82939E]">
                  No education details added.
                </p>
              )}
            </section>

            {/* Projects */}
            <section>
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-[#8DB8B5]" />
                <h3 className="text-xs font-semibold uppercase tracking-[0.13em] text-[#9BB3BE]">
                  Projects
                </h3>
              </div>

              {projects.length ? (
                <div className="mt-3 space-y-3">
                  {projects.map((project, index) => (
                    <div
                      key={project._id || index}
                      className="rounded-xl border border-[#2F424E] bg-[#111B24] p-4"
                    >
                      <p className="text-sm font-medium text-[#DCE5E9]">
                        {project.title || "Untitled project"}
                      </p>

                      {project.description && (
                        <p className="mt-2 whitespace-pre-line text-xs leading-5 text-[#91A3AE]">
                          {project.description}
                        </p>
                      )}

                      {project.technologies?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {project.technologies.map((tech, techIndex) => (
                            <span
                              key={`${tech}-${techIndex}`}
                              className="rounded-md bg-[#21323C] px-2 py-1 text-[9px] text-[#AFC1CB]"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap gap-3">
                        {project.projectUrl && (
                          <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-[#91BDBA] hover:text-white"
                          >
                            Project link ↗
                          </a>
                        )}

                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-[#91BDBA] hover:text-white"
                          >
                            GitHub ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-[#82939E]">
                  No projects added.
                </p>
              )}
            </section>

            {/* Experience */}
            <section>
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[#8DB8B5]" />
                <h3 className="text-xs font-semibold uppercase tracking-[0.13em] text-[#9BB3BE]">
                  Experience
                </h3>
              </div>

              {experience.length ? (
                <div className="mt-3 space-y-3">
                  {experience.map((item, index) => (
                    <div
                      key={item._id || index}
                      className="rounded-xl border border-[#2F424E] bg-[#111B24] p-4"
                    >
                      <p className="text-sm font-medium text-[#DCE5E9]">
                        {item.position || "Position not specified"}
                      </p>

                      <p className="mt-1 text-xs text-[#A0B1BA]">
                        {item.company || "Organisation not specified"}
                      </p>

                      <p className="mt-2 text-[10px] text-[#82939E]">
                        {formatDate(item.startDate)} —{" "}
                        {item.currentlyWorking
                          ? "Present"
                          : formatDate(item.endDate)}
                      </p>

                      {item.description && (
                        <p className="mt-3 whitespace-pre-line text-xs leading-5 text-[#91A3AE]">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-[#82939E]">
                  No experience details added.
                </p>
              )}
            </section>
          </div>

          <div className="border-t border-[#2E414C] px-5 py-4 text-right sm:px-7">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#40545F] px-5 py-2.5 text-xs font-medium text-[#C0CCD2] transition hover:bg-white/5"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------------------------
   Students page
-------------------------------------------------- */

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [profileFilter, setProfileFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [error, setError] = useState("");

  const loadStudents = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await getAllStudents();
      setStudents(extractArray(response));
    } catch (err) {
      setError(err.message || "Unable to load student records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const stats = useMemo(() => {
    const withResume = students.filter(
      (student) => Boolean(student.resumeUrl)
    ).length;

    const withSkills = students.filter(
      (student) => Boolean(student.skills?.length)
    ).length;

    const now = new Date();

    const joinedThisMonth = students.filter((student) => {
      if (!student.createdAt) return false;

      const date = new Date(student.createdAt);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;

    return {
      total: students.length,
      withResume,
      withSkills,
      joinedThisMonth,
    };
  }, [students]);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = students.filter((student) => {
      const matchesSearch =
        !term ||
        [
          student.fullname,
          student.email,
          student.mobile,
        ].some((value) =>
          String(value || "").toLowerCase().includes(term)
        );

      const hasResume = Boolean(student.resumeUrl);

      const matchesProfile =
        profileFilter === "all" ||
        (profileFilter === "resume" && hasResume) ||
        (profileFilter === "no-resume" && !hasResume);

      return matchesSearch && matchesProfile;
    });

    return filtered.sort((a, b) => {
      if (sortOrder === "oldest") {
        return new Date(a.createdAt || 0) -
          new Date(b.createdAt || 0);
      }

      if (sortOrder === "name") {
        return (a.fullname || "").localeCompare(b.fullname || "");
      }

      return new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0);
    });
  }, [students, search, profileFilter, sortOrder]);

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
              ADMINISTRATION / STUDENT RECORDS
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#EDF2F4]">
              Students
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#91A3AE]">
              View registered student accounts and their academic
              and career profiles.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadStudents(true)}
            disabled={refreshing || loading}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#354955] bg-[#17242D] px-4 py-3 text-xs font-medium text-[#C0CDD3] transition hover:border-[#6F9E9E] hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh records
          </button>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-3 text-xs text-rose-200"
            >
              <CircleAlert size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                className="ml-auto opacity-70 hover:opacity-100"
                aria-label="Dismiss error"
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
          className="mb-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#2B3C47] bg-[#141F28] sm:grid-cols-4"
        >
          {[
            {
              label: "Registered students",
              value: stats.total,
              icon: Users,
              style: "text-[#9BC4C1] bg-[#5B9295]/10",
            },
            {
              label: "Resume uploaded",
              value: stats.withResume,
              icon: FileText,
              style: "text-emerald-300 bg-emerald-400/10",
            },
            {
              label: "Skills added",
              value: stats.withSkills,
              icon: GraduationCap,
              style: "text-sky-300 bg-sky-400/10",
            },
            {
              label: "Joined this month",
              value: stats.joinedThisMonth,
              icon: CalendarDays,
              style: "text-amber-300 bg-amber-400/10",
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
                placeholder="Search student name, email or mobile..."
                className="w-full rounded-xl border border-[#354955] bg-[#101922] py-3 pl-10 pr-4 text-xs text-[#E1E9ED] outline-none transition placeholder:text-[#71848F] focus:border-[#6F9E9E]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select
                  value={profileFilter}
                  onChange={(event) =>
                    setProfileFilter(event.target.value)
                  }
                  className="appearance-none rounded-xl border border-[#354955] bg-[#101922] py-3 pl-3 pr-8 text-xs text-[#BDCAD1] outline-none focus:border-[#6F9E9E]"
                >
                  <option value="all">All profiles</option>
                  <option value="resume">Resume uploaded</option>
                  <option value="no-resume">No resume</option>
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#82939E]"
                />
              </div>

              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(event) =>
                    setSortOrder(event.target.value)
                  }
                  className="appearance-none rounded-xl border border-[#354955] bg-[#101922] py-3 pl-3 pr-8 text-xs text-[#BDCAD1] outline-none focus:border-[#6F9E9E]"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="name">Student name</option>
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#82939E]"
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] text-[#82939E]">
            <span>
              Showing {filteredStudents.length} of {students.length} students
            </span>

            {(search || profileFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setProfileFilter("all");
                }}
                className="text-[#91BDBA] hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Student directory */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="overflow-hidden rounded-2xl border border-[#2B3C47] bg-[#141F28]"
        >
          <div className="flex items-center justify-between border-b border-[#2B3C47] px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-[#E3EBEF]">
                Student directory
              </h2>
              <p className="mt-1 text-[10px] text-[#82939E]">
                Registered accounts and profile information
              </p>
            </div>

            <span className="rounded-lg border border-[#354955] bg-[#1B2932] px-2.5 py-1.5 text-[10px] text-[#AABBC4]">
              {students.length} records
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
          ) : error && students.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <CircleAlert
                size={25}
                className="mx-auto text-rose-300"
              />
              <p className="mt-3 text-sm text-[#DCE5E9]">
                Unable to load student records
              </p>
              <button
                type="button"
                onClick={() => loadStudents()}
                className="mt-4 text-xs font-medium text-[#91BDBA] hover:text-white"
              >
                Try again
              </button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Users
                size={27}
                className="mx-auto text-[#748A96]"
              />

              <p className="mt-3 text-sm font-medium text-[#DCE5E9]">
                {search || profileFilter !== "all"
                  ? "No matching students"
                  : "No student accounts found"}
              </p>

              <p className="mt-1 text-xs text-[#82939E]">
                Try changing your search or profile filter.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-[#111A22]">
                    <tr className="text-[9px] uppercase tracking-[0.13em] text-[#7F929D]">
                      <th className="px-6 py-4 font-medium">Student</th>
                      <th className="px-4 py-4 font-medium">Contact</th>
                      <th className="px-4 py-4 font-medium">Profile data</th>
                      <th className="px-4 py-4 font-medium">Registered</th>
                      <th className="px-5 py-4 text-right font-medium">Details</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map((student, index) => {
                      const indicators = getProfileIndicators(student);

                      return (
                        <motion.tr
                          key={student._id}
                          initial={{ opacity: 0, y: 7 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.025 }}
                          className="border-t border-[#293A44] transition-colors hover:bg-[#1A2932]/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#3A505B] bg-[#20313A] text-xs font-semibold text-[#B7CCD3]">
                                {student.avatar ? (
                                  <img
                                    src={student.avatar}
                                    alt={student.fullname}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  getInitials(student.fullname)
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[190px] truncate text-xs font-semibold text-[#DEE7EB]">
                                  {student.fullname || "Unnamed student"}
                                </p>
                                <p className="mt-1 text-[10px] text-[#82939E]">
                                  Student account
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <p className="flex items-center gap-1.5 text-[11px] text-[#C0CDD3]">
                              <Mail size={11} className="text-[#8199A5]" />
                              {student.email}
                            </p>
                            <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#82939E]">
                              <Phone size={11} className="text-[#8199A5]" />
                              {student.mobile || "Not provided"}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              <span className={`rounded-md border px-2 py-1 text-[9px] ${
                                indicators.resume
                                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                  : "border-[#43535E] bg-[#26343D] text-[#8798A2]"
                              }`}>
                                Resume {indicators.resume ? "added" : "missing"}
                              </span>

                              <span className="rounded-md border border-[#354955] bg-[#1B2932] px-2 py-1 text-[9px] text-[#AFC1CB]">
                                {student.skills?.length || 0} skills
                              </span>

                              <span className="rounded-md border border-[#354955] bg-[#1B2932] px-2 py-1 text-[9px] text-[#AFC1CB]">
                                {student.education?.length || 0} education
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-[10px] text-[#91A2AC]">
                            {formatDate(student.createdAt)}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedStudent(student)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#405763] px-3 py-2 text-[10px] font-medium text-[#AFC5CD] transition hover:border-[#6F9E9E] hover:bg-[#5B9295]/10 hover:text-white"
                            >
                              <Eye size={13} />
                              View profile
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
                {filteredStudents.map((student) => {
                  const indicators = getProfileIndicators(student);

                  return (
                    <div
                      key={student._id}
                      className="rounded-xl border border-[#354955] bg-[#111B24] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#3A505B] bg-[#20313A] text-xs font-semibold text-[#B7CCD3]">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.fullname}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getInitials(student.fullname)
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#E2EAEF]">
                            {student.fullname || "Unnamed student"}
                          </p>
                          <p className="mt-1 break-all text-xs text-[#82939E]">
                            {student.email}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 border-t border-[#2B3C47] pt-3 text-xs text-[#AFC0C8]">
                        <p className="flex items-center gap-2">
                          <Phone size={13} className="text-[#8199A5]" />
                          {student.mobile || "Mobile not provided"}
                        </p>

                        <p className="flex items-center gap-2">
                          <CalendarDays size={13} className="text-[#8199A5]" />
                          Registered {formatDate(student.createdAt)}
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className={`rounded-md border px-2 py-1 text-[9px] ${
                          indicators.resume
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : "border-[#43535E] bg-[#26343D] text-[#8798A2]"
                        }`}>
                          Resume {indicators.resume ? "added" : "missing"}
                        </span>

                        <span className="rounded-md border border-[#354955] bg-[#1B2932] px-2 py-1 text-[9px] text-[#AFC1CB]">
                          {student.skills?.length || 0} skills
                        </span>
                      </div>

                      <div className="mt-4 flex justify-end border-t border-[#2B3C47] pt-3">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(student)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#405763] px-3 py-2 text-[10px] font-medium text-[#AFC5CD]"
                        >
                          <Eye size={13} />
                          View profile
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
          Student records are displayed from registered user profiles.
        </footer>

        <AnimatePresence>
          {selectedStudent && (
            <StudentDetailsModal
              student={selectedStudent}
              onClose={() => setSelectedStudent(null)}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
