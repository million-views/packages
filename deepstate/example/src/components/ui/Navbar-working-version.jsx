import { useState } from "preact/hooks";
import { Disclosure } from "./Disclosure";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/preact/24/outline";

export function Navbar({ logo, navigation = [], onNavigationClick }) {
  return (
    <Disclosure as="nav" className="bg-white shadow-xs" defaultOpen={false}>
      {({ isOpen, toggle, close }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                {/* Logo */}
                <div className="flex shrink-0 items-center">
                  <img
                    className="block h-8 w-auto lg:hidden"
                    src={logo}
                    alt="Your Company"
                  />
                  <img
                    className="hidden h-8 w-auto lg:block"
                    src={logo}
                    alt="Your Company"
                  />
                </div>

                {/* Desktop Navigation */}
                <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigationClick && onNavigationClick(item.name);
                      }}
                      className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                        item.current
                          ? "border-indigo-500 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="-mr-2 flex items-center sm:hidden">
                <button
                  type="button"
                  className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden"
                  onClick={toggle}
                  aria-controls="mobile-menu"
                  aria-expanded={isOpen}
                >
                  <span className="absolute -inset-0.5"></span>
                  <span className="sr-only">Open main menu</span>

                  {/* Menu open: "hidden", Menu closed: "block" */}
                  <svg
                    className={`${isOpen ? "hidden" : "block"} size-6`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>

                  {/* Menu open: "block", Menu closed: "hidden" */}
                  <svg
                    className={`${isOpen ? "block" : "hidden"} size-6`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu - only rendered when isOpen is true */}
          {isOpen && (
            <div className="sm:hidden" id="mobile-menu">
              <div className="space-y-1 pt-2 pb-3">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigationClick && onNavigationClick(item.name);
                      close(); // Close mobile menu after selection
                    }}
                    className={`block border-l-4 py-2 pr-4 pl-3 text-base font-medium ${
                      item.current
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Disclosure>
  );
}
