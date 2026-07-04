// 航班搜索相关数据与逻辑——仅在进入机票视图时按需加载
// 抽离自主 app/page.tsx，避免首屏 bundle 携带约 300 行静态数据

export type FlightCity = { code: string; name: string; pinyin: string; region?: string };

export const FLIGHT_CITY_DATA: Record<"domestic" | "international", FlightCity[]> = {
  domestic: [
    // 北京
    { code: "BJS", name: "北京", pinyin: "beijing", region: "北京" },
    // 天津
    { code: "TSN", name: "天津", pinyin: "tianjin", region: "天津" },
    // 河北
    { code: "SJW", name: "石家庄", pinyin: "shijiazhuang", region: "河北" },
    { code: "HDG", name: "邯郸", pinyin: "handan", region: "河北" },
    { code: "BPE", name: "秦皇岛", pinyin: "qinhuangdao", region: "河北" },
    // 山西
    { code: "TYN", name: "太原", pinyin: "taiyuan", region: "山西" },
    { code: "YCU", name: "运城", pinyin: "yuncheng", region: "山西" },
    { code: "DAT", name: "大同", pinyin: "datong", region: "山西" },
    { code: "CIH", name: "长治", pinyin: "changzhi", region: "山西" },
    // 内蒙古
    { code: "HET", name: "呼和浩特", pinyin: "huhehaote", region: "内蒙古" },
    { code: "DSN", name: "鄂尔多斯", pinyin: "eerduosi", region: "内蒙古" },
    { code: "HLD", name: "呼伦贝尔", pinyin: "hulunbeier", region: "内蒙古" },
    { code: "BAV", name: "包头", pinyin: "baotou", region: "内蒙古" },
    { code: "CIF", name: "赤峰", pinyin: "chifeng", region: "内蒙古" },
    { code: "TGO", name: "通辽", pinyin: "tongliao", region: "内蒙古" },
    // 辽宁
    { code: "SHE", name: "沈阳", pinyin: "shenyang", region: "辽宁" },
    { code: "DLC", name: "大连", pinyin: "dalian", region: "辽宁" },
    { code: "JNZ", name: "锦州", pinyin: "jinzhou", region: "辽宁" },
    { code: "YIK", name: "营口", pinyin: "yingkou", region: "辽宁" },
    { code: "AOG", name: "鞍山", pinyin: "anshan", region: "辽宁" },
    // 吉林
    { code: "CGQ", name: "长春", pinyin: "changchun", region: "吉林" },
    { code: "YNJ", name: "延吉", pinyin: "yanji", region: "吉林" },
    { code: "NBS", name: "白山", pinyin: "baishan", region: "吉林" },
    { code: "TNH", name: "通化", pinyin: "tonghua", region: "吉林" },
    // 黑龙江
    { code: "HRB", name: "哈尔滨", pinyin: "haerbin", region: "黑龙江" },
    { code: "JMU", name: "佳木斯", pinyin: "jiamusi", region: "黑龙江" },
    { code: "MDG", name: "牡丹江", pinyin: "mudanjiang", region: "黑龙江" },
    { code: "OHE", name: "漠河", pinyin: "mohe", region: "黑龙江" },
    { code: "NDG", name: "齐齐哈尔", pinyin: "qiqihaer", region: "黑龙江" },
    // 上海
    { code: "SHA", name: "上海", pinyin: "shanghai", region: "上海" },
    // 江苏
    { code: "NKG", name: "南京", pinyin: "nanjing", region: "江苏" },
    { code: "XUZ", name: "徐州", pinyin: "xuzhou", region: "江苏" },
    { code: "NTG", name: "南通", pinyin: "nantong", region: "江苏" },
    { code: "WUX", name: "无锡", pinyin: "wuxi", region: "江苏" },
    { code: "CZX", name: "常州", pinyin: "changzhou", region: "江苏" },
    { code: "YNZ", name: "盐城", pinyin: "yancheng", region: "江苏" },
    { code: "LYG", name: "连云港", pinyin: "lianyungang", region: "江苏" },
    // 浙江
    { code: "HGH", name: "杭州", pinyin: "hangzhou", region: "浙江" },
    { code: "NGB", name: "宁波", pinyin: "ningbo", region: "浙江" },
    { code: "WNZ", name: "温州", pinyin: "wenzhou", region: "浙江" },
    { code: "YIW", name: "义乌", pinyin: "yiwu", region: "浙江" },
    { code: "HSN", name: "舟山", pinyin: "zhoushan", region: "浙江" },
    { code: "HYN", name: "台州", pinyin: "taizhou", region: "浙江" },
    // 安徽
    { code: "HFE", name: "合肥", pinyin: "hefei", region: "安徽" },
    { code: "JUH", name: "池州", pinyin: "chizhou", region: "安徽" },
    { code: "WHA", name: "芜湖", pinyin: "wuhu", region: "安徽" },
    { code: "AQG", name: "安庆", pinyin: "anqing", region: "安徽" },
    { code: "TXN", name: "黄山", pinyin: "huangshan", region: "安徽" },
    // 福建
    { code: "FOC", name: "福州", pinyin: "fuzhou", region: "福建" },
    { code: "XMN", name: "厦门", pinyin: "xiamen", region: "福建" },
    { code: "JJN", name: "泉州", pinyin: "quanzhou", region: "福建" },
    { code: "SQJ", name: "三明", pinyin: "sanming", region: "福建" },
    { code: "WUS", name: "武夷山", pinyin: "wuyishan", region: "福建" },
    // 江西
    { code: "KHN", name: "南昌", pinyin: "nanchang", region: "江西" },
    { code: "KOW", name: "赣州", pinyin: "ganzhou", region: "江西" },
    { code: "JDZ", name: "景德镇", pinyin: "jingdezhen", region: "江西" },
    { code: "SQD", name: "上饶", pinyin: "shangrao", region: "江西" },
    { code: "YIC", name: "宜春", pinyin: "yichun", region: "江西" },
    { code: "JGS", name: "吉安", pinyin: "jian", region: "江西" },
    // 山东
    { code: "TNA", name: "济南", pinyin: "jinan", region: "山东" },
    { code: "TAO", name: "青岛", pinyin: "qingdao", region: "山东" },
    { code: "YNT", name: "烟台", pinyin: "yantai", region: "山东" },
    { code: "LYI", name: "临沂", pinyin: "linyi", region: "山东" },
    { code: "WEH", name: "威海", pinyin: "weihai", region: "山东" },
    { code: "WFG", name: "潍坊", pinyin: "weifang", region: "山东" },
    { code: "RIZ", name: "日照", pinyin: "rizhao", region: "山东" },
    // 河南
    { code: "CGO", name: "郑州", pinyin: "zhengzhou", region: "河南" },
    { code: "LYA", name: "洛阳", pinyin: "luoyang", region: "河南" },
    { code: "NNY", name: "南阳", pinyin: "nanyang", region: "河南" },
    { code: "XAI", name: "信阳", pinyin: "xinyang", region: "河南" },
    // 湖北
    { code: "WUH", name: "武汉", pinyin: "wuhan", region: "湖北" },
    { code: "YIH", name: "宜昌", pinyin: "yichang", region: "湖北" },
    { code: "ENH", name: "恩施", pinyin: "enshi", region: "湖北" },
    { code: "WDS", name: "十堰", pinyin: "shiyan", region: "湖北" },
    { code: "JZH", name: "荆州", pinyin: "jingzhou", region: "湖北" },
    // 湖南
    { code: "CSX", name: "长沙", pinyin: "changsha", region: "湖南" },
    { code: "DYG", name: "张家界", pinyin: "zhangjiajie", region: "湖南" },
    { code: "CGD", name: "常德", pinyin: "changde", region: "湖南" },
    { code: "HJJ", name: "怀化", pinyin: "huaihua", region: "湖南" },
    { code: "HNY", name: "衡阳", pinyin: "hengyang", region: "湖南" },
    { code: "HCZ", name: "郴州", pinyin: "chenzhou", region: "湖南" },
    // 广东
    { code: "CAN", name: "广州", pinyin: "guangzhou", region: "广东" },
    { code: "SZX", name: "深圳", pinyin: "shenzhen", region: "广东" },
    { code: "ZUH", name: "珠海", pinyin: "zhuhai", region: "广东" },
    { code: "SWA", name: "揭阳", pinyin: "jieyang", region: "广东" },
    { code: "ZHA", name: "湛江", pinyin: "zhanjiang", region: "广东" },
    { code: "MXZ", name: "梅州", pinyin: "meizhou", region: "广东" },
    { code: "HSC", name: "韶关", pinyin: "shaoguan", region: "广东" },
    // 广西
    { code: "NNG", name: "南宁", pinyin: "nanning", region: "广西" },
    { code: "KWL", name: "桂林", pinyin: "guilin", region: "广西" },
    { code: "BHY", name: "北海", pinyin: "beihai", region: "广西" },
    { code: "LZH", name: "柳州", pinyin: "liuzhou", region: "广西" },
    // 海南
    { code: "HAK", name: "海口", pinyin: "haikou", region: "海南" },
    { code: "SYX", name: "三亚", pinyin: "sanya", region: "海南" },
    { code: "XYI", name: "三沙", pinyin: "sansha", region: "海南" },
    // 重庆
    { code: "CKG", name: "重庆", pinyin: "chongqing", region: "重庆" },
    { code: "WXN", name: "万州", pinyin: "wanzhou", region: "重庆" },
    { code: "JIQ", name: "黔江", pinyin: "qianjiang", region: "重庆" },
    // 四川
    { code: "CTU", name: "成都", pinyin: "chengdu", region: "四川" },
    { code: "MIG", name: "绵阳", pinyin: "mianyang", region: "四川" },
    { code: "LZO", name: "泸州", pinyin: "luzhou", region: "四川" },
    { code: "YBP", name: "宜宾", pinyin: "yibin", region: "四川" },
    { code: "NAO", name: "南充", pinyin: "nanchong", region: "四川" },
    { code: "DAX", name: "达州", pinyin: "dazhou", region: "四川" },
    { code: "PZI", name: "攀枝花", pinyin: "panzhihua", region: "四川" },
    { code: "JZH", name: "九寨沟", pinyin: "jiuzhaigou", region: "四川" },
    { code: "DCY", name: "稻城亚丁", pinyin: "daochengyading", region: "四川" },
    // 贵州
    { code: "KWE", name: "贵阳", pinyin: "guiyang", region: "贵州" },
    { code: "ZYI", name: "遵义", pinyin: "zunyi", region: "贵州" },
    { code: "LLB", name: "荔波", pinyin: "libo", region: "贵州" },
    // 云南
    { code: "KMG", name: "昆明", pinyin: "kunming", region: "云南" },
    { code: "LJG", name: "丽江", pinyin: "lijiang", region: "云南" },
    { code: "JHG", name: "西双版纳", pinyin: "xishuangbanna", region: "云南" },
    { code: "DLU", name: "大理", pinyin: "dali", region: "云南" },
    { code: "LNJ", name: "临沧", pinyin: "lincang", region: "云南" },
    { code: "BSD", name: "保山", pinyin: "baoshan", region: "云南" },
    // 西藏
    { code: "LXA", name: "拉萨", pinyin: "lasa", region: "西藏" },
    { code: "NGQ", name: "阿里", pinyin: "ali", region: "西藏" },
    // 陕西
    { code: "XIY", name: "西安", pinyin: "xian", region: "陕西" },
    { code: "UYN", name: "榆林", pinyin: "yulin", region: "陕西" },
    { code: "ENY", name: "延安", pinyin: "yanan", region: "陕西" },
    { code: "HZG", name: "汉中", pinyin: "hanzhong", region: "陕西" },
    { code: "AKA", name: "安康", pinyin: "ankang", region: "陕西" },
    // 甘肃
    { code: "LHW", name: "兰州", pinyin: "lanzhou", region: "甘肃" },
    { code: "DNH", name: "敦煌", pinyin: "dunhuang", region: "甘肃" },
    { code: "JGN", name: "嘉峪关", pinyin: "jiayuguan", region: "甘肃" },
    // 青海
    { code: "XNN", name: "西宁", pinyin: "xining", region: "青海" },
    { code: "GOQ", name: "格尔木", pinyin: "geermu", region: "青海" },
    // 宁夏
    { code: "INC", name: "银川", pinyin: "yinchuan", region: "宁夏" },
    // 新疆
    { code: "URC", name: "乌鲁木齐", pinyin: "wulumuqi", region: "新疆" },
    { code: "KHG", name: "喀什", pinyin: "kashi", region: "新疆" },
    { code: "KRL", name: "库尔勒", pinyin: "kuerle", region: "新疆" },
    { code: "YIN", name: "伊宁", pinyin: "yining", region: "新疆" },
    { code: "AKU", name: "阿克苏", pinyin: "akesu", region: "新疆" },
    { code: "HTN", name: "和田", pinyin: "hetian", region: "新疆" },
    { code: "AAT", name: "阿勒泰", pinyin: "aletai", region: "新疆" },
    { code: "TLQ", name: "吐鲁番", pinyin: "tulufan", region: "新疆" },
    { code: "KRY", name: "克拉玛依", pinyin: "kelamayi", region: "新疆" },
    { code: "HMI", name: "哈密", pinyin: "hami", region: "新疆" },
  ],
  international: [
    // 日本
    { code: "HND", name: "东京", pinyin: "dongjing", region: "日本" },
    { code: "NRT", name: "东京成田", pinyin: "dongjingchengtian", region: "日本" },
    { code: "KIX", name: "大阪", pinyin: "daban", region: "日本" },
    { code: "NGO", name: "名古屋", pinyin: "mingguwu", region: "日本" },
    // 韩国
    { code: "ICN", name: "首尔", pinyin: "shouer", region: "韩国" },
    { code: "PUS", name: "釜山", pinyin: "fushan", region: "韩国" },
    // 新加坡
    { code: "SIN", name: "新加坡", pinyin: "xinjiapo", region: "新加坡" },
    // 泰国
    { code: "BKK", name: "曼谷", pinyin: "mangu", region: "泰国" },
    { code: "HKT", name: "普吉", pinyin: "puji", region: "泰国" },
    // 马来西亚
    { code: "KUL", name: "吉隆坡", pinyin: "jilongpo", region: "马来西亚" },
    { code: "BKI", name: "亚庇", pinyin: "yabi", region: "马来西亚" },
    // 越南
    { code: "HAN", name: "河内", pinyin: "henei", region: "越南" },
    { code: "SGN", name: "胡志明市", pinyin: "huzhimingshi", region: "越南" },
    // 菲律宾
    { code: "MNL", name: "马尼拉", pinyin: "manila", region: "菲律宾" },
    // 印度尼西亚
    { code: "CGK", name: "雅加达", pinyin: "yajiada", region: "印度尼西亚" },
    { code: "DPS", name: "巴厘岛", pinyin: "balidao", region: "印度尼西亚" },
    // 柬埔寨
    { code: "PNH", name: "金边", pinyin: "jinbian", region: "柬埔寨" },
    // 缅甸
    { code: "RGN", name: "仰光", pinyin: "yangguang", region: "缅甸" },
    // 印度
    { code: "DEL", name: "新德里", pinyin: "xindeli", region: "印度" },
    { code: "BOM", name: "孟买", pinyin: "mengmai", region: "印度" },
    // 阿联酋
    { code: "DXB", name: "迪拜", pinyin: "dibai", region: "阿联酋" },
    { code: "AUH", name: "阿布扎比", pinyin: "abuzhabi", region: "阿联酋" },
    // 卡塔尔
    { code: "DOH", name: "多哈", pinyin: "duoha", region: "卡塔尔" },
    // 土耳其
    { code: "IST", name: "伊斯坦布尔", pinyin: "yisitanbuer", region: "土耳其" },
    // 以色列
    { code: "TLV", name: "特拉维夫", pinyin: "telaweifu", region: "以色列" },
    // 英国
    { code: "LHR", name: "伦敦", pinyin: "lundun", region: "英国" },
    { code: "MAN", name: "曼彻斯特", pinyin: "manchesite", region: "英国" },
    // 法国
    { code: "CDG", name: "巴黎", pinyin: "bali", region: "法国" },
    { code: "NCE", name: "尼斯", pinyin: "nisi", region: "法国" },
    // 德国
    { code: "FRA", name: "法兰克福", pinyin: "falankefu", region: "德国" },
    { code: "MUC", name: "慕尼黑", pinyin: "munihei", region: "德国" },
    // 荷兰
    { code: "AMS", name: "阿姆斯特丹", pinyin: "amusitedan", region: "荷兰" },
    // 意大利
    { code: "FCO", name: "罗马", pinyin: "luoma", region: "意大利" },
    { code: "MXP", name: "米兰", pinyin: "milan", region: "意大利" },
    // 西班牙
    { code: "MAD", name: "马德里", pinyin: "madeli", region: "西班牙" },
    { code: "BCN", name: "巴塞罗那", pinyin: "basailuona", region: "西班牙" },
    // 希腊
    { code: "ATH", name: "雅典", pinyin: "yadian", region: "希腊" },
    // 瑞士
    { code: "ZRH", name: "苏黎世", pinyin: "sulishi", region: "瑞士" },
    // 奥地利
    { code: "VIE", name: "维也纳", pinyin: "weiyena", region: "奥地利" },
    // 俄罗斯
    { code: "SVO", name: "莫斯科", pinyin: "mosike", region: "俄罗斯" },
    { code: "LED", name: "圣彼得堡", pinyin: "shengbidebao", region: "俄罗斯" },
    // 美国
    { code: "JFK", name: "纽约肯尼迪", pinyin: "niuyuekennidi", region: "美国" },
    { code: "EWR", name: "纽瓦克", pinyin: "niuwa", region: "美国" },
    { code: "LAX", name: "洛杉矶", pinyin: "luoshanji", region: "美国" },
    { code: "ORD", name: "芝加哥", pinyin: "zhijiage", region: "美国" },
    { code: "DFW", name: "达拉斯", pinyin: "dalasi", region: "美国" },
    { code: "ATL", name: "亚特兰大", pinyin: "yatelanda", region: "美国" },
    { code: "SFO", name: "旧金山", pinyin: "jiujinshan", region: "美国" },
    { code: "MIA", name: "迈阿密", pinyin: "maiami", region: "美国" },
    // 加拿大
    { code: "YYZ", name: "多伦多", pinyin: "duolunduo", region: "加拿大" },
    { code: "YVR", name: "温哥华", pinyin: "wengehua", region: "加拿大" },
    { code: "YUL", name: "蒙特利尔", pinyin: "mengtelier", region: "加拿大" },
    // 墨西哥
    { code: "MEX", name: "墨西哥城", pinyin: "moxigecheng", region: "墨西哥" },
    { code: "CUN", name: "坎昆", pinyin: "kankun", region: "墨西哥" },
    // 澳大利亚
    { code: "SYD", name: "悉尼", pinyin: "xini", region: "澳大利亚" },
    { code: "MEL", name: "墨尔本", pinyin: "moerben", region: "澳大利亚" },
    { code: "BNE", name: "布里斯班", pinyin: "bulisiban", region: "澳大利亚" },
    { code: "PER", name: "珀斯", pinyin: "pos", region: "澳大利亚" },
    // 新西兰
    { code: "AKL", name: "奥克兰", pinyin: "aokelan", region: "新西兰" },
    { code: "CHC", name: "基督城", pinyin: "jiducheng", region: "新西兰" },
    // 巴西
    { code: "GRU", name: "圣保罗", pinyin: "shengbaoluo", region: "巴西" },
    { code: "GIG", name: "里约热内卢", pinyin: "liyuereineilu", region: "巴西" },
    // 阿根廷
    { code: "EZE", name: "布宜诺斯艾利斯", pinyin: "buyinuosuaisailisi", region: "阿根廷" },
    // 智利
    { code: "SCL", name: "圣地亚哥", pinyin: "shengdiyage", region: "智利" },
    // 巴拿马
    { code: "PTY", name: "巴拿马城", pinyin: "banamacheng", region: "巴拿马" },
    // 南非
    { code: "JNB", name: "约翰内斯堡", pinyin: "yuehanneisibao", region: "南非" },
    { code: "CPT", name: "开普敦", pinyin: "kaipu", region: "南非" },
    // 埃及
    { code: "CAI", name: "开罗", pinyin: "kailuo", region: "埃及" },
    // 肯尼亚
    { code: "NBO", name: "内罗毕", pinyin: "neiluobi", region: "肯尼亚" },
    // 埃塞俄比亚
    { code: "ADD", name: "亚的斯亚贝巴", pinyin: "yadesiyabeiba", region: "埃塞俄比亚" },
    // 摩洛哥
    { code: "CMN", name: "卡萨布兰卡", pinyin: "kasabulan", region: "摩洛哥" },
  ],
};

export const DOMESTIC_AIRLINES: { code: string; name: string; logo: string; color: string }[] = [
  { code: "CA", name: "中国国航", logo: "🇨🇳", color: "#E60012" },
  { code: "MU", name: "东方航空", logo: "🦅", color: "#1B3E8C" },
  { code: "CZ", name: "南方航空", logo: "🛫", color: "#005BAC" },
  { code: "HU", name: "海南航空", logo: "🌊", color: "#C8102E" },
  { code: "MF", name: "厦门航空", logo: "🦢", color: "#0066B3" },
  { code: "ZH", name: "深圳航空", logo: "✈️", color: "#D7000F" },
  { code: "FM", name: "上海航空", logo: "🌆", color: "#C8102E" },
  { code: "SC", name: "山东航空", logo: "🏔️", color: "#005BAC" },
  { code: "3U", name: "四川航空", logo: "🐼", color: "#E60012" },
  { code: "9C", name: "春秋航空", logo: "🍃", color: "#5BA826" },
  { code: "HO", name: "吉祥航空", logo: "🍀", color: "#C8102E" },
  { code: "GS", name: "天津航空", logo: "⛅", color: "#005BAC" },
];

export const INTERNATIONAL_AIRLINES: { code: string; name: string; logo: string; color: string }[] = [
  { code: "CA", name: "中国国航", logo: "🇨🇳", color: "#E60012" },
  { code: "JL", name: "日本航空", logo: "🗾", color: "#E60012" },
  { code: "NH", name: "全日空", logo: "🍣", color: "#134483" },
  { code: "KE", name: "大韩航空", logo: "🇰🇷", color: "#002569" },
  { code: "OZ", name: "韩亚航空", logo: "⭐", color: "#003B7C" },
  { code: "TG", name: "泰国航空", logo: "🇹🇭", color: "#5D2E8C" },
  { code: "SQ", name: "新加坡航空", logo: "🇸🇬", color: "#003876" },
  { code: "CX", name: "国泰航空", logo: "🇭🇰", color: "#006564" },
  { code: "EK", name: "阿联酋航空", logo: "🇦🇪", color: "#D71921" },
  { code: "QR", name: "卡塔尔航空", logo: "🇶🇦", color: "#5C0F3C" },
  { code: "AF", name: "法国航空", logo: "🇫🇷", color: "#002157" },
  { code: "BA", name: "英国航空", logo: "🇬🇧", color: "#075AAA" },
  { code: "LH", name: "汉莎航空", logo: "🇩🇪", color: "#05164D" },
  { code: "AA", name: "美国航空", logo: "🇺🇸", color: "#0078D2" },
  { code: "UA", name: "美联航", logo: "✈️", color: "#002244" },
  { code: "QF", name: "澳洲航空", logo: "🇦🇺", color: "#E4002B" },
];

export type FlightResult = {
  id: string;
  airline: string;
  airlineCode: string;
  logo: string;
  color: string;
  flightNo: string;
  aircraft: string;
  departTime: string;
  arriveTime: string;
  departAirport: string;
  arriveAirport: string;
  durationMin: number;
  price: number;
  cabin: "economy" | "business" | "first";
  seatsLeft: number;
  onTimeRate: number;
  stops: number;
  transferCity?: string;
};

export type FlightCabin = "economy" | "business" | "first";

export interface SearchFlightsParams {
  from: string;
  to: string;
  date: string;
  cabin: FlightCabin;
  cityTab: "domestic" | "international";
}

// 纯函数实现：给定参数返回模拟航班结果
export function searchFlights({ from, to, date, cabin, cityTab }: SearchFlightsParams): FlightResult[] {
  if (!date || from === to) return [];
  const isIntl =
    cityTab === "international" ||
    FLIGHT_CITY_DATA.international.some((city) => city.name === from || city.name === to);
  const airlines = isIntl ? INTERNATIONAL_AIRLINES : DOMESTIC_AIRLINES;
  const seedStr = `${from}${to}${date}${cabin}`;
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const rand = (min: number, max: number) => min + ((seed = (seed * 1103515245 + 12345) >>> 0) % (max - min + 1));
  const basePrice = cabin === "economy" ? 600 : cabin === "business" ? 2400 : 5800;
  const distanceFactor = isIntl ? 6 : 1.2;
  const cabinMultiplier = cabin === "economy" ? 1 : cabin === "business" ? 2.6 : 5.5;
  const directFlightCount = rand(0, 100) < (isIntl ? 48 : 76) ? rand(isIntl ? 1 : 2, isIntl ? 5 : 9) : 0;
  const transferFlightCount = rand(directFlightCount === 0 ? 3 : 1, isIntl ? 7 : 5);
  const flightCount = Math.min(airlines.length, directFlightCount + transferFlightCount);
  const shuffledAirlines = [...airlines].sort(() => rand(0, 2) - 1);
  const transferCities = (isIntl
    ? ["香港", "首尔", "东京", "新加坡", "曼谷", "迪拜", "多哈", "伊斯坦布尔"]
    : ["郑州", "武汉", "西安", "长沙", "重庆", "南京", "昆明", "厦门"]
  ).filter((city) => city !== from && city !== to);

  return Array.from({ length: flightCount }, (_, idx) => {
    const airline = shuffledAirlines[idx];
    const stops = idx < directFlightCount ? 0 : 1;
    const transferCity = stops > 0 ? transferCities[rand(0, transferCities.length - 1)] : undefined;
    const hour = 6 + Math.floor(rand(0, 15));
    const minute = Math.floor(rand(0, 11)) * 5;
    const dep = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    const durMin = 75 + Math.floor(rand(0, isIntl ? 420 : 190)) + (isIntl ? 300 : 0) + (stops ? rand(85, 210) : 0);
    const arrMin = hour * 60 + minute + durMin;
    const arrH = Math.floor(arrMin / 60) % 24;
    const arrM = arrMin % 60;
    const arr = `${String(arrH).padStart(2, "0")}:${String(arrM).padStart(2, "0")}`;
    const priceJitter = (idx + 1) * 30 + rand(0, 180) - (stops ? rand(40, 120) : 0);
    const price = Math.max(120, Math.round((basePrice + priceJitter) * distanceFactor * cabinMultiplier));
    return {
      id: `${airline.code}${1000 + idx}-${stops ? "T" : "D"}`,
      airline: airline.name,
      airlineCode: airline.code,
      logo: airline.logo,
      color: airline.color,
      flightNo: stops ? `${airline.code}${1000 + idx}/${airline.code}${2000 + idx}` : `${airline.code}${1000 + idx}`,
      aircraft: ["A320", "A330", "B737", "B777", "A350"][rand(0, 4)],
      departTime: dep,
      arriveTime: arr,
      departAirport: `${from}机场`,
      arriveAirport: `${to}机场`,
      durationMin: durMin,
      price,
      cabin,
      seatsLeft: rand(0, 12),
      onTimeRate: 80 + rand(0, 19),
      stops,
      transferCity,
    };
  });
}
