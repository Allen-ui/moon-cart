import type { Product } from "@/data/products";

const pinyinMap: Record<string, string[]> = {
  "牛": ["niu"], "奶": ["nai"], "茶": ["cha"],
  "鸡": ["ji"], "肉": ["rou"], "饭": ["fan"], "面": ["mian"],
  "包": ["bao"], "子": ["zi"], "饺": ["jiao"], "披": ["pi"], "萨": ["sa"],
  "汉": ["han"], "堡": ["bao"], "薯": ["shu"], "条": ["tiao"], "可": ["ke"], "乐": ["le"],
  "电": ["dian"], "脑": ["nao"], "手": ["shou"], "机": ["ji"],
  "耳": ["er"], "键": ["jian"], "盘": ["pan"], "鼠": ["shu"], "标": ["biao"],
  "表": ["biao"], "眼": ["yan"], "镜": ["jing"],
  "衣": ["yi"], "服": ["fu"], "鞋": ["xie"], "帽": ["mao"],
  "裤": ["ku"], "裙": ["qun"], "袜": ["wa"],
  "口": ["kou"], "红": ["hong"], "唇": ["chun"], "膏": ["gao"],
  "膜": ["mo"], "洗": ["xi"],
  "水": ["shui"], "果": ["guo"], "蔬": ["shu"], "菜": ["cai"],
  "海": ["hai"], "鲜": ["xian"], "蛋": ["dan"],
  "零": ["ling"], "食": ["shi"], "糖": ["tang"],
  "巧": ["qiao"], "克": ["ke"], "力": ["li"], "饼": ["bing"], "干": ["gan"],
  "旅": ["lv"], "行": ["xing"], "酒": ["jiu"], "店": ["dian"],
  "票": ["piao"], "门": ["men"],
  "家": ["jia"], "具": ["ju"], "居": ["ju"],
  "枕": ["zhen"], "头": ["tou"], "被": ["bei"],
  "书": ["shu"], "本": ["ben"], "笔": ["bi"], "记": ["ji"],
  "盲": ["mang"], "盒": ["he"], "幸": ["xing"], "运": ["yun"],
  "动": ["dong"], "健": ["jian"], "身": ["shen"],
  "器": ["qi"], "材": ["cai"],
};

export const fuzzySearch = (products: Product[], query: string): Product[] => {
  if (!query.trim()) return products;
  const q = query.trim().toLowerCase();

  return products.filter((product) => {
    const title = product.title.toLowerCase();
    const category = product.category.toLowerCase();

    if (title.includes(q) || category.includes(q)) return true;

    for (let i = 0; i < q.length; i++) {
      const char = q[i];
      if (title.includes(char)) return true;
    }

    const chars = product.title.split("");
    for (const char of chars) {
      const pinyins = pinyinMap[char];
      if (pinyins) {
        for (const py of pinyins) {
          if (py.includes(q) || q.includes(py[0])) return true;
        }
      }
    }

    return false;
  });
};
