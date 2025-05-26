// search.tsx
// NavigatorSearch
import React from "react";
import type { SearchProps } from "./types";

export const NavigatorSearch: React.FC<SearchProps> = ({
  onSearch,
  renderIcon,
  className = "",
}) => {
  if (!onSearch) {
    throw new Error("NavigatorSearch: onSearch function is required");
  }

  if (!renderIcon) {
    throw new Error("NavigatorSearch: renderIcon function is required");
  }

  return (
    <button
      onClick={onSearch}
      className={`nav-btn nav-btn-light dark:nav-btn-dark mr-2 ${className}`}
      aria-label="Search"
    >
      {renderIcon("Search")}
    </button>
  );
};

export default NavigatorSearch;
