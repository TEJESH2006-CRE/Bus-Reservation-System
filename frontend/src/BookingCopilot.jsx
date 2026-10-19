import { useEffect, useRef, useState } from "react";

const COPY = {
  en: {
    title: "BusGo Assistant",
    subtitle: "Friendly, step-by-step booking help",
    welcome:
      "Hi! I can guide you through BusGo one step at a time. I use built-in help rules; no AI service is connected. Please do not share passwords, OTPs, tokens, or payment details here.",
    language: "Language",
    reset: "Reset chat",
    minimize: "Minimize chat",
    maximize: "Open chat",
    close: "Close chat",
    placeholder: "Ask a BusGo question…",
    send: "Send",
    open: "Chat with BusGo Assistant",
    minimized: "Chat minimized",
    actions: [
      ["book", "How do I book a ticket?"],
      ["find", "Find a bus"],
      ["seats", "Help me select seats"],
      ["pay", "How do I pay?"],
      ["download", "Download my ticket"],
      ["bookings", "View my bookings"],
      ["cancel", "Cancel a booking"],
      ["support", "Contact support"],
    ],
    answers: {
      login: "Please sign in first. BusGo requires an account to search and manage bookings. After signing in, I can take you to the right step.",
      book: "Start here: enter your departure city, destination, and travel date, then choose Search Buses. I’ll guide you through the next step after that.",
      bookResults: "Your search returned {count} bus option(s). Compare the details and fare shown on the page, then choose View Seats for the bus you want.",
      bookSeats: "Next, choose the seats marked available. Sold seats cannot be selected. BusGo allows up to six seats in one booking.",
      bookPassenger: "Next, enter the required details for each selected seat, then choose Confirm Booking & Pay. BusGo opens payment review only after the server confirms the booking. Enter passenger details in BusGo’s form, not in this chat.",
      bookPayment: "Review the booking details on this page, then choose Pay Now if you want to continue. This project currently uses a demo payment flow; it is not a live payment gateway.",
      bookConfirmation: "BusGo has reached the confirmation page for this booking. You can use Download Ticket as PDF to save the ticket.",
      bookBookings: "Your bookings page is open. Choose an upcoming or completed booking to see its available actions.",
      bookOther: "To book, sign in as a customer, search for a route and date, then follow the seat, passenger, and payment steps shown by BusGo.",
      find: "The bus search page is open. Enter the departure city, destination, and date, then choose Search Buses. Results and fares come from BusGo’s search service; I won’t guess them.",
      seats: "Choose an available seat shown in the layout. Unavailable seats are disabled. After selecting seats, continue to enter passenger details.",
      seatsSearch: "First search for buses, then select View Seats on a result. I’ve taken you to the next available step.",
      seatsLocked: "This booking is already at payment or confirmation. I left it unchanged. Seat selection happens before payment; use Home if you want to start a different search.",
      pay: "BusGo’s payment step comes after you select seats and enter passenger details. Review the amount and booking details on the payment page before choosing Pay Now. The current project uses demo payment, not a live gateway.",
      payReady: "Your payment page is open. Review the booking and amount, then choose Pay Now only if you want to continue. BusGo will show its result after the server responds.",
      payPassenger: "Finish the required passenger details, then choose Confirm Booking & Pay. BusGo opens payment review only after the server confirms the booking.",
      download: "Your ticket PDF download has been started from BusGo’s confirmation page.",
      downloadBookings: "Your bookings page is open. Find the booking you want and use its Download Ticket as PDF button.",
      bookings: "Your bookings page is open. BusGo loaded the records from your account.",
      cancel: "Your bookings page is open. Only your own confirmed booking can be cancelled. The current server calculates 90% refund when departure is more than 24 hours away, 50% from 6 to 24 hours, and 0% under 6 hours. This demo calculates a refund but does not send real money back. Choose Cancel Booking; BusGo will ask you to confirm and the server will check the request.",
      support: "This project does not have a support email or phone number configured. Please use the contact channel provided by the person or organization running your BusGo service.",
      unavailable: "I couldn’t open that BusGo page right now. Please use the site navigation or try again in a moment.",
      unknown: "I can help with booking, bus search, seats, payment steps, ticket PDFs, bookings, or cancellation. Choose a quick action or ask me a question.",
      secret: "For your safety, don’t share passwords, OTPs, access tokens, card details, or payment PINs here. I did not add that text to the chat. Please clear it from the message box.",
      guest: "You can ask me general questions here. BusGo requires you to sign in before searching for buses, opening bookings, or booking a seat.",
      role: "This booking guide is for customer accounts. Please switch to a customer account to use customer booking pages.",
    },
  },
  ta: {
    title: "BusGo உதவியாளர்",
    subtitle: "படிப்படியாக டிக்கெட் முன்பதிவு உதவி",
    welcome:
      "வணக்கம்! BusGo-வில் முன்பதிவு செய்ய ஒவ்வொரு படியாகவும் வழிகாட்டுகிறேன். இது உள்ளமைக்கப்பட்ட விதிகளால் இயங்கும்; AI சேவை இணைக்கப்படவில்லை. கடவுச்சொல், OTP, டோக்கன் அல்லது பணம் செலுத்தும் விவரங்களை இங்கே பகிர வேண்டாம்.",
    language: "மொழி",
    reset: "உரையாடலை மீட்டமை",
    minimize: "சுருக்கவும்",
    maximize: "உரையாடலைத் திறக்கவும்",
    close: "மூடவும்",
    placeholder: "BusGo பற்றி கேளுங்கள்…",
    send: "அனுப்பு",
    open: "BusGo உதவியாளருடன் உரையாடவும்",
    minimized: "உரையாடல் சுருக்கப்பட்டுள்ளது",
    actions: [
      ["book", "டிக்கெட் எப்படி முன்பதிவு செய்வது?"],
      ["find", "பேருந்தைத் தேடு"],
      ["seats", "இருக்கை தேர்வுக்கு உதவி"],
      ["pay", "பணம் எப்படி செலுத்துவது?"],
      ["download", "என் டிக்கெட்டை பதிவிறக்கு"],
      ["bookings", "என் முன்பதிவுகளைப் பார்"],
      ["cancel", "முன்பதிவை ரத்து செய்"],
      ["support", "ஆதரவைத் தொடர்புகொள்"],
    ],
    answers: {
      login: "முதலில் உள்நுழையவும். பேருந்தைத் தேடவும் முன்பதிவுகளை நிர்வகிக்கவும் BusGo கணக்கு தேவை. உள்நுழைந்த பிறகு சரியான படிக்கு அழைத்துச் செல்கிறேன்.",
      book: "முதலில் புறப்படும் ஊர், சேரும் ஊர், பயணத் தேதியை உள்ளிட்டு Search Buses-ஐத் தேர்ந்தெடுக்கவும். அடுத்த படியிலும் வழிகாட்டுகிறேன்.",
      bookResults: "தேடலில் {count} பேருந்து விருப்பம்(கள்) கிடைத்துள்ளன. பக்கத்தில் உள்ள விவரங்களையும் கட்டணத்தையும் ஒப்பிட்டு, விரும்பிய பேருந்தில் View Seats-ஐத் தேர்ந்தெடுக்கவும்.",
      bookSeats: "அடுத்து கிடைக்கும் இருக்கைகளைத் தேர்ந்தெடுக்கவும். விற்ற இருக்கைகளைத் தேர்ந்தெடுக்க முடியாது. ஒரு முன்பதிவில் அதிகபட்சம் ஆறு இருக்கைகளைத் தேர்ந்தெடுக்கலாம்.",
      bookPassenger: "தேர்ந்தெடுத்த ஒவ்வொரு இருக்கைக்கும் தேவையான பயணி விவரங்களை உள்ளிட்டு Confirm Booking & Pay-ஐத் தேர்ந்தெடுக்கவும். சேவையகம் முன்பதிவை உறுதிசெய்த பிறகே BusGo கட்டணச் சரிபார்ப்பைத் திறக்கும். பயணி விவரங்களை இந்த உரையாடலில் அல்ல, BusGo படிவத்தில் மட்டும் உள்ளிடவும்.",
      bookPayment: "இந்தப் பக்கத்தில் முன்பதிவு விவரங்களைச் சரிபார்த்து, தொடர விரும்பினால் Pay Now-ஐத் தேர்ந்தெடுக்கவும். இந்தத் திட்டத்தில் தற்போது சோதனை கட்டண முறை மட்டுமே உள்ளது; உண்மையான கட்டண சேவை இல்லை.",
      bookConfirmation: "இந்த முன்பதிவுக்கான உறுதிப்படுத்தல் பக்கத்தை BusGo திறந்துள்ளது. டிக்கெட்டைச் சேமிக்க Download Ticket as PDF-ஐத் தேர்ந்தெடுக்கவும்.",
      bookBookings: "உங்கள் முன்பதிவுகள் பக்கம் திறந்துள்ளது. கிடைக்கும் செயல்களைப் பார்க்க வரவிருக்கும் அல்லது முடிந்த முன்பதிவைத் தேர்ந்தெடுக்கவும்.",
      bookOther: "முன்பதிவு செய்ய வாடிக்கையாளர் கணக்கில் உள்நுழைந்து, வழித்தடம் மற்றும் தேதியைத் தேடி, இருக்கை, பயணி, கட்டணப் படிகளைப் பின்பற்றவும்.",
      find: "பேருந்து தேடல் பக்கம் திறந்துள்ளது. புறப்படும் ஊர், சேரும் ஊர், தேதியை உள்ளிட்டு Search Buses-ஐத் தேர்ந்தெடுக்கவும். முடிவுகளும் கட்டணங்களும் BusGo தேடல் சேவையிலிருந்து வரும்; நான் ஊகிக்க மாட்டேன்.",
      seats: "இருக்கை அமைப்பில் கிடைக்கும் எனக் காட்டப்பட்ட இருக்கையைத் தேர்ந்தெடுக்கவும். கிடைக்காத இருக்கைகள் முடக்கப்பட்டிருக்கும். இருக்கைகளைத் தேர்ந்தெடுத்ததும் பயணி விவரங்களைத் தொடரவும்.",
      seatsSearch: "முதலில் பேருந்துகளைத் தேடி, முடிவில் View Seats-ஐத் தேர்ந்தெடுக்கவும். அடுத்த கிடைக்கும் படிக்கு அழைத்துள்ளேன்.",
      seatsLocked: "இந்த முன்பதிவு ஏற்கனவே கட்டணம் அல்லது உறுதிப்படுத்தல் நிலையில் உள்ளது. அதை மாற்றவில்லை. கட்டணத்திற்கு முன்பே இருக்கையைத் தேர்ந்தெடுக்க வேண்டும்; வேறு தேடலைத் தொடங்க Home-ஐப் பயன்படுத்தவும்.",
      pay: "இருக்கைகளைத் தேர்ந்தெடுத்து பயணி விவரங்களை உள்ளிட்ட பிறகே கட்டணப் படி வரும். Pay Now-ஐத் தேர்ந்தெடுப்பதற்கு முன் தொகையையும் விவரங்களையும் சரிபார்க்கவும். தற்போது இது சோதனை கட்டணம்; நேரடி கட்டண சேவை அல்ல.",
      payReady: "கட்டணப் பக்கம் திறந்துள்ளது. முன்பதிவையும் தொகையையும் சரிபார்த்து, தொடர விரும்பினால் மட்டுமே Pay Now-ஐத் தேர்ந்தெடுக்கவும். சேவையகப் பதில் வந்த பிறகே BusGo முடிவைக் காட்டும்.",
      payPassenger: "தேவையான பயணி விவரங்களை முடித்து Confirm Booking & Pay-ஐத் தேர்ந்தெடுக்கவும். சேவையகம் முன்பதிவை உறுதிசெய்த பிறகே BusGo கட்டணச் சரிபார்ப்பைத் திறக்கும்.",
      download: "உறுதிப்படுத்தல் பக்கத்திலிருந்து டிக்கெட் PDF பதிவிறக்கத்தைத் தொடங்கியுள்ளேன்.",
      downloadBookings: "உங்கள் முன்பதிவுகள் பக்கம் திறந்துள்ளது. தேவையான முன்பதிவைக் கண்டுபிடித்து அதன் Download Ticket as PDF பொத்தானைத் தேர்ந்தெடுக்கவும்.",
      bookings: "உங்கள் முன்பதிவுகள் பக்கம் திறந்துள்ளது. உங்கள் கணக்கிலிருந்து BusGo பதிவுகளை ஏற்றியுள்ளது.",
      cancel: "உங்கள் முன்பதிவுகள் பக்கம் திறந்துள்ளது. உங்களுடைய உறுதிசெய்யப்பட்ட முன்பதிவை மட்டுமே ரத்து செய்யலாம். புறப்படும் நேரத்திற்கு 24 மணி நேரத்திற்கு மேல் இருந்தால் 90%, 6 முதல் 24 மணி நேரத்திற்குள் இருந்தால் 50%, 6 மணி நேரத்திற்குக் குறைவாக இருந்தால் 0% என சேவையகம் கணக்கிடும். இந்தச் சோதனைத் திட்டம் பணத்தை உண்மையில் திருப்பி அனுப்பாது. Cancel Booking-ஐத் தேர்ந்தெடுக்கவும்; BusGo உறுதிப்படுத்தச் சொல்லி சேவையகம் கோரிக்கையைச் சரிபார்க்கும்.",
      support: "இந்தத் திட்டத்தில் ஆதரவு மின்னஞ்சல் அல்லது தொலைபேசி எண் அமைக்கப்படவில்லை. BusGo சேவையை நடத்துபவர் வழங்கிய தொடர்பு வழியைப் பயன்படுத்தவும்.",
      unavailable: "இப்போது அந்த BusGo பக்கத்தைத் திறக்க முடியவில்லை. தள வழிசெலுத்தலைப் பயன்படுத்தவும் அல்லது சிறிது நேரம் கழித்து முயற்சிக்கவும்.",
      unknown: "முன்பதிவு, பேருந்துத் தேடல், இருக்கைகள், கட்டணப் படிகள், டிக்கெட் PDF, முன்பதிவுகள் அல்லது ரத்து செய்வதில் உதவலாம். விரைவு செயலொன்றைத் தேர்ந்தெடுக்கவும் அல்லது கேள்வி கேளுங்கள்.",
      secret: "உங்கள் பாதுகாப்புக்காக கடவுச்சொல், OTP, அணுகல் டோக்கன், அட்டை விவரம் அல்லது பண PIN-ஐ இங்கே பகிர வேண்டாம். அந்த உரையை உரையாடலில் சேர்க்கவில்லை. செய்திப் பெட்டியிலிருந்து அதை அழிக்கவும்.",
      guest: "பொதுவான கேள்விகளை இங்கே கேட்கலாம். பேருந்தைத் தேட, முன்பதிவுகளைத் திறக்க அல்லது இருக்கையை முன்பதிவு செய்ய BusGo-வில் உள்நுழைய வேண்டும்.",
      role: "இந்த வழிகாட்டி வாடிக்கையாளர் கணக்குகளுக்கானது. வாடிக்கையாளர் முன்பதிவு பக்கங்களைப் பயன்படுத்த வாடிக்கையாளர் கணக்கிற்கு மாறவும்.",
    },
  },
};

const CREDENTIAL_PATTERNS = [
  /\b(?:password|passcode|access token|refresh token|token|jwt|upi pin|cvv|cvc|security code)\s*(?::|=)\s*\S+/i,
  /\b(?:password|passcode|access token|refresh token|token|jwt|upi pin|cvv|cvc|security code)\s+is\s+\S+/i,
  /\b(?:access token|refresh token|token|jwt)\s+\S{12,}/i,
  /\b(?:otp|one[- ]time code|upi pin|cvv|cvc|security code)\s*:?[ \t]*\d{3,8}\b/i,
  /\b(?:credit|debit)\s*card(?:\s*number)?\b.{0,12}(?:\d[ -]?){13,19}/i,
  /\b(?:\d[ -]?){13,19}\b/,
  /^\s*\d{4,8}\s*$/,
  /\beyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/,
];

function isCredentialText(text) {
  return CREDENTIAL_PATTERNS.some((pattern) => pattern.test(text));
}

function detectIntent(text) {
  const value = text.toLocaleLowerCase();
  if (/cancel|cancellation|ரத்து|ரத்துசெய்/.test(value)) return "cancel";
  if (/download|pdf|ticket|பதிவிற|டிக்கெட்/.test(value) && /download|pdf|பதிவிற/.test(value)) return "download";
  if (/my bookings|booking history|view bookings|முன்பதிவ|புக்கிங்/.test(value)) return "bookings";
  if (/seat|seats|இருக்கை/.test(value)) return "seats";
  if (/pay|payment|பணம்|கட்டணம்|செலுத்த/.test(value)) return "pay";
  if (/find|search|bus|பேருந்து|தேடு/.test(value)) return "find";
  if (/support|contact|உதவி|தொடர்பு/.test(value)) return "support";
  if (/book|booking|டிக்கெட்|முன்பதிவு|எப்படி/.test(value)) return "book";
  return "unknown";
}

function BookingCopilot({
  currentPage,
  isAuthenticated,
  userRole,
  busCount,
  confirmedTicket,
  onNavigate,
  onOpenBookings,
  onDownloadConfirmedTicket,
}) {
  const [language, setLanguage] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(() => [
    { id: 1, role: "assistant", text: COPY.en.welcome },
  ]);
  const messageEndRef = useRef(null);
  const copy = COPY[language];

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages, isOpen, isMinimized]);

  const appendMessage = (role, text) => {
    setMessages((previous) => [...previous, { id: Date.now() + Math.random(), role, text }]);
  };

  const addReply = (text) => appendMessage("assistant", text);

  const getBookingStep = () => {
    if (!isAuthenticated) return copy.answers.login;
    if (userRole && userRole !== "customer") return copy.answers.role;
    if (currentPage === "seats") return copy.answers.bookSeats;
    if (currentPage === "passenger") return copy.answers.bookPassenger;
    if (currentPage === "payment") return copy.answers.bookPayment;
    if (currentPage === "confirmation" && confirmedTicket) return copy.answers.bookConfirmation;
    if (currentPage === "bookings") return copy.answers.bookBookings;
    if (busCount > 0) return copy.answers.bookResults.replace("{count}", busCount);
    if (currentPage === "search") return copy.answers.book;
    return copy.answers.bookOther;
  };

  const handleAction = async (action, visibleLabel) => {
    appendMessage("user", visibleLabel);

    if (action === "support") {
      addReply(copy.answers.support);
      return;
    }
    if (action === "unknown") {
      addReply(isAuthenticated ? copy.answers.unknown : copy.answers.guest);
      return;
    }
    if (action === "book") {
      if (isAuthenticated && userRole && userRole !== "customer") {
        addReply(copy.answers.role);
        return;
      }
      const target = currentPage === "seats" ? "seats" : currentPage === "passenger" ? "passenger" : currentPage === "payment" ? "payment" : currentPage === "confirmation" ? "confirmation" : currentPage === "search" && busCount > 0 ? "results" : "search";
      if (isAuthenticated) await onNavigate(target);
      addReply(getBookingStep());
      return;
    }
    if (!isAuthenticated) {
      if (action === "pay") {
        addReply(`${copy.answers.login} ${copy.answers.pay}`);
        return;
      }
      await onNavigate("login");
      addReply(action === "seats" ? `${copy.answers.login} ${copy.answers.seats}` : copy.answers.login);
      return;
    }
    if (userRole && userRole !== "customer") {
      addReply(copy.answers.role);
      return;
    }

    if (action === "find") {
      await onNavigate("search");
      addReply(copy.answers.find);
      return;
    }
    if (action === "seats") {
      const result = await onNavigate("seats");
      addReply(result === "seat-map" ? copy.answers.seats : result === "locked" ? copy.answers.seatsLocked : result === "unavailable" ? copy.answers.unavailable : copy.answers.seatsSearch);
      return;
    }
    if (action === "pay") {
      const result = await onNavigate("pay");
      addReply(result === "payment" ? copy.answers.payReady : result === "passenger" ? copy.answers.payPassenger : copy.answers.pay);
      return;
    }
    if (action === "download") {
      if (currentPage === "confirmation" && confirmedTicket) {
        onDownloadConfirmedTicket();
        addReply(copy.answers.download);
      } else {
        const opened = await onOpenBookings();
        addReply(opened ? copy.answers.downloadBookings : copy.answers.unavailable);
      }
      return;
    }
    if (action === "bookings" || action === "cancel") {
      const opened = await onOpenBookings();
      addReply(!opened ? copy.answers.unavailable : action === "cancel" ? copy.answers.cancel : copy.answers.bookings);
    }
  };

  const submitQuestion = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    if (isCredentialText(text)) {
      addReply(copy.answers.secret);
      return;
    }
    const intent = detectIntent(text);
    await handleAction(intent, text);
  };

  const resetChat = () => {
    setMessages([{ id: Date.now(), role: "assistant", text: copy.welcome }]);
    setDraft("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] font-sans sm:bottom-6 sm:right-6">
      {!isOpen ? (
        <button
          type="button"
          aria-label={copy.open}
          title={copy.open}
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-xl transition hover:bg-blue-800 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.8">
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-5.5 4v-4A2.5 2.5 0 0 1 4 13.5z" strokeLinejoin="round" />
            <path d="M8 8h8M8 11.5h5" strokeLinecap="round" />
          </svg>
        </button>
      ) : isMinimized ? (
        <div className="flex w-[min(22rem,calc(100vw-2rem))] items-center justify-between rounded-xl bg-blue-700 px-4 py-3 text-white shadow-xl">
          <span className="text-sm font-semibold">{copy.minimized}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsMinimized(false)} aria-label={copy.maximize} className="rounded-md px-3 py-1 text-sm font-semibold hover:bg-blue-600">{copy.maximize}</button>
            <button type="button" onClick={() => setIsOpen(false)} aria-label={copy.close} className="rounded-md px-2 py-1 text-lg leading-none hover:bg-blue-600">×</button>
          </div>
        </div>
      ) : (
        <section aria-label={copy.title} className="flex h-[min(42rem,calc(100dvh-2rem))] w-[min(25rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl max-sm:fixed max-sm:inset-x-3 max-sm:bottom-3 max-sm:h-[min(40rem,calc(100dvh-1.5rem))] max-sm:w-auto">
          <header className="flex items-start justify-between gap-3 bg-blue-700 px-4 py-3 text-white">
            <div>
              <h2 className="font-semibold">{copy.title}</h2>
              <p className="mt-0.5 text-xs text-blue-100">{copy.subtitle}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <label className="sr-only" htmlFor="busgo-copilot-language">{copy.language}</label>
              <select id="busgo-copilot-language" value={language} onChange={(event) => setLanguage(event.target.value)} className="max-w-20 rounded-md border-0 bg-blue-600 px-2 py-1.5 text-xs text-white outline-none focus:ring-2 focus:ring-white">
                <option value="en" className="text-slate-900">English</option>
                <option value="ta" className="text-slate-900">தமிழ்</option>
              </select>
              <button type="button" onClick={resetChat} aria-label={copy.reset} title={copy.reset} className="rounded-md px-2 py-1.5 text-xs hover:bg-blue-600">↻</button>
              <button type="button" onClick={() => setIsMinimized(true)} aria-label={copy.minimize} title={copy.minimize} className="rounded-md px-2 py-1 text-lg leading-none hover:bg-blue-600">−</button>
              <button type="button" onClick={() => setIsOpen(false)} aria-label={copy.close} title={copy.close} className="rounded-md px-2 py-1 text-lg leading-none hover:bg-blue-600">×</button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-3 py-4" aria-live="polite" aria-relevant="additions text">
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <p className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${message.role === "user" ? "rounded-br-sm bg-blue-700 text-white" : "rounded-bl-sm border border-slate-200 bg-white text-slate-800 shadow-sm"}`}>
                    {message.text}
                  </p>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white px-3 py-3">
            <div className="mb-3 grid grid-cols-2 gap-2">
              {copy.actions.map(([id, label]) => (
                <button key={id} type="button" onClick={() => handleAction(id, label)} className="min-h-9 rounded-lg border border-blue-100 bg-blue-50 px-2 py-1.5 text-left text-xs font-medium leading-snug text-blue-800 transition hover:border-blue-300 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500">
                  {label}
                </button>
              ))}
            </div>
            <form onSubmit={submitQuestion} className="flex gap-2">
              <label htmlFor="busgo-copilot-message" className="sr-only">{copy.placeholder}</label>
              <input id="busgo-copilot-message" type="text" maxLength={400} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={copy.placeholder} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
              <button type="submit" disabled={!draft.trim()} className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">{copy.send}</button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}

export default BookingCopilot;
