import React, { useState } from "react";
import {
  Actions,
  Brand,
  Content,
  createIconRenderer,
  Drawer,
  Header,
  Navigator,
  Tabs,
  useNavigator,
} from "../next";
import { Icons } from "../next/icons";

// Create the icon renderer with our icons registry
const renderIcon = createIconRenderer(Icons);

// Router implementation
const router = {
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
  useLocation: () => ({ pathname: "/section/us" }),
  matchPath: (pattern, pathname) => pathname === pattern ? { pathname } : null,
};

// Google logo component
const GoogleLogo = () => (
  <div className="google-logo">
    <span className="google-logo-g">G</span>
    <span className="google-logo-o1">o</span>
    <span className="google-logo-o2">o</span>
    <span className="google-logo-g2">g</span>
    <span className="google-logo-l">l</span>
    <span className="google-logo-e">e</span>
  </div>
);

// Navigation data
const navigationData = [
  {
    id: "main",
    items: [
      { id: "home", label: "Home", path: "/", icon: "Home" },
      { id: "foryou", label: "For you", path: "/foryou", icon: "Star" },
      { id: "following", label: "Following", path: "/following", icon: "Bell" },
      {
        id: "showcase",
        label: "News Showcase",
        path: "/showcase",
        icon: "Layout",
      },
    ],
  },
  {
    id: "categories",
    separator: true,
    items: [
      { id: "us", label: "U.S.", path: "/section/us", icon: "Flag" },
      { id: "world", label: "World", path: "/section/world", icon: "Globe" },
      { id: "local", label: "Local", path: "/section/local", icon: "MapPin" },
      {
        id: "business",
        label: "Business",
        path: "/section/business",
        icon: "Briefcase",
      },
      {
        id: "technology",
        label: "Technology",
        path: "/section/technology",
        icon: "Cpu",
      },
      {
        id: "entertainment",
        label: "Entertainment",
        path: "/section/entertainment",
        icon: "Film",
      },
      {
        id: "sports",
        label: "Sports",
        path: "/section/sports",
        icon: "Activity",
      },
      {
        id: "science",
        label: "Science",
        path: "/section/science",
        icon: "Microscope",
      },
      { id: "health", label: "Health", path: "/section/health", icon: "Heart" },
    ],
  },
];

// Actions data
const actionsData = [
  {
    id: "search",
    icon: "Search",
    label: "Search",
    type: "icon",
    position: "right",
    onClick: () => console.log("Search clicked"),
  },
  {
    id: "help",
    icon: "HelpCircle",
    label: "Help",
    type: "icon",
    position: "right",
    onClick: () => console.log("Help clicked"),
  },
  {
    id: "settings",
    icon: "Settings",
    label: "Settings",
    type: "icon",
    position: "right",
    onClick: () => console.log("Settings clicked"),
  },
  {
    id: "apps",
    icon: "Grid",
    label: "Google Apps",
    type: "icon",
    position: "right",
    onClick: () => console.log("Google Apps clicked"),
  },
  {
    id: "signin",
    label: "Sign in",
    type: "button",
    variant: "primary",
    position: "right",
    onClick: () => console.log("Sign in clicked"),
  },
];

// Search bar component
const SearchBar = () => {
  const { responsive } = useNavigator();

  // In mobile view, use a simplified search icon instead of full bar
  if (responsive.isMobile) {
    return null;
  }

  return (
    <div className="google-search-container">
      <div className="google-search-bar">
        <span className="search-icon">{renderIcon("Search", 20)}</span>
        <input
          type="text"
          placeholder="Search for topics, locations & sources"
          className="google-search-input"
        />
        <span className="search-dropdown-toggle">
          {renderIcon("ChevronDown", 20)}
        </span>
      </div>
    </div>
  );
};

// Custom NavigationTabs for responsive behavior
const NavigationTabs = () => {
  const { responsive } = useNavigator();

  if (responsive.isMobile) {
    // Mobile view only shows category tabs (for you, headlines, etc)
    return <Tabs sectionId="categories" />;
  }

  // Desktop view shows both rows of tabs
  return (
    <>
      <Tabs sectionId="main" />
      <Tabs sectionId="categories" />
    </>
  );
};

// Sign in promotion for mobile
const SignInPromotion = () => {
  const { responsive } = useNavigator();

  if (!responsive.isMobile) {
    return null;
  }

  return (
    <div className="signin-promotion">
      <h2 className="signin-title">Unlock the news you care about</h2>
      <p className="signin-text">
        Tailor Google News to your interests and habits so you can quickly catch
        up on the news
      </p>
      <div className="signin-actions">
        <button className="signin-button">Sign in</button>
        <a href="#" className="learn-more">Learn more</a>
      </div>
    </div>
  );
};

// Section header component
const SectionHeader = () => {
  const { responsive } = useNavigator();

  return (
    <div className={`section-header ${responsive.isMobile ? "mobile" : ""}`}>
      <div className="section-image-container">
        <div className="section-image">U.S.</div>
      </div>
      {!responsive.isMobile && <h1 className="section-title">U.S.</h1>}
      <div className="section-actions">
        <button className="follow-button">
          <span className="star-icon">{renderIcon("Star", 20)}</span>
          <span className="follow-text">Follow</span>
        </button>
        <button className="share-button">
          {renderIcon("Share", 20)}
        </button>
      </div>
    </div>
  );
};

// Top stories section
const TopStories = () => {
  return (
    <div className="top-stories">
      <h2 className="top-stories-heading">
        Top stories <span className="heading-arrow">›</span>
      </h2>

      {/* We'd add news stories here */}
    </div>
  );
};

// News content component
const NewsContent = () => {
  const { responsive } = useNavigator();

  // Sample news articles
  const articles = [
    {
      title:
        "Live updates: Sean 'Diddy' Combs trial, Cassie Ventura testimony continues",
      source: "CNN",
      time: "47 minutes ago",
      authors: "By Nicki Brown, Kara Scannell & Lauren del Valle",
    },
    {
      title:
        "The 6 biggest bombshells so far from the Diddy trial — from Cassie Ventura and Kid Cudi to 'freak offs'",
      source: "Business Insider",
      time: "9 hours ago",
      authors: "By Laura Italiano, Natalie Musumeci",
    },
    {
      title:
        "Sean 'Diddy' Combs trial live updates: Cassie Ventura responds to 'freak off' text",
      source: "Yahoo",
      time: "1 hour ago",
      authors: "By Dylan Stableford",
    },
  ];

  return (
    <div className="news-content">
      {/* Sign-in promotion (mobile only) */}
      <SignInPromotion />

      {/* Section header */}
      <SectionHeader />

      {/* Top stories section */}
      <TopStories />

      {/* News articles */}
      <div className="news-articles">
        {articles.map((article, index) => (
          <div key={index} className="news-article">
            {index === 0 && <div className="featured-image">Court sketch</div>}
            <div className="article-source">{article.source}</div>
            <h3 className="article-title">{article.title}</h3>
            <div className="article-meta">
              <span className="article-time">{article.time}</span>
              <span className="article-authors">{article.authors}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GoogleNewsExample = () => {
  return (
    <Navigator
      brand={{
        logo: <GoogleLogo />,
        title: "News",
        url: "/",
      }}
      navigation={navigationData}
      router={router}
      renderIcon={renderIcon}
      actions={actionsData}
      responsive={{
        // Mobile view (< 768px)
        mobile: {
          breakpoint: 767,
          primaryNav: "drawer", // Primary nav in drawer (hamburger menu)
          categoryNav: "tabs", // Category nav as tabs
          brand: {
            truncateTitle: true,
          },
          actions: {
            visible: ["search", "apps", "signin"],
          },
        },
        // Tablet/Desktop view (> 768px)
        desktop: {
          primaryNav: "tabs",
          categoryNav: "tabs",
        },
      }}
      theme="google-news"
    >
      <style>
        {`
        /* Base styles */
        :root {
          --google-blue: #4285F4;
          --google-red: #EA4335;
          --google-yellow: #FBBC05;
          --google-green: #34A853;
          --google-gray: #5F6368;
          --google-light-gray: #DADCE0;
          --google-light-blue: #EBF1FE;
          --google-active-blue: #1A73E8;
        }
        
        body {
          margin: 0;
          font-family: "Google Sans", Roboto, Arial, sans-serif;
          color: #202124;
        }
        
        /* Google Logo */
        .google-logo {
          display: flex;
          align-items: center;
          font-size: 22px;
          font-weight: bold;
        }
        
        .google-logo-g { color: var(--google-blue); }
        .google-logo-o1 { color: var(--google-red); }
        .google-logo-o2 { color: var(--google-yellow); }
        .google-logo-g2 { color: var(--google-blue); }
        .google-logo-l { color: var(--google-green); }
        .google-logo-e { color: var(--google-red); }
        
        /* Search bar */
        .google-search-container {
          flex: 1;
          max-width: 720px;
          margin: 0 16px;
        }
        
        .google-search-bar {
          display: flex;
          align-items: center;
          background-color: #f1f3f4;
          border-radius: 4px;
          padding: 8px 12px;
          height: 46px;
        }
        
        .search-icon {
          color: var(--google-gray);
          margin-right: 8px;
        }
        
        .google-search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 16px;
          color: var(--google-gray);
          outline: none;
        }
        
        .search-dropdown-toggle {
          color: var(--google-gray);
          margin-left: 8px;
        }
        
        /* Navigation tabs */
        .nav-primary,
        .nav-secondary {
          height: 48px;
          border-bottom: 1px solid var(--google-light-gray);
          overflow-x: auto;
          scrollbar-width: none;
        }
        
        .nav-primary::-webkit-scrollbar,
        .nav-secondary::-webkit-scrollbar {
          display: none;
        }
        
        .nav-primary-inner,
        .nav-secondary-inner {
          height: 100%;
          display: flex;
          white-space: nowrap;
        }
        
        .nav-item {
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 16px;
          color: var(--google-gray);
          font-weight: 500;
          font-size: 14px;
          text-decoration: none;
        }
        
        .nav-item-active {
          color: var(--google-active-blue);
        }
        
        .nav-item-active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: var(--google-active-blue);
        }
        
        /* Mobile-specific styles */
        @media (max-width: 767px) {
          .nav-item {
            padding: 0 12px;
          }
          
          .nav-item-active {
            background-color: var(--google-light-blue);
            border-radius: 24px;
          }
          
          .nav-item-active::after {
            display: none;
          }
        }
        
        /* Section header */
        .section-header {
          display: flex;
          align-items: center;
          padding: 24px 0;
          border-bottom: 1px solid var(--google-light-gray);
        }
        
        .section-header.mobile {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        
        .section-image-container {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          overflow: hidden;
          background-image: linear-gradient(to bottom, #FFB74D, #F57C00);
          margin-right: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 500;
        }
        
        .section-title {
          font-size: 28px;
          font-weight: 400;
          margin: 0;
          flex: 1;
        }
        
        .section-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .section-header.mobile .section-actions {
          margin-top: 16px;
        }
        
        .follow-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 24px;
          border: 1px solid var(--google-light-gray);
          background: none;
          cursor: pointer;
        }
        
        .follow-text {
          font-size: 14px;
          font-weight: 500;
        }
        
        .share-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: none;
          cursor: pointer;
        }
        
        /* Sign-in promotion */
        .signin-promotion {
          background-color: #f1f5f9;
          border-radius: 8px;
          padding: 24px;
          margin: 24px 0;
          text-align: center;
        }
        
        .signin-title {
          font-size: 20px;
          font-weight: 400;
          margin: 0 0 12px;
        }
        
        .signin-text {
          color: var(--google-gray);
          margin: 0 0 20px;
          font-size: 16px;
        }
        
        .signin-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
        }
        
        .signin-button {
          background-color: var(--google-active-blue);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 24px;
          font-weight: 500;
          cursor: pointer;
        }
        
        .learn-more {
          color: var(--google-active-blue);
          text-decoration: none;
          font-weight: 500;
        }
        
        /* Top stories */
        .top-stories {
          margin: 24px 0;
        }
        
        .top-stories-heading {
          color: var(--google-active-blue);
          font-size: 20px;
          font-weight: 400;
          display: flex;
          align-items: center;
        }
        
        .heading-arrow {
          font-size: 24px;
          margin-left: 4px;
        }
        
        /* News articles */
        .news-articles {
          margin-top: 24px;
        }
        
        .news-article {
          padding-bottom: 16px;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--google-light-gray);
        }
        
        .featured-image {
          height: 200px;
          background-color: #f1f3f4;
          border-radius: 8px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--google-gray);
        }
        
        .article-source {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        
        .article-title {
          font-size: 18px;
          font-weight: 400;
          margin: 8px 0;
          line-height: 1.4;
        }
        
        .article-meta {
          font-size: 13px;
          color: var(--google-gray);
        }
        
        .article-time {
          margin-right: 8px;
        }
        
        /* News layout */
        .news-layout {
          display: flex;
        }
        
        .news-content {
          padding: 0 24px;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        /* Sign in button */
        .nav-action-signin {
          background-color: var(--google-active-blue);
          color: white;
          border-radius: 4px;
          padding: 0 24px;
          height: 36px;
          font-weight: 500;
          font-size: 14px;
          border: none;
          cursor: pointer;
        }
        `}
      </style>

      {/* Header with brand and actions */}
      <Header>
        <Brand logo={<GoogleLogo />} title="News" />
        <SearchBar />
        <Actions actions={actionsData} />
      </Header>

      {/* Tabs - will render differently based on viewport */}
      <NavigationTabs />

      {/* Layout with drawer and content */}
      <div className="news-layout">
        {/* Mobile drawer that appears when hamburger is clicked */}
        <Drawer mode="temporary" />

        {/* Main content */}
        <Content>
          <NewsContent />
        </Content>
      </div>
    </Navigator>
  );
};

export default GoogleNewsExample;
