let cart = [];
let globalHistoricalItems = []; 
let currentProducts = [];
let activeProduct = null;
let assignedAutoSeat = null;
const API_BASE_URL = 'http://localhost:8081';

const commonToppings = [
    { id: '練乳シロップ', name: '練乳シロップ', price: 100 },
    { id: 'はちみつシロップ', name: 'はちみつシロップ', price: 100 },
    { id: 'ブルーベリーソース', name: 'ブルーベリーソース', price: 120 },
    { id: 'チョコレートソース', name: 'チョコレートソース', price: 120 }
];

const categoryToppings = {
    Ice: [...commonToppings, { id: 'いちご果肉', name: 'いちごトッピング', price: 150 }, { id: 'バニラアイス', name: 'バニラアイス添え', price: 150 }],
    Snack: [{ id: '大盛り', name: '大盛り (Extra Large)', price: 150 }, { id: 'チーズ', name: '追加チーズ', price: 100 }]
};

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    setupSearch();
    loadCartSessionState();
    fetchProducts();
    checkLiveSeatAvailability();
    fetchSiteSettings();
});

function fetchSiteSettings() {
    const bannerEl = document.getElementById('dynamicPromoBannerText');
    if (bannerEl) bannerEl.textContent = "Welcome to Hana Koori!";
}

// Optimized Parallax Effect
window.addEventListener('scroll', () => {
    window.requestAnimationFrame(() => {
        document.querySelectorAll('.product-item-card').forEach(card => {
            let speed = 0.05;
            let yPos = -(window.pageYOffset * speed);
            card.style.transform = `translateY(${yPos}px)`;
        });
    });
});

function loadCartSessionState() {
    const savedCart = localStorage.getItem('kakigori_cart');
    if (savedCart) { cart = JSON.parse(savedCart); updateCartUI(); }
    const savedHistory = localStorage.getItem('kakigori_history');
    if (savedHistory) { globalHistoricalItems = JSON.parse(savedHistory); }
    const savedSeat = localStorage.getItem('kakigori_assigned_seat');
    if (savedSeat) { assignedAutoSeat = parseInt(savedSeat); }
}

function checkLiveSeatAvailability() {
    const orderTypeEl = document.getElementById("orderType");
    if (!orderTypeEl) return;
    const orderType = orderTypeEl.value;
    const seatRow = document.getElementById("seatRow");
    const statusBox = document.getElementById("seatAssignmentStatus");
    const checkoutBtn = document.querySelector(".summary-sticky .payment-action-btn");

    if (orderType !== "Eat-in") {
        if (seatRow) seatRow.style.display = "none";
        assignedAutoSeat = null;
        if (checkoutBtn) checkoutBtn.disabled = false;
        return;
    }

    if (seatRow) seatRow.style.display = "block";
    
    assignedAutoSeat = 1; 
    if (statusBox) {
        statusBox.innerHTML = `<i class="fa-solid fa-location-dot"></i> テーブル ${assignedAutoSeat}`;
        statusBox.style.color = "var(--secondary-color)";
        statusBox.style.background = "rgba(124, 179, 66, 0.1)";
        statusBox.style.borderColor = "rgba(124, 179, 66, 0.3)";
    }
    if (checkoutBtn) checkoutBtn.disabled = false;
}

function toggleSeatSelect() { checkLiveSeatAvailability(); }

function fetchProducts() {
    fetch(`${API_BASE_URL}/api/products`)
        .then(res => res.json())
        .then(data => { 
            currentProducts = data; 
            loadResponsiveMenu(data); 
        })
        .catch(() => { 
            document.getElementById('menuContainer').innerHTML = '<div class="error-state">Failed to load products</div>'; 
        });
}

function filterMenu(category, btnElement) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');
    
    let filtered = currentProducts;
    if (category !== 'All') { 
        // Handles 'Ice' -> 'kakigori' and 'Snack' -> 'snacks' matching
        filtered = currentProducts.filter(p => {
            const cat = p.Category.toLowerCase();
            if (category === 'Ice') return cat === 'ice' || cat === 'kakigori';
            if (category === 'Snack') return cat === 'snack' || cat === 'snacks';
            return cat === category.toLowerCase();
        }); 
    }
    
    const container = document.getElementById("menuContainer");
    container.style.opacity = '0'; 
    
    setTimeout(() => {
        if (filtered.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: white; border-radius: 16px; border: 1px dashed #ccc;"><i class="fa-solid fa-box-open" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 16px;"></i><h3 style="color: var(--text-muted);">現在、このカテゴリーには商品がありません。</h3></div>`;
        } else {
            loadResponsiveMenu(filtered);
        }
        container.style.opacity = '1'; 
    }, 200);
}

function loadResponsiveMenu(dataToDisplay = currentProducts) {
    const container = document.getElementById("menuContainer");
    container.innerHTML = "";

    if (!dataToDisplay || dataToDisplay.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: white; border-radius: 16px; border: 1px dashed #ccc;"><i class="fa-solid fa-box-open" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 16px;"></i><h3 style="color: var(--text-muted);">現在、このカテゴリーには商品がありません。</h3></div>`;
        return;
    }

    dataToDisplay.forEach((item, index) => {
        const isAvailable = item.IsAvailable === true;
        const card = document.createElement("button");
        card.className = `product-item-card${isAvailable ? '' : ' unavailable'}`;
        card.disabled = !isAvailable;
        card.style.animationDelay = `${index * 0.05}s`; 
        card.onclick = () => openProductDetail(item.MenuID); 

        card.innerHTML = `
            <div class="item-image-placeholder">
                <i class="fa-solid fa-image" style="font-size:3rem; color:#cbd5e1;"></i>
            </div>
            <div class="product-info">
                <h4>${escapeHtml(item.Name)}</h4> 
                <p class="price">¥${item.Price}</p> 
            </div>
            <span class="view-product-btn">${isAvailable ? '注文・カスタマイズ (Order / Customize)' : '売切 (Sold Out)'}</span>
        `;
        container.appendChild(card);
    });
}

function openProductDetail(menuId) {
    const product = currentProducts.find(item => parseInt(item.MenuID) === parseInt(menuId));
    if (!product || product.IsAvailable !== true) return;

    activeProduct = product;
    document.getElementById('detailProductName').textContent = product.Name; 
    document.getElementById('detailProductDescription').textContent = ''; 
    document.getElementById('detailBasePrice').textContent = product.Price; 
    document.getElementById('detailQuantity').value = 1;
    
    const imgEl = document.getElementById('detailProductImage');
    imgEl.innerHTML = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#f1f5f9;"><i class="fa-solid fa-image" style="font-size:4rem; color:#cbd5e1;"></i></div>`;

    const toppingContainer = document.getElementById('detailToppingOptions');
    const toppings = categoryToppings[product.Category] || commonToppings;
    
    toppingContainer.innerHTML = toppings.map(t => `
        <label style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer;">
            <div style="display: flex; gap: 12px; align-items: center;">
                <input type="checkbox" value="${escapeHtml(t.id)}" data-name="${escapeHtml(t.name)}" data-price="${t.price}" onchange="updateDetailTotal()" style="transform: scale(1.2); accent-color: var(--primary-color);">
                <span style="font-weight: 500;">${escapeHtml(t.name)}</span>
            </div>
            <small style="color: var(--primary-color); font-weight: 600;">+¥${t.price}</small>
        </label>
    `).join('');
    
    updateDetailTotal();
    document.getElementById('productDetailModal').style.display = 'block';
}

function closeProductDetailModal() { document.getElementById('productDetailModal').style.display = 'none'; }

function changeDetailQuantity(amt) {
    const input = document.getElementById('detailQuantity');
    input.value = Math.max(1, parseInt(input.value) + amt);
    updateDetailTotal();
}

function updateDetailTotal() {
    if (!activeProduct) return;
    const qty = parseInt(document.getElementById('detailQuantity').value);
    let toppingSum = 0;
    document.querySelectorAll('#detailToppingOptions input:checked').forEach(i => {
        toppingSum += parseInt(i.getAttribute('data-price'));
    });
    const unit = parseInt(activeProduct.Price) + toppingSum;
    document.getElementById('detailUnitPrice').textContent = unit;
    document.getElementById('detailTotalPrice').textContent = unit * qty;
}

function addDetailProductToCart() {
    if (!activeProduct) return;
    
    const sourceElement = document.querySelector('#detailProductImage img') || document.querySelector('#detailProductImage i');
    if (sourceElement) {
        animateItemToCart(sourceElement);
    }

    const qty = parseInt(document.getElementById('detailQuantity').value);
    
    const payload = {
        product_id: activeProduct.MenuID,
        quantity: qty
    };

    fetch(`${API_BASE_URL}/api/cart`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
    })
    .then(res => res.json())
    .then(updatedCartBackend => {
        // Map Go nested structs to standard frontend structural loop tracking
        cart = updatedCartBackend.map(item => ({
            cart_id: `${item.Product.MenuID}-${Date.now()}`,
            menu_id: item.Product.MenuID,
            name: item.Product.Name,
            price: item.Product.Price,
            quantity: item.Quantity
        }));
        
        updateCartUI();
        localStorage.setItem('kakigori_cart', JSON.stringify(cart));
        
        closeProductDetailModal();
        showToast(`${activeProduct.Name} をカートに追加しました`, 'success');
        
        const cartIcon = document.querySelector('.cart-card h3 i');
        if(cartIcon) {
            cartIcon.classList.remove('cart-pulse');
            void cartIcon.offsetWidth; 
            cartIcon.classList.add('cart-pulse');
        }
    })
    .catch(() => showToast("Failed to register item to backend", "error"));
}

function animateItemToCart(element) {
    const clone = element.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.zIndex = '9999';
    clone.style.pointerEvents = 'none';
    
    const rect = element.getBoundingClientRect();
    clone.style.left = rect.left + 'px';
    clone.style.top = rect.top + 'px';
    clone.style.width = '80px'; 
    clone.style.borderRadius = '50%';
    document.body.appendChild(clone);

    const cartIcon = document.querySelector('.cart-card h3 i');
    if (!cartIcon) { clone.remove(); return; }
    const targetRect = cartIcon.getBoundingClientRect();

    clone.animate([
        { transform: 'scale(1)', opacity: 1 },
        { transform: `scale(0.2) translate(${(targetRect.left - rect.left)}px, ${(targetRect.top - rect.top)}px)`, opacity: 0 }
    ], { duration: 800, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }).onfinish = () => clone.remove();
}

function updateCartUI() {
    const container = document.getElementById('cartItems');
    let total = 0, count = 0;
    
    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); margin-top: 40px;"><i class="fa-solid fa-basket-shopping" style="font-size: 3rem; opacity: 0.2; margin-bottom: 12px;"></i><p>カートは空です</p></div>`;
    } else {
        container.innerHTML = cart.map(item => {
            total += item.price * item.quantity;
            count += item.quantity;
            return `
                <div class="cart-item">
                    <div>
                        <h4 style="margin-bottom: 4px;">${escapeHtml(item.name)}</h4>
                        <p style="color: var(--primary-text); font-weight: 600; font-size: 0.85rem;">¥${item.price} × ${item.quantity}</p>
                    </div>
                    <button class="remove-btn" onclick="dropItem('${item.cart_id}')"><i class="fas fa-trash"></i></button>
                </div>
            `;
        }).join('');
    }
    document.getElementById('cartCount').textContent = count;
    document.getElementById('finalCartTotal').textContent = total;
}

function dropItem(id) {
    const targetItem = cart.find(i => i.cart_id === id);
    if (!targetItem) return;

    fetch(`${API_BASE_URL}/api/cart/${targetItem.menu_id}`, {
        method: 'DELETE'
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to remove item from server");
        return res.json();
    })
    .then(updatedCartBackend => {
        cart = cart.filter(i => i.cart_id !== id);
        updateCartUI();
        localStorage.setItem('kakigori_cart', JSON.stringify(cart));
        showToast("アイテムを削除しました", "success");
    })
    .catch(() => {
        showToast("Failed to remove item from server session", "error");
    });
}

function submitOrderRound() {
    if (cart.length === 0) { showToast('カートが空です (Cart is empty)', 'error'); return; }
    const orderType = document.getElementById("orderType").value;
    if (orderType === "Eat-in" && assignedAutoSeat === null) { showToast('席を確認できません (No seat assigned)', 'error'); return; }
    
    globalHistoricalItems = [...cart];
    localStorage.setItem('kakigori_history', JSON.stringify(globalHistoricalItems));
    
    fetch(`${API_BASE_URL}/api/cart/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(() => {
        cart = [];
        localStorage.removeItem('kakigori_cart');
        updateCartUI();
        
        showOrderVideoModal();
    })
    .catch(() => {
        showToast("Failed to sync clear action with the server backend", "error");
    });
}

function showOrderVideoModal() {
    const videoModal = document.getElementById('orderVideoModal');
    const videoEl = document.getElementById('orderPrepVideo');
    const textEl = document.getElementById('orderVideoText');

    if (textEl) textEl.style.opacity = '0';
    if (videoModal) videoModal.style.display = 'block';

    if (videoEl) {
        videoEl.currentTime = 0;
        let playPromise = videoEl.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => { if (textEl) textEl.style.opacity = '1'; });
        }
    }
    setTimeout(() => { if (textEl) textEl.style.opacity = '1'; }, 3500);
}

function proceedToBillFromVideo() {
    const videoEl = document.getElementById('orderPrepVideo');
    if (videoEl) videoEl.pause();
    document.getElementById('orderVideoModal').style.display = 'none';
    switchToCheckoutWorkspace();
}

function switchToCheckoutWorkspace() {
    document.getElementById('menuWorkspaceArea').style.display = 'none';
    document.getElementById('sidebarControlWorkspace').style.display = 'none';
    
    const coContainer = document.getElementById('checkoutItemsList');
    coContainer.innerHTML = globalHistoricalItems.map(i => `
        <div style="display:flex; justify-content:space-between; padding:16px; border-bottom:1px solid #eee;">
            <div><strong style="color: var(--text-dark);">${escapeHtml(i.name)}</strong><br><small style="color: var(--text-muted);">¥${i.price} × ${i.quantity}</small></div>
            <strong style="align-self:center; font-size: 1.1rem;">¥${i.price * i.quantity}</strong>
        </div>
    `).join('');
    
    document.getElementById('checkoutWorkspaceArea').style.display = 'block';
    recalculateCheckoutInvoice();
}

function returnToMenuScreen() {
    document.getElementById('checkoutWorkspaceArea').style.display = 'none';
    document.getElementById('menuWorkspaceArea').style.display = 'flex';
    document.getElementById('sidebarControlWorkspace').style.display = 'flex';
}

function togglePromoInputRow() {
    const isChecked = document.getElementById('hasPromoCheckbox').checked;
    document.getElementById('checkoutPromoRow').style.display = isChecked ? 'flex' : 'none';
    if (!isChecked) {
        localStorage.removeItem('active_co_promo');
        document.getElementById('checkoutPromoCode').value = '';
        document.getElementById('checkoutPromoMessage').textContent = '';
        recalculateCheckoutInvoice();
    }
}

function applyCheckoutPromoCode() {
    const code = document.getElementById('checkoutPromoCode').value.trim();
    if (!code) return;
    
    localStorage.removeItem('active_co_promo');
    document.getElementById('checkoutPromoMessage').textContent = `✓ Active Discount Checked`;
    showToast('プロモーションを適用しました！', 'success');
    recalculateCheckoutInvoice();
}

function recalculateCheckoutInvoice() {
    const subtotal = globalHistoricalItems.reduce((s, i) => s + (i.price * i.quantity), 0);
    document.getElementById('coSubtotal').textContent = subtotal;
    document.getElementById('coDiscount').textContent = 0;
    document.getElementById('coGrandTotal').textContent = subtotal;
}

function finalizeCheckoutSession() {
    const grandTotal = parseInt(document.getElementById('coGrandTotal').textContent);
    const orderType = document.getElementById("orderType").value;
    const activeBillId = `TX-${Date.now().toString().slice(-6)}`;

    document.getElementById('frBillId').textContent = activeBillId;
    document.getElementById('frType').textContent = orderType === "Eat-in" ? "店内飲食" : "テイクアウト";
    document.getElementById('frSeat').textContent = assignedAutoSeat ? `テーブル ${assignedAutoSeat}` : "なし";
    document.getElementById('frTotal').textContent = grandTotal;
    
    document.getElementById('frItemsList').innerHTML = globalHistoricalItems.map(i => `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; border-bottom: 1px dotted #ccc; padding-bottom: 4px;">
            <span>${escapeHtml(i.name)} <small>x${i.quantity}</small></span>
            <span>¥${i.price * i.quantity}</span>
        </div>
    `).join('');
    
    document.getElementById('finalReceiptModal').style.display = 'block';
}

function clearSessionAndReload() { localStorage.clear(); window.location.reload(); }
function resetOrderSession() { if (confirm("Clear active cart and session?")) { clearSessionAndReload(); } }

function setupSearch() {
    const input = document.querySelector('.search-bar input');
    if (!input) return;
    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (!query) { loadResponsiveMenu(currentProducts); return; }
        const filtered = currentProducts.filter(i => i.Name.toLowerCase().includes(query) || (i.Category && i.Category.toLowerCase().includes(query)));
        loadResponsiveMenu(filtered);
    });
}
function escapeHtml(v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function promptManagerAccess(e) { e.preventDefault(); document.getElementById('securityGateModal').style.display = 'flex'; }
function verifyManagerCode() {
    if (document.getElementById('gatePasscodeInput').value === "0000") { window.location.href = "manager.html"; } 
    else { showToast("Passcode incorrect", "error"); }
}


