import type { ProposalStatus } from '../domain/entities';
export interface ProposalRecord { id: string; requestId: string; studentId: string; status: ProposalStatus }
export interface ProposalRepository {
  findRequest(requestId: string): Promise<{ id: string; authorId: string; status: string } | null>;
  findById(id: string): Promise<(ProposalRecord & { request: { id: string; authorId: string; status: string }; studentId: string }) | null>;
  acceptAtomically(proposalId: string, requestId: string, ownerId: string, helpingStudentId: string): Promise<void>;
  findDuplicate(requestId: string, studentId: string): Promise<ProposalRecord | null>;
  create(requestId: string, studentId: string, message: string): Promise<ProposalRecord>;
  reject(proposalId: string): Promise<void>;
}
