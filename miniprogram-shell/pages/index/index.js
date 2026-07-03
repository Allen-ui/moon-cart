const products = [
  { id: 1, title: "寿司治愈拼盘", price: 118, sales: "7.0万", emoji: "🍣", tag: "治愈好物" },
  { id: 2, title: "韩式炸鸡半半", price: 86, sales: "15.4万", emoji: "🍗", tag: "今日热卖" },
  { id: 3, title: "热辣螺蛳粉", price: 32, sales: "8.4万", emoji: "🍜", tag: "深夜精选" },
  { id: 4, title: "椰子鸡汤锅", price: 139, sales: "16.8万", emoji: "🍲", tag: "新品" },
  { id: 5, title: "茉莉奶绿", price: 23, sales: "9.2万", emoji: "🧋", tag: "快乐补给" },
  { id: 6, title: "云朵跑步鞋", price: 499, sales: "3.1万", emoji: "👟", tag: "快乐补给" },
  { id: 7, title: "降噪头戴耳机", price: 799, sales: "2.8万", emoji: "🎧", tag: "深夜精选" },
  { id: 8, title: "香薰蜡烛套装", price: 128, sales: "6.6万", emoji: "🕯", tag: "放心买" }
];

function splitProducts(start) {
  const result = [];
  for (let index = start; index < products.length; index += 2) {
    result.push(products[index]);
  }
  return result;
}

function findProduct(id) {
  for (let index = 0; index < products.length; index += 1) {
    if (products[index].id === id) return products[index];
  }
  return products[0];
}

Page({
  data: {
    view: "home",
    products,
    leftProducts: splitProducts(0),
    rightProducts: splitProducts(1),
    cart: [],
    cartTotal: 0,
    cartCount: 0,
    selected: products[0],
    orderAmount: 0,
    deliveryText: "快乐生成",
    totalSpend: 0,
    happyCount: 0,
    viewedCount: 0,
    badgeCount: 0
  },

  onLoad() {
    const stats = wx.getStorageSync("moonCartStats") || {};
    this.setData({
      totalSpend: stats.totalSpend || 0,
      happyCount: stats.happyCount || 0,
      viewedCount: stats.viewedCount || 0,
      badgeCount: stats.happyCount > 0 ? 1 : 0
    });
  },

  openList() {
    this.setData({ view: "list" });
  },

  openMine() {
    this.setData({ view: "mine" });
  },

  openCart() {
    this.setData({ view: "cart" });
  },

  goHome() {
    this.setData({ view: "home" });
  },

  openDetail(event) {
    const product = findProduct(Number(event.currentTarget.dataset.id));
    const viewedCount = this.data.viewedCount + 1;
    this.persistStats({ viewedCount });
    this.setData({ selected: product, viewedCount, view: "detail" });
  },

  addToCart() {
    const selected = this.data.selected;
    const cart = this.data.cart.slice();
    let found = null;
    for (let index = 0; index < cart.length; index += 1) {
      if (cart[index].id === selected.id) {
        found = cart[index];
        break;
      }
    }
    if (found) {
      found.quantity += 1;
    } else {
      cart.push({
        id: selected.id,
        title: selected.title,
        price: selected.price,
        sales: selected.sales,
        emoji: selected.emoji,
        tag: selected.tag,
        quantity: 1
      });
    }
    this.setData({ cart, cartTotal: this.sumCart(cart), cartCount: this.countCart(cart) });
    wx.showToast({ title: "已放入心愿袋", icon: "success" });
  },

  removeItem(event) {
    const id = Number(event.currentTarget.dataset.id);
    const cart = [];
    for (let index = 0; index < this.data.cart.length; index += 1) {
      if (this.data.cart[index].id !== id) cart.push(this.data.cart[index]);
    }
    this.setData({ cart, cartTotal: this.sumCart(cart), cartCount: this.countCart(cart) });
  },

  startOrder(event) {
    const amount = Number(event.currentTarget.dataset.amount || this.data.selected.price);
    const self = this;
    this.setData({ view: "order", orderAmount: amount, deliveryText: "快乐生成" });
    setTimeout(function () {
      self.runDelivery();
    }, 1200);
  },

  runDelivery() {
    const steps = ["心愿确认", "快乐打包", "情绪充电", "正在靠近", "快乐值 +20", "快乐值 +60", "快乐值 +100", "已送达"];
    let index = 0;
    const self = this;
    this.setData({ view: "delivery" });
    const timer = setInterval(function () {
      self.setData({ deliveryText: steps[index] });
      index += 1;
      if (index >= steps.length) {
        clearInterval(timer);
        setTimeout(function () {
          self.completeOrder();
        }, 600);
      }
    }, 900);
  },

  completeOrder() {
    const totalSpend = this.data.totalSpend + this.data.orderAmount;
    const happyCount = this.data.happyCount + 1;
    this.persistStats({ totalSpend, happyCount });
    this.setData({ totalSpend, happyCount, badgeCount: 1, cart: [], cartTotal: 0, cartCount: 0, view: "done" });
  },

  persistStats(next) {
    const stats = {
      totalSpend: next.totalSpend === undefined ? this.data.totalSpend : next.totalSpend,
      happyCount: next.happyCount === undefined ? this.data.happyCount : next.happyCount,
      viewedCount: next.viewedCount === undefined ? this.data.viewedCount : next.viewedCount
    };
    wx.setStorageSync("moonCartStats", stats);
  },

  sumCart(cart) {
    let sum = 0;
    for (let index = 0; index < cart.length; index += 1) {
      sum += cart[index].price * cart[index].quantity;
    }
    return sum;
  },

  countCart(cart) {
    let count = 0;
    for (let index = 0; index < cart.length; index += 1) {
      count += cart[index].quantity;
    }
    return count;
  }
});
