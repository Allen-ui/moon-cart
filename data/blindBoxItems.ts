// 盲盒商品生成函数——仅在用户点击盲盒时按需加载
// 抽离自 data/products.ts，避免首屏 bundle 携带 416 行生成逻辑与 1000 项静态数据
import type { Product } from "./products";

// 与 data/products.ts 保持一致的本地小常量（避免引入整个 products 模块）
const palettes = [
  "from-rose-100 via-white to-orange-100",
  "from-amber-100 via-white to-lime-100",
  "from-sky-100 via-white to-cyan-100",
  "from-violet-100 via-white to-pink-100",
  "from-emerald-100 via-white to-teal-100",
  "from-stone-100 via-white to-red-100",
];

const tagGroups = [
  ["今日热卖", "限时优惠"],
  ["新品", "快乐补给"],
  ["深夜精选", "放心买"],
  ["人气爆款", "满减"],
  ["治愈好物", "0元下单"],
];

// 盲盒规格模板——盲盒商品不支持规格选择，这里仅为类型完整
const blindBoxSpecs = [
  {
    label: "款式",
    options: [
      { name: "随机", priceDelta: 0 },
      { name: "隐藏款", priceDelta: 80 },
      { name: "限定款", priceDelta: 120 },
      { name: "稀有款", priceDelta: 60 },
    ],
  },
];

function generateBlindBoxItems(): Array<[string, number, string]> {
  const items: Array<[string, number, string]> = [];
  const used = new Set<string>();

  const add = (title: string, price: number, emoji: string) => {
    items.push([title, price, emoji]);
    used.add(title);
  };

  // ========== 1. 房产地产（50个） ==========
  const houseCities = ["北京", "上海", "深圳", "杭州", "成都", "三亚", "苏州", "厦门", "青岛", "大理"];
  const houseTypes = [
    ["四合院", "🏯"], ["大平层", "🏙️"], ["独栋别墅", "🏡"], ["江景房", "🌊"],
    ["山景庄园", "🏰"], ["花园洋房", "🏘️"], ["loft复式", "🏠"], ["海景别墅", "🏝️"],
    ["胡同小院", "🏚️"], ["空中别墅", "🌆"],
  ];
  const houseModifiers = ["二环内", "陆家嘴", "后海边上", "西湖边", "锦江边", "亚龙湾", "拙政园旁", "鼓浪屿", "八大关", "洱海边"];
  houseCities.forEach((city, ci) => {
    houseTypes.forEach(([type, emoji], ti) => {
      const title = `${city}${houseModifiers[ci]}${type}`;
      if (!used.has(title)) {
        add(title, 5000000 + ci * 800000 + ti * 300000, emoji);
      }
    });
  });

  // ========== 2. 名车豪车（40个） ==========
  const carBrands = [
    ["法拉利", "🏎️"], ["兰博基尼", "🚗"], ["保时捷", "🚙"], ["劳斯莱斯", "🚘"],
    ["布加迪", "🏁"], ["迈凯伦", "🏎️"], ["阿斯顿马丁", "🚗"], ["宾利", "🚙"],
    ["迈巴赫", "🚘"], ["特斯拉Roadster", "⚡"],
  ];
  const carModels = ["488 GTB", "Aventador", "911 Turbo", "幻影", "Chiron", "720S", "DB11", "欧陆GT", "S680", "Roadster"];
  const carColors = ["烈焰红", "午夜蓝", "珍珠白", "曜石黑", "香槟金"];
  carBrands.forEach(([brand, emoji], bi) => {
    carColors.forEach((color, ci) => {
      const title = `${brand} ${carModels[bi]} ${color}`;
      if (!used.has(title)) {
        add(title, 3000000 + bi * 500000 + ci * 50000, emoji);
      }
    });
  });

  // ========== 3. 奢侈珠宝（50个） ==========
  const luxuryItems: Array<[string, string, number]> = [
    ["爱马仕铂金包", "👜", 280000], ["劳力士水鬼", "⌚", 180000], ["百达翡丽鹦鹉螺", "⌚", 800000],
    ["卡地亚蓝气球", "⌚", 120000], ["梵克雅宝四叶草", "📿", 68000],
    ["宝格丽蛇形项链", "💎", 156000], ["蒂芙尼六爪钻戒", "💍", 250000],
    ["香奈儿经典口盖包", "👜", 98000], ["LV旅行箱套装", "🧳", 168000],
    ["迪奥高定礼服", "👗", 380000], ["Gucci酒神包", "👛", 72000],
    ["Prada杀手包", "👜", 48000], ["纪梵希高定", "👘", 420000],
    ["巴黎世家机车包", "🎒", 35000], ["CELINE笑脸包", "👜", 52000],
    ["江诗丹顿传袭", "⌚", 680000], ["朗格猫头鹰", "⌚", 520000],
    ["积家翻转", "⌚", 98000], ["伯爵满天星", "💫", 320000],
    ["芝柏三金桥", "⌚", 450000],
  ];
  const luxuryModifiers = ["限量款", "定制款", "经典款", "联名款", "典藏版"];
  luxuryItems.forEach(([name, emoji, basePrice], li) => {
    luxuryModifiers.forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, basePrice + mi * Math.floor(basePrice * 0.15), emoji);
      }
    });
  });

  // ========== 4. 私人飞机游艇（30个） ==========
  const airYacht: Array<[string, string, number]> = [
    ["湾流G650", "✈️", 450000000], ["庞巴迪环球7500", "🛩️", 520000000],
    ["波音BBJ", "🛫", 680000000], ["空客ACJ319", "🛬", 720000000],
    ["贝尔直升机", "🚁", 180000000], ["罗宾逊R44", "🚁", 5800000],
    ["超级游艇", "🛥️", 320000000], ["帆船游艇", "⛵", 88000000],
    ["潜水艇", "🛟", 280000000], ["水上飞机", "🦅", 98000000],
  ];
  const airModifiers = ["私人定制", "豪华内饰", "总统套间", "香槟金配色", "星空顶"];
  airYacht.forEach(([name, emoji, price], ai) => {
    airModifiers.slice(0, 3).forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price * (1 + mi * 0.2)), emoji);
      }
    });
  });

  // ========== 5. 奇珍异宝（60个） ==========
  const treasures: Array<[string, string, number]> = [
    ["埃及法老黄金面具", "👑", 99999999], ["图坦卡蒙权杖", "🔱", 88888888],
    ["蒙娜丽莎真迹", "🖼️", 77777777], ["梵高星空原作", "🌌", 66666666],
    ["毕加索名画", "🎨", 55555555], ["达芬奇手稿", "📜", 44444444],
    ["圆明园十二生肖兽首", "🐲", 33333333], ["传国玉玺", "🔴", 999999999],
    ["和氏璧", "💎", 888888888], ["夜明珠", "🔮", 22222222],
    ["恐龙化石完整骨架", "🦖", 18000000], ["猛犸象象牙", "🦣", 8800000],
    ["陨石碎片", "☄️", 6600000], ["月球岩石样本", "🌑", 55000000],
    ["火星土壤", "🪐", 44000000], ["南极冰芯", "🧊", 3300000],
    ["深海巨型珍珠", "🦪", 2800000], ["非洲之星钻石", "💎", 77777777],
    ["希望蓝钻石", "💙", 35000000], ["粉红之星钻石", "💖", 42000000],
  ];
  const treasureMods = ["真品", "复刻典藏版", "1:1高仿", "博物馆级", "私人收藏"];
  treasures.forEach(([name, emoji, price], ti) => {
    treasureMods.forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price / (mi + 1)), emoji);
      }
    });
  });

  // ========== 6. 超能力道具（50个） ==========
  const superPowers: Array<[string, string, number]> = [
    ["时光机", "⏰", 999999], ["任意门", "🚪", 888888], ["竹蜻蜓", "🍃", 66666],
    ["记忆面包", "🍞", 8888], ["翻译魔芋", "🍡", 12888], ["隐身斗篷", "🧥", 520000],
    ["魔法扫帚", "🧹", 280000], ["心灵感应头盔", "🪖", 680000], ["传送戒指", "💍", 720000],
    ["长生不老药", "🧪", 9999999], ["后悔药", "💊", 388888], ["忘情水", "💧", 288888],
    ["聪明药", "💊", 188888], ["快乐水", "🧃", 88888], ["许愿瓶", "🧴", 68888],
    ["阿拉丁神灯", "🪔", 8888888], ["魔法水晶球", "🔮", 380000], ["塔罗牌（预言版）", "🃏", 128000],
    ["魔杖", "🪄", 280000], ["飞天扫把", "🧹", 180000],
  ];
  const powerMods = ["标准版", "加强版", "限量版", "升级版", "究极版"];
  superPowers.forEach(([name, emoji, price], si) => {
    powerMods.forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price * (1 + mi * 0.5)), emoji);
      }
    });
  });

  // ========== 7. 顶级美食（60个） ==========
  const foods: Array<[string, string, number]> = [
    ["米其林三星晚宴", "🍽️", 28888], ["神户牛肉套餐", "🥩", 18888],
    ["白松露料理", "🍄", 38888], ["鱼子酱盛宴", "🍣", 26888],
    ["帝王蟹全宴", "🦀", 16888], ["蓝鳍金枪鱼大腹", "🐟", 48888],
    ["鹅肝料理", "🫕", 8888], ["松茸宴", "🍲", 12888],
    ["龙虾大餐", "🦞", 9888], ["鲍鱼宴", "🦪", 15888],
    ["燕窝甜品", "🥣", 6888], ["鱼翅捞饭", "🍚", 18888],
    ["寿司之神手握", "🍱", 28888], ["怀石料理", "🍱", 18888],
    ["分子料理", "🧪", 12888], ["法式大餐", "🍷", 22888],
  ];
  const foodMods = ["单人份", "双人份", "十人份", "定制菜单", "主厨亲自掌勺"];
  foods.forEach(([name, emoji, price], fi) => {
    foodMods.forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price * (mi === 2 ? 5 : mi === 3 ? 1.5 : mi === 4 ? 2 : 1)), emoji);
      }
    });
  });

  // ========== 8. 环球旅行（60个） ==========
  const travels: Array<[string, string, number]> = [
    ["太空旅行", "🚀", 28000000], ["月球度假一周", "🌙", 180000000],
    ["南极探险", "🐧", 580000], ["北极点之旅", "🧊", 880000],
    ["马里亚纳海沟深潜", "🐠", 1200000], ["环球游轮88天", "🛳️", 680000],
    ["私人岛度假一个月", "🏝️", 380000], ["热气球环游世界", "🎈", 2800000],
    ["珠峰登顶", "🏔️", 680000], ["撒哈拉沙漠穿越", "🐪", 280000],
    ["亚马逊雨林探险", "🌴", 180000], ["冰岛极光之旅", "🌌", 128000],
    ["马尔代夫蜜月", "🏖️", 88000], ["瑞士滑雪度假", "⛷️", 158000],
    ["巴黎浪漫之旅", "🗼", 68000], ["纽约时尚周VIP", "🗽", 128000],
  ];
  const travelMods = ["经济舱", "商务舱", "头等舱", "私人飞机", "太空舱"];
  travels.forEach(([name, emoji, price], ti) => {
    travelMods.forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price * Math.pow(1.8, mi)), emoji);
      }
    });
  });

  // ========== 9. 黑科技产品（50个） ==========
  const techs: Array<[string, string, number]> = [
    ["量子计算机", "🖥️", 88000000], ["AI机器人管家", "🤖", 2800000],
    ["全息投影设备", "📽️", 680000], ["脑机接口", "🧠", 5800000],
    ["基因编辑服务", "🧬", 3800000], ["克隆宠物", "🐾", 1800000],
    ["机械外骨骼", "🦾", 880000], ["飞行背包", "🎒", 1200000],
    ["悬浮滑板", "🛹", 280000], ["智能眼镜", "🕶️", 68000],
    ["折叠手机", "📱", 18888], ["透明电视", "📺", 88000],
    ["磁悬浮音箱", "🔊", 28000], ["无线充电全屋", "🔌", 180000],
    ["家用3D打印机", "🖨️", 38000], ["智能镜子", "🪞", 58000],
  ];
  const techMods = ["初代", "Pro版", "Max版", "Ultra版", "定制版"];
  techs.forEach(([name, emoji, price], ti) => {
    techMods.forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price * (1 + mi * 0.4)), emoji);
      }
    });
  });

  // ========== 10. 稀有动物/宠物（40个） ==========
  const pets: Array<[string, string, number]> = [
    ["熊猫饲养权一年", "🐼", 5800000], ["白虎幼崽", "🐯", 8800000],
    ["白狮幼崽", "🦁", 6800000], ["小熊猫", "🐾", 2800000],
    ["企鹅", "🐧", 1800000], ["树懒", "🦥", 1200000],
    ["考拉", "🐨", 2200000], ["水豚", "🦫", 880000],
    ["羊驼", "🦙", 380000], ["矮种马", "🐴", 680000],
  ];
  const petMods = ["幼崽", "成年", "一对", "带血统证书", "赛级"];
  pets.forEach(([name, emoji, price], pi) => {
    petMods.forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price * (1 + mi * 0.3)), emoji);
      }
    });
  });

  // ========== 11. 体验类（60个） ==========
  const experiences: Array<[string, string, number]> = [
    ["与明星共进晚餐", "🍷", 880000], ["当一天公司CEO", "👔", 680000],
    ["电影主角体验一天", "🎬", 580000], ["演唱会VIP前排", "🎤", 180000],
    ["时装周头排看秀", "👗", 280000], ["奥斯卡红毯", "🏆", 480000],
    ["诺贝尔颁奖礼", "🎖️", 380000], ["奥运会开幕式", "🏅", 580000],
    ["世界杯决赛VIP", "⚽", 880000], ["超级碗中场秀", "🏈", 680000],
    ["私人演唱会", "🎸", 2800000], ["和偶像约会一天", "💘", 1800000],
    ["学开飞机", "✈️", 280000], ["学开游艇", "🛥️", 180000],
    ["跳伞体验", "🪂", 88000], ["潜水证", "🤿", 68000],
  ];
  const expMods = ["基础版", "升级版", "豪华版", "VIP版", "尊享版"];
  experiences.forEach(([name, emoji, price], ei) => {
    expMods.forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price * (1 + mi * 0.5)), emoji);
      }
    });
  });

  // ========== 12. 收藏类（50个） ==========
  const collections: Array<[string, string, number]> = [
    ["茅台十二生肖全套", "🍶", 2800000], ["限量版球鞋全套", "👟", 1800000],
    ["稀有邮票集邮册", "📮", 880000], ["古董钟表收藏", "⌚", 3800000],
    ["黑胶唱片全套", "💿", 680000], ["漫画全套", "📚", 280000],
    ["游戏卡全套", "🎴", 180000], ["手办全套", "🧸", 580000],
    ["乐高绝版全套", "🧱", 880000], ["变形金刚G1全套", "🤖", 1200000],
  ];
  const colMods = ["全新", "九成新", "带签名", "限定编号", "博物馆级"];
  collections.forEach(([name, emoji, price], ci) => {
    colMods.forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price * (1 + mi * 0.4)), emoji);
      }
    });
  });

  // ========== 13. 奇幻生物（50个） ==========
  const fantasy: Array<[string, string, number]> = [
    ["独角兽", "🦄", 8888888], ["凤凰", "🐦‍🔥", 6666666],
    ["龙蛋", "🥚", 9999999], ["精灵翅膀", "🧚", 5555555],
    ["矮人金矿", "⛏️", 7777777], ["魔法药水套装", "🧪", 88888],
    ["精灵耳朵", "👂", 66666], ["巫师帽", "🎩", 55555],
    ["魔法书", "📖", 288888], ["魔杖（长老级）", "🪄", 888888],
    ["水晶球（预言）", "🔮", 388888], ["塔罗牌（古版）", "🃏", 188888],
    ["炼金术炉", "🔥", 688888], ["魔法扫帚（光轮）", "🧹", 488888],
    ["隐身药水", "💧", 128888], ["变身药水", "🧴", 268888],
  ];
  const fantasyMods = ["幼年期", "成长期", "成熟期", "完全体", "究极体"];
  fantasy.forEach(([name, emoji, price], fi) => {
    fantasyMods.forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price * Math.pow(1.6, mi)), emoji);
      }
    });
  });

  // ========== 14. 海岛/土地（40个） ==========
  const islands: Array<[string, string, number]> = [
    ["私人岛屿", "🏝️", 28000000], ["热带小岛", "🌴", 18000000],
    ["珊瑚礁岛", "🪸", 38000000], ["火山岛", "🌋", 22000000],
    ["北极小岛", "🧊", 12000000], ["湖心岛", "🏞️", 8800000],
    ["热带雨林庄园", "🌳", 16000000], ["葡萄园酒庄", "🍇", 12000000],
    ["薰衣草庄园", "💜", 9800000], ["咖啡种植园", "☕", 8800000],
  ];
  const islandMods = ["10亩", "50亩", "100亩", "500亩", "1000亩"];
  islands.forEach(([name, emoji, price], ii) => {
    islandMods.forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price * (mi + 1) * 0.8), emoji);
      }
    });
  });

  // ========== 15. 奇葩小物（50个） ==========
  const weirdos: Array<[string, string, number]> = [
    ["会说话的仙人掌", "🌵", 99], ["会跳舞的向日葵", "🌻", 88],
    ["解压包子", "🥟", 39], ["尖叫鸡", "🐔", 29],
    ["太阳能摇摇车", "🚗", 199], ["网红泡泡机", "🫧", 68],
    ["搞怪帽子", "🎩", 58], ["放屁垫", "💨", 25],
    ["挠痒痒机器人", "🤖", 299], ["会唱歌的鱼", "🐟", 128],
    ["网红小黄鸭", "🦆", 39], ["指尖陀螺", "🌀", 49],
    ["无限魔方", "🧊", 89], ["磁力珠", "🧲", 69],
    ["史莱姆", "🫧", 35], ["云朵灯", "☁️", 168],
  ];
  const weirdoMods = ["普通款", "升级款", "豪华款", "联名款", "收藏款"];
  weirdos.forEach(([name, emoji, price], wi) => {
    weirdoMods.forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price * (1 + mi * 0.8)), emoji);
      }
    });
  });

  // ========== 16. 运动豪车补充（30个） ==========
  const sportsCars: Array<[string, string, number]> = [
    ["柯尼塞格", "🏎️", 28000000], ["帕加尼", "🚗", 32000000],
    ["世爵", "🚙", 5800000], ["威兹曼", "🚘", 3200000],
    ["西尔贝", "🏁", 52000000], ["科尼赛克", "🏎️", 46000000],
  ];
  const scMods = ["标准版", "赛道版", "敞篷版", "定制版", "One-Off"];
  sportsCars.forEach(([brand, emoji, price], si) => {
    scMods.slice(0, 5).forEach((mod, mi) => {
      const title = `${brand} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price * (1 + mi * 0.35)), emoji);
      }
    });
  });

  // ========== 17. 艺术品（50个） ==========
  const arts: Array<[string, string, number]> = [
    ["齐白石虾图", "🦐", 88000000], ["徐悲鸿马", "🐎", 68000000],
    ["张大千山水画", "🏔️", 58000000], ["傅抱石人物", "👤", 48000000],
    ["吴冠中江南", "🏘️", 38000000], ["林风眠仕女图", "👩", 28000000],
    ["潘天寿鹰", "🦅", 25000000], ["黄宾虹山水", "⛰️", 22000000],
    ["李可染万山红遍", "🍁", 32000000], ["靳尚谊肖像", "🖼️", 18000000],
  ];
  const artMods = ["真迹", "高仿", "版画", "复刻", "装饰画"];
  arts.forEach(([name, emoji, price], ai) => {
    artMods.forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price / Math.pow(3, mi)), emoji);
      }
    });
  });

  // ========== 18. 乐器（40个） ==========
  const instruments: Array<[string, string, number]> = [
    ["施坦威钢琴", "🎹", 2800000], ["斯特拉迪瓦里小提琴", "🎻", 88000000],
    ["吉布森电吉他", "🎸", 280000], ["马丁民谣吉他", "🎸", 180000],
    ["雅马哈三角钢琴", "🎹", 680000], ["管风琴", "🎺", 3800000],
    ["萨克斯", "🎷", 88000], ["小号", "🎺", 68000],
    ["长笛", "🪈", 58000], ["大提琴", "🎻", 180000],
  ];
  const instMods = ["入门级", "进阶级", "专业级", "大师级", "收藏级"];
  instruments.forEach(([name, emoji, price], ii) => {
    instMods.forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price * Math.pow(2.2, mi - 2)), emoji);
      }
    });
  });

  // ========== 19. 酒类（50个） ==========
  const wines: Array<[string, string, number]> = [
    ["82年拉菲", "🍷", 280000], ["罗曼尼康帝", "🍇", 880000],
    ["麦卡伦威士忌", "🥃", 180000], ["山崎25年", "🥃", 280000],
    ["茅台50年", "🍶", 380000], ["五粮液50年", "🍶", 180000],
    ["轩尼诗李察", "🥂", 28000], ["人头马路易十三", "🥃", 280000],
    ["马爹利至尊", "🍸", 68000], ["芝华士25年", "🥃", 88000],
  ];
  const wineMods = ["单瓶", "双瓶礼盒", "整箱6瓶", "限量版", "收藏级"];
  wines.forEach(([name, emoji, price], wi) => {
    wineMods.forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price * (mi === 0 ? 1 : mi === 1 ? 2 : mi === 2 ? 6 : mi === 3 ? 1.5 : 3)), emoji);
      }
    });
  });

  // ========== 20. 手表（50个） ==========
  const watches: Array<[string, string, number]> = [
    ["百达翡丽鹦鹉螺", "⌚", 880000], ["爱彼皇家橡树", "🌳", 680000],
    ["江诗丹顿传袭", "🏰", 580000], ["宝珀五十噚", "🐠", 180000],
    ["宝玑传世", "🌙", 480000], ["积家翻转", "🔄", 98000],
    ["万国葡萄牙", "🇵🇹", 120000], ["芝柏三金桥", "🌉", 450000],
    ["法穆兰", "💎", 280000], ["罗杰杜彼", "🦁", 380000],
  ];
  const watchMods = ["钢款", "间金", "全金", "满钻", "定制款"];
  watches.forEach(([name, emoji, price], wi) => {
    watchMods.forEach((mod, mi) => {
      const title = `${name} ${mod}`;
      if (!used.has(title)) {
        add(title, Math.floor(price * (1 + mi * 0.6)), emoji);
      }
    });
  });

  // 确保凑够1000个
  let extraIndex = 0;
  const extraEmojis = ["🎁", "🎊", "🎉", "✨", "💫", "🌟", "⭐", "💎", "🏆", "👑"];
  while (items.length < 1000) {
    const title = `神秘惊喜盲盒 No.${extraIndex + 1}`;
    if (!used.has(title)) {
      const price = 999 + extraIndex * 37;
      const emoji = extraEmojis[extraIndex % extraEmojis.length];
      add(title, price, emoji);
    }
    extraIndex++;
  }

  // 打乱顺序
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return items.slice(0, 1000);
}

// 与 data/products.ts 中保持一致的格式化逻辑
// categoryIndex=10 对应 categorySeed 中 "盲盒" 的位置
// startId=99900 用于避免与 products.ts 生成的其他商品 ID 冲突
export function getBlindBoxProducts(startId = 99900): Product[] {
  const items = generateBlindBoxItems();
  const category = "盲盒";
  const categoryIndex = 10;
  return items.map(([title, price, emoji], itemIndex) => {
    const id = startId + itemIndex;
    return {
      id,
      title,
      price,
      image: `${category}-${itemIndex + 1}`,
      category,
      sales: `${((itemIndex + 1) * (categoryIndex + 2) * 0.7).toFixed(1)}万`,
      coupon:
        price > 80
          ? `满${Math.floor(price / 10) * 10}减${Math.max(10, Math.floor(price * 0.18))}`
          : `满${Math.max(29, price)}减${Math.max(5, Math.floor(price * 0.12))}`,
      tags: tagGroups[(categoryIndex + itemIndex) % tagGroups.length],
      intro: "一份不用犹豫的虚拟奖励。加入购物车，获得下单成功的快乐，不产生任何真实消费。",
      palette: palettes[(categoryIndex + itemIndex) % palettes.length],
      emoji,
      specs: blindBoxSpecs,
    };
  });
}
