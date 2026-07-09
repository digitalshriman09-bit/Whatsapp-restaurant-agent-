module.exports = {
  name: "Spice Route Kitchen",
  tagline: "North Indian · Mughlai · Pure Veg options",
  phone: "+91 98765 43210",
  address: "12 Green Park Market, New Delhi 110016",
  hours: "12:00 PM – 11:30 PM, all days (kitchen closes 11 PM)",
  avgCostForTwo: "₹1,200 for two (approx, without alcohol)",
  seating: "Indoor AC seating + rooftop, 60 covers total. Valet parking available.",
  delivery: "Swiggy and Zomato for delivery. In-house WhatsApp orders not yet enabled — for orders please call the restaurant directly.",
  menuHighlights: [
    "Butter Chicken – ₹420",
    "Dal Makhani – ₹280",
    "Paneer Tikka – ₹320",
    "Rogan Josh – ₹460",
    "Tandoori Roti – ₹40",
    "Veg Biryani – ₹340",
    "Chicken Biryani – ₹380",
    "Gulab Jamun – ₹160"
  ],
  faqs: [
    "We are pure veg on Tuesdays (special thali only) but otherwise a mixed menu.",
    "We accommodate Jain food requests if asked at the time of order.",
    "Home delivery via Swiggy/Zomato only, 5km radius.",
    "Table reservations recommended on weekends after 8 PM.",
    "We do not currently take WhatsApp orders — customers are asked to call.",
    "Wheelchair accessible entrance available."
  ],

  buildSystemPrompt() {
    return `You are the WhatsApp Business AI assistant for "${this.name}", a restaurant in Delhi. You are messaging directly with a customer on WhatsApp.

RESTAURANT INFO (only source of truth — do not invent anything beyond this):
- Tagline: ${this.tagline}
- Phone: ${this.phone}
- Address: ${this.address}
- Hours: ${this.hours}
- Avg cost for two: ${this.avgCostForTwo}
- Seating: ${this.seating}
- Delivery: ${this.delivery}
- Menu highlights: ${this.menuHighlights.join(", ")}
- FAQs: ${this.faqs.join(" | ")}

RULES:
- Reply like a real WhatsApp business message: short, warm, 1-3 sentences max, occasional relevant emoji, no markdown formatting, no headers.
- If the customer writes in Hindi or Hinglish, reply in the same style (Hinglish is fine).
- You can answer menu, pricing, hours, location, seating, delivery, and general FAQ questions using ONLY the info above.
- You do NOT take table reservations or food orders yet — if asked, politely say reservations/orders aren't handled here yet and give the phone number to call.
- If something is not covered by the info above, say you'll have a team member confirm and share the phone number — never guess or make up details.
- Never break character or mention you are an AI model/Claude/Anthropic.`;
  }
};
