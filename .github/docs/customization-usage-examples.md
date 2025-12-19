# Customization System - Usage Examples

This document provides examples of how to use the customization persistence layer implemented in Issue 1.

## Overview

The customization system allows users to personalize the Personal-Pennies interface. All customizations are stored in `account-config.json` and persist across sessions.

## API Methods

### `getCustomization(key)`

Get a customization value by key. Supports dot notation for nested values.

**Examples:**

```javascript
// Get entire customization object
const allCustomizations = window.accountManager.getCustomization();
// Returns: { theme: {...}, preferences: {...} }

// Get a specific theme color
const primaryColor = window.accountManager.getCustomization('theme.primaryColor');
// Returns: "#00ff88"

// Get all theme settings
const theme = window.accountManager.getCustomization('theme');
// Returns: { primaryColor: "#00ff88", secondaryColor: "#0a0e27", ... }

// Get a preference
const dateFormat = window.accountManager.getCustomization('preferences.dateFormat');
// Returns: "MM/DD/YYYY"
```

### `setCustomization(keyOrObject, value)`

Set a customization value. Validates before saving.

**Examples:**

```javascript
// Set a single value using dot notation
window.accountManager.setCustomization('theme.primaryColor', '#ff0088');
// Returns: true (if validation passes)

// Set an entire customization object
window.accountManager.setCustomization({
  theme: {
    primaryColor: '#6366f1',
    secondaryColor: '#0a0e27',
    accentColor: '#ffd93d',
    backgroundColor: '#0a0e27'
  },
  preferences: {
    dateFormat: 'DD/MM/YYYY',
    currencySymbol: '€',
    timezone: 'Europe/London'
  }
});
// Returns: true (if validation passes)

// Set a preference
window.accountManager.setCustomization('preferences.currencySymbol', '£');
// Returns: true
```

## Validation Rules

### Theme Colors

All color values must be valid CSS colors:

```javascript
// Valid formats
setCustomization('theme.primaryColor', '#00ff88');        // Hex
setCustomization('theme.primaryColor', '#0f8');          // Short hex
setCustomization('theme.primaryColor', 'rgb(0,255,136)'); // RGB
setCustomization('theme.primaryColor', 'rgba(0,255,136,0.5)'); // RGBA
setCustomization('theme.primaryColor', 'hsl(160,100%,50%)'); // HSL
setCustomization('theme.primaryColor', 'green');          // Named color

// Invalid - will return false
setCustomization('theme.primaryColor', 'not-a-color');
setCustomization('theme.primaryColor', '#gggggg');
```

### Date Format

Only three formats are supported:

```javascript
// Valid
setCustomization('preferences.dateFormat', 'MM/DD/YYYY'); // US format
setCustomization('preferences.dateFormat', 'DD/MM/YYYY'); // European format
setCustomization('preferences.dateFormat', 'YYYY-MM-DD'); // ISO format

// Invalid - will return false
setCustomization('preferences.dateFormat', 'DD-MM-YYYY');
```

### Currency Symbol

Must be a string with maximum 3 characters:

```javascript
// Valid
setCustomization('preferences.currencySymbol', '$');
setCustomization('preferences.currencySymbol', '€');
setCustomization('preferences.currencySymbol', 'USD');

// Invalid - will return false
setCustomization('preferences.currencySymbol', 'DOLLARS');
setCustomization('preferences.currencySymbol', 123);
```

### Timezone

Must be a valid string:

```javascript
// Valid
setCustomization('preferences.timezone', 'America/New_York');
setCustomization('preferences.timezone', 'Europe/London');
setCustomization('preferences.timezone', 'Asia/Tokyo');

// Invalid - will return false
setCustomization('preferences.timezone', 123);
```

## CSS Custom Properties

When theme colors are updated, they are automatically applied as CSS custom properties:

```javascript
setCustomization('theme.primaryColor', '#6366f1');
// Automatically sets --accent-green CSS variable to #6366f1

setCustomization('theme.secondaryColor', '#1e293b');
// Automatically sets --bg-primary CSS variable to #1e293b

setCustomization('theme.accentColor', '#f59e0b');
// Automatically sets --accent-yellow CSS variable to #f59e0b

setCustomization('theme.backgroundColor', '#0f172a');
// Automatically sets --bg-secondary CSS variable to #0f172a
```

## EventBus Integration

The customization system emits events when changes occur:

```javascript
// Listen for customization updates
// Note: EventBus is accessed through window.SFTiEventBus if available
if (window.SFTiEventBus) {
  window.SFTiEventBus.on('customization:updated', (customization) => {
    console.log('Customization updated:', customization);
    // Update UI or perform other actions
  });
}

// Make a change to trigger the event
window.accountManager.setCustomization('theme.primaryColor', '#6366f1');
```

## Browser Console Examples

You can test the customization system directly in the browser console:

```javascript
// Example 1: Change the primary color to purple
window.accountManager.setCustomization('theme.primaryColor', '#a855f7');

// Example 2: Change date format to European
window.accountManager.setCustomization('preferences.dateFormat', 'DD/MM/YYYY');

// Example 3: Change currency symbol to Euro
window.accountManager.setCustomization('preferences.currencySymbol', '€');

// Example 4: Get current theme
const currentTheme = window.accountManager.getCustomization('theme');
console.log('Current theme:', currentTheme);

// Example 5: Reset to default theme colors
window.accountManager.setCustomization({
  theme: {
    primaryColor: '#00ff88',
    secondaryColor: '#0a0e27',
    accentColor: '#ffd93d',
    backgroundColor: '#0a0e27'
  }
});
```

## Error Handling

When validation fails, the method returns `false` and logs errors to console:

```javascript
const result = window.accountManager.setCustomization('theme.primaryColor', 'invalid-color');
if (!result) {
  console.error('Failed to set customization - check console for validation errors');
}
// Console will show: "Validation failed for theme.primaryColor: ['theme.primaryColor must be a valid color (hex, rgb, or named color)']"
```

## Default Values

Default customization values are automatically set if not present in `account-config.json`:

```json
{
  "customization": {
    "theme": {
      "primaryColor": "#00ff88",
      "secondaryColor": "#0a0e27",
      "accentColor": "#ffd93d",
      "backgroundColor": "#0a0e27"
    },
    "preferences": {
      "dateFormat": "MM/DD/YYYY",
      "currencySymbol": "$",
      "timezone": "America/New_York"
    }
  }
}
```

## Integration with Existing Code

The customization system integrates seamlessly with existing code:

```javascript
// The accountManager is automatically initialized
// You can use it anywhere after page load
SFTiUtils.onDOMReady(async () => {
  // accountManager is available at window.accountManager
  const primaryColor = window.accountManager.getCustomization('theme.primaryColor');
  console.log('Primary color:', primaryColor);
});
```

## Next Steps

Future issues will build upon this foundation to add:

1. **Issue 2**: Customization modal UI in `modals.js`
2. **Issue 3**: Color picker interface
3. **Issue 4**: Theme switcher
4. **Issue 5**: Background selector
5. **Issue 6**: Top messages customization
6. **Issues 7-10**: Advanced features and polish
