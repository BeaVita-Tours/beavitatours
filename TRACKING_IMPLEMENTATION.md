# Meta Pixel & Google Tag Manager Implementation

## Overview
Both Meta Pixel (ID: `1116117860659984`) and Google Tag Manager (ID: `GTM-N5H2N2VZ`) have been successfully integrated into your Next.js application using best practices.

## Implementation Details

### Meta Pixel: `components/meta-pixel.tsx`
- **Type**: Client-side component (`"use client"`)
- **Uses**: Next.js `Script` component with `strategy="afterInteractive"` for optimal loading
- **Auto-tracking**: Automatically tracks PageView events on route changes using Next.js navigation hooks

### Google Tag Manager: `components/google-tag-manager.tsx`
- **Type**: Server-safe component (no "use client" needed for GTM)
- **Uses**: Next.js `Script` component with `strategy="afterInteractive"`
- **Components**: 
  - `GoogleTagManager` - Main GTM script for head
  - `GoogleTagManagerNoscript` - Fallback iframe for body (placed immediately after `<body>` tag)

### Key Features
✅ Initial PageView tracked on first load (Meta Pixel)  
✅ Automatic PageView tracking on client-side navigation (Meta Pixel)  
✅ GTM dataLayer initialized and ready for custom events  
✅ Uses `next/script` for optimized script loading  
✅ Includes noscript fallbacks for users with JavaScript disabled  
✅ TypeScript support with proper type declarations  

### Integration Point
Both tracking components are imported and rendered in:
- **File**: `app/[locale]/layout.tsx`
- **Location**: 
  - `<GoogleTagManagerNoscript />` - First element inside `<body>` tag (as per Google requirements)
  - `<MetaPixel />` - Before closing `</body>` tag
  - `<GoogleTagManager />` - Before closing `</body>` tag

This ensures both tracking systems load on every page across all locales (en, it, zh, ja).

## How It Works

### Meta Pixel
1. **Initial Load**: The Meta Pixel script loads and fires the initial `PageView` event
2. **Route Changes**: The `useEffect` hook listens to `pathname` and `searchParams` changes
3. **SPA Navigation**: When users navigate between pages, `fbq('track', 'PageView')` is automatically called

### Google Tag Manager
1. **Initial Load**: GTM script loads and initializes the `dataLayer` array
2. **DataLayer**: All GTM tags, triggers, and variables are managed through the GTM dashboard
3. **Custom Events**: Push events to `dataLayer` for custom tracking

## Testing

### Meta Pixel
1. **Development**: Run `npm run dev` and open browser DevTools
2. **Check Network Tab**: Look for requests to `facebook.net/en_US/fbevents.js`
3. **Meta Pixel Helper**: Install the [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/) Chrome extension
4. **Events Manager**: Check Meta Events Manager at https://business.facebook.com/events_manager2/

### Google Tag Manager
1. **Development**: Run `npm run dev` and open browser DevTools Console
2. **Check DataLayer**: Type `window.dataLayer` in console - should see array with GTM events
3. **Preview Mode**: Use GTM Preview mode from Tag Manager dashboard
4. **Network Tab**: Look for requests to `googletagmanager.com/gtm.js?id=GTM-N5H2N2VZ`

## Custom Event Tracking

### Meta Pixel Custom Events
```tsx
"use client";

function BookingButton() {
  const handleClick = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_name: 'Tour Booking',
        value: 150.00,
        currency: 'EUR'
      });
    }
  };

  return <button onClick={handleClick}>Book Now</button>;
}
```

### Google Tag Manager Custom Events
```tsx
"use client";

function ContactForm() {
  const handleSubmit = () => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'form_submission',
        form_name: 'contact_form',
        form_type: 'inquiry'
      });
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### TypeScript Declaration for DataLayer
Add to your type declarations if needed:
```typescript
declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}
```

## Build Status
✅ Build completed successfully  
✅ All 48 pages generated without errors  
✅ TypeScript validation passed  
✅ Meta Pixel integrated  
✅ Google Tag Manager integrated  

## Production Checklist
- [ ] Verify Meta Pixel tracking in Meta Events Manager
- [ ] Test GTM tags in GTM Preview mode
- [ ] Configure GTM tags for conversions (form submissions, bookings, etc.)
- [ ] Set up GTM triggers for important user actions
- [ ] Configure Meta Pixel conversion events for ad optimization
- [ ] Test tracking across all locales (en, it, zh, ja)

