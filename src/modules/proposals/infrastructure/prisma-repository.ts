import { prisma } from '@/lib/prisma';
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
  async acceptAtomically(proposalId: string, requestId: string, ownerId: string, helpingStudentId: string) {
    await prisma.$transaction(async tx => {
      await tx.helpProposal.update({ where: { id: proposalId }, data: { status: 'ACCEPTED' } });
      await tx.helpProposal.updateMany({ where: { requestId, id: { not: proposalId }, status: 'PENDING' }, data: { status: 'REJECTED' } });
      await tx.helpRequest.update({ where: { id: requestId }, data: { status: 'HELP_ACCEPTED' } });
      await tx.studySession.create({ data: { requestId, ownerId, helpingStudentId, date: new Date(Date.now() + 86400000), duration: 60, meetingMode: 'ONLINE', meetingUrl: 'https://meet.google.com/campus-connect' } });
      await tx.notification.createMany({ data: [
        { recipientId: helpingStudentId, type: 'PROPOSAL_ACCEPTED', message: 'Your proposal was accepted. A study session is scheduled.' },
        { recipientId: ownerId, type: 'SESSION_CREATED', message: 'A study session was created for your accepted proposal.' }
      ] });
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
