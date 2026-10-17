// Support content — FAQ categories and answers for the support page.

export type FaqCategory = "phones" | "watch" | "audio" | "orders";

export type Faq = {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
};

// Display order of the categories (shortcut cards + FAQ groups).
export const faqCategories: { id: FaqCategory; label: string }[] = [
  { id: "phones", label: "Phones" },
  { id: "watch", label: "Watch" },
  { id: "audio", label: "Audio" },
  { id: "orders", label: "Orders & shipping" },
];

export const faqs: Faq[] = [
  // ----- Phones -----
  {
    id: "phones-transfer",
    category: "phones",
    question: "How do I move my data from my old phone to my new Vega?",
    answer:
      'Turn on your new Vega and choose "Transfer from another phone" during setup. Keep both phones close together on the same Wi-Fi — photos, contacts, messages and apps copy over in about 30 minutes. You can also restore from a cloud backup at the same step.',
  },
  {
    id: "phones-charging",
    category: "phones",
    question: "How fast does my Vega phone charge?",
    answer:
      "It depends on the family: Spark charges at 33W, Lumen at 45W, Ember at 80W wired (30W wireless) and Halo at 100W wired (50W wireless). Use the cable in the box or any USB-C Power Delivery charger to get the full speed.",
  },
  {
    id: "phones-water",
    category: "phones",
    question: "Is my Vega phone water resistant?",
    answer:
      "Lumen and Halo phones are rated IP68 — sealed against dust and able to survive being dropped in fresh water. Spark and Ember phones handle splashes and rain, but keep them out of pools and baths.",
  },
  {
    id: "phones-tiers",
    category: "phones",
    question: "What's the difference between the Base, Plus and Pro models?",
    answer:
      "Within each family, the design, display and battery are the same. Plus adds more storage and memory, and Pro adds a faster chip and a better camera. Each phone page shows its AnTuTu performance score, so you can compare them side by side.",
  },

  // ----- Watch -----
  {
    id: "watch-swim",
    category: "watch",
    question: "Can I swim with my Vega watch?",
    answer:
      "Yes. Vega Pulse and Vega Move are rated 5 ATM, which is fine for swimming in a pool or the sea. Vega Pulse Pro is rated 10 ATM for snorkelling and water sports. None of them are made for scuba diving.",
  },
  {
    id: "watch-heart-rate",
    category: "watch",
    question: "How accurate is the heart-rate sensor?",
    answer:
      "Readings stay very close to a chest strap during everyday activity and steady exercise. Wear the watch snugly, a finger's width above your wrist bone, for the best results. Vega watches are wellness devices, not medical devices — if a reading worries you, talk to a doctor.",
  },
  {
    id: "watch-ecg",
    category: "watch",
    question: "Which Vega watch can take an ECG?",
    answer:
      "Only Vega Pulse Pro. Rest a finger on the crown for 30 seconds to record your heart's rhythm. An ECG reading can't detect a heart attack — if you feel unwell, call your local emergency number.",
  },
  {
    id: "watch-battery",
    category: "watch",
    question: "How long does the watch battery last?",
    answer:
      "Up to 3 days on Vega Pulse, 4 days on Vega Move (up to 30 hours with GPS on) and 5 days on Vega Pulse Pro. The always-on display and frequent workouts shorten it.",
  },

  // ----- Audio -----
  {
    id: "audio-pair",
    category: "audio",
    question: "How do I pair my Vega Beam or Beam Pro earbuds?",
    answer:
      'Open the charging case with the earbuds inside, then hold the button on the back of the case for 3 seconds until the light flashes white. Choose "Vega Beam" in your phone\'s Bluetooth settings. After that, they connect automatically whenever you open the case.',
  },
  {
    id: "audio-reset",
    category: "audio",
    question: "How do I reset my Vega Aura headphones?",
    answer:
      "Turn the headphones on, then press and hold the power and noise-control buttons together for 10 seconds until the light flashes. Aura restarts with factory settings, ready to pair again.",
  },
  {
    id: "audio-anc",
    category: "audio",
    question: "What does noise cancellation do, and which models have it?",
    answer:
      "Active noise cancellation (ANC) uses microphones to cancel steady background sound like engines and air conditioning. Vega Beam Pro has adaptive ANC and Vega Aura has immersive ANC. Vega Beam doesn't have ANC, but its snug in-ear fit blocks some noise.",
  },
  {
    id: "audio-sweat",
    category: "audio",
    question: "Are Vega earbuds sweat-proof?",
    answer:
      "Yes. Vega Beam is rated IPX4 and Vega Beam Pro IPX5, so both handle sweat and rain during workouts. Don't submerge them or rinse them under a tap.",
  },

  // ----- Orders & shipping -----
  {
    id: "orders-shipping",
    category: "orders",
    question: "How long does shipping take?",
    answer:
      "Standard shipping is free on every order and arrives in 3–5 business days. In a hurry? Express shipping arrives in 1–2 business days for a flat Rp 50.000. Orders usually leave our warehouse within 1 business day, and you'll get an email with a tracking link as soon as yours ships.",
  },
  {
    id: "orders-returns",
    category: "orders",
    question: "What's your return policy?",
    answer:
      "You have 30 days from delivery to return any Vega product for a full refund, for any reason — just include its accessories. Returns are free: send us a message below and we'll email you a prepaid label.",
  },
  {
    id: "orders-warranty",
    category: "orders",
    question: "What does the warranty cover?",
    answer:
      "Every Vega product includes a 1-year warranty against manufacturing defects, like a screen, button or battery that fails on its own. It doesn't cover accidental damage such as drops, cracks or liquid spills.",
  },
  {
    id: "orders-change",
    category: "orders",
    question: "Can I change or cancel my order?",
    answer:
      "Yes, as long as it hasn't shipped yet — usually within an hour or two of ordering. Send us a message with your order details and we'll update or cancel it for you.",
  },
];
