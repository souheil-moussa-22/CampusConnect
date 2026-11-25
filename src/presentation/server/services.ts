import { CampusApplication } from '@/application/use-cases';
import { PrismaCampusRepository } from '@/infrastructure/repositories/prisma-campus-repository';
import { BcryptPasswordHasher } from '@/infrastructure/security/bcrypt-password-hasher';
import {
  AcceptHelpProposal,
  RejectHelpProposal,
} from '@/modules/proposals/application/use-cases';

const campusRepository = new PrismaCampusRepository();
export const campusApplication = new CampusApplication(campusRepository);
export const passwordHasher = new BcryptPasswordHasher();

export const proposalApplication = {
  accept: new AcceptHelpProposal(campusRepository),
  reject: new RejectHelpProposal(campusRepository),
};
