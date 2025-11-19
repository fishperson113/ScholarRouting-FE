# Chatbot Responsive Implementation

## Overview
The chatbot component has been optimized for mobile devices with responsive design that ensures proper display on screens smaller than 640px.

## Technical Implementation

### 1. CSS Classes Added
- **`.scholarship-routing-chat-pro`**: Main chatbox container class
- **`.scholarship-routing-chat-pro-container`**: Parent wrapper for positioning
- **`.chatbot-floating-button-container`**: Floating button wrapper

### 2. Mobile Responsive Features (< 640px)

#### Width
- **Desktop**: 460px fixed width
- **Mobile**: 95vw (95% of viewport width)

#### Height
- **Desktop**: 600px fixed height
- **Mobile**: 85vh max-height (85% of viewport height)

#### Positioning
- **Position**: `fixed` to keep chatbox in a fixed position
- **Horizontal Centering**: 
  - `left: 50%`
  - `transform: translateX(-50%)`
- **Vertical Positioning**: 
  - `bottom: env(safe-area-inset-bottom, 20px)` for iOS safe area support
  - Falls back to `20px` on non-iOS devices

### 3. Files Modified

#### `src/components/chatbot/chatbot_overview.tsx`
- Added import for `./chatbot.css`
- Added `scholarship-routing-chat-pro` class to main chatbox container
- Added `scholarship-routing-chat-pro-container` class to wrapper divs
- Added `chatbot-floating-button-container` class to floating button
- Hidden tooltip on mobile devices using `max-sm:hidden`

#### `src/components/chatbot/chatbot.css` (New File)
- Contains all mobile-specific media queries
- Implements responsive positioning and sizing
- Supports iOS safe area with `env(safe-area-inset-bottom)`

### 4. Tailwind CSS Integration
The component uses Tailwind's responsive utilities alongside custom CSS:
- `max-sm:` prefix for screens < 640px
- Custom CSS for precise control over positioning

### 5. Key Features
✅ Responsive width (95vw on mobile)
✅ Responsive height (85vh max-height on mobile)
✅ Fixed positioning with horizontal centering
✅ iOS safe area support
✅ Smooth transitions
✅ Maintains desktop functionality
✅ Hidden tooltip on mobile for better UX

## Testing
Test the chatbot on:
- Mobile devices (< 640px width)
- Tablets (640px - 1024px)
- Desktop (> 1024px)
- iOS devices (to verify safe area support)

## Browser Support
- Modern browsers with CSS custom properties support
- iOS Safari (safe area support)
- Chrome, Firefox, Edge, Safari
