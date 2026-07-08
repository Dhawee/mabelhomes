import { Property, Testimonial, FAQ, Service } from "@/types";

export const SITE = {
  name: "Aluko Olajumoke O.",
  title: "Real Estate Broker & Consultant",
  company: "Mabel Homes & Investment",
  phone: ["+234 904 424 2443", "+234 706 371 1532"],
  email: "olajumoke@mabelhomes.org",
  website: "www.mabelhomes.org",
  whatsapp: "2347063711532",
  address: "Lagos, Nigeria",
  social: {
    instagram: "https://instagram.com/mabelhomes",
    facebook: "https://facebook.com/mabelhomes",
    linkedin: "https://linkedin.com/company/mabelhomes",
    twitter: "https://twitter.com/mabelhomes",
  },
};

export const STATS = [
  { label: "Properties Sold", value: 150, suffix: "+" },
  { label: "Clients Served", value: 300, suffix: "+" },
  { label: "Years Experience", value: 12, suffix: "+" },
  { label: "Investment Value", value: 5, suffix: "B+", prefix: "₦" },
];

export const PROPERTIES: Property[] = [
  {
    id: "1",
    slug: "luxury-penthouse-lekki",
    title: "Luxury Penthouse with Ocean Views",
    location: "Lekki Phase 1, Lagos",
    city: "Lagos",
    price: 450000000,
    bedrooms: 5,
    bathrooms: 6,
    sqft: 6500,
    status: "For Sale",
    type: "Apartment",
    featured: true,
    luxury: true,
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    ],
    description:
      "An exceptional penthouse offering panoramic ocean views, bespoke finishes, and world-class amenities in the heart of Lekki Phase 1. This residence represents the pinnacle of luxury living in Lagos.",
    features: [
      "Panoramic ocean views",
      "Private elevator access",
      "Smart home automation",
      "Italian marble flooring",
      "Chef's kitchen with premium appliances",
      "Master suite with walk-in closet",
    ],
    amenities: [
      "Swimming pool",
      "Gym & spa",
      "24/7 security",
      "Backup power",
      "Underground parking",
      "Concierge service",
    ],
    yearBuilt: 2023,
    parking: 3,
    coordinates: { lat: 6.4474, lng: 3.4723 },
  },
  {
    id: "2",
    slug: "modern-duplex-ikoyi",
    title: "Modern Architectural Duplex",
    location: "Ikoyi, Lagos",
    city: "Lagos",
    price: 280000000,
    bedrooms: 4,
    bathrooms: 5,
    sqft: 4800,
    status: "For Sale",
    type: "Duplex",
    featured: true,
    luxury: true,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
    ],
    description:
      "Stunning contemporary duplex featuring clean lines, expansive glass walls, and seamless indoor-outdoor living in one of Lagos's most prestigious neighborhoods.",
    features: [
      "Floor-to-ceiling windows",
      "Open-plan living",
      "Rooftop terrace",
      "Home cinema room",
      "Wine cellar",
      "Landscaped garden",
    ],
    amenities: [
      "Swimming pool",
      "Generator house",
      "Staff quarters",
      "CCTV surveillance",
      "Borehole water",
      "Intercom system",
    ],
    yearBuilt: 2022,
    parking: 4,
    coordinates: { lat: 6.4541, lng: 3.4316 },
  },
  {
    id: "3",
    slug: "executive-apartment-vi",
    title: "Executive Apartment Victoria Island",
    location: "Victoria Island, Lagos",
    city: "Lagos",
    price: 185000000,
    bedrooms: 3,
    bathrooms: 4,
    sqft: 3200,
    status: "For Sale",
    type: "Apartment",
    featured: true,
    luxury: false,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb4b0267?w=1200&q=80",
    ],
    description:
      "Sophisticated executive apartment in a prime Victoria Island location, perfect for professionals seeking convenience and luxury in the business district.",
    features: [
      "City skyline views",
      "Fully fitted kitchen",
      "En-suite bedrooms",
      "Balcony with lounge area",
      "Premium fixtures",
      "Dedicated storage",
    ],
    amenities: [
      "Gym",
      "Swimming pool",
      "24/7 security",
      "Elevator",
      "Backup power",
      "Parking garage",
    ],
    yearBuilt: 2021,
    parking: 2,
    coordinates: { lat: 6.4281, lng: 3.4219 },
  },
  {
    id: "4",
    slug: "waterfront-mansion-banana-island",
    title: "Waterfront Mansion Banana Island",
    location: "Banana Island, Lagos",
    city: "Lagos",
    price: 1200000000,
    bedrooms: 8,
    bathrooms: 10,
    sqft: 12000,
    status: "For Sale",
    type: "Mansion",
    featured: true,
    luxury: true,
    images: [
      "https://images.unsplash.com/photo-1613970087364-fd461e39a2b6?w=1200&q=80",
      "https://images.unsplash.com/photo-1605276374101-de79879283f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&q=80",
    ],
    description:
      "An extraordinary waterfront estate on Banana Island featuring private dock access, infinity pool, and unparalleled luxury across 12,000 square feet of living space.",
    features: [
      "Private dock & jetty",
      "Infinity edge pool",
      "Home automation system",
      "Private cinema",
      "Spa & wellness center",
      "Guest wing",
    ],
    amenities: [
      "Tennis court",
      "Helipad access",
      "Staff quarters (6 rooms)",
      "Backup power (500KVA)",
      "Water treatment plant",
      "Landscaped gardens",
    ],
    yearBuilt: 2024,
    parking: 8,
    coordinates: { lat: 6.4367, lng: 3.4056 },
  },
  {
    id: "5",
    slug: "terrace-home-lekki",
    title: "Premium Terrace Home",
    location: "Lekki Gardens, Lagos",
    city: "Lagos",
    price: 75000000,
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2400,
    status: "For Sale",
    type: "Terrace",
    featured: false,
    luxury: false,
    images: [
      "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
    ],
    description:
      "Beautifully designed terrace home in a gated community, offering modern living with excellent investment potential in the fast-growing Lekki corridor.",
    features: [
      "Modern open layout",
      "Fitted wardrobes",
      "POP ceiling",
      "Tiled flooring",
      "Water heater",
      "Pre-wired for AC",
    ],
    amenities: [
      "Gated community",
      "24/7 security",
      "Children's playground",
      "Good road network",
      "Proximity to schools",
      "Shopping centers nearby",
    ],
    yearBuilt: 2023,
    parking: 2,
    coordinates: { lat: 6.4698, lng: 3.5852 },
  },
  {
    id: "6",
    slug: "commercial-plaza-abuja",
    title: "Prime Commercial Plaza",
    location: "Central Business District, Abuja",
    city: "Abuja",
    price: 350000000,
    bedrooms: 0,
    bathrooms: 8,
    sqft: 15000,
    status: "For Sale",
    type: "Commercial",
    featured: false,
    luxury: true,
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    ],
    description:
      "Premium commercial plaza in Abuja's CBD with high rental yield potential, fully tenanted with established businesses.",
    features: [
      "12 office units",
      "Ground floor retail",
      "Elevator access",
      "Ample parking",
      "Conference facilities",
      "High-speed internet ready",
    ],
    amenities: [
      "24/7 security",
      "Fire suppression system",
      "Backup generator",
      "Water treatment",
      "CCTV coverage",
      "Reception area",
    ],
    yearBuilt: 2020,
    parking: 30,
    coordinates: { lat: 9.0765, lng: 7.3986 },
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Adewale & Funke Okonkwo",
    location: "Lekki, Lagos",
    rating: 5,
    review:
      "Olajumoke made our first home purchase seamless. Her knowledge of the Lagos market and attention to detail gave us complete confidence throughout the process.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80",
    service: "Home Purchase",
  },
  {
    id: "2",
    name: "Chidi Eze",
    location: "Victoria Island, Lagos",
    rating: 5,
    review:
      "As an investor, I needed someone who understood ROI and market trends. Olajumoke delivered exceptional advisory services and helped me acquire three premium properties.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    service: "Investment Advisory",
  },
  {
    id: "3",
    name: "Sarah Mitchell",
    location: "Ikoyi, Lagos",
    rating: 5,
    review:
      "Selling our property was handled with utmost professionalism. The marketing strategy and negotiation skills resulted in a sale above our asking price.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
    service: "Property Sales",
  },
  {
    id: "4",
    name: "Emeka & Ngozi Adeyemi",
    location: "Abuja",
    rating: 5,
    review:
      "From documentation to handover, every step was transparent and well-managed. We highly recommend Mabel Homes for anyone seeking trusted real estate services.",
    image: "https://images.unsplash.com/photo-1519081908949-4d7d0a747a64?w=200&q=80",
    service: "Full Service",
  },
];


export const FAQS: FAQ[] = [
  {
    id: "1",
    category: "Buying",
    question: "What documents do I need to buy property in Nigeria?",
    answer:
      "Essential documents include a valid ID, proof of funds, tax clearance certificate, and upon purchase: Certificate of Occupancy (C of O), Deed of Assignment, Survey Plan, and Governor's Consent. We guide you through every step.",
  },
  {
    id: "2",
    category: "Buying",
    question: "How long does the property purchase process take?",
    answer:
      "Typically 4-8 weeks for off-plan properties and 2-4 weeks for completed properties, depending on documentation and payment structure. We ensure efficient processing at every stage.",
  },
  {
    id: "3",
    category: "Selling",
    question: "How do you determine the right price for my property?",
    answer:
      "We conduct comprehensive market analysis including comparable sales, current market trends, property condition, and location factors to recommend an optimal listing price.",
  },
  {
    id: "4",
    category: "Payments",
    question: "What payment options are available?",
    answer:
      "We offer flexible payment plans including outright purchase, installment plans (6-24 months), and mortgage facilitation through partner banks. Initial deposits typically range from 10-30%.",
  },
  {
    id: "5",
    category: "Inspections",
    question: "Can I schedule a property inspection before purchase?",
    answer:
      "Absolutely. We encourage physical inspections and offer virtual tours for remote clients. Inspections can be scheduled at your convenience, including weekends.",
  },
  {
    id: "6",
    category: "Documentation",
    question: "How do you verify property documentation?",
    answer:
      "Our legal team conducts thorough due diligence including title verification at the Land Registry, survey confirmation, and encumbrance checks before any transaction proceeds.",
  },
];

export const SERVICES: Service[] = [
  {
    id: "1",
    slug: "buying-property",
    title: "Buying Property",
    description:
      "Expert guidance through every step of your property purchase, from search to keys in hand.",
    icon: "Home",
    features: [
      "Personalized property search",
      "Market analysis & pricing advice",
      "Negotiation support",
      "Legal documentation assistance",
    ],
    longDescription: "Acquiring premium real estate in Nigeria is a major financial milestone that requires professional oversight, deep market insights, and rigorous due diligence. We offer a comprehensive buying service that represents your interests exclusively. From identifying hidden off-market gems to conducting comprehensive registry checks and securing optimal price terms, we guide you at every stage so you can purchase with absolute confidence.",
    process: [
      { title: "Consultation & Needs Analysis", description: "Defining your location preferences, space requirements, budget, and long-term financial goals." },
      { title: "Market Sourcing & Matchmaking", description: "Filtering through verified listings and exclusive off-market properties to find perfect matches." },
      { title: "Accompanied Inspections", description: "Providing physical accompanied viewings and detailed virtual tours for clients abroad." },
      { title: "Due Diligence & Title Search", description: "Conducting thorough title audits at the Land Registry to verify ownership and check for encumbrances." },
      { title: "Negotiation & Deal Closing", description: "Securing favorable terms and contract conditions through expert representation." },
      { title: "Documentation & Key Handover", description: "Assisting with the deed of assignment, governor's consent, and smooth handover of physical possession." }
    ],
    benefits: [
      "Access to Off-Market Listings",
      "Independent Property Valuations",
      "Seamless Legal Documentation",
      "Verified Clean Land Titles",
      "Risk-Free Real Estate Transactions"
    ]
  },
  {
    id: "2",
    slug: "selling-property",
    title: "Selling Property",
    description:
      "Maximize your property's value with strategic marketing and professional negotiation.",
    icon: "TrendingUp",
    features: [
      "Professional property valuation",
      "Premium marketing campaigns",
      "Qualified buyer screening",
      "Seamless closing process",
    ],
    longDescription: "Selling luxury properties at their true worth requires more than placing an ad online. We design sophisticated, bespoke marketing campaigns tailored to attract high-net-worth individuals and corporate buyers. Leveraging professional staging, high-definition videography, and our extensive database of pre-qualified buyers, we optimize your property’s presentation and negotiate terms that yield top-tier returns.",
    process: [
      { title: "Valuation & Pricing Analysis", description: "Conducting comparative market studies to set a competitive and accurate pricing strategy." },
      { title: "Professional Staging & Media", description: "Advising on cosmetic staging and preparing premium high-resolution photo/video packages." },
      { title: "Strategic Marketing & Outreach", description: "Launching tailored digital campaigns and engaging our network of qualified buyers." },
      { title: "Screening & Negotiations", description: "Vetting prospective buyers and managing offers to protect your asking price." },
      { title: "Closing & Transfer", description: "Coordinating with legal representatives to ensure a legally secure and timely close." }
    ],
    benefits: [
      "Maximum Market Exposure",
      "Professional Presentation & Media",
      "Pre-Vetted Buyers Only",
      "Expert Negotiation",
      "Fast Sales Cycle"
    ]
  },
  {
    id: "3",
    slug: "investment-consultation",
    title: "Investment Consultation",
    description:
      "Strategic advisory for building wealth through real estate investments.",
    icon: "BarChart3",
    features: [
      "ROI analysis & projections",
      "Portfolio diversification advice",
      "Market trend insights",
      "Off-plan investment opportunities",
    ],
    longDescription: "Building wealth through real estate requires data-driven decision making and macro-market foresight. We analyze real estate yields, capital growth projections, and municipal development plans to recommend high-performance investment vehicles. Whether you're looking for high-yield rental properties, short-let opportunities, land banking, or commercial portfolios, we help you build a robust and secure asset base.",
    process: [
      { title: "Portfolio Review & Strategy", description: "Assessing your current assets and outlining a clear path for expansion and yield optimization." },
      { title: "Yield & Capital Gain Projections", description: "Providing comparative calculations on cash flow, net yield, and capital appreciation prospects." },
      { title: "Off-Plan Selection", description: "Accessing early-stage development opportunities with strong potential for appreciation before completion." },
      { title: "Risk Assessment", description: "Analyzing neighborhood zoning, infrastructure plans, and title status to minimize investment risk." }
    ],
    benefits: [
      "High-Yield Portfolio Structuring",
      "Early Access to Premium Off-Plan Deals",
      "Rigorous Risk Mitigation Analysis",
      "Capital Appreciation Reports",
      "Strategic Land Banking Advice"
    ]
  },
  {
    id: "4",
    slug: "property-marketing",
    title: "Property Marketing",
    description:
      "Showcase your property to the right audience with luxury-grade marketing.",
    icon: "Megaphone",
    features: [
      "Professional photography",
      "Virtual tours & staging",
      "Multi-channel promotion",
      "Targeted buyer outreach",
    ],
    longDescription: "We offer specialized premium marketing services for developers and individual property owners looking to elevate their property's market presence. Our custom campaigns use cinematic virtual tours, professional architectural photography, targeted social and search advertising, and custom printed brochures to showcase your property as a masterpiece of design.",
    process: [
      { title: "Content Production", description: "Creating high-resolution architectural photography and cinematic drone footage." },
      { title: "Digital Campaigns", description: "Deploying high-converting targeted advertisements across search, social media, and real estate portals." },
      { title: "Virtual Tours & Interactive Media", description: "Developing immersive virtual walkthroughs to engage international and remote buyers." },
      { title: "Exclusive Network Showcases", description: "Presenting properties to private investor groups and brokerage partners." }
    ],
    benefits: [
      "Cinematic Photo & Video Content",
      "Global Outreach to Diaspora Buyers",
      "Interactive 3D Virtual Walkthroughs",
      "Specialized Broker-to-Broker Outreach",
      "Premium Listing Position"
    ]
  },
  {
    id: "5",
    slug: "property-documentation",
    title: "Property Documentation",
    description:
      "Complete documentation services ensuring legal compliance and peace of mind.",
    icon: "FileText",
    features: [
      "Title verification",
      "Deed preparation",
      "Governor's consent processing",
      "Survey plan acquisition",
    ],
    longDescription: "Real estate transactions in Nigeria live or die by their paperwork. Our specialized documentation team handles the complex legal processes required to secure your property rights. From conducting initial registry searches to preparing legally binding contracts and processing Governor's Consent, we eliminate the stress of red tape and ensure your asset is fully protected under the law.",
    process: [
      { title: "Title Verification & Due Diligence", description: "Searching records at state land registries and surveyor general offices to confirm authenticity." },
      { title: "Document Preparation", description: "Drafting contract of sale, deed of assignment, power of attorney, and joint venture agreements." },
      { title: "Regulatory Filings & Consent", description: "Navigating state secretariats to register surveys, pay fees, and obtain Governor's Consent." },
      { title: "Storage & Archive", description: "Securing certified true copies and organizing legal files for effortless future transactions." }
    ],
    benefits: [
      "Legally Sound Sales Contracts",
      "Efficient Governor's Consent Processing",
      "Complete Registry Verification",
      "Avoidance of Legal/Boundary Disputes",
      "Secured Asset Protections"
    ]
  },
  {
    id: "6",
    slug: "property-inspection",
    title: "Property Inspection",
    description:
      "Thorough property assessments to protect your investment.",
    icon: "Search",
    features: [
      "Structural assessment",
      "Documentation review",
      "Market comparison report",
      "Investment viability analysis",
    ],
    longDescription: "Protect yourself from hidden structural failures, drainage issues, and legal traps. Our comprehensive property inspection service provides a thorough, objective analysis of any property's condition before you commit to a purchase or lease. We examine mechanical, electrical, and structural systems, plus surrounding environmental risks, and deliver a detailed viability report.",
    process: [
      { title: "Structural & Foundation Check", description: "Inspecting walls, slabs, columns, and roofs for cracking, dampness, or structural failure." },
      { title: "Mechanical, Electrical & Plumbing", description: "Testing internal wiring, phase loading, water pressure, sewage lines, and generator setups." },
      { title: "Environment & Infrastructure", description: "Assessing neighborhood drainage systems, access roads, and flooding history." },
      { title: "Viability & Cost Estimation", description: "Estimating any immediate repair costs and outlining the long-term maintenance outlook." }
    ],
    benefits: [
      "Structural Integrity Reports",
      "Prevention of Hidden Repair Expenses",
      "Independent Value Verification",
      "Drainage & Flooding Risk Analysis",
      "Strategic Leverage in Pricing Negotiations"
    ]
  },
  {
    id: "7",
    slug: "property-management",
    title: "Property Management",
    description:
      "Professional management services for landlords and investors.",
    icon: "Building2",
    features: [
      "Tenant sourcing & screening",
      "Rent collection",
      "Maintenance coordination",
      "Financial reporting",
    ],
    longDescription: "Maximize your rental income and preserve your property's value without the day-to-day hassles of being a landlord. We provide full-service property management that covers tenant acquisition and vetting, rent collection, routine maintenance, emergency repairs, and legal disputes. We act as a trusted intermediary, keeping your tenants happy and your returns consistent.",
    process: [
      { title: "Tenant Screening & Onboarding", description: "Vetting backgrounds, proof of employment, and references to ensure high-quality tenancy." },
      { title: "Financial Management & Rent Collection", description: "Managing invoicing, collection, security deposits, and presenting quarterly financial reports." },
      { title: "Maintenance & Operations", description: "Performing regular safety checks, organizing cleaners/security, and coordinating local handymen." },
      { title: "Lease Compliance & Renewals", description: "Managing renewals, lease adjustments, and handling dispute resolution or evictions legally." }
    ],
    benefits: [
      "Steady Rental Income Streams",
      "Rigorous Tenant Vetting & Screening",
      "24/7 Professional Maintenance Coordination",
      "Lease Compliance & Eviction Protection",
      "Clear Financial Reporting & Auditing"
    ]
  },
];

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/properties", label: "Properties" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export const WHY_CHOOSE = [
  {
    title: "Buying Guidance",
    description: "Personalized search and expert advice for confident purchases.",
    icon: "Compass",
  },
  {
    title: "Property Sales",
    description: "Strategic marketing to achieve the best price for your property.",
    icon: "Key",
  },
  {
    title: "Investment Advisory",
    description: "Data-driven insights for profitable real estate investments.",
    icon: "LineChart",
  },
  {
    title: "Documentation",
    description: "Complete legal support ensuring secure, compliant transactions.",
    icon: "Shield",
  },
  {
    title: "Negotiation",
    description: "Skilled negotiation to protect your interests and maximize value.",
    icon: "Handshake",
  },
  {
    title: "After Sales Support",
    description: "Continued assistance beyond closing for complete peace of mind.",
    icon: "HeartHandshake",
  },
];

export const VALUES = [
  {
    title: "Integrity",
    description: "Honest, transparent dealings in every transaction.",
  },
  {
    title: "Transparency",
    description: "Clear communication and full disclosure at every step.",
  },
  {
    title: "Professionalism",
    description: "Excellence in service delivery and client relations.",
  },
  {
    title: "Client Satisfaction",
    description: "Your success and satisfaction are our top priorities.",
  },
];

export const WHY_INVEST = [
  {
    title: "Growing Communities",
    description:
      "Invest in rapidly developing areas with strong infrastructure growth and rising property values.",
  },
  {
    title: "Excellent ROI",
    description:
      "Nigeria's real estate market offers competitive returns compared to traditional investment vehicles.",
  },
  {
    title: "Verified Documentation",
    description:
      "Every property we recommend undergoes rigorous legal verification for your protection.",
  },
  {
    title: "Secure Investments",
    description:
      "Partner with established developers and verified title holders for risk-free acquisitions.",
  },
  {
    title: "Professional Guidance",
    description:
      "Benefit from 12+ years of market expertise and data-driven investment strategies.",
  },
];

export const CLIENT_JOURNEY = [
  { step: 1, title: "Consultation", description: "Understanding your needs and goals" },
  { step: 2, title: "Property Selection", description: "Curated options matching your criteria" },
  { step: 3, title: "Inspection", description: "Thorough property viewing and assessment" },
  { step: 4, title: "Documentation", description: "Legal verification and paperwork" },
  { step: 5, title: "Payment", description: "Flexible payment processing" },
  { step: 6, title: "Handover", description: "Keys to your new property" },
];
