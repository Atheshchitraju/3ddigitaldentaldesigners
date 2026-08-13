import PDFDocument from "pdfkit";

const formatDate = (value: any): string => {
    if (!value) return "Not Available";

    try {
        return new Date(value).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    } catch {
        return "Not Available";
    }
};

const safe = (value: any): string => {
    if (value === undefined || value === null || value === "") {
        return "Not Available";
    }

    if (Array.isArray(value)) {
        return value.length ? value.join(", ") : "Not Available";
    }

    return String(value);
};

const addLine = (
    doc: PDFKit.PDFDocument,
    label: string,
    value: any,
) => {
    doc
        .font("Helvetica-Bold")
        .text(`${label}: `, { continued: true })
        .font("Helvetica")
        .text(safe(value));

    doc.moveDown(0.3);
};

export const generateProductionReport = (
    order: any,
): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: "A4",
                margin: 45,
            });

            const chunks: Buffer[] = [];

            doc.on("data", (chunk) => {
                chunks.push(chunk);
            });

            doc.on("end", () => {
                resolve(Buffer.concat(chunks));
            });

            doc.on("error", reject);

            // =========================================================
            // HEADER
            // =========================================================

            doc
                .fontSize(20)
                .font("Helvetica-Bold")
                .text("3D DIGITAL DENTAL DESIGNERS", {
                    align: "center",
                });

            doc
                .fontSize(12)
                .font("Helvetica")
                .text("Production & Delivery Report", {
                    align: "center",
                });

            doc.moveDown(1);

            doc
                .fontSize(10)
                .text(`Generated: ${formatDate(new Date())}`, {
                    align: "right",
                });

            doc.moveDown();

            // =========================================================
            // ORDER INFORMATION
            // =========================================================

            doc
                .fontSize(15)
                .font("Helvetica-Bold")
                .text("Order Information");

            doc.moveDown(0.5);

            addLine(doc, "Order ID", order.orderId);
            addLine(doc, "Clinic", order.clinic);
            addLine(doc, "Patient Name", order.patientName);
            addLine(doc, "Patient Age", order.patientAge);
            addLine(doc, "Doctor / Customer", order.name);
            addLine(doc, "Phone", order.phone);
            addLine(doc, "Product", order.product);
            addLine(doc, "Shade", order.shade);
            addLine(doc, "Selected Teeth", order.selectedTeeth);
            addLine(doc, "Quantity", order.quantity);
            addLine(
                doc,
                "Amount",
                order.amount !== undefined
                    ? `₹${order.amount}`
                    : "Not Available",
            );
            addLine(doc, "Payment Mode", order.paymentMode);
            addLine(doc, "Payment Status", order.paymentStatus);
            addLine(doc, "Order Created", formatDate(order.createdAt));
            addLine(doc, "Estimated Delivery", order.deliveryDate);
            addLine(doc, "Delivered At", formatDate(order.deliveredAt));

            doc.moveDown();

            // =========================================================
            // PRODUCTION TIMELINE
            // =========================================================

            doc
                .fontSize(15)
                .font("Helvetica-Bold")
                .text("Production Timeline");

            doc.moveDown(0.5);

            const stages = [
                {
                    name: "Designer",
                    data: order.production?.designer,
                },
                {
                    name: "Printing",
                    data: order.production?.printing,
                },
                {
                    name: "Metalist",
                    data: order.production?.metalist,
                },
                {
                    name: "Ceramist",
                    data: order.production?.ceramist,
                },
                {
                    name: "QC",
                    data: order.production?.qc,
                },
                {
                    name: "Dispatch",
                    data: order.production?.dispatch,
                },
                {
                    name: "Delivery",
                    data: order.production?.delivery,
                },
            ];

            stages.forEach((stage) => {
                const data = stage.data || {};

                doc
                    .fontSize(12)
                    .font("Helvetica-Bold")
                    .text(stage.name);

                doc.moveDown(0.2);

                addLine(doc, "Assigned Employee", data.assignedTo);
                addLine(doc, "Assigned At", formatDate(data.assignedAt));
                addLine(doc, "Started At", formatDate(data.startedAt));
                addLine(doc, "Completed At", formatDate(data.completedAt));

                if (stage.name === "Delivery") {
                    addLine(doc, "Delivered At", formatDate(data.deliveredAt));
                }

                doc.moveDown(0.4);

                // Prevent awkward page overflow
                if (doc.y > 720) {
                    doc.addPage();
                }
            });

            // =========================================================
            // ACTIVITY HISTORY
            // =========================================================

            doc.addPage();

            doc
                .fontSize(15)
                .font("Helvetica-Bold")
                .text("Production Activity History");

            doc.moveDown(0.6);

            const activities = order.production?.activity || [];

            if (!activities.length) {
                doc
                    .fontSize(10)
                    .font("Helvetica")
                    .text("No production activity recorded.");
            } else {
                activities.forEach((activity: any, index: number) => {
                    doc
                        .fontSize(11)
                        .font("Helvetica-Bold")
                        .text(
                            `${index + 1}. ${safe(activity.stage)} - ${safe(
                                activity.action,
                            )}`,
                        );

                    addLine(doc, "User", activity.user);
                    addLine(doc, "Note", activity.note);
                    addLine(doc, "Date / Time", formatDate(activity.createdAt));

                    doc.moveDown(0.5);

                    if (doc.y > 720) {
                        doc.addPage();
                    }
                });
            }

            // =========================================================
            // NOTES
            // =========================================================

            doc.moveDown();

            doc
                .fontSize(15)
                .font("Helvetica-Bold")
                .text("Order Notes");

            doc.moveDown(0.5);

            doc
                .fontSize(10)
                .font("Helvetica")
                .text(safe(order.notes));

            doc.moveDown(2);

            // =========================================================
            // FOOTER
            // =========================================================

            doc
                .fontSize(9)
                .font("Helvetica")
                .text(
                    "3D Digital Dental Designers - Production Report",
                    {
                        align: "center",
                    },
                );

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};