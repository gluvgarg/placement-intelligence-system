
import { useEffect, useMemo, useRef, useState } from "react";

import {
  UserRound,
  GraduationCap,
  Code2,
  FolderKanban,
  Briefcase,
  FileText,
  Plus,
  Trash2,
  Upload,
  Save,
  ExternalLink,
  Camera,
  Pencil,
  X,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";

import {
  updateUserProfile,
  updateUserAvatar,
  updateUserCoverImage,
} from "../../services/api.js";

import FullPageLoader from "../../components/common/FullPageLoader.jsx";


// --------------------------------------------------
// STYLING
// --------------------------------------------------

const inputClass =
  "w-full rounded-lg border border-[#455967] bg-[#111820] " +
  "px-3 py-2.5 text-sm text-[#F0F3F5] outline-none " +
  "placeholder:text-[#71808C] focus:border-[#5B9295] " +
  "focus:ring-1 focus:ring-[#5B9295] transition " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const labelClass =
  "mb-2 block text-sm font-medium text-[#D5DEE4]";


// --------------------------------------------------
// DATA HELPERS
// --------------------------------------------------

const getInputDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
};


const buildFormData = (user) => ({
  fullname: user?.fullname || "",
  email: user?.email || "",
  mobile: user?.mobile?.toString() || "",

  githubUrl: user?.githubUrl || "",
  linkedinUrl: user?.linkedinUrl || "",

  skills: user?.skills || [],

  education: (user?.education || []).map((item) => ({
    degree: item.degree || "",
    college: item.college || "",
    yearOfPassing: item.yearOfPassing?.toString() || "",
    cgpa: item.cgpa?.toString() || "",
  })),

  projects: (user?.projects || []).map((item) => ({
    title: item.title || "",
    description: item.description || "",
    technologies: Array.isArray(item.technologies)
      ? item.technologies.join(", ")
      : "",
    projectUrl: item.projectUrl || "",
    githubUrl: item.githubUrl || "",
  })),

  experience: (user?.experience || []).map((item) => ({
    company: item.company || "",
    position: item.position || "",
    employmentType: item.employmentType || "Internship",
    startDate: getInputDate(item.startDate),
    endDate: getInputDate(item.endDate),
    currentlyWorking: item.currentlyWorking || false,
    description: item.description || "",
  })),
});


const formatDate = (value) => {
  if (!value) return "Present";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
};


// --------------------------------------------------
// REUSABLE PRESENTATION ELEMENTS
// Kept in this file intentionally.
// --------------------------------------------------

const Section = ({ title, description, icon: Icon, children }) => (
  <section className="rounded-xl border border-[#354652]
  bg-[#1C2933] p-5 sm:p-7">

    <div className="mb-6 flex items-center gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center
      justify-center rounded-lg bg-[#5B9295]/15
      text-[#91AFC0]">
        <Icon size={21} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#F0F3F5]">
          {title}
        </h2>

        <p className="mt-1 text-sm text-[#8796A2]">
          {description}
        </p>
      </div>

    </div>

    {children}

  </section>
);


const Field = ({ label, children }) => (
  <div>
    <label className={labelClass}>{label}</label>
    {children}
  </div>
);


const EmptyState = ({ message }) => (
  <div className="rounded-lg border border-dashed
  border-[#455967] bg-[#111820]/60 p-5
  text-center text-sm text-[#8796A2]">
    {message}
  </div>
);


const ProfileLink = ({ href, label, icon: Icon }) => {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2
      text-sm text-[#91AFC0] transition
      hover:text-white break-all"
    >
      <Icon size={16} />
      {label}
      <ExternalLink size={13} />
    </a>
  );
};


// --------------------------------------------------
// MAIN PROFILE COMPONENT
// --------------------------------------------------

const Profile = () => {

  const {
    user,
    loading: authLoading,
    fetchCurrentUser,
  } = useAuth();

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const [formData, setFormData] = useState(
    buildFormData(user)
  );

  const [isEditing, setIsEditing] = useState(false);

  const [skillInput, setSkillInput] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // ------------------------------------------------
  // POPULATE FORM FROM AUTHENTICATED USER
  // ------------------------------------------------

  useEffect(() => {
    if (user && !isEditing) {
      setFormData(buildFormData(user));
    }
  }, [user, isEditing]);


  // ------------------------------------------------
  // PROFILE COMPLETION
  // ------------------------------------------------

  const completion = useMemo(() => {

    const checks = [
      Boolean(formData.fullname),
      Boolean(formData.mobile),
      formData.education.length > 0,
      formData.skills.length > 0,
      formData.projects.length > 0,
      formData.experience.length > 0,
      Boolean(user?.resumeUrl || resumeFile),
      Boolean(formData.githubUrl || formData.linkedinUrl),
    ];

    return Math.round(
      (checks.filter(Boolean).length / checks.length) * 100
    );

  }, [formData, user, resumeFile]);


  // ------------------------------------------------
  // GENERAL INPUT HANDLER
  // ------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };


  // ------------------------------------------------
  // ARRAY UPDATE HANDLER
  // ------------------------------------------------

  const updateArrayItem = (section, index, field, value) => {

    setFormData((prev) => ({
      ...prev,

      [section]: prev[section].map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      ),
    }));

    setError("");
  };


  const removeArrayItem = (section, index) => {

    setFormData((prev) => ({
      ...prev,

      [section]: prev[section].filter(
        (_, i) => i !== index
      ),
    }));

  };


  // ------------------------------------------------
  // SKILLS
  // ------------------------------------------------

  const addSkill = () => {

    const skill = skillInput.trim();

    if (!skill) return;

    const exists = formData.skills.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );

    if (exists) {
      setError("This skill has already been added.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));

    setSkillInput("");
    setError("");

  };


  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };


  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item !== skill),
    }));
  };


  // ------------------------------------------------
  // ADD EDUCATION
  // ------------------------------------------------

  const addEducation = () => {

    setFormData((prev) => ({
      ...prev,

      education: [
        ...prev.education,
        {
          degree: "",
          college: "",
          yearOfPassing: "",
          cgpa: "",
        },
      ],
    }));

  };


  // ------------------------------------------------
  // ADD PROJECT
  // ------------------------------------------------

  const addProject = () => {

    setFormData((prev) => ({
      ...prev,

      projects: [
        ...prev.projects,
        {
          title: "",
          description: "",
          technologies: "",
          projectUrl: "",
          githubUrl: "",
        },
      ],
    }));

  };


  // ------------------------------------------------
  // ADD EXPERIENCE
  // ------------------------------------------------

  const addExperience = () => {

    setFormData((prev) => ({
      ...prev,

      experience: [
        ...prev.experience,
        {
          company: "",
          position: "",
          employmentType: "Internship",
          startDate: "",
          endDate: "",
          currentlyWorking: false,
          description: "",
        },
      ],
    }));

  };


  // ------------------------------------------------
  // AVATAR AND COVER IMAGE UPLOAD
  // ------------------------------------------------

  const handleImageUpload = async (e, type) => {

    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setUploading(type);
    setError("");
    setSuccess("");

    try {

      if (type === "avatar") {
        await updateUserAvatar(file);
      } else {
        await updateUserCoverImage(file);
      }

      // Refresh shared user data.
      // Navbar receives the updated image automatically.
      await fetchCurrentUser();

      setSuccess(
        type === "avatar"
          ? "Profile picture updated successfully."
          : "Cover image updated successfully."
      );

    } catch (err) {

      setError(
        err.message || "Image upload failed."
      );

    } finally {

      setUploading(null);
      e.target.value = "";

    }

  };


  // ------------------------------------------------
  // RESUME
  // ------------------------------------------------

  const handleResumeChange = (e) => {

    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please select a PDF resume.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Resume must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setResumeFile(file);
    setError("");
    setSuccess("");

  };


  // ------------------------------------------------
  // EDIT MODE
  // ------------------------------------------------

  const startEditing = () => {

    setFormData(buildFormData(user));
    setResumeFile(null);
    setSkillInput("");

    setError("");
    setSuccess("");

    setIsEditing(true);

  };


  const cancelEditing = () => {

    setFormData(buildFormData(user));
    setResumeFile(null);
    setSkillInput("");

    setError("");
    setSuccess("");

    setIsEditing(false);

  };


  // ------------------------------------------------
  // SAVE PROFILE
  // ------------------------------------------------

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    // Validate name
    if (!formData.fullname.trim()) {
      setError("Full name is required.");
      return;
    }

    // Validate mobile
    if (
      formData.mobile &&
      !/^[6-9]\d{9}$/.test(formData.mobile)
    ) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    // Validate education CGPA
    for (const item of formData.education) {
      if (
        item.cgpa !== "" &&
        (Number(item.cgpa) < 0 || Number(item.cgpa) > 10)
      ) {
        setError("CGPA must be between 0 and 10.");
        return;
      }
    }

    // Validate experience dates
    for (const item of formData.experience) {
      if (
        item.startDate &&
        item.endDate &&
        new Date(item.endDate) < new Date(item.startDate)
      ) {
        setError("Experience end date cannot be earlier than start date.");
        return;
      }
    }

    setSaving(true);

    try {

      const education = formData.education.map((item) => ({
        degree: item.degree.trim(),
        college: item.college.trim(),

        yearOfPassing: item.yearOfPassing
          ? Number(item.yearOfPassing)
          : undefined,

        cgpa: item.cgpa
          ? Number(item.cgpa)
          : undefined,
      }));


      const projects = formData.projects.map((item) => ({
        title: item.title.trim(),
        description: item.description.trim(),

        technologies: item.technologies
          .split(",")
          .map((technology) => technology.trim())
          .filter(Boolean),

        projectUrl: item.projectUrl.trim(),
        githubUrl: item.githubUrl.trim(),
      }));


      const experience = formData.experience.map((item) => ({
        ...item,

        startDate: item.startDate || null,

        endDate: item.currentlyWorking
          ? null
          : item.endDate || null,
      }));


      const payload = {
        ...formData,

        fullname: formData.fullname.trim(),

        githubUrl: formData.githubUrl.trim(),
        linkedinUrl: formData.linkedinUrl.trim(),

        education,
        projects,
        experience,

        resumeFile,
      };


      const response = await updateUserProfile(payload);

      // Refresh AuthContext from backend
      await fetchCurrentUser();

      setResumeFile(null);
      setSkillInput("");

      setIsEditing(false);

      setSuccess(
        response.message || "Profile updated successfully."
      );

    } catch (err) {

      setError(
        err.message || "Unable to save your profile."
      );

    } finally {

      setSaving(false);

    }

  };


  // ------------------------------------------------
  // GLOBAL AUTHENTICATION LOADING
  // ------------------------------------------------

  if (authLoading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return null;
  }


  const firstName =
    user.fullname?.trim().split(/\s+/)[0] || "Student";


  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------

  return (

    <div className="min-h-screen bg-[#111820]
    px-4 pb-16 pt-28 sm:px-6 lg:px-12">

      <div className="mx-auto max-w-5xl">


        {/* ------------------------------------------
            PAGE HEADING
        ------------------------------------------ */}

        <div className="mb-8">

          <p className="text-xs font-semibold
          tracking-[0.2em] text-[#5B9295]">
            STUDENT PORTAL
          </p>

          <h1 className="mt-2 text-3xl font-bold
          tracking-tight text-[#F0F3F5]">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-[#AAB7C2]">
            Your academic and professional identity.
          </p>

        </div>


        {/* ------------------------------------------
            PROFILE HEADER AND COVER
        ------------------------------------------ */}

        <div className="mb-7 overflow-hidden rounded-xl
        border border-[#354652] bg-[#1C2933]">

          {/* Cover */}
          <div className="group relative h-40 overflow-hidden
          bg-gradient-to-r from-[#17232C] via-[#294550] to-[#17232C]
          sm:h-52">

            {user.coverImage && (
              <img
                src={user.coverImage}
                alt="Profile cover"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}

            <div className="absolute inset-0
            bg-gradient-to-r from-[#0B1118]/35
            via-transparent to-[#0B1118]/30" />


            {isEditing && (
              <>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "cover")}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={Boolean(uploading)}
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute bottom-4 right-4
                  flex items-center gap-2 rounded-lg
                  border border-white/20 bg-[#0B1118]/80
                  px-4 py-2 text-sm font-medium
                  text-white backdrop-blur-md
                  transition hover:bg-[#0B1118]
                  disabled:opacity-50"
                >
                  <Upload size={16}/>

                  {uploading === "cover"
                    ? "Uploading..."
                    : "Change Cover"}
                </button>
              </>
            )}

          </div>


          {/* Profile Summary */}
          <div className="px-5 pb-6 sm:px-8">

            <div className="flex flex-col gap-5
            sm:flex-row sm:items-end sm:justify-between">

              <div className="flex items-end gap-4">

                {/* Avatar */}
                <div className="relative -mt-14 shrink-0">

                  <div className="flex h-24 w-24
                  items-center justify-center overflow-hidden
                  rounded-full border-4 border-[#1C2933]
                  bg-[#111820] text-3xl font-bold text-[#A5C3C6]">

                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullname}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      firstName.charAt(0).toUpperCase()
                    )}

                  </div>

                  {isEditing && (
                    <>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "avatar")}
                        className="hidden"
                      />

                      <button
                        type="button"
                        disabled={Boolean(uploading)}
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute bottom-0 right-0
                        flex h-8 w-8 items-center justify-center
                        rounded-full border-2 border-[#1C2933]
                        bg-[#5B9295] text-[#101820]
                        hover:bg-[#70A5A5] disabled:opacity-50"
                        title="Change profile picture"
                      >
                        <Camera size={15}/>
                      </button>
                    </>
                  )}

                </div>


                <div className="pb-1">

                  <h2 className="text-xl font-bold text-[#F0F3F5]">
                    {user.fullname}
                  </h2>

                  <p className="mt-1 text-sm text-[#AAB7C2]">
                    {user.email}
                  </p>

                  <span className="mt-2 inline-block rounded-md
                  border border-[#5B9295]/30 bg-[#5B9295]/10
                  px-2.5 py-1 text-xs font-medium text-[#A5C3C6]">
                    Student
                  </span>

                </div>

              </div>


              {/* Edit / Cancel Controls */}
              {!isEditing ? (

                <button
                  type="button"
                  onClick={startEditing}
                  className="flex items-center justify-center
                  gap-2 rounded-lg border border-[#5B9295]/60
                  px-5 py-2.5 text-sm font-semibold
                  text-[#A5C3C6] transition
                  hover:bg-[#5B9295]/10"
                >
                  <Pencil size={16}/>
                  Edit Profile
                </button>

              ) : (

                <span className="text-xs font-medium
                tracking-wider text-[#91AFC0]">
                  EDITING PROFILE
                </span>

              )}

            </div>


            {/* Profile Stats */}
            <div className="mt-7 grid grid-cols-2
            gap-4 border-t border-[#354652]
            pt-5 sm:grid-cols-4">

              {[
                {
                  label: "Skills",
                  value: user.skills?.length || 0,
                },
                {
                  label: "Education",
                  value: user.education?.length || 0,
                },
                {
                  label: "Projects",
                  value: user.projects?.length || 0,
                },
                {
                  label: "Experience",
                  value: user.experience?.length || 0,
                },
              ].map((stat) => (

                <div key={stat.label}>

                  <p className="text-2xl font-bold text-[#E1E7EB]">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-[#8796A2]">
                    {stat.label}
                  </p>

                </div>

              ))}

            </div>


            {/* Profile Completion */}
            <div className="mt-6">

              <div className="mb-2 flex justify-between text-sm">

                <span className="text-[#AAB7C2]">
                  Profile completion
                </span>

                <span className="font-semibold text-[#A5C3C6]">
                  {completion}%
                </span>

              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[#354652]">

                <div
                  className="h-full rounded-full bg-[#5B9295]
                  transition-all duration-500"
                  style={{ width: `${completion}%` }}
                />

              </div>

            </div>

          </div>

        </div>


        {/* ------------------------------------------
            ALERTS
        ------------------------------------------ */}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border
            border-red-500/30 bg-red-500/10
            p-4 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 flex items-center gap-2
            rounded-lg border border-[#5B9295]/40
            bg-[#5B9295]/10 p-4 text-sm text-[#A9D1D0]"
          >
            <CheckCircle2 size={17}/>
            {success}
          </div>
        )}


        {/* ------------------------------------------
            PROFILE SECTIONS
        ------------------------------------------ */}

        <form onSubmit={handleSubmit} className="space-y-6">


          {/* PERSONAL INFORMATION */}
          <Section
            title="Personal Information"
            description="Basic information about you."
            icon={UserRound}
          >

            {isEditing ? (

              <div className="grid gap-5 sm:grid-cols-2">

                <Field label="Full Name">
                  <input
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </Field>

                <Field label="Email Address">
                  <input
                    value={formData.email}
                    disabled
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-[#71808C]">
                    Email cannot be changed here.
                  </p>
                </Field>

                <Field label="Mobile Number">
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        mobile: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10),
                      }))
                    }
                    className={inputClass}
                  />
                </Field>

              </div>

            ) : (

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <p className="text-xs text-[#8796A2]">Full Name</p>
                  <p className="mt-1 font-medium text-[#E1E7EB]">
                    {user.fullname || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#8796A2]">Email Address</p>
                  <p className="mt-1 font-medium text-[#E1E7EB] break-all">
                    {user.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#8796A2]">Mobile Number</p>
                  <p className="mt-1 font-medium text-[#E1E7EB]">
                    {user.mobile || "Not provided"}
                  </p>
                </div>

              </div>

            )}

          </Section>


          {/* EDUCATION */}
          <Section
            title="Education"
            description="Your academic qualifications."
            icon={GraduationCap}
          >

            {isEditing ? (

              <>

                {formData.education.map((item, index) => (

                  <div key={index} className="mb-5 rounded-lg
                  border border-[#354652] bg-[#111820] p-4">

                    <div className="mb-5 flex items-center justify-between">

                      <h3 className="font-semibold text-[#E1E7EB]">
                        Education #{index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() => removeArrayItem("education", index)}
                        className="text-[#8796A2] hover:text-red-400"
                      >
                        <Trash2 size={17}/>
                      </button>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                      {[
                        ["degree", "Degree"],
                        ["college", "College / University"],
                        ["yearOfPassing", "Year of Passing"],
                        ["cgpa", "CGPA"],
                      ].map(([field, label]) => (

                        <Field key={field} label={label}>

                          <input
                            type={
                              field === "yearOfPassing" || field === "cgpa"
                                ? "number"
                                : "text"
                            }
                            min={field === "cgpa" ? 0 : undefined}
                            max={field === "cgpa" ? 10 : 2100}
                            step={field === "cgpa" ? "0.01" : "1"}
                            value={item[field]}
                            onChange={(e) =>
                              updateArrayItem(
                                "education",
                                index,
                                field,
                                e.target.value
                              )
                            }
                            className={inputClass}
                          />

                        </Field>

                      ))}

                    </div>

                  </div>

                ))}

                <button
                  type="button"
                  onClick={addEducation}
                  className="flex items-center gap-2
                  text-sm font-semibold text-[#91AFC0]
                  hover:text-white"
                >
                  <Plus size={17}/>
                  Add Education
                </button>

              </>

            ) : (

              user.education?.length ? (

                <div className="space-y-5">

                  {user.education.map((item, index) => (

                    <div key={index} className="border-l-2
                    border-[#5B9295] pl-4">

                      <h3 className="font-semibold text-[#E1E7EB]">
                        {item.degree || "Degree"}
                      </h3>

                      <p className="mt-1 text-sm text-[#AAB7C2]">
                        {item.college || "College not provided"}
                      </p>

                      <p className="mt-2 text-xs text-[#8796A2]">
                        {item.yearOfPassing || "—"}
                        {" · "}
                        CGPA: {item.cgpa ?? "—"}
                      </p>

                    </div>

                  ))}

                </div>

              ) : (
                <EmptyState message="No education details added yet."/>
              )

            )}

          </Section>


          {/* SKILLS */}
          <Section
            title="Skills"
            description="Your technical and professional skills."
            icon={Code2}
          >

            {isEditing && (
              <div className="mb-5 flex flex-col gap-3 sm:flex-row">

                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  className={inputClass}
                  placeholder="Enter a skill"
                />

                <button
                  type="button"
                  onClick={addSkill}
                  className="flex items-center justify-center
                  gap-2 rounded-lg bg-[#5B9295]
                  px-5 py-2.5 text-sm font-semibold
                  text-[#101820] hover:bg-[#70A5A5]"
                >
                  <Plus size={17}/>
                  Add Skill
                </button>

              </div>
            )}

            {formData.skills.length ? (

              <div className="flex flex-wrap gap-2">

                {formData.skills.map((skill) => (

                  <span key={skill} className="flex items-center
                  gap-2 rounded-lg border border-[#5B9295]/30
                  bg-[#5B9295]/10 px-3 py-2 text-sm
                  text-[#B8D0D2]">

                    {skill}

                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-[#91AFC0] hover:text-red-400"
                      >
                        ×
                      </button>
                    )}

                  </span>

                ))}

              </div>

            ) : (
              <EmptyState message="No skills added yet."/>
            )}

          </Section>


          {/* PROJECTS */}
          <Section
            title="Projects"
            description="Academic, personal and development projects."
            icon={FolderKanban}
          >

            {isEditing ? (

              <>

                {formData.projects.map((item, index) => (

                  <div key={index} className="mb-5 rounded-lg
                  border border-[#354652] bg-[#111820] p-4">

                    <div className="mb-4 flex justify-between">

                      <h3 className="font-semibold text-[#E1E7EB]">
                        Project #{index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() => removeArrayItem("projects", index)}
                        className="text-[#8796A2] hover:text-red-400"
                      >
                        <Trash2 size={17}/>
                      </button>

                    </div>

                    <div className="space-y-4">

                      <Field label="Project Title">
                        <input
                          value={item.title}
                          onChange={(e) =>
                            updateArrayItem("projects", index, "title", e.target.value)
                          }
                          className={inputClass}
                          placeholder="Project name"
                        />
                      </Field>

                      <Field label="Description">
                        <textarea
                          rows={3}
                          value={item.description}
                          onChange={(e) =>
                            updateArrayItem("projects", index, "description", e.target.value)
                          }
                          className={inputClass}
                          placeholder="Describe your project..."
                        />
                      </Field>

                      <Field label="Technologies (comma separated)">
                        <input
                          value={item.technologies}
                          onChange={(e) =>
                            updateArrayItem("projects", index, "technologies", e.target.value)
                          }
                          className={inputClass}
                          placeholder="React, Node.js, MongoDB"
                        />
                      </Field>

                      <div className="grid gap-4 sm:grid-cols-2">

                        <Field label="Live Project URL">
                          <input
                            type="url"
                            value={item.projectUrl}
                            onChange={(e) =>
                              updateArrayItem("projects", index, "projectUrl", e.target.value)
                            }
                            className={inputClass}
                            placeholder="https://example.com"
                          />
                        </Field>

                        <Field label="GitHub Repository">
                          <input
                            type="url"
                            value={item.githubUrl}
                            onChange={(e) =>
                              updateArrayItem("projects", index, "githubUrl", e.target.value)
                            }
                            className={inputClass}
                            placeholder="https://github.com/username/project"
                          />
                        </Field>

                      </div>

                    </div>

                  </div>

                ))}

                <button
                  type="button"
                  onClick={addProject}
                  className="flex items-center gap-2
                  text-sm font-semibold text-[#91AFC0]
                  hover:text-white"
                >
                  <Plus size={17}/>
                  Add Project
                </button>

              </>

            ) : (

              user.projects?.length ? (

                <div className="space-y-4">

                  {user.projects.map((item, index) => (

                    <div key={index} className="rounded-lg
                    border border-[#354652] bg-[#111820] p-4">

                      <h3 className="font-semibold text-[#E1E7EB]">
                        {item.title || "Untitled Project"}
                      </h3>

                      <p className="mt-2 whitespace-pre-wrap
                      text-sm leading-7 text-[#AAB7C2]">
                        {item.description || "No description provided."}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">

                        {(item.technologies || []).map((tech) => (

                          <span key={tech} className="rounded-md
                          bg-[#5B9295]/10 px-2 py-1
                          text-xs text-[#A5C3C6]">
                            {tech}
                          </span>

                        ))}

                      </div>

                      <div className="mt-4 flex flex-wrap gap-4">

                        <ProfileLink
                          href={item.projectUrl}
                          label="Live Project"
                          icon={ExternalLink}
                        />

                        <ProfileLink
                          href={item.githubUrl}
                          label="GitHub Repository"
                          icon={Code2}
                        />

                      </div>

                    </div>

                  ))}

                </div>

              ) : (
                <EmptyState message="No projects added yet."/>
              )

            )}

          </Section>


          {/* EXPERIENCE */}
          <Section
            title="Experience"
            description="Internships and professional experience."
            icon={Briefcase}
          >

            {isEditing ? (

              <>

                {formData.experience.map((item, index) => (

                  <div key={index} className="mb-5 rounded-lg
                  border border-[#354652] bg-[#111820] p-4">

                    <div className="mb-4 flex justify-between">

                      <h3 className="font-semibold text-[#E1E7EB]">
                        Experience #{index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() => removeArrayItem("experience", index)}
                        className="text-[#8796A2] hover:text-red-400"
                      >
                        <Trash2 size={17}/>
                      </button>

                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">

                      <Field label="Company">
                        <input
                          value={item.company}
                          onChange={(e) =>
                            updateArrayItem("experience", index, "company", e.target.value)
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Position">
                        <input
                          value={item.position}
                          onChange={(e) =>
                            updateArrayItem("experience", index, "position", e.target.value)
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Employment Type">
                        <select
                          value={item.employmentType}
                          onChange={(e) =>
                            updateArrayItem("experience", index, "employmentType", e.target.value)
                          }
                          className={inputClass}
                        >
                          <option value="Internship">Internship</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Freelance">Freelance</option>
                        </select>
                      </Field>

                      <Field label="Start Date">
                        <input
                          type="date"
                          value={item.startDate}
                          onChange={(e) =>
                            updateArrayItem("experience", index, "startDate", e.target.value)
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field label="End Date">
                        <input
                          type="date"
                          value={item.endDate}
                          disabled={item.currentlyWorking}
                          onChange={(e) =>
                            updateArrayItem("experience", index, "endDate", e.target.value)
                          }
                          className={inputClass}
                        />
                      </Field>

                    </div>

                    <label className="my-4 flex items-center gap-2
                    text-sm text-[#AAB7C2]">

                      <input
                        type="checkbox"
                        checked={item.currentlyWorking}
                        onChange={(e) => {
                          updateArrayItem(
                            "experience",
                            index,
                            "currentlyWorking",
                            e.target.checked
                          );

                          if (e.target.checked) {
                            updateArrayItem(
                              "experience",
                              index,
                              "endDate",
                              ""
                            );
                          }
                        }}
                        className="accent-[#5B9295]"
                      />

                      I currently work here

                    </label>

                    <Field label="Description">
                      <textarea
                        rows={3}
                        value={item.description}
                        onChange={(e) =>
                          updateArrayItem("experience", index, "description", e.target.value)
                        }
                        className={inputClass}
                        placeholder="Describe your responsibilities..."
                      />
                    </Field>

                  </div>

                ))}

                <button
                  type="button"
                  onClick={addExperience}
                  className="flex items-center gap-2
                  text-sm font-semibold text-[#91AFC0]
                  hover:text-white"
                >
                  <Plus size={17}/>
                  Add Experience
                </button>

              </>

            ) : (

              user.experience?.length ? (

                <div className="space-y-5">

                  {user.experience.map((item, index) => (

                    <div key={index} className="border-l-2
                    border-[#5B9295] pl-5">

                      <h3 className="font-semibold text-[#E1E7EB]">
                        {item.position}
                      </h3>

                      <p className="mt-1 text-sm text-[#AAB7C2]">
                        {item.company}
                        {" · "}
                        {item.employmentType}
                      </p>

                      <p className="mt-1 text-xs text-[#8796A2]">
                        {formatDate(item.startDate)}
                        {" – "}
                        {item.currentlyWorking
                          ? "Present"
                          : formatDate(item.endDate)}
                      </p>

                      {item.description && (
                        <p className="mt-3 whitespace-pre-wrap
                        text-sm leading-7 text-[#AAB7C2]">
                          {item.description}
                        </p>
                      )}

                    </div>

                  ))}

                </div>

              ) : (
                <EmptyState message="No experience added yet."/>
              )

            )}

          </Section>


          {/* RESUME AND LINKS */}
          <Section
            title="Resume & Professional Links"
            description="Your resume and professional online presence."
            icon={FileText}
          >

            {isEditing ? (

              <div className="space-y-6">

                <Field label="Resume PDF (maximum 5 MB)">

                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleResumeChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => resumeInputRef.current?.click()}
                    className="flex w-full items-center
                    justify-center gap-3 rounded-lg
                    border border-dashed border-[#5B9295]/50
                    bg-[#111820] px-5 py-6 text-sm
                    text-[#AAB7C2] transition
                    hover:border-[#5B9295]"
                  >
                    <Upload size={20}/>

                    {resumeFile
                      ? resumeFile.name
                      : "Choose Resume PDF"}
                  </button>

                  {user.resumeUrl && (
                    <a
                      href={user.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center
                      gap-2 text-sm text-[#91AFC0] hover:text-white"
                    >
                      <FileText size={16}/>
                      View Existing Resume
                      <ExternalLink size={14}/>
                    </a>
                  )}

                  {resumeFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setResumeFile(null);

                        if (resumeInputRef.current) {
                          resumeInputRef.current.value = "";
                        }
                      }}
                      className="mt-2 block text-xs text-red-300"
                    >
                      Remove Selected File
                    </button>
                  )}

                </Field>


                <Field label="GitHub Profile">
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://github.com/username"
                  />
                </Field>


                <Field label="LinkedIn Profile">
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://linkedin.com/in/username"
                  />
                </Field>

              </div>

            ) : (

              <div className="space-y-6">

                <div>
                  <p className="mb-2 text-xs text-[#8796A2]">
                    Resume
                  </p>

                  {user.resumeUrl ? (

                    <ProfileLink
                      href={user.resumeUrl}
                      label="View Resume"
                      icon={FileText}
                    />

                  ) : (
                    <p className="text-sm text-[#71808C]">
                      No resume uploaded.
                    </p>
                  )}

                </div>


                <div>
                  <p className="mb-2 text-xs text-[#8796A2]">
                    GitHub Profile
                  </p>

                  {user.githubUrl ? (

                    <ProfileLink
                      href={user.githubUrl}
                      label={user.githubUrl}
                      icon={Github}
                    />

                  ) : (
                    <p className="text-sm text-[#71808C]">
                      Not provided
                    </p>
                  )}

                </div>


                <div>
                  <p className="mb-2 text-xs text-[#8796A2]">
                    LinkedIn Profile
                  </p>

                  {user.linkedinUrl ? (

                    <ProfileLink
                      href={user.linkedinUrl}
                      label={user.linkedinUrl}
                      icon={ExternalLink}
                    />

                  ) : (
                    <p className="text-sm text-[#71808C]">
                      Not provided
                    </p>
                  )}

                </div>

              </div>

            )}

          </Section>


          {/* ------------------------------------------
              STICKY SAVE / CANCEL ACTIONS
          ------------------------------------------ */}

          {isEditing && (

            <div className="sticky bottom-4 z-20 flex
            flex-col-reverse justify-end gap-3
            rounded-xl border border-[#354652]
            bg-[#111820]/95 p-3 shadow-xl backdrop-blur-md
            sm:flex-row">

              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving || Boolean(uploading)}
                className="flex items-center justify-center
                gap-2 rounded-lg border border-[#455967]
                px-6 py-3 text-sm font-semibold
                text-[#C5D0D6] transition hover:bg-white/5
                disabled:opacity-50"
              >
                <X size={17}/>
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || Boolean(uploading)}
                className="flex items-center justify-center
                gap-2 rounded-lg bg-[#5B9295]
                px-7 py-3 text-sm font-semibold
                text-[#101820] transition hover:bg-[#70A5A5]
                disabled:cursor-not-allowed disabled:opacity-60"
              >

                {saving ? (

                  <>
                    <span className="h-4 w-4 animate-spin
                    rounded-full border-2 border-[#101820]/30
                    border-t-[#101820]"/>

                    Saving Profile...
                  </>

                ) : (

                  <>
                    <Save size={17}/>
                    Save Profile
                  </>

                )}

              </button>

            </div>

          )}

        </form>

      </div>

    </div>

  );

};

export default Profile;
