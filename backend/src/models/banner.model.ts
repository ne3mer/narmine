import { Schema, model, type Document } from 'mongoose';

export type BannerType = 'hero' | 'promotional' | 'announcement' | 'cta' | 'testimonial' | 'custom';
export type BannerLayout = 'centered' | 'split' | 'overlay' | 'card' | 'full-width' | 'floating';
export type AnimationType = 'fade' | 'slide' | 'zoom' | 'bounce' | 'pulse' | 'none';
export type GradientDirection = 'to-r' | 'to-l' | 'to-b' | 'to-t' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl';

export interface BannerElement {
  type: 'text' | 'image' | 'icon' | 'button' | 'badge' | 'stats' | 'video';
  content: string;
  style?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    width?: string;
    height?: string;
    position?: 'absolute' | 'relative' | 'fixed';
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    zIndex?: number;
    opacity?: number;
    transform?: string;
    animation?: AnimationType;
    animationDuration?: string;
    animationDelay?: string;
  };
  imageUrl?: string;
  iconName?: string;
  href?: string;
  target?: '_blank' | '_self';
  order?: number;
}

export interface BannerDocument extends Document {
  name: string;
  type: BannerType;
  layout: BannerLayout;
  active: boolean;
  priority: number; // Higher priority shows first
  displayOn: string[]; // Pages where banner should show: ['home', 'games', 'account', 'all']
  
  // Visual Design
  background: {
    type: 'gradient' | 'solid' | 'image' | 'video';
    color?: string;
    gradientColors?: string[]; // Array of hex colors
    gradientDirection?: GradientDirection;
    imageUrl?: string;
    videoUrl?: string;
    overlay?: boolean;
    overlayColor?: string;
    overlayOpacity?: number;
  };
  
  // Content Elements
  elements: BannerElement[];
  
  // Advanced Styling
  containerStyle?: {
    padding?: string;
    margin?: string;
    borderRadius?: string;
    maxWidth?: string;
    minHeight?: string;
    boxShadow?: string;
  };
  
  // Animations
  entranceAnimation?: AnimationType;
  exitAnimation?: AnimationType;
  hoverEffects?: {
    scale?: number;
    rotate?: number;
    glow?: boolean;
    shadow?: boolean;
  };
  
  // Responsive Settings
  mobileSettings?: {
    hideOnMobile?: boolean;
    mobileLayout?: BannerLayout;
    mobileElements?: BannerElement[];
  };
  
  // Display Rules
  displayRules?: {
    startDate?: Date;
    endDate?: Date;
    showToUsers?: ('all' | 'authenticated' | 'guest')[];
    showToRoles?: ('user' | 'admin')[];
    maxViews?: number;
    maxClicks?: number;
  };
  
  // Analytics
  views?: number;
  clicks?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const bannerElementSchema = new Schema({
  type: { type: String, enum: ['text', 'image', 'icon', 'button', 'badge', 'stats', 'video'], required: true },
  content: { type: String, default: '' },
  style: {
    fontSize: String,
    fontWeight: String,
    color: String,
    backgroundColor: String,
    padding: String,
    margin: String,
    borderRadius: String,
    width: String,
    height: String,
    position: String,
    top: String,
    left: String,
    right: String,
    bottom: String,
    zIndex: Number,
    opacity: Number,
    transform: String,
    animation: String,
    animationDuration: String,
    animationDelay: String
  },
  imageUrl: String,
  iconName: String,
  href: String,
  target: String,
  order: { type: Number, default: 0 }
}, { _id: false });

const bannerSchema = new Schema<BannerDocument>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['hero', 'promotional', 'announcement', 'cta', 'testimonial', 'custom'],
      required: true
    },
    layout: {
      type: String,
      enum: ['centered', 'split', 'overlay', 'card', 'full-width', 'floating'],
      required: true
    },
    active: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    displayOn: { type: [String], default: ['home'] },
    
    background: {
      type: {
        type: String,
        enum: ['gradient', 'solid', 'image', 'video'],
        required: true
      },
      color: String,
      gradientColors: [String],
      gradientDirection: String,
      imageUrl: String,
      videoUrl: String,
      overlay: Boolean,
      overlayColor: String,
      overlayOpacity: Number
    },
    
    elements: [bannerElementSchema],
    
    containerStyle: {
      padding: String,
      margin: String,
      borderRadius: String,
      maxWidth: String,
      minHeight: String,
      boxShadow: String
    },
    
    entranceAnimation: String,
    exitAnimation: String,
    hoverEffects: {
      scale: Number,
      rotate: Number,
      glow: Boolean,
      shadow: Boolean
    },
    
    mobileSettings: {
      hideOnMobile: Boolean,
      mobileLayout: String,
      mobileElements: [bannerElementSchema]
    },
    
    displayRules: {
      startDate: Date,
      endDate: Date,
      showToUsers: [String],
      showToRoles: [String],
      maxViews: Number,
      maxClicks: Number
    },
    
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  },
  { timestamps: true }
);

bannerSchema.index({ active: 1, priority: -1 });
bannerSchema.index({ displayOn: 1 });
bannerSchema.index({ 'displayRules.startDate': 1, 'displayRules.endDate': 1 });

export const BannerModel = model<BannerDocument>('Banner', bannerSchema);

