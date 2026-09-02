import {
  ClipboardList,
  LayoutDashboard,
  Settings,
  Store,
  Tv,
  Users,
} from "lucide-react";

export const menuItems = [
  { name: "ダッシュボード", icon: LayoutDashboard, href: "/", available: true },
  { name: "店舗別実績", icon: Store, href: "/stores", available: true },
  { name: "担当者別実績", icon: Users, href: "/staff", available: true },
  { name: "案件・報酬管理", icon: ClipboardList, href: null, available: false },
  { name: "STB管理", icon: Tv, href: null, available: false },
  { name: "マスタ・設定", icon: Settings, href: null, available: false },
];
