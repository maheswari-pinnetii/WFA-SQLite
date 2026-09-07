# WFA-SQLite Design System

This document outlines the complete UI Component Library terminology and organization for the Workforce Analytics Dashboard. It serves as a single source of truth for design patterns, ensuring consistency across the application.

## Category Overview

Our UI is broken down into 7 logical categories based on function and visual hierarchy.

### 1. Core UI / Controls
Fundamental, atomic interactive elements used everywhere.
* **Buttons**: Trigger actions.
* **Cards**: Group related content.
* **Widgets**: Standalone functional blocks (e.g., weather, quick actions).
* **Text Fields / Inputs**: Single-line text entry.
* **Textareas**: Multi-line text entry.
* **Checkboxes**: Multi-select options.
* **Radio Buttons**: Single-select options from a visible list.
* **Toggle Switches**: Immediate on/off state changes.
* **Dropdowns / Select Menus**: Single-select options from a collapsible list.
* **Sliders / Range Inputs**: Selecting a value from a continuous range.
* **Date Pickers**: Selecting a single date or range.
* **Time Pickers**: Selecting a specific time.
* **Search**: Global or localized search inputs.
* **Forms**: Grouped combinations of inputs.

### 2. Navigation & Layout
Elements that help users move through the application structure.
* **Navbar / App Bar**: Top-level global navigation and identity.
* **Tabs**: Contextual navigation between related views within a page.
* **Breadcrumbs**: Hierarchical trail of the user's current location.
* **Pagination**: Navigation through large, broken-up datasets.
* **Stepper**: Multi-step sequential flows.
* **Menus**: Generic lists of navigation links or actions.
* **Drawers**: Edge-aligned slide-out panels (Sidebar).
* **Bottom Navigation**: Mobile-first primary navigation.

### 3. Overlays
Elements that sit on the Z-axis above the main page content.
* **Modal / Dialog**: Focus-stealing overlays requiring user interaction or acknowledgment.
* **Popover**: Contextual information anchored to a specific element.
* **Tooltip**: Brief, text-only explanations on hover/focus.
* **Dropdown Menu**: Action menus triggered by a button (e.g., "More Options").
* **Context Menu**: Right-click triggered contextual actions.

### 4. Feedback / Status
Elements that communicate the current system state or result of an action.
* **Toast / Snackbar**: Brief, auto-dismissing non-blocking notifications.
* **Notifications**: Persistent alerts in a dedicated center or dropdown.
* **Alerts**: In-page contextual warnings, errors, or information.
* **Badges**: Small status indicators (e.g., "New", "3").
* **Progress Bars**: Determinate or indeterminate visual loading states.
* **Spinners / Loaders**: Circular loading indicators.
* **Skeleton Screens**: UI layout placeholders during data fetch.
* **Empty States**: Friendly visuals when no data is available.

### 5. Data Display
Elements designed to showcase analytical or structured data.
* **Tables**: Standard row/column data presentation.
* **Data Grids**: Advanced tables with sorting, filtering, and pagination.
* **Lists**: Vertical groupings of items.
* **Avatars**: Visual representation of users.
* **Chips / Tags**: Compact visual items representing attributes or categories.
* **Timelines**: Chronological display of events.
* **Stats / KPI Cards**: High-level numerical metrics emphasizing current value and trend.
* **Charts**: Visual data representations (Bar, Line, Pie, etc.).
* **Toolbars**: Groupings of actions related to a data view (e.g., Table Toolbar).

### 6. Content / Media
Elements for displaying rich media or managing vertical space.
* **Accordion**: Vertically collapsing content panels.
* **Carousel**: Horizontal scrolling gallery.
* **Image Gallery**: Grid-based image display.
* **File Upload**: Drag-and-drop or click-to-upload zones.
* **Rich Text Editor**: WYSIWYG content input.

### 7. System / Web
Non-visual component concepts and architectural patterns critical for a robust UX.
* **Cookies / Cookie Consent**: Banner and management for storage mechanisms.
* **Error Pages**: 404, 500, and generic boundary fallbacks.
* **Loading States**: Global route transition handling.
* **Responsive Breakpoints**: Standardized grid adjustments for mobile/tablet/desktop.
* **Theme / Dark Mode**: Color token management.
* **Accessibility States**: Focus rings, ARIA labels, and high-contrast modes.

---

## High-Priority Components for Workforce Analytics
When building features for the analytics dashboard, prioritize the implementation and refinement of:

`Buttons` → `Inputs` → `Selects` → `Toggles` → `Cards` → `KPI Cards` → `Tables/Data Grids` → `Charts` → `Tabs` → `Modals` → `Popovers` → `Tooltips` → `Badges` → `Progress Bars` → `Toasts` → `Notifications` → `Pagination` → `Avatars` → `Chips/Tags` → `Date Pickers` → `File Upload` → `Skeleton Loaders` → `Cookies` → `Dark/Light Theme`
