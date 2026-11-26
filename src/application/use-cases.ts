import { calculateCompatibility } from '@/modules/matching/domain/calculator';
import { CreateHelpProposal } from '@/modules/proposals/application/use-cases';
import { DomainError } from '@/domain/errors';
import type { CampusRepository, PasswordHasher } from './ports';

export class CampusApplication {
  constructor(private readonly repository: CampusRepository) {}

  listRequests(filters: Parameters<CampusRepository['listRequests']>[0]) {
    return this.repository.listRequests(filters);
  }

  listSubjects() {
    return this.repository.listSubjects();
  }

  getRequestDetails(id: string) {
    return this.repository.getRequestDetails(id);
  }

  getDashboard(userId: string) {
    return this.repository.getDashboard(userId);
  }

  getSessions(userId: string) {
    return this.repository.getSessions(userId);
  }

  getNotifications(userId: string) {
    return this.repository.getNotifications(userId);
  }

  getProfile(userId: string) {
    return this.repository.getProfile(userId);
  }

  getCompletedSessionsForReview(userId: string) {
    return this.repository.getCompletedSessionsForReview(userId);
  }

  getAdminData() {
    return this.repository.getAdminData();
  }

  async getMatching(userId: string, requestedId?: string) {
    const data = await this.repository.getMatchingData(userId);
    const request = data.requests.find(item => item.id === requestedId) ?? data.requests[0];
    if (!request) return { requests: data.requests, request: null, candidates: [] };
    const matchingRequest = {
      subject: request.subject.name,
      level: request.level,
      requiredSkills: [],
      availability: request.availability ? [request.availability] : [],
    };
    const candidates = data.candidates
      .map(candidate => calculateCompatibility(candidate, matchingRequest))
      .sort((left, right) => right.score - left.score)
      .slice(0, 6);
    return { requests: data.requests, request, candidates };
  }

  async register(input: { name: string; email: string; password: string }, hasher: PasswordHasher) {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (name.length < 2 || input.password.length < 6) throw new DomainError('Invalid registration');
    if (await this.repository.emailExists(email)) throw new DomainError('Email already registered');
    const passwordHash = await hasher.hash(input.password);
    await this.repository.createAccount({ name, email, passwordHash });
  }

  async authenticate(input: { email: string; password: string }, hasher: PasswordHasher) {
    const account = await this.repository.findCredentialUser(input.email.trim().toLowerCase());
    if (!account?.active || !(await hasher.compare(input.password, account.passwordHash))) return null;
    return { id: account.id, name: account.name, email: account.email, role: account.role, image: account.image };
  }

  createRequest(input: Parameters<CampusRepository['createRequest']>[0]) {
    if (!input.title.trim() || !input.description.trim() || !input.subject.trim()) {
      throw new DomainError('Title, description, and subject are required');
    }
    return this.repository.createRequest({
      ...input,
      title: input.title.trim(),
      description: input.description.trim(),
    });
  }

  async submitReport(input: Parameters<CampusRepository['createReport']>[0]) {
    const request = await this.repository.getRequestDetails(input.requestId);
    if (!request || request.hidden) throw new DomainError('Request not found');
    if (request.authorId === input.reporterId) throw new DomainError('You cannot report your own request');
    return this.repository.createReport(input);
  }

  async submitProposal(input: {
    actorId: string;
    requestId: string;
    message: string;
    studentName: string | null;
  }) {
    const request = await this.repository.getRequestDetails(input.requestId);
    if (!request || request.hidden) throw new DomainError('Request not found');
    const proposal = await new CreateHelpProposal(this.repository).execute(
      input.actorId,
      input.requestId,
      input.message,
    );
    await this.repository.notifyProposalReceived(
      request.authorId,
      `${input.studentName} submitted a proposal for ${request.title}.`,
    );
    return proposal;
  }

  async transitionSession(sessionId: string, actorId: string, status: 'COMPLETED' | 'CANCELLED') {
    const session = (await this.repository.getSessions(actorId)).find(item => item.id === sessionId);
    if (!session || session.status !== 'SCHEDULED') throw new DomainError('Session is no longer available');
    if (status === 'COMPLETED') {
      return this.repository.completeSession(session, `Session for ${session.request.title} was completed.`);
    }
    return this.repository.cancelSession(session, `Session for ${session.request.title} was cancelled.`);
  }

  markAllNotificationsRead(userId: string) {
    return this.repository.markAllNotificationsRead(userId);
  }

  markNotificationRead(notificationId: string, userId: string) {
    return this.repository.markNotificationRead(notificationId, userId);
  }

  saveProfile(input: Parameters<CampusRepository['saveProfile']>[0]) {
    return this.repository.saveProfile(input);
  }

  async submitReview(input: {
    sessionId: string;
    reviewerId: string;
    reviewerName: string;
    rating: number;
    comment: string;
  }) {
    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      throw new DomainError('Rating must be between 1 and 5');
    }
    if (!input.comment.trim()) throw new DomainError('Review comment is required');
    const session = (await this.repository.getCompletedSessionsForReview(input.reviewerId))
      .find(item => item.id === input.sessionId);
    if (!session) throw new DomainError('Completed session not found');
    const reviewedStudentId = session.ownerId === input.reviewerId
      ? session.helpingStudentId
      : session.ownerId;
    if (session.reviews.some(review => review.reviewerId === input.reviewerId && review.reviewedStudentId === reviewedStudentId)) {
      throw new DomainError('Review already submitted');
    }
    const { reviewerName, ...review } = input;
    return this.repository.createReview({
      ...review,
      reviewedStudentId,
      notificationMessage: `${reviewerName} left you a ${input.rating}-star review.`,
    });
  }

  async toggleAccountStatus(userId: string) {
    const currentStatus = await this.repository.getAccountStatus(userId);
    const status = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    return this.repository.updateAccountStatus({
      userId,
      status,
      notificationMessage: `Your account was ${status === 'SUSPENDED' ? 'suspended' : 'reactivated'}.`,
    });
  }

  async resolveReport(reportId: string, moderatorId: string) {
    const report = await this.repository.getReportForResolution(reportId);
    return this.repository.resolveReport({
      reportId,
      moderatorId,
      reporterId: report.reporterId,
      hiddenRequestId: report.requestId,
      notificationMessage: 'A report you submitted was resolved and the publication was hidden.',
    });
  }
}
