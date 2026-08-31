import {
  ClipboardList,
  LayoutDashboard,
  Settings,
  Store,
  Tv,
  Users,
} from "lucide-react";

export const menuItems = [
  { name: "ダッシュボード", icon: LayoutDashboard, available: true },
  { name: "店舗別実績", icon: Store, available: false },
  { name: "担当者別実績", icon: Users, available: false },
  { name: "案件・報酬管理", icon: ClipboardList, available: false },
  { name: "STB管理", icon: Tv, available: false },
  { name: "マスタ・設定", icon: Settings, available: false },
];
