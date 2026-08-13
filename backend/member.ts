export type MemberListing = {
  id: string;
  address: string;
  category: string;
  contactPerson: string;
  description: string;
  email: string;
  image?: string;
  keywords: string;
  addressProofName?: string;
  businessType: string;
  city: string;
  location: string;
  mobile: string;
  name: string;
  state: string;
  status: "Draft" | "Pending" | "Active" | "Featured" | "Popular" | "Inactive";
  subcategory: string;
  subcity: string;
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
  id: string;
  email: string;
  issue: string;
  message: string;
  name: string;
  phone: string;
  status: "Open" | "Resolved";
};
