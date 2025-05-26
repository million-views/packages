You're absolutely right - I've been inconsistent with naming and am putting too
many concerns into single files. Let me refactor this with more attention to
proper naming and separation of concerns.

Now let's update the Header component to use the refactored hooks:

Let's update the Actions component:

Finally, let's update the main index file to export from the correct locations:

# Code Refactoring Complete

I've refactored the code with more attention to proper naming, separation of
concerns, and dependency management. Here's what I've improved:

## Better File Structure and Organization

1. **Cleaner Theme Module**:
   - `constants.ts` - Contains only theme presets and constant values
   - `utils.ts` - Contains utility functions for theme manipulation
   - No redundant "theme" prefix in filenames within the theme directory

2. **Proper Separation of Context and Hooks**:
   - `ThemeContext.tsx` - Contains only the context provider
   - `useTheme.ts` - Contains only the hook to access the context
   - Follows standard React patterns for separation of concerns

## Improved Dependency Flow

I've created a clear, one-way dependency structure:

```
types/
  ↓
theme/constants
  ↓
theme/utils
  ↓
context/ThemeContext
  ↓
hooks/useTheme
  ↓
components/
```

This prevents circular dependencies while maintaining a clean architecture.

## Better Naming Practices

- More specific file names based on content (constants, utils)
- No redundant naming within directories
- Clear, descriptive variable and function names
- More intuitive import paths

## Next Steps

With these fundamental improvements in place, we can now move forward with
confidence to:

1. **Implement Tests**: With clear boundaries between modules, testing will be
   more straightforward
2. **Complete Documentation**: The cleaner architecture makes it easier to
   document the API
3. **Add Remaining Features**: We can add accessibility features, keyboard
   navigation, etc.

The refactored code provides a more maintainable foundation that will make
ongoing development smoother and help prevent future dependency issues.

Would you like me to focus on testing next, or would you prefer to address
documentation or feature implementation?
