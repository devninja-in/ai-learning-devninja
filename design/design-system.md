# AI Learning Platform Design System

## Color Palette

### Light Mode
- **Primary**: #2563EB (blue-600) - Trustworthy, tech, learning
- **Secondary**: #059669 (emerald-600) - Progress, success, completion
- **Accent**: #F59E0B (amber-500) - Attention, highlights, interactive elements
- **Background**: #FFFFFF - Clean, readable background
- **Surface**: #F8FAFC (slate-50) - Cards, panels, elevated content
- **Border**: #E2E8F0 (slate-200) - Subtle separation
- **Text Primary**: #1E293B (slate-800) - Main content
- **Text Secondary**: #64748B (slate-500) - Supporting text
- **Error**: #DC2626 (red-600) - Errors, warnings
- **Warning**: #D97706 (amber-600) - Cautions, tips
- **Success**: #059669 (emerald-600) - Success states

### Dark Mode
- **Primary**: #60A5FA (blue-400) - Adjusted for dark backgrounds
- **Secondary**: #34D399 (emerald-400) - Vibrant progress indicators
- **Accent**: #FBBF24 (amber-400) - Bright highlights
- **Background**: #0F172A (slate-900) - Deep, comfortable dark
- **Surface**: #1E293B (slate-800) - Elevated content areas
- **Border**: #374151 (slate-600) - Visible but subtle borders
- **Text Primary**: #F8FAFC (slate-50) - High contrast main text
- **Text Secondary**: #CBD5E1 (slate-300) - Readable secondary text
- **Error**: #F87171 (red-400) - Visible error states
- **Warning**: #FCD34D (amber-300) - Clear warnings
- **Success**: #6EE7B7 (emerald-300) - Bright success feedback

## Typography Scale

### Font Families
- **Headings**: Inter (sans-serif) - Clean, modern, readable
- **Body**: Inter (sans-serif) - Consistent reading experience  
- **Code**: JetBrains Mono (monospace) - Clear code distinction
- **Math**: KaTeX fonts - Professional mathematical notation

### Size Scale
- **H1**: 2.25rem / 36px (font-bold, line-height: 1.2)
- **H2**: 1.875rem / 30px (font-semibold, line-height: 1.3)
- **H3**: 1.5rem / 24px (font-semibold, line-height: 1.4)
- **H4**: 1.25rem / 20px (font-semibold, line-height: 1.4)
- **Body Large**: 1.125rem / 18px (font-normal, line-height: 1.6)
- **Body**: 1rem / 16px (font-normal, line-height: 1.6)
- **Small**: 0.875rem / 14px (font-normal, line-height: 1.5)
- **Caption**: 0.75rem / 12px (font-normal, line-height: 1.4)

### Weight Scale
- **Light**: 300 (rare use, large headings only)
- **Normal**: 400 (body text, most content)
- **Medium**: 500 (emphasis, labels)
- **Semibold**: 600 (headings, important text)
- **Bold**: 700 (strong emphasis, warnings)

## Spacing Scale

### Base Unit: 4px
- **xs**: 4px (0.25rem) - Tight spacing, small gaps
- **sm**: 8px (0.5rem) - Small spacing, close elements
- **md**: 16px (1rem) - Standard spacing, most common
- **lg**: 24px (1.5rem) - Large spacing, section separation
- **xl**: 32px (2rem) - Extra large spacing, major sections
- **2xl**: 48px (3rem) - Huge spacing, page sections
- **3xl**: 64px (4rem) - Maximum spacing, hero sections

### Content Spacing
- **Paragraph spacing**: 1rem (16px)
- **Section spacing**: 2rem (32px)
- **Component padding**: 1rem (16px)
- **Card padding**: 1.5rem (24px)
- **Page margins**: 2rem (32px) mobile, 3rem (48px) desktop

## Component Specifications

### Buttons
- **Height**: 40px (medium), 32px (small), 48px (large)
- **Padding**: 16px horizontal, 8px vertical
- **Border radius**: 8px (rounded-lg)
- **Font weight**: 500 (medium)
- **Transition**: 150ms ease-in-out
- **Focus ring**: 2px primary color with 2px offset

### Cards and Containers
- **Border radius**: 12px (rounded-xl) for cards, 8px (rounded-lg) for smaller elements
- **Shadow**: 
  - Small: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)
  - Medium: 0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)
  - Large: 0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)
- **Border**: 1px solid border color
- **Padding**: 24px for cards, 16px for smaller containers

### Interactive Elements
- **Hover transition**: 200ms ease-in-out
- **Active state**: 95% scale transform
- **Focus outline**: 2px solid primary, 2px offset
- **Disabled opacity**: 50%

### Form Elements
- **Input height**: 40px
- **Input padding**: 12px horizontal, 8px vertical
- **Border radius**: 6px (rounded-md)
- **Border width**: 1px
- **Focus border**: 2px primary color

## Educational Design Principles

### Visual Hierarchy
1. **Clear Information Architecture**: Use consistent heading levels and spacing
2. **Progressive Disclosure**: Layer information complexity appropriately
3. **Visual Grouping**: Related content grouped with consistent spacing
4. **Call-to-Action Clarity**: Interactive elements clearly distinguishable

### Accessibility Guidelines
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Touch Targets**: Minimum 44px tap targets for mobile
- **Screen Reader Support**: Proper semantic HTML and ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility for all interactions
- **Motion Reduction**: Respect prefers-reduced-motion settings

### Interactive Learning Elements
- **Immediate Feedback**: Visual feedback for user interactions
- **Progress Indicators**: Clear learning progression visualization
- **Error Prevention**: Helpful validation and guidance
- **Exploration Encouragement**: Visual cues for interactive elements

### Code and Mathematical Content
- **Syntax Highlighting**: Consistent color scheme for code blocks
- **Mathematical Notation**: Proper KaTeX rendering and sizing
- **Copy-Paste Friendly**: Clear code selection and copying
- **Responsive Code**: Horizontal scrolling for long lines

## Responsive Breakpoints

### Screen Sizes
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px  
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

### Layout Guidelines
- **Mobile First**: Design for mobile, enhance for larger screens
- **Touch Interactions**: Minimum 44px touch targets
- **Reading Width**: Maximum 65-75 characters per line for readability
- **Sidebar Behavior**: Collapsible navigation for smaller screens

## Animation and Motion

### Timing Functions
- **Ease In**: cubic-bezier(0.25, 0.46, 0.45, 0.94) - Gentle starts
- **Ease Out**: cubic-bezier(0.25, 0.46, 0.45, 0.94) - Smooth endings
- **Ease In Out**: cubic-bezier(0.25, 0.1, 0.25, 1.0) - Balanced motion

### Duration Scale
- **Fast**: 150ms - Micro-interactions, button states
- **Medium**: 300ms - Component transitions, modal appearances
- **Slow**: 500ms - Page transitions, complex animations

### Motion Principles
- **Purposeful**: Animations should have clear functional purpose
- **Consistent**: Same timing and easing across similar interactions
- **Reduced Motion**: Respect accessibility preferences
- **Performance**: Use transform and opacity for smooth performance

## Icon System

### Icon Library
- **Primary**: Lucide React icons for consistency
- **Custom**: SVG icons for AI-specific concepts (tokens, embeddings, layers)
- **Size Scale**: 16px, 20px, 24px, 32px, 48px
- **Style**: Outline style, 2px stroke width for consistency

### AI Concept Icons
- **Token**: Rounded rectangle segments
- **Embedding**: Clustered dots in space
- **Attention Head**: Eye or focus symbol
- **Neural Layer**: Stacked horizontal lines
- **Model**: Brain or network symbol
- **Data Flow**: Arrow paths and connections

### Usage Guidelines
- **Consistent Sizing**: Use size scale consistently
- **Color Application**: Icons inherit text color unless specified
- **Accessibility**: Include proper alt text and ARIA labels
- **Performance**: Use SVG sprites for common icons