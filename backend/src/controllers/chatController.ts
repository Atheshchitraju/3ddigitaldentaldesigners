import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

interface ChatMessage {
    role: "user" | "model";
    text: string;
}

interface ChatRequestBody {
    message: string;
    history?: ChatMessage[];
}

interface Product {
    name: string;
    price: number;
    warranty?: string;
    category: string;
}

interface SiteLink {
    label: string;
    url: string;
}

// ==========================================
// OFFICIAL PRODUCT CATALOG
// ==========================================

const PRODUCTS: Product[] = [
    // ZIRCONIA
    { name: "Zirconia Classic", price: 1000, warranty: "10 Years", category: "Zirconia" },
    { name: "Zirconia Monolithic Classic", price: 1200, warranty: "10 Years", category: "Zirconia" },
    { name: "Zirconia Premium", price: 1800, warranty: "15 Years", category: "Zirconia" },
    { name: "Zirconia Monolithic Premium", price: 2000, warranty: "15 Years", category: "Zirconia" },
    { name: "Zirconia Premium Multilayered", price: 3000, warranty: "15 Years", category: "Zirconia" },
    { name: "Zirconia Monolithic Multilayered", price: 4500, warranty: "Lifetime", category: "Zirconia" },

    // IMPLANT PROSTHETICS
    { name: "Cement Retained Zirconia Classic Per Unit", price: 1600, category: "Implant Prosthetics" },
    { name: "Cement Retained Zirconia Premium Per Unit", price: 2600, category: "Implant Prosthetics" },
    { name: "Cement Retained DMLS Classic Per Unit", price: 1500, category: "Implant Prosthetics" },
    { name: "Cement Retained DMLS Premium Per Unit", price: 2000, category: "Implant Prosthetics" },
    { name: "Cement Retained Bar with Zirconia Per Unit", price: 30000, category: "Implant Prosthetics" },
    { name: "Cement Retained Bar Peek with Composite Per Unit", price: 40000, category: "Implant Prosthetics" },
    { name: "Screw Retained DMLS Crown & Bridge Per Unit", price: 2500, category: "Implant Prosthetics" },
    {
        name: "Screw Retained Zirconia Crown & Bridge With Titanium Base Per Unit",
        price: 3000,
        category: "Implant Prosthetics",
    },
    { name: "Screw Retained Peek with Composite Per Unit", price: 3000, category: "Implant Prosthetics" },
    { name: "Screw Retained Titanium with Composite Per Unit", price: 4000, category: "Implant Prosthetics" },
    { name: "Screw Retained E-Max CAD with Titanium Base Per Unit", price: 5000, category: "Implant Prosthetics" },

    // PRECISION ATTACHMENTS
    { name: "Single Attachments (Upto Two Teeth)", price: 3000, category: "Precision Attachments" },
    { name: "Double Attachments (More Than Two Teeth)", price: 5000, category: "Precision Attachments" },
    { name: "Bilateral Attachments", price: 10000, category: "Precision Attachments" },

    // DMLS
    { name: "DMLS Crown & Bridge", price: 650, warranty: "5 Years", category: "DMLS (CAD/CAM)" },
    { name: "DMLS Crown & Bridge Premium", price: 800, warranty: "10 Years", category: "DMLS (CAD/CAM)" },
    { name: "DMLS 3/4 Crown", price: 600, warranty: "5 Years", category: "DMLS (CAD/CAM)" },
    { name: "DMLS Full Metal Per Unit", price: 400, warranty: "N/A", category: "DMLS (CAD/CAM)" },
    { name: "DMLS Inlay/Onlay Per Unit", price: 1500, warranty: "N/A", category: "DMLS (CAD/CAM)" },
    { name: "With Die Preparation Extra Per Unit", price: 200, warranty: "N/A", category: "DMLS (CAD/CAM)" },

    // E-MAX
    { name: "E-Max CAD Per Unit", price: 2500, warranty: "10 Years", category: "E-Max CAD" },
    { name: "E-Max Veneer CAD Per Unit", price: 2700, warranty: "10 Years", category: "E-Max CAD" },
    { name: "E-Max Inlay/Onlay CAD Per Unit", price: 2500, warranty: "15 Years", category: "E-Max CAD" },
    { name: "E-Max Zirconia CAD Prime Per Unit", price: 2800, warranty: "15 Years", category: "E-Max CAD" },
    { name: "E-Max Zirconia CAD Esthetic Per Unit", price: 3500, warranty: "15 Years", category: "E-Max CAD" },

    // COMPLETE DENTURES
    { name: "Special Tray With Occlusion Rims", price: 500, category: "Complete Dentures (Unbreakable)" },
    { name: "Complete Denture With Ivoclar U/L", price: 5000, category: "Complete Dentures (Unbreakable)" },
    { name: "Lucitone 199 With Acrylic Rock Teeth Set", price: 3500, category: "Complete Dentures (Unbreakable)" },
    { name: "Acrylization", price: 1500, category: "Complete Dentures (Unbreakable)" },

    // OTHERS
    { name: "Night Guard", price: 900, category: "Others" },
    { name: "Bleaching Tray U/L", price: 600, category: "Others" },
    { name: "Orthodontic Retention Plate", price: 600, category: "Others" },
    { name: "Temporary Crown", price: 200, category: "Others" },
    { name: "PMMA", price: 200, category: "Others" },
    { name: "Aligners per arch", price: 1200, category: "Others" },
];

// ==========================================
// SITE LINKS
// Update these URLs to match your actual site routes.
// ==========================================

const SITE_LINKS: Record<string, SiteLink> = {
    order: { label: "Place an Order", url: "https://digitaldentaldesigners.in/order" },
    scannerBooking: { label: "Book a Scanner", url: "https://digitaldentaldesigners.in/scanner-booking" },
    contact: { label: "Contact Us", url: "https://digitaldentaldesigners.in/contact" },
    clinics: { label: "Find a Clinic", url: "https://digitaldentaldesigners.in/clinics" },
    partner: { label: "Partner With Us", url: "https://digitaldentaldesigners.in/partner-with-us" },
    products: { label: "View Products", url: "https://digitaldentaldesigners.in/products" },
    home: { label: "Visit Our Website", url: "https://digitaldentaldesigners.in" },
};

// Keyword -> link detector. Runs on every message (local or Gemini)
// so any answer can carry a relevant "go here" navigation button.
const detectRelevantLink = (message: string): SiteLink | undefined => {
    const m = message.toLowerCase();

    if (m.includes("order")) return SITE_LINKS.order;
    if (m.includes("scan") || m.includes("booking") || m.includes("book a")) return SITE_LINKS.scannerBooking;
    if (m.includes("contact") || m.includes("phone") || m.includes("email") || m.includes("reach")) return SITE_LINKS.contact;
    if (m.includes("clinic")) return SITE_LINKS.clinics;
    if (m.includes("partner")) return SITE_LINKS.partner;
    if (m.includes("product") || m.includes("catalog") || m.includes("price list")) return SITE_LINKS.products;

    return undefined;
};

// ==========================================
// LOCAL PRODUCT SEARCH
// ==========================================

const normalize = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

const findMatchingProducts = (message: string): Product[] => {
    const normalizedMessage = normalize(message);

    // First find exact product name inside the user's question
    const exactMatches = PRODUCTS.filter((product) =>
        normalizedMessage.includes(normalize(product.name))
    );

    if (exactMatches.length > 0) {
        // Prefer the most specific / longest matching product name
        return [
            exactMatches.sort(
                (a, b) =>
                    normalize(b.name).length - normalize(a.name).length
            )[0],
        ];
    }

    return [];
};

// ==========================================
// LOCAL CHAT RESPONSE
// RETURNS NULL IF GEMINI IS NEEDED
// ==========================================

const getLocalResponse = (message: string): string | null => {
    const lowerMessage = message.toLowerCase();

    // ------------------------------------------
    // HOW TO PLACE ORDER
    // ------------------------------------------

    if (
        lowerMessage.includes("place order") ||
        lowerMessage.includes("how to order") ||
        lowerMessage.includes("order link") ||
        lowerMessage.includes("place an order")
    ) {
        return "You can place your order here: https://digitaldentaldesigners.in/order";
    }

    // ------------------------------------------
    // PRODUCT CATEGORY LIST
    // ------------------------------------------

    const categories = [
        "zirconia",
        "implant prosthetics",
        "precision attachments",
        "dmls",
        "e-max",
        "complete dentures",
        "night guard",
        "aligners",
    ];

    const requestedCategory = categories.find((category) =>
        lowerMessage.includes(category),
    );

    if (
        requestedCategory &&
        (
            lowerMessage.includes("products") ||
            lowerMessage.includes("available products") ||
            lowerMessage.includes("show me") ||
            lowerMessage.includes("list")
        )
    ) {
        const matchingCategoryProducts = PRODUCTS.filter((product) =>
            product.category.toLowerCase().includes(requestedCategory),
        );

        if (matchingCategoryProducts.length > 0) {
            return `${requestedCategory.toUpperCase()} products:\n\n${matchingCategoryProducts
                .map(
                    (product) =>
                        `• ${product.name} — ₹${product.price}${product.warranty ? ` | Warranty: ${product.warranty}` : ""
                        }`,
                )
                .join("\n")}`;
        }
    }

    // ------------------------------------------
    // PRODUCT PRICE / WARRANTY / DETAILS
    // ------------------------------------------

    const matchedProducts = findMatchingProducts(message);

    if (matchedProducts.length === 1) {
        const product = matchedProducts[0];

        const asksPrice =
            lowerMessage.includes("price") ||
            lowerMessage.includes("cost") ||
            lowerMessage.includes("how much") ||
            lowerMessage.includes("rate");

        const asksWarranty =
            lowerMessage.includes("warranty") ||
            lowerMessage.includes("guarantee");

        if (asksPrice && asksWarranty) {
            return `${product.name} costs ₹${product.price}. Warranty: ${product.warranty && product.warranty !== "N/A"
                    ? product.warranty
                    : "Warranty information is not currently specified. Please contact us for confirmation."
                }`;
        }

        if (asksPrice) {
            return `${product.name} costs ₹${product.price}.`;
        }

        if (asksWarranty) {
            return product.warranty && product.warranty !== "N/A"
                ? `${product.name} has a ${product.warranty} warranty.`
                : `Warranty information for ${product.name} is not currently specified. Please contact us for confirmation.`;
        }

        // Basic product information without Gemini
        if (
            lowerMessage.includes("tell me about") ||
            lowerMessage.includes("details") ||
            lowerMessage.includes("information")
        ) {
            return `${product.name}\n\nCategory: ${product.category}\nWarranty: ${product.warranty && product.warranty !== "N/A"
                    ? product.warranty
                    : "Not currently specified"
                }`;
        }
    }

    // ------------------------------------------
    // PRODUCT COMPARISON
    // Example: Compare Zirconia Classic and Zirconia Premium
    // ------------------------------------------

    if (
        lowerMessage.includes("compare") ||
        lowerMessage.includes("difference between") ||
        lowerMessage.includes("vs")
    ) {
        const comparisonProducts = PRODUCTS.filter((product) =>
            normalize(message).includes(normalize(product.name)),
        );

        if (comparisonProducts.length >= 2) {
            return comparisonProducts
                .map(
                    (product) =>
                        `${product.name}\nPrice: ₹${product.price}\nWarranty: ${product.warranty && product.warranty !== "N/A"
                            ? product.warranty
                            : "Not specified"
                        }`,
                )
                .join("\n\n-------------------\n\n");
        }
    }

    return null;
};

// ==========================================
// GEMINI SYSTEM INSTRUCTION
// ==========================================

const SYSTEM_INSTRUCTION = `
You are the official AI assistant for 3D Digital Dental Designers.

Help visitors with:
- Dental services and products
- Product comparisons
- Scanner booking
- How scanner booking works
- How to place an order
- Order information
- Contact information
- Partner With Us
- Clinics
- General company information

IMPORTANT RULES:
1. Only answer questions related to 3D Digital Dental Designers, its website, services, products, orders, scanner booking, clinics, and dental lab services.
2. Do not invent company information, prices, warranties, or specifications.
3. If you do not know the answer, clearly say that you do not have that information and recommend contacting the company directly.
4. Keep answers concise, clear, and professional.
5. For clinical or medical recommendations, do not make definitive medical decisions.
`;

// ==========================================
// CHAT CONTROLLER
// ==========================================

export const chatWithAI = async (req: Request, res: Response) => {
    try {
        const { message, history = [] } = req.body as ChatRequestBody;

        if (!message || typeof message !== "string" || message.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "A valid message string is required.",
            });
        }

        // A relevant navigation link for this question, if any.
        // Computed once and attached to whichever response path answers the user.
        const link = detectRelevantLink(message);

        // ======================================
        // STEP 1: CHECK LOCAL KNOWLEDGE FIRST
        // NO GEMINI API CALL
        // ======================================

        const localResponse = getLocalResponse(message.trim());

        if (localResponse) {
            console.log("CHAT: Answered locally — no Gemini quota used.");

            return res.status(200).json({
                success: true,
                reply: localResponse,
                link,
                source: "local",
            });
        }

        // ======================================
        // STEP 2: GEMINI FOR COMPLEX QUESTIONS
        // ======================================

        const formattedContents = history.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.text }],
        }));

        formattedContents.push({
            role: "user",
            parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: formattedContents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.2,
                maxOutputTokens: 500,
            },
        });

        return res.status(200).json({
            success: true,
            reply: response.text || "Sorry, I could not generate a response.",
            link,
            source: "gemini",
        });
    } catch (error: any) {
        console.error(
            "GEMINI CHAT ERROR [Time:",
            new Date().toISOString(),
            "]:",
            error.message || error,
        );

        // ======================================
        // HANDLE QUOTA EXHAUSTED
        // ======================================

        if (error.status === 429) {
            return res.status(200).json({
                success: true,
                reply:
                    "Our AI assistant is temporarily busy. Please try again shortly. You can still ask about products, warranties, and available products.",
                link: SITE_LINKS.contact,
                source: "fallback",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error while communicating with AI.",
        });
    }
};