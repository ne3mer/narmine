import { LuxuryHero } from "@/components/sections/LuxuryHero";
import { FeaturedCollections } from "@/components/sections/FeaturedCollections";
import { NewArrivalsSection } from "@/components/sections/NewArrivalsSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CreativeBanner } from "@/components/sections/CreativeBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { categories as defaultCategories } from "@/data/home";
import { API_BASE_URL } from "@/lib/api";
import { defaultHomeContent, type HomeContent } from "@/data/homeContent";
import { ShippingExperience } from "@/components/sections/ShippingExperience";
import { DynamicBannersSection } from "@/components/sections/DynamicBannersSection";

type CategoryHighlight = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  productCount?: number;
  showOnHome?: boolean;
};

type HomepageSettingsResponse = {
  sections: any[];
  content?: HomeContent;
};

const fetchCategories = async (): Promise<CategoryHighlight[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories?active=true`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error("Failed to load categories");
    const payload = await response.json();
    const data = Array.isArray(payload?.data) ? payload.data : [];
    return data.map((category: any) => ({
      id: category.id ?? category._id ?? category.slug,
      name: category.name ?? category.title ?? category.nameEn ?? "دسته‌بندی",
      slug: category.slug ?? "",
      description: category.description ?? "",
      icon: category.icon ?? "🛏️",
      color: category.color ?? "pink",
    }));
  } catch (error) {
    console.warn("Categories unavailable:", error);
    return defaultCategories;
  }
};

const fetchHomepageSettings = async (): Promise<HomepageSettingsResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/homepage-settings`, {
      next: { revalidate: 300 }
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.data ?? null;
  } catch (error) {
    console.warn('Homepage settings unavailable:', error);
    return null;
  }
};

export default async function HomePage() {
  const categories = await fetchCategories();
  const categoriesDisplay = categories.length > 0 ? categories : defaultCategories;
  const homepageSettings = await fetchHomepageSettings();
  const homeContent = homepageSettings?.content ?? defaultHomeContent;

  return (
    <>
      <main className="min-h-screen">
        {/* Luxury Hero Section */}
        <LuxuryHero content={homeContent.hero} slides={homeContent.heroSlides ?? defaultHomeContent.heroSlides} />

        {/* Dynamic Banners (Admin Managed) */}
        <DynamicBannersSection />

        {/* Featured Collections */}
        <FeaturedCollections />

        {/* New Arrivals */}
        <section className="w-full bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <NewArrivalsSection />
          </div>
        </section>

        {/* Categories Section */}
        <section className="w-full bg-gradient-to-b from-[#f8f5f2] to-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <CategoriesSection categories={categoriesDisplay} />
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="w-full bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <p className="mb-3 text-sm font-medium tracking-widest text-[#8b6f47] uppercase">چرا نرمینه خواب؟</p>
              <h2 className="font-serif text-4xl font-bold text-[#4a3f3a] md:text-5xl" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                تجربه‌ای متفاوت از خرید
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center p-8 rounded-2xl bg-[#f8f5f2]/50 transition-all hover:bg-[#f8f5f2] hover:shadow-lg">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                  <span className="text-3xl">🚚</span>
                </div>
                <h3 className="mb-3 font-serif text-xl font-bold text-[#4a3f3a]">ارسال رایگان</h3>
                <p className="text-sm text-[#4a3f3a]/70 leading-relaxed">
                  ارسال رایگان به سراسر کشور برای سفارش‌های بالای ۵۰۰ هزار تومان
                </p>
              </div>

              <div className="text-center p-8 rounded-2xl bg-[#f8f5f2]/50 transition-all hover:bg-[#f8f5f2] hover:shadow-lg">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                  <span className="text-3xl">✨</span>
                </div>
                <h3 className="mb-3 font-serif text-xl font-bold text-[#4a3f3a]">کیفیت برتر</h3>
                <p className="text-sm text-[#4a3f3a]/70 leading-relaxed">
                  تمامی محصولات با بهترین مواد اولیه و استانداردهای جهانی تولید می‌شوند
                </p>
              </div>

              <div className="text-center p-8 rounded-2xl bg-[#f8f5f2]/50 transition-all hover:bg-[#f8f5f2] hover:shadow-lg">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                  <span className="text-3xl">🛡️</span>
                </div>
                <h3 className="mb-3 font-serif text-xl font-bold text-[#4a3f3a]">گارانتی اصالت</h3>
                <p className="text-sm text-[#4a3f3a]/70 leading-relaxed">
                  ضمانت اصالت و کیفیت کالا با امکان بازگشت ۷ روزه
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Creative Banner */}
        <section className="w-full bg-gradient-to-b from-white to-[#f8f5f2] py-20">
          <div className="mx-auto max-w-7xl px-6">
            <CreativeBanner content={homeContent.creativeBanner} />
          </div>
        </section>

        {/* Shipping Experience */}
        <section className="w-full bg-[#f8f5f2] py-20">
          <div className="mx-auto max-w-7xl px-6">
            <ShippingExperience methods={homeContent.shippingMethods} />
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <TestimonialsSection testimonials={homeContent.testimonials} />
          </div>
        </section>

        {/* Newsletter */}
        <section className="w-full bg-[#4a3f3a] py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold text-white md:text-4xl" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              از جدیدترین محصولات باخبر شوید
            </h2>
            <p className="mb-8 text-white/80">
              با عضویت در خبرنامه، از تخفیف‌ها و محصولات جدید مطلع شوید
            </p>
            <form className="mx-auto flex max-w-md gap-3">
              <input
                type="email"
                placeholder="ایمیل شما"
                className="flex-1 rounded-full border-2 border-white/20 bg-white/10 px-6 py-3 text-white placeholder:text-white/50 focus:border-white/40 focus:outline-none backdrop-blur-sm"
              />
              <button
                type="submit"
                className="rounded-full bg-white px-8 py-3 font-semibold text-[#4a3f3a] transition-all hover:bg-[#f8f5f2]"
              >
                عضویت
              </button>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
