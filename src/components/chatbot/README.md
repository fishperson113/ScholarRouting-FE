# Chatbot Component

A beautiful, interactive chatbot widget for the scholarship page.

## Features

✅ **Floating Button** - Purple circular button in bottom-right corner  
✅ **Expandable Interface** - Opens to full chat window  
✅ **Minimize/Maximize** - Toggle between minimized and full view  
✅ **Avatar & Name** - Shows "Jessica Cowles" with avatar  
✅ **Online Status** - Displays "We're online"  
✅ **Message History** - Scrollable conversation area  
✅ **Quick Reply Buttons** - "Yes, sure!" and "No, thanks." buttons  
✅ **Message Input** - Text field with emoji and attachment icons  
✅ **Send Button** - Blue circular send button  
✅ **Settings** - Settings icon in header  
✅ **Smooth Animations** - Transitions and hover effects  

## Usage

```tsx
import { Chatbot } from '@/components/chatbot';

function MyPage() {
  return (
    <div>
      {/* Your page content */}
      
      <Chatbot />
    </div>
  );
}
```

## Design

Based on the provided design mockup with:
- **Header**: Dark blue gradient background
- **Avatar**: Orange circle with "JC" initials
- **Messages**: White bubbles for bot, dark blue for user
- **Input**: Rounded input field with emoji and attachment icons
- **Send Button**: Dark blue circular button with send icon
- **Quick Replies**: Rounded pill buttons

## Customization

### Change Bot Name
```tsx
// In chatbot.tsx, line 82
<div className="text-sm">Your Bot Name</div>
```

### Change Avatar
```tsx
// In chatbot.tsx, line 78
<div className="w-10 h-10 bg-orange-500 rounded-full">
  <span className="text-white font-bold text-lg">YN</span>
</div>
```

### Change Colors
```tsx
// Header background
className="bg-gradient-to-r from-blue-900 to-blue-800"

// User messages
className="bg-blue-900 text-white"

// Bot messages
className="bg-white text-gray-800"
```

### Add More Messages
```tsx
const [messages, setMessages] = useState<Message[]>([
  {
    id: '1',
    text: 'Your welcome message here',
    sender: 'bot',
    timestamp: new Date(),
  },
]);
```

## Integration

The chatbot is currently added to:
- ✅ Scholarship page (`src/app/routes/app/scholarship.tsx`)

To add to other pages:
```tsx
import { Chatbot } from '@/components/chatbot';

// Add at the end of your component
<Chatbot />
```

## Future Enhancements

- [ ] Connect to real chat API
- [ ] Add typing indicator
- [ ] Add file upload functionality
- [ ] Add emoji picker
- [ ] Add chat history persistence
- [ ] Add notification sound
- [ ] Add unread message counter
- [ ] Add multiple agent support
- [ ] Add chat transcript download
- [ ] Add language selection

## Position

The chatbot button appears in the **bottom-right corner** of the screen at:
- `bottom: 24px` (1.5rem)
- `right: 24px` (1.5rem)
- `z-index: 50` (above most content)

## Responsive

The chatbot is fully responsive:
- Mobile: Adjusts width to fit screen
- Tablet: Full-size chat window
- Desktop: 384px width, 600px height
