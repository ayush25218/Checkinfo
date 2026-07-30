import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || process.env.MONGO_URL;
const databaseName = process.env.MONGODB_DB || "checkinfo";

if (!uri) {
  console.error("Missing MONGODB_URI. Export it before running this script.");
  process.exit(1);
}

const now = new Date();

function isoDaysAgo(days) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const demoAccounts = [
  {
    member: ["demo-user-01", "Aarav Sharma", "aarav.sharma@example.com", "9810001001", "aarav-sharma"],
    listing: ["GreenHarvest Agro Services", "Agriculture, Fisheries and Animal Husbandry", "Agri Inputs and Equipment", "Farm machinery dealer", "Delhi", "New Delhi", "Dwarka", "Tractor rental, irrigation kits, and farm machinery support for growers."],
  },
  {
    member: ["demo-user-02", "Meera Gupta", "meera.gupta@example.com", "9810001002", "meera-gupta"],
    listing: ["Metro Fresh Foods", "Food Processing and FMCG Manufacturing", "Packaged Foods and Snacks", "Bakery manufacturer", "Maharashtra", "Mumbai", "Andheri East", "Fresh bakery products, namkeen, and private-label snack manufacturing."],
  },
  {
    member: ["demo-user-03", "Kabir Verma", "kabir.verma@example.com", "9810001003", "kabir-verma"],
    listing: ["Prime Textile Studio", "Textile, Apparel, Leather and Lifestyle Manufacturing", "Garments and Uniforms", "Uniform manufacturer", "Gujarat", "Ahmedabad", "Navrangpura", "Corporate uniforms, school uniforms, and bulk garment production."],
  },
  {
    member: ["demo-user-04", "Nisha Rao", "nisha.rao@example.com", "9810001004", "nisha-rao"],
    listing: ["Skyline Buildcon", "Construction, Real Estate and Infrastructure", "Civil Contracting and Turnkey Works", "Building contractor", "Karnataka", "Bengaluru", "Indiranagar", "Residential and commercial turnkey construction with project management."],
  },
  {
    member: ["demo-user-05", "Rohan Singh", "rohan.singh@example.com", "9810001005", "rohan-singh"],
    listing: ["Rapid HomeFix", "Home Improvement, Repair and Household Services", "Home Trades and Installation", "Electrical service", "Uttar Pradesh", "Lucknow", "Gomti Nagar", "Doorstep electrical repair, appliance setup, and emergency home service."],
  },
  {
    member: ["demo-user-06", "Ananya Bose", "ananya.bose@example.com", "9810001006", "ananya-bose"],
    listing: ["MediScan Diagnostics", "Healthcare, Diagnostics, Pharma Retail and Wellness", "Diagnostics and Imaging", "Pathology laboratory", "West Bengal", "Kolkata", "Salt Lake", "Pathology testing, home sample collection, and preventive health packages."],
  },
  {
    member: ["demo-user-07", "Ishaan Patel", "ishaan.patel@example.com", "9810001007", "ishaan-patel"],
    listing: ["BrightPath Coaching", "Education, Training and Childcare", "Coaching and Test Preparation", "Entrance exam coaching institute", "Rajasthan", "Jaipur", "Vaishali Nagar", "Entrance coaching, language training, and test preparation batches."],
  },
  {
    member: ["demo-user-08", "Priya Menon", "priya.menon@example.com", "9810001008", "priya-menon"],
    listing: ["CloudAxis Digital", "IT, Telecom and Digital Services", "Web and Digital Commerce Services", "Web design agency", "Kerala", "Kochi", "Kakkanad", "Website design, SEO, ecommerce setup, and digital marketing campaigns."],
  },
  {
    member: ["demo-user-09", "Dev Malhotra", "dev.malhotra@example.com", "9810001009", "dev-malhotra"],
    listing: ["BlueFleet Logistics", "Logistics, Transport and Warehousing", "Road Freight and Parcel Logistics", "Goods transport agency", "Haryana", "Gurugram", "Udyog Vihar", "B2B goods transport, parcel movement, and express delivery support."],
  },
  {
    member: ["demo-user-10", "Sara Khan", "sara.khan@example.com", "9810001010", "sara-khan"],
    listing: ["GlowFit Wellness", "Beauty, Fitness, Sports and Personal Services", "Fitness and Sports", "Gym or fitness center", "Telangana", "Hyderabad", "Madhapur", "Premium gym, yoga classes, personal training, and wellness programs."],
  },
];

function buildAccount(record, index) {
  const [id, name, email, phone, username] = record.member;
  const [businessName, category, subcategory, businessType, state, city, subcity, description] = record.listing;
  const listingId = `demo-listing-${String(index + 1).padStart(2, "0")}`;

  return {
    _id: id,
    enquiries: [],
    listings: [
      {
        id: listingId,
        address: `${subcity}, ${city}, ${state}, India`,
        addressProofName: "",
        businessType,
        category,
        city,
        contactPerson: name,
        description,
        email,
        keywords: [businessType, subcategory, category, city, subcity].join(", "),
        location: [subcity, city, state].join(", "),
        mobile: phone,
        name: businessName,
        state,
        status: "Featured",
        subcategory,
        subcity,
        website: `https://example.com/${listingId}`,
        youtube: "",
      },
    ],
    loggedOutAt: null,
    notifications: [
      {
        id: `note-${listingId}`,
        text: "Your business listing has been approved and featured by admin.",
        time: isoDaysAgo(index),
        title: "Listing approved",
        unread: true,
      },
    ],
    packageName: "Featured Boost",
    passwordUpdatedAt: null,
    profile: {
      email,
      id,
      initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2),
      name,
      phone,
      role: "Business owner account",
      status: "Active",
      username,
    },
    registeredAt: isoDaysAgo(index + 1),
    reviews: [],
    tickets: [],
  };
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(databaseName);
  const members = db.collection("members");

  await members.createIndex({ "profile.username": 1 });
  await Promise.all(
    demoAccounts.map((record, index) => {
      const account = buildAccount(record, index);
      return members.updateOne({ _id: account._id }, { $set: account }, { upsert: true });
    }),
  );

  const seededIds = demoAccounts.map((record) => record.member[0]);
  const seededMembers = await members.countDocuments({ _id: { $in: seededIds } });
  const seededListings = await members
    .find({ _id: { $in: seededIds } })
    .toArray()
    .then((accounts) => accounts.reduce((total, account) => total + (account.listings?.length ?? 0), 0));
  const featuredListings = await members
    .find({ _id: { $in: seededIds } })
    .toArray()
    .then((accounts) => accounts.flatMap((account) => account.listings ?? []).filter((listing) => listing.status === "Featured").length);

  console.log(`Demo business flow seeded: ${databaseName}`);
  console.table({
    featuredListings,
    seededListings,
    seededMembers,
  });
} finally {
  await client.close();
}
