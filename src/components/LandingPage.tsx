import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { 
  Link2, Contact, Wifi, CreditCard, Type, Mail, ChevronDown, 
  Download, Shield, Zap, LayoutGrid, Star, Smartphone, ImageIcon,
  CheckCircle, Globe, Briefcase, FileText, Heart, MapPin, 
  MessageCircle, Camera, Check, Sun, Moon, Menu, X, ArrowRight,
  ShieldCheck, LayoutTemplate, Copy, Plus, User, Search
} from 'lucide-react';

// --- Assets / Mock Data ---

const TOOLS_TABS = [
  { id: 'url', label: 'URL', icon: Link2 },
  { id: 'vcard', label: 'vCard', icon: Contact },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'upi', label: 'UPI', icon: CreditCard },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'email', label: 'Email', icon: Mail },
];

const TEMPLATE_FILTERS = ['All', 'Poster', 'Sticker', 'Frame', 'vCard', 'Menu'];

const TEMPLATES = [
  { id: 'payment', name: 'SCAN & PAY', style: 'bg-gradient-to-br from-slate-900 to-slate-800 text-white', label: 'Payment', qrColor: '#000000' },
  { id: 'grand', name: 'Grand Opening', style: 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white', label: 'Event', qrColor: '#4f46e5' },
  { id: 'coffee', name: 'Coffee Shop', style: 'bg-gradient-to-br from-amber-800 to-amber-950 text-orange-50', label: 'Restaurant', qrColor: '#78350f' },
  { id: 'wifi', name: 'Free WiFi', style: 'bg-gradient-to-br from-blue-900 to-slate-900 text-white', label: 'Venue', qrColor: '#1e3a8a' },
  { id: 'review', name: 'Google Review', style: 'bg-white border border-slate-200 text-slate-800', label: 'Business', qrColor: '#0f172a' },
];

const POPULAR_TOOLS = [
  { name: 'URL', label: 'QR Code', icon: Link2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { name: 'vCard', label: 'QR Code', icon: Contact, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { name: 'WiFi', label: 'QR Code', icon: Wifi, color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: 'UPI', label: 'QR Code', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { name: 'Google Review', label: 'QR Code', icon: Star, color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: 'WhatsApp', label: 'QR Code', icon: MessageCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { name: 'Instagram', label: 'QR Code', icon: Camera, color: 'text-rose-500', bg: 'bg-rose-50' },
  { name: 'Menu', label: 'QR Code', icon: LayoutGrid, color: 'text-orange-500', bg: 'bg-orange-50' },
  { name: 'PDF', label: 'QR Code', icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
  { name: 'Event', label: 'QR Code', icon: Star, color: 'text-blue-500', bg: 'bg-blue-50' },
];

const UNIQUE_TOOLS = [
  { id: 'rsvp', title: 'RSVP', subtitle: 'QR Code', isNew: true, bg: 'bg-purple-100', text: 'text-purple-800', icon: Heart },
  { id: 'airbnb', title: 'airbnb', subtitle: 'QR Code', isNew: true, bg: 'bg-rose-100', text: 'text-rose-600', icon: Globe },
  { id: 'sakura', title: 'SAKURA', subtitle: 'QR Code', isNew: true, bg: 'bg-pink-100', text: 'text-pink-600', icon: Star },
  { id: 'pet', title: 'PET ID TAG', subtitle: 'QR Code', isNew: true, bg: 'bg-amber-100', text: 'text-amber-700', icon: Shield },
  { id: 'minimal', title: 'Minimal', subtitle: 'QR Code', isNew: false, bg: 'bg-slate-100', text: 'text-slate-800', icon: LayoutGrid },
  { id: 'corporate', title: 'Corporate', subtitle: 'QR Code', isNew: false, bg: 'bg-blue-100', text: 'text-blue-800', icon: Briefcase },
  { id: 'realestate', title: 'Real Estate', subtitle: 'QR Code', isNew: false, bg: 'bg-emerald-100', text: 'text-emerald-800', icon: MapPin },
  { id: 'restaurant', title: 'Restaurant', subtitle: 'QR Code', isNew: false, bg: 'bg-orange-100', text: 'text-orange-800', icon: FileText },
];

const CATEGORY_TOOLS = {
  'Popular': [
    { name: 'URL', icon: Link2 },
    { name: 'vCard', icon: Contact },
    { name: 'WiFi', icon: Wifi },
    { name: 'UPI', icon: CreditCard },
  ],
  'Utilities': [
    { name: 'Text', icon: Type },
    { name: 'Email', icon: Mail },
    { name: 'PDF', icon: FileText },
    { name: 'WhatsApp', icon: MessageCircle },
  ],
  'Art & Creative': [
    { name: 'Sakura Floral', icon: Star },
    { name: 'Calligraphy', icon: Type },
    { name: 'Fractal Matrix', icon: LayoutGrid },
    { name: 'Torii Gate Frame', icon: ImageIcon },
  ],
  'Business': [
    { name: 'Google Review', icon: Star },
    { name: 'Menu', icon: LayoutGrid },
    { name: 'Corporate vCard', icon: Briefcase },
    { name: 'Etsy Packaging', icon: LayoutTemplate },
  ],
  'Healthcare': [
    { name: 'Medical ID', icon: Shield },
    { name: 'Emergency Contact', icon: Contact },
  ],
  'Events': [
    { name: 'Wedding RSVP', icon: Heart },
    { name: 'Ticket Registration', icon: Star },
  ]
};

const MASTER_17_CATEGORIES = [
  {
    category: "Payments & Financial",
    tools: [
      "Binance Coin (BNB) Address",
      "Charity / Donation Page",
      "Custom Crypto Wallet (Public Keys)",
      "Parking Spot Payment",
      "Rent Payment Portal",
      "Solana (SOL) Address",
      "Temple Donation (Digital Hundi)",
      "UPI Styled Code (with Amount)",
      "USDT Tether Address (Stablecoin)"
    ]
  },
  {
    category: "Contact & Networking",
    tools: [
      "Brand DNA Auto-Match Engine",
      "Hotel Concierge Contact",
      "InstantCard Contact Sharing",
      "Matrimony Profile / Biodata",
      "Portfolio / GitHub / Behance",
      "Real Estate Agent Contact (vCard)",
      "Resume / CV Link"
    ]
  },
  {
    category: "Food & Dining",
    tools: [
      "Dietary Restrictions / Allergy Alerts",
      "Digital Online Menu (Contactless)",
      "Food Delivery App (Zomato/Swiggy)",
      "Free PDF Menu Generator",
      "FSSAI Food License Label",
      "PDF Menu Generator",
      "Recipe Link (Cooking Instructions)",
      "Restaurant Allergen Chart (FSSAI)",
      "Table Ordering Link (Self-Checkout)",
      "Waiter Calling / Service Button"
    ]
  },
  {
    category: "WiFi & Internet Access",
    tools: [
      "Guest Network WiFi (Office Visitors)",
      "Home WiFi (Room QR)",
      "Hotel Room WiFi",
      "Hotel Secure Room WiFi",
      "Secure WiFi Share (Auto-Expiry)"
    ]
  },
  {
    category: "Healthcare & Medical",
    tools: [
      "Blood Donor Contact (Emergency)",
      "COVID / Vax Certificate",
      "First Aid Instructions PDF",
      "Hospital Appointment Link",
      "Medical ID / Allergy Badge (Emergency)",
      "Medical ID Emergency Info (First Responders)",
      "Medicine Dosage Alert / Medication Timer",
      "Pharmacy Prescription Upload",
      "Wheelchair / Disability Access Info"
    ]
  },
  {
    category: "Social Media & Entertainment",
    tools: [
      "Book Review / Goodreads",
      "K-Pop Fan Card / Collectible",
      "Music Band Album Launch (Streaming)",
      "Podcast Episode Link (Spotify/Apple)",
      "Study Group Link Drops (WhatsApp/Discord)"
    ]
  },
  {
    category: "Real Estate & Property",
    tools: [
      "Open House Registration",
      "Property Brochure PDF",
      "Street Address / Maps (Delivery)",
      "Virtual Property Tour (360° Video)"
    ]
  },
  {
    category: "Automotive & Vehicles",
    tools: [
      "Car Dealership Test Drive",
      "Emergency Roadside Assist (Towing SOS)",
      "Used Car Listing Link (Buyer Specs)",
      "Vehicle Service Record (Maintenance)"
    ]
  },
  {
    category: "Education & Academia",
    tools: [
      "Classroom Attendance Form",
      "Exam / Quiz Link (Test Portals)",
      "Historical Monument Walk (Tourism)",
      "Molecule Structure 3D (Chemistry)",
      "Online Exam / Quiz Link",
      "Periodic Table Elements Set",
      "Scientific Constants Reference Card",
      "Student ID Verification",
      "Syllabus / Study Material PDF"
    ]
  },
  {
    category: "Events & Celebrations",
    tools: [
      "Baby Birth Announcement",
      "Event Itinerary / Schedule",
      "Event Photo Gallery Link",
      "Event Ticket Registration",
      "Memorial / Gravestone (Obituary)",
      "Time Capsule Memory",
      "Webinar Registration (Zoom Access)",
      "Wedding RSVP Form"
    ]
  },
  {
    category: "Security & Privacy",
    tools: [
      "2FA Authenticator Backup (Seed Strings)",
      "Aadhaar-Safe ID (Masked, Offline KYC)",
      "Encrypted Message (Cipher Payload)",
      "Product Authenticity Anti-Counterfeit",
      "Secure Password (Local Storage)"
    ]
  },
  {
    category: "Safety & Emergency",
    tools: [
      "Child Safety / Luggage Tag (Lost Transit)",
      "Child Safety Wristband (Parents Contact)",
      "Pet ID Collar Tag (Lost Dog)",
      "Pet Tag / Lost Pet (Smart Collars)"
    ]
  },
  {
    category: "Creative & Artistic",
    tools: [
      "Alphabet Letter-Shaped QR (A-Z)",
      "Arabic Calligraphy Stroke (Islamic Design)",
      "Circuit Board / PCB Trace",
      "Crescent Moon & Star Eye (Holiday)",
      "Festival / Holiday Theme Packs",
      "Islamic Geometric Tile (Mosaic)",
      "Mandelbrot Fractal Matrix",
      "Mathematical Fibonacci Spiral",
      "Number / Jersey Custom (0-9)",
      "Sakura Cherry Blossom (Floral)",
      "Sierpinski Triangle",
      "Sumi-e Ink Brush Stroke",
      "Torii Gate Frame (Japanese)",
      "Vinyl Record Circular",
      "Waveform Audio-Visualizer"
    ]
  },
  {
    category: "Personal & Lifestyle",
    tools: [
      "Gym / Fitness App Check-In",
      "Secret Message / Love Note",
      "Smart Home Device Setup"
    ]
  },
  {
    category: "Business & Professional",
    tools: [
      "Chemical Safety SDS Labels (OSHA)",
      "Handmade Product Packaging (Etsy)"
    ]
  },
  {
    category: "Travel & Hospitality",
    tools: [
      "Airbnb Host Welcome Guide",
      "Airbnb Welcome Guide (Vacation Rentals)"
    ]
  },
  {
    category: "Agriculture",
    tools: [
      "Seed Authenticity (Agriculture)"
    ]
  }
];

const CATEGORIES = ['Popular', 'Utilities', 'Art & Creative', 'Business', 'Healthcare', 'Events'];

export default function LandingPage({ 
  onEnter,
}: { 
  onEnter: (toolId?: string, searchStr?: string, categoryName?: string) => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('url');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeTemplate, setActiveTemplate] = useState('sakura');
  const [inputValue, setInputValue] = useState('');
  const [activeCategoryModal, setActiveCategoryModal] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const qrRef = useRef<HTMLDivElement>(null);
  const liveQR = useRef<any>(null);

  useEffect(() => {
    if (qrRef.current && !liveQR.current) {
      liveQR.current = new QRCodeStyling({
        width: 140, height: 140, type: 'svg',
        data: 'https://a2zqr.com',
        dotsOptions: { type: 'rounded', color: '#e11d48' },
        cornersSquareOptions: { type: 'extra-rounded', color: '#e11d48' },
        cornersDotOptions: { type: 'dot', color: '#e11d48' },
        backgroundOptions: { color: 'transparent' },
        qrOptions: { errorCorrectionLevel: 'H' }
      });
      liveQR.current.append(qrRef.current);
    }
  }, []);

  useEffect(() => {
    if (!liveQR.current) return;
    liveQR.current.update({
      data: inputValue || 'https://a2zqr.com'
    });
  }, [inputValue]);

  const handleDownload = () => {
    if (!liveQR.current) return;
    liveQR.current.download({ name: 'a2zqr-code', extension: 'png' });
  };

  const getPlaceholder = () => {
    const map: any = { url:'https://your-link-here.com', upi:'yourname@upi', wifi:'Network name', vcard:'Your name', text:'Type your message', email:'name@example.com' };
    return map[activeTab] || 'https://your-link-here.com';
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden selection:bg-blue-500 selection:text-white pb-24 lg:pb-0">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onEnter()}>
            <div className="font-bold text-2xl tracking-tight text-slate-900 flex items-center gap-1">
               <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm">
                 A2Z
               </span>
               QR
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <button onClick={() => setActiveCategoryModal('Popular')} className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
              Popular
            </button>
            <button onClick={() => setActiveCategoryModal('Utilities')} className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
              Utilities
            </button>
            <button onClick={() => setActiveCategoryModal('Art & Creative')} className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
              Art
            </button>
            <button onClick={() => onEnter()} className="flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
              Templates <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            <button className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">How It Works</button>
            <button className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">Pricing</button>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
              <Sun className="w-5 h-5" />
            </button>
            <button onClick={() => onEnter()} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
              Login
            </button>
            <button onClick={() => onEnter()} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
              Create QR Free
            </button>
          </div>

          <button className="lg:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-20 px-6 lg:hidden flex flex-col overflow-y-auto pb-24">
           {/* Categories Section */}
           <div className="mb-6">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Categories</h3>
             <div className="flex flex-col gap-4">
               {['Popular', 'Utilities', 'Art & Creative'].map(cat => (
                 <button 
                   key={cat}
                   onClick={() => { setMobileMenuOpen(false); setActiveCategoryModal(cat); }} 
                   className="text-lg font-semibold text-slate-900 text-left flex justify-between items-center"
                 >
                   {cat}
                   <ArrowRight className="w-4 h-4 text-slate-300" />
                 </button>
               ))}
             </div>
           </div>

           <hr className="border-slate-100 my-2" />

           {/* Core Links */}
           <div className="flex flex-col gap-4 my-4">
             <button onClick={() => { setMobileMenuOpen(false); onEnter(); }} className="text-lg font-semibold text-slate-900 text-left">Templates</button>
             <button onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-slate-900 text-left">How It Works</button>
             <button onClick={() => setMobileMenuOpen(false)} className="text-lg font-semibold text-slate-900 text-left">Pricing</button>
           </div>

           <div className="mt-6 flex flex-col gap-4">
             <button onClick={() => { setMobileMenuOpen(false); onEnter(); }} className="w-full px-5 py-3 rounded-xl bg-slate-100 text-slate-900 font-semibold">Login</button>
             <button onClick={() => { setMobileMenuOpen(false); onEnter(); }} className="w-full px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20">Create QR Free</button>
           </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="pt-28 pb-16 px-4 md:px-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20 items-center">
          
          {/* Left: Copy */}
          <div className="w-full lg:w-[45%] text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-6">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              #1 QR Code Design Platform
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Create Beautiful <br className="hidden lg:block" />
              QR Codes & Templates <br className="hidden lg:block" />
              in <span className="text-blue-600">30 Seconds</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-lg mx-auto lg:mx-0">
              QR posters, stickers, frames, templates and more. 100% free to get started.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-y-6 gap-x-8">
              <div className="flex flex-col items-center lg:items-start gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 text-center">No Sign Up</span>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 text-center">High Quality</span>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Copy className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 text-center">Unlimited</span>
              </div>
              <div className="flex flex-col items-center lg:items-start gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 text-center">100% Free</span>
              </div>
            </div>
          </div>

          {/* Right: Studio Builder */}
          <div className="w-full lg:w-[55%]">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col md:flex-row">
              
              {/* Studio Controls */}
              <div className="flex-1 p-6 md:border-r border-slate-100 flex flex-col gap-8">
                
                {/* Tabs */}
                <div>
                  <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
                    {TOOLS_TABS.map((tab) => (
                      <button 
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setInputValue('');
                        }}
                        className={`flex flex-col items-center justify-center min-w-[70px] py-2.5 rounded-xl transition-all ${
                          activeTab === tab.id ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-500 hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <tab.icon className="w-5 h-5 mb-1.5" />
                        <span className="text-[11px] font-semibold">{tab.label}</span>
                      </button>
                    ))}
                    <button className="flex flex-col items-center justify-center min-w-[70px] py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 border border-transparent">
                      <LayoutGrid className="w-5 h-5 mb-1.5" />
                      <span className="text-[11px] font-semibold">More</span>
                    </button>
                  </div>
                </div>

                {/* Step 1 */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">1. Enter {TOOLS_TABS.find(t=>t.id===activeTab)?.label || 'URL'}</h3>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={getPlaceholder()}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm font-medium"
                    />
                    {React.createElement(TOOLS_TABS.find(t=>t.id===activeTab)?.icon || Link2, { className: "w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" })}
                  </div>
                </div>

                {/* Step 2 */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">2. Choose Template</h3>
                  <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-1">
                    {TEMPLATE_FILTERS.map(f => (
                      <button 
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                          activeFilter === f ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                    <button className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 flex items-center gap-1">
                      More <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                    {TEMPLATES.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => {
                           setActiveTemplate(t.id);
                           if (liveQR.current) {
                              liveQR.current.update({
                                dotsOptions: { color: t.qrColor },
                                cornersSquareOptions: { color: t.qrColor },
                                cornersDotOptions: { color: t.qrColor },
                              });
                           }
                        }}
                        className={`shrink-0 w-20 aspect-[3/4] rounded-xl cursor-pointer border-2 transition-all overflow-hidden ${
                          activeTemplate === t.id ? 'border-blue-600 shadow-md shadow-blue-600/20 scale-[1.02]' : 'border-transparent hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-full h-full ${t.style} p-2 flex flex-col items-center justify-between`}>
                          <span className="text-[7px] font-bold uppercase tracking-wider text-center opacity-90">{t.name}</span>
                          <div className="w-8 h-8 bg-white/90 rounded p-1 flex items-center justify-center">
                             {/* Mock QR dots */}
                             <div className="w-full h-full border border-black/10 rounded-sm"></div>
                          </div>
                          <span className="text-[6px] font-semibold opacity-70">{t.label}</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Extra template placeholder for "More" visual */}
                    <div className="shrink-0 w-8 flex items-center justify-center cursor-pointer opacity-50 hover:opacity-100">
                       <ChevronDown className="w-5 h-5 -rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-900">3. Customize (Optional)</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#1e293b'].map(c => (
                        <button key={c} className="w-7 h-7 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200" style={{backgroundColor: c}}></button>
                      ))}
                      <button className="w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-100">
                        <Plus className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <button className="text-xs font-semibold text-slate-500 flex items-center gap-1 hover:text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      More <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Live Preview Panel */}
              <div className="w-full md:w-[320px] bg-slate-50 p-6 flex flex-col border-t md:border-t-0 md:border-l border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-slate-900">Live Preview</h3>
                </div>

                <div className="flex-1 flex items-center justify-center mb-6">
                  {/* Dynamic Poster Mockup - Changes based on template */}
                  {activeTemplate === 'sakura' || activeTemplate === 'grand' || activeTemplate === 'payment' ? (
                     <div className={`w-full max-w-[220px] aspect-[3/4] rounded-2xl shadow-xl border flex flex-col items-center justify-center p-6 relative overflow-hidden ${
                       activeTemplate === 'sakura' ? 'bg-pink-50 border-pink-100 shadow-pink-900/10' : 
                       activeTemplate === 'payment' ? 'bg-slate-900 border-slate-800 shadow-slate-900/20' :
                       'bg-indigo-600 border-indigo-500 shadow-indigo-900/20'
                     }`}>
                       {activeTemplate === 'sakura' && (
                          <>
                           <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at top right, #fbcfe8, transparent 70%)' }}></div>
                           <h4 className="text-xl font-bold text-pink-600 mb-1 z-10 tracking-tight">SAKURA</h4>
                           <p className="text-[10px] font-semibold text-pink-500 mb-4 z-10">Scan to Connect</p>
                          </>
                       )}
                       {activeTemplate === 'payment' && (
                          <>
                           <h4 className="text-xl font-bold text-white mb-1 z-10 tracking-tight">SCAN & PAY</h4>
                           <p className="text-[10px] font-semibold text-slate-400 mb-4 z-10">Fast • Secure • Easy</p>
                          </>
                       )}
                       {activeTemplate === 'grand' && (
                          <>
                           <h4 className="text-xl font-bold text-white mb-1 z-10 tracking-tight text-center">GRAND<br/>OPENING</h4>
                           <p className="text-[10px] font-semibold text-indigo-200 mb-4 z-10">Scan for Details</p>
                          </>
                       )}
                       
                       <div className="bg-white p-3 rounded-xl shadow-sm z-10">
                         <div ref={qrRef} className="w-[140px] h-[140px]"></div>
                       </div>
                       
                       <button className={`mt-6 px-6 py-1.5 text-[10px] font-bold rounded-full z-10 tracking-wider ${
                          activeTemplate === 'sakura' ? 'bg-pink-500 text-white' : 
                          activeTemplate === 'payment' ? 'bg-white/10 text-white' :
                          'bg-white text-indigo-600'
                       }`}>
                         {activeTemplate === 'payment' ? 'ALL UPI ACCEPTED' : 'SCAN ME'}
                       </button>
                     </div>
                  ) : (
                     <div className="w-full max-w-[220px] aspect-[3/4] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 flex flex-col items-center justify-center p-6 relative">
                       <h4 className="text-lg font-bold text-slate-800 mb-1 z-10 tracking-tight text-center uppercase">{TEMPLATES.find(t=>t.id===activeTemplate)?.name || 'TEMPLATE'}</h4>
                       <div className="bg-white p-3 rounded-xl border border-slate-100 z-10 my-4">
                         {/* We re-parent the QR code here when switching, but since qrRef is fixed we just render a placeholder for others to keep it simple in this mock */}
                         <div className="w-[120px] h-[120px] bg-slate-100 rounded flex items-center justify-center border border-slate-200">
                            <span className="text-xs text-slate-400 font-semibold text-center">Preview<br/>Placeholder</span>
                         </div>
                       </div>
                     </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                  <button 
                    onClick={handleDownload}
                    className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download PNG
                  </button>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => onEnter()}
                      className="flex-1 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                      Download PDF
                    </button>
                    <button 
                      onClick={() => onEnter()}
                      className="flex-1 py-3 rounded-xl bg-white border border-amber-200 text-amber-700 font-bold text-sm hover:bg-amber-50 transition-colors flex items-center justify-center gap-1.5"
                    >
                      Customize <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS ROW */}
      <section className="border-y border-slate-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-6 md:py-8 flex flex-wrap items-center justify-between gap-6 md:gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><Zap className="w-5 h-5 text-slate-600"/></div>
            <div>
              <div className="font-bold text-slate-900 leading-tight text-sm">2M+</div>
              <div className="text-xs text-slate-500 font-medium">QR Codes Generated</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><LayoutTemplate className="w-5 h-5 text-slate-600"/></div>
            <div>
              <div className="font-bold text-slate-900 leading-tight text-sm">10,000+</div>
              <div className="text-xs text-slate-500 font-medium">Premium Templates</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><Smartphone className="w-5 h-5 text-slate-600"/></div>
            <div>
              <div className="font-bold text-slate-900 leading-tight text-sm">Works on</div>
              <div className="text-xs text-slate-500 font-medium">All Devices</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><Shield className="w-5 h-5 text-slate-600"/></div>
            <div>
              <div className="font-bold text-slate-900 leading-tight text-sm">Privacy First</div>
              <div className="text-xs text-slate-500 font-medium">No Data Stored</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><Zap className="w-5 h-5 text-slate-600"/></div>
            <div>
              <div className="font-bold text-slate-900 leading-tight text-sm">Super Fast</div>
              <div className="text-xs text-slate-500 font-medium">Create in 30 Seconds</div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR TOOLS */}
      <section className="py-20 px-6 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Popular QR Code Tools</h2>
          <button onClick={() => onEnter()} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all tools <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          {POPULAR_TOOLS.map((tool, idx) => (
            <button 
              key={idx} 
              onClick={() => onEnter()}
              className="flex-1 min-w-[130px] p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-slate-900 leading-tight">{tool.name}</div>
                <div className="text-[11px] font-semibold text-slate-500">{tool.label}</div>
              </div>
            </button>
          ))}
          <button onClick={() => onEnter()} className="flex-1 min-w-[130px] p-4 rounded-2xl bg-slate-50 border border-slate-200 border-dashed hover:bg-slate-100 hover:border-slate-300 transition-all flex flex-col items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center">
               <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>
          </button>
        </div>
      </section>

      {/* UNIQUE & TRENDING TOOLS */}
      <section className="pb-24 px-6 max-w-[1400px] mx-auto">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Unique & Exclusive Tools</h2>
          <button onClick={() => onEnter()} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {UNIQUE_TOOLS.map((tool, idx) => (
            <div 
              key={idx} 
              onClick={() => onEnter()}
              className="group cursor-pointer flex flex-col items-center text-center"
            >
              <div className={`w-full aspect-[4/5] rounded-2xl ${tool.bg} flex flex-col items-center justify-center p-4 relative overflow-hidden transition-transform group-hover:-translate-y-1 shadow-sm mb-3`}>
                {/* Decorative mock element */}
                <tool.icon className={`w-12 h-12 ${tool.text} opacity-80 mb-2`} />
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm p-1.5 flex flex-col items-center justify-center">
                   {/* tiny qr mock */}
                   <div className="w-full h-full border-2 border-black/80 rounded-sm"></div>
                </div>
              </div>
              <div className="text-xs font-bold text-slate-900 leading-tight uppercase">{tool.title}</div>
              {tool.isNew ? (
                 <div className="mt-1 px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[9px] font-bold tracking-wider">NEW</div>
              ) : (
                 <div className="mt-1 text-[10px] font-semibold text-slate-500">QR Code</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 17 CATEGORIES */}
      <section className="py-12 lg:py-16 px-6 max-w-[1400px] mx-auto border-t border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
           <h2 className="text-2xl font-bold text-slate-900">Categories</h2>
           <div className="relative w-full md:w-72">
             <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
             <input type="text" placeholder="Search categories & tools..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
           </div>
        </div>

        <div className="flex flex-col gap-4">
          {MASTER_17_CATEGORIES.map(category => (
            <div key={category.category} className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-sm">
              <button 
                onClick={() => setExpandedCategory(expandedCategory === category.category ? null : category.category)}
                className="flex justify-between items-center w-full px-6 py-5 text-left hover:bg-slate-50 transition-colors focus:outline-none"
              >
                <h3 className="text-lg font-bold text-slate-900">{category.category}</h3>
                <div className={`p-2 rounded-full transition-transform duration-300 ${expandedCategory === category.category ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-slate-100 text-slate-600'}`}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>
              {expandedCategory === category.category && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4 animate-in fade-in duration-300">
                    {category.tools.map(tool => (
                      <button 
                        key={tool}
                        onClick={() => onEnter(tool)}
                        className="text-left px-4 py-3 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md hover:text-blue-600 transition-all text-sm font-semibold text-slate-700 flex items-center justify-between group"
                      >
                        <span className="truncate pr-2">{tool}</span>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY OVERLAY MODAL */}
      {activeCategoryModal && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end lg:justify-center lg:items-center">
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={() => setActiveCategoryModal(null)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-full lg:w-[600px] bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl p-6 lg:p-8 animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900">{activeCategoryModal}</h3>
              <button 
                onClick={() => setActiveCategoryModal(null)}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto max-h-[60vh] pb-4 hide-scrollbar">
              {CATEGORY_TOOLS[activeCategoryModal as keyof typeof CATEGORY_TOOLS]?.map((tool, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setActiveCategoryModal(null); onEnter(tool.name); }}
                  className="flex flex-col items-center text-center p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white text-slate-700 shadow-sm border border-slate-100 flex items-center justify-center mb-3 group-hover:text-blue-600 group-hover:scale-110 transition-transform">
                    <tool.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 leading-tight">{tool.name}</span>
                </button>
              )) || (
                <div className="col-span-full py-12 text-center text-slate-500 font-medium">
                  More tools coming soon...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-50 py-12 px-6 border-t border-slate-200 mt-20">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-1">
               <span className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-[10px]">
                 A2Z
               </span>
               QR
            </div>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
               Loved by thousands <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> user reviews
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button className="hover:text-blue-600 transition-colors">Privacy Policy</button>
            <button className="hover:text-blue-600 transition-colors">Terms of Service</button>
            <button className="hover:text-blue-600 transition-colors">Contact</button>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Minimal stub for Scan icon as it was missing from lucide-react import
function Scan(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
      <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
      <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
    </svg>
  );
}
