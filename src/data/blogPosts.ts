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

export const blogPosts: BlogPost[] = [
  {
    id: "getting-started-with-react",
    title: "Getting Started with React and TypeScript",
    excerpt: "Learn how to set up a modern React project with TypeScript, Vite, and best practices for scalable applications.",
    content: `
# Getting Started with React and TypeScript

React and TypeScript together provide a powerful combination for building robust web applications. In this post, we'll explore how to set up a modern development environment.

## Why TypeScript?

TypeScript adds static typing to JavaScript, which helps catch errors early in development and improves code maintainability. Here are some key benefits:

- **Type Safety**: Catch errors before runtime
- **Better IDE Support**: Enhanced autocomplete and refactoring
- **Improved Documentation**: Types serve as inline documentation
- **Scalability**: Easier to maintain large codebases

## Setting Up Your Project

You can quickly set up a React + TypeScript project using Vite:

\`\`\`bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
\`\`\`

## Best Practices

1. **Use strict mode**: Enable strict TypeScript settings
2. **Type your props**: Always define interfaces for component props
3. **Avoid 'any'**: Use specific types whenever possible
4. **Leverage utility types**: Use React's built-in types like FC, ReactNode, etc.

## Conclusion

Starting with TypeScript might seem daunting, but the benefits far outweigh the initial learning curve. Happy coding!
    `,
    date: "2024-11-01",
    author: "Tejaji",
    tags: ["React", "TypeScript", "Web Development"],
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop"
  },
  {
    id: "building-responsive-websites",
    title: "Building Responsive Websites with Tailwind CSS",
    excerpt: "Discover how to create beautiful, responsive layouts using Tailwind CSS utility classes and responsive design patterns.",
    content: `
# Building Responsive Websites with Tailwind CSS

Tailwind CSS has revolutionized how we approach styling in modern web development. Let's explore how to build responsive websites efficiently.

## What is Tailwind CSS?

Tailwind is a utility-first CSS framework that provides low-level utility classes to build custom designs without leaving your HTML.

## Key Concepts

### Mobile-First Approach

Tailwind uses a mobile-first breakpoint system:

\`\`\`jsx
<div className="w-full md:w-1/2 lg:w-1/3">
  Responsive width
</div>
\`\`\`

### Common Breakpoints

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## Practical Examples

### Responsive Grid Layout

\`\`\`jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>
\`\`\`

### Responsive Typography

\`\`\`jsx
<h1 className="text-2xl md:text-4xl lg:text-6xl font-bold">
  Responsive Heading
</h1>
\`\`\`

## Tips for Success

1. Start with mobile design first
2. Use Tailwind's spacing scale consistently
3. Leverage the @apply directive for repeated patterns
4. Use the JIT compiler for optimal performance

## Conclusion

Tailwind CSS makes responsive design intuitive and maintainable. Give it a try in your next project!
    `,
    date: "2024-10-28",
    author: "Tejaji",
    tags: ["CSS", "Tailwind", "Responsive Design"],
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=400&fit=crop"
  },
  {
    id: "modern-animation-techniques",
    title: "Modern Animation Techniques with Framer Motion",
    excerpt: "Create stunning animations and micro-interactions using Framer Motion to enhance user experience.",
    content: `
# Modern Animation Techniques with Framer Motion

Animations can transform a good user interface into a great one. Framer Motion makes it easy to add professional animations to your React applications.

## Why Framer Motion?

Framer Motion is a production-ready motion library for React that provides:

- Declarative animations
- Gestures and drag interactions
- Layout animations
- SVG path animations
- Server-side rendering support

## Basic Animations

### Simple Fade In

\`\`\`jsx
import { motion } from "framer-motion";

function FadeIn() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      Content
    </motion.div>
  );
}
\`\`\`

### Stagger Children

\`\`\`jsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(item => (
    <motion.li key={item} variants={item}>
      {item}
    </motion.li>
  ))}
</motion.ul>
\`\`\`

## Advanced Techniques

1. **Layout animations**: Smooth transitions between layout changes
2. **Shared layout animations**: Elements that morph between components
3. **Scroll-triggered animations**: Animations based on scroll position
4. **Gesture animations**: Interactive drag and swipe animations

## Performance Tips

- Use transform and opacity for animations (GPU-accelerated)
- Avoid animating layout properties when possible
- Use will-change sparingly
- Reduce motion for users with motion preferences

## Conclusion

Framer Motion opens up endless possibilities for creating engaging user experiences. Start small and build up to more complex animations!
    `,
    date: "2024-10-25",
    author: "Tejaji",
    tags: ["Animation", "Framer Motion", "UX Design"],
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=400&fit=crop"
  }
];
