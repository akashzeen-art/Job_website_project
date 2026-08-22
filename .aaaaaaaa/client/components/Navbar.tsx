import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [queryParams, setQueryParams] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const msisdn = params.get('msisdn');
    const clickid = params.get('clickid');
    const id = params.get('id');
    
    if (msisdn || clickid || id) {
      const query = new URLSearchParams();
      if (msisdn) query.set('msisdn', msisdn);
      if (clickid) query.set('clickid', clickid);
      if (id) query.set('id', id);
      setQueryParams(`?${query.toString()}`);
    } else {
      setQueryParams("");
    }
  }, [location.search]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Contact Us", href: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-sm border-b border-sexy-cooking-beige/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={`/${queryParams}`} className="flex-shrink-0 flex items-center gap-2 group">
            <img src="/logo.png" alt="EYoga" className="w-32 h-20 object-contain" />
          </Link>

          {/* Burger Menu Button (All Screens) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white hover:text-white/80 transition-colors"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Menu Dropdown */}
        {isOpen && (
          <div className="pb-4 border-t border-sexy-cooking-beige/20 bg-black/40 backdrop-blur-sm animate-slide-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link, index) => (
                <Link
                  key={link.label}
                  to={`${link.href}${queryParams}`}
                  className="px-4 py-2 text-white hover:text-white/80 hover:bg-white/10 rounded-lg transition-all duration-300 text-lg font-medium group animate-slide-up"
                  onClick={() => setIsOpen(false)}
                  style={{ animationDelay: `${0.05 * (index + 1)}s` }}
                >
                  {link.label}
                  <span className="inline-block ml-1 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
