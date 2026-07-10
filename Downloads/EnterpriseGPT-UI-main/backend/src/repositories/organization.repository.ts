import { Organization } from '@prisma/client';
import { prisma } from '../database/prisma';

export const organizationRepository = {
  findById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({ where: { id } });
  },

  create(organizationName: string): Promise<Organization> {
    return prisma.organization.create({ data: { organizationName } });
  },
};
