# 🚀 Feature Request: User Customization System

## Purpose

Enable users to customize their trading journal interface through an in-app customization system, improving user experience and personalization without requiring code changes.

-----

## User Flow

1. **Entry Point**: User clicks Account Bubble → “Customize” option appears in dropdown
1. **Category Selection**: Customize button opens Modal with category cards (Color, Theme, Background, Top Messages)
1. **Customization Interface**: Clicking a category card navigates to `customization.html` with dynamic content for selected category
1. **Application**: User makes changes → Preview updates live → “Apply” button → Changes persist to `account-config.json` and reflect across all pages immediately

-----

## Technical Requirements

### Account Bubble Enhancement

**Files**: `glowing-bubbles.js`, `glowing-bubbles.css`

- Add click handler to existing account bubble component
- Display “Customize” option in dropdown/menu (new menu item)
- Trigger customization modal on click
- Add icon/visual indicator for customization option

### New Customization Modal

**Files**: `modals.js`, `modals.css`

**Modal Features**:

- Card-based category selection with icons
- Toggle between grid/list layout views
- Maintain consistent liquid glass theme styling
- Smooth transitions and animations
- Close button and backdrop click-to-close

**Categories to Display**:

- 🎨 Color Schemes
- 🌈 Themes
- 🖼️ Backgrounds
- 💬 Top Messages
- ⚙️ Advanced (future expansion)

### Dynamic Customization Page

**New File**: `customization.html`

**Functionality**:

- Load content dynamically based on selected category (URL param: `?category=color`)
- Live preview panel showing changes in real-time
- Category-specific controls and options
- “Apply”, “Cancel”, and “Reset to Default” buttons
- Breadcrumb navigation back to category selection
- Maintain state when switching between options

**Structure**:

```html
<div class="customization-container">
  <div class="customization-sidebar">
    <!-- Category-specific controls -->
  </div>
  <div class="customization-preview">
    <!-- Live preview of changes -->
  </div>
  <div class="customization-actions">
    <!-- Apply, Cancel, Reset buttons -->
  </div>
</div>
```

### Persistence Layer

**Files**: `app.js`, `accountManager.js`, `account-config.json`

**Requirements**:

- Store all user preferences in `account-config.json`
- Load and apply preferences on every page load
- Provide API for getting/setting individual preferences
- Handle migration if config structure changes
- Validate user input before saving

**Config Structure**:

```json
{
  "userId": "user123",
  "customization": {
    "colorScheme": {
      "primary": "#6366f1",
      "accent": "#8b5cf6",
      "glowColor": "#a855f7"
    },
    "theme": {
      "mode": "dark",
      "glassOpacity": 0.15,
      "animationIntensity": "medium"
    },
    "background": {
      "selected": "nebula-01",
      "customUrl": null
    },
    "topMessages": {
      "index.html": "Welcome back, Trader!",
      "all-trades.html": "Your Trading History",
      "analytics.html": "Performance Analytics"
    }
  }
}
```

-----

## Customization Categories (Detailed)

### 1. Color Schemes

**Customizable Elements**:

- Primary accent color (buttons, links, highlights)
- Glass effect tint color
- Glow bubble colors (account, navigation)
- Chart color palette
- Success/Error/Warning colors

**UI Controls**:

- Color pickers for each element
- Preset color scheme buttons (e.g., “Ocean Blue”, “Sunset Orange”, “Forest Green”)
- Live preview of color changes on mock components

### 2. Themes

**Options**:

- Light/Dark/Auto mode toggle
- Glass effect opacity slider (0.05 - 0.30)
- Animation intensity: None, Low, Medium, High
- Font size adjustment: Small, Medium, Large
- Border radius preference: Sharp, Rounded, Fully Rounded

### 3. Backgrounds

**Features**:

- Grid of predefined background themes with thumbnails
- Each thumbnail shows preview of background
- Upload custom background option (validate file size/type)
- Blur intensity slider for backgrounds
- Parallax effect toggle

**Predefined Backgrounds to Include**:

- `nebula-01.jpg` through `nebula-05.jpg`
- `abstract-01.jpg` through `abstract-05.jpg`
- `gradient-01.jpg` through `gradient-05.jpg`
- Solid color backgrounds

### 4. Top Messages

**Functionality**:

- List of all pages with current top message displayed
- Click to edit inline or in text field
- Character limit: 100 characters per message
- Reset individual message or all messages to defaults
- Preview how message appears on actual page

**Default Messages**:

```javascript
{
  "index.html": "Welcome to Your Trading Journal",
  "add-trade.html": "Log Your Trade",
  "all-trades.html": "All Trades",
  "all-weeks.html": "Weekly Overview",
  "analytics.html": "Analytics Dashboard",
  "books.html": "Trading Library",
  "notes.html": "Trade Notes",
  "review.html": "Review Your Performance"
}
```

-----

## File Modifications Needed

### HTML Files

**All Pages** (`index.html`, `add-note.html`, `add-pdf.html`, etc.):

- Add `data-customizable="true"` to elements that can be customized
- Add `data-custom-type="topMessage"` to top message elements
- Add `data-custom-key="pageName"` for identifying which customization applies
- Ensure consistent class names for styled elements

**Example**:

```html
<h1 class="page-title" data-customizable="true" data-custom-type="topMessage" data-custom-key="index">
  Welcome to Your Trading Journal
</h1>
```

### JavaScript Files

**`glowing-bubbles.js`**:

- Add “Customize” button/option to account bubble dropdown
- Import and call customization modal trigger
- Add event listener for customize action

**`modals.js`**:

- Create `showCustomizationModal()` function
- Render category cards dynamically
- Handle card click → navigate to `customization.html?category=X`
- Add grid/list view toggle functionality

**`app.js`**:

- Load customizations on page init (before DOM ready)
- Apply color scheme CSS variables
- Apply theme settings
- Apply background selection
- Update top messages
- Export `applyCustomizations()` function

**`accountManager.js`**:

- Add `getCustomization(key)` method
- Add `setCustomization(key, value)` method
- Add `resetCustomization(key)` method (restore defaults)
- Add `saveCustomizations()` method (write to account-config.json)
- Add validation for customization values

**`background.js`**:

- Extend to support user-selected backgrounds
- Add `setCustomBackground(backgroundId)` function
- Handle custom uploaded backgrounds
- Apply blur/parallax effects based on settings

**New File: `customization.js`**:

- Handle all customization page logic
- Load category-specific UI based on URL param
- Implement live preview functionality
- Handle Apply/Cancel/Reset actions
- Communicate with accountManager for persistence

### CSS Files

**`modals.css`**:

- Style for customization category modal
- Card grid and list layouts
- Hover effects and transitions
- Responsive breakpoints

**`glowing-effects.css`**:

- Support for CSS custom properties (variables) for colors
- Dynamic class generation for different glow colors
- Ensure effects work with user-selected colors

**`main.css`**:

- Add CSS custom properties for all customizable colors:

```css
:root {
  --color-primary: #6366f1;
  --color-accent: #8b5cf6;
  --color-glow: #a855f7;
  --glass-opacity: 0.15;
  --border-radius: 0.75rem;
  /* etc. */
}
```

- Update all color references to use variables
- Add theme-specific classes (`.theme-light`, `.theme-dark`)

**New File: `customization.css`**:

- Styles for `customization.html`
- Sidebar and preview panel layouts
- Control styles (sliders, color pickers, toggles)
- Preview component styles
- Action button styles

### New Files to Create

**`customization.html`**:

- Main customization interface
- Dynamic content loading area
- Sidebar for controls
- Preview panel
- Action buttons

**`assets/js/customization.js`**:

- Core customization logic
- Category rendering
- Preview updates
- State management

**`assets/css/customization.css`**:

- Customization page styles

**`assets/themes/`** (new directory):

- `previews/`: Thumbnail images for each background
- `backgrounds/`: Full-size background images
- `themes.json`: Metadata for all themes

**Example `themes.json`**:

```json
{
  "backgrounds": [
    {
      "id": "nebula-01",
      "name": "Purple Nebula",
      "thumbnail": "previews/nebula-01-thumb.jpg",
      "full": "backgrounds/nebula-01.jpg",
      "defaultBlur": 2
    }
  ]
}
```

-----

## Implementation Priority

### Phase 1 (Core Functionality)

1. Set up `account-config.json` structure
1. Implement persistence layer in `accountManager.js`
1. Create basic customization modal in `modals.js`
1. Build `customization.html` skeleton
1. Implement “Top Messages” customization (simplest)

### Phase 2 (Visual Customization)

1. Implement CSS custom properties system
1. Add Color Schemes customization
1. Add Theme mode and opacity controls
1. Create live preview functionality

### Phase 3 (Advanced Features)

1. Implement Background selection system
1. Add preset themes
1. Create thumbnail generation for backgrounds
1. Add import/export (future enhancement)

-----

## Constraints & Requirements

### Must Have

- ✅ Work across all existing HTML pages without breaking current functionality
- ✅ Changes persist across browser sessions (stored in account-config.json)
- ✅ Mobile-responsive customization interface
- ✅ No external dependencies beyond existing stack
- ✅ Maintain liquid glass aesthetic throughout
- ✅ Graceful fallback if customization fails to load

### Performance

- Customization load time: < 100ms
- Preview updates: Real-time (no lag)
- File size: Background images < 500KB each
- Config file size: < 50KB

### Accessibility

- All controls keyboard navigable
- Color contrast meets WCAG AA standards
- Screen reader compatible
- Focus indicators visible

-----

## Testing Checklist

- [ ] Customization modal opens from account bubble
- [ ] All category cards navigate correctly
- [ ] Color changes apply across all pages
- [ ] Theme toggles work (light/dark/auto)
- [ ] Background changes persist after page reload
- [ ] Top messages update correctly on all pages
- [ ] Reset to defaults works for each category
- [ ] Mobile responsive on all screen sizes
- [ ] No console errors when applying customizations
- [ ] Config saves properly to account-config.json
- [ ] Preview updates in real-time
- [ ] Works with existing authentication system

-----

## Nice-to-Have (Future Enhancements)

- 🔄 Import/export customization profiles (JSON file)
- 📦 Preset theme templates from community
- 🎨 Custom CSS injection for power users
- 📱 Sync customizations across devices
- 🌐 Share customization presets with other users
- 🎭 Seasonal/holiday theme auto-application
- 📊 A/B testing different color schemes for productivity
- 🔔 Customization suggestions based on usage patterns

-----

## Expected Outcomes

After implementation, users should be able to:

1. ✨ Click account bubble → Customize → See category cards
1. 🎨 Select “Color Schemes” → Choose colors → See live preview → Apply → See changes everywhere
1. 🌈 Select “Themes” → Toggle dark mode → Adjust glass opacity → Apply
1. 🖼️ Select “Backgrounds” → Browse thumbnails → Click one → See preview → Apply
1. 💬 Select “Top Messages” → Edit message for each page → Apply
1. 🔄 Refresh any page → See all customizations persisted
1. ↩️ Reset any customization to default at any time

-----

## Questions for Copilot

1. Should we use CSS-in-JS or CSS custom properties for dynamic styling?
1. How should we handle custom uploaded backgrounds (storage, validation)?
1. Should theme presets override individual settings or work alongside them?
1. What’s the best way to handle live preview without affecting the actual page?
1. Should we create a separate customization.js module or integrate into existing app.js?

-----

## Related Files Reference

```txt
index.directory/
├── customization.html (NEW)
├── account-config.json (MODIFY)
├── assets/
│   ├── css/
│   │   ├── customization.css (NEW)
│   │   ├── glowing-bubbles.css (MODIFY)
│   │   ├── main.css (MODIFY)
│   │   └── modals.css (MODIFY)
│   ├── js/
│   │   ├── customization.js (NEW)
│   │   ├── accountManager.js (MODIFY)
│   │   ├── app.js (MODIFY)
│   │   ├── background.js (MODIFY)
│   │   ├── glowing-bubbles.js (MODIFY)
│   │   └── modals.js (MODIFY)
│   └── themes/ (NEW DIRECTORY)
│       ├── backgrounds/
│       ├── previews/
│       └── themes.json (NEW)
└── [all existing HTML files] (MODIFY - add data attributes)
```

-----

## Progress Tracking

### Issue 1: Setup Customization Persistence Layer ✅ COMPLETE

**Completed:**
- ✅ Extended `account-config.json` with customization structure (theme colors and preferences)
- ✅ Implemented `getCustomization(key)` method in `accountManager.js` (supports dot notation)
- ✅ Implemented `setCustomization(key, value)` method in `accountManager.js` (with validation)
- ✅ Created comprehensive validation system for customization data
  - Color validation (hex, rgb, rgba, hsl, hsla, named colors)
  - Date format validation (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
  - Currency symbol validation (max 3 characters)
  - Timezone validation
- ✅ Added CSS custom properties application (`_applyCSSCustomProperties()`)
- ✅ Integrated customization loading on init
- ✅ Added EventBus integration for `customization:updated` events
- ✅ Build passes successfully

**Key Features:**
- Dot notation support for nested keys (e.g., `theme.primaryColor`)
- Validation before setting values
- Graceful fallback to defaults if customization fails to load
- Automatic CSS variable application on page load and updates
- Backward compatibility with existing configs

**Files Modified:**
- `index.directory/account-config.json` - Added customization section
- `index.directory/assets/js/accountManager.js` - Added getCustomization/setCustomization methods and validation

**Next Steps:**
- Issue 2: Create customization modal in `modals.js`
- Issue 3-10: Build UI components and advanced features
