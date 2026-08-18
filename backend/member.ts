export type MemberListing = {
  id: string;
  address: string;
  approvalStatus?: "Draft" | "Pending" | "Approved" | "Rejected";
  approvedAt?: string;
  approvedBy?: string;
  adminNotes?: string;
  category: string;
  contactPerson: string;
  createdAt?: string;
  createdBy?: string;
  description: string;
  duplicateKey?: string;
  editHistory?: Array<{
    action: "created" | "updated" | "admin-status" | "admin-placement";
    actorId: string;
    at: string;
    notes?: string;
  }>;
  email: string;
  image?: string;
  logo?: string;
  gallery?: string[];
  keywords: string;
  addressProofName?: string;
  businessType: string;
  city: string;
  location: string;
  mobile: string;
  name: string;
  memberId?: string;
  ownerId?: string;
  rating?: number;
  reviewCount?: number;
  state: string;
  packageName?: string;
  placementExpiresAt?: string;
  placements?: Array<"new" | "featured" | "trending">;
  placementStartsAt?: string;
  rejectionReason?: string;
  status: "Draft" | "Pending" | "Active" | "Featured" | "Popular" | "Inactive";
  subcategory: string;
  subcity: string;
  submittedAt?: string;
  updatedAt?: string;
  verificationStatus?: "Unverified" | "Pending" | "Verified" | "Rejected";
  website: string;
  youtube: string;
};

export type MemberEnquiry = {
  id: string;
  contact: string;
  date: string;
  email: string;
  message: string;
  name: string;
  status: "New" | "Read" | "Closed";
};

export type MemberReview = {
  id: string;
  author: string;
  message: string;
  rating: number;
  status: "Pending" | "Published" | "Hidden";
};

export type MemberNotification = {
  id: string;
  text: string;
  time: string;
  title: string;
  unread: boolean;
};

export type SupportTicket = {
  createdAt?: string;
  id: string;
  email: string;
  issue: string;
  message: string;
  name: string;
  phone: string;
  status: "Open" | "Resolved";
};
