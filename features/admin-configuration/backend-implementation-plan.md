# Backend Implementation Plan: Admin Configuration API

## Overview
This document outlines the complete backend implementation for the Admin Configuration API, including database schema, API routes, and data validation.

## File Structure
```
app/api/
└── configs/
    ├── route.ts              # GET (fetch all) and PATCH (save all)
    └── [id]/
        └── route.ts          # Optional: Individual config operations

prisma/
└── schema.prisma             # Database schema updates
```

---

## Step 1: Database Schema (`prisma/schema.prisma`)

Add the following models to your Prisma schema:

```prisma
// Configuration Group (e.g., "Company name", "Contractor name")
model ConfigGroup {
  id        String   @id @default(cuid())
  key       String   @unique // 'company_name', 'contractor_name', etc.
  name      String   // Display name: 'Company name', 'Contractor name'
  icon_name String?  // Optional: Store icon identifier if needed
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  items     ConfigItem[]

  @@map("config_groups")
}

// Configuration Item (e.g., "Acme Corp", "John's Construction")
model ConfigItem {
  id            String   @id @default(cuid())
  config_key    String   // Foreign key to ConfigGroup.key
  label         String   // The actual value: "Acme Corp"
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  config_group  ConfigGroup @relation(fields: [config_key], references: [key], onDelete: Cascade)

  @@map("config_items")
  @@index([config_key])
}
```

**Migration Command:**
```bash
npx prisma migrate dev --name add_config_tables
```

---

## Step 2: Seed Data (`prisma/seed.ts` or separate seed file)

Create initial configuration groups:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const configGroups = [
  {
    key: 'company_name',
    name: 'Company name',
    icon_name: 'Building2',
    items: [
      { label: 'Acme Corporation' },
      { label: 'Tech Solutions Inc' },
    ],
  },
  {
    key: 'contractor_name',
    name: 'Contractor name',
    icon_name: 'Wrench',
    items: [
      { label: "John's Construction" },
      { label: 'BuildRight LLC' },
    ],
  },
  {
    key: 'lender_name',
    name: 'Lender name',
    icon_name: 'Banknote',
    items: [
      { label: 'First National Bank' },
      { label: 'Community Credit Union' },
    ],
  },
  {
    key: 'title_company_name',
    name: 'Title company name',
    icon_name: 'FileText',
    items: [
      { label: 'Secure Title Co' },
      { label: 'Premier Title Services' },
    ],
  },
  {
    key: 'project_name_or_address',
    name: 'Project name or address',
    icon_name: 'MapPin',
    items: [
      { label: '123 Main Street' },
      { label: 'Sunset Apartments' },
    ],
  },
  {
    key: 'realtor_name',
    name: 'Realtor name',
    icon_name: 'User',
    items: [
      { label: 'Jane Smith' },
      { label: 'Bob Johnson' },
    ],
  },
  {
    key: 'realtor_phone',
    name: 'Realtor phone',
    icon_name: 'Phone',
    items: [
      { label: '(555) 123-4567' },
      { label: '(555) 987-6543' },
    ],
  },
  {
    key: 'realtor_email',
    name: 'Realtor email',
    icon_name: 'Mail',
    items: [
      { label: 'jane@example.com' },
      { label: 'bob@example.com' },
    ],
  },
];

async function seed() {
  for (const group of configGroups) {
    await prisma.configGroup.upsert({
      where: { key: group.key },
      update: {},
      create: {
        key: group.key,
        name: group.name,
        icon_name: group.icon_name,
        items: {
          create: group.items.map((item) => ({
            label: item.label,
          })),
        },
      },
    });
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run seed:**
```bash
npx prisma db seed
# or
npx ts-node prisma/seed.ts
```

---

## Step 3: API Route - GET and PATCH (`app/api/configs/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/configs
 * Fetch all configuration groups with their items
 */
export async function GET() {
  try {
    const configGroups = await prisma.configGroup.findMany({
      include: {
        items: {
          orderBy: {
            created_at: 'asc',
          },
        },
      },
      orderBy: {
        key: 'asc',
      },
    });

    // Transform to match frontend expected format
    const response = {
      configs: configGroups.map((group) => ({
        id: group.id,
        key: group.key,
        name: group.name,
        icon: group.icon_name, // Frontend will map this to LucideIcon
        items: group.items.map((item) => ({
          id: item.id,
          label: item.label,
          created_at: item.created_at.toISOString(),
          updated_at: item.updated_at.toISOString(),
        })),
      })),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configurations' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/configs
 * Save all configuration changes (upsert pattern)
 * 
 * Request body:
 * {
 *   configs: [
 *     {
 *       key: "company_name",
 *       items: [
 *         { id: "123", label: "Acme Corp" },
 *         { id: "new-uuid", label: "New Company" } // New items have client-generated IDs
 *       ]
 *     }
 *   ]
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { configs } = body;

    if (!Array.isArray(configs)) {
      return NextResponse.json(
        { error: 'Invalid request: configs must be an array' },
        { status: 400 }
      );
    }

    // Validate each config group
    for (const config of configs) {
      if (!config.key || !Array.isArray(config.items)) {
        return NextResponse.json(
          { error: 'Invalid config structure' },
          { status: 400 }
        );
      }

      // Validate items
      for (const item of config.items) {
        if (!item.label || typeof item.label !== 'string' || !item.label.trim()) {
          return NextResponse.json(
            { error: `Invalid item label in config ${config.key}` },
            { status: 400 }
          );
        }
      }
    }

    // Process each config group
    const results = await Promise.all(
      configs.map(async (config) => {
        // Get or create the config group
        const group = await prisma.configGroup.upsert({
          where: { key: config.key },
          update: {
            name: config.name, // Update name if provided
            updated_at: new Date(),
          },
          create: {
            key: config.key,
            name: config.name || config.key,
            icon_name: config.icon_name,
          },
        });

        // Get existing items for this group
        const existingItems = await prisma.configItem.findMany({
          where: { config_key: config.key },
        });

        const existingItemIds = new Set(existingItems.map((item) => item.id));
        const incomingItemIds = new Set(
          config.items.filter((item: any) => item.id && !item.id.startsWith('temp-')).map((item: any) => item.id)
        );

        // Items to delete (exist in DB but not in incoming data)
        const itemsToDelete = existingItems.filter(
          (item) => !incomingItemIds.has(item.id)
        );

        // Delete removed items
        if (itemsToDelete.length > 0) {
          await prisma.configItem.deleteMany({
            where: {
              id: { in: itemsToDelete.map((item) => item.id) },
            },
          });
        }

        // Process items (create new, update existing)
        const itemOperations = config.items.map(async (item: any) => {
          // Check if item exists in database
          const existingItem = existingItems.find((i) => i.id === item.id);

          if (existingItem) {
            // Update existing item if label changed
            if (existingItem.label !== item.label) {
              return prisma.configItem.update({
                where: { id: item.id },
                data: {
                  label: item.label.trim(),
                  updated_at: new Date(),
                },
              });
            }
            return existingItem;
          } else {
            // Create new item (use provided ID if valid, otherwise generate)
            const itemId = item.id && !item.id.startsWith('temp-') 
              ? item.id 
              : undefined;

            return prisma.configItem.create({
              data: {
                id: itemId,
                config_key: config.key,
                label: item.label.trim(),
              },
            });
          }
        });

        await Promise.all(itemOperations);

        // Fetch updated group with items
        const updatedGroup = await prisma.configGroup.findUnique({
          where: { key: config.key },
          include: {
            items: {
              orderBy: {
                created_at: 'asc',
              },
            },
          },
        });

        return updatedGroup;
      })
    );

    // Transform response to match frontend format
    const response = {
      configs: results.map((group) => ({
        id: group!.id,
        key: group!.key,
        name: group!.name,
        icon: group!.icon_name,
        items: group!.items.map((item) => ({
          id: item.id,
          label: item.label,
          created_at: item.created_at.toISOString(),
          updated_at: item.updated_at.toISOString(),
        })),
      })),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error saving configs:', error);
    return NextResponse.json(
      { error: 'Failed to save configurations' },
      { status: 500 }
    );
  }
}
```

---

## Step 4: Type Definitions (Optional - for backend type safety)

Create `lib/types/config-api.types.ts`:

```typescript
export interface ConfigItemApi {
  id: string;
  label: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConfigGroupApi {
  id: string;
  key: string;
  name: string;
  icon?: string;
  items: ConfigItemApi[];
}

export interface GetConfigsResponse {
  configs: ConfigGroupApi[];
}

export interface SaveConfigsRequest {
  configs: ConfigGroupApi[];
}

export interface SaveConfigsResponse {
  configs: ConfigGroupApi[];
}
```

---

## Step 5: Error Handling & Validation

### Validation Schema (using Zod - optional but recommended)

```typescript
// lib/validations/config.validation.ts
import { z } from 'zod';

export const ConfigItemSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1).max(255),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const ConfigGroupSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  icon: z.string().optional(),
  items: z.array(ConfigItemSchema),
});

export const SaveConfigsRequestSchema = z.object({
  configs: z.array(ConfigGroupSchema).min(1),
});
```

Update PATCH handler to use validation:

```typescript
import { SaveConfigsRequestSchema } from '@/lib/validations/config.validation';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = SaveConfigsRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { configs } = validationResult.data;
    // ... rest of the logic
  } catch (error) {
    // ...
  }
}
```

---

## Step 6: Authentication & Authorization (if needed)

If you need to protect these endpoints:

```typescript
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check if user has admin role
  // ... your authorization logic

  // ... rest of GET logic
}
```

---

## Step 7: API Response Format

### GET Response:
```json
{
  "configs": [
    {
      "id": "clx123...",
      "key": "company_name",
      "name": "Company name",
      "icon": "Building2",
      "items": [
        {
          "id": "clx456...",
          "label": "Acme Corporation",
          "created_at": "2024-01-01T00:00:00.000Z",
          "updated_at": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

### PATCH Request:
```json
{
  "configs": [
    {
      "key": "company_name",
      "name": "Company name",
      "items": [
        {
          "id": "clx456...",
          "label": "Acme Corporation Updated"
        },
        {
          "id": "new-uuid-from-client",
          "label": "New Company"
        }
      ]
    }
  ]
}
```

### PATCH Response:
Same format as GET response (returns updated configs).

---

## Step 8: Database Indexes & Performance

Add indexes for better query performance:

```prisma
model ConfigItem {
  // ... existing fields

  @@index([config_key, label]) // For filtering/searching
  @@index([created_at])         // For ordering
}
```

---

## Step 9: Transaction Safety

The PATCH endpoint uses `Promise.all` which is not transactional. For true atomicity, wrap in a transaction:

```typescript
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { configs } = body;

    // Use Prisma transaction for atomicity
    const results = await prisma.$transaction(async (tx) => {
      const processedConfigs = [];

      for (const config of configs) {
        // ... all database operations using `tx` instead of `prisma`
        const group = await tx.configGroup.upsert({ ... });
        // ... etc
      }

      return processedConfigs;
    });

    // ... return response
  } catch (error) {
    // ...
  }
}
```

---

## Step 10: Testing the API

### Test GET endpoint:
```bash
curl http://localhost:3000/api/configs
```

### Test PATCH endpoint:
```bash
curl -X PATCH http://localhost:3000/api/configs \
  -H "Content-Type: application/json" \
  -d '{
    "configs": [
      {
        "key": "company_name",
        "name": "Company name",
        "items": [
          {
            "id": "existing-id",
            "label": "Updated Company"
          },
          {
            "id": "new-uuid",
            "label": "New Company"
          }
        ]
      }
    ]
  }'
```

---

## Implementation Checklist

### Database
- [ ] Add `ConfigGroup` model to Prisma schema
- [ ] Add `ConfigItem` model to Prisma schema
- [ ] Run migration: `npx prisma migrate dev`
- [ ] Create seed data script
- [ ] Run seed: `npx prisma db seed`

### API Routes
- [ ] Create `app/api/configs/route.ts`
- [ ] Implement GET handler
- [ ] Implement PATCH handler
- [ ] Add request validation
- [ ] Add error handling
- [ ] Add authentication/authorization (if needed)
- [ ] Test GET endpoint
- [ ] Test PATCH endpoint

### Optional Enhancements
- [ ] Add Zod validation schemas
- [ ] Add transaction support for atomicity
- [ ] Add database indexes for performance
- [ ] Add logging/monitoring
- [ ] Add rate limiting
- [ ] Add caching (Redis) for GET requests

---

## Error Scenarios to Handle

1. **Invalid request body**: Return 400 with error message
2. **Missing required fields**: Return 400 with validation errors
3. **Database connection error**: Return 500 with generic error
4. **Duplicate key violation**: Return 409 Conflict
5. **Foreign key constraint**: Return 400 with specific error
6. **Unauthorized access**: Return 401
7. **Forbidden access**: Return 403

---

## Performance Considerations

1. **Batch Operations**: The PATCH endpoint processes all configs in parallel using `Promise.all`
2. **Database Indexes**: Ensure indexes on `config_key` and frequently queried fields
3. **Pagination**: If configs grow large, consider pagination for GET (not needed initially)
4. **Caching**: Consider caching GET responses if data doesn't change frequently
5. **Connection Pooling**: Ensure Prisma connection pool is configured appropriately

---

## Security Considerations

1. **Input Validation**: Always validate and sanitize input
2. **SQL Injection**: Prisma handles this, but ensure no raw queries
3. **Rate Limiting**: Consider rate limiting on PATCH endpoint
4. **Authentication**: Verify user is authenticated and authorized
5. **CSRF Protection**: Next.js API routes have CSRF protection by default
6. **XSS Prevention**: Sanitize string inputs before storing

---

## Next Steps After Implementation

1. Update frontend `configThunks.ts` to use real API endpoints
2. Remove mock data hooks
3. Test end-to-end flow
4. Add error boundaries in frontend
5. Add loading states and user feedback
6. Add success notifications
7. Consider adding audit logging for changes
8. Consider adding soft deletes instead of hard deletes
