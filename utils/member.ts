export type MemberLevel = {
  name: string;
  icon: string;
  threshold: number;
  bgColor: string;
  gradient: string;
};

export const MEMBER_LEVELS: MemberLevel[] = [
  { name: "注册会员", icon: "🌱", threshold: 0, bgColor: "bg-gray-100 text-gray-600", gradient: "#9ca3af" },
  { name: "银卡会员", icon: "🥈", threshold: 5000, bgColor: "bg-gray-200 text-gray-700", gradient: "linear-gradient(90deg, #9ca3af, #d1d5db)" },
  { name: "金卡会员", icon: "🥇", threshold: 10000, bgColor: "bg-yellow-100 text-yellow-700", gradient: "linear-gradient(90deg, #eab308, #facc15)" },
  { name: "铂金会员", icon: "💎", threshold: 50000, bgColor: "bg-blue-100 text-blue-700", gradient: "linear-gradient(90deg, #3b82f6, #60a5fa)" },
  { name: "钻石会员", icon: "💠", threshold: 100000, bgColor: "bg-purple-100 text-purple-700", gradient: "linear-gradient(90deg, #a855f7, #c084fc)" },
];

export const getMemberLevel = (spend: number): MemberLevel => {
  for (let i = MEMBER_LEVELS.length - 1; i >= 0; i--) {
    if (spend >= MEMBER_LEVELS[i].threshold) {
      return MEMBER_LEVELS[i];
    }
  }
  return MEMBER_LEVELS[0];
};

export const getNextLevel = (spend: number): MemberLevel | null => {
  const current = getMemberLevel(spend);
  const idx = MEMBER_LEVELS.findIndex((l) => l.name === current.name);
  return idx < MEMBER_LEVELS.length - 1 ? MEMBER_LEVELS[idx + 1] : null;
};
