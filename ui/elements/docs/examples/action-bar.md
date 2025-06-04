## ActionBar

```jsx
// EXAMPLE 1: Header ActionBar (Right-aligned)
const headerActions: Action[] = [
  { id: "menu", label: "Menu", icon: "☰" },
  { id: "notifications", label: "Notifications", icon: "🔔", badge: 3 },
  { id: "profile", label: "Profile", icon: "👤" },
];

// In Header component:
<div className="header-actions">
  <ActionBar
    actions={headerActions}
    onActionClick={handleActionClick}
    position="right"  // This now works properly
    responsive={true}
  />
</div>

// EXAMPLE 2: Dashboard ActionBar (Left-aligned)
const dashboardActions: Action[] = [
  { id: "create", label: "Create New", icon: "➕" },
  { id: "search", label: "Search", icon: "🔍" },
  { id: "filter", label: "Filter", icon: "⚙️" },
  { id: "export", label: "Export Data", icon: "📤", badge: 3 },
];

<ActionBar
  actions={dashboardActions}
  onActionClick={handleActionClick}
  position="left"
  responsive={true}
/>

// EXAMPLE 3: Card ActionBar (Compact variant)
const cardActions: Action[] = [
  { id: "edit", label: "Edit", icon: "✏️" },
  { id: "share", label: "Share", icon: "🔗" },
  { id: "delete", label: "Delete", icon: "🗑️" },
];

<Card variant="elevated" padding="md">
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <h3>Card Title</h3>
    <ActionBar
      actions={cardActions}
      variant="compact"
      position="right"
      responsive={true}
    />
  </div>
  <p>Card content...</p>
</Card>

// EXAMPLE 4: Container Query Demo - Different Width Containers
<div className="demo-grid">
  {/* Wide Container - Shows labels + icons */}
  <div className="demo-container demo-container--wide">
    <h4>Wide Container (500px+)</h4>
    <ActionBar
      actions={dashboardActions}
      onActionClick={handleActionClick}
      responsive={true}
    />
  </div>

  {/* Medium Container - Icons only */}
  <div className="demo-container demo-container--medium">
    <h4>Medium Container (300px)</h4>
    <ActionBar
      actions={dashboardActions.slice(0, 4)}
      onActionClick={handleActionClick}
      responsive={true}
    />
  </div>

  {/* Narrow Container - Compact icons */}
  <div className="demo-container demo-container--narrow">
    <h4>Narrow Container (200px)</h4>
    <ActionBar
      actions={dashboardActions.slice(0, 3)}
      onActionClick={handleActionClick}
      responsive={true}
    />
  </div>
</div>

// EXAMPLE 5: E-commerce Filter Bar
const shopActions: Action[] = [
  { id: "view", label: "List View", icon: "☰" },
  { id: "filters", label: "Filters", icon: "🔍" },
  { id: "wishlist", label: "Wishlist", icon: "❤️", badge: 5 },
  { id: "cart", label: "Cart", icon: "🛒", badge: 2 },
];

<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h2>Products</h2>
  <ActionBar
    actions={shopActions}
    onActionClick={handleActionClick}
    position="right"
    responsive={true}
  />
</div>
```
