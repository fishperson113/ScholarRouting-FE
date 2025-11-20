# Chatbot Architecture

## Overview
The chatbot has been refactored to separate the Basic and Pro plan interfaces, enabling independent feature development for each plan.

## File Structure

### Core Files
- **chatbot_overview.tsx** - Main chatbot component that handles:
  - Plan selection UI
  - State management (messages, input, loading states)
  - API communication
  - Routing between Basic and Pro chatboxes

- **chatbox-base.tsx** - Shared base component containing:
  - Common UI elements (messages, input area, loading indicators)
  - Message formatting and rendering logic
  - Scholarship interaction components
  - Reusable types (Message, ScholarshipInfo)

- **chatbox-basic.tsx** - Basic plan chatbox
  - Uses ChatboxBase with Basic-specific suggestions
  - Can be extended with Basic-only features

- **chatbox-pro.tsx** - Pro plan chatbox
  - Uses ChatboxBase with Pro-specific suggestions
  - Can be extended with Pro-only features (file upload, advanced search, etc.)

## Adding New Features

### For Basic Plan Only
Edit `src/components/chatbot/chatbox-basic.tsx`:
```tsx
export function ChatboxBasic(props: ChatboxBasicProps) {
  // Add Basic-specific logic here
  
  return (
    <>
      <ChatboxBase {...props} quickReplySuggestions={BASIC_SUGGESTIONS} />
      {/* Add Basic-specific UI here */}
    </>
  );
}
```

### For Pro Plan Only
Edit `src/components/chatbot/chatbox-pro.tsx`:
```tsx
export function ChatboxPro(props: ChatboxProProps) {
  // Add Pro-specific logic here
  
  return (
    <>
      <ChatboxBase {...props} quickReplySuggestions={PRO_SUGGESTIONS} />
      {/* Add Pro-specific UI here */}
    </>
  );
}
```

### For Both Plans
Edit `src/components/chatbot/chatbox-base.tsx` to add shared functionality.

## Pro Plan Features

### Profile Integration Toggle
The Pro plan includes a toggle button that allows users to enable/disable using their profile information for personalized scholarship recommendations.

**Location**: Top of the chatbox (banner above messages)

**Features**:
- Toggle switch with on/off states
- Visual feedback when enabled (purple theme)
- Informational message showing what data will be used
- State persisted in localStorage
- Automatically sends `use_profile` flag to API

**Implementation**:
- State managed in `chatbot_overview.tsx`
- UI rendered in `chatbox-pro.tsx`
- API receives `use_profile: true/false` in request body

## Benefits
- **Separation of Concerns**: Each plan has its own component
- **Code Reusability**: Common functionality in ChatboxBase
- **Easy Maintenance**: Changes to one plan don't affect the other
- **Scalability**: Easy to add plan-specific features
- **Plan-Specific Features**: Pro plan has profile integration, Basic plan remains simple
