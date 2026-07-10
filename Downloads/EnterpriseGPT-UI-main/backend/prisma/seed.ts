import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_AGENT_CONFIG_ID = '00000000-0000-0000-0000-000000000002';
const DEFAULT_ADMIN_EMAIL = 'admin@enterprisegpt.local';
const DEFAULT_ADMIN_PASSWORD = 'Admin@12345';

async function main(): Promise<void> {
  const organization = await prisma.organization.upsert({
    where: { id: DEFAULT_ORG_ID },
    update: {},
    create: { id: DEFAULT_ORG_ID, organizationName: 'Default Organization' },
  });

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);

  await prisma.user.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    update: {},
    create: {
      name: 'System Administrator',
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      role: Role.ADMIN,
      organizationId: organization.id,
    },
  });

  await prisma.agentConfiguration.upsert({
    where: { id: DEFAULT_AGENT_CONFIG_ID },
    update: {},
    create: {
      id: DEFAULT_AGENT_CONFIG_ID,
      agentName: process.env.PURPLE_FABRIC_AGENT_NAME ?? 'EnterpriseGPT Agent',
      agentEndpoint: process.env.PURPLE_FABRIC_ENDPOINT ?? 'https://api.intellectseecapps.com',
      apiVersion: process.env.PURPLE_FABRIC_API_VERSION ?? 'v1',
      workspaceId: process.env.PURPLE_FABRIC_WORKSPACE_ID ?? 'replace-with-workspace-id',
      assetVersionId: process.env.PURPLE_FABRIC_ASSET_VERSION_ID ?? 'replace-with-asset-version-id',
      organizationId: organization.id,
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Seed complete. Admin login: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
