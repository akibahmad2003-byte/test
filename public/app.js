const productsEl = document.getElementById('products');
const cartCountEl = document.getElementById('cart-count');
const viewCartBtn = document.getElementById('view-cart');
const cartEl = document.getElementById('cart');
const cartItemsEl = document.getElementById('cart-items');
const checkoutBtn = document.getElementById('checkout');
const closeCartBtn = document.getElementById('close-cart');

async function fetchProducts() {
  const res = await fetch('/api/products');
  return res.json();
}

async function fetchCart() {
  const res = await fetch('/api/cart');
  return res.json();
}

function renderProducts(list) {
  productsEl.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image || 'https://picsum.photos/300/200'}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p class="desc">${p.description || ''}</p>
      <div class="foot">
        <strong>$${p.price.toFixed(2)}</strong>
        <button data-id="${p.id}">Add</button>
      </div>
    `;
    productsEl.appendChild(card);
  });
}

async function init() {
  const list = await fetchProducts();
  renderProducts(list);
  updateCartCount();

  productsEl.addEventListener('click', async (ev) => {
    if (ev.target.tagName === 'BUTTON') {
      const id = ev.target.dataset.id;
      await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: Number(id), qty: 1 }) });
      updateCartCount();
    }
  });

  viewCartBtn.addEventListener('click', showCart);
  closeCartBtn.addEventListener('click', () => cartEl.classList.add('hidden'));
  checkoutBtn.addEventListener('click', async () => {
    const res = await fetch('/api/checkout', { method: 'POST' });
    const data = await res.json();
    alert(data.message || JSON.stringify(data));
    updateCartCount();
    cartEl.classList.add('hidden');
  });
}

async function updateCartCount() {
  const cart = await fetchCart();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  cartCountEl.textContent = count;
}

async function showCart() {
  const cart = await fetchCart();
  cartItemsEl.innerHTML = '';
  if (!cart.length) cartItemsEl.textContent = 'Your cart is empty.';
  else {
    cart.forEach(i => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `<span>${i.title} x ${i.qty}</span> <strong>$${(i.price * i.qty).toFixed(2)}</strong>`;
      cartItemsEl.appendChild(div);
    });
  }
  cartEl.classList.remove('hidden');
}

init();
