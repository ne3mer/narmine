import { Schema, model, type Document } from 'mongoose';

export interface HeroStat {
  id: string;
  label: string;
  value: string;
}

export interface HeroContent {
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
  stats: HeroStat[];
  image?: string;
}

export interface Spotlight {
  id: string;
  title: string;
  description: string;
  href: string;
  accent: string;
}

export interface TrustSignal {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Testimonial {
  id: string;
  name: string;
  handle: string;
  text: string;
  avatar: string;
  highlight?: boolean;
}

export interface HomeContentDocument extends Document {
  hero: HeroContent;
  heroSlides: HeroContent[];
  spotlights: Spotlight[];
  trustSignals: TrustSignal[];
  testimonials: Testimonial[];
  createdAt: Date;
  updatedAt: Date;
}

const ctaSchema = new Schema(
  {
    label: { type: String, required: true },
    href: { type: String, required: true }
  },
  { _id: false }
);

const heroStatSchema = new Schema<HeroStat>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String, required: true }
  },
  { _id: false }
);

const heroSchema = new Schema<HeroContent>(
  {
    badge: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    primaryCta: { type: ctaSchema, required: true },
    secondaryCta: { type: ctaSchema, required: true },
    stats: { type: [heroStatSchema], default: [] },
    image: { type: String }
  },
  { _id: false }
);

const spotlightSchema = new Schema<Spotlight>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    href: { type: String, required: true },
    accent: { type: String, required: true }
  },
  { _id: false }
);

const trustSchema = new Schema<TrustSignal>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }
  },
  { _id: false }
);

const testimonialSchema = new Schema<Testimonial>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    handle: { type: String, required: true },
    text: { type: String, required: true },
    avatar: { type: String, required: true },
    highlight: { type: Boolean, default: false }
  },
  { _id: false }
);

const homeContentSchema = new Schema<HomeContentDocument>(
  {
    hero: { type: heroSchema, required: true },
    heroSlides: { type: [heroSchema], default: [] },
    spotlights: { type: [spotlightSchema], default: [] },
    trustSignals: { type: [trustSchema], default: [] },
    testimonials: { type: [testimonialSchema], default: [] }
  },
  { timestamps: true }
);

homeContentSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { _id, __v, ...rest } = ret;
    return { id: _id, ...rest };
  }
});

export const HomeContentModel = model<HomeContentDocument>('HomeContent', homeContentSchema);
