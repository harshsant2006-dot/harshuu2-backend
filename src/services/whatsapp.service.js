/**
 * HARSHUU 2.0 – WhatsApp Service
 * ------------------------------------
 * Responsible for generating WhatsApp
 * order message format for business
 *
 * This is REALISTIC & production-safe
 * for local food delivery operations.
 */

const BUSINESS_WHATSAPP_NUMBER = "8390454553";

/**
 * Generate WhatsApp Order Message
 *
 * @param {Object} params
 * @param {Object} params.invoice  - saved invoice document
 * @param {Object} params.order    - order document
 *
 * @returns {String} WhatsApp URL
 */
exports.generateWhatsAppLink = ({ invoice, order }) => {
  if (!invoice || !order) {
    throw new Error("Invoice and Order data required for WhatsApp message");
  }

  /* =====================================
     1️⃣ FORMAT ITEMS
  ====================================== */
  let itemsText = "";
  invoice.items.forEach((item, index) => {
    itemsText += `${index + 1}. ${item.name} x${item.quantity} = ₹${item.total}\n`;
  });

  /* =====================================
     2️⃣ FORMAT BILL
  ====================================== */
  const charges = invoice.charges;

  const billText = `
Food Total: ₹${charges.foodTotal}
GST (${charges.gstPercent}%): ₹${charges.gstAmount}
Platform Fee: ₹${charges.platformFee}
Handling Charge: ₹${charges.handlingCharge}
Delivery Charge: ₹${charges.deliveryCharge}
-----------------------
GRAND TOTAL: ₹${invoice.grandTotal}
`;

  /* =====================================
     3️⃣ FORMAT CUSTOMER DETAILS
  ====================================== */
  const customer = invoice.customer;

  const customerText = `
Customer Name: ${customer.name}
Mobile: ${customer.mobile}
Address: ${customer.address || "N/A"}
`;

  /* =====================================
     4️⃣ FINAL MESSAGE
  ====================================== */
  const message = `
🛵 *NEW ORDER – HARSHUU 2.0*

Invoice No: ${invoice.invoiceNumber}

🍽 *Items*
${itemsText}

💰 *Bill Details*
${billText}

📍 *Delivery Details*
${customerText}

Payment Mode: UPI (QR)
Payment Status: ${invoice.paymentStatus}

⚠️ Please confirm & prepare order.
`;

  /* =====================================
     5️⃣ ENCODE & GENERATE LINK
  ====================================== */
  const encodedMessage = encodeURIComponent(message.trim());

  return `https://wa.me/91${BUSINESS_WHATSAPP_NUMBER}?text=${encodedMessage}`;
};
