# Notion-Style CSS Framework - Class Reference

## 🎨 Quick Start
1. Copy `notion-style.css` into your project
2. Link it in your HTML: `<link rel="stylesheet" href="notion-style.css">`
3. Use the classes below in your HTML/JSX

## 📦 Main Containers

| Class | Description | Usage |
|-------|-------------|-------|
| `.notion-container` | Main container with border and padding | Wrap your main content |
| `.notion-container.compact` | Reduced padding version | For tighter layouts |
| `.notion-container.large` | Extra padding version | For spacious layouts |
| `.notion-section` | Section with subtle border | Group related content |
| `.notion-card` | Card component | Individual content blocks |

## 🎯 Typography

| Class | Description | Usage |
|-------|-------------|-------|
| `.notion-title` | Main title (18px, semibold) | Page/section titles |
| `.notion-title.large` | Large title (24px, bold) | Main headings |
| `.notion-title.small` | Small title (16px, medium) | Subheadings |
| `.notion-section-title` | Section title (14px, medium) | Section headers |
| `.notion-text` | Body text (14px) | Regular content |
| `.notion-text.large` | Large text (16px) | Important content |
| `.notion-text.small` | Small text (12px) | Captions, metadata |
| `.notion-text.muted` | Muted text color | Secondary information |
| `.notion-text.secondary` | Secondary text color | Less important text |

## 🔘 Buttons

| Class | Description | Usage |
|-------|-------------|-------|
| `.notion-button` | Primary button (blue) | Main actions |
| `.notion-button.secondary` | Secondary button (white) | Secondary actions |
| `.notion-button.outline` | Outline button | Subtle actions |
| `.notion-button.success` | Success button (green) | Confirm actions |
| `.notion-button.danger` | Danger button (red) | Delete/destructive actions |
| `.notion-button.small` | Small button (28px height) | Compact spaces |
| `.notion-button.large` | Large button (44px height) | Prominent actions |
| `.notion-button:disabled` | Disabled state | Inactive buttons |

## 📝 Input Fields

| Class | Description | Usage |
|-------|-------------|-------|
| `.notion-input` | Standard input field | Text inputs, forms |
| `.notion-input.small` | Small input field | Compact forms |
| `.notion-input.large` | Large input field | Prominent inputs |
| `.notion-input.error` | Error state input | Validation errors |
| `.notion-dropdown` | Dropdown container | Select elements |

## 📋 Lists and Items

| Class | Description | Usage |
|-------|-------------|-------|
| `.notion-item` | List item container | Task lists, data rows |
| `.notion-item.completed` | Completed item state | Done tasks |
| `.notion-item-left` | Left side of item | Content area |
| `.notion-item-right` | Right side of item | Actions/metadata |
| `.notion-item-meta` | Item metadata container | Text content |
| `.notion-item-name` | Item title | Main item text |
| `.notion-item-sub` | Item subtitle | Secondary info |
| `.notion-circle` | Checkbox circle | Task checkboxes |
| `.notion-circle.checked` | Checked state | Completed tasks |

## 🏷️ Pills and Tags

| Class | Description | Usage |
|-------|-------------|-------|
| `.notion-pill` | Basic pill/tag | Labels, categories |
| `.notion-pill.primary` | Primary pill (blue) | Important labels |
| `.notion-pill.success` | Success pill (green) | Completed states |
| `.notion-pill.warning` | Warning pill (orange) | Attention needed |
| `.notion-pill.danger` | Danger pill (red) | Errors, urgent |

## ⏳ Loading States

| Class | Description | Usage |
|-------|-------------|-------|
| `.notion-spinner` | Loading spinner | Loading indicators |
| `.notion-spinner.small` | Small spinner (16px) | Inline loading |
| `.notion-spinner.large` | Large spinner (32px) | Page loading |
| `.notion-loading` | Loading container | Loading with text |

## 💬 Messages and Alerts

| Class | Description | Usage |
|-------|-------------|-------|
| `.notion-message` | Base message container | All message types |
| `.notion-message.success` | Success message (green) | Success notifications |
| `.notion-message.error` | Error message (red) | Error notifications |
| `.notion-message.warning` | Warning message (orange) | Warning notifications |
| `.notion-message.info` | Info message (blue) | Information messages |

## 📊 Progress and States

| Class | Description | Usage |
|-------|-------------|-------|
| `.notion-progress` | Progress bar container | Progress indicators |
| `.notion-progress-bar` | Progress bar fill | Progress visualization |
| `.notion-progress-bar.success` | Success progress (green) | Completed progress |
| `.notion-progress-bar.warning` | Warning progress (orange) | Partial progress |
| `.notion-progress-bar.danger` | Danger progress (red) | Critical progress |
| `.notion-empty` | Empty state message | No data states |
| `.notion-empty.large` | Large empty state | Prominent empty states |

## 🎛️ Layout Utilities

| Class | Description | Usage |
|-------|-------------|-------|
| `.notion-grid` | Grid container | Layout grids |
| `.notion-grid.cols-2` | 2-column grid | Two-column layouts |
| `.notion-grid.cols-3` | 3-column grid | Three-column layouts |
| `.notion-grid.cols-4` | 4-column grid | Four-column layouts |
| `.notion-flex` | Flex container | Flexible layouts |
| `.notion-flex.center` | Centered flex | Center content |
| `.notion-flex.between` | Space between | Distribute content |
| `.notion-flex.around` | Space around | Distribute with margins |
| `.notion-flex.column` | Column direction | Vertical layouts |
| `.notion-flex.gap-sm` | Small gap (8px) | Tight spacing |
| `.notion-flex.gap-md` | Medium gap (12px) | Normal spacing |
| `.notion-flex.gap-lg` | Large gap (16px) | Loose spacing |
| `.notion-divider` | Horizontal divider | Section separators |

## 📱 Responsive Classes

| Class | Description | Usage |
|-------|-------------|-------|
| `.notion-flex.column-mobile` | Column on mobile | Mobile layouts |

## 🎨 Color Variables (CSS Custom Properties)

```css
/* Primary Colors */
--notion-blue: #2383e2
--notion-blue-hover: #1a73d1
--notion-blue-light: rgba(35, 131, 226, 0.1)

/* Text Colors */
--notion-text-primary: #37352f
--notion-text-secondary: #6b7280
--notion-text-muted: #9b9a97

/* Background Colors */
--notion-bg-primary: #ffffff
--notion-bg-secondary: #f7f6f3
--notion-bg-hover: #f3f4f6

/* Border Colors */
--notion-border: #e9e9e9
--notion-border-light: #f3f3f3
--notion-border-medium: #d9d9d7
```

## 🚀 Example Usage for Pomodoro Timer

```html
<!-- Main Timer Container -->
<div class="notion-container">
  <h1 class="notion-title large">Pomodoro Timer</h1>
  
  <!-- Timer Display -->
  <div class="notion-section">
    <div class="notion-text large" style="font-size: 48px; text-align: center;">25:00</div>
    <div class="notion-flex center gap-md" style="margin-top: 16px;">
      <button class="notion-button">Start</button>
      <button class="notion-button secondary">Pause</button>
      <button class="notion-button outline">Reset</button>
    </div>
  </div>
  
  <!-- Task List -->
  <div class="notion-section-title">Today's Tasks</div>
  <div class="notion-item">
    <div class="notion-item-left">
      <div class="notion-circle"></div>
      <div class="notion-item-meta">
        <div class="notion-item-name">Complete project proposal</div>
        <div class="notion-item-sub">Due: 3:00 PM</div>
      </div>
    </div>
    <div class="notion-item-right">
      <span class="notion-pill primary">High Priority</span>
    </div>
  </div>
</div>
```

## 💡 Pro Tips

1. **Combine classes**: Use multiple classes together (e.g., `notion-button large success`)
2. **Responsive**: All components are mobile-friendly by default
3. **Customization**: Override CSS variables to match your brand colors
4. **Accessibility**: All components include proper focus states and hover effects
5. **Performance**: Lightweight CSS with minimal dependencies

## 🎯 Perfect for:
- Pomodoro timers
- Task management apps
- Productivity dashboards
- Admin panels
- Documentation sites
- Any clean, professional interface
