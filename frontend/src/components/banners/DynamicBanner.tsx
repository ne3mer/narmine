'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';

type BannerElement = {
  type: 'text' | 'image' | 'icon' | 'button' | 'badge' | 'stats' | 'video';
  content: string;
  style?: Record<string, any>;
  imageUrl?: string;
  iconName?: string;
  href?: string;
  target?: '_blank' | '_self';
  order?: number;
};

type Banner = {
  id: string;
  name: string;
  type: string;
  layout: string;
  background: {
    type: 'gradient' | 'solid' | 'image' | 'video';
    color?: string;
    gradientColors?: string[];
    gradientDirection?: string;
    imageUrl?: string;
    videoUrl?: string;
    overlay?: boolean;
    overlayColor?: string;
    overlayOpacity?: number;
  };
  elements: BannerElement[];
  containerStyle?: Record<string, string>;
  entranceAnimation?: string;
  hoverEffects?: Record<string, any>;
  mobileSettings?: {
    hideOnMobile?: boolean;
  };
};

type DynamicBannerProps = {
  page: string;
  className?: string;
};

export function DynamicBanner({ page, className = '' }: DynamicBannerProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch banners when page changes
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/banners/page/${page}`);
        if (response.ok) {
          const data = await response.json();
          setBanners(Array.isArray(data?.data) ? data.data : []);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [page]);

  // Track views when banners change
  useEffect(() => {
    if (banners.length > 0) {
      const trackView = async (bannerId: string) => {
        try {
          await fetch(`${API_BASE_URL}/api/banners/${bannerId}/view`, { method: 'POST' });
        } catch (err) {
          // Silent fail
        }
      };

      banners.forEach((banner) => {
        trackView(banner.id);
      });
    }
  }, [banners]);

  const trackClick = async (bannerId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/banners/${bannerId}/click`, { method: 'POST' });
    } catch (err) {
      // Silent fail
    }
  };

  const getBackgroundStyle = (background: Banner['background']) => {
    if (background.type === 'gradient' && background.gradientColors) {
      const direction = background.gradientDirection || 'to-r';
      return {
        background: `linear-gradient(${direction === 'to-r' ? 'to right' : direction === 'to-l' ? 'to left' : direction === 'to-b' ? 'to bottom' : direction === 'to-t' ? 'to top' : direction === 'to-br' ? 'to bottom right' : direction === 'to-bl' ? 'to bottom left' : direction === 'to-tr' ? 'to top right' : 'to top left'}, ${background.gradientColors.join(', ')})`
      };
    }
    if (background.type === 'solid' && background.color) {
      return { backgroundColor: background.color };
    }
    return {};
  };

  const getAnimationClass = (animation?: string) => {
    if (!animation || animation === 'none') return '';
    return `animate-${animation}`;
  };

  const renderElement = (element: BannerElement, bannerId: string) => {
    const baseStyle = {
      ...element.style,
      order: element.order
    };

    const ElementWrapper = element.href ? Link : 'div';
    const wrapperProps = element.href
      ? {
          href: element.href,
          target: element.target || '_self',
          onClick: () => trackClick(bannerId),
          className: 'block'
        }
      : {};

    switch (element.type) {
      case 'text':
        const textContent = (
          <div
            style={baseStyle}
            className={getAnimationClass(element.style?.animation)}
            dangerouslySetInnerHTML={{ __html: element.content }}
          />
        );
        return element.href ? (
          <Link href={element.href} target={element.target || '_self'} onClick={() => trackClick(bannerId)} className="block">
            {textContent}
          </Link>
        ) : (
          textContent
        );

      case 'image':
        const imageContent = (
          <div style={baseStyle} className="relative">
            {element.imageUrl && (
              <Image
                src={element.imageUrl}
                alt={element.content || 'Banner image'}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
        );
        return element.href ? (
          <Link href={element.href} target={element.target || '_self'} onClick={() => trackClick(bannerId)} className="block">
            {imageContent}
          </Link>
        ) : (
          imageContent
        );

      case 'icon':
        const iconContent = (
          <div style={baseStyle} className="flex items-center justify-center">
            <span className="text-4xl">{element.iconName || '🎮'}</span>
          </div>
        );
        return element.href ? (
          <Link href={element.href} target={element.target || '_self'} onClick={() => trackClick(bannerId)} className="block">
            {iconContent}
          </Link>
        ) : (
          iconContent
        );

      case 'button':
        const buttonContent = (
          <button
            style={baseStyle}
            className={`rounded-2xl px-6 py-3 font-bold transition ${getAnimationClass(element.style?.animation)}`}
          >
            {element.content}
          </button>
        );
        return element.href ? (
          <Link href={element.href} target={element.target || '_self'} onClick={() => trackClick(bannerId)} className="block">
            {buttonContent}
          </Link>
        ) : (
          buttonContent
        );

      case 'badge':
        const badgeContent = (
          <span
            style={baseStyle}
            className={`inline-block rounded-full px-4 py-1 text-xs font-semibold ${getAnimationClass(element.style?.animation)}`}
          >
            {element.content}
          </span>
        );
        return element.href ? (
          <Link href={element.href} target={element.target || '_self'} onClick={() => trackClick(bannerId)} className="block">
            {badgeContent}
          </Link>
        ) : (
          badgeContent
        );

      case 'video':
        const videoContent = (
          <div style={baseStyle} className="relative">
            {element.content && (
              <video
                src={element.content}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            )}
          </div>
        );
        return element.href ? (
          <Link href={element.href} target={element.target || '_self'} onClick={() => trackClick(bannerId)} className="block">
            {videoContent}
          </Link>
        ) : (
          videoContent
        );

      default:
        return null;
    }
  };

  const renderBanner = (banner: Banner) => {
    const bgStyle = getBackgroundStyle(banner.background);
    const containerStyle = {
      ...bgStyle,
      ...banner.containerStyle
    };

    const sortedElements = [...banner.elements].sort((a, b) => (a.order || 0) - (b.order || 0));

    if (banner.mobileSettings?.hideOnMobile) {
      return null; // Could add mobile detection here
    }

    const layoutClasses = {
      centered: 'flex flex-col items-center justify-center text-center',
      split: 'grid grid-cols-1 lg:grid-cols-2 gap-6 items-center',
      overlay: 'relative',
      card: 'rounded-3xl border border-slate-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]',
      'full-width': 'w-full',
      floating: 'rounded-3xl shadow-2xl'
    };

    const hoverClasses = banner.hoverEffects
      ? `transition-transform duration-300 hover:scale-${banner.hoverEffects.scale || 105} ${
          banner.hoverEffects.glow ? 'hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]' : ''
        }`
      : '';

    return (
      <div
        key={banner.id}
        className={`relative overflow-hidden ${layoutClasses[banner.layout as keyof typeof layoutClasses] || ''} ${hoverClasses} ${className}`}
        style={containerStyle}
      >
        {banner.background.type === 'image' && banner.background.imageUrl && (
          <div className="absolute inset-0">
            <Image
              src={banner.background.imageUrl}
              alt={banner.name}
              fill
              className="object-cover"
              priority
            />
            {banner.background.overlay && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: banner.background.overlayColor || 'rgba(0,0,0,0.5)',
                  opacity: banner.background.overlayOpacity || 0.5
                }}
              />
            )}
          </div>
        )}

        {banner.background.type === 'video' && banner.background.videoUrl && (
          <div className="absolute inset-0">
            <video
              src={banner.background.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            {banner.background.overlay && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: banner.background.overlayColor || 'rgba(0,0,0,0.5)',
                  opacity: banner.background.overlayOpacity || 0.5
                }}
              />
            )}
          </div>
        )}

        <div className={`relative z-10 w-full ${banner.layout === 'centered' ? 'p-8 md:p-12' : 'p-6 md:p-8'}`}>
          <div className="flex flex-wrap items-center gap-4" style={{ display: 'flex', flexWrap: 'wrap' }}>
            {sortedElements.map((element, index) => (
              <div key={`${banner.id}-element-${index}-${element.type}-${element.content || element.imageUrl || element.iconName || ''}`}>
                {renderElement(element, banner.id)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return null;
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {banners.map((banner) => renderBanner(banner))}
    </div>
  );
}
