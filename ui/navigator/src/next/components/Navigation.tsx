// file: next/components/Navigation.tsx
// Navigation component for the Navigator

import React, { type ReactNode } from "react";
import type {
  ComponentOverrides,
  NavigationItem,
  NavigationSection,
} from "../types";
import { useNavigator } from "../context/Navigator";
import { withOverride } from "../utils/component";

interface NavigationProps {
  renderNavigation?: (props: any) => ReactNode;
  components?: ComponentOverrides;
}

/**
 * Default Navigation component
 */
const DefaultNavigation: React.FC<NavigationProps> = () => {
  const {
    navigation,
    activeSection,
    activeItem,
    responsive,
  } = useNavigator();

  const { isMobile, currentConfig } = responsive;

  // Use appropriate navigation display based on responsive config
  const primaryNavDisplay = currentConfig.primaryNav || "tabs";
  const categoryNavDisplay = currentConfig.categoryNav || "tabs";

  // Skip rendering for mobile when using drawer
  if (isMobile && primaryNavDisplay === "drawer") {
    return null;
  }

  return (
    <div className="nav-navigation">
      {/* Primary Navigation */}
      {primaryNavDisplay === "tabs" && (
        <PrimaryNavigation
          sections={navigation}
          activeItem={activeItem}
        />
      )}

      {/* Category Navigation */}
      {categoryNavDisplay === "tabs" && activeSection && (
        <CategoryNavigation
          section={navigation.find((s) => s.id === activeSection)}
          activeItem={activeItem}
        />
      )}
    </div>
  );
};

interface PrimaryNavigationProps {
  sections: NavigationSection[];
  activeItem: NavigationItem | null;
}

// Primary navigation component (tabs)
const PrimaryNavigation: React.FC<PrimaryNavigationProps> = ({
  sections,
  activeItem,
}) => {
  const { router, renderIcon } = useNavigator();
  const { Link } = router;

  if (sections.length === 0) {
    return null;
  }

  // Primary navigation is always the first section
  const primarySection = sections[0];

  return (
    <div className="nav-primary">
      <nav className="nav-primary-inner">
        {primarySection.items.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`nav-item ${
              activeItem?.id === item.id ? "nav-item-active" : ""
            }`}
            aria-current={activeItem?.id === item.id ? "page" : undefined}
          >
            {item.icon && (
              <span className="nav-item-icon">{renderIcon(item.icon)}</span>
            )}
            <span className="nav-item-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

interface CategoryNavigationProps {
  section?: NavigationSection;
  activeItem: NavigationItem | null;
}

// Category navigation component (tabs)
const CategoryNavigation: React.FC<CategoryNavigationProps> = ({
  section,
  activeItem,
}) => {
  const { router, renderIcon } = useNavigator();
  const { Link } = router;

  if (!section || section.items.length === 0) {
    return null;
  }

  return (
    <div
      className={`nav-category ${
        section.separator ? "nav-category-separator" : ""
      }`}
    >
      <nav className="nav-category-inner">
        {section.items.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`nav-item ${
              activeItem?.id === item.id ? "nav-item-active" : ""
            }`}
            aria-current={activeItem?.id === item.id ? "page" : undefined}
          >
            {item.icon && (
              <span className="nav-item-icon">{renderIcon(item.icon)}</span>
            )}
            <span className="nav-item-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

/**
 * Navigation component with override support
 */
export const Navigation: React.FC<NavigationProps> = ({
  renderNavigation,
  components,
}) => {
  const { navigation, activeSection, activeItem } = useNavigator();

  if (renderNavigation) {
    return renderNavigation({
      sections: navigation,
      activeSection,
      activeItem,
    });
  }

  const NavigationComponent = withOverride(
    DefaultNavigation,
    components,
    "Navigation",
  );
  return <NavigationComponent components={components} />;
};
