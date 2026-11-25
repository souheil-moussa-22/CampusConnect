import type { MatchingCandidate } from '@/modules/matching/domain/calculator';
import type { ProposalRepository, ProposalRecord } from '@/modules/proposals/application/ports';

export interface SubjectRecord {
  id: string;
  name: string;
}

export interface RequestSummary {
  id: string;
  title: string;
  description: string;
  level: string;
  status: string;
  authorId: string;
  availability: string | null;
  subject: SubjectRecord;
  author: { name: string };
  _count: { proposals: number };
}

export interface RequestDetails extends Omit<RequestSummary, '_count'> {
  hidden: boolean;
  proposals: Array<ProposalRecord & { message: string; student: { name: string } }>;
}

export interface ProfileRecord {
  name: string;
  profile: {
    specialty: string | null;
    level: string | null;
    biography: string | null;
    skills: Array<{ name: string }>;
    availabilities: Array<{ day: string; startTime: string; endTime: string }>;
  } | null;
}

export interface DashboardRecord {
  requestCount: number;
  proposalCount: number;
  receivedProposalCount: number;
  sessions: Array<{
    id: string;
    date: Date;
    duration: number;
    status: string;
    request: { title: string };
  }>;
  notifications: Array<{ id: string; message: string; read: boolean; createdAt: Date }>;
  averageRating: number | null;
}

export interface SessionRecord {
  id: string;
  requestId: string;
  ownerId: string;
  helpingStudentId: string;
  date: Date;
  duration: number;
  status: string;
  request: { title: string };
  owner: { name: string };
  helpingStudent: { name: string };
}

export interface ReviewSessionRecord {
  id: string;
  ownerId: string;
  helpingStudentId: string;
  request: { title: string };
  owner: { id: string; name: string };
  helpingStudent: { id: string; name: string };
  reviews: Array<{ reviewerId: string; reviewedStudentId: string }>;
}

export interface AdminRecord {
  users: Array<{ id: string; name: string; email: string; role: string; status: string }>;
  requestCount: number;
  reports: Array<{
    id: string;
    requestId: string | null;
    reporterId: string;
    reason: string;
    status: string;
    request: { title: string } | null;
    reporter: { name: string };
  }>;
}

export interface CampusRepository extends ProposalRepository {
  findCredentialUser(email: string): Promise<{
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'ADMIN';
    image: string | null;
    passwordHash: string;
    active: boolean;
  } | null>;
  emailExists(email: string): Promise<boolean>;
  createAccount(input: { name: string; email: string; passwordHash: string }): Promise<void>;
  listRequests(filters: {
    keyword?: string;
    subject?: string;
    level?: string;
    status?: string;
    sort?: string;
  }): Promise<RequestSummary[]>;
  listOpenRequests(): Promise<Array<{
    id: string;
    title: string;
    level: string;
    availability: string | null;
    subject: SubjectRecord;
  }>>;
  listSubjects(): Promise<SubjectRecord[]>;
  getRequestDetails(id: string): Promise<RequestDetails | null>;
  createRequest(input: {
    title: string;
    description: string;
    subject: string;
    level: string;
    availability: string;
    authorId: string;
  }): Promise<void>;
  createReport(input: {
    reporterId: string;
    requestId: string;
    reason: 'INAPPROPRIATE' | 'SPAM' | 'HARASSMENT' | 'OTHER';
    details: string;
  }): Promise<void>;
  notifyProposalReceived(recipientId: string, message: string): Promise<void>;
  getDashboard(userId: string): Promise<DashboardRecord>;
  getSessions(userId: string): Promise<SessionRecord[]>;
  completeSession(session: SessionRecord, notificationMessage: string): Promise<void>;
  cancelSession(session: SessionRecord, notificationMessage: string): Promise<void>;
  getNotifications(userId: string): Promise<Array<{ id: string; message: string; read: boolean; createdAt: Date }>>;
  markAllNotificationsRead(userId: string): Promise<void>;
  markNotificationRead(notificationId: string, userId: string): Promise<void>;
  getProfile(userId: string): Promise<{ user: ProfileRecord | null; skills: Array<{ id: string; name: string }> }>;
  saveProfile(input: {
    userId: string;
    name: string;
    specialty: string;
    level: string;
    biography: string;
    skills: string[];
  }): Promise<void>;
  getMatchingData(userId: string): Promise<{
    requests: Awaited<ReturnType<CampusRepository['listOpenRequests']>>;
    candidates: MatchingCandidate[];
  }>;
  getCompletedSessionsForReview(userId: string): Promise<ReviewSessionRecord[]>;
  createReview(input: {
    sessionId: string;
    reviewerId: string;
    reviewedStudentId: string;
    rating: number;
    comment: string;
    notificationMessage: string;
  }): Promise<void>;
  getAdminData(): Promise<AdminRecord>;
  getAccountStatus(userId: string): Promise<'ACTIVE' | 'SUSPENDED'>;
  updateAccountStatus(input: {
    userId: string;
    status: 'ACTIVE' | 'SUSPENDED';
    notificationMessage: string;
  }): Promise<void>;
  getReportForResolution(reportId: string): Promise<{ reporterId: string; requestId: string | null }>;
  resolveReport(input: {
    reportId: string;
    moderatorId: string;
    reporterId: string;
    hiddenRequestId: string | null;
    notificationMessage: string;
  }): Promise<void>;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}
