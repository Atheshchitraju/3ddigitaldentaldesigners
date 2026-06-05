import API_URL from "@/config/api";
import { useState } from "react";
import { clinics } from "@/routes/clinics";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const products = [
  "Zirconia Classic",
  "Zirconia Monolithic Premium",
  "Implant Prosthetics",
  "DMLS Crown & Bridge",
  "DMLS Full Metal",
  "E-Max CAD",
  "E-Max Veneer CAD",
  "Precision Attachments",
  "Night Guard",
  "Bleaching Tray",
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

const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];

const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function OrderModal({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [selectedClinic, setSelectedClinic] = useState("");

  const [customClinic, setCustomClinic] = useState("");
  const [customClinicEmail, setCustomClinicEmail] = useState("");
  const [customClinicPhone, setCustomClinicPhone] = useState("");

  const [product, setProduct] = useState("");
  const [shade, setShade] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);

  const [files, setFiles] = useState<FileList | null>(null);

  const [loading, setLoading] = useState(false);

  // PAYMENT STATES

  const [paymentMode, setPaymentMode] = useState("postpaid");

  const [amount, setAmount] = useState(1000);

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
    setProduct("");
    setShade("");
    setNotes("");
    setSelectedTeeth([]);
    setFiles(null);

    onClose();
  };

  const submitOrder = async () => {
    if (!name || !phone || !product || !selectedClinic) {
      alert("Please fill all required fields");
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
        product,
        shade,
        selectedTeeth,
        notes,

        // PAYMENT DATA

        amount,

        paymentMode,

        paymentStatus: "pending",
      };

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        // PAY LATER FLOW

        if (paymentMode === "postpaid") {
          alert("Order Submitted Successfully");

          resetForm();

          return;
        }

        // PAY NOW FLOW

        const razorpayResponse = await fetch(`${API_URL}/api/payment/create-order`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            amount,
            orderId: data.order.orderId,
          }),
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

          // config: {
          //   display: {
          //     blocks: {
          //       upi: {
          //         name: "UPI",

          //         instruments: [
          //           {
          //             method: "upi",
          //           },
          //         ],
          //       },

          //       cards: {
          //         name: "Cards",

          //         instruments: [
          //           {
          //             method: "card",
          //           },
          //         ],
          //       },

          //       netbanking: {
          //         name: "Netbanking",

          //         instruments: [
          //           {
          //             method: "netbanking",
          //           },
          //         ],
          //       },

          //       wallet: {
          //         name: "Wallet",

          //         instruments: [
          //           {
          //             method: "wallet",
          //           },
          //         ],
          //       },
          //     },

          //     sequence: ["block.upi", "block.cards", "block.netbanking", "block.wallet"],

          //     preferences: {
          //       show_default_blocks: true,
          //     },
          //   },
          // },

          prefill: {
            name: name,
            contact: phone,
            email: finalClinicEmail || "",
          },

          theme: {
            color: "#0f172a",
          },

          handler: async function (response: any) {
            const verifyResponse = await fetch(`${API_URL}/api/payment/verify`, {
              method: "POST",

              headers: {
                "Content-Type": "application/json",
              },

              body: JSON.stringify({
                orderId: data.order.orderId,

                razorpay_order_id: response.razorpay_order_id,

                razorpay_payment_id: response.razorpay_payment_id,

                razorpay_signature: response.razorpay_signature,

                paymentMethod: "Online",
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              alert("Payment Successful");

              resetForm();
            } else {
              alert("Payment Verification Failed");
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
      } else {
        alert(data.message || "Failed to submit order");
      }
    } catch (error) {
      console.log(error);

      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center pt-6 sm:pt-0 p-3 sm:p-6 overflow-y-auto">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] max-h-[92vh] overflow-y-auto border border-gray-200">
        <div className="sticky top-0 bg-white z-20 border-b border-gray-200 px-4 sm:px-8 py-5 flex items-start justify-between">
          <div>
            <h2 className="text-[28px] sm:text-[34px] leading-tight font-semibold text-[#111827] tracking-tight">
              Place Order
            </h2>

            <p className="text-gray-500 mt-2 text-sm sm:text-[15px]">
              Fill in the details below. Your order will be saved and our team will contact you.
            </p>
          </div>

          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-black transition">
            ×
          </button>
        </div>

        <div className="px-4 sm:px-8 py-6 space-y-8">
          {/* CUSTOMER */}

          <div>
            <h3 className="text-[24px] font-semibold text-[#111827] mb-5">Customer Information</h3>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block mb-2 text-[15px] font-medium text-gray-700">
                  Your Name *
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-[52px] border border-gray-300 rounded-lg px-4"
                />
              </div>

              <div>
                <label className="block mb-2 text-[15px] font-medium text-gray-700">
                  Phone Number *
                </label>

                <div className="flex gap-2">
                  <div className="h-[52px] px-4 border border-gray-300 rounded-lg flex items-center bg-[#f9fafb]">
                    +91
                  </div>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="flex-1 h-[52px] border border-gray-300 rounded-lg px-4"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CLINIC */}

          <div>
            <h3 className="text-[24px] font-semibold text-[#111827] mb-5">Select Clinic</h3>

            <select
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              className="w-full h-[52px] border border-gray-300 rounded-lg px-4"
            >
              <option value="">Choose Clinic</option>

              {clinics.map((clinic) => (
                <option key={clinic.slug} value={clinic.slug}>
                  {clinic.name}
                </option>
              ))}

              <option value="other">Other Clinic</option>
            </select>

            {selectedClinic === "other" && (
              <div className="grid md:grid-cols-2 gap-5 mt-5">
                <input
                  type="text"
                  placeholder="Clinic Name"
                  value={customClinic}
                  onChange={(e) => setCustomClinic(e.target.value)}
                  className="w-full h-[52px] border border-gray-300 rounded-lg px-4"
                />

                <input
                  type="email"
                  placeholder="Clinic Email"
                  value={customClinicEmail}
                  onChange={(e) => setCustomClinicEmail(e.target.value)}
                  className="w-full h-[52px] border border-gray-300 rounded-lg px-4"
                />

                <input
                  type="text"
                  placeholder="Clinic Phone"
                  value={customClinicPhone}
                  onChange={(e) => setCustomClinicPhone(e.target.value)}
                  className="w-full h-[52px] border border-gray-300 rounded-lg px-4"
                />
              </div>
            )}
          </div>

          {/* PRODUCT */}

          <div>
            <h3 className="text-[24px] font-semibold mb-5">Product Selection</h3>

            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full h-[52px] border border-gray-300 rounded-lg px-4"
            >
              <option value="">Select Product</option>

              {products.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* SHADE */}

          <div>
            <h3 className="text-[24px] font-semibold mb-5">Shade Selection</h3>

            <select
              value={shade}
              onChange={(e) => setShade(e.target.value)}
              className="w-full h-[52px] border border-gray-300 rounded-lg px-4"
            >
              <option value="">Select Shade</option>

              {shades.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* FDI LAYOUT */}

          <div>
            <h3 className="text-[24px] font-semibold mb-2">Tooth Numbers (FDI)</h3>

            <p className="text-gray-500 mb-6 text-sm">Click on teeth to select/deselect</p>

            <div className="flex justify-between text-sm text-gray-400 mb-4 px-1">
              <span>RIGHT</span>
              <span>UPPER</span>
              <span>LEFT</span>
            </div>

            <div className="grid grid-cols-8 md:grid-cols-16 gap-2 mb-6">
              {upperTeeth.map((tooth) => (
                <button
                  key={tooth}
                  type="button"
                  onClick={() => toggleTooth(tooth)}
                  className={`h-12 border rounded-md transition-all duration-200 ${
                    selectedTeeth.includes(tooth)
                      ? "bg-[#0f172a] text-white border-[#0f172a]"
                      : "bg-[#f9fafb] hover:bg-gray-100 border-gray-300 text-gray-700"
                  }`}
                >
                  {tooth}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-300 my-5"></div>

            <div className="grid grid-cols-8 md:grid-cols-16 gap-2 mb-5">
              {lowerTeeth.map((tooth) => (
                <button
                  key={tooth}
                  type="button"
                  onClick={() => toggleTooth(tooth)}
                  className={`h-12 border rounded-md transition-all duration-200 ${
                    selectedTeeth.includes(tooth)
                      ? "bg-[#0f172a] text-white border-[#0f172a]"
                      : "bg-[#f9fafb] hover:bg-gray-100 border-gray-300 text-gray-700"
                  }`}
                >
                  {tooth}
                </button>
              ))}
            </div>

            <div className="flex justify-between text-sm text-gray-400 px-1">
              <span>RIGHT</span>
              <span>LOWER</span>
              <span>LEFT</span>
            </div>
          </div>

          {/* NOTES */}

          <div>
            <h3 className="text-[24px] font-semibold mb-5">Additional Notes</h3>

            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3"
            />
          </div>

          {/* FILES */}

          <div>
            <h3 className="text-[24px] font-semibold mb-5">Upload Files</h3>

            <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
          </div>

          {/* PAYMENT */}

          <div>
            <h3 className="text-[24px] font-semibold mb-5">Payment Method</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMode("prepaid")}
                className={`h-[52px] rounded-lg border font-medium ${
                  paymentMode === "prepaid" ? "bg-[#0f172a] text-white" : "bg-white"
                }`}
              >
                Pay Now
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode("postpaid")}
                className={`h-[52px] rounded-lg border font-medium ${
                  paymentMode === "postpaid" ? "bg-[#0f172a] text-white" : "bg-white"
                }`}
              >
                Pay Later
              </button>
            </div>

            <div className="mt-5">
              <label className="block mb-2 text-[15px] font-medium text-gray-700">Amount</label>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-[52px] border border-gray-300 rounded-lg px-4"
              />
            </div>
          </div>

          {/* BUTTONS */}

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <button onClick={onClose} className="h-[52px] rounded-lg border border-gray-300">
              Cancel
            </button>

            <button
              onClick={submitOrder}
              disabled={loading}
              className="h-[52px] rounded-lg bg-[#0f172a] text-white"
            >
              {loading
                ? "Processing..."
                : paymentMode === "prepaid"
                  ? `Pay ₹${amount}`
                  : "Submit Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
