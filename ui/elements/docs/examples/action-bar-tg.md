# ActionBar Container Query Testing Guide

## 🎯 What to Test

### 1. Header ActionBar Alignment

**Expected:** ActionBar should be properly right-aligned in the header **Test:**
Check that the ActionBar in the header (Navigation/Profile buttons) aligns to
the right side properly

### 2. Container Query Responsive Behavior

**Expected:** ActionBar adapts based on its container width, not viewport width

**Test Steps:**

1. Open the Showcase page (`/showcase`)
2. Look for the "ActionBar Container Query Demonstration" section
3. Resize the browser window and observe:
   - **Wide containers (500px+)**: Show icons + labels
   - **Medium containers (300-400px)**: Show icons only (labels hidden)
   - **Narrow containers (200-250px)**: Show compact icons

### 3. Position Variants

**Expected:** Left, center, and right positioning works correctly

**Test in different scenarios:**

- Header: `position="right"` - should align to the right
- Dashboard: `position="left"` - should align to the left
- Cards: `position="center"` - should center within container

### 4. Container Independence

**Expected:** Multiple ActionBars on the same page adapt independently

**Test:** On the Showcase page, verify that:

- Wide container ActionBar shows full labels
- Narrow container ActionBar shows icons only
- **Both respond to their container, not viewport size**

## 🔧 Key Breakpoints to Verify

- **500px+**: Full layout (icons + labels + badges)
- **400px**: Labels hidden, icons visible
- **250px**: Ultra-compact (smaller icons, badges hidden)

## ✅ Success Criteria

1. **Header Layout**: ActionBar properly right-aligned
2. **Container Queries Work**: Components adapt to container, not viewport
3. **Independent Behavior**: Multiple ActionBars adapt independently
4. **Smooth Transitions**: No layout jumps when resizing
5. **All Positions Work**: Left, center, right alignment functions correctly

## 🐛 Common Issues to Watch For

- ActionBar not aligning properly in header
- Labels not hiding when container gets narrow
- Container queries not triggering at specified breakpoints
- Multiple ActionBars on same page all responding to viewport instead of
  individual containers
- Position prop not working (especially `position="right"`)

## 📱 Mobile Testing

Test on mobile devices to ensure:

- Header ActionBar remains usable
- Touch targets are appropriate size
- No horizontal overflow
- Compact mode works well on small screens
