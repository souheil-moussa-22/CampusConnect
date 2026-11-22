import { describe, expect, it } from 'vitest';
import { ProposalRules } from '../../src/modules/proposals/domain/entities';
import { AcceptHelpProposal } from '../../src/modules/proposals/application/use-cases';

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
});
