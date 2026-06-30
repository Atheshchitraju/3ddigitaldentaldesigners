import API_URL from "@/config/api";
import { useMemo, useState } from "react";
import { clinics } from "@/routes/clinics";
import {
  X,
  User,
  Building2,
  Package,
  Palette,
  StickyNote,
  Upload,
  Wallet,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Minus,
  Plus as PlusIcon,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type CatalogItem = { name: string; price: number; warranty?: string };
type CatalogCategory = { category: string; items: CatalogItem[] };

const productCatalog: CatalogCategory[] = [
  {
    category: "Zirconia",
    items: [
      { name: "Zirconia Classic", price: 1000, warranty: "10 Years" },
      { name: "Zirconia Monolithic Classic", price: 1200, warranty: "10 Years" },
      { name: "Zirconia Premium", price: 1800, warranty: "15 Years" },
      { name: "Zirconia Monolithic Premium", price: 2000, warranty: "15 Years" },
      { name: "Zirconia Premium Multilayered", price: 3000, warranty: "15 Years" },
      { name: "Zirconia Monolithic Multilayered", price: 4500, warranty: "Lifetime" },
    ],
  },
  {
    category: "Implant Prosthetics",
    items: [
      { name: "Cement Retained Zirconia Classic Per Unit", price: 1600 },
      { name: "Cement Retained Zirconia Premium Per Unit", price: 2600 },
      { name: "Cement Retained DMLS Classic Per Unit", price: 1500 },
      { name: "Cement Retained DMLS Premium Per Unit", price: 2000 },
      { name: "Cement Retained Bar with Zirconia Per Unit", price: 30000 },
      { name: "Cement Retained Bar Peek with Composite Per Unit", price: 40000 },
      { name: "Screw Retained DMLS Crown & Bridge Per Unit", price: 2500 },
      {
        name: "Screw Retained Zirconia Crown & Bridge With Titanium Base Per Unit",
        price: 3000,
      },
      { name: "Screw Retained Peek with Composite Per Unit", price: 3000 },
      { name: "Screw Retained Titanium with Composite Per Unit", price: 4000 },
      { name: "Screw Retained E-Max CAD with Titanium Base Per Unit", price: 5000 },
    ],
  },
  {
    category: "Precision Attachments",
    items: [
      { name: "Single Attachments (Upto Two Teeth)", price: 3000 },
      { name: "Double Attachments (More Than Two Teeth)", price: 5000 },
      { name: "Bilateral Attachments", price: 10000 },
    ],
  },
  {
    category: "DMLS (CAD/CAM)",
    items: [
      { name: "DMLS Crown & Bridge", price: 650, warranty: "5 Years" },
      { name: "DMLS Crown & Bridge Premium", price: 800, warranty: "10 Years" },
      { name: "DMLS 3/4 Crown", price: 600, warranty: "5 Years" },
      { name: "DMLS Full Metal Per Unit", price: 400, warranty: "N/A" },
      { name: "DMLS Inlay/Onlay Per Unit", price: 1500, warranty: "N/A" },
      { name: "With Die Preparation Extra Per Unit", price: 200, warranty: "N/A" },
    ],
  },
  {
    category: "E-Max CAD",
    items: [
      { name: "E-Max CAD Per Unit", price: 2500, warranty: "10 Years" },
      { name: "E-Max Veneer CAD Per Unit", price: 2700, warranty: "10 Years" },
      { name: "E-Max Inlay/Onlay CAD Per Unit", price: 2500, warranty: "15 Years" },
      { name: "E-Max Zirconia CAD Prime Per Unit", price: 2800, warranty: "15 Years" },
      { name: "E-Max Zirconia CAD Esthetic Per Unit", price: 3500, warranty: "15 Years" },
    ],
  },
  {
    category: "Complete Dentures (Unbreakable)",
    items: [
      { name: "Special Tray With Occlusion Rims", price: 500 },
      { name: "Complete Denture With Ivoclar U/L", price: 5000 },
      { name: "Lucitone 199 With Acrylic Rock Teeth Set", price: 3500 },
      { name: "Acrylization", price: 1500 },
    ],
  },
  {
    category: "Others",
    items: [
      { name: "Night Guard", price: 900 },
      { name: "Bleaching Tray U/L", price: 600 },
      { name: "Orthodontic Retention Plate", price: 600 },
      { name: "Temporary Crown", price: 200 },
      { name: "PMMA", price: 200 },
      { name: "Aligners per arch", price: 1200 },
    ],
  },
];

const shades = [
  "A1",
  "A2",
  "A3",
  "A3.5",
  "A4",
  "B1",
  "B2",
  "B3",
  "B4",
  "C1",
  "C2",
  "C3",
  "C4",
  "D2",
  "D3",
  "D4",
  "BL1",
  "BL2",
  "BL3",
  "BL4",
];

const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
const lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];

interface Props {
  open: boolean;
  onClose: () => void;
}

type ToastState = { type: "success" | "error"; message: string } | null;

type SelectedProduct = {
  name: string;
  price: number;
  quantity: number;
  warranty?: string;
};

function archStyle(idx: number, count: number, curve: "up" | "down") {
  const mid = (count - 1) / 2;
  const distFromMid = idx - mid;
  const lift = Math.pow(Math.abs(distFromMid) / mid, 2) * 10;
  const rotate = distFromMid * (curve === "up" ? 2.6 : -2.6);
  const translateY = curve === "up" ? lift : -lift;
  return { transform: `translateY(${translateY}px) rotate(${rotate}deg)` };
}

export default function OrderModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [selectedClinic, setSelectedClinic] = useState("");
  const [customClinic, setCustomClinic] = useState("");
  const [customClinicEmail, setCustomClinicEmail] = useState("");
  const [customClinicPhone, setCustomClinicPhone] = useState("");

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [shade, setShade] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const [paymentMode, setPaymentMode] = useState<"prepaid" | "postpaid">("postpaid");

  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Track which categories are expanded — start with all collapsed
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const clinicName = useMemo(() => {
    if (selectedClinic === "other") return customClinic || "—";
    return clinics.find((c) => c.slug === selectedClinic)?.name || "—";
  }, [selectedClinic, customClinic]);

  const total = useMemo(
    () => selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0),
    [selectedProducts],
  );

  const totalUnits = useMemo(
    () => selectedProducts.reduce((sum, p) => sum + p.quantity, 0),
    [selectedProducts],
  );

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  };

  const toggleProduct = (item: CatalogItem) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.name === item.name);
      if (exists) return prev.filter((p) => p.name !== item.name);
      return [
        ...prev,
        { name: item.name, price: item.price, quantity: 1, warranty: item.warranty },
      ];
    });
  };

  const updateProductQuantity = (name: string, quantity: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.name === name ? { ...p, quantity: Math.max(1, quantity) } : p)),
    );
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  if (!open) return null;

  const toggleTooth = (tooth: number) => {
    setSelectedTeeth((prev) =>
      prev.includes(tooth) ? prev.filter((t) => t !== tooth) : [...prev, tooth],
    );
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setSelectedClinic("");
    setCustomClinic("");
    setCustomClinicEmail("");
    setCustomClinicPhone("");
    setSelectedProducts([]);
    setShade("");
    setNotes("");
    setSelectedTeeth([]);
    setFiles(null);
    onClose();
  };

  const handleFilesSelected = (list: FileList | null) => setFiles(list);

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFilesSelected(e.dataTransfer.files);
  };

  const submitOrder = async () => {
    if (!name || !phone || selectedProducts.length === 0 || !selectedClinic) {
      showToast(
        "error",
        "Please fill in name, phone, clinic and select at least one product before submitting.",
      );
      return;
    }

    try {
      setLoading(true);

      const clinicData = clinics.find((c) => c.slug === selectedClinic);
      const finalClinicName = selectedClinic === "other" ? customClinic : clinicData?.name;
      const finalClinicEmail = selectedClinic === "other" ? customClinicEmail : clinicData?.email;
      const finalClinicPhone =
        selectedClinic === "other" ? customClinicPhone : clinicData?.whatsapp;

      const orderData = {
        name,
        phone,
        clinic: finalClinicName,
        clinicEmail: finalClinicEmail,
        clinicWhatsapp: finalClinicPhone,
        products: selectedProducts,
        product: selectedProducts.map((p) => `${p.name} x${p.quantity}`).join(", "),
        shade,
        selectedTeeth,
        notes,
        amount: total,
        quantity: totalUnits,
        paymentMode,
        paymentStatus: "pending",
      };

      if (paymentMode === "postpaid") {
        const response = await fetch(`${API_URL}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        const data = await response.json();

        if (data.success) {
          showToast("success", "Order submitted successfully.");
          window.setTimeout(resetForm, 900);
        } else {
          showToast("error", data.message || "Failed to submit order.");
        }
        return;
      }

      const razorpayResponse = await fetch(`${API_URL}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });

      const razorpayData = await razorpayResponse.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayData.razorpayOrder.amount,
        currency: "INR",
        name: "3D Digital Dental Lab",
        description: "Dental Order Payment",
        image: "/assets/logo.webp",
        order_id: razorpayData.razorpayOrder.id,
        prefill: { name, contact: phone, email: finalClinicEmail || "" },
        theme: { color: "#1e3a5f" },
        handler: async function (response: any) {
          const verifyResponse = await fetch(`${API_URL}/api/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentMethod: "Online",
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            const saveOrderResponse = await fetch(`${API_URL}/api/orders`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...orderData,
                paymentStatus: "paid",
                paymentDetails: {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  paidAt: new Date(),
                  paymentMethod: "Online",
                },
              }),
            });

            const saveOrderData = await saveOrderResponse.json();

            if (saveOrderData.success) {
              showToast("success", "Payment successful — order created.");
              window.setTimeout(resetForm, 900);
            } else {
              showToast("error", "Payment succeeded but saving the order failed.");
            }
          } else {
            showToast("error", "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            console.log("Payment popup closed");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log(error);
      showToast("error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-[48px] sm:h-[50px] border border-slate-300 rounded-lg px-4 text-[15px] text-slate-800 placeholder:text-slate-400 bg-white outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-500/10";

  const renderToothRow = (teeth: number[], curve: "up" | "down") => (
    <div className="flex justify-center items-end gap-1 sm:gap-1.5">
      {teeth.map((tooth, idx) => {
        const selected = selectedTeeth.includes(tooth);
        return (
          <button
            key={tooth}
            type="button"
            onClick={() => toggleTooth(tooth)}
            style={archStyle(idx, teeth.length, curve)}
            className={`relative w-7 h-9 sm:w-10 sm:h-12 rounded-t-lg rounded-b-md border text-[10px] sm:text-[12px] font-semibold transition-all duration-150 shrink-0 ${
              selected
                ? "bg-slate-800 border-slate-800 text-white shadow-md scale-105"
                : "bg-white border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-800"
            }`}
          >
            {tooth}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto">
      <div className="relative bg-white w-full sm:max-w-5xl sm:rounded-2xl rounded-t-3xl shadow-2xl h-[100dvh] sm:h-auto sm:max-h-[92vh] overflow-hidden border border-slate-200 flex flex-col">
        {/* HEADER */}
        <div className="shrink-0 bg-[#16243c] px-4 sm:px-8 py-5 sm:py-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-semibold text-white tracking-tight">
              Place a New Order
            </h2>
            <p className="text-slate-300/80 text-xs sm:text-sm mt-1">
              Our team confirms every order within one business day.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full p-2 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
          {/* LEFT: FORM */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-7 space-y-6 sm:space-y-8 pb-32 lg:pb-7">
            {/* CUSTOMER */}
            <section>
              <SectionHeading icon={<User className="w-4 h-4" />} title="Your Details" />
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                <Field label="Your name" required>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Bob Wick"
                    className={inputClass}
                  />
                </Field>

                <Field label="Phone number" required>
                  <div className="flex gap-2">
                    <div className="h-[48px] sm:h-[50px] px-3 sm:px-4 border border-slate-300 rounded-lg flex items-center bg-slate-50 text-slate-600 font-medium text-sm sm:text-base">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      className={inputClass}
                    />
                  </div>
                </Field>
              </div>
            </section>

            {/* CLINIC */}
            <section>
              <SectionHeading icon={<Building2 className="w-4 h-4" />} title="Clinic" />
              <Field label="Select clinic" required>
                <select
                  value={selectedClinic}
                  onChange={(e) => setSelectedClinic(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Choose clinic</option>
                  {clinics.map((clinic) => (
                    <option key={clinic.slug} value={clinic.slug}>
                      {clinic.name}
                    </option>
                  ))}
                  <option value="other">Other clinic</option>
                </select>
              </Field>

              {selectedClinic === "other" && (
                <div className="grid sm:grid-cols-3 gap-4 mt-4">
                  <input
                    type="text"
                    placeholder="Clinic name"
                    value={customClinic}
                    onChange={(e) => setCustomClinic(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="email"
                    placeholder="Clinic email"
                    value={customClinicEmail}
                    onChange={(e) => setCustomClinicEmail(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Clinic phone"
                    value={customClinicPhone}
                    onChange={(e) => setCustomClinicPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}
            </section>

            {/* PRODUCT — EXPANDABLE CATEGORIES */}
            <section>
              <SectionHeading icon={<Package className="w-4 h-4" />} title="Product Selection" />
              <p className="text-slate-500 text-sm -mt-3 mb-4">
                Tap categories to expand. Set quantity for each product.
              </p>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                {productCatalog.map((cat, catIdx) => {
                  const isExpanded = expandedCategories.has(cat.category);
                  const itemsInCategory = selectedProducts.filter((p) =>
                    cat.items.some((item) => item.name === p.name),
                  );

                  return (
                    <div key={cat.category}>
                      {/* CATEGORY HEADER - CLICKABLE */}
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.category)}
                        className={`w-full px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3 transition-colors ${
                          catIdx === 0 ? "" : "border-t border-slate-200"
                        } ${isExpanded ? "bg-slate-100" : "bg-[#16243c] hover:bg-[#1e3252]"}`}
                      >
                        <div className="flex items-center gap-3 flex-1 text-left min-w-0">
                          <span
                            className={`text-sm sm:text-base font-semibold tracking-wide uppercase ${
                              isExpanded ? "text-slate-800" : "text-white"
                            }`}
                          >
                            {cat.category}
                          </span>
                          {itemsInCategory.length > 0 && (
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                                isExpanded ? "bg-slate-800 text-white" : "bg-emerald-500 text-white"
                              }`}
                            >
                              {itemsInCategory.length}
                            </span>
                          )}
                        </div>
                        <div
                          className={`transition-transform duration-300 shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                        >
                          <ChevronDown
                            className={`w-5 h-5 ${isExpanded ? "text-slate-800" : "text-white"}`}
                          />
                        </div>
                      </button>

                      {/* CATEGORY ITEMS - COLLAPSIBLE */}
                      {isExpanded && (
                        <div className="divide-y divide-slate-100 bg-white">
                          {cat.items.map((item) => {
                            const selected = selectedProducts.find((p) => p.name === item.name);
                            return (
                              <div
                                key={item.name}
                                className={`flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 transition ${
                                  selected ? "bg-emerald-50" : "bg-white hover:bg-slate-50"
                                }`}
                              >
                                {/* CHECKBOX */}
                                <button
                                  type="button"
                                  role="checkbox"
                                  aria-checked={!!selected}
                                  onClick={() => toggleProduct(item)}
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                                    selected
                                      ? "bg-slate-800 border-slate-800 text-white"
                                      : "bg-white border-slate-300 hover:border-slate-400"
                                  }`}
                                >
                                  {selected && <Check className="w-3.5 h-3.5" />}
                                </button>

                                {/* PRODUCT INFO */}
                                <button
                                  type="button"
                                  onClick={() => toggleProduct(item)}
                                  className="flex-1 text-left min-w-0"
                                >
                                  <div className="text-sm sm:text-base font-medium text-slate-800 leading-snug">
                                    {item.name}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-xs sm:text-sm text-slate-500">
                                      ₹{item.price} / unit
                                    </span>
                                    {item.warranty && (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                        <ShieldCheck className="w-3 h-3" />
                                        {item.warranty}
                                      </span>
                                    )}
                                  </div>
                                </button>

                                {/* QUANTITY STEPPER */}
                                {selected && (
                                  <QuantityStepper
                                    quantity={selected.quantity}
                                    onChange={(q) => updateProductQuantity(item.name, q)}
                                    size="sm"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* SELECTED PRODUCTS TAGS */}
              {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedProducts.map((p) => (
                    <span
                      key={p.name}
                      className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-800 text-white pl-3 pr-1.5 py-2 rounded-full"
                    >
                      <span className="truncate max-w-[200px]">{p.name}</span>
                      <span className="text-slate-300">×{p.quantity}</span>
                      <button
                        onClick={() =>
                          toggleProduct({ name: p.name, price: p.price, warranty: p.warranty })
                        }
                        className="hover:opacity-70 transition ml-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* SHADE */}
            <section>
              <SectionHeading icon={<Palette className="w-4 h-4" />} title="Shade" />
              <Field label="Select shade">
                <select
                  value={shade}
                  onChange={(e) => setShade(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select shade</option>
                  {shades.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <h4 className="font-semibold text-slate-800 text-[15px]">
                    Not sure of the shade?
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Use AI Shade Matcher to detect the closest VITA shade.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.open("/shade", "_blank")}
                  className="w-full sm:w-auto px-4 h-10 rounded-lg bg-[#16243c] text-white text-sm font-medium hover:bg-[#1e3252] transition shrink-0"
                >
                  Launch Matcher
                </button>
              </div>
            </section>

            {/* TOOTH ARCH */}
            <section>
              <SectionHeading icon={<Check className="w-4 h-4" />} title="Tooth Numbers (FDI)" />
              <p className="text-slate-500 text-xs sm:text-sm -mt-3 mb-4">
                Tap teeth to select or deselect.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-2 sm:px-8 py-5 sm:py-7 overflow-x-auto">
                <div className="min-w-[420px] sm:min-w-0">
                  <div className="flex justify-between text-[10px] sm:text-[11px] tracking-wide font-medium text-slate-400 mb-2 sm:mb-3 px-2">
                    <span>RIGHT</span>
                    <span>UPPER ARCH</span>
                    <span>LEFT</span>
                  </div>
                  <div className="flex justify-center gap-1 sm:gap-3">
                    {renderToothRow(upperRight, "up")}
                    <div className="w-px bg-slate-300 self-stretch mx-0.5 sm:mx-1" />
                    {renderToothRow(upperLeft, "up")}
                  </div>

                  <div className="my-4 sm:my-6 border-t border-dashed border-slate-300" />

                  <div className="flex justify-center gap-1 sm:gap-3">
                    {renderToothRow(lowerRight, "down")}
                    <div className="w-px bg-slate-300 self-stretch mx-0.5 sm:mx-1" />
                    {renderToothRow(lowerLeft, "down")}
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-[11px] tracking-wide font-medium text-slate-400 mt-2 sm:mt-3 px-2">
                    <span>RIGHT</span>
                    <span>LOWER ARCH</span>
                    <span>LEFT</span>
                  </div>
                </div>
              </div>

              {selectedTeeth.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedTeeth
                    .sort((a, b) => a - b)
                    .map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-xs font-medium bg-slate-800 text-white px-3 py-2 rounded-full"
                      >
                        {t}
                        <button onClick={() => toggleTooth(t)} className="hover:opacity-70 ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </section>

            {/* NOTES */}
            <section>
              <SectionHeading icon={<StickyNote className="w-4 h-4" />} title="Additional Notes" />
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions for the lab..."
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-[15px] outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-500/10"
              />
            </section>

            {/* FILES */}
            <section>
              <SectionHeading icon={<Upload className="w-4 h-4" />} title="Upload Files" />

              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`rounded-2xl p-5 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-all border-2 border-dashed ${
                  isDragging
                    ? "border-slate-500 bg-slate-50"
                    : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-slate-600" />
                </div>
                <span className="font-semibold text-slate-700 text-sm sm:text-base text-center">
                  Drag files here, or tap to browse
                </span>
                <span className="text-xs sm:text-sm text-slate-400 mt-1 text-center">
                  STL, images, PDFs, case photos
                </span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
              </label>

              {files && files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {Array.from(files).map((file, index) => (
                    <div
                      key={index}
                      className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 flex items-center gap-2 text-slate-600"
                    >
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate text-xs sm:text-sm">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT: DESKTOP STICKY SUMMARY */}
          <div className="hidden lg:block w-[340px] shrink-0 bg-slate-50 border-l border-slate-200 overflow-y-auto">
            <div className="px-8 py-7 sticky top-0">
              <h3 className="text-[15px] font-semibold text-slate-800 mb-5 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-slate-600" /> Order Summary
              </h3>

              <div className="space-y-3 text-sm mb-5">
                <SummaryRow label="Clinic" value={clinicName} />
                <SummaryRow label="Shade" value={shade || "—"} />
                <SummaryRow
                  label="Teeth selected"
                  value={selectedTeeth.length ? `${selectedTeeth.length}` : "—"}
                />
              </div>

              <label className="block mb-2 text-[13px] font-medium text-slate-600">Payment</label>
              <PaymentToggle paymentMode={paymentMode} onChange={setPaymentMode} className="mb-6" />

              <ProductPriceCard products={selectedProducts} total={total} />

              <button
                onClick={submitOrder}
                disabled={loading}
                className="w-full h-[52px] rounded-lg bg-[#16243c] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#1e3252] transition disabled:opacity-60 mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : paymentMode === "prepaid" ? (
                  `Pay ₹${total.toLocaleString("en-IN")}`
                ) : (
                  "Submit Order"
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full h-[48px] rounded-lg border border-slate-300 bg-white text-slate-600 font-medium mt-3 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE: STICKY BOTTOM BAR + EXPANDABLE SHEET */}
        <div className="lg:hidden shrink-0 border-t border-slate-200 bg-white">
          {mobileSummaryOpen && (
            <div className="px-4 pt-4 pb-2 max-h-[50vh] overflow-y-auto space-y-4">
              <div className="space-y-3 text-sm">
                <SummaryRow label="Clinic" value={clinicName} />
                <SummaryRow label="Shade" value={shade || "—"} />
                <SummaryRow
                  label="Teeth selected"
                  value={selectedTeeth.length ? `${selectedTeeth.length}` : "—"}
                />
              </div>

              <div>
                <label className="block mb-2 text-[13px] font-medium text-slate-600">Payment</label>
                <PaymentToggle paymentMode={paymentMode} onChange={setPaymentMode} />
              </div>

              <ProductPriceCard products={selectedProducts} total={total} />
            </div>
          )}

          <button
            onClick={() => setMobileSummaryOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-slate-600 text-xs font-medium border-t border-slate-100"
          >
            <span className="font-semibold">
              {mobileSummaryOpen ? "Hide summary" : "View summary"}
            </span>
            {mobileSummaryOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>

          <div className="px-4 pb-4 pt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Total</div>
                <div className="text-xl font-semibold text-slate-900">
                  ₹{total.toLocaleString("en-IN")}
                </div>
              </div>
              <span className="text-sm text-slate-500">{totalUnits} unit(s)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="h-12 px-4 rounded-lg border border-slate-300 bg-white text-slate-600 font-medium text-sm flex-1"
              >
                Cancel
              </button>
              <button
                onClick={submitOrder}
                disabled={loading}
                className="h-12 px-6 rounded-lg bg-[#16243c] text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60 flex-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : paymentMode === "prepaid" ? (
                  `Pay`
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* TOAST */}
        {toast && (
          <div
            className={`absolute bottom-32 lg:bottom-5 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium text-white max-w-[90%] ${
              toast.type === "success" ? "bg-emerald-700" : "bg-rose-700"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-800">{title}</h3>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block mb-2 text-xs sm:text-sm font-medium text-slate-600">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500 text-xs sm:text-sm">{label}</span>
      <span className="text-slate-800 font-medium text-right truncate max-w-[60%] text-xs sm:text-sm">
        {value}
      </span>
    </div>
  );
}

function QuantityStepper({
  quantity,
  onChange,
  size = "md",
}: {
  quantity: number;
  onChange: (q: number) => void;
  size?: "sm" | "md";
}) {
  const btn = size === "sm" ? "w-7 h-7 rounded-md" : "w-10 h-10 rounded-lg";
  const input = size === "sm" ? "w-9 h-7 text-xs rounded-md" : "w-full h-10 rounded-lg";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        className={`${btn} border border-slate-300 bg-white flex items-center justify-center hover:bg-slate-100 transition shrink-0`}
      >
        <Minus className={iconSize} />
      </button>
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
        className={`${input} text-center border border-slate-300 font-medium`}
      />
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        className={`${btn} border border-slate-300 bg-white flex items-center justify-center hover:bg-slate-100 transition shrink-0`}
      >
        <PlusIcon className={iconSize} />
      </button>
    </div>
  );
}

function PaymentToggle({
  paymentMode,
  onChange,
  className = "",
}: {
  paymentMode: "prepaid" | "postpaid";
  onChange: (m: "prepaid" | "postpaid") => void;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 gap-1 p-1 bg-slate-200/70 rounded-lg ${className}`}>
      <button
        type="button"
        onClick={() => onChange("postpaid")}
        className={`h-10 rounded-md text-sm font-medium transition ${
          paymentMode === "postpaid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
        }`}
      >
        Pay Later
      </button>
      <button
        type="button"
        onClick={() => onChange("prepaid")}
        className={`h-10 rounded-md text-sm font-medium transition ${
          paymentMode === "prepaid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
        }`}
      >
        Pay Now
      </button>
    </div>
  );
}

function ProductPriceCard({ products, total }: { products: SelectedProduct[]; total: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      {products.length === 0 ? (
        <p className="text-sm text-slate-400">No products selected yet.</p>
      ) : (
        <div className="space-y-2 mb-3">
          {products.map((p) => (
            <div
              key={p.name}
              className="flex justify-between text-xs sm:text-sm text-slate-600 gap-2"
            >
              <span className="truncate flex-1">
                {p.name} <span className="text-slate-400">×{p.quantity}</span>
              </span>
              <span className="shrink-0 font-medium text-slate-700">
                ₹{(p.price * p.quantity).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between items-baseline">
        <span className="text-xs sm:text-sm font-medium text-slate-700">Total</span>
        <span className="text-lg sm:text-xl font-semibold text-slate-900">
          ₹{total.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
