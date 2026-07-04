export type Product = {
  id: number;
  title: string;
  price: number;
  image: string;
  category: string;
  sales: string;
  coupon: string;
  tags: string[];
  intro: string;
  palette: string;
  emoji: string;
  specs?: Array<{ label: string; options: Array<{ name: string; priceDelta: number }> }>;
};

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

const categorySeed: Record<string, Array<[string, number, string]>> = {
  外卖: [
    ["疯狂炸鸡套餐", 89, "🍗"],
    ["深夜牛肉汉堡", 56, "🍔"],
    ["芝士瀑布披萨", 128, "🍕"],
    ["麻辣香锅双人份", 96, "🥘"],
    ["寿司治愈拼盘", 118, "🍣"],
    ["热辣螺蛳粉", 32, "🍜"],
    ["奶油蘑菇意面", 68, "🍝"],
    ["烤肉拌饭加蛋", 42, "🍛"],
    ["冒菜豪华碗", 58, "🥣"],
    ["小龙虾夜宵桶", 168, "🦞"],
    ["韩式炸鸡半半", 86, "🍗"],
    ["椰子鸡汤锅", 139, "🍲"],
    ["日式叉烧拉面", 48, "🍜"],
    ["泰式冬阴功汤", 58, "🍲"],
    ["港式叉烧饭", 45, "🍚"],
    ["川味火锅外卖", 158, "🍲"],
    ["墨西哥塔可套餐", 78, "🌮"],
    ["越南牛肉河粉", 52, "🍜"],
    ["韩式拌饭套餐", 49, "🍱"],
    ["东北锅包肉套餐", 68, "🍖"],
    ["重庆酸辣粉", 28, "🌶"],
    ["新疆大盘鸡外卖", 138, "🍗"],
    ["福建沙茶面", 38, "🍜"],
    ["湖南剁椒鱼头", 178, "🐟"],
    ["北京烤鸭套餐", 168, "🦆"],
    ["江南小笼包套餐", 36, "🥟"],
    ["西安肉夹馍套餐", 32, "🥙"],
    ["厦门沙茶拌面", 35, "🍜"],
    ["云南过桥米线", 58, "🍜"],
    ["港式下午茶套餐", 88, "🍮"],
    ["珍珠奶茶大杯", 22, "🧋"],
    ["手打柠檬茶", 18, "🍋"],
    ["芒果冰沙", 25, "🥭"],
    ["鲜榨橙汁", 26, "🍊"],
    ["杨枝甘露", 28, "🥭"],
    ["红豆奶茶", 24, "🧋"],
    ["提拉米苏蛋糕", 48, "🍰"],
    ["草莓慕斯杯", 38, "🍰"],
    ["双皮奶", 22, "🥛"],
    ["芒果班戟", 28, "🥞"],
    ["蛋黄酥礼盒", 45, "🥮"],
    ["三文鱼刺身拼盘", 138, "🐟"],
    ["日式天妇罗拼盘", 88, "🍤"],
    ["夏威夷披萨", 98, "🍕"],
    ["榴莲披萨", 128, "🍕"],
    ["黑椒牛柳披萨", 108, "🍕"]
  ],
  水果: [
    ["阳光玫瑰葡萄", 78, "🍇"],
    ["爆汁水蜜桃", 46, "🍑"],
    ["冰镇麒麟西瓜", 35, "🍉"],
    ["泰国金枕榴莲", 159, "🥭"],
    ["车厘子礼盒", 188, "🍒"],
    ["蓝莓小甜盒", 49, "🫐"],
    ["海南贵妃芒", 59, "🥭"],
    ["新疆阿克苏苹果", 42, "🍎"],
    ["香甜草莓盒", 68, "🍓"],
    ["现切水果杯", 28, "🍍"],
    ["智利进口牛油果", 56, "🥑"],
    ["烟台红富士礼盒", 89, "🍎"],
    ["福建琯溪蜜柚", 39, "🍊"],
    ["泰国椰青四个装", 68, "🥥"],
    ["广西沃柑五斤", 35, "🍊"],
    ["陕西徐香猕猴桃", 49, "🥝"],
    ["海南木瓜大果", 32, "🥭"],
    ["哈密瓜礼盒装", 76, "🍈"],
    ["巨峰葡萄家庭装", 65, "🍇"],
    ["红心火龙果礼盒", 58, "🐉"],
    ["赣南脐橙整箱", 45, "🍊"],
    ["智利蓝莓大盒装", 88, "🫐"],
    ["海南金钻凤梨", 49, "🍍"],
    ["突尼斯软籽石榴", 89, "🟠"],
    ["库尔勒香梨礼盒", 38, "🍐"],
    ["海南黑金刚莲雾", 79, "🍎"],
    ["进口蛇果礼盒", 56, "🍎"],
    ["智利黑布林礼盒", 42, "🟣"],
    ["烟台大樱桃礼盒", 199, "🍒"],
    ["进口无花果礼盒", 68, "🟣"]
  ],
  零食: [
    ["薯片快乐箱", 45, "🥔"],
    ["巧克力囤货包", 88, "🍫"],
    ["辣条宇宙桶", 39, "🌶"],
    ["坚果能量盒", 69, "🥜"],
    ["曲奇饼干铁盒", 52, "🍪"],
    ["海苔脆脆包", 33, "🍘"],
    ["布丁混合装", 29, "🍮"],
    ["牛肉干追剧包", 76, "🥩"],
    ["棉花糖云朵袋", 24, "☁️"],
    ["酸奶冻干小盒", 36, "🥛"],
    ["芝士波波鱼丸", 28, "🐟"],
    ["海盐饼干棒", 19, "🥨"],
    ["蛋黄派家庭装", 39, "🥮"],
    ["蔓越莓曲奇袋", 25, "🍪"],
    ["香辣虾条", 18, "🦐"],
    ["芒果干大袋装", 32, "🥭"],
    ["抹茶巧克力", 42, "🍵"],
    ["焦糖爆米花", 22, "🍿"],
    ["海盐太妃糖", 29, "🍬"],
    ["葡萄干大袋", 26, "🍇"],
    ["香辣鸡爪包", 35, "🍗"],
    ["山楂条怀旧装", 12, "🍒"],
    ["紫菜蛋卷铁盒", 38, "🍘"],
    ["草莓冻条袋装", 18, "🍓"],
    ["红薯条健康装", 24, "🍠"],
    ["玉米片辣味装", 26, "🌽"],
    ["奶酪球罐装", 45, "🧀"],
    ["鱼肠零食包", 32, "🐟"],
    ["抹茶威化饼干", 25, "🍪"],
    ["坚果能量棒", 49, "🥜"]
  ],
  饮料: [
    ["茉莉奶绿加厚乳", 23, "🧋"],
    ["冰美式自由杯", 18, "☕"],
    ["桃桃乌龙茶", 21, "🍑"],
    ["鲜榨橙汁瓶", 26, "🍊"],
    ["气泡水组合", 38, "🫧"],
    ["草莓酸奶昔", 29, "🍓"],
    ["椰云拿铁", 31, "🥥"],
    ["葡萄多肉杯", 28, "🍇"],
    ["无糖茶囤货装", 49, "🍵"],
    ["热可可治愈杯", 24, "🍫"],
    ["鸭屎香柠檬茶", 22, "🍋"],
    ["生椰拿铁杯", 28, "🥥"],
    ["杨枝甘露杯", 32, "🥭"],
    ["桂花酒酿奶茶", 26, "🍶"],
    ["黑糖珍珠奶茶", 25, "🧋"],
    ["西瓜冰沙杯", 23, "🍉"],
    ["茉莉蜜茶瓶装", 18, "🍵"],
    ["玫瑰气泡水", 35, "🌹"],
    ["抹茶拿铁", 29, "🍵"],
    ["芝士葡萄杯", 32, "🍇"],
    ["椰子水整箱装", 45, "🥥"],
    ["桂花拿铁", 28, "🌼"],
    ["蜜桃乌龙奶茶", 25, "🍑"],
    ["抹茶星冰乐", 35, "🍵"],
    ["柠檬养乐多", 19, "🍋"],
    ["草莓奶昔杯", 26, "🍓"],
    ["醇香豆奶瓶", 16, "🥛"],
    ["冷萃咖啡瓶装", 28, "☕"],
    ["山楂气泡水", 22, "🍒"],
    ["桂花酸梅汤", 18, "🍵"]
  ],
  数码: [
    ["降噪头戴耳机", 799, "🎧"],
    ["小巧机械键盘", 399, "⌨️"],
    ["复古掌机", 529, "🎮"],
    ["便携投影仪", 1299, "📽"],
    ["磁吸充电宝", 199, "🔋"],
    ["电子阅读器", 899, "📖"],
    ["桌面氛围灯", 159, "💡"],
    ["胶片感相机", 699, "📷"],
    ["智能手表", 1099, "⌚"],
    ["迷你蓝牙音箱", 269, "🔊"],
    ["折叠手机支架", 89, "📱"],
    ["平板触控笔", 329, "✏️"],
    ["无线静音鼠标", 159, "🖱"],
    ["蓝牙运动耳机", 299, "🎧"],
    ["智能体脂秤", 199, "⚖️"],
    ["桌面手机支架", 89, "📱"],
    ["蓝牙游戏手柄", 349, "🎮"],
    ["无线充电板", 129, "🔌"],
    ["便携蓝牙键盘", 189, "⌨️"],
    ["桌面迷你风扇", 119, "💨"],
    ["智能可视门铃", 599, "🔔"],
    ["蓝牙自拍杆", 79, "📱"],
    ["高速U盘128G", 159, "💾"],
    ["桌面扩展坞", 269, "🔌"],
    ["蓝牙音频接收器", 89, "🎧"],
    ["便携固态硬盘", 459, "💾"],
    ["桌面护眼台灯", 199, "💡"],
    ["智能插座套装", 99, "🔌"],
    ["VR头显入门款", 899, "🥽"],
    ["蓝牙便携打印机", 699, "🖨"]
  ],
  美妆: [
    ["水光精华套装", 268, "🧴"],
    ["柔雾口红礼盒", 199, "💄"],
    ["睡眠面膜囤货", 156, "🫧"],
    ["香氛护手霜", 68, "🌷"],
    ["粉底液自然色", 228, "✨"],
    ["睫毛夹工具套", 49, "👁"],
    ["身体乳大瓶装", 89, "🧴"],
    ["腮红甜杏色", 98, "🍑"],
    ["洗面奶双支装", 118, "🫧"],
    ["木质调香水", 399, "🌲"],
    ["玻尿酸保湿精华", 188, "💧"],
    ["紧致眼霜套装", 258, "👁"],
    ["唇釉丝绒礼盒", 169, "💋"],
    ["清爽防晒霜", 138, "☀️"],
    ["定妆粉饼盒", 119, "🪞"],
    ["大地色眼影盘", 249, "🎨"],
    ["温和卸妆油", 128, "🧴"],
    ["修眉刀工具套", 49, "✂️"],
    ["卷发棒造型器", 299, "💇"],
    ["香氛沐浴露", 79, "🛁"],
    ["修护精华安瓶", 218, "💧"],
    ["唇部磨砂膏", 68, "💋"],
    ["颈纹紧致霜", 158, "🦢"],
    ["美甲油套装", 89, "💅"],
    ["防水眼线笔", 59, "✏️"],
    ["纤长睫毛膏", 89, "👁"],
    ["化妆刷套装", 168, "🖌"],
    ["家用美容仪", 499, "✨"],
    ["发膜修护装", 98, "💇"],
    ["香水小样套装", 159, "🌸"]
  ],
  鞋服: [
    ["云朵跑步鞋", 499, "👟"],
    ["宽松卫衣", 189, "🧥"],
    ["直筒牛仔裤", 239, "👖"],
    ["通勤托特包", 329, "👜"],
    ["棒球帽基础款", 79, "🧢"],
    ["羊毛围巾", 169, "🧣"],
    ["白色短袖三件", 129, "👕"],
    ["法式小皮鞋", 369, "👞"],
    ["轻暖羽绒服", 699, "🧥"],
    ["运动袜六双装", 59, "🧦"],
    ["复古帆布鞋", 259, "👟"],
    ["针织开衫外套", 199, "🧶"],
    ["休闲西装外套", 459, "🧥"],
    ["真皮单肩包", 599, "👜"],
    ["防晒渔夫帽", 89, "🧢"],
    ["真皮手套", 159, "🧤"],
    ["棉质家居服套装", 169, "🛋️"],
    ["复古马丁靴", 589, "👢"],
    ["加绒卫裤", 159, "👖"],
    ["棒球夹克外套", 369, "🧥"],
    ["真皮皮带", 129, "👔"],
    ["丝绒发圈套装", 59, "🎀"],
    ["羊绒衫", 599, "🧥"],
    ["帆布双肩包", 159, "🎒"],
    ["速干运动短裤", 89, "👖"],
    ["蕾丝打底衫", 119, "👚"],
    ["厚底老爹鞋", 499, "👟"],
    ["丝绸睡衣套装", 199, "🛏️"],
    ["防风冲锋衣", 699, "🧥"],
    ["真皮短靴", 549, "👢"]
  ],
  家电: [
    ["迷你空气炸锅", 399, "🍟"],
    ["小型洗地机", 1399, "🧹"],
    ["多功能早餐机", 299, "🍞"],
    ["便携熨烫机", 199, "♨️"],
    ["静音加湿器", 159, "💧"],
    ["智能电饭煲", 499, "🍚"],
    ["桌面暖风机", 189, "🔥"],
    ["胶囊咖啡机", 799, "☕"],
    ["高速吹风机", 599, "💨"],
    ["扫地机器人", 1899, "🤖"],
    ["桌面饮水机", 399, "💧"],
    ["迷你冰箱", 899, "❄️"],
    ["桌面吸尘器", 159, "🧹"],
    ["蒸汽拖把", 999, "🧽"],
    ["智能门锁", 1299, "🔐"],
    ["多功能料理锅", 499, "🍲"],
    ["蒸汽眼罩机", 169, "👁"],
    ["烘干晾衣架", 599, "👕"],
    ["迷你豆浆机", 269, "🥛"],
    ["静音破壁机", 699, "🍵"],
    ["电动牙刷套装", 199, "🪥"],
    ["桌面制冰机", 599, "🧊"],
    ["香薰加湿器", 159, "🌿"],
    ["智能体重秤", 129, "⚖️"],
    ["桌面小风扇", 89, "💨"],
    ["颈部按摩仪", 299, "💆"],
    ["早餐三明治机", 199, "🥪"],
    ["迷你洗碗机", 1599, "🍽"],
    ["智能空气净化器", 1299, "🌬"],
    ["电热暖脚宝", 99, "🦶"]
  ],
  生活用品: [
    ["香薰蜡烛套装", 128, "🕯"],
    ["云感四件套", 399, "🛏"],
    ["人体工学靠垫", 169, "🪑"],
    ["浴室收纳架", 89, "🧺"],
    ["护眼台灯", 219, "💡"],
    ["软毛牙刷囤货", 59, "🪥"],
    ["木质餐具套", 99, "🍽"],
    ["睡前喷雾", 78, "🌙"],
    ["毛绒拖鞋", 69, "🩴"],
    ["透明整理箱", 119, "📦"],
    ["硅藻土吸水地垫", 49, "🟫"],
    ["加湿滤网替换装", 39, "🌿"],
    ["收纳抽屉分隔盒", 35, "📦"],
    ["陶瓷马克杯", 59, "☕"],
    ["北欧风抱枕", 89, "🛋️"],
    ["浴室防滑垫", 49, "🛁"],
    ["真空压缩袋套装", 45, "🫧"],
    ["加厚毛巾三件套", 79, "🧖"],
    ["厨房置物架", 99, "🍳"],
    ["桌面收纳笔筒", 29, "🖊"],
    ["香薰精油补充装", 68, "🌸"],
    ["折叠晾衣架", 89, "👕"],
    ["床头小夜灯", 79, "🌙"],
    ["衣物除毛器", 39, "🧥"],
    ["桌面小盆栽", 49, "🪴"],
    ["玻璃水杯套装", 89, "🥛"],
    ["浴室毛巾架", 69, "🧖"],
    ["桌面收纳盒", 35, "📦"],
    ["加湿器滤芯", 49, "💧"],
    ["床尾毯", 159, "🛏"]
  ],
  旅行: [
    ["周末温泉套餐", 699, "♨️"],
    ["海边民宿一晚", 899, "🏝"],
    ["城市漫游机票", 1280, "✈️"],
    ["露营装备套装", 499, "⛺"],
    ["山景酒店券", 999, "🏔"],
    ["环球影城门票", 638, "🎢"],
    ["轻便行李箱", 459, "🧳"],
    ["旅行拍照套餐", 399, "📷"],
    ["高铁随心券", 520, "🚄"],
    ["治愈海岛船票", 328, "⛴"],
    ["三亚亚龙湾海景房两晚", 2380, "🏖"],
    ["北京故宫深度讲解门票", 268, "🏯"],
    ["上海迪士尼一日通票", 599, "🏰"],
    ["成都熊猫基地亲子游", 218, "🐼"],
    ["云南6日跟团深度游", 2680, "🌄"],
    ["海南自驾租车三天", 899, "🚗"],
    ["马尔代夫度假套餐", 2980, "🏝"],
    ["杭州西湖周边一日游", 388, "🌸"],
    ["呼伦贝尔草原露营两日", 588, "⛺"],
    ["丽江古城民宿三晚", 1280, "🏯"],
    ["港澳双飞五日机票", 1380, "✈️"],
    ["三亚游艇日游套餐", 1880, "⛵"],
    ["北京慕田峪长城一日游", 358, "🏔"],
    ["厦门鼓浪屿船票套票", 268, "⛴"],
    ["张家界玻璃栈道门票", 318, "🏞"],
    ["青海湖环湖自驾租车", 1580, "🚙"],
    ["桂林漓江竹筏游船票", 458, "🚢"],
    ["长隆野生动物园套票", 388, "🦁"],
    ["哈尔滨冰雪大世界门票", 328, "❄️"],
    ["西藏拉萨朝圣游", 2880, "🏔"],
    ["上海飞东京往返机票", 1580, "✈️"],
    ["北京飞曼谷往返机票", 1880, "✈️"],
    ["广州飞巴厘岛机票", 2280, "✈️"],
    ["深圳飞清迈机票", 1680, "✈️"],
    ["成都川藏线自驾租车", 1280, "🚙"],
    ["北京包车一日游", 580, "🚗"],
    ["云南大理环洱海租车", 680, "🚗"],
    ["苏州园林一日游", 298, "🏯"],
    ["南京中山陵周边游", 288, "🏯"],
    ["川西高原星空露营", 488, "⛺"],
    ["新疆喀纳斯湖露营", 980, "⛺"],
    ["北京环球影城通票", 588, "🎢"],
    ["欢乐谷一日通票", 288, "🎢"],
    ["三亚亚特兰蒂斯度假", 3280, "🏝"],
    ["巴厘岛度假套餐", 2680, "🏝"]
  ],
  盲盒: generateBlindBoxItems()
};

const MIN_PRODUCTS_PER_CATEGORY = 50;
const productFillModifiers = [
  "精选款",
  "人气款",
  "升级款",
  "家庭装",
  "囤货装",
  "礼盒装",
  "限定款",
  "轻享版",
  "豪华版",
  "高配版",
];

Object.entries(categorySeed).forEach(([category, items]) => {
  if (category === "盲盒" || items.length >= MIN_PRODUCTS_PER_CATEGORY) return;

  const originalItems = [...items];
  const usedTitles = new Set(items.map(([title]) => title));
  let fillIndex = 0;

  while (items.length < MIN_PRODUCTS_PER_CATEGORY) {
    const [title, price, emoji] = originalItems[fillIndex % originalItems.length];
    const modifier = productFillModifiers[Math.floor(fillIndex / originalItems.length) % productFillModifiers.length];
    const generatedTitle = `${title}${modifier}`;

    if (!usedTitles.has(generatedTitle)) {
      const priceOffset = ((fillIndex % 5) - 2) * 0.04;
      const generatedPrice = Math.max(1, Math.round(price * (1 + priceOffset) + (fillIndex % 7) * 3));
      items.push([generatedTitle, generatedPrice, emoji]);
      usedTitles.add(generatedTitle);
    }

    fillIndex++;
  }
});

const palettes = [
  "from-rose-100 via-white to-orange-100",
  "from-amber-100 via-white to-lime-100",
  "from-sky-100 via-white to-cyan-100",
  "from-violet-100 via-white to-pink-100",
  "from-emerald-100 via-white to-teal-100",
  "from-stone-100 via-white to-red-100"
];

const tagGroups = [
  ["今日热卖", "限时优惠"],
  ["新品", "快乐补给"],
  ["深夜精选", "放心买"],
  ["人气爆款", "满减"],
  ["治愈好物", "0元下单"]
];

export const categories = Object.keys(categorySeed);

const specTemplates: Record<string, Array<{ label: string; options: Array<{ name: string; priceDelta: number }> }>> = {
  外卖: [
    { label: "口味", options: [{ name: "微辣", priceDelta: 0 }, { name: "中辣", priceDelta: 2 }, { name: "特辣", priceDelta: 3 }, { name: "不辣", priceDelta: 0 }, { name: "酸甜", priceDelta: 2 }] },
    { label: "份量", options: [{ name: "单人份", priceDelta: 0 }, { name: "双人份", priceDelta: 15 }, { name: "大份", priceDelta: 25 }, { name: "超大份", priceDelta: 40 }] },
  ],
  美食: [
    { label: "口味", options: [{ name: "原味", priceDelta: 0 }, { name: "微辣", priceDelta: 2 }, { name: "中辣", priceDelta: 4 }, { name: "特辣", priceDelta: 6 }, { name: "酸甜", priceDelta: 3 }] },
    { label: "份量", options: [{ name: "单人份", priceDelta: 0 }, { name: "双人份", priceDelta: 18 }, { name: "大份", priceDelta: 28 }, { name: "家庭装", priceDelta: 50 }] },
  ],
  饮品: [
    { label: "甜度", options: [{ name: "全糖", priceDelta: 0 }, { name: "七分糖", priceDelta: 0 }, { name: "五分糖", priceDelta: 0 }, { name: "三分糖", priceDelta: 0 }, { name: "无糖", priceDelta: 0 }] },
    { label: "冰度", options: [{ name: "正常冰", priceDelta: 0 }, { name: "少冰", priceDelta: 0 }, { name: "去冰", priceDelta: 0 }, { name: "热饮", priceDelta: 2 }] },
    { label: "规格", options: [{ name: "中杯", priceDelta: 0 }, { name: "大杯", priceDelta: 6 }, { name: "超大杯", priceDelta: 12 }] },
  ],
  数码: [
    { label: "颜色", options: [{ name: "星空黑", priceDelta: 0 }, { name: "珍珠白", priceDelta: 20 }, { name: "远山蓝", priceDelta: 30 }, { name: "玫瑰金", priceDelta: 50 }, { name: "翡翠绿", priceDelta: 40 }] },
    { label: "内存", options: [{ name: "128GB", priceDelta: 0 }, { name: "256GB", priceDelta: 200 }, { name: "512GB", priceDelta: 500 }, { name: "1TB", priceDelta: 1000 }] },
  ],
  鞋服: [
    { label: "尺码", options: [{ name: "36", priceDelta: 0 }, { name: "37", priceDelta: 0 }, { name: "38", priceDelta: 0 }, { name: "39", priceDelta: 0 }, { name: "40", priceDelta: 0 }, { name: "41", priceDelta: 5 }, { name: "42", priceDelta: 5 }, { name: "43", priceDelta: 10 }, { name: "44", priceDelta: 10 }] },
    { label: "颜色", options: [{ name: "黑色", priceDelta: 0 }, { name: "白色", priceDelta: 10 }, { name: "灰色", priceDelta: 5 }, { name: "蓝色", priceDelta: 15 }, { name: "红色", priceDelta: 20 }] },
  ],
  美妆: [
    { label: "色号", options: [{ name: "正红色", priceDelta: 0 }, { name: "豆沙色", priceDelta: 5 }, { name: "珊瑚色", priceDelta: 8 }, { name: "裸色", priceDelta: 3 }, { name: "玫瑰红", priceDelta: 10 }] },
    { label: "规格", options: [{ name: "迷你装", priceDelta: -20 }, { name: "正装", priceDelta: 0 }, { name: "套装", priceDelta: 45 }] },
  ],
  日用: [
    { label: "颜色", options: [{ name: "白色", priceDelta: 0 }, { name: "黑色", priceDelta: 5 }, { name: "灰色", priceDelta: 3 }, { name: "米色", priceDelta: 8 }, { name: "彩色", priceDelta: 12 }] },
    { label: "规格", options: [{ name: "小号", priceDelta: -10 }, { name: "中号", priceDelta: 0 }, { name: "大号", priceDelta: 20 }, { name: "超大号", priceDelta: 40 }] },
  ],
  盲盒: [
    { label: "款式", options: [{ name: "随机", priceDelta: 0 }, { name: "隐藏款", priceDelta: 80 }, { name: "限定款", priceDelta: 120 }, { name: "稀有款", priceDelta: 60 }] },
  ],
  旅行: [
    { label: "出发地", options: [{ name: "北京", priceDelta: 0 }, { name: "上海", priceDelta: 0 }, { name: "广州", priceDelta: 50 }, { name: "深圳", priceDelta: 50 }, { name: "成都", priceDelta: 100 }, { name: "杭州", priceDelta: 80 }] },
    { label: "舱型/房型", options: [{ name: "经济", priceDelta: 0 }, { name: "舒适", priceDelta: 100 }, { name: "豪华", priceDelta: 300 }, { name: "尊享", priceDelta: 600 }] },
  ],
};

function getSpecsForCategory(category: string): Array<{ label: string; options: Array<{ name: string; priceDelta: number }> }> {
  return specTemplates[category] || [
    { label: "规格", options: [{ name: "标准版", priceDelta: 0 }, { name: "豪华版", priceDelta: 30 }, { name: "尊享版", priceDelta: 60 }] },
  ];
}

export const products: Product[] = Object.entries(categorySeed).flatMap(([category, items], categoryIndex) =>
  items.map(([title, price, emoji], itemIndex) => {
    const id = categoryIndex * 100 + itemIndex + 1;
    return {
      id,
      title,
      price,
      image: `${category}-${itemIndex + 1}`,
      category,
      sales: `${((itemIndex + 1) * (categoryIndex + 2) * 0.7).toFixed(1)}万`,
      coupon: price > 80 ? `满${Math.floor(price / 10) * 10}减${Math.max(10, Math.floor(price * 0.18))}` : `满${Math.max(29, price)}减${Math.max(5, Math.floor(price * 0.12))}`,
      tags: tagGroups[(categoryIndex + itemIndex) % tagGroups.length],
      intro: "一份不用犹豫的虚拟奖励。加入购物车，获得下单成功的快乐，不产生任何真实消费。",
      palette: palettes[(categoryIndex + itemIndex) % palettes.length],
      emoji,
      specs: getSpecsForCategory(category),
    };
  })
);

export const pickProducts = (category?: string) =>
  category
    ? products.filter((item) => item.category === category)
    : products.filter((item) => item.category !== "盲盒");
