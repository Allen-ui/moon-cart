"use client";

import { Centered } from "./Centered";

export function EmptyCart({ onShop }: { onShop: () => void }) {
  return (
    <Centered>
      <div className="text-6xl">🛒</div>
      <h2 className="mt-6 text-2xl font-semibold">购物车还是空的</h2>
      <p className="mt-3 text-quiet">先把今晚想买的快乐放进来。</p>
      <button
        className="mt-8 rounded-full bg-primary px-8 py-4 font-semibold text-white shadow-soft"
        onClick={onShop}
      >
        继续逛逛
      </button>
    </Centered>
  );
}
