/**
 * ShopScreen.js — 道具商店 UI
 * 玩家以累積金幣購買道具，道具於遊戲中可使用
 * @module ShopScreen
 */

import {
  SHOP_ITEMS,
  getCoins,
  spendCoins,
  addItem,
  getInventory,
} from '../data/CoinStorage.js';

export class ShopScreen {
  /**
   * @param {HTMLElement} container - #screen-shop 元素
   */
  constructor(container) {
    this._el      = container;
    this._coinsEl = container.querySelector('#shop-coins');
    this._gridEl  = container.querySelector('#shop-items');
    this._backBtn = container.querySelector('#btn-back-from-shop');

    this._backBtn.addEventListener('click', () =>
      document.dispatchEvent(new CustomEvent('nav:home'))
    );
  }

  /** 顯示商店畫面（每次進入重新渲染以更新餘額/庫存） */
  show() {
    this._render();
  }

  _render() {
    const coins = getCoins();
    const inv   = getInventory();
    this._coinsEl.textContent = `💰 ${coins} 金幣`;

    this._gridEl.innerHTML = SHOP_ITEMS.map(item => `
      <div class="shop-item">
        <div class="shop-item-icon">${item.icon}</div>
        <div class="shop-item-body">
          <div class="shop-item-name">${item.name}</div>
          <div class="shop-item-desc">${item.desc}</div>
        </div>
        <div class="shop-item-action">
          <span class="shop-item-price">💰 ${item.price}</span>
          <span class="shop-item-stock">庫存 <b>${inv[item.id] || 0}</b></span>
          <button class="btn btn--primary shop-buy-btn"
            data-id="${item.id}" data-price="${item.price}"
            ${coins < item.price ? 'disabled' : ''}>購買</button>
        </div>
      </div>
    `).join('');

    this._gridEl.querySelectorAll('.shop-buy-btn').forEach(btn => {
      btn.addEventListener('click', () =>
        this._onBuy(btn.dataset.id, Number(btn.dataset.price))
      );
    });
  }

  _onBuy(itemId, price) {
    if (!spendCoins(price)) {
      this._toast('💔 金幣不足！');
      return;
    }
    addItem(itemId);
    this._toast('🎉 購買成功！');
    this._render();
  }

  _toast(msg) {
    const t = document.createElement('div');
    t.className   = 'shop-toast';
    t.textContent = msg;
    this._el.appendChild(t);
    setTimeout(() => t.remove(), 1800);
  }
}
