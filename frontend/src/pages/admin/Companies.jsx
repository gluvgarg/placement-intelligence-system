
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
} from "motion/react";

import {
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Edit3,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";

import {
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
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

const getInitial = (name) =>
  (name || "C").trim().charAt(0).toUpperCase();

const inputClass =
  "w-full rounded-xl border border-[#354955] bg-[#111B24] px-3.5 py-3 text-sm text-[#E1E9ED] outline-none transition placeholder:text-[#627681] focus:border-[#6F9E9E] focus:ring-2 focus:ring-[#5B9295]/10";

const labelClass =
  "mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-[#91A3AE]";

/* --------------------------------------------------
   Company form modal
-------------------------------------------------- */

function CompanyModal({
  company,
  onClose,
  onSave,
  saving,
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    manager: "",
    email: "",
    contact: "",
    location: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    setForm({
      name: company?.name || "",
      description: company?.description || "",
      manager: company?.manager || "",
      email: company?.email || "",
      contact: company?.contact || "",
      location: company?.location || "",
    });

    setLogoFile(null);
  }, [company]);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(company?.logo || "");
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile, company]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...form,
      logoFile,
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
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#3B505D] bg-[#15212A] shadow-2xl"
      >
        {/* Modal header */}
        <div className="flex items-start justify-between border-b border-[#2E414C] px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#82A9B1]">
              Company directory
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#EAF0F2]">
              {company ? "Edit company" : "Register company"}
            </h2>

            <p className="mt-1 text-xs text-[#8799A4]">
              {company
                ? "Update the organisation's information."
                : "Add a new recruitment partner to your database."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-[#354955] p-2 text-[#91A3AE] transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[65vh] space-y-5 overflow-y-auto px-5 py-6 sm:px-7">
            {/* Logo upload */}
            <div>
              <label className={labelClass}>
                Company logo
              </label>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[#3B505D] bg-[#20313A]">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Company logo preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Building2
                      size={25}
                      className="text-[#8DB8B5]"
                    />
                  )}
                </div>

                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#455C68] bg-[#1B2A34] px-4 py-2.5 text-xs font-medium text-[#BED0D7] transition hover:border-[#6F9E9E] hover:text-white">
                  <UploadCloud size={15} />
                  Choose logo

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      setLogoFile(event.target.files?.[0] || null);
                    }}
                  />
                </label>

                <span className="text-[10px] text-[#738894]">
                  Optional · Image file
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Company name */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Company name <span className="text-rose-400">*</span>
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Acme Technologies"
                  className={inputClass}
                  required
                  maxLength={100}
                />
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>
                  Official email <span className="text-rose-400">*</span>
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="hr@company.com"
                  className={inputClass}
                  required
                />
              </div>

              {/* Contact */}
              <div>
                <label className={labelClass}>
                  Contact number <span className="text-rose-400">*</span>
                </label>

                <input
                  type="tel"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="Company contact number"
                  className={inputClass}
                  required
                />
              </div>

              {/* Manager */}
              <div>
                <label className={labelClass}>
                  Contact person / Manager
                </label>

                <input
                  name="manager"
                  value={form.manager}
                  onChange={handleChange}
                  placeholder="Recruitment manager"
                  className={inputClass}
                />
              </div>

              {/* Location */}
              <div>
                <label className={labelClass}>
                  Location <span className="text-rose-400">*</span>
                </label>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Gurugram, Haryana"
                  className={inputClass}
                  required
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Company description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Brief description of the organisation..."
                  rows={3}
                  maxLength={1500}
                  className={`${inputClass} resize-y`}
                />

                <p className="mt-1 text-right text-[10px] text-[#6E828E]">
                  {form.description.length}/1500
                </p>
              </div>
            </div>
          </div>

          {/* Modal actions */}
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
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6F9E9E] px-5 py-2.5 text-xs font-semibold text-[#101820] transition hover:bg-[#8BB5B4] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}

              {saving
                ? "Saving..."
                : company
                  ? "Save changes"
                  : "Register company"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------------------------
   Delete confirmation modal
-------------------------------------------------- */

function DeleteModal({
  company,
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
          Delete company?
        </h3>

        <p className="mt-2 text-sm leading-6 text-[#A0ADB5]">
          You are about to delete{" "}
          <span className="font-semibold text-[#E7EEF1]">
            {company?.name}
          </span>
          . This action cannot be undone.
        </p>

        <div className="mt-4 flex gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-3">
          <CircleAlert
            size={16}
            className="mt-0.5 shrink-0 text-amber-300"
          />
          <p className="text-[11px] leading-5 text-amber-100/80">
            The current backend does not automatically remove or
            reassign jobs linked to this company. Review its job
            postings before deleting it.
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
            {deleting ? "Deleting..." : "Delete company"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------------------------
   Company management page
-------------------------------------------------- */

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyToDelete, setCompanyToDelete] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCompanies = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await getAllCompanies();
      setCompanies(extractArray(response));
    } catch (err) {
      setError(err.message || "Unable to load companies.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = companies.filter((company) => {
      if (!term) return true;

      return [
        company.name,
        company.manager,
        company.email,
        company.contact,
        company.location,
      ].some((value) =>
        String(value || "").toLowerCase().includes(term)
      );
    });

    return filtered.sort((a, b) => {
      if (sortOrder === "oldest") {
        return new Date(a.createdAt || 0) -
          new Date(b.createdAt || 0);
      }

      if (sortOrder === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }

      return new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0);
    });
  }, [companies, search, sortOrder]);

  const locationCount = useMemo(() => {
    const locations = companies
      .map((company) => company.location?.trim().toLowerCase())
      .filter(Boolean);

    return new Set(locations).size;
  }, [companies]);

  const addedThisMonth = useMemo(() => {
    const now = new Date();

    return companies.filter((company) => {
      if (!company.createdAt) return false;

      const date = new Date(company.createdAt);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [companies]);

  const openAddModal = () => {
    setSelectedCompany(null);
    setModalOpen(true);
    setError("");
    setNotice("");
  };

  const openEditModal = (company) => {
    setSelectedCompany(company);
    setModalOpen(true);
    setError("");
    setNotice("");
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setSelectedCompany(null);
  };

  const handleSaveCompany = async (formData) => {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (selectedCompany) {
        await updateCompany(selectedCompany._id, formData);
        setNotice("Company details updated successfully.");
      } else {
        await createCompany(formData);
        setNotice("Company registered successfully.");
      }

      setModalOpen(false);
      setSelectedCompany(null);
      await loadCompanies(true);
    } catch (err) {
      setError(err.message || "Unable to save company details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete?._id) return;

    setDeleting(true);
    setError("");
    setNotice("");

    try {
      await deleteCompany(companyToDelete._id);

      setCompanies((previous) =>
        previous.filter(
          (company) => company._id !== companyToDelete._id
        )
      );

      setNotice(`${companyToDelete.name} was deleted.`);
      setCompanyToDelete(null);
    } catch (err) {
      setError(err.message || "Unable to delete company.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1118] text-[#E6EDF1]">
      <main className="mx-auto w-full max-w-[1600px] px-4 pb-14 pt-24 sm:px-6 sm:pt-28 lg:px-9 lg:pt-28">
        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#83A8B1]">
              ADMINISTRATION / DIRECTORY
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#EDF2F4]">
              Companies
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#91A3AE]">
              Manage recruitment partners and maintain their
              organisation details.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-[#6F9E9E] px-5 py-3 text-xs font-semibold text-[#101820] transition hover:bg-[#8BB5B4]"
          >
            <Plus size={16} />
            Add company
          </button>
        </motion.div>

        {/* Success and error messages */}
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
                className="ml-auto text-current opacity-70 hover:opacity-100"
                aria-label="Dismiss message"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="mb-6 grid grid-cols-1 overflow-hidden rounded-2xl border border-[#2B3C47] bg-[#141F28] sm:grid-cols-3"
        >
          <div className="flex items-center gap-3 border-b border-[#2B3C47] p-4 sm:border-b-0 sm:border-r">
            <div className="rounded-lg border border-[#5B9295]/20 bg-[#5B9295]/10 p-2.5 text-[#9BC4C1]">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#81939E]">
                Registered companies
              </p>
              <p className="mt-1 text-xl font-semibold text-[#E6EDF1]">
                {companies.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-[#2B3C47] p-4 sm:border-b-0 sm:border-r">
            <div className="rounded-lg border border-[#739BB5]/20 bg-[#739BB5]/10 p-2.5 text-[#A4C3D3]">
              <Globe2 size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#81939E]">
                Locations represented
              </p>
              <p className="mt-1 text-xl font-semibold text-[#E6EDF1]">
                {locationCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4">
            <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-2.5 text-emerald-300">
              <CalendarDays size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#81939E]">
                Added this month
              </p>
              <p className="mt-1 text-xl font-semibold text-[#E6EDF1]">
                {addedThisMonth}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search / filters */}
        <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#2B3C47] bg-[#141F28] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#758A96]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, manager, location or email..."
              className="w-full rounded-xl border border-[#354955] bg-[#101922] py-3 pl-10 pr-4 text-xs text-[#E1E9ED] outline-none transition placeholder:text-[#71848F] focus:border-[#6F9E9E]"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            <span className="text-[11px] text-[#82939E]">
              {filteredCompanies.length} of {companies.length} companies
            </span>

            <div className="relative">
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                className="appearance-none rounded-xl border border-[#354955] bg-[#101922] py-3 pl-3 pr-9 text-xs text-[#BDCAD1] outline-none focus:border-[#6F9E9E]"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Company name</option>
              </select>

              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#82939E]"
              />
            </div>

            <button
              type="button"
              onClick={() => loadCompanies(true)}
              disabled={refreshing || loading}
              title="Refresh companies"
              className="rounded-xl border border-[#354955] bg-[#1B2932] p-3 text-[#AFC0C8] transition hover:border-[#6F9E9E] hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </section>

        {/* Company table */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.45 }}
          className="overflow-hidden rounded-2xl border border-[#2B3C47] bg-[#141F28]"
        >
          <div className="flex items-center justify-between border-b border-[#2B3C47] px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-[#E3EBEF]">
                Company directory
              </h2>
              <p className="mt-1 text-[10px] text-[#82939E]">
                Organisation records and contact information
              </p>
            </div>

            <span className="rounded-lg border border-[#354955] bg-[#1B2932] px-2.5 py-1.5 text-[10px] text-[#AABBC4]">
              {companies.length} records
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
          ) : error && companies.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <CircleAlert
                size={25}
                className="mx-auto text-rose-300"
              />
              <p className="mt-3 text-sm text-[#DCE5E9]">
                Unable to load company records
              </p>
              <button
                type="button"
                onClick={() => loadCompanies()}
                className="mt-4 text-xs font-medium text-[#91BDBA] hover:text-white"
              >
                Try again
              </button>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Building2
                size={27}
                className="mx-auto text-[#748A96]"
              />

              <p className="mt-3 text-sm font-medium text-[#DCE5E9]">
                {search
                  ? "No matching companies"
                  : "No companies registered yet"}
              </p>

              <p className="mt-1 text-xs text-[#82939E]">
                {search
                  ? "Try a different search term."
                  : "Register your first recruitment partner to get started."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#6F9E9E] px-4 py-2.5 text-xs font-semibold text-[#101820] hover:bg-[#8BB5B4]"
                >
                  <Plus size={14} /> Add company
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-[#111A22]">
                    <tr className="text-[9px] uppercase tracking-[0.13em] text-[#7F929D]">
                      <th className="px-6 py-4 font-medium">
                        Company
                      </th>
                      <th className="px-4 py-4 font-medium">
                        Contact person
                      </th>
                      <th className="px-4 py-4 font-medium">
                        Location
                      </th>
                      <th className="px-4 py-4 font-medium">
                        Contact details
                      </th>
                      <th className="px-4 py-4 font-medium">
                        Registered
                      </th>
                      <th className="px-5 py-4 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCompanies.map((company, index) => (
                      <motion.tr
                        key={company._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="border-t border-[#293A44] transition-colors hover:bg-[#1A2932]/70"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#3A505B] bg-[#20313A] text-sm font-semibold text-[#B7CCD3]">
                              {company.logo ? (
                                <img
                                  src={company.logo}
                                  alt={company.name}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                getInitial(company.name)
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[180px] truncate text-xs font-semibold text-[#DEE7EB]">
                                {company.name}
                              </p>
                              <p className="mt-1 max-w-[180px] truncate text-[10px] text-[#82939E]">
                                {company.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-xs text-[#B8C6CD]">
                          {company.manager || "—"}
                        </td>

                        <td className="px-4 py-4">
                          <span className="flex items-center gap-1.5 text-xs text-[#AFC0C8]">
                            <MapPin
                              size={12}
                              className="shrink-0 text-[#8199A5]"
                            />
                            {company.location || "—"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="space-y-1.5">
                            <p className="flex items-center gap-1.5 text-[10px] text-[#AFC0C8]">
                              <Mail size={11} className="text-[#8199A5]" />
                              {company.email}
                            </p>
                            <p className="flex items-center gap-1.5 text-[10px] text-[#82939E]">
                              <Phone size={11} className="text-[#8199A5]" />
                              {company.contact}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-[10px] text-[#91A2AC]">
                          {formatDate(company.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(company)}
                              title="Edit company"
                              className="rounded-lg border border-[#405763] p-2 text-[#9DB8C1] transition hover:border-[#6F9E9E] hover:bg-[#5B9295]/10 hover:text-white"
                            >
                              <Edit3 size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setCompanyToDelete(company)}
                              title="Delete company"
                              className="rounded-lg border border-[#60434A] p-2 text-[#D69A9F] transition hover:border-rose-400/60 hover:bg-rose-400/10 hover:text-rose-200"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile company cards */}
              <div className="space-y-3 p-4 md:hidden">
                {filteredCompanies.map((company) => (
                  <div
                    key={company._id}
                    className="rounded-xl border border-[#354955] bg-[#111B24] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#3A505B] bg-[#20313A] text-sm font-semibold text-[#B7CCD3]">
                        {company.logo ? (
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          getInitial(company.name)
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[#E2EAEF]">
                          {company.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-[#82939E]">
                          {company.manager || "Manager not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-[#2B3C47] pt-3 text-xs text-[#AFC0C8]">
                      <p className="flex items-center gap-2">
                        <MapPin size={13} className="text-[#8199A5]" />
                        {company.location || "Location unavailable"}
                      </p>
                      <p className="flex items-center gap-2 break-all">
                        <Mail size={13} className="shrink-0 text-[#8199A5]" />
                        {company.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone size={13} className="text-[#8199A5]" />
                        {company.contact}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#2B3C47] pt-3">
                      <span className="text-[10px] text-[#82939E]">
                        Added {formatDate(company.createdAt)}
                      </span>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(company)}
                          className="rounded-lg border border-[#405763] p-2 text-[#9DB8C1]"
                          aria-label={`Edit ${company.name}`}
                        >
                          <Edit3 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setCompanyToDelete(company)}
                          className="rounded-lg border border-[#60434A] p-2 text-[#D69A9F]"
                          aria-label={`Delete ${company.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.section>

        {/* Modals */}
        <AnimatePresence>
          {modalOpen && (
            <CompanyModal
              company={selectedCompany}
              onClose={closeModal}
              onSave={handleSaveCompany}
              saving={saving}
            />
          )}

          {companyToDelete && (
            <DeleteModal
              company={companyToDelete}
              onCancel={() => {
                if (!deleting) setCompanyToDelete(null);
              }}
              onConfirm={handleDeleteCompany}
              deleting={deleting}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
