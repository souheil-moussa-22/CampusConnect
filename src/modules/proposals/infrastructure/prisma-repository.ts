import { prisma } from '@/infrastructure/persistence/prisma';
import type { ProposalRepository } from '../application/ports';

export class PrismaProposalRepository implements ProposalRepository {
  async findRequest(requestId: string) {
    const row = await prisma.helpRequest.findUnique({ where: { id: requestId }, select: { id: true, authorId: true, status: true } });
    return row;
  }
  async findById(id: string) {
    const row = await prisma.helpProposal.findUnique({ where: { id }, include: { request: true } });
    if (!row) return null;
    return { id: row.id, requestId: row.requestId, studentId: row.studentId, status: row.status, request: { id: row.request.id, authorId: row.request.authorId, status: row.request.status } };
  }
  async acceptAtomically(input: Parameters<ProposalRepository['acceptAtomically']>[0]) {
    await prisma.$transaction(async tx => {
      await tx.helpProposal.update({ where: { id: input.proposalId }, data: { status: 'ACCEPTED' } });
      await tx.helpProposal.updateMany({ where: { requestId: input.requestId, id: { not: input.proposalId }, status: 'PENDING' }, data: { status: 'REJECTED' } });
      await tx.helpRequest.update({ where: { id: input.requestId }, data: { status: 'HELP_ACCEPTED' } });
      await tx.studySession.create({
        data: {
          requestId: input.requestId,
          ownerId: input.ownerId,
          helpingStudentId: input.helpingStudentId,
          date: input.sessionDate,
          duration: input.duration,
          meetingMode: input.meetingMode,
          meetingUrl: input.meetingUrl,
        },
      });
      await tx.notification.createMany({ data: input.notifications });
    });
  }
  async findDuplicate(requestId: string, studentId: string) {
    return prisma.helpProposal.findFirst({ where: { requestId, studentId, status: { in: ['PENDING','ACCEPTED'] } } });
  }
  async create(requestId: string, studentId: string, message: string) {
    return prisma.helpProposal.create({ data: { requestId, studentId, message } });
  }
  async reject(proposalId: string) {
    await prisma.helpProposal.update({ where: { id: proposalId }, data: { status: 'REJECTED' } });
  }
}
