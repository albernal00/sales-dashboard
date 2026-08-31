import type { StorePerformance } from "@/types/dashboard";

export const stores: StorePerformance[] = [
  {
    id: "konan",
    name: "江南店",
    target: 6,
    actual: 4,
    previousActual: 1,
    staffId: "tsuchida",
  },
  {
    id: "nakaotai",
    name: "中小田井店",
    target: 5,
    actual: 3,
    previousActual: 1,
    staffId: "tsuchida",
  },
  {
    id: "meito-heiwagaoka",
    name: "名東平和が丘店",
    target: 10,
    actual: 6,
    previousActual: 2,
    staffId: "tsuchida",
  },
  {
    id: "aratama",
    name: "新瑞店",
    target: 5,
    actual: 1,
    previousActual: 1,
    staffId: "omori",
  },
  {
    id: "shinsakae",
    name: "新栄店",
    target: 15,
    actual: 13,
    previousActual: 4,
    staffId: "omori",
  },
];
