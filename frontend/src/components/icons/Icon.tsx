'use client';

import {
  LayoutDashboard,
  Gamepad2,
  ShoppingCart,
  Users,
  Home,
  Megaphone,
  Plus,
  TrendingUp,
  Package,
  CheckCircle2,
  Clock,
  Gem,
  DollarSign,
  Shield,
  Zap,
  MessageSquare,
  Star,
  Sparkles,
  Rocket,
  RefreshCw,
  Link2,
  Palette,
  Bell,
  Mail,
  Send,
  ArrowRight,
  Settings,
  BarChart3,
  FileText,
  CreditCard,
  User,
  Calendar,
  X,
  Menu,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Search,
  Filter,
  Download,
  Upload,
  Save,
  Lock,
  Unlock,
  Gift,
  Award,
  Heart,
  ThumbsUp,
  TrendingDown,
  Activity,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  Layers,
  Globe,
  Info,
  Truck,
  Cpu,
  ShoppingBag,
  Image as ImageIcon,
  Hash,
  LogOut,
  MapPin,
  Minus
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

export type IconName =
  | 'dashboard'
  | 'game'
  | 'cart'
  | 'users'
  | 'home'
  | 'image'
  | 'megaphone'
  | 'plus'
  | 'trending'
  | 'package'
  | 'check'
  | 'clock'
  | 'gem'
  | 'dollar'
  | 'shield'
  | 'zap'
  | 'message'
  | 'star'
  | 'sparkles'
  | 'rocket'
  | 'refresh'
  | 'link'
  | 'palette'
  | 'bell'
  | 'mail'
  | 'send'
  | 'arrow-right'
  | 'settings'
  | 'chart'
  | 'file'
  | 'credit-card'
  | 'user'
  | 'calendar'
  | 'x'
  | 'menu'
  | 'chevron-right'
  | 'chevron-left'
  | 'alert'
  | 'trash'
  | 'edit'
  | 'eye'
  | 'eye-off'
  | 'search'
  | 'filter'
  | 'download'
  | 'upload'
  | 'save'
  | 'lock'
  | 'unlock'
  | 'gift'
  | 'award'
  | 'heart'
  | 'thumbs-up'
  | 'trending-down'
  | 'activity'
  | 'chevron-up'
  | 'chevron-down'
  | 'arrow-left'
  | 'layers'
  | 'globe'
  | 'info'
  | 'truck'
  | 'cpu'
  | 'shopping-bag'
  | 'hash'
  | 'log-out'
  | 'map-pin'
  | 'minus';

const iconMap: Record<IconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  game: Gamepad2,
  cart: ShoppingCart,
  users: Users,
  home: Home,
  image: ImageIcon,
  megaphone: Megaphone,
  plus: Plus,
  trending: TrendingUp,
  package: Package,
  check: CheckCircle2,
  clock: Clock,
  gem: Gem,
  dollar: DollarSign,
  shield: Shield,
  zap: Zap,
  message: MessageSquare,
  star: Star,
  sparkles: Sparkles,
  rocket: Rocket,
  refresh: RefreshCw,
  link: Link2,
  palette: Palette,
  bell: Bell,
  mail: Mail,
  send: Send,
  'arrow-right': ArrowRight,
  settings: Settings,
  chart: BarChart3,
  file: FileText,
  'credit-card': CreditCard,
  user: User,
  calendar: Calendar,
  x: X,
  menu: Menu,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  alert: AlertCircle,
  trash: Trash2,
  edit: Edit,
  eye: Eye,
  'eye-off': EyeOff,
  search: Search,
  filter: Filter,
  download: Download,
  upload: Upload,
  save: Save,
  lock: Lock,
  unlock: Unlock,
  gift: Gift,
  award: Award,
  heart: Heart,
  'thumbs-up': ThumbsUp,
  'trending-down': TrendingDown,
  activity: Activity,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'arrow-left': ArrowLeft,
  layers: Layers,
  globe: Globe,
  info: Info,
  truck: Truck,
  cpu: Cpu,
  'shopping-bag': ShoppingBag,
  hash: Hash,
  'log-out': LogOut,
  'map-pin': MapPin,
  minus: Minus
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, className = '', strokeWidth = 2 }: IconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  
  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
}

