# Supabase Integration Guide

## Database Setup

### 1. Run SQL Scripts in Supabase

Execute the SQL scripts in your Supabase SQL Editor:

1. `scripts/01-init-database.sql` - Creates users, sessions tables
2. `scripts/02-add-tables.sql` - Creates lab_tests, lab_requests, lab_reports tables

### 2. Environment Variables

Make sure you have these in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Implementation Steps

### Step 1: Get Current User in API Routes

For each API route, you need to get the current authenticated user:

```typescript
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { createClient } from "@/lib/supabase/server"

// In your API route:
const supabase = await createClient()
const { data: { user }, error } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

const userId = user.id
```

### Step 2: Implement CRUD Operations

#### Example: GET Tests

```typescript
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: tests, error } = await supabase
      .from('lab_tests')
      .select('*')
      .eq('lab_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ tests }, { status: 200 })
  } catch (error) {
    console.error("Error fetching tests:", error)
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 })
  }
}
```

#### Example: POST Test

```typescript
export async function POST(request: NextRequest) {
  try {
    const { testName, price, description } = await request.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!testName || !price || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('lab_tests')
      .insert({
        lab_id: user.id,
        test_name: testName,
        price: price,
        description: description
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, test: data }, { status: 201 })
  } catch (error) {
    console.error("Error creating test:", error)
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 })
  }
}
```

#### Example: PATCH Test

```typescript
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { testName, price, description } = await request.json()
    const { id } = params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('lab_tests')
      .update({
        test_name: testName,
        price: price,
        description: description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('lab_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, test: data }, { status: 200 })
  } catch (error) {
    console.error("Error updating test:", error)
    return NextResponse.json({ error: "Failed to update test" }, { status: 500 })
  }
}
```

#### Example: DELETE Test

```typescript
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
      .from('lab_tests')
      .delete()
      .eq('id', id)
      .eq('lab_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true, message: "Test deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting test:", error)
    return NextResponse.json({ error: "Failed to delete test" }, { status: 500 })
  }
}
```

## Data Mapping

### API Request → Database
```typescript
{
  testName → test_name
  price → price
  description → description
  labId → lab_id (from auth.user.id)
}
```

### Database → API Response
```typescript
{
  id → id
  test_name → testName
  price → price
  description → description
  lab_id → labId
}
```

## Testing the Implementation

1. Run the SQL scripts in Supabase
2. Update the API routes with the code above
3. Test in the application:
   - Add a test
   - Edit a test
   - Delete a test
   - Verify data appears in Supabase dashboard

