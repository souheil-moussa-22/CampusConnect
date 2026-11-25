import { describe, expect, it } from 'vitest';
import { ProposalRules } from '../../src/modules/proposals/domain/entities';
import { AcceptHelpProposal } from '../../src/modules/proposals/application/use-cases';
import type { ProposalRepository } from '../../src/modules/proposals/application/ports';

describe('proposal business rules', () => {
  it('rejects self-help', () => { expect(() => ProposalRules.cannotHelpOwnRequest('u1','u1')).toThrow(); });
  it('rejects accepting a closed request', () => { expect(() => ProposalRules.requestAcceptable('COMPLETED')).toThrow(); });
  it('rejects unauthorized acceptance', async () => {
    const repository = { findRequest: async () => ({id:'r1',authorId:'u1',status:'OPEN'}), findById: async () => ({id:'p1',requestId:'r1',studentId:'u2',status:'PENDING' as const,request:{id:'r1',authorId:'u1',status:'OPEN'}}), acceptAtomically: async()=>{}, findDuplicate:async()=>null, create:async()=>({id:'p2',requestId:'r1',studentId:'u3',status:'PENDING' as const}), reject:async()=>{} };
    await expect(new AcceptHelpProposal(repository).execute('u3','p1')).rejects.toThrow('Only the request owner');
  });
});

import { CreateHelpProposal } from '../../src/modules/proposals/application/use-cases';

describe('CreateHelpProposal', () => {
  it('rejects a student proposing to themselves', async () => {
    const repository = { findRequest: async () => ({id:'r1',authorId:'u1',status:'OPEN'}), findDuplicate:async()=>null, create:async()=>({id:'p1',requestId:'r1',studentId:'u1',status:'PENDING' as const}), findById:async()=>null, acceptAtomically:async()=>{}, reject:async()=>{} };
    await expect(new CreateHelpProposal(repository).execute('u1','r1','I can help')).rejects.toThrow('own request');
  });
  it('rejects proposals for closed requests', async () => {
    const repository = { findRequest: async () => ({id:'r1',authorId:'u1',status:'COMPLETED'}), findDuplicate:async()=>null, create:async()=>({id:'p1',requestId:'r1',studentId:'u2',status:'PENDING' as const}), findById:async()=>null, acceptAtomically:async()=>{}, reject:async()=>{} };
    await expect(new CreateHelpProposal(repository).execute('u2','r1','I can help')).rejects.toThrow('closed');
  });
  it('rejects messages shorter than the presentation requirement', async () => {
    const repository = { findRequest: async () => ({id:'r1',authorId:'u1',status:'OPEN'}), findDuplicate:async()=>null, create:async()=>({id:'p1',requestId:'r1',studentId:'u2',status:'PENDING' as const}), findById:async()=>null, acceptAtomically:async()=>{}, reject:async()=>{} };
    await expect(new CreateHelpProposal(repository).execute('u2','r1','Too short')).rejects.toThrow('at least 10 characters');
  });
});

describe('AcceptHelpProposal', () => {
  it('passes the session plan and notifications to the repository port', async () => {
    const requests: Parameters<ProposalRepository['acceptAtomically']>[0][] = [];
    const repository: ProposalRepository = {
      findRequest: async () => null,
      findById: async () => ({
        id: 'p1',
        requestId: 'r1',
        studentId: 'u2',
        status: 'PENDING',
        request: { id: 'r1', authorId: 'u1', status: 'OPEN' },
      }),
      acceptAtomically: async input => { requests.push(input); },
      findDuplicate: async () => null,
      create: async () => ({ id: 'p2', requestId: 'r1', studentId: 'u2', status: 'PENDING' }),
      reject: async () => {},
    };

    await new AcceptHelpProposal(repository).execute('u1', 'p1');

    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      proposalId: 'p1',
      requestId: 'r1',
      ownerId: 'u1',
      helpingStudentId: 'u2',
      duration: 60,
      meetingMode: 'ONLINE',
      meetingUrl: 'https://meet.google.com/campus-connect',
      notifications: [
        { recipientId: 'u2', type: 'PROPOSAL_ACCEPTED' },
        { recipientId: 'u1', type: 'SESSION_CREATED' },
      ],
    });
    expect(requests[0].sessionDate.getTime()).toBeGreaterThan(Date.now());
  });
});
