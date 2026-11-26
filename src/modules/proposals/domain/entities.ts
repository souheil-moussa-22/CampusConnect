import { DomainError } from '@/domain/errors';

export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export { DomainError } from '@/domain/errors';
export class ProposalRules {
  static cannotHelpOwnRequest(requestAuthorId: string, studentId: string) {
    if (requestAuthorId === studentId) throw new DomainError('You cannot submit a proposal to your own request');
  }
  static requestAcceptable(status: string) {
    if (status !== 'OPEN') throw new DomainError('This request is closed or completed');
  }
  static proposalPending(status: string) {
    if (status !== 'PENDING') throw new DomainError('Proposal is no longer pending');
  }
}
