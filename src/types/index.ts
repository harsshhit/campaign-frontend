export interface Campaign {
  _id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "deleted";
  leads: string[];
  accounts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LinkedInProfile {
  firstName: string;
  lastName: string;
  currentPosition: string;
  company: string;
  industry: string;
  location: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    graduationYear: string;
  }>;
  skills: string[];
}

export interface MessageResponse {
  message: string;
  campaignId: string;
  profileId: string;
  createdAt: string;
}
