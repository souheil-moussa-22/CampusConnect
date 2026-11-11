export type HelpRequestStatus = "OPEN" | "HELP_ACCEPTED" | "COMPLETED";

export type PublicHelpRequest = {
  id: string;
  author_id: string;
  title: string;
  description: string;
  subject: string;
  academic_level: string;
  availability: string;
  status: HelpRequestStatus;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_specialty: string | null;
};

export type HelpRequestListResponse = {
  data: PublicHelpRequest[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};
