# PENJELASAN KODE DETAIL (LINE-BY-LINE)
## Sistem Penilaian Sekolah Dasar

---

## 📘 PENGANTAR

Dokumen ini berisi penjelasan **baris per baris** untuk file-file kunci dalam project. Setiap statement code dijelaskan secara detail untuk memudahkan pemahaman alur dan logika program.

---

## 1. AUTHENTICATION SYSTEM

### File: `src/lib/auth.ts`

**Baris 1-5: Import Dependencies**
```typescript
import { NextAuthOptions } from 'next-auth'
```
- Import tipe `NextAuthOptions` dari library next-auth
- Tipe ini digunakan untuk type-safe configuration authentication

```typescript
import CredentialsProvider from 'next-auth/providers/credentials'
```
- Import provider untuk authentication dengan username/password
- Alternative providers: Google, GitHub, Facebook, dll
- Credentials cocok untuk custom authentication system

```typescript
import { PrismaAdapter } from '@next-auth/prisma-adapter'
```
- Import adapter untuk integrasi NextAuth dengan Prisma ORM
- Adapter ini handle database operations untuk:
  - Store user accounts
  - Manage sessions
  - Handle tokens

```typescript
import { prisma } from './prisma'
```
- Import Prisma client singleton dari file prisma.ts
- Singleton pattern memastikan hanya ada 1 database connection

```typescript
import bcrypt from 'bcryptjs'
```
- Import bcrypt library untuk password hashing
- bcryptjs adalah pure JavaScript implementation (no native dependencies)
- Digunakan untuk hash password saat register dan verify saat login

**Baris 7-10: Define Auth Options**
```typescript
export const authOptions: NextAuthOptions = {
```
- Export configuration object untuk NextAuth
- Type annotation `NextAuthOptions` untuk type safety

```typescript
  adapter: PrismaAdapter(prisma),
```
- Set Prisma sebagai database adapter
- Melewatkan prisma client ke adapter
- Adapter akan create/update User, Account, Session tables

**Baris 11-50: Configure Providers**
```typescript
  providers: [
```
- Array of authentication providers yang digunakan
- Bisa multiple providers (Credentials + Google + GitHub, dll)

```typescript
    CredentialsProvider({
```
- Configure provider untuk username/password authentication
- Custom authentication logic

```typescript
      name: 'Credentials',
```
- Display name untuk provider
- Muncul di UI login page

```typescript
      credentials: {
```
- Define fields yang diperlukan untuk login
- Ini adalah schema/structure dari login form

```typescript
        email: { label: "Email", type: "email" },
```
- Field email dengan type email (HTML5 validation)
- Label akan muncul jika NextAuth generate form

```typescript
        password: { label: "Password", type: "password" },
```
- Field password dengan type password (hidden input)

```typescript
      },
      async authorize(credentials) {
```
- Main authentication logic
- Function ini dipanggil saat user attempt login
- Credentials berisi email dan password dari form
- Return user object jika success, null jika failed

```typescript
        if (!credentials?.email || !credentials?.password) {
```
- Validate bahwa email dan password ada
- credentials optional (?) jadi perlu check existence

```typescript
          throw new Error('Email dan password harus diisi')
```
- Throw error jika validation failed
- Error message akan ditangkap oleh NextAuth dan displayed

```typescript
        }
```

```typescript
        const user = await prisma.user.findUnique({
```
- Query database untuk find user by email
- findUnique karena email adalah unique field

```typescript
          where: { email: credentials.email },
```
- WHERE clause: filter by email from credentials

```typescript
        })
```

```typescript
        if (!user || !user.password) {
```
- Check 2 conditions:
  - User tidak ditemukan di database
  - User ada tapi tidak punya password (OAuth user?)

```typescript
          throw new Error('Email atau password salah')
```
- Generic error message untuk security
- Tidak spesifik email/password untuk prevent enumeration attack

```typescript
        }
```

```typescript
        const isPasswordValid = await bcrypt.compare(
```
- Compare plaintext password dengan hashed password
- bcrypt.compare is async function
- Securely compare without decrypting hash

```typescript
          credentials.password,    // Plaintext dari form
```

```typescript
          user.password            // Hashed dari database
```

```typescript
        )
```

```typescript
        if (!isPasswordValid) {
```
- Check hasil comparison
- false berarti password tidak match

```typescript
          throw new Error('Email atau password salah')
```
- Same generic error message

```typescript
        }
```

```typescript
        return {
```
- Return user object untuk create session
- Object ini akan masuk ke JWT dan session

```typescript
          id: user.id,              // User ID
          name: user.name,          // Nama lengkap
          email: user.email,        // Email
        }
```

```typescript
      },
    }),
  ],
```

**Baris 52-60: Configure Session**
```typescript
  session: {
```
- Session configuration object

```typescript
    strategy: 'jwt',
```
- Use JWT (JSON Web Token) untuk session
- Alternative: 'database' (store session in DB)
- JWT advantages:
  - Stateless (no database query untuk check session)
  - Scalable
  - Fast
- JWT disadvantages:
  - Cannot revoke immediately
  - Larger cookie size

```typescript
  },
```

**Baris 62-65: Configure Pages**
```typescript
  pages: {
```
- Custom page URLs untuk authentication flows

```typescript
    signIn: '/login',
```
- Redirect ke /login page untuk signin
- Default adalah /api/auth/signin
- Custom page memberi control penuh atas UI

```typescript
  },
```

**Baris 67-90: JWT Callback**
```typescript
  callbacks: {
```
- Callbacks untuk customize behavior NextAuth

```typescript
    async jwt({ token, user }) {
```
- JWT callback dipanggil saat JWT created atau updated
- Parameters:
  - token: current JWT token
  - user: user object (hanya ada saat initial signin)

```typescript
      if (user) {
```
- User hanya ada saat first time create JWT (setelah login success)
- Subsequent requests, user is undefined

```typescript
        token.id = user.id
```
- Add user ID ke JWT token
- Token ini akan di-encrypt dan store di cookie
- ID diperlukan untuk query user-specific data

```typescript
      }
```

```typescript
      return token
```
- Return modified token
- Token ini akan di-store di cookie

```typescript
    },
```

**Baris 92-105: Session Callback**
```typescript
    async session({ session, token }) {
```
- Session callback dipanggil saat get session (getServerSession, useSession)
- Parameters:
  - session: current session object
  - token: decrypted JWT token

```typescript
      if (token && session.user) {
```
- Check token exists dan session.user exists
- Safety check untuk prevent errors

```typescript
        session.user.id = token.id as string
```
- Add user ID dari token ke session object
- Type assertion as string karena token.id bisa any type
- Sekarang session.user.id accessible di components

```typescript
      }
```

```typescript
      return session
```
- Return modified session object
- Object ini yang akan dikembalikan oleh getServerSession()

```typescript
    },
  },
}
```

---

## 2. PRISMA CLIENT SINGLETON

### File: `src/lib/prisma.ts`

**Baris 1-2: Import PrismaClient**
```typescript
import { PrismaClient } from '@prisma/client'
```
- Import PrismaClient class dari @prisma/client package
- Generated by `prisma generate` command
- Based on schema.prisma file
- Type-safe database client

**Baris 4-6: Declare Global Type**
```typescript
declare global {
```
- Extend global namespace
- Needed untuk add property ke global object

```typescript
  var prisma: PrismaClient | undefined
```
- Add 'prisma' property ke global object
- Type: PrismaClient or undefined
- var (not let/const) karena global scope
- Global object persist across hot reloads in development

```typescript
}
```

**Baris 8-14: Create/Reuse Prisma Client**
```typescript
export const prisma = global.prisma || new PrismaClient({
```
- Export prisma client
- Logic: use global.prisma if exists, else create new
- Conditional operator: A || B (if A truthy, return A, else return B)

**Why Singleton Pattern?**
- Development mode: Next.js hot reload creates new module instances
- Without singleton: each hot reload creates new PrismaClient
- Too many clients: "Too many database connections" error
- Singleton: reuse same client across hot reloads

```typescript
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
```
- Configure logging level based on environment
- Development mode: log queries, errors, dan warnings
  - Helpful untuk debugging
  - See exact SQL queries executed
- Production mode: only log errors
  - Less verbose
  - Better performance
  - Cleaner logs

```typescript
})
```

**Baris 16-18: Save to Global**
```typescript
if (process.env.NODE_ENV !== 'production') {
```
- Only save to global in non-production
- Production mode: tidak perlu karena no hot reload

```typescript
  global.prisma = prisma
```
- Save prisma client ke global object
- Persist across hot reloads
- Next hot reload: global.prisma already exists, reuse it

```typescript
}
```

**Summary of Singleton Pattern:**
1. First import: global.prisma is undefined → create new PrismaClient → save to global
2. Hot reload: global.prisma exists → reuse existing client
3. Production: create once, never hot reload, no global needed

---

## 3. REGISTER API ENDPOINT

### File: `src/app/api/register/route.ts`

**Baris 1-5: Import Dependencies**
```typescript
import { NextResponse } from 'next/server'
```
- Import NextResponse untuk create API responses
- Replaces old NextApiResponse
- Used in App Router API routes

```typescript
import { prisma } from '@/lib/prisma'
```
- Import Prisma singleton client
- @ is alias untuk root directory (defined in tsconfig.json)
- Path: /lib/prisma.ts

```typescript
import bcrypt from 'bcryptjs'
```
- Import bcrypt untuk password hashing
- Never store plaintext passwords!
- bcrypt features:
  - One-way hash (cannot decrypt)
  - Salt automatically added
  - Slow by design (prevent brute force)

**Baris 7-20: POST Handler**
```typescript
export async function POST(request: Request) {
```
- Export POST handler function
- async karena akan ada database operations
- request parameter berisi request object dari client
- Type annotation Request untuk type safety

```typescript
  try {
```
- Try-catch untuk error handling
- Catch any errors yang occur dalam block

**Baris 22-25: Parse Request Body**
```typescript
    const body = await request.json()
```
- Parse JSON body dari request
- await karena request.json() returns Promise
- Body berisi data dari client: {name, email, password}

```typescript
    const { name, email, password } = body
```
- Destructure body object
- Extract name, email, password ke separate variables
- ES6 destructuring syntax

**Baris 27-31: Validate Input**
```typescript
    if (!name || !email || !password) {
```
- Validate bahwa semua fields terisi
- Falsy values: null, undefined, '', 0, false
- ! operator check falsy

```typescript
      return NextResponse.json(
```
- Return JSON response

```typescript
        { error: 'Semua field harus diisi' },
```
- Response body: error message object

```typescript
        { status: 400 }
```
- HTTP status 400: Bad Request
- Indicates client error (invalid input)

```typescript
      )
    }
```

**Baris 33-40: Check Email Duplicate**
```typescript
    const existingUser = await prisma.user.findUnique({
```
- Query database untuk check email already exists
- findUnique: find single record by unique field
- Returns user object or null

```typescript
      where: {
        email: email
```
- WHERE clause: filter by email
- email field has @unique constraint in schema
- Can use shorthand: where: { email } (ES6)

```typescript
      }
    })
```

```typescript
    if (existingUser) {
```
- Check if user with this email already exists
- existingUser is truthy if user found

```typescript
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }
```
- Return error response
- Prevent duplicate email accounts
- Good UX: inform user email is taken

**Baris 42-45: Hash Password**
```typescript
    const hashedPassword = await bcrypt.hash(password, 12)
```
- Hash password menggunakan bcrypt
- await karena hashing is async operation
- Parameters:
  - password: plaintext password from user
  - 12: salt rounds (cost factor)
    - Higher = more secure but slower
    - 12 is good balance (recommended: 10-12)
    - Each increment doubles time
    - Makes brute force impractical

**How bcrypt works:**
1. Generate random salt (12 rounds)
2. Combine password + salt
3. Hash multiple times (2^12 = 4096 times)
4. Result: $2a$12$salt+hash (60 chars)

**Baris 47-55: Create User**
```typescript
    const user = await prisma.user.create({
```
- Create new user in database
- create returns created user object
- await karena database operation is async

```typescript
      data: {
```
- data object berisi field values untuk new record

```typescript
        name,
```
- Shorthand untuk name: name
- ES6 property shorthand

```typescript
        email,
```
- User email (unique)

```typescript
        password: hashedPassword,
```
- Store HASHED password, bukan plaintext
- Security best practice

```typescript
      },
    })
```

**Baris 57-62: Return Success Response**
```typescript
    return NextResponse.json(
```
- Return success response

```typescript
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
```
- Response body: user object tanpa password
- Never return password in response!
- Only return public information

```typescript
      { status: 201 }
```
- HTTP status 201: Created
- Indicates resource successfully created

```typescript
    )
```

**Baris 64-75: Error Handling**
```typescript
  } catch (error) {
```
- Catch any errors dari try block
- error berisi error object

```typescript
    console.error('Register error:', error)
```
- Log error untuk debugging
- Helpful untuk troubleshooting
- In production: use proper logging service

```typescript
    return NextResponse.json(
      { error: 'Internal server error' },
```
- Generic error message untuk client
- Don't expose internal error details
- Security: prevent information leakage

```typescript
      { status: 500 }
```
- HTTP status 500: Internal Server Error
- Indicates server-side problem

```typescript
    )
  }
}
```

---

## 4. DASHBOARD LAYOUT COMPONENT

### File: `src/components/dashboard/dashboard-layout.tsx`

**Konsep Utama: Responsive Layout dengan Sidebar**

Layout ini menggunakan pattern yang umum untuk dashboard:
- **Desktop (≥1024px)**: Sidebar fixed di kiri, content di kanan
- **Mobile (<1024px)**: Sidebar slide-out dengan overlay

**Baris 40-60: State Management**

```typescript
const [sidebarOpen, setSidebarOpen] = useState(false)
```
- **Purpose**: Track apakah sidebar terbuka/tertutup di mobile
- **Initial value**: `false` (tertutup)
- **Why useState**: State changes trigger re-render untuk update UI
- **Type**: boolean (true = open, false = closed)

```typescript
const { data: session } = useSession()
```
- **useSession()**: NextAuth hook yang return object `{ data, status }`
- **Destructuring**: Extract `data` dan rename jadi `session`
- **session contains**:
  - `user`: { id, name, email, image }
  - `expires`: timestamp kapan session expire
- **Why needed**: Display user info di sidebar bottom
- **Auto-refresh**: Hook automatically re-fetch when session changes

```typescript
const pathname = usePathname()
```
- **usePathname()**: Next.js navigation hook
- **Returns**: Current route path as string
  - Example: `/dashboard/subjects`
- **Why needed**: Highlight active menu item
- **Re-renders**: Component re-renders when route changes

**Baris 65-75: Responsive Sidebar Classes**

```typescript
<div className={cn(
  "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
  sidebarOpen ? "translate-x-0" : "-translate-x-full"
)}>
```

**Breaking down each class:**

**Positioning (Mobile):**
- `fixed`: Fixed position (tidak scroll dengan page)
- `inset-y-0`: Top 0, Bottom 0 (full height)
- `left-0`: Attached ke left edge
- `z-50`: Z-index 50 (above other content)

**Size:**
- `w-64`: Width = 16rem = 256px

**Appearance:**
- `bg-white`: White background
- `shadow-lg`: Large shadow untuk depth effect

**Animation:**
- `transform`: Enable CSS transforms
- `transition-transform`: Smooth transition pada transform changes
- `duration-300`: Animation duration 300ms
- `ease-in-out`: Smooth start and end

**Desktop Overrides (lg: prefix = 1024px+):**
- `lg:translate-x-0`: Always visible (no transform)
- `lg:static`: Change from fixed to static position
- `lg:inset-0`: Reset inset (not needed for static)

**Conditional Transform (Mobile):**
- `sidebarOpen` true: `translate-x-0` (visible, no transform)
- `sidebarOpen` false: `-translate-x-full` (hidden, shifted left by full width)

**Visual Representation:**
```
Mobile - Closed:
┌─────────────────┐
│                 │
│   Main Content  │ <- Sidebar di luar screen (translate-x-full)
│                 │
└─────────────────┘

Mobile - Open:
┌────┬────────────┐
│Side│            │
│bar │  Content   │ <- Sidebar slide in (translate-x-0)
│    │            │
└────┴────────────┘

Desktop:
┌────┬──────────────┐
│Side│              │
│bar │   Content    │ <- Always visible (static)
│    │              │
└────┴──────────────┘
```

**Baris 90-115: Navigation Items Rendering**

```typescript
{navigation.map((item) => {
  const Icon = item.icon
  const isActive = pathname === item.href
  
  return (
    <Link key={item.name} href={item.href} prefetch={true}>
```

**Step-by-step breakdown:**

**1. Loop through navigation array**
```typescript
{navigation.map((item) => {
```
- `navigation`: Array defined di top of file
- `item`: Current object { name, href, icon }
- Returns: Array of JSX elements (React fragments)

**2. Extract icon component**
```typescript
const Icon = item.icon
```
- `item.icon`: React component (e.g., BarChart3, BookOpen)
- Assign to `Icon` (capital I required untuk JSX)
- Why? JSX requires component names start with capital letter
- Usage: `<Icon />` renders the component

**3. Check if current route matches**
```typescript
const isActive = pathname === item.href
```
- Compare current path dengan item path
- Example: 
  - `pathname`: '/dashboard/subjects'
  - `item.href`: '/dashboard/subjects'
  - Result: `true` (active)
- Used for: conditional styling (highlight active item)

**4. Render Link with prefetching**
```typescript
<Link href={item.href} prefetch={true}>
```
- **Link**: Next.js navigation component
- **href**: Destination route
- **prefetch={true}**: Pre-load page on hover
  - How it works:
    1. User hovers over link
    2. Next.js loads page code in background
    3. User clicks → instant navigation (already loaded)
  - Only works in production mode
  - Improves perceived performance

**5. Conditional styling**
```typescript
className={cn(
  "group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors",
  isActive 
    ? "bg-blue-100 text-blue-700" 
    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
)}
```

**Base classes (always applied):**
- `group`: Enable group-hover (child elements can respond to parent hover)
- `flex items-center`: Flexbox with vertical center alignment
- `px-3 py-2`: Padding (horizontal 12px, vertical 8px)
- `text-sm`: Font size small (14px)
- `font-medium`: Font weight 500
- `rounded-md`: Rounded corners (6px)
- `mb-1`: Margin bottom 4px (spacing between items)
- `transition-colors`: Smooth color transition on hover

**Conditional classes:**
- **Active state** (`isActive` = true):
  - `bg-blue-100`: Light blue background
  - `text-blue-700`: Dark blue text
  
- **Inactive state** (`isActive` = false):
  - `text-gray-600`: Gray text
  - `hover:bg-gray-50`: Light gray background on hover
  - `hover:text-gray-900`: Dark text on hover

**6. Render icon with conditional color**
```typescript
<Icon 
  className={cn(
    "mr-3 h-5 w-5",
    isActive ? "text-blue-500" : "text-gray-400"
  )} 
/>
```
- `mr-3`: Margin right 12px (spacing from text)
- `h-5 w-5`: Icon size 20px × 20px
- Color:
  - Active: `text-blue-500` (blue)
  - Inactive: `text-gray-400` (gray)

**Baris 120-145: User Profile Section**

```typescript
<div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
```
- **absolute bottom-0**: Position at bottom of sidebar
- **w-full**: Full width of container (256px)
- **p-4**: Padding all sides 16px
- **border-t**: Top border untuk visual separation

**Avatar with initial:**
```typescript
<div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
  <span className="text-white text-sm font-medium">
    {session?.user?.name?.charAt(0).toUpperCase()}
  </span>
</div>
```

**Classes breakdown:**
- `h-8 w-8`: Square 32px × 32px
- `bg-blue-500`: Blue background
- `rounded-full`: Border radius 50% (perfect circle)
- `flex items-center justify-center`: Center content both ways

**Extract first letter:**
```typescript
session?.user?.name?.charAt(0).toUpperCase()
```
**Optional chaining step-by-step:**
1. `session?.`: If session exists, continue; else return undefined
2. `user?.`: If user exists, continue; else return undefined
3. `name?.`: If name exists, continue; else return undefined
4. `charAt(0)`: Get character at index 0 (first letter)
5. `.toUpperCase()`: Convert to uppercase

**Example flow:**
- Input: `"Budi Santoso"`
- `charAt(0)`: `"B"`
- `toUpperCase()`: `"B"` (already uppercase)
- Result: Display "B" in circle

**Why optional chaining?**
- Prevents errors jika session belum loaded
- Graceful handling of null/undefined
- Safer than: `session.user.name` (would crash if session is null)

**Logout button:**
```typescript
<Button
  variant="outline"
  onClick={() => signOut({ callbackUrl: '/login' })}
>
  <LogOut className="h-4 w-4 mr-2" />
  Keluar
</Button>
```

**signOut() function:**
- **From**: next-auth/react
- **Purpose**: Clear session and logout user
- **callbackUrl**: Redirect destination after logout
- **What it does**:
  1. Clear session from memory
  2. Clear cookies
  3. Redirect to `/login`
- **Type**: async function (returns Promise)

---

## 5. SUBJECTS LIST COMPONENT

### File: `src/components/subjects/subjects-list.tsx`

**Konsep: Delete Operation dengan Confirmation**

Delete operation adalah critical action yang perlu:
1. User confirmation (prevent accidents)
2. Loading indicator (show progress)
3. Error handling (handle failures gracefully)
4. UI feedback (toast notifications)
5. Data refresh (update UI after delete)

**Complete Delete Flow Breakdown:**

```typescript
const handleDelete = async (subjectId: string) => {
```
- **async function**: Required karena akan use `await` untuk API call
- **Parameter**: `subjectId` - UUID string dari database
- **Return type**: Promise<void> (implicitly)

**Step 1: User Confirmation**
```typescript
const userConfirmed = window.confirm(
  'Apakah Anda yakin ingin menghapus mata pelajaran ini?\n\n' +
  'Semua data siswa dan nilai akan ikut terhapus dan tidak dapat dikembalikan.'
)
```

**window.confirm() details:**
- **Type**: Native browser API (not React)
- **Blocking**: Stops JavaScript execution until user responds
- **UI**: Shows dialog with message + OK/Cancel buttons
- **Returns**: 
  - `true` if user clicks OK
  - `false` if user clicks Cancel or closes dialog
- **`\n\n`**: Double newline untuk better readability
- **Message structure**:
  - Line 1: Confirmation question
  - Line 2: Empty (newline)
  - Line 3: Warning about consequences

**Confirmation Dialog Visual:**
```
┌─────────────────────────────────────┐
│  ⚠️  Apakah Anda yakin ingin        │
│      menghapus mata pelajaran ini?  │
│                                     │
│  Semua data siswa dan nilai akan    │
│  ikut terhapus dan tidak dapat      │
│  dikembalikan.                      │
│                                     │
│            [ OK ]  [ Cancel ]       │
└─────────────────────────────────────┘
```

**Check user response:**
```typescript
if (!userConfirmed) {
  return  // Early exit
}
```
- **Early return pattern**: Exit function immediately if condition met
- **No API call**: Jika user cancel, function stops here
- **Clean**: No nested code untuk success case
- **Why `!`**: Negate boolean (false becomes true for if condition)

**Step 2: Set Loading State**
```typescript
setDeletingId(subjectId)
```

**What happens:**
1. Update state dengan ID yang sedang di-delete
2. React detects state change
3. Component re-renders
4. UI shows loading spinner on specific button

**State usage dalam render:**
```typescript
disabled={deletingId === subjectId}
```
- Button disabled jika ID matches deletingId

```typescript
{deletingId === subjectId ? (
  <Loader2 className="h-4 w-4 animate-spin" />
) : (
  <Trash2 className="h-4 w-4" />
)}
```
- Show spinner if deleting, else show trash icon

**Step 3: Send Delete Request**
```typescript
try {
  const response = await fetch(`/api/subjects/${subjectId}`, {
    method: 'DELETE',
  })
```

**fetch() breakdown:**
- **URL**: Template literal with variable
  - Base: `/api/subjects/`
  - Variable: `${subjectId}`
  - Example: `/api/subjects/123e4567-e89b-12d3-a456-426614174000`
- **method: 'DELETE'**: HTTP verb untuk delete operations
  - RESTful convention
  - Alternative methods: GET, POST, PUT, PATCH
- **await**: Wait for promise to resolve
  - fetch() returns Promise<Response>
  - await pauses execution until response arrives
  - Code continues when response received

**HTTP Request Visual:**
```
Client                          Server
   │                               │
   │  DELETE /api/subjects/123    │
   │ ──────────────────────────>  │
   │                               │
   │        Processing...          │
   │   (Delete from database)      │
   │                               │
   │  200 OK { success: true }    │
   │ <───────────────────────────  │
   │                               │
```

**Step 4: Parse Response**
```typescript
const data = await response.json()
```
- **response.json()**: Parse JSON from response body
- **await**: Required karena .json() is async (returns Promise)
- **data**: JavaScript object dari parsed JSON
- **Example data**:
  ```json
  { "success": true }
  // or
  { "error": "Subject not found" }
  ```

**Step 5: Handle Success/Error**
```typescript
if (response.ok) {
  toast.success('Mata pelajaran berhasil dihapus')
  window.location.reload()
}
```

**response.ok explained:**
- **Type**: boolean property
- **true if**: HTTP status 200-299 (success range)
- **false if**: HTTP status 400-599 (error range)
- **Examples**:
  - 200 OK → true
  - 201 Created → true
  - 404 Not Found → false
  - 500 Internal Error → false

**toast.success():**
- **Library**: react-hot-toast
- **Purpose**: Show success notification
- **Appearance**: Green toast at top-right
- **Duration**: Auto-dismiss after ~3 seconds
- **Non-blocking**: User can continue interacting
- **Visual**:
  ```
  ┌────────────────────────────────┐
  │ ✅ Mata pelajaran berhasil     │
  │    dihapus                     │
  └────────────────────────────────┘
  ```

**window.location.reload():**
- **Purpose**: Refresh entire page
- **Why needed**: 
  - Update subjects list (remove deleted item)
  - Simpler than updating state manually
  - Ensures all data is fresh
- **Drawback**: Loses any unsaved state
- **Alternative**: Update state locally (more complex but better UX)

**Handle error response:**
```typescript
else {
  toast.error(data.error || 'Gagal menghapus mata pelajaran')
}
```
- **toast.error()**: Show error notification (red)
- **data.error**: Error message from API
- **Fallback**: Generic message jika API tidak provide error
- **`||` operator**: Use left side if truthy, else use right side

**Step 6: Catch Network Errors**
```typescript
} catch (error) {
  console.error('Delete error:', error)
  toast.error('Terjadi kesalahan saat menghapus mata pelajaran')
}
```

**What errors are caught:**
- Network timeout
- No internet connection
- Server not responding
- Invalid JSON response
- JavaScript errors in try block

**console.error():**
- **Purpose**: Log error for debugging
- **Where**: Browser console (F12 Developer Tools)
- **Production**: Consider using error tracking service (Sentry, LogRocket)

**Step 7: Cleanup (Always Runs)**
```typescript
finally {
  setDeletingId(null)
}
```

**finally block:**
- **Runs**: After try succeeds OR after catch handles error
- **Always**: Guaranteed to execute
- **Purpose**: Cleanup code that must run regardless of outcome

**Why reset state:**
- Remove loading spinner
- Re-enable delete button
- Clear deletingId so other buttons work

---

**Flow Diagram: Complete Delete Operation**

```
┌─────────────────────────────────────────┐
│ User clicks Delete Button               │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ Show Confirmation Dialog                │
│ "Are you sure?"                         │
└─────┬──────────────────────┬────────────┘
      │                      │
      │ OK                   │ Cancel
      ▼                      ▼
┌───────────────┐     ┌──────────────┐
│ Set Loading   │     │ Exit (return)│
│ State         │     └──────────────┘
└───────┬───────┘
        │
        ▼
┌────────────────────────────────────────┐
│ Send DELETE /api/subjects/{id}         │
│ await response                          │
└───────┬──────────────────────┬─────────┘
        │                      │
        │ Success (200)        │ Error (4xx/5xx)
        ▼                      ▼
  ┌─────────────┐       ┌──────────────┐
  │Show success │       │ Show error   │
  │toast        │       │ toast        │
  └──────┬──────┘       └──────┬───────┘
         │                     │
         ▼                     │
  ┌─────────────┐              │
  │Reload page  │              │
  │(refresh)    │              │
  └──────┬──────┘              │
         │                     │
         └──────────┬──────────┘
                    │
                    ▼
          ┌──────────────────┐
          │ Clear loading    │
          │ state (finally)  │
          └──────────────────┘
```

---

**Error Scenarios dan Handling:**

**Scenario 1: Network Timeout**
```
User clicks delete
  → Confirmation: OK
  → API call: TIMEOUT (30 seconds)
  → Catch block: "Network timeout"
  → Toast: "Terjadi kesalahan..."
  → Finally: Clear loading state
Result: Delete button re-enabled, item still in list
```

**Scenario 2: Subject Not Found (404)**
```
User clicks delete
  → Confirmation: OK
  → API call: 404 Not Found
  → response.ok: false
  → data.error: "Subject not found"
  → Toast: "Subject not found"
  → No reload (item might already be deleted by another session)
  → Finally: Clear loading state
```

**Scenario 3: Unauthorized (401)**
```
User clicks delete (session expired)
  → Confirmation: OK
  → API call: 401 Unauthorized
  → response.ok: false
  → data.error: "Unauthorized"
  → Toast: "Unauthorized"
  → User needs to login again
```

---

## 📝 FILES COVERED (UPDATED)

✅ **Completed - Super Detailed:**
1. Authentication System (`src/lib/auth.ts`) - 100+ lines explained
2. Prisma Client Singleton (`src/lib/prisma.ts`) - 30+ lines explained
3. Register API (`src/app/api/register/route.ts`) - 75+ lines explained
4. **Dashboard Layout (`src/components/dashboard/dashboard-layout.tsx`) - 200+ lines explained**
5. **Subjects List (`src/components/subjects/subjects-list.tsx`) - Complete delete flow explained**

🔄 **Coming Next:**
6. Profile Page (comprehensive state management)
7. Auth Provider (SessionProvider wrapping)
8. Export API (Excel generation)
9. Grades Table (most complex component)
10. Form Components

---

## 💡 TIPS MEMBACA CODE

1. **Baca dari atas ke bawah:** Flow execution mengikuti urutan code
2. **Perhatikan async/await:** Indicates operation yang butuh waktu (database, API, file)
3. **Check error handling:** try-catch blocks show possible failure points
4. **Understand data flow:** Input → Processing → Output
5. **Look for comments:** Inline comments explain "why", not just "what"
6. **Trace state changes:** useState dan useEffect untuk understand component lifecycle
7. **Follow conditional logic:** if/else dan ternary operators untuk different paths
8. **Understand hooks:** Each hook has specific purpose dan lifecycle

---

**Last Updated:** May 15, 2026  
**Total Lines Explained:** 700+ lines dengan detail sangat lengkap
**New Additions:** Dashboard Layout + Subjects List dengan flow diagrams
