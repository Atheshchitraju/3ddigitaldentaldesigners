import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export const Route = createFileRoute("/partner-with-us/")({
    component: PartnerWithUs,
});

/* ========================================================= */
/* MAP CONFIG (react-leaflet + OpenStreetMap)                 */
/* ========================================================= */
/**
 * Uses your existing react-leaflet + leaflet install — no API key needed.
 * Search/reverse-geocoding uses OpenStreetMap's free Nominatim API. For
 * production traffic beyond light use, Nominatim's usage policy asks that
 * you self-host or use a paid geocoding provider instead of the public
 * endpoint (max ~1 request/sec, no heavy commercial use).
 */
const DEFAULT_MAP_CENTER: [number, number] = [12.9716, 77.5946]; // Bengaluru fallback
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

const leafletPinIcon = L.divIcon({
    className: "",
    html: `<svg width="30" height="40" viewBox="0 0 20 26" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 25S1 14.5 1 9a9 9 0 1118 0c0 5.5-9 16-9 16z" fill="#1D5C5A" stroke="#0F3130" stroke-width="1"/>
        <circle cx="10" cy="9" r="3.4" fill="#ffffff"/>
    </svg>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
});

/* ========================================================= */
/* CONSTANTS                                                 */
/* ========================================================= */

const specializations = [
    "Prosthodontics",
    "Orthodontics",
    "Endodontics",
    "Implantology",
    "Cosmetic Dentistry",
    "General Dentistry",
    "Pediatric Dentistry",
    "Oral Surgery",
    "Other",
];

const interestedServices = [
    "Smile Design",
    "Aligners",
    "Veneers",
    "Crown Design",
    "Implant Planning",
    "Full Mouth Rehabilitation",
    "Digital Smile Planning",
    "3D Design Services",
    "Consultation Support",
    "Lab Support",
    "Other",
];

const designations = [
    "Clinic Owner",
    "Dentist",
    "Manager",
    "Coordinator",
    "Other",
];

const sections = [
    { id: "clinic-info", label: "Clinic" },
    { id: "contact", label: "Contact" },
    { id: "doctors", label: "Doctors" },
    { id: "workflow", label: "Services" },
    { id: "files", label: "Files" },
    { id: "location", label: "Location" },
    { id: "consent", label: "Review" },
];

/* ========================================================= */
/* TYPES                                                      */
/* ========================================================= */

type Doctor = {
    name: string;
    qualification: string;
    specializations: string[];
    yearsOfExperience: string;
    registrationNumber: string;
    image: File | null;
    certificates: File[];
};

const emptyDoctor = (): Doctor => ({
    name: "",
    qualification: "",
    specializations: [],
    yearsOfExperience: "",
    registrationNumber: "",
    image: null,
    certificates: [],
});

/* ========================================================= */
/* MAIN COMPONENT                                             */
/* ========================================================= */

function PartnerWithUs() {
    const [formData, setFormData] = useState({
        clinicName: "",
        ownerName: "",
        yearEstablished: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        website: "",
        socialMediaLink: "",

        primaryContactPerson: "",
        designation: "",
        mobileNumber: "",
        whatsappNumber: "",
        email: "",

        numberOfDoctors: "1",

        currentWorkflow: "",
        worksWithDigitalLab: "",

        latitude: "",
        longitude: "",

        declaration: false,
    });

    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([emptyDoctor()]);
    const [clinicLogo, setClinicLogo] = useState<File | null>(null);
    const [clinicPhotos, setClinicPhotos] = useState<File[]>([]);
    const [submitted, setSubmitted] = useState(false);

    /* ---------------- field helpers ---------------- */

    const updateField = (
        field: keyof typeof formData,
        value: string | boolean,
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleLocationChange = (data: {
        latitude: string;
        longitude: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
    }) => {
        setFormData((prev) => ({
            ...prev,
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address || prev.address,
            city: data.city || prev.city,
            state: data.state || prev.state,
            pincode: data.pincode || prev.pincode,
        }));
    };

    const updateDoctor = (
        index: number,
        field: keyof Doctor,
        value: string | File | File[] | null,
    ) => {
        setDoctors((prev) =>
            prev.map((doctor, doctorIndex) =>
                doctorIndex === index ? { ...doctor, [field]: value } : doctor,
            ),
        );
    };

    const addDoctor = () => {
        setDoctors((prev) => [...prev, emptyDoctor()]);
    };

    const removeDoctor = (index: number) => {
        if (doctors.length === 1) return;
        setDoctors((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleService = (service: string) => {
        setSelectedServices((prev) =>
            prev.includes(service)
                ? prev.filter((item) => item !== service)
                : [...prev, service],
        );
    };

    const toggleDoctorSpecialization = (
        doctorIndex: number,
        specialization: string,
    ) => {
        setDoctors((prev) =>
            prev.map((doctor, index) => {
                if (index !== doctorIndex) return doctor;

                const exists = doctor.specializations.includes(specialization);

                return {
                    ...doctor,
                    specializations: exists
                        ? doctor.specializations.filter(
                              (item) => item !== specialization,
                          )
                        : [...doctor.specializations, specialization],
                };
            }),
        );
    };

    /* ---------------- progress tracking ---------------- */

    const requiredChecks = useMemo(
        () => [
            !!formData.clinicName,
            !!formData.ownerName,
            !!formData.yearEstablished,
            !!formData.address,
            !!formData.city,
            !!formData.state,
            !!formData.pincode,
            !!formData.primaryContactPerson,
            !!formData.designation,
            !!formData.mobileNumber,
            !!formData.whatsappNumber,
            !!formData.email,
            doctors.every(
                (d) =>
                    d.name &&
                    d.qualification &&
                    d.specializations.length > 0 &&
                    d.registrationNumber,
            ),
            selectedServices.length > 0,
            formData.declaration,
        ],
        [formData, doctors, selectedServices],
    );

    const progress = Math.round(
        (requiredChecks.filter(Boolean).length / requiredChecks.length) * 100,
    );

    /* ---------------- section scroll-spy ---------------- */

    const [activeSection, setActiveSection] = useState(sections[0].id);
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

                if (visible[0]?.target.id) {
                    setActiveSection(visible[0].target.id);
                }
            },
            { rootMargin: "-15% 0px -70% 0px", threshold: 0.1 },
        );

        Object.values(sectionRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const registerSection = (id: string) => (el: HTMLElement | null) => {
        sectionRefs.current[id] = el;
    };

    const scrollToSection = (id: string) => {
        document
            .getElementById(id)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    /* ---------------- submit ---------------- */

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Partner With Us form data:", {
            formData,
            doctors,
            selectedServices,
            clinicLogo,
            clinicPhotos,
        });

        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (submitted) {
        return <SubmittedState clinicName={formData.clinicName} />;
    }

    return (
        <main className="min-h-screen bg-[#F7F6F3] pb-28 pt-24 lg:pb-20">
            {/* Hero */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1D5C5A] to-[#0F3130] px-6 py-12 text-white shadow-xl sm:px-10 md:px-16">
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#C9973A]/20 blur-3xl"
                    />

                    <div className="relative max-w-3xl">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#C9973A]" />
                            Partner With Digital Dental Designers
                        </span>

                        <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                            Bring your clinic onto our digital design network
                        </h1>

                        <p className="mt-4 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
                            Share your clinic, doctors and service needs below. A member
                            of our partnerships team will review your application and get
                            in touch within 2–3 business days.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
                            <span className="flex items-center gap-2">
                                <CheckIcon className="h-4 w-4 text-[#C9973A]" />
                                Takes about 8 minutes
                            </span>
                            <span className="flex items-center gap-2">
                                <CheckIcon className="h-4 w-4 text-[#C9973A]" />
                                Save-friendly, section by section
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sticky progress / section nav */}
            <div className="sticky top-16 z-30 mt-6 border-y border-slate-200/70 bg-[#F7F6F3]/90 py-3 backdrop-blur">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="flex items-center gap-4">
                        <div className="hidden shrink-0 text-xs font-semibold text-slate-500 sm:block">
                            {progress}% complete
                        </div>

                        <div className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-slate-200 sm:hidden">
                            <div
                                className="h-full rounded-full bg-[#C9973A] transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <nav className="flex flex-1 gap-2 overflow-x-auto scrollbar-none">
                            {sections.map((section, index) => {
                                const isActive = activeSection === section.id;
                                return (
                                    <button
                                        key={section.id}
                                        type="button"
                                        onClick={() => scrollToSection(section.id)}
                                        className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition sm:text-sm ${
                                            isActive
                                                ? "border-[#1D5C5A] bg-[#1D5C5A] text-white shadow-sm"
                                                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                                        }`}
                                    >
                                        <span
                                            className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${
                                                isActive
                                                    ? "bg-white/20"
                                                    : "bg-slate-100 text-slate-400"
                                            }`}
                                        >
                                            {index + 1}
                                        </span>
                                        {section.label}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="hidden shrink-0 items-center gap-2 sm:flex">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className="h-full rounded-full bg-[#C9973A] transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
                <form id="partner-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* ───────────────────────────────────── */}
                    {/* CLINIC INFORMATION */}
                    {/* ───────────────────────────────────── */}

                    <FormSection
                        id="clinic-info"
                        registerRef={registerSection}
                        number="01"
                        title="Clinic Information"
                        description="Tell us about your dental clinic."
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            <Input
                                label="Clinic Name"
                                required
                                value={formData.clinicName}
                                onChange={(value) => updateField("clinicName", value)}
                            />

                            <Input
                                label="Clinic Owner Name"
                                required
                                value={formData.ownerName}
                                onChange={(value) => updateField("ownerName", value)}
                            />

                            <Input
                                label="Year Established"
                                type="number"
                                required
                                placeholder="e.g. 2015"
                                value={formData.yearEstablished}
                                onChange={(value) => updateField("yearEstablished", value)}
                            />

                            <Input
                                label="Pincode"
                                required
                                value={formData.pincode}
                                onChange={(value) => updateField("pincode", value)}
                            />
                        </div>

                        <div className="mt-5">
                            <TextArea
                                label="Clinic Address"
                                required
                                rows={3}
                                placeholder="Building, street, landmark"
                                value={formData.address}
                                onChange={(value) => updateField("address", value)}
                            />
                        </div>

                        <div className="mt-5 grid gap-5 md:grid-cols-2">
                            <Input
                                label="City"
                                required
                                value={formData.city}
                                onChange={(value) => updateField("city", value)}
                            />

                            <Input
                                label="State"
                                required
                                value={formData.state}
                                onChange={(value) => updateField("state", value)}
                            />

                            <Input
                                label="Clinic Website"
                                type="url"
                                placeholder="https://"
                                value={formData.website}
                                onChange={(value) => updateField("website", value)}
                            />

                            <Input
                                label="Instagram / Social Media Link"
                                type="url"
                                placeholder="https://"
                                value={formData.socialMediaLink}
                                onChange={(value) => updateField("socialMediaLink", value)}
                            />
                        </div>
                    </FormSection>

                    {/* ───────────────────────────────────── */}
                    {/* CONTACT */}
                    {/* ───────────────────────────────────── */}

                    <FormSection
                        id="contact"
                        registerRef={registerSection}
                        number="02"
                        title="Primary Contact"
                        description="Who should we contact regarding the partnership?"
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            <Input
                                label="Primary Contact Person"
                                required
                                value={formData.primaryContactPerson}
                                onChange={(value) =>
                                    updateField("primaryContactPerson", value)
                                }
                            />

                            <Select
                                label="Designation"
                                required
                                value={formData.designation}
                                options={designations}
                                onChange={(value) => updateField("designation", value)}
                            />

                            <Input
                                label="Mobile Number"
                                type="tel"
                                required
                                placeholder="10-digit number"
                                value={formData.mobileNumber}
                                onChange={(value) => updateField("mobileNumber", value)}
                            />

                            <Input
                                label="WhatsApp Number"
                                type="tel"
                                required
                                placeholder="10-digit number"
                                value={formData.whatsappNumber}
                                onChange={(value) => updateField("whatsappNumber", value)}
                            />

                            <Input
                                label="Email Address"
                                type="email"
                                required
                                placeholder="you@clinic.com"
                                value={formData.email}
                                onChange={(value) => updateField("email", value)}
                            />
                        </div>
                    </FormSection>

                    {/* ───────────────────────────────────── */}
                    {/* DOCTORS */}
                    {/* ───────────────────────────────────── */}

                    <FormSection
                        id="doctors"
                        registerRef={registerSection}
                        number="03"
                        title="Doctor Details"
                        description="Add the doctors who should appear on your clinic profile."
                    >
                        <div className="max-w-xs">
                            <Input
                                label="Number of Doctors"
                                type="number"
                                required
                                min="1"
                                value={formData.numberOfDoctors}
                                onChange={(value) => updateField("numberOfDoctors", value)}
                            />
                        </div>

                        <div className="mt-6 space-y-6">
                            {doctors.map((doctor, index) => (
                                <div
                                    key={index}
                                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition hover:border-slate-300 sm:p-6"
                                >
                                    <div className="mb-5 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1D5C5A]/10 text-sm font-bold text-[#1D5C5A]">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-slate-800 sm:text-lg">
                                                    {doctor.name || `Doctor ${index + 1}`}
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    {doctor.qualification || "Qualification pending"}
                                                </p>
                                            </div>
                                        </div>

                                        {doctors.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeDoctor(index)}
                                                className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                            >
                                                <TrashIcon className="h-3.5 w-3.5" />
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid gap-5 md:grid-cols-2">
                                        <Input
                                            label="Doctor Name"
                                            required
                                            value={doctor.name}
                                            onChange={(value) => updateDoctor(index, "name", value)}
                                        />

                                        <Input
                                            label="Qualification"
                                            required
                                            placeholder="Example: BDS, MDS"
                                            value={doctor.qualification}
                                            onChange={(value) =>
                                                updateDoctor(index, "qualification", value)
                                            }
                                        />

                                        <Input
                                            label="Years of Experience"
                                            type="number"
                                            min="0"
                                            value={doctor.yearsOfExperience}
                                            onChange={(value) =>
                                                updateDoctor(index, "yearsOfExperience", value)
                                            }
                                        />

                                        <Input
                                            label="Medical Registration Number"
                                            required
                                            value={doctor.registrationNumber}
                                            onChange={(value) =>
                                                updateDoctor(index, "registrationNumber", value)
                                            }
                                        />
                                    </div>

                                    <div className="mt-5">
                                        <label className="mb-3 block text-sm font-semibold text-slate-700">
                                            Specialization
                                            <span className="ml-1 text-red-500">*</span>
                                        </label>

                                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                            {specializations.map((specialization) => {
                                                const selected =
                                                    doctor.specializations.includes(specialization);
                                                return (
                                                    <label
                                                        key={specialization}
                                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                                                            selected
                                                                ? "border-[#1D5C5A] bg-[#1D5C5A]/5"
                                                                : "border-slate-200 bg-white hover:border-slate-300"
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selected}
                                                            onChange={() =>
                                                                toggleDoctorSpecialization(
                                                                    index,
                                                                    specialization,
                                                                )
                                                            }
                                                            className="h-4 w-4 accent-[#1D5C5A]"
                                                        />
                                                        <span className="text-sm text-slate-700">
                                                            {specialization}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>

                                        {doctor.specializations.length === 0 && (
                                            <p className="mt-2 text-xs text-red-500">
                                                Please select at least one specialization.
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                        <FileInput
                                            label="Doctor Image"
                                            accept="image/*"
                                            value={doctor.image}
                                            onChange={(file) =>
                                                updateDoctor(index, "image", file)
                                            }
                                        />

                                        <FileInput
                                            label="Doctor Certificates (Optional)"
                                            accept="image/*,.pdf"
                                            multiple
                                            value={doctor.certificates}
                                            onChange={(files) =>
                                                updateDoctor(index, "certificates", files)
                                            }
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addDoctor}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#1D5C5A]/40 px-5 py-3.5 font-semibold text-[#1D5C5A] transition hover:border-[#1D5C5A] hover:bg-[#1D5C5A]/5 sm:w-auto"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Add Another Doctor
                            </button>
                        </div>
                    </FormSection>

                    {/* ───────────────────────────────────── */}
                    {/* SERVICES */}
                    {/* ───────────────────────────────────── */}

                    <FormSection
                        id="workflow"
                        registerRef={registerSection}
                        number="04"
                        title="Workflow & Services"
                        description="Tell us about your current workflow and the services you are interested in."
                    >
                        <TextArea
                            label="Current Workflow & Services"
                            rows={4}
                            placeholder="Briefly describe how your clinic currently handles design and lab work"
                            value={formData.currentWorkflow}
                            onChange={(value) => updateField("currentWorkflow", value)}
                        />

                        <div className="mt-6">
                            <label className="mb-3 block text-sm font-semibold text-slate-700">
                                Which services are you interested in?
                                <span className="ml-1 text-red-500">*</span>
                            </label>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {interestedServices.map((service) => {
                                    const selected = selectedServices.includes(service);
                                    return (
                                        <label
                                            key={service}
                                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                                                selected
                                                    ? "border-[#1D5C5A] bg-[#1D5C5A]/5"
                                                    : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={() => toggleService(service)}
                                                className="h-4 w-4 accent-[#1D5C5A]"
                                            />
                                            <span className="text-sm text-slate-700">{service}</span>
                                        </label>
                                    );
                                })}
                            </div>

                            {selectedServices.length === 0 && (
                                <p className="mt-2 text-xs text-red-500">
                                    Please select at least one service.
                                </p>
                            )}
                        </div>

                        <div className="mt-6">
                            <label className="mb-3 block text-sm font-semibold text-slate-700">
                                Do you currently work with a digital dental lab?
                            </label>

                            <div className="flex gap-3">
                                {["Yes", "No"].map((option) => {
                                    const selected = formData.worksWithDigitalLab === option;
                                    return (
                                        <label
                                            key={option}
                                            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition ${
                                                selected
                                                    ? "border-[#1D5C5A] bg-[#1D5C5A]/5 text-[#1D5C5A]"
                                                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="digitalLab"
                                                value={option}
                                                checked={selected}
                                                onChange={(e) =>
                                                    updateField("worksWithDigitalLab", e.target.value)
                                                }
                                                className="accent-[#1D5C5A]"
                                            />
                                            {option}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </FormSection>

                    {/* ───────────────────────────────────── */}
                    {/* FILES */}
                    {/* ───────────────────────────────────── */}

                    <FormSection
                        id="files"
                        registerRef={registerSection}
                        number="05"
                        title="Clinic Files"
                        description="Upload the images and documents you want to use for your clinic profile."
                    >
                        <div className="grid gap-6 md:grid-cols-2">
                            <FileInput
                                label="Clinic Logo"
                                accept="image/*"
                                value={clinicLogo}
                                onChange={(file) => setClinicLogo(file as File | null)}
                            />

                            <FileInput
                                label="Clinic Photos"
                                accept="image/*"
                                multiple
                                value={clinicPhotos}
                                onChange={(files) => setClinicPhotos(files as File[])}
                            />
                        </div>

                        <div className="mt-6 flex gap-3 rounded-xl bg-[#1D5C5A]/5 p-4 text-sm text-[#1D5C5A]">
                            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>
                                Your uploaded images will be used for your Digital Dental
                                Designers clinic profile after approval.
                            </p>
                        </div>
                    </FormSection>

                    {/* ───────────────────────────────────── */}
                    {/* LOCATION */}
                    {/* ───────────────────────────────────── */}

                    <FormSection
                        id="location"
                        registerRef={registerSection}
                        number="06"
                        title="Clinic Location"
                        description="Search for your clinic, drop a pin, or drag the marker to set the exact spot on the map."
                    >
                        <LocationMapPicker
                            latitude={formData.latitude}
                            longitude={formData.longitude}
                            onLocationChange={handleLocationChange}
                        />

                        <div className="mt-5 grid gap-5 md:grid-cols-2">
                            <Input
                                label="Latitude"
                                type="number"
                                step="any"
                                value={formData.latitude}
                                onChange={(value) => updateField("latitude", value)}
                            />

                            <Input
                                label="Longitude"
                                type="number"
                                step="any"
                                value={formData.longitude}
                                onChange={(value) => updateField("longitude", value)}
                            />
                        </div>

                        <p className="mt-3 text-xs text-slate-500">
                            Latitude and longitude fill in automatically from the map above,
                            but you can fine-tune them manually if needed.
                        </p>
                    </FormSection>

                    {/* ───────────────────────────────────── */}
                    {/* CONSENT */}
                    {/* ───────────────────────────────────── */}

                    <section
                        id="consent"
                        ref={registerSection("consent")}
                        className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                    >
                        <h2 className="text-xl font-bold text-slate-800">
                            Review &amp; submit
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {progress}% of required information complete.
                        </p>

                        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-slate-300">
                            <input
                                type="checkbox"
                                checked={formData.declaration}
                                onChange={(e) =>
                                    updateField("declaration", e.target.checked)
                                }
                                required
                                className="mt-1 h-5 w-5 accent-[#1D5C5A]"
                            />

                            <span className="text-sm leading-6 text-slate-600">
                                I confirm that the submitted information is accurate and I
                                agree to be contacted by Digital Dental Designers regarding
                                collaboration opportunities.
                            </span>
                        </label>

                        <button
                            type="submit"
                            className="mt-6 hidden w-full items-center justify-center gap-2 rounded-xl bg-[#1D5C5A] px-6 py-4 font-semibold text-white shadow-lg transition hover:bg-[#164947] sm:inline-flex sm:w-auto"
                        >
                            Submit Partnership Application
                            <ArrowRightIcon className="h-4 w-4" />
                        </button>
                    </section>
                </form>
            </section>

            {/* Sticky mobile submit bar */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{progress}% complete</span>
                    <span>{doctors.length} doctor{doctors.length > 1 ? "s" : ""} added</span>
                </div>
                <button
                    type="submit"
                    form="partner-form"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D5C5A] px-6 py-3.5 font-semibold text-white shadow-lg"
                >
                    Submit Application
                    <ArrowRightIcon className="h-4 w-4" />
                </button>
            </div>
        </main>
    );
}

/* ========================================================= */
/* LOCATION MAP PICKER (react-leaflet + OpenStreetMap)        */
/* ========================================================= */

type LocationChangeData = {
    latitude: string;
    longitude: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
};

type NominatimAddress = {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    postcode?: string;
};

type NominatimResult = {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    address?: NominatimAddress;
};

function useDebouncedValue<T>(value: T, delay = 400) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

function extractAddressParts(address?: NominatimAddress) {
    return {
        city: address?.city || address?.town || address?.village || address?.county || "",
        state: address?.state || "",
        pincode: address?.postcode || "",
    };
}

function MapClickHandler({
    onSelect,
}: {
    onSelect: (lat: number, lng: number) => void;
}) {
    useMapEvents({
        click(e) {
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function MapFlyTo({ position }: { position: { lat: number; lng: number } | null }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 15), {
                duration: 0.8,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position?.lat, position?.lng]);

    return null;
}

function LocationMapPicker({
    latitude,
    longitude,
    onLocationChange,
}: {
    latitude: string;
    longitude: string;
    onLocationChange: (data: LocationChangeData) => void;
}) {
    const [searchValue, setSearchValue] = useState("");
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [searching, setSearching] = useState(false);
    const [locating, setLocating] = useState(false);

    const debouncedSearch = useDebouncedValue(searchValue, 400);

    const position = useMemo(() => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            return { lat, lng };
        }
        return null;
    }, [latitude, longitude]);

    // Live search-as-you-type against Nominatim
    useEffect(() => {
        if (debouncedSearch.trim().length < 3) {
            setResults([]);
            return;
        }

        const controller = new AbortController();

        const run = async () => {
            setSearching(true);
            try {
                const params = new URLSearchParams({
                    format: "jsonv2",
                    addressdetails: "1",
                    limit: "5",
                    q: debouncedSearch,
                });

                const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
                    signal: controller.signal,
                    headers: { Accept: "application/json" },
                });

                if (response.ok) {
                    const data: NominatimResult[] = await response.json();
                    setResults(data);
                    setShowResults(true);
                }
            } catch {
                // ignore aborted/failed requests
            } finally {
                setSearching(false);
            }
        };

        run();
        return () => controller.abort();
    }, [debouncedSearch]);

    const applyResult = (
        lat: number,
        lng: number,
        formattedAddress?: string,
        addressParts?: NominatimAddress,
    ) => {
        const { city, state, pincode } = extractAddressParts(addressParts);

        onLocationChange({
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
            address: formattedAddress,
            city,
            state,
            pincode,
        });
    };

    const handleSelectResult = (result: NominatimResult) => {
        applyResult(
            parseFloat(result.lat),
            parseFloat(result.lon),
            result.display_name,
            result.address,
        );
        setSearchValue(result.display_name);
        setShowResults(false);
    };

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const params = new URLSearchParams({
                format: "jsonv2",
                lat: String(lat),
                lon: String(lng),
            });

            const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
                headers: { Accept: "application/json" },
            });

            if (response.ok) {
                const data: NominatimResult = await response.json();
                applyResult(lat, lng, data.display_name, data.address);
                setSearchValue(data.display_name ?? "");
                return;
            }
        } catch {
            // fall through to lat/lng-only update below
        }

        onLocationChange({ latitude: lat.toFixed(6), longitude: lng.toFixed(6) });
    };

    const handleMapSelect = (lat: number, lng: number) => {
        reverseGeocode(lat, lng);
    };

    const handleMarkerDragEnd = (e: L.DragEndEvent) => {
        const latLng = e.target.getLatLng();
        reverseGeocode(latLng.lat, latLng.lng);
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                reverseGeocode(pos.coords.latitude, pos.coords.longitude);
                setLocating(false);
            },
            () => setLocating(false),
        );
    };

    return (
        <div>
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onFocus={() => results.length > 0 && setShowResults(true)}
                        onBlur={() => setTimeout(() => setShowResults(false), 150)}
                        placeholder="Search for your clinic or address"
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1D5C5A] focus:ring-2 focus:ring-[#1D5C5A]/10"
                    />

                    {showResults && results.length > 0 && (
                        <ul className="absolute z-[1000] mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                            {results.map((result) => (
                                <li key={result.place_id}>
                                    <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleSelectResult(result)}
                                        className="flex w-full items-start gap-2 px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-[#1D5C5A]/5"
                                    >
                                        <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                        <span className="line-clamp-2">{result.display_name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {searching && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                            Searching…
                        </span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locating}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#1D5C5A] hover:text-[#1D5C5A] disabled:opacity-60"
                >
                    <LocateIcon className="h-4 w-4" />
                    {locating ? "Locating…" : "Use current location"}
                </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <MapContainer
                    center={position ?? { lat: DEFAULT_MAP_CENTER[0], lng: DEFAULT_MAP_CENTER[1] }}
                    zoom={position ? 16 : 12}
                    scrollWheelZoom
                    className="h-72 w-full sm:h-96"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapClickHandler onSelect={handleMapSelect} />
                    <MapFlyTo position={position} />

                    {position && (
                        <Marker
                            position={position}
                            icon={leafletPinIcon}
                            draggable
                            eventHandlers={{ dragend: handleMarkerDragEnd }}
                        />
                    )}
                </MapContainer>
            </div>

            <p className="mt-2 text-xs text-slate-500">
                Search your clinic, click on the map, or drag the pin to set the exact
                location. This also fills in city, state and pincode where possible.
            </p>
        </div>
    );
}

/* ========================================================= */
/* SUBMITTED STATE                                            */
/* ========================================================= */

function SubmittedState({ clinicName }: { clinicName: string }) {
    return (
        <main className="grid min-h-screen place-items-center bg-[#F7F6F3] px-4">
            <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#1D5C5A]/10">
                    <CheckIcon className="h-7 w-7 text-[#1D5C5A]" />
                </div>

                <h1 className="mt-5 text-2xl font-bold text-slate-800">
                    Application received
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                    Thank you{clinicName ? `, ${clinicName}` : ""}. Our partnerships
                    team will review your details and reach out within 2–3 business
                    days.
                </p>

                <a
                    href="/"
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#1D5C5A] px-6 py-3 font-semibold text-white transition hover:bg-[#164947]"
                >
                    Back to Home
                </a>
            </div>
        </main>
    );
}

/* ========================================================= */
/* REUSABLE FORM COMPONENTS                                   */
/* ========================================================= */

function FormSection({
    id,
    registerRef,
    number,
    title,
    description,
    children,
}: {
    id: string;
    registerRef: (id: string) => (el: HTMLElement | null) => void;
    number: string;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section
            id={id}
            ref={registerRef(id)}
            className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
            <div className="mb-7 flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1D5C5A] text-sm font-bold text-white">
                    {number}
                </div>

                <div>
                    <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
                        {title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>
            </div>

            {children}
        </section>
    );
}

function Input({
    label,
    required,
    value,
    onChange,
    type = "text",
    placeholder,
    min,
    step,
}: {
    label: string;
    required?: boolean;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    min?: string;
    step?: string;
}) {
    const id = useId(label);

    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </label>

            <input
                id={id}
                type={type}
                value={value}
                min={min}
                step={step}
                placeholder={placeholder}
                required={required}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1D5C5A] focus:ring-2 focus:ring-[#1D5C5A]/10"
            />
        </div>
    );
}

function TextArea({
    label,
    required,
    value,
    onChange,
    rows = 4,
    placeholder,
}: {
    label: string;
    required?: boolean;
    value: string;
    onChange: (value: string) => void;
    rows?: number;
    placeholder?: string;
}) {
    const id = useId(label);

    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </label>

            <textarea
                id={id}
                rows={rows}
                value={value}
                placeholder={placeholder}
                required={required}
                onChange={(e) => onChange(e.target.value)}
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1D5C5A] focus:ring-2 focus:ring-[#1D5C5A]/10"
            />
        </div>
    );
}

function Select({
    label,
    required,
    value,
    options,
    onChange,
}: {
    label: string;
    required?: boolean;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    const id = useId(label);

    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </label>

            <select
                id={id}
                value={value}
                required={required}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%2364748b%22><path d=%22M5.25 7.5l4.75 5 4.75-5%22 stroke=%22%2364748b%22 stroke-width=%221.5%22 fill=%22none%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')] bg-[length:16px] bg-[right_1rem_center] bg-no-repeat px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#1D5C5A] focus:ring-2 focus:ring-[#1D5C5A]/10"
            >
                <option value="">Select {label}</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

function FileInput({
    label,
    accept,
    multiple,
    value,
    onChange,
}: {
    label: string;
    accept?: string;
    multiple?: boolean;
    value: File | File[] | null;
    onChange: (files: File | File[] | null) => void;
}) {
    const id = useId(label);
    const fileList = useMemo(
        () => (value ? (Array.isArray(value) ? value : [value]) : []),
        [value],
    );

    const previewUrls = useMemo(
        () =>
            fileList
                .filter((file) => file.type.startsWith("image/"))
                .map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
        [fileList],
    );

    useEffect(() => {
        return () => {
            previewUrls.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [previewUrls]);

    const removeFile = (name: string) => {
        if (multiple) {
            onChange(fileList.filter((file) => file.name !== name));
        } else {
            onChange(null);
        }
    };

    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <label
                htmlFor={id}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500 transition hover:border-[#1D5C5A]/50 hover:bg-[#1D5C5A]/5"
            >
                <UploadIcon className="h-5 w-5 shrink-0 text-slate-400" />
                <span className="truncate">
                    {fileList.length > 0
                        ? `${fileList.length} file${fileList.length > 1 ? "s" : ""} selected`
                        : `Choose ${multiple ? "files" : "a file"}`}
                </span>
            </label>

            <input
                id={id}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    onChange(multiple ? files : (files[0] ?? null));
                }}
                className="sr-only"
            />

            {fileList.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                    {fileList.map((file) => {
                        const preview = previewUrls.find((p) => p.name === file.name);
                        return (
                            <li
                                key={file.name}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1 pl-1 pr-2 text-xs text-slate-600"
                            >
                                {preview ? (
                                    <img
                                        src={preview.url}
                                        alt={file.name}
                                        className="h-7 w-7 rounded object-cover"
                                    />
                                ) : (
                                    <span className="grid h-7 w-7 place-items-center rounded bg-slate-200 text-[10px] font-semibold uppercase text-slate-500">
                                        {file.name.split(".").pop()}
                                    </span>
                                )}
                                <span className="max-w-[9rem] truncate">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeFile(file.name)}
                                    className="text-slate-400 transition hover:text-red-500"
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <XIcon className="h-3.5 w-3.5" />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

/* ---------------- id helper ---------------- */

let idCounter = 0;
function useId(label: string) {
    const ref = useRef<string>();
    if (!ref.current) {
        idCounter += 1;
        ref.current = `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${idCounter}`;
    }
    return ref.current;
}

/* ========================================================= */
/* ICONS                                                       */
/* ========================================================= */

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" className={className}>
            <path
                d="M4 10.5l3.5 3.5L16 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" className={className}>
            <path
                d="M10 4v12M4 10h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function TrashIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" className={className}>
            <path
                d="M4 6h12M8 6V4.5A1.5 1.5 0 019.5 3h1A1.5 1.5 0 0112 4.5V6m-6 0v9.5A1.5 1.5 0 007.5 17h5a1.5 1.5 0 001.5-1.5V6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function UploadIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" className={className}>
            <path
                d="M10 13V4m0 0L6.5 7.5M10 4l3.5 3.5M4 15.5h12"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function XIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" className={className}>
            <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function InfoIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" className={className}>
            <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
            <path
                d="M10 9v4.5M10 6.75h.008"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

function MapPinIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" className={className}>
            <path
                d="M10 17.5s6-5.14 6-9.5a6 6 0 10-12 0c0 4.36 6 9.5 6 9.5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    );
}

function SearchIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" className={className}>
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
            <path
                d="M17 17l-3.6-3.6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

function LocateIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" className={className}>
            <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.6" />
            <path
                d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

function ArrowRightIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 20 20" fill="none" className={className}>
            <path
                d="M4 10h12M11 5l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}