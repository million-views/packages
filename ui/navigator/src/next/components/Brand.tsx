// file: next/components/Brand.tsx
// Brand component for Navigator

import type { BrandProps } from "../types";
import { useNavigator } from "../context/Navigator";

/**
 * Brand component for displaying app logo and title
 * Can be used independently or within a Header
 */
export function Brand({
  brand,
  logo,
  title,
  url,
  extra,
  truncate = false,
  className = "",
}: BrandProps) {
  const { router, renderIcon, responsive, actions } = useNavigator();
  const { Link } = router;

  // Use provided props or brand configuration
  const brandLogo = logo || (brand?.logo);
  const brandTitle = title || (brand?.title || "");
  const brandUrl = url || (brand?.url);
  const brandExtra = extra || (brand?.extra);

  // Apply truncation if needed
  const shouldTruncate = truncate ||
    (responsive.isMobile && responsive.currentConfig.brand?.truncateTitle);

  const displayTitle = shouldTruncate && brandTitle.length > 8
    ? `${brandTitle.substring(0, 7)}...`
    : brandTitle;

  // Content to render
  const content = (
    <>
      {/* Add menu button for mobile */}
      {responsive.isMobile && (
        <button
          className="nav-menu-button"
          onClick={actions.toggleDrawer}
          aria-label="Toggle navigation menu"
        >
          {renderIcon("Menu")}
        </button>
      )}

      {brandLogo && (
        <div className="nav-logo">
          {typeof brandLogo === "string" ? renderIcon(brandLogo) : brandLogo}
        </div>
      )}

      {displayTitle && (
        <h1 className="nav-title">
          {displayTitle}
        </h1>
      )}

      {brandExtra && (
        <div className="nav-brand-extra">
          {brandExtra}
        </div>
      )}
    </>
  );

  // If URL is provided, wrap in a link
  if (brandUrl) {
    return (
      <div className="nav-brand-container">
        <Link to={brandUrl} className={`nav-brand-link ${className}`}>
          {content}
        </Link>
      </div>
    );
  }

  // Otherwise render as a plain div
  return (
    <div className="nav-brand-container">
      <div className={`nav-brand ${className}`}>
        {content}
      </div>
    </div>
  );
}
