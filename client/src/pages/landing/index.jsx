import React, { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import AppImage from '../../components/AppImage';
import GlobalHeader from '../../components/ui/GlobalHeader';
import { useLanguage } from '../../hooks/useLanguage.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useI18n } from '../../lib/i18n-context.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/CardComponents';
import { Badge } from '../../components/ui/Badge';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { UserMenu } from '../../components/auth/UserMenu';
import { MobileMenu } from '../../components/ui/MobileMenu';

const LandingPage = () => {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoadingFeatured(true);
        const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const root = base.replace(/\/api$/, '');
        const res = await fetch(`${root}/public/listings`);
        if (!res.ok) throw new Error('Failed to load featured');
        const data = await res.json();
        const list = Array.isArray(data?.listings) ? data.listings.slice(0, 4) : [];
        setFeatured(list);
      } catch (_) {
        setFeatured([]);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-sm">KG</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs sm:text-sm">KG</span>
              </div>
              <h1 className="font-bold text-lg sm:text-xl text-foreground">Ke Geberew</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              <a href="/market-trends-dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.trends')}
              </a>
              <LanguageSwitcher />
              {user ? (
                <UserMenu />
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/authentication-login-register">{t('nav.login')}</a>
                  </Button>
                  <Button size="sm" asChild>
                    <a href="/authentication-login-register">{t('nav.signup')}</a>
                  </Button>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            {user && (
              <div className="mb-4 sm:mb-6">
                <p className="text-base sm:text-lg text-primary font-medium px-4">
                  {t('farmer.dashboard.welcome')}, {user.name}!
                  {user.role === 'farmer' ? ' Ready to list your produce?' : ' Ready to find fresh produce?'}
                </p>
              </div>
            )}
            <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 sm:mb-6 px-4 leading-tight">
              {t('home.hero.title')}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-4 max-w-3xl mx-auto">
              {t('home.hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
              {user ? (
                user.role === 'farmer' ? (
                  <>
                    <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4" asChild>
                      <a href="/add-listing">{t('farmer.listings.create')}</a>
                    </Button>
                    <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-transparent" asChild>
                      <a href="/farmer-my-listings">{t('farmer.listings.title')}</a>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4" asChild>
                      <a href="/browse-listings-buyer-home">{t('home.hero.cta.marketplace')}</a>
                    </Button>
                    <Button variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-transparent" asChild>
                      <a href="/order-management">{t('buyer.orders.title')}</a>
                    </Button>
                  </>
                )
              ) : (
                <>
                  <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4" asChild>
                    <a href="/authentication-login-register?role=farmer">{t('home.hero.cta.farmer')}</a>
              </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-transparent"
                    asChild
                  >
                    <a href="/authentication-login-register?role=buyer">{t('home.hero.cta.marketplace')}</a>
              </Button>
                </>
              )}
          </div>

            {/* Search Bar */}
            <div className="max-w-sm sm:max-w-md mx-auto relative px-4">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                placeholder={t('marketplace.search')}
                className="w-full pl-10 pr-4 py-3 sm:py-4 text-base sm:text-lg border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            </div>
          </div>
        </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-card/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="font-bold text-2xl sm:text-3xl text-foreground mb-3 sm:mb-4 px-4">
              Why Choose Ke Geberew?
            </h3>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
              We eliminate intermediaries to ensure farmers get fair prices while buyers access the freshest produce
              directly from the source.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <CardTitle>Direct Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Connect directly with local farmers and buyers, building lasting relationships and trust in the
                  community.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <CardTitle>Fair Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Market-driven pricing ensures farmers receive fair compensation while buyers get competitive rates.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <CardTitle>Quality Assured</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Verified farmers and quality ratings ensure you receive the freshest, highest-quality produce.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
          </div>
        </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <h3 className="font-bold text-2xl sm:text-3xl text-foreground px-2">
              {t('home.featured.title')}
            </h3>
            <Button variant="outline" size="sm" className="self-start sm:self-auto" asChild>
              <a href="/browse-listings-buyer-home">{t('common.view')}</a>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {loadingFeatured ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="aspect-[4/3] bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : featured.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No listings available yet. Check back soon!
            </div>
          ) : (
              featured.map((product, index) => (
                <Card key={product.id || index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={product.image || "/assets/images/no_image.png"}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-lg mb-1">{product.name}</h4>
                    <p className="text-muted-foreground text-sm mb-2">{product.location || 'Ethiopia'}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary text-lg">ETB {Number(product.pricePerKg || 0)}/kg</span>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-sm font-medium">4.8</span>
                  </div>
            </div>
                  </CardContent>
                </Card>
              ))
            )}
              </div>
          </div>
        </section>

      {/* Language Support Banner */}
      <section className="py-8 sm:py-12 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
            </svg>
            <h3 className="font-bold text-xl sm:text-2xl text-foreground">Available in Multiple Languages</h3>
              </div>
          <p className="text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base px-4">
            Our platform supports both English and Amharic to ensure accessibility for all Ethiopian farmers and buyers.
          </p>
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <Badge variant="secondary" className="px-3 py-2 text-sm">
              English
            </Badge>
            <Badge variant="secondary" className="px-3 py-2 text-sm">
              አማርኛ (Amharic)
            </Badge>
          </div>
          </div>
        </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs sm:text-sm">KG</span>
                </div>
                <h4 className="font-bold text-base sm:text-lg">Ke Geberew</h4>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">
                Connecting Ethiopian farmers directly with buyers for a sustainable agricultural future.
              </p>
            </div>

            <div>
              <h5 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">For Farmers</h5>
              <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
                <li>
                  <a href="/add-listing" className="hover:text-foreground transition-colors">
                    Create Listings
                  </a>
                </li>
                <li>
                  <a href="/order-management" className="hover:text-foreground transition-colors">
                    Manage Orders
                  </a>
                </li>
                <li>
                  <a href="/farmer-market-trends" className="hover:text-foreground transition-colors">
                    Market Trends
                  </a>
                </li>
              </ul>
          </div>

            <div>
              <h5 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">For Buyers</h5>
              <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
                <li>
                  <a href="/browse-listings-buyer-home" className="hover:text-foreground transition-colors">
                    Browse Products
                  </a>
                </li>
                <li>
                  <a href="/order-management" className="hover:text-foreground transition-colors">
                    Place Orders
                  </a>
                </li>
                <li>
                  <a href="/favorites" className="hover:text-foreground transition-colors">
                    Favorite Farmers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h5>
              <ul className="space-y-2 text-muted-foreground text-sm sm:text-base">
                <li>
                  <a href="/help" className="hover:text-foreground transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-muted-foreground">
            <p className="text-xs sm:text-sm">&copy; 2024 Ke Geberew. Building a sustainable agricultural marketplace for Ethiopia.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </div>
  );
};

export default LandingPage;
