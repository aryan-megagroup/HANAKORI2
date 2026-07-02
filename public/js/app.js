let cart = [];
let globalHistoricalItems = []; 
let currentProducts = [];
let activeProduct = null;
let assignedAutoSeat = null;
const API_BASE_URL = 'http://localhost:8081';

let dynamicLabels = {
    order_customize: "", sold_out: "", add_success: "", cart_empty: "",
    delete_success: "", no_items: "", eat_in: "", takeout: "",
    table: "", none: "", auto_assigned: "", cart_empty_error: "",
    no_seat_error: "", invalid_code: "", promo_applied: "", applied: ""
};

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

function getNestedValue(obj, path) {
    if (!obj || !path) return null;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

async function initializeLocalizationEngine() {
    try {
        const response = await fetch('js/ja.json');
        if (!response.ok) throw new Error("Could not fetch ja.json config dictionary.");
        const translations = await response.json();

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const txt = getNestedValue(translations, key);
            if (txt) {
                if ((element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') && element.hasAttribute('placeholder')) {
                    element.setAttribute('placeholder', txt);
                    return;
                }
                element.textContent = txt;
            }
        });

        dynamicLabels.order_customize = getNestedValue(translations, "customer.order_customize");
        dynamicLabels.sold_out        = getNestedValue(translations, "customer.sold_out");
        dynamicLabels.add_success     = getNestedValue(translations, "customer.add_success");
        dynamicLabels.cart_empty      = getNestedValue(translations, "customer.cart_empty");
        dynamicLabels.delete_success  = getNestedValue(translations, "customer.delete_success");
        dynamicLabels.no_items        = getNestedValue(translations, "customer.no_items");
        dynamicLabels.eat_in          = getNestedValue(translations, "customer.eat_in");
        dynamicLabels.takeout         = getNestedValue(translations, "customer.takeout");
        dynamicLabels.table           = getNestedValue(translations, "customer.table");
        dynamicLabels.none            = getNestedValue(translations, "customer.none");
        dynamicLabels.auto_assigned   = getNestedValue(translations, "customer.auto_assigned");
        dynamicLabels.cart_empty_error= getNestedValue(translations, "customer.cart_empty_error");
        dynamicLabels.no_seat_error   = getNestedValue(translations, "customer.no_seat_error");
        dynamicLabels.invalid_code    = getNestedValue(translations, "customer.invalid_code");
        dynamicLabels.promo_applied   = getNestedValue(translations, "customer.promo_applied");
        dynamicLabels.applied         = getNestedValue(translations, "customer.applied");

    } catch (e) {
        console.error("Localization hydration failed:", e);
    } finally {
        // Run application baseline render functions safely
        updateCartUI();
        fetchProducts();
        checkLiveSeatAvailability();
        fetchSiteSettings();
    }
}

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
    initializeLocalizationEngine(); 
});

function fetchSiteSettings() {
    const bannerEl = document.getElementById('dynamicPromoBannerText');
    if (bannerEl) {
        const customText = localStorage.getItem('custom_promo_banner_text');
        bannerEl.textContent = customText || "Welcome to Hana Koori!";
    }
}

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
    if (savedCart) { cart = JSON.parse(savedCart); }
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

    fetch(`${API_BASE_URL}/api/get_orders`)
        .then(res => res.json())
        .then(data => {
            const orders = data.orders || [];
            const occupiedTables = orders
                .filter(o => o.status === "pending" || o.status === "making")
                .map(o => parseInt(o.seat_number));

            let candidateSeat = 1;
            while (occupiedTables.includes(candidateSeat)) { candidateSeat++; }

            assignedAutoSeat = candidateSeat;
            localStorage.setItem('kakigori_assigned_seat', assignedAutoSeat);

            if (statusBox) {
                statusBox.innerHTML = `<i class="fa-solid fa-chair"></i> ${dynamicLabels.table} ${assignedAutoSeat} ${dynamicLabels.auto_assigned}`;
                statusBox.style.color = "var(--secondary-color)";
                statusBox.style.background = "rgba(124, 179, 66, 0.1)";
                statusBox.style.borderColor = "rgba(124, 179, 66, 0.3)";
            }
            if (checkoutBtn) checkoutBtn.disabled = false;
        })
        .catch(() => {
            assignedAutoSeat = 1;
            if (statusBox) statusBox.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${dynamicLabels.table} 1`;
        });
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
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: white; border-radius: 16px; border: 1px dashed #ccc;"><i class="fa-solid fa-box-open" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 16px;"></i><h3 style="color: var(--text-muted);">${dynamicLabels.no_items}</h3></div>`;
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
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: white; border-radius: 16px; border: 1px dashed #ccc;"><i class="fa-solid fa-box-open" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 16px;"></i><h3 style="color: var(--text-muted);">${dynamicLabels.no_items}</h3></div>`;
        return;
    }

    dataToDisplay.forEach((item, index) => {
        const isAvailable = item.IsAvailable === true || item.IsAvailable === 1;
        
        const card = document.createElement("button");
        card.className = `product-item-card${isAvailable ? '' : ' unavailable'}`;
        card.disabled = !isAvailable; 
        card.style.animationDelay = `${index * 0.05}s`; 
        card.onclick = () => openProductDetail(item.MenuID); 

        card.innerHTML = `
            <div class="item-image-placeholder">
                ${item.ImageURL 
                    ? `<img src="${API_BASE_URL}/${item.ImageURL}" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null; this.style.display='none';">` 
                    : `<i class="fa-solid fa-image" style="font-size:3rem; color:#cbd5e1;"></i>`}
            </div>
            <div class="product-info">
                <h4>${escapeHtml(item.Name)}</h4> 
                <p class="price">¥${item.Price}</p> 
            </div>
            <span class="view-product-btn" style="${!isAvailable ? 'background: #64748b; color: white;' : ''}">
                ${isAvailable ? dynamicLabels.order_customize : dynamicLabels.sold_out}
            </span>
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
    imgEl.innerHTML = '';

    if (product.ImageURL) {
        const imgObj = document.createElement('img');
        imgObj.src = `${API_BASE_URL}/${product.ImageURL}`;
        imgObj.style.width = '100%';
        imgObj.style.height = '100%';
        imgObj.style.objectFit = 'cover';
        imgObj.onerror = function() {
            imgEl.innerHTML = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#f1f5f9;"><i class="fa-solid fa-image" style="font-size:4rem; color:#cbd5e1;"></i></div>`;
        };
        imgEl.appendChild(imgObj);
    } else {
        imgEl.innerHTML = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#f1f5f9;"><i class="fa-solid fa-image" style="font-size:4rem; color:#cbd5e1;"></i></div>`;
    }

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
    if (sourceElement) { animateItemToCart(sourceElement); }

    const qty = parseInt(document.getElementById('detailQuantity').value);
    const payload = { product_id: activeProduct.MenuID, quantity: qty };

    fetch(`${API_BASE_URL}/api/cart`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
    })
    .then(res => res.json())
    .then(updatedCartBackend => {
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
        showToast(`${activeProduct.Name} ${dynamicLabels.add_success}`, 'success');
        
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
    
    if (!container) return;
    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-muted); margin-top: 40px;"><i class="fa-solid fa-basket-shopping" style="font-size: 3rem; opacity: 0.2; margin-bottom: 12px;"></i><p>${dynamicLabels.cart_empty}</p></div>`;
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
    const cartCountEl = document.getElementById('cartCount');
    const finalCartTotalEl = document.getElementById('finalCartTotal');
    if (cartCountEl) cartCountEl.textContent = count;
    if (finalCartTotalEl) finalCartTotalEl.textContent = total;
}

function dropItem(id) {
    const targetItem = cart.find(i => i.cart_id === id);
    if (!targetItem) return;

    fetch(`${API_BASE_URL}/api/cart/${targetItem.menu_id}`, { method: 'DELETE' })
    .then(res => {
        if (!res.ok) throw new Error("Failed to remove item from server");
        return res.json();
    })
    .then(() => {
        cart = cart.filter(i => i.cart_id !== id);
        updateCartUI();
        localStorage.setItem('kakigori_cart', JSON.stringify(cart));
        showToast(dynamicLabels.delete_success, "success");
    })
    .catch(() => showToast("Failed to remove item from server session", "error"));
}

function submitOrderRound() {
    if (cart.length === 0) { showToast(dynamicLabels.cart_empty_error, 'error'); return; }
    const orderType = document.getElementById("orderType").value;
    if (orderType === "Eat-in" && assignedAutoSeat === null) { showToast(dynamicLabels.no_seat_error, 'error'); return; }
    
    const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const orderPayload = {
        order_code: `TX-${Date.now().toString().slice(-6)}`,
        order_type: orderType,
        seat_number: assignedAutoSeat ? parseInt(assignedAutoSeat) : 0,
        total_price: subtotal,
        status: "pending",
        items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity }))
    };

    fetch(`${API_BASE_URL}/api/submit_order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
    })
    .then(res => res.json())
    .then(() => {
        globalHistoricalItems = [...cart];
        localStorage.setItem('kakigori_history', JSON.stringify(globalHistoricalItems));
        return fetch(`${API_BASE_URL}/api/cart/clear`, { method: 'POST' });
    })
    .then(() => {
        cart = [];
        localStorage.removeItem('kakigori_cart');
        updateCartUI();
        showOrderVideoModal();
    })
    .catch(() => showToast("Failed to clear and sync order state with backend", "error"));
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
    document.querySelector('.responsive-app-wrapper')?.classList.remove('sidebar-open');
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
    const codeInput = document.getElementById('checkoutPromoCode').value.trim().toUpperCase();
    if (!codeInput) return;

    fetch(`${API_BASE_URL}/api/get_promos`)
        .then(res => res.json())
        .then(promos => {
            const matchedPromo = promos.find(p => p.code.toUpperCase() === codeInput && p.is_active);

            if (!matchedPromo) {
                localStorage.removeItem('active_co_promo');
                document.getElementById('checkoutPromoMessage').textContent = dynamicLabels.invalid_code;
                document.getElementById('checkoutPromoMessage').style.color = "var(--danger)";
                recalculateCheckoutInvoice();
                return;
            }

            localStorage.setItem('active_co_promo', JSON.stringify(matchedPromo));
            document.getElementById('checkoutPromoMessage').textContent = `✓ ${matchedPromo.code} (${matchedPromo.discount_value}${matchedPromo.discount_type === 'percentage' ? '%' : '¥'} OFF) ${dynamicLabels.applied}`;
            document.getElementById('checkoutPromoMessage').style.color = "var(--secondary-color)";
            showToast(dynamicLabels.promo_applied, 'success');
            recalculateCheckoutInvoice();
        })
        .catch(() => showToast("Failed to validate promo code with server", "error"));
}

function recalculateCheckoutInvoice() {
    const subtotal = globalHistoricalItems.reduce((s, i) => s + (i.price * i.quantity), 0);
    let discount = 0;

    const savedPromo = localStorage.getItem('active_co_promo');
    if (savedPromo) {
        const promo = JSON.parse(savedPromo);
        if (promo.discount_type === 'percentage') {
            discount = Math.round(subtotal * (promo.discount_value / 100));
        } else {
            discount = promo.discount_value;
        }
    }

    const grandTotal = Math.max(0, subtotal - discount);
    document.getElementById('coSubtotal').textContent = subtotal;
    document.getElementById('coDiscount').textContent = discount;
    document.getElementById('coGrandTotal').textContent = grandTotal;
}

function finalizeCheckoutSession() {
    const grandTotal = parseInt(document.getElementById('coGrandTotal').textContent);
    const orderType = document.getElementById("orderType").value;
    const activeBillId = `TX-${Date.now().toString().slice(-6)}`;

    document.getElementById('frBillId').textContent = activeBillId;
    document.getElementById('frType').textContent = orderType === "Eat-in" ? dynamicLabels.eat_in : dynamicLabels.takeout;
    document.getElementById('frSeat').textContent = assignedAutoSeat ? `${dynamicLabels.table} ${assignedAutoSeat}` : dynamicLabels.none;
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
function verifyManagerCode() {
    if (document.getElementById('gatePasscodeInput').value === "0000") { window.location.href = "manager.html"; } 
    else { showToast("Passcode incorrect", "error"); }
}
function toggleSidebar() {
    const wrapper = document.querySelector('.responsive-app-wrapper');
    if (window.innerWidth <= 768) {
        wrapper.classList.toggle('sidebar-open');
        wrapper.classList.remove('sidebar-closed');
    } else {
        wrapper.classList.toggle('sidebar-closed');
        wrapper.classList.remove('sidebar-open');
    }
}
function promptManagerAccess(e) { 
    e.preventDefault(); 
    document.getElementById('securityGateModal').style.display = 'flex'; 
    document.querySelector('.responsive-app-wrapper')?.classList.remove('sidebar-open');
}
function resetOrderSession() { 
    if (confirm("Clear active cart and session?")) { 
        document.querySelector('.responsive-app-wrapper')?.classList.remove('sidebar-open');
        clearSessionAndReload(); 
    } 
}