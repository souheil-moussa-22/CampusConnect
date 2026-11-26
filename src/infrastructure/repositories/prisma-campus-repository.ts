import type { CampusRepository } from '@/application/ports';
import { PrismaProposalRepository } from '@/modules/proposals/infrastructure/prisma-repository';
import { prisma } from '@/infrastructure/persistence/prisma';

export class PrismaCampusRepository extends PrismaProposalRepository implements CampusRepository {
  async findCredentialUser(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      passwordHash: user.passwordHash,
      active: user.status === 'ACTIVE',
    };
  }

  async emailExists(email: string) {
    return Boolean(await prisma.user.findUnique({ where: { email }, select: { id: true } }));
  }

  async createAccount(input: { name: string; email: string; passwordHash: string }) {
    await prisma.user.create({
      data: { ...input, profile: { create: {} } },
    });
  }

  async listRequests(filters: Parameters<CampusRepository['listRequests']>[0]) {
    const keyword = filters.keyword?.trim();
    return prisma.helpRequest.findMany({
      where: {
        hidden: false,
        AND: [
          keyword
            ? { OR: [{ title: { contains: keyword, mode: 'insensitive' } }, { description: { contains: keyword, mode: 'insensitive' } }] }
            : {},
          { subject: { name: filters.subject || undefined } },
          { level: filters.level || undefined },
          { status: filters.status as 'OPEN' | 'HELP_ACCEPTED' | 'COMPLETED' | undefined },
        ],
      },
      include: { subject: true, author: true, _count: { select: { proposals: true } } },
      orderBy: { createdAt: filters.sort === 'oldest' ? 'asc' : 'desc' },
      take: 20,
    });
  }

  async listOpenRequests() {
    return prisma.helpRequest.findMany({
      where: { status: 'OPEN', hidden: false },
      include: { subject: true },
    });
  }

  async listSubjects() {
    return prisma.subject.findMany({ orderBy: { name: 'asc' } });
  }

  async getRequestDetails(id: string) {
    const request = await prisma.helpRequest.findUnique({
      where: { id },
      include: {
        subject: true,
        author: true,
        proposals: { include: { student: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!request) return null;
    return {
      ...request,
      proposals: request.proposals.map(proposal => ({
        ...proposal,
        student: { name: proposal.student.name },
      })),
    };
  }

  async createRequest(input: Parameters<CampusRepository['createRequest']>[0]) {
    const { subject, ...request } = input;
    const subjectRecord = await prisma.subject.upsert({
      where: { name: subject },
      update: {},
      create: { name: subject },
    });
    await prisma.helpRequest.create({
      data: { ...request, subjectId: subjectRecord.id },
    });
  }

  async createReport(input: Parameters<CampusRepository['createReport']>[0]) {
    await prisma.report.create({ data: input });
  }

  async notifyProposalReceived(recipientId: string, message: string) {
    await prisma.notification.create({ data: { recipientId, type: 'PROPOSAL_RECEIVED', message } });
  }

  async getDashboard(userId: string) {
    const [requestCount, proposalCount, receivedProposalCount, sessions, notifications, profile] = await Promise.all([
      prisma.helpRequest.count({ where: { authorId: userId } }),
      prisma.helpProposal.count({ where: { studentId: userId } }),
      prisma.helpProposal.count({ where: { request: { authorId: userId }, status: 'PENDING' } }),
      prisma.studySession.findMany({
        where: { OR: [{ ownerId: userId }, { helpingStudentId: userId }] },
        include: { request: true },
        orderBy: { date: 'asc' },
      }),
      prisma.notification.findMany({ where: { recipientId: userId }, orderBy: { createdAt: 'desc' }, take: 4 }),
      prisma.studentProfile.findUnique({ where: { userId } }),
    ]);
    return {
      requestCount,
      proposalCount,
      receivedProposalCount,
      sessions,
      notifications,
      averageRating: profile?.averageRating ?? null,
    };
  }

  async getSessions(userId: string) {
    return prisma.studySession.findMany({
      where: { OR: [{ ownerId: userId }, { helpingStudentId: userId }] },
      include: { request: true, owner: true, helpingStudent: true },
      orderBy: { date: 'desc' },
    });
  }

  async completeSession(session: Parameters<CampusRepository['completeSession']>[0], notificationMessage: string) {
    await prisma.$transaction(async tx => {
      await tx.studySession.update({ where: { id: session.id }, data: { status: 'COMPLETED' } });
      await tx.helpRequest.update({ where: { id: session.requestId }, data: { status: 'COMPLETED' } });
      await tx.notification.createMany({
        data: [
          { recipientId: session.ownerId, type: 'SESSION_COMPLETED', message: notificationMessage },
          { recipientId: session.helpingStudentId, type: 'SESSION_COMPLETED', message: notificationMessage },
        ],
      });
    });
  }

  async cancelSession(session: Parameters<CampusRepository['cancelSession']>[0], notificationMessage: string) {
    await prisma.$transaction(async tx => {
      await tx.studySession.update({ where: { id: session.id }, data: { status: 'CANCELLED' } });
      await tx.notification.createMany({
        data: [
          { recipientId: session.ownerId, type: 'SESSION_CANCELLED', message: notificationMessage },
          { recipientId: session.helpingStudentId, type: 'SESSION_CANCELLED', message: notificationMessage },
        ],
      });
    });
  }

  async getNotifications(userId: string) {
    return prisma.notification.findMany({ where: { recipientId: userId }, orderBy: { createdAt: 'desc' } });
  }

  async markAllNotificationsRead(userId: string) {
    await prisma.notification.updateMany({ where: { recipientId: userId }, data: { read: true } });
  }

  async markNotificationRead(notificationId: string, userId: string) {
    await prisma.notification.updateMany({
      where: { id: notificationId, recipientId: userId },
      data: { read: true },
    });
  }

  async getProfile(userId: string) {
    const [user, skills] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { profile: { include: { skills: true, availabilities: true } } },
      }),
      prisma.skill.findMany({ orderBy: { name: 'asc' } }),
    ]);
    return {
      user: user
        ? {
            name: user.name,
            profile: user.profile
              ? {
                  specialty: user.profile.specialty,
                  level: user.profile.level,
                  biography: user.profile.biography,
                  skills: user.profile.skills.map(skill => ({ name: skill.name })),
                  availabilities: user.profile.availabilities,
                }
              : null,
          }
        : null,
      skills,
    };
  }

  async saveProfile(input: Parameters<CampusRepository['saveProfile']>[0]) {
    const { userId, name, specialty, level, biography, skills } = input;
    await prisma.$transaction(async tx => {
      await tx.studentProfile.upsert({
        where: { userId },
        update: { specialty, level, biography, skills: { set: [] } },
        create: { userId, specialty, level, biography },
      });
      for (const skillName of skills) {
        const skill = await tx.skill.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName },
        });
        await tx.studentProfile.update({
          where: { userId },
          data: { skills: { connect: { id: skill.id } } },
        });
      }
      await tx.user.update({ where: { id: userId }, data: { name } });
    });
  }

  async getMatchingData(userId: string) {
    const [requests, users] = await Promise.all([
      this.listOpenRequests(),
      prisma.user.findMany({
        where: { id: { not: userId }, status: 'ACTIVE' },
        include: { profile: { include: { skills: true, availabilities: true } } },
      }),
    ]);
    const candidates = users.flatMap(user => user.profile ? [{
      id: user.id,
      name: user.name,
      specialty: user.profile.specialty,
      level: user.profile.level,
      skills: user.profile.skills.map(skill => skill.name),
      availability: user.profile.availabilities.map(item => `${item.day} ${item.startTime}-${item.endTime}`),
      averageRating: user.profile.averageRating,
    }] : []);
    return { requests, candidates };
  }

  async getCompletedSessionsForReview(userId: string) {
    return prisma.studySession.findMany({
      where: { status: 'COMPLETED', OR: [{ ownerId: userId }, { helpingStudentId: userId }] },
      include: { owner: true, helpingStudent: true, request: true, reviews: true },
    });
  }

  async createReview(input: Parameters<CampusRepository['createReview']>[0]) {
    const { notificationMessage, ...review } = input;
    await prisma.$transaction(async tx => {
      await tx.review.create({ data: review });
      const stats = await tx.review.aggregate({
        _avg: { rating: true },
        _count: { _all: true },
        where: { reviewedStudentId: review.reviewedStudentId },
      });
      await tx.studentProfile.updateMany({
        where: { userId: review.reviewedStudentId },
        data: { averageRating: stats._avg.rating || 0, reviewCount: stats._count._all },
      });
      await tx.notification.create({
        data: {
          recipientId: review.reviewedStudentId,
          type: 'REVIEW_RECEIVED',
          message: notificationMessage,
        },
      });
    });
  }

  async getAdminData() {
    const [users, requestCount, reports] = await Promise.all([
      prisma.user.findMany({ include: { profile: true }, orderBy: { createdAt: 'desc' } }),
      prisma.helpRequest.count(),
      prisma.report.findMany({ include: { request: true, reporter: true }, orderBy: { createdAt: 'desc' } }),
    ]);
    return {
      users: users.map(({ id, name, email, role, status }) => ({ id, name, email, role, status })),
      requestCount,
      reports,
    };
  }

  async getAccountStatus(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return user.status;
  }

  async updateAccountStatus(input: Parameters<CampusRepository['updateAccountStatus']>[0]) {
    await prisma.$transaction([
      prisma.user.update({ where: { id: input.userId }, data: { status: input.status } }),
      prisma.notification.create({
        data: {
          recipientId: input.userId,
          type: 'ACCOUNT_STATUS',
          message: input.notificationMessage,
        },
      }),
    ]);
  }

  async getReportForResolution(reportId: string) {
    const report = await prisma.report.findUniqueOrThrow({ where: { id: reportId } });
    return { reporterId: report.reporterId, requestId: report.requestId };
  }

  async resolveReport(input: Parameters<CampusRepository['resolveReport']>[0]) {
    await prisma.$transaction(async tx => {
      await tx.report.update({ where: { id: input.reportId }, data: { status: 'RESOLVED', moderatorId: input.moderatorId } });
      if (input.hiddenRequestId) {
        await tx.helpRequest.update({ where: { id: input.hiddenRequestId }, data: { hidden: true } });
      }
      await tx.notification.create({
        data: {
          recipientId: input.reporterId,
          type: 'REPORT_MODERATED',
          message: input.notificationMessage,
        },
      });
    });
  }
}
