export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
  readTime: string;
  image?: string;
}

const authors = ["Tejaji", "Alex Chen", "Sarah Johnson", "Michael Brown", "Emily Davis", "David Wilson", "Lisa Anderson", "James Taylor", "Rachel Kim", "Thomas Garcia"];

function generateHumanPosts(): BlogPost[] {
  const premiumPosts: BlogPost[] = [
    {
      id: "react-server-components-2025",
      title: "React Server Components: The Game-Changer Nobody Prepared Me For",
      excerpt: "After shipping three production apps with RSC, here's everything I wish I knew before starting. From mental models to performance wins to the gotchas that bit me.",
      content: `# React Server Components: The Game-Changer Nobody Prepared Me For

I'll be honest – when React Server Components (RSC) were announced, I rolled my eyes. "Great, another thing to learn," I thought. Fast forward to today: I've shipped three production apps using RSC, and I can't imagine going back.

But the journey? Humbling. Let me save you some pain.

## The Mental Model Shift

The hardest part wasn't the syntax. It was unlearning five years of React patterns.

### Before RSC: Everything's a Client Component

\`\`\`tsx
function UserDashboard() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/user').then(r => r.json()),
      fetch('/api/posts').then(r => r.json())
    ]).then(([userData, postsData]) => {
      setUser(userData);
      setPosts(postsData);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <PostList posts={posts} />
    </div>
  );
}
\`\`\`

Loading states. useEffect. Fetch waterfalls. We accepted this as normal.

### After RSC: Server First

\`\`\`tsx
// This is a Server Component by default
async function UserDashboard() {
  // Fetch in parallel, on the server
  const [user, posts] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.post.findMany({ where: { authorId: userId } })
  ]);

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <PostList posts={posts} />
    </div>
  );
}
\`\`\`

No useEffect. No loading states. No client-side fetching. Just... data.

The first time I wrote this, I stared at my screen for five minutes. "This can't be right. Where's the loading spinner?"

It was right. It just worked.

## Performance Wins That Actually Matter

### 1. Zero Client-Side JavaScript for Static Content

My marketing pages went from 80KB of JS to... 3KB. That's a 96% reduction.

\`\`\`tsx
// Before: Client component = JavaScript sent to browser
export default function BlogPost({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

// After: Server component = Zero JavaScript
export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
\`\`\`

Users on slow 3G connections actually noticed. Our analytics showed 40% faster Time to Interactive.

### 2. Data Fetching Without Waterfalls

Before RSC, I'd fetch user data, then fetch their posts, then fetch post comments. Three round trips.

\`\`\`tsx
// Server Component: Everything fetches in parallel
async function UserProfile({ userId }) {
  const user = await getUser(userId);
  
  return (
    <div>
      <UserHeader user={user} />
      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts userId={userId} />
      </Suspense>
      <Suspense fallback={<ActivitySkeleton />}>
        <UserActivity userId={userId} />
      </Suspense>
    </div>
  );
}

async function UserPosts({ userId }) {
  const posts = await getPosts(userId);
  return <PostList posts={posts} />;
}

async function UserActivity({ userId }) {
  const activity = await getActivity(userId);
  return <ActivityFeed activity={activity} />;
}
\`\`\`

With Suspense boundaries, UserPosts and UserActivity fetch in parallel. Page shows progressive content instead of a blank screen.

### 3. Direct Database Access

No API routes. No REST endpoints. Just database queries.

\`\`\`tsx
import { db } from '@/lib/db';

async function Dashboard() {
  const stats = await db.analytics.aggregate({
    _sum: { views: true, clicks: true },
    _avg: { conversionRate: true },
    where: {
      date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }
  });

  return <StatsCards stats={stats} />;
}
\`\`\`

One query. No API layer. No serialization overhead.

## The Gotchas That Bit Me

### 1. "use client" Isn't an Escape Hatch

My first instinct when something didn't work: slap "use client" on it.

Bad idea.

\`\`\`tsx
// ❌ This defeats the purpose
"use client";

import { db } from '@/lib/db';

export default async function Page() {
  const data = await db.query(); // Error: Can't use async in Client Component
  return <div>{data}</div>;
}
\`\`\`

Client Components can't be async. They can't access the database. "use client" should be deliberate, not a panic button.

**Rule I follow:** Server Components by default. Client Components only for:
- useState, useEffect, event handlers
- Browser APIs (localStorage, geolocation)
- Third-party libraries that need the DOM

### 2. Props Must Be Serializable

\`\`\`tsx
// ❌ This breaks
function ServerComp() {
  const handleClick = () => console.log('clicked');
  return <ClientButton onClick={handleClick} />; // Error!
}

// ✅ This works
function ServerComp() {
  return <ClientButton onClickAction={async () => {
    'use server';
    await logClick();
  }} />;
}
\`\`\`

Functions aren't serializable. Use Server Actions instead.

### 3. Context Doesn't Cross the Boundary

\`\`\`tsx
// ❌ Context from Server Component won't reach Client Components
export default function Layout({ children }) {
  return (
    <ThemeProvider theme="dark">
      {children} {/* If this is a Server Component, it won't get theme */}
    </ThemeProvider>
  );
}

// ✅ Wrap Client Components separately
export default function Layout({ children }) {
  return (
    <>
      {children}
      <ClientSidebar /> {/* Wrap this in its own ThemeProvider */}
    </>
  );
}
\`\`\`

## Patterns I Use Every Day

### 1. Composition Over Configuration

\`\`\`tsx
// Good: Small, focused Server Components
async function ProductPage({ id }) {
  return (
    <div>
      <ProductHeader id={id} />
      <Suspense fallback={<DetailsSkeleton />}>
        <ProductDetails id={id} />
      </Suspense>
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews id={id} />
      </Suspense>
    </div>
  );
}
\`\`\`

Each component fetches its own data. Easy to understand. Easy to cache.

### 2. Colocation of Data and UI

\`\`\`tsx
async function UserCard({ userId }) {
  // Data fetching right next to the component that uses it
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, avatar: true, bio: true }
  });

  return (
    <div className="card">
      <img src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.bio}</p>
    </div>
  );
}
\`\`\`

No prop drilling. No Redux. Data lives with the component.

### 3. Progressive Enhancement with Suspense

\`\`\`tsx
export default function Feed() {
  return (
    <>
      {/* Critical content loads immediately */}
      <Hero />
      
      {/* Non-critical content streams in */}
      <Suspense fallback={<PostsSkeleton />}>
        <RecentPosts />
      </Suspense>
      
      <Suspense fallback={<TrendingSkeleton />}>
        <TrendingTopics />
      </Suspense>
    </>
  );
}
\`\`\`

Users see the Hero instantly. Other content streams in as it's ready.

## Real-World Example: E-commerce Product Page

Here's how I built a product page that loads in 1.2 seconds on 3G:

\`\`\`tsx
export default async function ProductPage({ params }) {
  // Critical data loads first
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: { images: true, variants: true }
  });

  if (!product) notFound();

  return (
    <div className="container">
      {/* Above the fold - no suspense needed */}
      <ProductGallery images={product.images} />
      <ProductInfo product={product} />
      <AddToCartButton variants={product.variants} />

      {/* Below the fold - lazy load */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews productId={product.id} />
      </Suspense>

      <Suspense fallback={<RecommendationsSkeleton />}>
        <RelatedProducts category={product.category} />
      </Suspense>
    </div>
  );
}

// This component fetches its own data, in parallel with others
async function ProductReviews({ productId }) {
  const reviews = await db.review.findMany({
    where: { productId },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, avatar: true } } }
  });

  return <ReviewList reviews={reviews} />;
}
\`\`\`

**Results:**
- Time to First Byte: 180ms
- First Contentful Paint: 450ms
- Time to Interactive: 1.2s
- Bundle size: 12KB (down from 89KB)

## When NOT to Use Server Components

Be real: RSC isn't always the answer.

**Skip Server Components when:**
- Building a dashboard with lots of interactivity (use Client Components)
- You need real-time updates (WebSockets live in Client Components)
- Your team isn't ready for the mental shift
- You're building a simple CRUD app (Next.js pages router works fine)

## My Advice After Shipping Three Apps

1. **Start with one route.** Don't refactor everything. Pick a new feature and build it with RSC.

2. **Embrace the loading states.** Suspense boundaries feel weird at first. They're powerful once you get them.

3. **Think server-first.** When building a component, ask: "Does this need to be interactive?" If no, keep it on the server.

4. **Use TypeScript.** Seriously. The type safety between Server and Client Components catches so many bugs.

5. **Read the Next.js docs.** They're actually good. The RSC mental model is explained well.

6. **Don't fight it.** If RSC feels hard, you're probably trying to force old patterns. Step back and embrace the new model.

## The Bottom Line

React Server Components changed how I build web apps. The performance wins are real. The developer experience is better. But the learning curve is steep.

Give it a real shot. Build something small. Break things. You'll get it.

And when it clicks? You won't want to go back.

*Have questions? I'm [@tejaji](https://twitter.com/tejaji) on Twitter. Always happy to chat RSC.*`,
      date: "2025-11-12",
      author: "Tejaji",
      tags: ["React", "Server Components", "Performance"],
      readTime: "12 min read",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop&q=80"
    },
    {
      id: "typescript-production-patterns",
      title: "TypeScript in Production: Patterns That Saved My Team Hundreds of Bugs",
      excerpt: "After migrating three legacy codebases to TypeScript and preventing countless runtime errors, here are the patterns that actually matter in production.",
      content: `# TypeScript in Production: Patterns That Saved My Team Hundreds of Bugs

Two years ago, our team inherited a 50,000-line JavaScript codebase. Runtime errors were constant. Refactoring was terrifying. We migrated to TypeScript.

Best decision we ever made.

But TypeScript isn't just "add types and you're done." These patterns turned TypeScript from a type checker into a production safety net.

## Pattern 1: Branded Types (The Hidden Gem)

Ever mixed up user IDs and post IDs? We did. All the time.

\`\`\`typescript
// ❌ The problem
type UserId = string;
type PostId = string;

function getUser(id: UserId) { /* ... */ }
function getPost(id: PostId) { /* ... */ }

const userId: UserId = "user_123";
const postId: PostId = "post_456";

getUser(postId); // TypeScript says: ✅ No error!
// Runtime says: 💥 User not found
\`\`\`

TypeScript sees both as strings. The bug ships.

### The Solution: Branded Types

\`\`\`typescript
// ✅ Branded types make IDs incompatible
type Brand<K, T> = K & { __brand: T };

type UserId = Brand<string, "UserId">;
type PostId = Brand<string, "PostId">;

// Helper functions to create branded types
const UserId = (id: string): UserId => id as UserId;
const PostId = (id: string): PostId => id as PostId;

function getUser(id: UserId) { /* ... */ }
function getPost(id: PostId) { /* ... */ }

const userId = UserId("user_123");
const postId = PostId("post_456");

getUser(postId); // ❌ Type error!
// Type 'PostId' is not assignable to type 'UserId'
\`\`\`

**Result:** Caught 23 ID-mixing bugs before they hit production.

We use this for:
- User IDs, Post IDs, Comment IDs
- Email addresses vs regular strings
- Sanitized HTML vs raw HTML
- Encrypted vs plain text data

\`\`\`typescript
type Email = Brand<string, "Email">;
type SanitizedHTML = Brand<string, "SanitizedHTML">;

// Can't accidentally use unsanitized HTML
function renderContent(html: SanitizedHTML) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

const userInput = "<script>alert('xss')</script>";
renderContent(userInput); // ❌ Error: Type 'string' not assignable to 'SanitizedHTML'

const safe = sanitize(userInput); // Returns SanitizedHTML
renderContent(safe); // ✅ Works!
\`\`\`

## Pattern 2: Discriminated Unions (State Machines in Types)

Our API responses were a mess:

\`\`\`typescript
// ❌ The old way
interface ApiResponse {
  loading: boolean;
  error?: string;
  data?: User;
}

// This compiles but makes no sense:
const response: ApiResponse = {
  loading: false,
  error: "Network error",
  data: { id: 1, name: "John" }
};

// How do you handle this state?
\`\`\`

### Discriminated Unions Make Impossible States Impossible

\`\`\`typescript
// ✅ States are explicit and mutually exclusive
type ApiResponse<T> =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: T };

function handleResponse(response: ApiResponse<User>) {
  switch (response.status) {
    case 'loading':
      return <Spinner />;
    
    case 'error':
      // TypeScript knows 'error' exists here
      return <Error message={response.error} />;
    
    case 'success':
      // TypeScript knows 'data' exists here
      return <UserProfile user={response.data} />;
  }
}
\`\`\`

**Magic:** TypeScript narrows types in each branch. No runtime checks needed.

We use this everywhere:
\`\`\`typescript
// Form states
type FormState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; data: SubmitResult }
  | { status: 'error'; errors: ValidationErrors };

// Authentication
type AuthState =
  | { status: 'unauthenticated' }
  | { status: 'authenticating' }
  | { status: 'authenticated'; user: User; token: string };

// File uploads
type UploadState =
  | { status: 'pending' }
  | { status: 'uploading'; progress: number }
  | { status: 'complete'; url: string }
  | { status: 'failed'; reason: string };
\`\`\`

**Result:** Eliminated 90% of "undefined is not an object" errors.

## Pattern 3: Template Literal Types (Type-Safe Routes)

Before TypeScript 4.1, our router was a mess:

\`\`\`typescript
// ❌ No type safety
router.push('/users/' + userId + '/posts/' + postId);
// Typos ship to production
router.push('/user/' + userId + '/post/' + postId); // ✅ Compiles!
\`\`\`

### Template Literals Catch Route Typos

\`\`\`typescript
// ✅ Type-safe routes
type Route =
  | '/'
  | '/about'
  | '/blog'
  | \`/blog/\${string}\`
  | '/users'
  | \`/users/\${string}\`
  | \`/users/\${string}/posts\`
  | \`/users/\${string}/posts/\${string}\`;

function navigate(route: Route) {
  router.push(route);
}

navigate('/'); // ✅
navigate('/blog/my-post'); // ✅
navigate(\`/users/\${userId}/posts/\${postId}\`); // ✅
navigate('/user/123'); // ❌ Type error!
\`\`\`

Better yet, make it type-safe AND DRY:

\`\`\`typescript
const routes = {
  home: '/',
  about: '/about',
  blog: '/blog',
  blogPost: (slug: string) => \`/blog/\${slug}\` as const,
  users: '/users',
  user: (id: string) => \`/users/\${id}\` as const,
  userPosts: (userId: string) => \`/users/\${userId}/posts\` as const,
  userPost: (userId: string, postId: string) => 
    \`/users/\${userId}/posts/\${postId}\` as const,
} as const;

type Route = typeof routes[keyof typeof routes] | ReturnType<typeof routes[keyof typeof routes]>;

// Usage
navigate(routes.home); // ✅
navigate(routes.blogPost('my-slug')); // ✅
navigate(routes.userPost(userId, postId)); // ✅
navigate('/wrong'); // ❌ Error!
\`\`\`

**Result:** Zero route-typo bugs in 18 months.

## Pattern 4: Zod + TypeScript (Runtime Safety)

TypeScript checks at compile time. Users send garbage at runtime.

\`\`\`typescript
// ❌ TypeScript can't help here
interface LoginRequest {
  email: string;
  password: string;
}

app.post('/login', (req, res) => {
  const { email, password } = req.body as LoginRequest;
  // What if req.body is actually: { email: 123, password: null } ?
});
\`\`\`

### Zod Validates at Runtime

\`\`\`typescript
import { z } from 'zod';

// ✅ Schema is the source of truth
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// TypeScript type derived from schema
type LoginRequest = z.infer<typeof LoginSchema>;

app.post('/login', (req, res) => {
  // Parse and validate
  const result = LoginSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten() });
  }
  
  // TypeScript knows result.data is valid LoginRequest
  const { email, password } = result.data;
});
\`\`\`

We use Zod for:
- API request/response validation
- Environment variable checking
- Form validation
- Config file parsing

\`\`\`typescript
// Environment variables with defaults
const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(1),
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

const env = EnvSchema.parse(process.env);
// TypeScript knows: env.PORT is a number, env.NODE_ENV is one of three strings
\`\`\`

**Result:** Caught 50+ invalid API payloads before they crashed the server.

## Pattern 5: Utility Types (Don't Reinvent the Wheel)

TypeScript has built-in helpers. Use them.

\`\`\`typescript
interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
}

// ❌ Manual types are tedious
interface PublicUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

interface UserUpdate {
  email?: string;
  name?: string;
}

// ✅ Utility types are DRY
type PublicUser = Omit<User, 'password'>;
type UserUpdate = Partial<Pick<User, 'email' | 'name'>>;

// Even better: compose utilities
type UpdateUserRequest = Partial<Omit<User, 'id' | 'createdAt' | 'password'>>;
\`\`\`

My favorites:

\`\`\`typescript
// Make all properties optional
type PartialUser = Partial<User>;

// Make all properties required
type RequiredUser = Required<User>;

// Pick specific properties
type UserPreview = Pick<User, 'id' | 'name'>;

// Omit specific properties
type PublicUser = Omit<User, 'password'>;

// Make all properties readonly
type ImmutableUser = Readonly<User>;

// Extract return type of a function
function getUser() { return { id: '1', name: 'John' }; }
type UserFromFunction = ReturnType<typeof getUser>;

// Extract parameters of a function
function updateUser(id: string, data: UserUpdate) {}
type UpdateUserParams = Parameters<typeof updateUser>;
// [string, UserUpdate]
\`\`\`

## Pattern 6: Const Assertions (Literal Types Everywhere)

\`\`\`typescript
// ❌ Too generic
const colors = ['red', 'blue', 'green'];
type Color = typeof colors[number]; // string (not helpful)

// ✅ Const assertion preserves literals
const colors = ['red', 'blue', 'green'] as const;
type Color = typeof colors[number]; // 'red' | 'blue' | 'green'

// Real-world example: API endpoints
const API_ENDPOINTS = {
  users: '/api/users',
  posts: '/api/posts',
  comments: '/api/comments'
} as const;

type Endpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
// '/api/users' | '/api/posts' | '/api/comments'

function fetchData(endpoint: Endpoint) {
  return fetch(endpoint);
}

fetchData(API_ENDPOINTS.users); // ✅
fetchData('/api/wrong'); // ❌ Error!
\`\`\`

## Pattern 7: Never Type (Exhaustiveness Checking)

\`\`\`typescript
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; size: number }
  | { kind: 'rectangle'; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.size ** 2;
    // Forgot rectangle!
  }
  // TypeScript doesn't catch it yet
}

// ✅ Exhaustiveness check with never
function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.size ** 2;
    default:
      const _exhaustive: never = shape;
      // ❌ Error: Type 'rectangle' is not assignable to type 'never'
      return _exhaustive;
  }
}
\`\`\`

Add a new shape? TypeScript forces you to handle it.

## Real Impact: Before vs After TypeScript

**Before (JavaScript):**
- ~15 runtime errors per week
- 2-3 production incidents per month
- Refactoring took days of testing
- New devs broke things constantly

**After (TypeScript with these patterns):**
- ~2 runtime errors per week (-87%)
- 0-1 production incidents per month (-67%)
- Refactoring is safe (types guide you)
- New devs onboard faster (types document code)

## My Setup Checklist

Every project starts with this config:

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  }
}
\`\`\`

**Key settings:**
- \`strict: true\` – catches most bugs
- \`noUncheckedIndexedAccess\` – array access returns \`T | undefined\`
- \`noImplicitReturns\` – all code paths must return

## Common Mistakes I See

### 1. Using \`any\` as a crutch
\`\`\`typescript
// ❌ Defeats the purpose
const data: any = fetchData();

// ✅ Use unknown and narrow
const data: unknown = fetchData();
if (isUser(data)) {
  // TypeScript knows data is User here
}
\`\`\`

### 2. Not using strict mode
Without strict mode, you're writing JavaScript with extra steps.

### 3. Ignoring errors with \`@ts-ignore\`
Every \`@ts-ignore\` is a future bug. Fix the type instead.

## The Bottom Line

TypeScript isn't just types. It's:
- **Documentation** that never goes stale
- **Safety nets** that catch bugs at compile time
- **Refactoring confidence** because types guide you
- **Better autocomplete** that makes you faster

These patterns took our team from "TypeScript is annoying" to "I can't work without it."

Start with one pattern. Master it. Add the next. Your future self will thank you.

*Questions? Find me [@tejaji](https://twitter.com/tejaji). Always happy to talk types.*`,
      date: "2025-11-11",
      author: "Tejaji",
      tags: ["TypeScript", "Best Practices", "Production"],
      readTime: "15 min read",
      image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=600&fit=crop&q=80"
    },
    {
      id: "tailwind-css-production-2025",
      title: "Tailwind CSS at Scale: How We Style 500+ Components Without Losing Our Minds",
      excerpt: "Managing Tailwind in a large codebase is different from tutorial projects. Here's how we keep it maintainable with 8 developers and zero CSS conflicts.",
      content: `# Tailwind CSS at Scale: How We Style 500+ Components Without Losing Our Minds

"Just use utility classes!" they said. "It'll be fun!" they said.

Then our codebase grew to 500+ components, 8 developers, and class names that looked like this:

\`\`\`tsx
<div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 md:px-6 md:py-4 lg:px-8">
\`\`\`

We needed patterns. Here's what worked.

## Pattern 1: Component Variants (Not @apply)

Everyone's first instinct: extract classes with \`@apply\`.

\`\`\`css
/* ❌ Don't do this */
.btn {
  @apply px-4 py-2 rounded-lg font-medium;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}
\`\`\`

**Why it's wrong:**
- Defeats the purpose of Tailwind
- Loses JIT compilation benefits
- Creates global class conflicts
- No type safety

**Better: CVA (Class Variance Authority)**

\`\`\`tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        ghost: 'hover:bg-gray-100 text-gray-900',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type ButtonProps = VariantProps<typeof buttonVariants> & {
  children: React.ReactNode;
};

export function Button({ variant, size, children }: ButtonProps) {
  return (
    <button className={buttonVariants({ variant, size })}>
      {children}
    </button>
  );
}
\`\`\`

**Usage:**
\`\`\`tsx
<Button variant="primary" size="lg">Click me</Button>
<Button variant="ghost" size="sm">Cancel</Button>
\`\`\`

**Benefits:**
- Type-safe props
- Autocomplete works
- Easy to add variants
- No class name conflicts

## Pattern 2: Design Tokens in tailwind.config.js

Don't hardcode colors. Ever.

\`\`\`javascript
// ❌ Bad
<div className="bg-blue-600 text-white">

// ❌ Also bad
<div className="bg-[#2563eb] text-[#ffffff]">

// ✅ Good
<div className="bg-primary text-primary-foreground">
\`\`\`

**Setup:**
\`\`\`javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
};
\`\`\`

**CSS variables:**
\`\`\`css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  /* ... */
}
\`\`\`

**Now changing themes is one CSS variable:**
\`\`\`css
:root {
  --primary: 142 76% 36%; /* Change entire app to green */
}
\`\`\`

## Pattern 3: cn() Helper (Merge Classes Safely)

Class conflicts are real:

\`\`\`tsx
// ❌ Which padding wins?
<Button className="px-8" /> // Component has px-4
// Answer: Both are applied (not ideal)
\`\`\`

**Solution: clsx + tailwind-merge**

\`\`\`typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
export function Button({ className, variant, size }: ButtonProps) {
  return (
    <button 
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {children}
    </button>
  );
}

// Now this works correctly
<Button className="px-8" /> // px-8 overrides px-4
\`\`\`

## Pattern 4: Responsive Design System

Don't hardcode breakpoints everywhere:

\`\`\`tsx
// ❌ Repeated breakpoints = maintenance hell
<div className="text-sm md:text-base lg:text-lg">
<p className="text-xs md:text-sm lg:text-base">
<h1 className="text-2xl md:text-3xl lg:text-4xl">
\`\`\`

**Better: Semantic size tokens**

\`\`\`javascript
// tailwind.config.js
module.exports = {
  theme: {
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      // Semantic sizes
      'body-sm': ['0.875rem', { lineHeight: '1.25rem' }],
      'body': ['1rem', { lineHeight: '1.5rem' }],
      'heading-sm': ['1.25rem', { lineHeight: '1.75rem' }],
      'heading': ['1.5rem', { lineHeight: '2rem' }],
      'heading-lg': ['2rem', { lineHeight: '2.5rem' }],
      'display': ['3rem', { lineHeight: '1' }],
    },
  },
};
\`\`\`

**Usage:**
\`\`\`tsx
<p className="text-body">Regular text</p>
<h2 className="text-heading">Section heading</h2>
<h1 className="text-display">Hero text</h1>
\`\`\`

## Pattern 5: Composition Over Duplication

Found yourself copy-pasting the same classes?

\`\`\`tsx
// ❌ Duplicated everywhere
<div className="flex items-center gap-2">
  <UserAvatar />
  <span className="text-sm font-medium">John Doe</span>
</div>

<div className="flex items-center gap-2">
  <TeamAvatar />
  <span className="text-sm font-medium">Marketing Team</span>
</div>
\`\`\`

**Extract to components:**

\`\`\`tsx
// ✅ Single source of truth
export function AvatarWithName({ avatar, name }: Props) {
  return (
    <div className="flex items-center gap-2">
      {avatar}
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
}

// Usage
<AvatarWithName avatar={<UserAvatar />} name="John Doe" />
<AvatarWithName avatar={<TeamAvatar />} name="Marketing Team" />
\`\`\`

## Pattern 6: Dark Mode That Actually Works

CSS variable approach + Tailwind dark mode:

\`\`\`tsx
// ✅ One component, works in light and dark
export function Card({ children }: Props) {
  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg p-6">
      {children}
    </div>
  );
}

// Automatically adapts to dark mode
// No dark: prefixes needed
\`\`\`

**When you need explicit dark mode:**
\`\`\`tsx
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-white">
    Text that adapts
  </p>
</div>
\`\`\`

## Pattern 7: Animation Utilities

\`\`\`javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-in',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
};
\`\`\`

**Usage:**
\`\`\`tsx
<div className="animate-fade-in">Fades in smoothly</div>
<div className="animate-slide-up">Slides up from bottom</div>
\`\`\`

## Pattern 8: Container Queries (The Future)

Tailwind 3.4+ supports container queries:

\`\`\`tsx
<div className="@container">
  <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3">
    {/* Responsive based on container, not viewport */}
  </div>
</div>
\`\`\`

Game-changer for component libraries.

## Real-World Example: Complex Form

Here's how we build forms:

\`\`\`tsx
// Form component with consistent styling
export function FormField({ label, error, children }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

// Input with variants
const inputVariants = cva(
  'w-full rounded-md border bg-background px-3 py-2 text-sm transition-colors',
  {
    variants: {
      state: {
        default: 'border-input focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20',
        error: 'border-destructive focus:border-destructive focus:ring-destructive/20',
      },
    },
    defaultVariants: {
      state: 'default',
    },
  }
);

export function Input({ error, ...props }: InputProps) {
  return (
    <input
      className={inputVariants({ state: error ? 'error' : 'default' })}
      {...props}
    />
  );
}

// Usage
<form>
  <FormField label="Email" error={errors.email}>
    <Input type="email" error={errors.email} />
  </FormField>
  
  <FormField label="Password" error={errors.password}>
    <Input type="password" error={errors.password} />
  </FormField>
  
  <Button type="submit" variant="primary" size="lg" className="w-full">
    Sign In
  </Button>
</form>
\`\`\`

## Tools We Use Daily

1. **Tailwind CSS IntelliSense** (VSCode extension)
   - Autocomplete for classes
   - CSS preview on hover
   - Linting

2. **Prettier Plugin**
   \`\`\`javascript
   // .prettierrc
   {
     "plugins": ["prettier-plugin-tailwindcss"]
   }
   \`\`\`
   Auto-sorts classes in recommended order.

3. **ESLint Plugin**
   Catches common mistakes.

## Common Pitfalls We Avoided

### 1. Too Many Custom Classes
If you're writing a lot of @apply, you're using Tailwind wrong.

### 2. Inline Styles Mixed with Tailwind
Pick one. Don't mix.

### 3. Not Using the Config
Customization belongs in tailwind.config.js, not arbitrary values.

### 4. Ignoring Accessibility
\`\`\`tsx
// ❌ Bad
<button className="bg-blue-500 text-blue-400">
  {/* Poor contrast */}
</button>

// ✅ Good
<button className="bg-primary text-primary-foreground">
  {/* Guaranteed contrast */}
</button>
\`\`\`

## The Results

**Before these patterns:**
- Inconsistent spacing/colors
- 100+ one-off custom classes
- Dark mode was a nightmare
- 3 different button styles

**After:**
- Design system everyone follows
- Zero custom CSS files
- Dark mode just works
- One Button component with variants

## My Advice

1. **Start with a design system.** Don't freestyle.
2. **Use CVA for components.** Not @apply.
3. **Set up CSS variables.** Makes themes easy.
4. **Install the VSCode extension.** Non-negotiable.
5. **Lint your Tailwind.** Prettier plugin is your friend.

Tailwind at scale isn't about utility classes. It's about patterns that keep those utilities maintainable.

Master the patterns. Enjoy the benefits.

*Questions about scaling Tailwind? DM me [@tejaji](https://twitter.com/tejaji).*`,
      date: "2025-11-10",
      author: "Tejaji",
      tags: ["CSS", "Tailwind", "Design Systems"],
      readTime: "14 min read",
      image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=1200&h=600&fit=crop&q=80"
    },
    {
      id: "postgres-performance-production",
      title: "Postgres Performance: From 3s to 30ms in Production",
      excerpt: "How we fixed our slow queries, optimized indexes, and scaled to 10 million rows without breaking the bank. Real examples, real results.",
      content: `# Postgres Performance: From 3s to 30ms in Production

Our dashboard was slow. 3 seconds to load. Users complained. My boss asked questions.

The problem? PostgreSQL queries that made sense in development but died in production with 10 million rows.

Here's how we fixed it.

## The Problem: Missing Indexes

Our most common query took 3.2 seconds:

\`\`\`sql
-- ❌ Slow: Full table scan on 10M rows
SELECT * FROM orders
WHERE user_id = 'user_123'
AND status = 'completed'
ORDER BY created_at DESC
LIMIT 20;

-- Execution time: 3,247ms
\`\`\`

**EXPLAIN ANALYZE revealed the issue:**

\`\`\`
Seq Scan on orders (cost=0.00..284523.00 rows=20 width=200)
  Filter: (user_id = 'user_123' AND status = 'completed')
  Rows Removed by Filter: 9,999,980
Planning Time: 0.5ms
Execution Time: 3247ms
\`\`\`

Full table scan. Ouch.

## Solution 1: Composite Index

\`\`\`sql
-- ✅ Create composite index
CREATE INDEX idx_orders_user_status_created 
ON orders (user_id, status, created_at DESC);

-- Same query, now fast
SELECT * FROM orders
WHERE user_id = 'user_123'
AND status = 'completed'
ORDER BY created_at DESC
LIMIT 20;

-- Execution time: 32ms (100x faster!)
\`\`\`

**EXPLAIN ANALYZE after index:**

\`\`\`
Index Scan using idx_orders_user_status_created (cost=0.43..45.22 rows=20)
  Index Cond: (user_id = 'user_123' AND status = 'completed')
Planning Time: 0.3ms
Execution Time: 32ms
\`\`\`

**Key lesson:** Index order matters. We indexed \`(user_id, status, created_at)\` because:
1. Filter by user_id (most selective)
2. Filter by status
3. Order by created_at

## Problem 2: N+1 Queries

Our orders API was making 1,000+ database calls:

\`\`\`sql
-- ❌ N+1 problem
-- Query 1: Get orders
SELECT * FROM orders WHERE user_id = 'user_123' LIMIT 100;

-- Queries 2-101: Get user for each order (100 queries!)
SELECT * FROM users WHERE id = 'user_456';
SELECT * FROM users WHERE id = 'user_789';
-- ... 98 more times
\`\`\`

**101 database round trips. ~800ms total.**

## Solution 2: JOIN + Select Only What You Need

\`\`\`sql
-- ✅ One query with JOIN
SELECT 
  orders.id,
  orders.total,
  orders.created_at,
  users.name,
  users.email
FROM orders
JOIN users ON orders.user_id = users.id
WHERE orders.user_id = 'user_123'
ORDER BY orders.created_at DESC
LIMIT 100;

-- Execution time: 45ms (17x faster!)
\`\`\`

Notice: We only select the columns we need. Don't do \`SELECT *\`.

**In code (Prisma):**

\`\`\`typescript
// ❌ N+1 in Prisma
const orders = await prisma.order.findMany({
  where: { userId },
  take: 100,
});

// This runs a query for each order!
const ordersWithUsers = await Promise.all(
  orders.map(order => 
    prisma.user.findUnique({ where: { id: order.userId } })
  )
);

// ✅ Use include to JOIN
const orders = await prisma.order.findMany({
  where: { userId },
  take: 100,
  include: {
    user: {
      select: { name: true, email: true }
    }
  }
});
\`\`\`

## Problem 3: Counting Large Tables

We needed to show "Page 1 of 4,532" for pagination. This was slow:

\`\`\`sql
-- ❌ Slow: Counts all rows
SELECT COUNT(*) FROM orders WHERE user_id = 'user_123';

-- Execution time: 1,200ms
\`\`\`

Counting millions of rows is expensive.

## Solution 3: Estimated Count for Large Datasets

\`\`\`sql
-- ✅ Fast: Use estimate for display
SELECT reltuples::bigint AS estimate 
FROM pg_class 
WHERE relname = 'orders';

-- Execution time: 2ms (600x faster!)
\`\`\`

For pagination, users don't need exact counts. "~4,500 results" is fine.

**When you DO need exact counts, use a counter table:**

\`\`\`sql
CREATE TABLE order_counts (
  user_id TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Update with trigger
CREATE FUNCTION update_order_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO order_counts (user_id, count)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id) DO UPDATE SET count = order_counts.count + 1;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE order_counts SET count = count - 1 WHERE user_id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_count_trigger
AFTER INSERT OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION update_order_count();
\`\`\`

Now counts are instant:

\`\`\`sql
SELECT count FROM order_counts WHERE user_id = 'user_123';
-- Execution time: 1ms
\`\`\`

## Problem 4: Full-Text Search Was Dying

Our product search scanned 500K rows:

\`\`\`sql
-- ❌ ILIKE is slow on large tables
SELECT * FROM products
WHERE name ILIKE '%laptop%' OR description ILIKE '%laptop%';

-- Execution time: 2,800ms
\`\`\`

## Solution 4: Full-Text Search Index

\`\`\`sql
-- ✅ Add tsvector column
ALTER TABLE products ADD COLUMN search_vector tsvector;

-- Populate it
UPDATE products 
SET search_vector = 
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''));

-- Create GIN index
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- Fast search
SELECT * FROM products
WHERE search_vector @@ to_tsquery('english', 'laptop')
ORDER BY ts_rank(search_vector, to_tsquery('english', 'laptop')) DESC
LIMIT 20;

-- Execution time: 45ms (60x faster!)
\`\`\`

**Bonus: Keep it updated with a trigger:**

\`\`\`sql
CREATE FUNCTION products_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    coalesce(NEW.name, '') || ' ' || coalesce(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_trigger
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION products_search_update();
\`\`\`

## Problem 5: Connection Pool Exhaustion

Our app crashed under load: "Too many connections"

\`\`\`
Error: sorry, too many clients already
\`\`\`

Postgres default: 100 connections. Our app: 20 instances × 10 connections = 200 needed.

## Solution 5: Connection Pooling

\`\`\`typescript
// ❌ Direct connection (exhausts pool)
import { Client } from 'pg';
const client = new Client({ connectionString });
await client.connect();

// ✅ Use connection pooler (PgBouncer or Supabase Pooler)
import { Pool } from 'pg';
const pool = new Pool({
  connectionString,
  max: 5, // Only 5 connections per instance
});

// Or use Prisma with Data Proxy
// It pools connections automatically
\`\`\`

**PgBouncer setup:**

\`\`\`ini
[databases]
mydb = host=localhost dbname=mydb

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
\`\`\`

Now 1,000 clients share 20 database connections.

## Problem 6: Slow Aggregations

Monthly revenue reports took 8 seconds:

\`\`\`sql
-- ❌ Slow aggregation
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(total) as revenue
FROM orders
WHERE created_at >= '2024-01-01'
GROUP BY month
ORDER BY month;

-- Execution time: 8,200ms
\`\`\`

## Solution 6: Materialized Views

\`\`\`sql
-- ✅ Pre-compute with materialized view
CREATE MATERIALIZED VIEW monthly_revenue AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  SUM(total) as revenue,
  COUNT(*) as order_count
FROM orders
GROUP BY month
ORDER BY month;

-- Create index on materialized view
CREATE INDEX idx_monthly_revenue_month ON monthly_revenue(month);

-- Query is instant
SELECT * FROM monthly_revenue WHERE month >= '2024-01-01';
-- Execution time: 3ms (2,700x faster!)

-- Refresh when needed (daily cron job)
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_revenue;
\`\`\`

## Problem 7: Large Payloads Killing Performance

Fetching user profiles with all data:

\`\`\`sql
-- ❌ Returns 50KB per row
SELECT * FROM users WHERE id = 'user_123';
\`\`\`

The \`bio\` column had 10KB of text. We only needed the name.

## Solution 7: Select Only What You Need

\`\`\`sql
-- ✅ Only select required columns
SELECT id, name, avatar FROM users WHERE id = 'user_123';
-- Returns 500 bytes instead of 50KB (100x smaller!)
\`\`\`

**In Prisma:**

\`\`\`typescript
// ❌ Over-fetching
const user = await prisma.user.findUnique({
  where: { id: userId }
});

// ✅ Select specific fields
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { id: true, name: true, avatar: true }
});
\`\`\`

## Bonus: Monitoring Queries

We use pg_stat_statements to find slow queries:

\`\`\`sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slowest queries
SELECT 
  ROUND(mean_exec_time::numeric, 2) AS avg_ms,
  calls,
  query
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 10;
\`\`\`

This shows which queries to optimize first.

## Our Performance Gains

| Query | Before | After | Improvement |
|-------|--------|-------|-------------|
| User orders | 3,247ms | 32ms | 100x faster |
| Order counts | 1,200ms | 1ms | 1,200x faster |
| Product search | 2,800ms | 45ms | 60x faster |
| Monthly revenue | 8,200ms | 3ms | 2,700x faster |

**Overall dashboard load time:** 3.2s → 180ms (17x faster)

## My Postgres Performance Checklist

✅ **Index your WHERE clauses**
- Check with EXPLAIN ANALYZE
- Use composite indexes for multi-column filters

✅ **Avoid N+1 queries**
- Use JOINs or batch queries
- Prisma: use \`include\` and \`select\`

✅ **Don't SELECT * **
- Only fetch columns you need
- Reduces payload size and I/O

✅ **Use full-text search for text queries**
- ILIKE is slow on large tables
- tsvector + GIN index is 50-100x faster

✅ **Pre-compute aggregations**
- Materialized views for reports
- Counter tables for counts

✅ **Monitor slow queries**
- pg_stat_statements finds bottlenecks
- Set \`log_min_duration_statement\` in production

✅ **Use connection pooling**
- PgBouncer or Supabase Pooler
- Prevents "too many connections"

## Tools I Use Daily

1. **EXPLAIN ANALYZE** - Shows query execution plan
2. **pg_stat_statements** - Identifies slow queries
3. **Prisma Studio** - Visual database browser
4. **pgAdmin** - Query analyzer and planner
5. **Supabase Dashboard** - Real-time query logs

## Common Mistakes to Avoid

❌ Creating too many indexes (slows down writes)
❌ Not vacuuming tables (leads to bloat)
❌ Using OFFSET for pagination (slow on large offsets)
❌ Not setting connection limits
❌ Ignoring query plans

## The Bottom Line

Postgres is fast. If it's slow, you're probably:
1. Missing an index
2. Running N+1 queries
3. Over-fetching data

Fix those three, and you'll see 10-100x speedups.

Our dashboard went from unusable to instant. Users are happy. My boss stopped asking questions.

*Questions about Postgres? Find me [@tejaji](https://twitter.com/tejaji).*`,
      date: "2025-11-09",
      author: "Tejaji",
      tags: ["Database", "Performance", "PostgreSQL"],
      readTime: "13 min read",
      image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&h=600&fit=crop&q=80"
    },
    {
      id: "react-testing-production-2025",
      title: "React Testing in 2025: Stop Writing Useless Tests",
      excerpt: "After reviewing 500+ failing tests in our CI, I learned what tests actually matter. Here's how we test React apps that ship with confidence.",
      content: `# React Testing in 2025: Stop Writing Useless Tests

Our test suite had 1,200 tests. CI took 40 minutes. Half the tests were useless.

We rewrote our testing strategy. Now: 400 tests. CI runs in 8 minutes. Zero production bugs in 3 months.

Here's what changed.

## The Problem with Most React Tests

**Test we used to write:**

\`\`\`typescript
// ❌ Testing implementation details
it('sets loading state to true', () => {
  const { result } = renderHook(() => useUserData());
  act(() => result.current.fetchUser());
  expect(result.current.isLoading).toBe(true);
});
\`\`\`

**What broke in production:**
- User clicks button → nothing happens (event handler broken)
- Error message doesn't show (UI logic broken)
- Loading spinner renders but API call never fires

The test passed. The feature was broken.

## The New Rule: Test Like a User

**Test we write now:**

\`\`\`typescript
// ✅ Test user behavior
it('shows loading spinner then user data', async () => {
  render(<UserProfile userId="123" />);
  
  // User sees loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  // Then sees their name
  expect(await screen.findByText('John Doe')).toBeInTheDocument();
});
\`\`\`

This catches real bugs. If the spinner doesn't show, test fails. If the API breaks, test fails.

## Pattern 1: Integration Tests > Unit Tests

We used to unit test everything:

\`\`\`typescript
// ❌ Testing internals
describe('useUserData', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useUserData());
    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(false);
  });
  
  it('sets error on failure', () => {
    // ... 50 lines of mocking
  });
});

describe('UserProfile', () => {
  it('renders loading state', () => {
    // ... test the UI in isolation
  });
});
\`\`\`

**New approach: Test the whole flow**

\`\`\`typescript
// ✅ Integration test
describe('UserProfile', () => {
  it('fetches and displays user data', async () => {
    // Mock the API
    msw.use(
      rest.get('/api/users/:id', (req, res, ctx) => {
        return res(ctx.json({ id: '123', name: 'John Doe', email: 'john@example.com' }));
      })
    );
    
    render(<UserProfile userId="123" />);
    
    // Starts loading
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Shows user data
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
  
  it('shows error when API fails', async () => {
    // Mock API error
    msw.use(
      rest.get('/api/users/:id', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    render(<UserProfile userId="123" />);
    
    // Shows error message
    expect(await screen.findByText(/failed to load/i)).toBeInTheDocument();
    
    // Has retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });
});
\`\`\`

One test covers: hook logic, API call, loading state, error handling, and UI rendering.

## Pattern 2: MSW for API Mocking

We stopped mocking fetch. We use MSW (Mock Service Worker).

**Setup:**

\`\`\`typescript
// src/test/setup.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
\`\`\`

**In tests:**

\`\`\`typescript
it('creates a new post', async () => {
  const user = userEvent.setup();
  
  // Mock POST request
  server.use(
    rest.post('/api/posts', async (req, res, ctx) => {
      const body = await req.json();
      return res(ctx.json({ id: '1', ...body }));
    })
  );
  
  render(<CreatePost />);
  
  // User types title and content
  await user.type(screen.getByLabelText(/title/i), 'My First Post');
  await user.type(screen.getByLabelText(/content/i), 'This is the content');
  
  // User clicks submit
  await user.click(screen.getByRole('button', { name: /publish/i }));
  
  // Success message appears
  expect(await screen.findByText(/post created/i)).toBeInTheDocument();
});
\`\`\`

MSW intercepts the actual fetch call. No mocking fetch. No mocking axios. Just works.

## Pattern 3: User Events, Not fireEvent

We used to use \`fireEvent\`:

\`\`\`typescript
// ❌ fireEvent doesn't simulate real user behavior
fireEvent.change(input, { target: { value: 'test' } });
fireEvent.click(button);
\`\`\`

**Problem:** Doesn't trigger focus, blur, hover, or keyboard navigation.

**Now we use \`@testing-library/user-event\`:**

\`\`\`typescript
// ✅ Simulates real user interactions
import { userEvent } from '@testing-library/user-event';

it('submits form on enter key', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  
  render(<LoginForm onSubmit={onSubmit} />);
  
  // Type email
  await user.type(screen.getByLabelText(/email/i), 'john@example.com');
  
  // Tab to password field
  await user.tab();
  
  // Type password
  await user.type(screen.getByLabelText(/password/i), 'password123');
  
  // Press enter to submit
  await user.keyboard('{Enter}');
  
  expect(onSubmit).toHaveBeenCalledWith({
    email: 'john@example.com',
    password: 'password123'
  });
});
\`\`\`

This catches keyboard navigation bugs, focus management issues, and accessibility problems.

## Pattern 4: Test Error Boundaries

Error boundaries prevent crashes. Test them:

\`\`\`typescript
// ErrorBoundary component
function ErrorBoundary({ children }: Props) {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return <div>Something went wrong</div>;
  }
  
  return (
    <ErrorBoundaryWrapper onError={() => setHasError(true)}>
      {children}
    </ErrorBoundaryWrapper>
  );
}

// Test
it('catches errors and shows fallback UI', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };
  
  // Suppress console.error in test
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  
  spy.mockRestore();
});
\`\`\`

## Pattern 5: Visual Regression Testing

We use Playwright for visual tests:

\`\`\`typescript
// tests/visual/button.spec.ts
import { test, expect } from '@playwright/test';

test('button variants look correct', async ({ page }) => {
  await page.goto('/storybook?path=/story/button--variants');
  
  // Take screenshot
  await expect(page).toHaveScreenshot('button-variants.png');
});
\`\`\`

Catches CSS regressions, layout shifts, and design bugs.

## Pattern 6: Accessibility Testing

We test a11y with jest-axe:

\`\`\`typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<LoginForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
\`\`\`

Catches:
- Missing labels
- Bad color contrast
- Invalid ARIA attributes
- Keyboard navigation issues

## Pattern 7: Test Loading and Error States

Most tests only check the happy path. Bad idea.

\`\`\`typescript
describe('UserList', () => {
  it('shows empty state', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.json([]));
      })
    );
    
    render(<UserList />);
    
    expect(await screen.findByText(/no users found/i)).toBeInTheDocument();
  });
  
  it('shows loading skeleton', () => {
    render(<UserList />);
    
    // Shows 5 skeleton loaders
    expect(screen.getAllByTestId('skeleton')).toHaveLength(5);
  });
  
  it('shows error with retry button', async () => {
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    
    render(<UserList />);
    
    expect(await screen.findByText(/failed to load users/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
\`\`\`

## Our Testing Pyramid

**End-to-End (10% of tests)**
- Critical user flows
- Playwright tests
- Example: "User signs up, creates post, logs out"

**Integration (70% of tests)**
- Feature slices with MSW
- User interactions
- Example: "Create post form submits correctly"

**Unit (20% of tests)**
- Pure functions only
- Example: "formatDate returns correct format"

## Real Example: Testing a Form

\`\`\`typescript
describe('CreatePostForm', () => {
  it('submits valid post', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    
    server.use(
      rest.post('/api/posts', async (req, res, ctx) => {
        const body = await req.json();
        return res(ctx.json({ id: '1', ...body }));
      })
    );
    
    render(<CreatePostForm onSuccess={onSuccess} />);
    
    // Fill form
    await user.type(screen.getByLabelText(/title/i), 'Test Post');
    await user.type(screen.getByLabelText(/content/i), 'This is content');
    await user.selectOptions(screen.getByLabelText(/category/i), 'tech');
    
    // Upload image
    const file = new File(['image'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/upload image/i);
    await user.upload(input, file);
    
    // Submit
    await user.click(screen.getByRole('button', { name: /publish/i }));
    
    // Success callback called
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });
  
  it('shows validation errors', async () => {
    const user = userEvent.setup();
    
    render(<CreatePostForm />);
    
    // Click submit without filling form
    await user.click(screen.getByRole('button', { name: /publish/i }));
    
    // Shows errors
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/content is required/i)).toBeInTheDocument();
  });
  
  it('disables submit during loading', async () => {
    const user = userEvent.setup();
    
    // Slow API response
    server.use(
      rest.post('/api/posts', async (req, res, ctx) => {
        await delay(1000);
        return res(ctx.json({ id: '1' }));
      })
    );
    
    render(<CreatePostForm />);
    
    await user.type(screen.getByLabelText(/title/i), 'Test');
    await user.type(screen.getByLabelText(/content/i), 'Content');
    
    const submitButton = screen.getByRole('button', { name: /publish/i });
    await user.click(submitButton);
    
    // Button disabled during submit
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/publishing/i)).toBeInTheDocument();
  });
});
\`\`\`

## Tools We Use

1. **Vitest** - Fast test runner (3x faster than Jest)
2. **Testing Library** - User-centric queries
3. **MSW** - API mocking
4. **Playwright** - E2E and visual tests
5. **jest-axe** - Accessibility testing

## What We Don't Test

❌ Implementation details (state, props)
❌ Third-party libraries (React, lodash)
❌ Trivial components (styled divs)
❌ 100% code coverage (aim for 80%)

## What We DO Test

✅ User interactions
✅ API integrations
✅ Error handling
✅ Loading states
✅ Form validation
✅ Accessibility

## The Results

**Before:**
- 1,200 tests
- 40-minute CI
- 3-5 production bugs per week
- Devs afraid to refactor

**After:**
- 400 tests
- 8-minute CI
- 0-1 bugs per month
- Confident deploys

## My Testing Rules

1. **Write tests for features, not functions.**
2. **Mock at the network boundary (MSW).**
3. **Test like a user, not a developer.**
4. **Integration > Unit.**
5. **Test error states.**
6. **Run tests in CI on every PR.**

Tests should give you confidence to ship. If they don't, you're testing the wrong things.

*Questions about testing? DM me [@tejaji](https://twitter.com/tejaji).*`,
      date: "2025-11-08",
      author: "Tejaji",
      tags: ["Testing", "React", "Quality"],
      readTime: "14 min read",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=600&fit=crop&q=80"
    },
    {
      id: "nextjs-deployment-vercel-2025",
      title: "Next.js to Production: Deploy Like You Mean It",
      excerpt: "From localhost to handling 100K users. Environment variables, edge functions, caching strategies, and monitoring. Everything I wish I knew before my first deploy.",
      content: `# Next.js to Production: Deploy Like You Mean It

My first Next.js deploy to Vercel: clicked "Deploy" and it just... worked.

My first production incident: "Why is the site down?" "What's this $800 AWS bill?" "Where are the error logs?"

Here's everything I learned about deploying Next.js properly.

## Part 1: Environment Variables (Don't Leak Secrets)

**Common mistake:**

\`\`\`typescript
// ❌ This leaks your API key to the browser!
const apiKey = process.env.API_KEY;
fetch(\`https://api.service.com?key=\${apiKey}\`);
\`\`\`

Check your browser console → Network tab → Query params. Your secret is visible.

### The Fix: Public vs Private Env Variables

\`\`\`bash
# .env.local

# ✅ Server-only (never sent to browser)
DATABASE_URL="postgresql://..."
API_SECRET_KEY="sk_live_..."

# ✅ Public (sent to browser, prefix with NEXT_PUBLIC_)
NEXT_PUBLIC_API_URL="https://api.example.com"
NEXT_PUBLIC_ANALYTICS_ID="UA-123456"
\`\`\`

**Usage:**

\`\`\`typescript
// Server Component or API Route (safe)
import { db } from '@/lib/db';
const data = await db.query(); // Uses DATABASE_URL

// Client Component (must use NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
fetch(\`\${apiUrl}/data\`);
\`\`\`

**Validate env vars on startup:**

\`\`\`typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_API_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);

// Now TypeScript knows these exist
env.DATABASE_URL // string (always defined)
\`\`\`

## Part 2: Image Optimization

Next.js Image component is great... until you get the bill.

**Problem:**

\`\`\`tsx
// ❌ This can generate 100+ image variants
<Image 
  src="/hero.jpg" 
  width={1200} 
  height={600} 
  alt="Hero"
/>
\`\`\`

Vercel optimizes images on-demand. With 10K users, you might optimize the same image 10K times. $$$.

### Solution 1: Static Optimization

\`\`\`javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
\`\`\`

### Solution 2: Use a CDN (Cloudinary, Imgix)

\`\`\`typescript
// next.config.js
module.exports = {
  images: {
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/your-cloud/',
  },
};
\`\`\`

Cloudinary has a free tier and handles optimization.

### Solution 3: Optimize at Build Time

\`\`\`typescript
import { getPlaiceholder } from 'plaiceholder';

export async function getStaticProps() {
  const { base64, img } = await getPlaiceholder('/hero.jpg');
  
  return {
    props: { blurDataURL: base64, ...img }
  };
}
\`\`\`

Generate blur placeholders at build time, not runtime.

## Part 3: Caching Strategies

Next.js caching can be confusing. Here's what actually works:

### Static Pages (ISR)

\`\`\`typescript
// app/blog/[slug]/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  return <article>{post.content}</article>;
}
\`\`\`

Page is generated at build time, cached for 1 hour, then regenerated.

### Dynamic API Routes

\`\`\`typescript
// app/api/users/route.ts
export async function GET() {
  const users = await db.user.findMany();
  
  return Response.json(users, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    }
  });
}
\`\`\`

- Cached for 60s
- Serves stale content while revalidating for 30s

### Opt Out of Caching

\`\`\`typescript
// app/api/auth/route.ts
export const dynamic = 'force-dynamic'; // Never cache
export const revalidate = 0; // Never cache

export async function POST(req: Request) {
  // Authentication logic
}
\`\`\`

## Part 4: Edge Functions vs Serverless

**Serverless Functions (default):**
- Cold start: ~200ms
- Can use any Node.js library
- Full access to Node APIs

**Edge Functions:**
- Cold start: ~0ms
- Limited runtime (no fs, limited npm packages)
- Deployed globally (fast for users)

**When to use Edge:**

\`\`\`typescript
// app/api/geo/route.ts
export const runtime = 'edge';

export async function GET(req: Request) {
  const geo = req.geo; // Geolocation data (Vercel only)
  
  return Response.json({
    country: geo?.country,
    city: geo?.city
  });
}
\`\`\`

Use for:
- Geolocation redirects
- A/B testing
- Authentication checks
- Fast API responses

**Don't use for:**
- Database queries (use Serverless)
- Heavy computation
- Large npm dependencies

## Part 5: Database Connections

**Problem: Serverless functions open too many connections.**

\`\`\`typescript
// ❌ New connection on every request
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  const users = await prisma.user.findMany();
  return Response.json(users);
}
\`\`\`

With 100 concurrent requests, you open 100 database connections. Postgres dies.

### Solution: Connection Pooling

\`\`\`typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
\`\`\`

Reuses the same Prisma instance across requests.

**Even better: Use Prisma Data Proxy or Supabase Pooler**

\`\`\`bash
DATABASE_URL="prisma://aws-us-east-1.prisma-data.com/?api_key=..."
\`\`\`

Handles connection pooling for you.

## Part 6: Monitoring (Know When Things Break)

### 1. Error Tracking with Sentry

\`\`\`typescript
// app/error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({ error }: { error: Error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return <div>Something went wrong!</div>;
}
\`\`\`

### 2. Analytics with Vercel Analytics

\`\`\`typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
\`\`\`

Tracks Web Vitals, page views, and performance.

### 3. Custom Metrics

\`\`\`typescript
// app/api/checkout/route.ts
import { track } from '@vercel/analytics/server';

export async function POST(req: Request) {
  const order = await createOrder();
  
  // Track custom event
  track('purchase', {
    value: order.total,
    currency: 'USD',
  });
  
  return Response.json(order);
}
\`\`\`

## Part 7: CI/CD Pipeline

**GitHub Actions for tests:**

\`\`\`yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
\`\`\`

**Vercel automatically deploys:**
- Every push to \`main\` → Production
- Every PR → Preview deployment

**Preview URLs are magic:**
- Test features before merging
- Share with stakeholders
- Run E2E tests against preview

## Part 8: Security Headers

\`\`\`javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};
\`\`\`

## Part 9: Performance Budget

Set limits so you know when bundle size grows:

\`\`\`javascript
// next.config.js
module.exports = {
  webpack(config) {
    config.performance = {
      maxAssetSize: 512000, // 500 KB
      maxEntrypointSize: 512000,
      hints: 'error'
    };
    return config;
  }
};
\`\`\`

Build fails if bundle exceeds 500 KB.

## Part 10: Database Migrations

**Don't run migrations in production manually.**

Use a CI/CD pipeline:

\`\`\`yaml
# .github/workflows/deploy.yml
- name: Run migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: \${{ secrets.DATABASE_URL }}
\`\`\`

Or use Vercel's build command:

\`\`\`json
// package.json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
\`\`\`

## My Pre-Deploy Checklist

✅ Environment variables set in Vercel dashboard
✅ Sentry configured for error tracking
✅ Analytics added
✅ Security headers configured
✅ Database connection pooling enabled
✅ Image optimization strategy chosen
✅ Caching strategy defined
✅ Tests pass in CI
✅ Preview deployment tested
✅ Performance budget set

## Common Production Issues

**Issue 1: "It works locally but not in production"**
→ Check environment variables

**Issue 2: "Images load slowly"**
→ Use a CDN or optimize at build time

**Issue 3: "Database connection errors"**
→ Enable connection pooling

**Issue 4: "High costs"**
→ Check image optimizations and caching

**Issue 5: "Slow API responses"**
→ Use Edge functions or add caching

## The Bottom Line

Deploying Next.js to Vercel is easy. Deploying it correctly takes planning.

Handle secrets properly. Optimize images. Cache aggressively. Monitor everything. Test before deploying.

Do this, and your deploys will be boring (in a good way).

*Questions about Next.js deployment? Find me [@tejaji](https://twitter.com/tejaji).*`,
      date: "2025-11-07",
      author: "Tejaji",
      tags: ["Next.js", "Deployment", "DevOps"],
      readTime: "16 min read",
      image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=1200&h=600&fit=crop&q=80"
    },
    {
      id: "web-accessibility-wcag-2025",
      title: "Web Accessibility: Stop Treating It Like an Afterthought",
      excerpt: "After an ADA lawsuit threat and rebuilding our site for WCAG 2.1 AA compliance, here's what accessibility actually means and why it makes your site better for everyone.",
      content: `# Web Accessibility: Stop Treating It Like an Afterthought

We got an email from a law firm. "Your website violates the Americans with Disabilities Act."

We scrambled. Hired an accessibility consultant. Rebuilt half the site.

Lesson learned: Build it accessible from day one. Here's how.

## Why Accessibility Matters

**1. Legal:** ADA lawsuits are real. Settlements range from $10K to $100K+.

**2. Users:** 15% of the world has some form of disability. That's 1 billion people.

**3. SEO:** Accessible sites rank better (semantic HTML helps search engines).

**4. Better UX:** Accessibility improvements help everyone.
   - Keyboard navigation helps power users
   - Alt text helps slow connections
   - High contrast helps bright sunlight

## The WCAG 2.1 AA Standard

**WCAG = Web Content Accessibility Guidelines**

Three levels:
- **A:** Basic (minimum)
- **AA:** Standard (what most laws require)
- **AAA:** Enhanced (nice to have)

We target AA. Here's what that means.

## Part 1: Semantic HTML (The Foundation)

**Bad HTML:**

\`\`\`html
<!-- ❌ Divs for everything -->
<div class="header">
  <div class="nav">
    <div class="link" onclick="navigate()">Home</div>
    <div class="link" onclick="navigate()">About</div>
  </div>
</div>

<div class="main">
  <div class="title">Welcome</div>
  <div class="text">This is the content...</div>
</div>
\`\`\`

Screen readers don't understand this. It's just nested divs.

**Good HTML:**

\`\`\`html
<!-- ✅ Semantic elements -->
<header>
  <nav aria-label="Main navigation">
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</header>

<main>
  <h1>Welcome</h1>
  <p>This is the content...</p>
</main>
\`\`\`

Screen readers announce: "Navigation region. Link: Home. Link: About."

## Part 2: Keyboard Navigation

If you can't use it with Tab, Enter, and Arrow keys, it's not accessible.

**Test:** Close your eyes. Navigate your site with only the keyboard. Can you?

### Focus Management

\`\`\`tsx
// ❌ Custom button with no keyboard support
<div className="button" onClick={handleClick}>
  Click me
</div>

// ✅ Real button (keyboard works by default)
<button onClick={handleClick}>
  Click me
</button>
\`\`\`

**For custom interactive elements, add keyboard support:**

\`\`\`tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Custom button
</div>
\`\`\`

### Focus Indicators

\`\`\`css
/* ❌ Never do this */
* {
  outline: none;
}

/* ✅ Custom focus styles */
button:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
\`\`\`

## Part 3: Color Contrast

WCAG AA requires:
- **Normal text:** 4.5:1 contrast ratio
- **Large text (18px+):** 3:1 contrast ratio

**Bad contrast:**

\`\`\`css
/* ❌ Fails WCAG (only 2.3:1 contrast) */
.text {
  color: #999; /* Light gray */
  background: #fff; /* White */
}
\`\`\`

**Good contrast:**

\`\`\`css
/* ✅ Passes WCAG (7:1 contrast) */
.text {
  color: #333; /* Dark gray */
  background: #fff; /* White */
}
\`\`\`

**Tool:** Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Part 4: Alt Text for Images

Every \`<img>\` needs an \`alt\` attribute.

\`\`\`tsx
// ❌ No alt text
<img src="/logo.png" />

// ❌ Useless alt text
<img src="/chart.png" alt="chart" />

// ✅ Descriptive alt text
<img src="/chart.png" alt="Bar chart showing 40% increase in sales from Q1 to Q2" />

// ✅ Decorative images (empty alt)
<img src="/decorative-line.png" alt="" />
\`\`\`

**Empty alt (\`alt=""\`) tells screen readers to skip the image.**

## Part 5: Form Accessibility

Forms are the most common accessibility failure.

**Bad form:**

\`\`\`html
<!-- ❌ No labels -->
<input type="text" placeholder="Email" />
<input type="password" placeholder="Password" />
<button>Login</button>
\`\`\`

Screen readers can't tell what the inputs are for.

**Good form:**

\`\`\`html
<!-- ✅ Labels and error messages -->
<form>
  <label for="email">Email</label>
  <input 
    id="email" 
    type="email" 
    aria-describedby="email-error"
    aria-invalid={!!error}
  />
  {error && (
    <span id="email-error" role="alert">
      {error}
    </span>
  )}
  
  <label for="password">Password</label>
  <input id="password" type="password" />
  
  <button type="submit">Login</button>
</form>
\`\`\`

**Key points:**
- Every input has a \`<label>\`
- \`id\` and \`for\` attributes connect them
- Error messages use \`role="alert"\` and \`aria-describedby\`
- \`aria-invalid\` announces errors

## Part 6: ARIA Attributes (Use Sparingly)

**Rule: No ARIA is better than bad ARIA.**

ARIA = Accessible Rich Internet Applications

Use only when HTML isn't enough.

### Common ARIA Attributes

\`\`\`tsx
// Role (tells screen readers what it is)
<div role="dialog">Modal content</div>

// Aria-label (adds a label)
<button aria-label="Close dialog">
  <XIcon />
</button>

// Aria-labelledby (references another element)
<div role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Delete</h2>
</div>

// Aria-describedby (adds description)
<input 
  aria-describedby="password-hint"
/>
<span id="password-hint">Must be 8+ characters</span>

// Aria-live (announces dynamic changes)
<div aria-live="polite">
  {message}
</div>

// Aria-expanded (for dropdowns/accordions)
<button aria-expanded={isOpen}>
  Menu
</button>
\`\`\`

### Live Regions

When content changes dynamically, announce it:

\`\`\`tsx
function SearchResults({ results, loading }) {
  return (
    <div aria-live="polite" aria-atomic="true">
      {loading ? (
        <p>Loading results...</p>
      ) : (
        <p>{results.length} results found</p>
      )}
    </div>
  );
}
\`\`\`

Screen readers announce: "Loading results... 42 results found."

## Part 7: Modal Accessibility

Modals are tricky. Here's the checklist:

\`\`\`tsx
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Focus trap: keep focus inside modal
  useEffect(() => {
    if (!isOpen) return;
    
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;
    
    firstElement?.focus();
    
    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
    
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);
  
  // Close on Escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
    >
      <h2 id="modal-title">Modal Title</h2>
      {children}
      <button onClick={onClose} aria-label="Close modal">
        ×
      </button>
    </div>
  );
}
\`\`\`

**Checklist:**
✅ Focus traps inside modal
✅ Closes on Escape key
✅ \`role="dialog"\` and \`aria-modal="true"\`
✅ Labeled with \`aria-labelledby\`
✅ First focusable element gets focus

## Part 8: Skip Links

Help keyboard users skip navigation:

\`\`\`tsx
// Hidden by default, visible on focus
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

<nav>...</nav>

<main id="main-content">
  ...
</main>
\`\`\`

\`\`\`css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
\`\`\`

## Part 9: Testing Tools

### 1. Automated Testing (Catches ~30% of issues)

\`\`\`bash
npm install --save-dev axe-core @axe-core/react
\`\`\`

\`\`\`typescript
import { axe } from 'jest-axe';

it('has no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
\`\`\`

### 2. Browser Extensions
- **axe DevTools** (Free, best automated tool)
- **WAVE** (Visual feedback)
- **Lighthouse** (Built into Chrome DevTools)

### 3. Screen Reader Testing (Catches ~70% of issues)

**macOS:** VoiceOver (Cmd + F5)
**Windows:** NVDA (free) or JAWS (paid)

Navigate your site with a screen reader. If it's confusing, fix it.

### 4. Keyboard Testing

Tab through every interactive element. Can you:
- See focus indicators?
- Activate buttons with Enter?
- Close modals with Escape?
- Navigate dropdowns with arrows?

## Part 10: Real-World Example

Here's a complete accessible component:

\`\`\`tsx
function AccessibleDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const items = ['Option 1', 'Option 2', 'Option 3'];
  
  return (
    <div>
      <button
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {items[selectedIndex]}
      </button>
      
      {isOpen && (
        <ul 
          role="listbox"
          aria-activedescendant={\`option-\${selectedIndex}\`}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              setSelectedIndex((selectedIndex + 1) % items.length);
            } else if (e.key === 'ArrowUp') {
              setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
            } else if (e.key === 'Enter') {
              setIsOpen(false);
            }
          }}
        >
          {items.map((item, i) => (
            <li
              key={i}
              id={\`option-\${i}\`}
              role="option"
              aria-selected={i === selectedIndex}
              onClick={() => {
                setSelectedIndex(i);
                setIsOpen(false);
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
\`\`\`

## Common Mistakes

❌ Using divs instead of buttons
❌ Missing alt text on images
❌ Poor color contrast
❌ No keyboard support
❌ Form inputs without labels
❌ Removing focus outlines
❌ Using \`onClick\` on non-interactive elements

## The Bottom Line

Accessibility isn't a feature. It's a requirement.

Build it in from the start:
- Use semantic HTML
- Support keyboard navigation
- Test with real screen readers
- Run automated tests

Your site will be better for everyone. And you won't get sued.

*Accessibility questions? Find me [@tejaji](https://twitter.com/tejaji).*`,
      date: "2025-11-06",
      author: "Tejaji",
      tags: ["Accessibility", "WCAG", "Best Practices"],
      readTime: "15 min read",
      image: "https://images.unsplash.com/photo-1573495627378-6b0e8c2e1e5d?w=1200&h=600&fit=crop&q=80"
    }
  ];

  return premiumPosts.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export const blogPosts: BlogPost[] = generateHumanPosts();
