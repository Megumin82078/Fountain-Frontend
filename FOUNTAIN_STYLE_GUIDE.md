# Fountain Design System & Style Guide

## Overview

Fountain uses a **luxury monochrome design system** emphasizing elegance, minimalism, and premium aesthetics. The design philosophy centers on sophisticated black and white aesthetics with subtle gray gradients, creating a timeless and professional healthcare platform.

## Design Principles

1. **Monochrome Luxury**: Pure black and white palette with sophisticated gray scales
2. **Minimalist Clarity**: Clean interfaces with purposeful whitespace
3. **Elegant Typography**: Premium font choices with careful hierarchy
4. **Subtle Sophistication**: Refined shadows and smooth transitions
5. **Consistent Experience**: Unified design language across all components

## Brand Identity

### Logo
- **Text**: "Fountain" 
- **Font**: Playfair Display (serif)
- **Style**: Bold, black text with tight letter spacing
- **Usage**: Always maintain clear space around logo

### Tagline
"Your complete health record companion"

## Color Palette

### Primary Colors (Monochrome)
```css
/* Pure Black & White */
--color-white: #ffffff;
--color-black: #000000;

/* Gray Scale */
--color-gray-50: #fafafa;   /* Lightest gray */
--color-gray-100: #f5f5f5;
--color-gray-200: #e5e5e5;
--color-gray-300: #d4d4d4;
--color-gray-400: #a3a3a3;
--color-gray-500: #737373;  /* Mid gray */
--color-gray-600: #525252;
--color-gray-700: #404040;
--color-gray-800: #262626;
--color-gray-900: #171717;  /* Darkest gray */
```

### Semantic Colors (Grayscale Variations)
- **Success**: Uses gray-500 (#737373)
- **Warning**: Uses gray-500 (#737373)
- **Error**: Uses gray-700 (#404040)
- **Info**: Uses gray-500 (#737373)

### Usage Guidelines
- **Primary Actions**: Black backgrounds with white text
- **Secondary Actions**: White backgrounds with black borders
- **Hover States**: Subtle gray shifts (e.g., gray-50 to gray-100)
- **Disabled States**: 40-50% opacity
- **Text**: Black (#000000) for headers, gray-600 (#525252) for body

## Typography

### Font Families
```css
/* Display Font - Headers & Branding */
--font-display: 'Jost', 'Futura', system-ui, sans-serif;

/* Body Font - Content & UI */
--font-body: 'Jost', 'Futura', system-ui, sans-serif;

/* Monospace - Code & Data */
--font-mono: 'SF Mono', 'Monaco', monospace;

/* Logo Only */
.logo-text {
  font-family: 'Playfair Display', serif;
}
```

### Font Weights
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extra Bold: 800

### Typography Scale

#### Hero Text
```css
.text-hero {
  font-size: 5rem (mobile: 3rem);
  line-height: 0.9;
  font-weight: 700;
  letter-spacing: -0.04em;
}
```

#### Display Text
```css
.text-display {
  font-size: 4rem (mobile: 2.5rem);
  line-height: 1.1;
  font-weight: 500;
  letter-spacing: -0.03em;
}
```

#### Headline
```css
.text-headline {
  font-size: 2rem (mobile: 1.5rem);
  line-height: 1.15;
  font-weight: 500;
  letter-spacing: -0.02em;
}
```

#### Title
```css
.text-title {
  font-size: 1.25rem;
  line-height: 1.3;
  font-weight: 600;
  letter-spacing: -0.01em;
}
```

#### Body
```css
.text-body {
  font-size: 1rem;
  line-height: 1.65;
  font-weight: 400;
}
```

#### Caption
```css
.text-caption {
  font-size: 0.875rem;
  line-height: 1.5;
  font-weight: 500;
}
```

## Components

### Buttons

#### Primary Button
```css
.btn-primary {
  background: black;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #262626;
  transform: translateY(-1px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.1);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: white;
  color: black;
  border: 2px solid #e5e5e5;
  padding: 12px 24px;
  border-radius: 8px;
}

.btn-secondary:hover {
  background: #fafafa;
  border-color: #d4d4d4;
}
```

#### Button Sizes
- **XS**: padding: 6px 12px; font-size: 12px;
- **SM**: padding: 8px 16px; font-size: 14px;
- **MD**: padding: 12px 24px; font-size: 16px;
- **LG**: padding: 16px 32px; font-size: 18px;
- **XL**: padding: 20px 40px; font-size: 20px;

### Cards

#### Basic Card
```css
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.04);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px rgba(0,0,0,0.08);
}
```

#### Card Variants
- **Whisper**: Minimal shadow, subtle presence
- **Elegant**: Standard shadow with gradient background
- **Luxurious**: Enhanced shadow, larger padding
- **Majestic**: Premium shadow effect with gradient

### Forms

#### Input Fields
```css
.input-luxury {
  padding: 16px 24px;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  font-weight: 500;
  transition: all 0.3s ease;
}

.input-luxury:focus {
  border-color: black;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
```

#### Labels
```css
.label-luxury {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 12px;
  letter-spacing: -0.01em;
}
```

### Navigation

#### Sidebar Navigation
```css
.nav-link {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-link-active {
  background: #fafafa;
  color: black;
  border-left: 4px solid black;
}

.nav-link:hover {
  background: #f5f5f5;
  color: black;
}
```

### Layout

#### Container Sizes
- **Royal**: max-width: 1280px; padding: 24px-48px;
- **Intimate**: max-width: 1024px; padding: 24px-32px;

#### Spacing System
- **luxury**: 32px (2rem)
- **royal**: 48px (3rem)
- **imperial**: 64px (4rem)

## Shadows

```css
/* Shadow Scale */
--shadow-whisper: 0 1px 3px rgba(0,0,0,0.03);
--shadow-subtle: 0 4px 6px rgba(0,0,0,0.04);
--shadow-elegant: 0 10px 15px rgba(0,0,0,0.05);
--shadow-luxurious: 0 20px 25px rgba(0,0,0,0.08);
--shadow-majestic: 0 25px 50px rgba(0,0,0,0.12);
```

## Transitions

```css
/* Transition Presets */
--transition-silk: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
--transition-fluid: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
--transition-luxe: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
```

## Icons

- **Style**: Outline icons with 2px stroke
- **Size**: 16px, 20px, 24px, 32px
- **Color**: Match text color or use gray-600 for secondary

## Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: 1024px - 1280px
- **Wide**: > 1280px

### Mobile Considerations
- Increase tap targets to minimum 44px
- Simplify navigation to hamburger menu
- Stack cards vertically
- Reduce font sizes proportionally

## Animation Guidelines

### Hover Effects
- Subtle elevation changes (-1px to -2px)
- Shadow transitions
- Color shifts within gray scale
- Scale animations (0.98 to 1.02)

### Page Transitions
```css
.animate-fade-luxe {
  animation: fadeInLuxe 0.8s ease-out;
}

@keyframes fadeInLuxe {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

## Best Practices

### Do's
1. **Maintain consistency** in spacing and alignment
2. **Use proper hierarchy** with font sizes and weights
3. **Ensure adequate contrast** (WCAG AA compliance)
4. **Keep interactions smooth** with appropriate transitions
5. **Respect whitespace** as a design element

### Don'ts
1. **Don't mix colors** outside the monochrome palette
2. **Don't use heavy shadows** that break the elegant aesthetic
3. **Don't overcrowd** layouts - embrace minimalism
4. **Don't use decorative fonts** outside of branding
5. **Don't create custom components** that break the design system

## Implementation Examples

### Page Header
```jsx
<header className="bg-white border-b border-gray-100">
  <div className="flex items-center justify-between px-6 py-3">
    <h1 className="text-xl font-semibold text-black">
      Page Title
    </h1>
    <button className="px-4 py-2 text-sm font-medium text-gray-700 
                       border border-gray-200 rounded-lg hover:bg-gray-50">
      Action
    </button>
  </div>
</header>
```

### Card Component
```jsx
<div className="bg-white rounded-xl border-0 p-6 shadow-elegant">
  <h3 className="text-lg font-semibold text-black mb-2">
    Card Title
  </h3>
  <p className="text-gray-600">
    Card content goes here with proper typography.
  </p>
</div>
```

### Form Field
```jsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-800 mb-2">
    Field Label
  </label>
  <input className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl
                    focus:outline-none focus:border-black" />
</div>
```

## Accessibility

1. **Color Contrast**: Ensure 4.5:1 ratio for normal text, 3:1 for large text
2. **Focus States**: Visible focus rings on all interactive elements
3. **Touch Targets**: Minimum 44x44px on mobile
4. **Semantic HTML**: Use proper heading hierarchy and ARIA labels
5. **Keyboard Navigation**: All interactions accessible via keyboard

## Future Considerations

As Fountain evolves, maintain the core monochrome aesthetic while considering:
- Dark mode implementation (inverted palette)
- Micro-interactions and subtle animations
- Advanced data visualization components
- Enhanced mobile experiences
- Performance optimizations

---

This style guide ensures consistency across all Fountain implementations. When creating new pages or components, always refer back to these guidelines to maintain the premium, monochrome aesthetic that defines the Fountain brand.