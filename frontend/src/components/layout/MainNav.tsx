'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CartIcon } from '@/components/cart/CartIcon';
import { clearAuthSession, API_BASE_URL } from '@/lib/api';
import { isAdmin, type StoredUser, getAuthToken } from '@/lib/auth';
import { Icon } from '@/components/icons/Icon';

const links = [
  { href: '/', label: 'خانه' },
  { href: '/products', label: 'محصولات' },
  { href: '/categories', label: 'دسته‌بندی‌ها', hasDropdown: true },
  { href: '/about', label: 'درباره ما' },
];

export const MainNav = () => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [showAdminLink, setShowAdminLink] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownCloseTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleDropdownEnter = () => {
    if (dropdownCloseTimeout.current) {
      clearTimeout(dropdownCloseTimeout.current);
      dropdownCloseTimeout.current = null;
    }
    setShowCategoriesDropdown(true);
  };

  const handleDropdownLeave = () => {
    if (dropdownCloseTimeout.current) {
      clearTimeout(dropdownCloseTimeout.current);
    }
    dropdownCloseTimeout.current = setTimeout(() => {
      setShowCategoriesDropdown(false);
    }, 150);
  };

  const syncUserFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('gc_token');
    const stored = localStorage.getItem('gc_user');

    if (token && stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        setShowAdminLink(isAdmin());
      } catch {
        setUser(null);
        setShowAdminLink(false);
      }
    } else {
      setUser(null);
      setShowAdminLink(false);
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories?active=true`);
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data?.data) ? data.data.slice(0, 6) : []);
      }
    } catch (err) {
      // Silent fail
    }
  };

  useEffect(() => {
    syncUserFromStorage();
    fetchCategories();

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleAuthChange = () => syncUserFromStorage();
    window.addEventListener('gc-auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('gc-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [syncUserFromStorage]);

  useEffect(() => {
    return () => {
      if (dropdownCloseTimeout.current) {
        clearTimeout(dropdownCloseTimeout.current);
      }
    };
  }, []);

  const accountLabel = useMemo(() => {
    if (!user) return 'ورود';
    const baseName = user.name ?? user.fullName ?? '';
    if (!baseName.trim()) return 'حساب من';
    const firstName = baseName.trim().split(' ')[0];
    return firstName;
  }, [user]);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    setMobileMenuOpen(false);
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'border-b border-[#c9a896]/20 bg-white/95 backdrop-blur-xl shadow-sm' 
          : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c9a896] to-[#4a3f3a] shadow-lg transition-transform group-hover:scale-105">
              <span className="text-xl text-white">ن</span>
            </div>
            <div className="hidden sm:block">
              <span className="block font-serif text-xl font-bold text-[#4a3f3a]" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                نرمینه خواب
              </span>
              <span className="block text-xs text-[#c9a896]">Narmineh Khab</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 md:flex">
            {links.map((link) => (
              link.hasDropdown ? (
                <div key={link.href} className="relative">
                  <button
                    type="button"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                    className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-[#4a3f3a] transition-all hover:bg-[#f8f5f2]"
                  >
                    <span>{link.label}</span>
                    <Icon name="chevron-down" size={14} className={`transition-transform ${showCategoriesDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showCategoriesDropdown && (
                    <div 
                      onMouseEnter={handleDropdownEnter}
                      onMouseLeave={handleDropdownLeave}
                      className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-[#c9a896]/20 bg-white p-3 shadow-xl"
                    >
                      {categories.map((cat) => (
                        <Link
                          key={cat._id || cat.id}
                          href={`/categories/${cat.slug}`}
                          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#4a3f3a] transition-all hover:bg-[#f8f5f2]"
                        >
                          <span className="text-xl">{cat.icon || '🛏️'}</span>
                          <span>{cat.name}</span>
                        </Link>
                      ))}
                      <Link
                        href="/categories"
                        className="mt-2 flex items-center justify-center gap-2 rounded-xl border-t border-[#c9a896]/20 px-4 py-3 text-xs font-semibold text-[#c9a896] transition-all hover:bg-[#f8f5f2]"
                      >
                        <span>مشاهده همه</span>
                        <Icon name="arrow-left" size={12} />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-5 py-2.5 text-sm font-medium text-[#4a3f3a] transition-all hover:bg-[#f8f5f2]"
                >
                  {link.label}
                </Link>
              )
            ))}
            {showAdminLink && (
              <Link
                href="/admin"
                className="rounded-full px-5 py-2.5 text-sm font-medium text-[#c9a896] transition-all hover:bg-[#f8f5f2]"
              >
                مدیریت
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <div className="hidden sm:block">
              <CartIcon />
            </div>

            {/* Account */}
            {user ? (
              <div 
                className="relative"
                onMouseEnter={() => {
                  if (dropdownCloseTimeout.current) clearTimeout(dropdownCloseTimeout.current);
                  setShowUserDropdown(true);
                }}
                onMouseLeave={() => {
                  dropdownCloseTimeout.current = setTimeout(() => setShowUserDropdown(false), 150);
                }}
              >
                <button className="flex items-center gap-2 rounded-full border border-[#c9a896]/20 bg-white px-4 py-2 text-sm font-medium text-[#4a3f3a] transition-all hover:border-[#c9a896]/40">
                  <Icon name="user" size={16} />
                  <span className="hidden sm:inline">{accountLabel}</span>
                </button>
                {showUserDropdown && (
                  <div className="absolute left-0 top-full mt-2 w-48 rounded-2xl border border-[#c9a896]/20 bg-white p-2 shadow-xl z-50">
                    <Link
                      href="/account"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#4a3f3a] transition-all hover:bg-[#f8f5f2]"
                    >
                      <Icon name="user" size={16} />
                      <span>حساب کاربری</span>
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#4a3f3a] transition-all hover:bg-[#f8f5f2]"
                    >
                      <Icon name="package" size={16} />
                      <span>سفارش‌ها</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
                    >
                      <Icon name="log-out" size={16} />
                      <span>خروج</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-[#4a3f3a] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#c9a896]"
              >
                ورود
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="md:hidden rounded-full p-2 text-[#4a3f3a] transition-all hover:bg-[#f8f5f2]"
            >
              <Icon name={mobileMenuOpen ? 'x' : 'menu'} size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[#c9a896]/20 bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-6 py-6 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-[#4a3f3a] transition-all hover:bg-[#f8f5f2]"
              >
                {link.label}
              </Link>
            ))}
            {showAdminLink && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-[#c9a896] transition-all hover:bg-[#f8f5f2]"
              >
                مدیریت
              </Link>
            )}
            <div className="pt-4 border-t border-[#c9a896]/20">
              <CartIcon />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
