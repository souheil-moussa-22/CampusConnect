import { ProposalRules, DomainError } from '../domain/entities';
import type { ProposalRepository } from './ports';

export class CreateHelpProposal {
  constructor(private repository: ProposalRepository) {}
  async execute(actorId: string, requestId: string, message: string) {
    if (message.trim().length < 10) throw new DomainError('Proposal message must be at least 10 characters');
    const request = await this.repository.findRequest(requestId);
    if (!request) throw new DomainError('Request not found');
    ProposalRules.cannotHelpOwnRequest(request.authorId, actorId);
    ProposalRules.requestAcceptable(request.status);
    const duplicate = await this.repository.findDuplicate(requestId, actorId);
    if (duplicate) throw new DomainError('You already submitted a proposal for this request');
    return this.repository.create(requestId, actorId, message);
  }
}

export class AcceptHelpProposal {
  constructor(private repository: ProposalRepository) {}
  async execute(actorId: string, proposalId: string) {
    const proposal = await this.repository.findById(proposalId);
    if (!proposal) throw new DomainError('Proposal not found');
    if (proposal.request.authorId !== actorId) throw new DomainError('Only the request owner can accept proposals');
    ProposalRules.requestAcceptable(proposal.request.status);
    ProposalRules.proposalPending(proposal.status);
    await this.repository.acceptAtomically({
      proposalId: proposal.id,
      requestId: proposal.requestId,
      ownerId: actorId,
      helpingStudentId: proposal.studentId,
      sessionDate: new Date(Date.now() + 86400000),
      duration: 60,
      meetingMode: 'ONLINE',
      meetingUrl: 'https://meet.google.com/campus-connect',
      notifications: [
        {
          recipientId: proposal.studentId,
          type: 'PROPOSAL_ACCEPTED',
          message: 'Your proposal was accepted. A study session is scheduled.',
        },
        {
          recipientId: actorId,
          type: 'SESSION_CREATED',
          message: 'A study session was created for your accepted proposal.',
        },
      ],
    });
  }
}

export class RejectHelpProposal {
  constructor(private repository: ProposalRepository) {}
  async execute(actorId: string, proposalId: string) {
    const proposal = await this.repository.findById(proposalId);
    if (!proposal) throw new DomainError('Proposal not found');
    if (proposal.request.authorId !== actorId) throw new DomainError('Only the request owner can reject proposals');
    ProposalRules.proposalPending(proposal.status);
    await this.repository.reject(proposalId);
  }
}
