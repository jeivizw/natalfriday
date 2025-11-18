// ================================================
// Arquivo: script.js
// Objetivo: controlar animações, contador natalino e carregamento de produtos.
// ================================================

// ------------------------------------------------------------------------
// 1. CONTADOR REGRESSIVO (Natal)
// ------------------------------------------------------------------------

const nowSetup = new Date();
let currentYear = nowSetup.getFullYear();

// Mês 11 é Dezembro. Definido para dia 25 à meia-noite
let countdownDate = new Date(currentYear, 11, 25, 0, 0, 0);

if (nowSetup > countdownDate) {
    countdownDate = new Date(currentYear + 1, 11, 25, 0, 0, 0);
}

function updateCountdown() {
  const now = new Date().getTime();
  const distance = countdownDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  const elDays = document.getElementById('days');
  const elHours = document.getElementById('hours');
  const elMinutes = document.getElementById('minutes');
  const elSeconds = document.getElementById('seconds');

  if (elDays) elDays.textContent = String(days).padStart(2, '0');
  if (elHours) elHours.textContent = String(hours).padStart(2, '0');
  if (elMinutes) elMinutes.textContent = String(minutes).padStart(2, '0');
  if (elSeconds) elSeconds.textContent = String(seconds).padStart(2, '0');

  if (distance < 0) {
    if (elDays) elDays.textContent = '00';
    if (elHours) elHours.textContent = '00';
    if (elMinutes) elMinutes.textContent = '00';
    if (elSeconds) elSeconds.textContent = '00';
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);


// ------------------------------------------------------------------------
// 2. ANIMAÇÃO DE FUNDO (Flocos de Neve)
// ------------------------------------------------------------------------

const canvas = document.getElementById('particles-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

if (ctx) {
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = Math.max(document.body.scrollHeight, window.innerHeight);
  }
  resizeCanvas();

  const snowflakes = [];
  const snowflakeCount = 150;

  class Snowflake {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.radius = Math.random() * 3 + 1; 
      this.vy = Math.random() * 1 + 0.5 + (this.radius * 0.5);
      this.vx = (Math.random() - 0.5) * 0.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y > canvas.height) {
        this.y = -this.radius;
        this.x = Math.random() * canvas.width;
      }
      if (this.x > canvas.width) this.x = 0;
      if (this.x < 0) this.x = canvas.width;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.radius / 4})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < snowflakeCount; i++) {
    snowflakes.push(new Snowflake());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snowflakes.forEach(snowflake => {
      snowflake.update();
      snowflake.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', resizeCanvas);
  const resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(document.body);
  
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(resizeCanvas, 100);
  });
}


// ------------------------------------------------------------------------
// 3. FUNÇÕES AUXILIARES E PRODUTOS
// ------------------------------------------------------------------------

function formatBRL(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(message) {
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed; top: 20px; right: 20px; background: #27ae60;
    color: white; padding: 15px 25px; border-radius: 8px; font-weight: bold;
    z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.3); animation: slideIn 0.3s ease;
  `;
  document.body.appendChild(messageDiv);
  setTimeout(() => {
    messageDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => messageDiv.remove(), 300);
  }, 2000);
}

function attachBuyButtonHandlers() {
  document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', function() {
      const productName = this.closest('.product-card').querySelector('.product-name').textContent;
      showToast(`${productName} adicionado ao carrinho!`);
    });
  });
}

function renderProducts(products) {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;

  grid.innerHTML = '';
  
  // Mostra TODOS os produtos (sem slice)
  const items = products; 

  items.forEach(p => {
    // 1. Normaliza os preços (transforma texto '10,50' em número 10.50)
    const oldPrice = parseFloat(String(p.old_price || 0).replace(',', '.'));
    const newPrice = parseFloat(String(p.new_price || 0).replace(',', '.'));
    
    // 2. Lógica do Desconto:
    // Se existir o campo 'discount' no banco, usa ele.
    // Se não, calcula: ((Antigo - Novo) / Antigo) * 100
    let discountValue = 0;
    
    if (p.discount) {
        discountValue = p.discount;
    } else if (oldPrice > 0 && newPrice >= 0) {
        discountValue = ((oldPrice - newPrice) / oldPrice) * 100;
    }
    
    // Arredonda e evita números negativos
    const finalDiscount = Math.max(0, Math.round(discountValue));

    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <span>${escapeHtml(p?.emoji || '🎁')}</span>
        <div class="discount-badge">-${finalDiscount}%</div>
      </div>
      <div class="product-info">
        <h3 class="product-name">${escapeHtml(p?.name || 'Produto')}</h3>
        <div class="price-container">
          <span class="old-price">${formatBRL(oldPrice)}</span>
          <span class="new-price">${formatBRL(newPrice)}</span>
        </div>
        <button class="buy-button">Comprar Agora</button>
      </div>
    `;
    grid.appendChild(card);
  });

  attachBuyButtonHandlers();
}

async function loadProducts() {
  const mockProducts = [
    { name: 'Panetone Trufado', old_price: 35, new_price: 24, emoji: '🍞' },
    { name: 'Luzes de Natal', old_price: 50, new_price: 30, emoji: '💡' },
    { name: 'Árvore de Natal', old_price: 150, new_price: 90, emoji: '🎄' },
    { name: 'Kit Decoração Bolas', old_price: 40, new_price: 20.00, emoji: '🔮' },
    { name: 'Presente Surpresa', old_price: 100, new_price: 65, emoji: '🎁' },
  ];

  try {
    const { createClient } = window.supabase || {};
    const cfg = window.__SUPABASE || {};
    
    if (typeof createClient === 'function' && cfg.url && cfg.anonKey) {
      const client = createClient(cfg.url, cfg.anonKey);
      
      const { data, error } = await client
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20); // Limite aumentado para garantir que todos apareçam

      if (error) throw error;
      if (Array.isArray(data) && data.length) {
        renderProducts(data);
        return;
      }
    }
  } catch (errSupabase) {
    console.warn('Falha ao consultar Supabase, usando mock:', errSupabase);
  }

  renderProducts(mockProducts);
  showToast('Modo demonstração ativado.');
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

const toastStyle = document.createElement('style');
toastStyle.textContent = `
  @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } }
`;
document.head.appendChild(toastStyle);