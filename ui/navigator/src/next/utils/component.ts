// file: next/utils/component.ts
// Shared component utilities

import type { ComponentType } from 'react';

/**
 * Higher-order component for component overrides
 * Allows replacing default components with custom implementations
 */
export function withOverride<P>(
  DefaultComponent: ComponentType<P>,
  overrides?: Record<string, ComponentType<any>>,
  componentName?: string
): ComponentType<P> {
  if (!componentName || !overrides || !overrides[componentName]) {
    return DefaultComponent;
  }

  return overrides[componentName] as ComponentType<P>;
}