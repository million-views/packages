import { Bars3Icon, XMarkIcon } from "@heroicons/preact/24/outline";
import { Disclosure } from "./Disclosure";
import { useNavigation } from "./providers/navigation";

export function Navbar({ logo }) {
  // Access navigation state from context
  const { navigationItems, isItemActive, setActivePage } = useNavigation();

  return (
    <Disclosure as="nav" className="bg-white shadow-xs">
      {({ isOpen, close }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                {/* Logo */}
                <NavbarBrand logo={logo} />

                {/* Desktop Navigation */}
                <DesktopNavigation
                  items={navigationItems}
                  isItemActive={isItemActive}
                  setActivePage={setActivePage}
                />
              </div>

              {/* Mobile menu button */}
              <MobileMenuButton isOpen={isOpen} />
            </div>
          </div>

          {/* Mobile menu */}
          <MobileNavigation
            items={navigationItems}
            isItemActive={isItemActive}
            setActivePage={setActivePage}
            close={close}
          />
        </>
      )}
    </Disclosure>
  );
}

function NavbarBrand({ logo }) {
  return (
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
  );
}

function MobileMenuButton() {
  return (
    <div className="-mr-2 flex items-center sm:hidden">
      <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
        <span className="absolute -inset-0.5"></span>
        <span className="sr-only">Open main menu</span>

        {/* Using Heroicons with group-data-open variant */}
        <Bars3Icon
          className="block size-6 group-data-open:hidden"
          aria-hidden="true"
        />
        <XMarkIcon
          className="hidden size-6 group-data-open:block"
          aria-hidden="true"
        />
      </Disclosure.Button>
    </div>
  );
}

function DesktopNavigation({ items, isItemActive, setActivePage }) {
  return (
    <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
      {items.map((item) => (
        <a
          key={item.name}
          href={item.href}
          onClick={(e) => {
            e.preventDefault();
            setActivePage(item.name);
          }}
          className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
            isItemActive(item.name)
              ? "border-indigo-500 text-gray-900"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
          }`}
          aria-current={isItemActive(item.name) ? "page" : undefined}
        >
          {item.name}
        </a>
      ))}
    </div>
  );
}

function MobileNavigation({ items, isItemActive, setActivePage, close }) {
  return (
    <Disclosure.Panel className="sm:hidden" id="mobile-menu">
      <div className="space-y-1 pt-2 pb-3">
        {items.map((item) => (
          <a
            key={item.name}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              setActivePage(item.name);
              close(); // Close mobile menu after selection
            }}
            className={`block border-l-4 py-2 pr-4 pl-3 text-base font-medium ${
              isItemActive(item.name)
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
            }`}
            aria-current={isItemActive(item.name) ? "page" : undefined}
          >
            {item.name}
          </a>
        ))}
      </div>
    </Disclosure.Panel>
  );
}
