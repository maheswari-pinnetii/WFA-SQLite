/**
 * BaaS Architecture Integration Blueprint Module
 * Details how modern APIs replace custom backend infrastructure (Clerk, Uploadthing, Resend, Supabase, Trigger.dev).
 */

export interface BaaSServiceSpec {
  name: string;
  category: string;
  customBackendFeaturesReplaced: string[];
  architecturalBenefits: string[];
  integrationCodeSnippet: string;
  statusInPlatform: 'EVALUATED' | 'MAPPED' | 'READY_FOR_INTEGRATION';
}

export class BaaSServiceRegistry {
  private services: Record<string, BaaSServiceSpec> = {
    clerk: {
      name: 'Clerk',
      category: 'Authentication & User Management',
      customBackendFeaturesReplaced: [
        'Custom Argon2id Hashing & Password Storage',
        'JWT Session Issuance & Cookie Handling',
        'Biometric WebAuthn Passkey Server Logic',
        'TOTP 2FA QR Code & Recovery Code Infrastructure',
        'RBAC Claims & User Metadata Management'
      ],
      architecturalBenefits: [
        'Zero custom auth vulnerabilities or password leaks',
        'Out-of-the-box support for SSO, Passkeys, OAuth & MFA',
        'Seamless frontend hooks (@clerk/clerk-react) and backend token middleware'
      ],
      integrationCodeSnippet: `import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';\napp.use(ClerkExpressWithAuth());`,
      statusInPlatform: 'MAPPED'
    },
    uploadthing: {
      name: 'Uploadthing',
      category: 'File Storage & Asset Management',
      customBackendFeaturesReplaced: [
        'Custom Multer Disk File Upload Middleware',
        'S3 Presigned URL & ACL Server Logic',
        'Local File System Storage & Static Directory Serving',
        'File Format Validation & Image Compression Servers'
      ],
      architecturalBenefits: [
        'Type-safe upload routes for TypeScript full-stack apps',
        'Direct browser-to-CDN uploading bypassing API node memory',
        'Instant image transformations & server action callbacks'
      ],
      integrationCodeSnippet: `import { createUploadthing, type FileRouter } from "uploadthing/express";\nconst f = createUploadthing();`,
      statusInPlatform: 'MAPPED'
    },
    resend: {
      name: 'Resend',
      category: 'Transactional Email Delivery Engine',
      customBackendFeaturesReplaced: [
        'Nodemailer / SMTP Server Maintenance',
        'Custom Outbound Email Queues & Worker Threads',
        'HTML Email Template Compilers',
        'Bounce & Spam Reputation Management Servers'
      ],
      architecturalBenefits: [
        'Serverless React Email template support',
        'Sub-100ms transactional email HTTP API dispatch',
        'Built-in domain verification and webhook delivery tracking'
      ],
      integrationCodeSnippet: `import { Resend } from 'resend';\nconst resend = new Resend(process.env.RESEND_API_KEY);\nawait resend.emails.send({ from: 'auth@thestackly.com', to, subject, react: WelcomeEmail() });`,
      statusInPlatform: 'MAPPED'
    },
    supabase: {
      name: 'Supabase',
      category: 'Backend-as-a-Service (DB, Auth, Storage, Edge)',
      customBackendFeaturesReplaced: [
        'Custom Database Server Connection Pool Management',
        'Manual Express REST CRUD Endpoint Boilerplate',
        'Custom Row-Level Tenant Security Code',
        'Custom WebSocket Real-Time Subscription Infrastructure'
      ],
      architecturalBenefits: [
        'Postgres database engine with built-in Row-Level Security (RLS)',
        'Auto-generated REST and GraphQL APIs directly over DB schemas',
        'Realtime database change push notifications'
      ],
      integrationCodeSnippet: `import { createClient } from '@supabase/supabase-js';\nconst supabase = createClient(SUPABASE_URL, SUPABASE_KEY);`,
      statusInPlatform: 'MAPPED'
    },
    triggerDev: {
      name: 'Trigger.dev',
      category: 'Background Jobs & Async Workflow Orchestration',
      customBackendFeaturesReplaced: [
        'Redis / BullMQ Async Job Queue Clusters',
        'node-cron Scheduled Background Jobs',
        'Long-running Task Process Isolation & Memory Leaks',
        'Custom Job Retry & Backoff Logic'
      ],
      architecturalBenefits: [
        'Code-first background job definition in TypeScript with zero infrastructure',
        'Step-level retry, execution pause, and live web UI observability',
        'Support for long execution times (up to hours) for heavy HR payroll runs'
      ],
      integrationCodeSnippet: `import { task } from "@trigger.dev/sdk/v3";\nexport const calculatePayrollTask = task({ id: "calc-payroll", run: async (payload) => { ... } });`,
      statusInPlatform: 'MAPPED'
    }
  };

  public getBaaSServices(): Record<string, BaaSServiceSpec> {
    return this.services;
  }
}

export const baaSServiceRegistry = new BaaSServiceRegistry();
