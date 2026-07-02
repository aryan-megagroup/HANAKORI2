const API_BASE_URL = 'http://localhost:8081';
let currentEditingProductId = null;
let currentEditingPromoId = null;
let globalProductsCache = [];
let globalPromosCache = [];
let globalOrdersCache = [];

let dynamicAdminLabels = {
    available: "", no: "", edit: "", no_products: "", connection_failed: "",
    confirm_delete_product: "", no_promos: "", confirm_delete_promo: "",
    no_orders: "", eat_in: "", takeout: "", table: "", none: "",
    order_not_found: "", loading: "", items_not_found: "", items_failed: "",
    unit_price: "", pieces: ""
};

function getNestedValue(obj, path) {
    if (!obj || !path) return null;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

async function initializeLocalizationEngine() {
    try {
        const response = await fetch('js/ja.json'); 
        if (!response.ok) throw new Error("Could not fetch ja.json configuration file.");
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
        dynamicAdminLabels.available = getNestedValue(translations, "manager.status_available");
        dynamicAdminLabels.no        = getNestedValue(translations, "manager.status_unavailable");
        dynamicAdminLabels.edit      = getNestedValue(translations, "manager.edit_btn");
        dynamicAdminLabels.no_products = getNestedValue(translations, "manager.no_products_found");
        dynamicAdminLabels.connection_failed = getNestedValue(translations, "manager.connection_failed");
        dynamicAdminLabels.confirm_delete_product = getNestedValue(translations, "manager.confirm_delete_product");
        dynamicAdminLabels.no_promos = getNestedValue(translations, "manager.no_promos_found");
        dynamicAdminLabels.confirm_delete_promo = getNestedValue(translations, "manager.confirm_delete_promo");
        dynamicAdminLabels.no_orders = getNestedValue(translations, "manager.no_orders_found");
        dynamicAdminLabels.eat_in    = getNestedValue(translations, "customer.eat_in");
        dynamicAdminLabels.takeout   = getNestedValue(translations, "customer.takeout");
        dynamicAdminLabels.table     = getNestedValue(translations, "customer.table");
        dynamicAdminLabels.none      = getNestedValue(translations, "customer.none");
        dynamicAdminLabels.order_not_found = getNestedValue(translations, "manager.order_not_found");
        dynamicAdminLabels.loading   = getNestedValue(translations, "common.loading");
        dynamicAdminLabels.items_not_found = getNestedValue(translations, "manager.items_not_found");
        dynamicAdminLabels.items_failed = getNestedValue(translations, "manager.items_failed");
        dynamicAdminLabels.unit_price = getNestedValue(translations, "manager.unit_price");
        dynamicAdminLabels.pieces    = getNestedValue(translations, "manager.pieces");

    } catch (e) {
        console.error("Localization engine compilation issue:", e);
    } finally {
        loadProducts();
        loadPromos();
        loadOrders();
        setupImageUpload();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeLocalizationEngine();
});

window.addEventListener('scroll', () => {
    window.requestAnimationFrame(() => {
        document.querySelectorAll('.product-item-card').forEach(card => {
            let speed = 0.05;
            let yPos = -(window.pageYOffset * speed);
            card.style.transform = `translateY(${yPos}px)`;
        });
    });
});

function switchTab(t) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(i => i.classList.remove('active'));
    document.getElementById(t).classList.add('active');
    event.target.closest('.menu-item').classList.add('active');
}

function toggleProductForm() {
    const c = document.getElementById('productFormContainer');
    if (c.style.display === 'block') {
        c.style.display = 'none';
        document.getElementById('productForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        currentEditingProductId = null;
    } else {
        c.style.display = 'block';
    }
}

function togglePromoForm() {
    const c = document.getElementById('promoFormContainer');
    if (c.style.display === 'block') {
        c.style.display = 'none';
        document.getElementById('promoForm').reset();
        currentEditingPromoId = null;
    } else {
        c.style.display = 'block';
    }
}

function setupImageUpload() {
    const img = document.getElementById('productImage');
    const box = document.querySelector('.image-upload');
    if (box && img) {
        box.addEventListener('click', () => img.click());
        img.addEventListener('change', (e) => {
            const f = e.target.files[0];
            if (f) {
                const r = new FileReader();
                r.onload = (ev) => document.getElementById('imagePreview').innerHTML = `<img src="${ev.target.result}" style="max-width:100%; border-radius:8px; max-height:200px;">`;
                r.readAsDataURL(f);
            }
        });
    }
}

function loadProducts() {
    fetch(`${API_BASE_URL}/api/products`)
        .then(res => {
            if (!res.ok) throw new Error(`Server returned status ${res.status}`);
            return res.json();
        })
        .then(products => {
            globalProductsCache = products || [];
            const tbody = document.querySelector('#productsTable tbody');
            if (!tbody) return;
            
            if (globalProductsCache.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#64748b;">${dynamicAdminLabels.no_products}</td></tr>`;
                return;
            }
            
            tbody.innerHTML = globalProductsCache.map(p => `
                <tr>
                    <td><img src="${API_BASE_URL}/${p.ImageURL || 'uploads/no-image.png'}" class="product-img" style="width:50px; height:50px; object-fit:cover; border-radius:6px;" onerror="this.onerror=null; this.src='';"></td>
                    <td><strong>${escapeHtml(p.Name || '')}</strong></td>
                    <td>${escapeHtml(p.Category || '')}</td>
                    <td>¥${p.Price || 0}</td>
                    <td><span class="badge ${p.IsAvailable ? 'badge-success' : 'badge-danger'}">${p.IsAvailable ? dynamicAdminLabels.available : dynamicAdminLabels.no}</span></td>
                    <td>
                        <button class="action-btn action-btn-edit" onclick="editProduct(${p.MenuID})"><i class="fas fa-edit"></i> ${dynamicAdminLabels.edit}</button>
                        <button class="action-btn action-btn-delete" onclick="deleteProduct(${p.MenuID})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        })
        .catch(err => {
            console.error("Error loading products:", err);
            const tbody = document.querySelector('#productsTable tbody');
            if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">${dynamicAdminLabels.connection_failed}</td></tr>`;
        });
}

function editProduct(menuId) {
    const product = globalProductsCache.find(p => parseInt(p.MenuID) === parseInt(menuId));
    if (!product) return;

    currentEditingProductId = product.MenuID; 
    document.getElementById('productName').value = product.Name; 
    document.getElementById('productPrice').value = product.Price; 
    document.getElementById('productDescription').value = product.Description || '';
    document.getElementById('productCategory').value = product.Category || 'Ice'; 
    document.getElementById('productAvailable').value = product.IsAvailable ? "1" : "0"; 
    
    if (product.ImageURL) { 
        document.getElementById('imagePreview').innerHTML = `<img src="${product.ImageURL}" style="max-width:100%; border-radius:8px; max-height:200px;">`; 
    } else { 
        document.getElementById('imagePreview').innerHTML = ''; 
    }

    document.getElementById('productFormContainer').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function submitProduct(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('action', currentEditingProductId ? 'update' : 'create');
    if (currentEditingProductId) formData.append('menu_id', currentEditingProductId);
    
    formData.append('name', document.getElementById('productName').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('category', document.getElementById('productCategory').value);
    formData.append('is_available', document.getElementById('productAvailable').value);
    
    const fileInput = document.getElementById('productImage');
    if (fileInput.files.length > 0) { formData.append('image', fileInput.files[0]); }

    fetch('http://localhost:8081/api/manage_products', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            toggleProductForm();
            loadProducts();
        }
    });
}

function deleteProduct(menuId) {
    if (!confirm(dynamicAdminLabels.confirm_delete_product)) return;
    
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('menu_id', menuId);

    fetch(`${API_BASE_URL}/api/manage_products`, { method: 'POST', body: formData })
    .then(res => res.json())
    .then(() => { loadProducts(); });
}

function loadPromos() {
    fetch(`${API_BASE_URL}/api/get_promos`)
        .then(res => res.json())
        .then(promos => {
            globalPromosCache = promos || [];
            const tbody = document.querySelector('#promosTable tbody');
            if (!tbody) return;
            if (!promos || promos.length === 0) { tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">${dynamicAdminLabels.no_promos}</td></tr>`; return; }
            tbody.innerHTML = promos.map(p => `
                <tr>
                    <td><strong>${p.code}</strong></td>
                    <td>${p.description || '-'}</td>
                    <td>${p.discount_type === 'percentage' ? p.discount_value + '%' : '¥' + p.discount_value}</td>
                    <td><span class="badge ${p.is_active ? 'badge-success' : 'badge-danger'}">${p.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                        <button class="action-btn action-btn-edit" onclick="editPromo(${p.promo_id})"><i class="fas fa-edit"></i></button>
                        <button class="action-btn action-btn-delete" onclick="deletePromo(${p.promo_id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }).catch(() => { document.querySelector('#promosTable tbody').innerHTML = '<tr><td colspan="5">Error loading promos.</td></tr>'; });
}

function editPromo(promoId) {
    const promo = globalPromosCache.find(p => parseInt(p.promo_id) === parseInt(promoId));
    if (!promo) return;
    currentEditingPromoId = promo.promo_id;
    document.getElementById('promoCode').value = promo.code;
    document.getElementById('promoDescription').value = promo.description || '';
    document.getElementById('promoDiscountType').value = promo.discount_type || 'percentage';
    document.getElementById('promoDiscountValue').value = promo.discount_value;
    document.getElementById('promoActive').value = promo.is_active ? "1" : "0";
    document.getElementById('promoFormContainer').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function submitPromo(e) {
    e.preventDefault();
    const payload = {
        action: currentEditingPromoId ? 'update' : 'create',
        promo_id: currentEditingPromoId,
        code: document.getElementById('promoCode').value,
        description: document.getElementById('promoDescription').value,
        discount_type: document.getElementById('promoDiscountType').value,
        discount_value: parseInt(document.getElementById('promoDiscountValue').value),
        is_active: parseInt(document.getElementById('promoActive').value)
    };
    fetch(`${API_BASE_URL}/api/manage_promos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then(res => res.json())
    .then(() => { togglePromoForm(); loadPromos(); });
}

function deletePromo(promoId) {
    if (!confirm(dynamicAdminLabels.confirm_delete_promo)) return;
    fetch(`${API_BASE_URL}/api/manage_promos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', promo_id: promoId }) })
    .then(res => res.json()).then(() => { loadPromos(); });
}

function submitPromoBanner(e) {
    e.preventDefault();
    const text = document.getElementById('promoBannerInput').value;
    localStorage.setItem('custom_promo_banner_text', text);
}

function loadOrders() {
    fetch(`${API_BASE_URL}/api/get_orders`)
        .then(res => res.json())
        .then(data => {
            globalOrdersCache = data.orders || []; 

            if (document.getElementById('statsTotalEarnings')) { 
                const earnings = data.total_earnings || 0;
                document.getElementById('statsTotalEarnings').textContent = `¥${earnings.toLocaleString('ja-JP')}`; 
            }
            const tbody = document.querySelector('#ordersTable tbody');
            if (!tbody) return;
            if (!data.orders || data.orders.length === 0) { 
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">${dynamicAdminLabels.no_orders}</td></tr>`; 
                return; 
            }
            tbody.innerHTML = data.orders.map(o => {
                const currentStatus = o.status.toLowerCase();
                let statusClass = 'badge-warning';
                if (currentStatus === 'served') statusClass = 'badge-success';
                if (currentStatus === 'making') statusClass = 'badge-info';
                return `
                <tr>
                    <td><strong>${o.order_code}</strong></td>
                    <td>${o.order_type === "Eat-in" ? dynamicAdminLabels.eat_in : dynamicAdminLabels.takeout}</td>
                    <td>${o.seat_number ? dynamicAdminLabels.table + ' ' + o.seat_number : "-"}</td>
                    <td>¥${o.total_price}</td>
                    <td><select class="badge ${statusClass}" onchange="updateOrderStatus(${o.order_id}, this.value)" style="border:none; outline:none; cursor:pointer;"><option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>Pending</option><option value="making" ${currentStatus === 'making' ? 'selected' : ''}>Making</option><option value="served" ${currentStatus === 'served' ? 'selected' : ''}>Served</option></select></td>
                    <td>${new Date(o.created_at).toLocaleString()}</td>
                    <td><button class="action-btn action-btn-edit" onclick="viewOrderDetails(${o.order_id})"><i class="fas fa-eye"></i> View</button></td>
                </tr>
            `;}).join('');
        });
}

function updateOrderStatus(orderId, newStatus) { 
    fetch(`${API_BASE_URL}/api/update_order_status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderId, status: newStatus }) })
    .then(res => res.json()).then(data => { if (data.success) { loadOrders(); } }); 
}

function viewOrderDetails(orderId) {
    const order = globalOrdersCache.find(o => parseInt(o.order_id) === parseInt(orderId));
    if (!order) {
        alert(dynamicAdminLabels.order_not_found);
        return;
    }

    document.getElementById('orderDetailTitle').textContent = order.order_code || order.order_id;
    
    document.getElementById('orderDetailMeta').innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.95rem; margin-bottom: 20px;">
            <div><span style="color: #64748b;">${dynamicAdminLabels.th_order_type}:</span> <strong style="color: #334155;">${order.order_type === "Eat-in" ? dynamicAdminLabels.eat_in : dynamicAdminLabels.takeout}</strong></div>
            <div><span style="color: #64748b;">${dynamicAdminLabels.th_seat}:</span> <strong style="color: #334155;">${order.seat_number ? dynamicAdminLabels.table + ' ' + order.seat_number : dynamicAdminLabels.none}</strong></div>
            <div><span style="color: #64748b;">${dynamicAdminLabels.th_date}:</span> <strong style="color: #334155;">${new Date(order.created_at).toLocaleString()}</strong></div>
            <div><span style="color: #64748b;">${dynamicAdminLabels.th_total}:</span> <strong style="color: #FFC0CB; font-size: 1.1rem;">¥${order.total_price}</strong></div>
        </div>
    `;

    document.getElementById('orderDetailModal').style.display = 'block';
    const itemsContainer = document.getElementById('orderDetailItems');

    if (order.items && Array.isArray(order.items)) {
        renderOrderItemsList(order.items, itemsContainer);
    } else {
        itemsContainer.innerHTML = `<p style="color: #64748b; text-align: center;"><i class="fas fa-spinner fa-spin"></i> ${dynamicAdminLabels.loading}</p>`;
        
        fetch(`api/get_order_details.php?order_id=${orderId}`)
            .then(res => res.json())
            .then(data => {
                if (data.items && data.items.length > 0) {
                    order.items = data.items;
                    renderOrderItemsList(data.items, itemsContainer);
                } else {
                    itemsContainer.innerHTML = `<p style="text-align: center; color: #64748b;">${dynamicAdminLabels.items_not_found}</p>`;
                }
            })
            .catch(() => {
                itemsContainer.innerHTML = `<p style="text-align: center; color: red;">${dynamicAdminLabels.items_failed}</p>`;
            });
    }
}

function renderOrderItemsList(items, container) {
    container.innerHTML = items.map(i => {
        const actualPrice = i.price !== undefined ? i.price : i.unit_price;
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border: 1px solid var(--border); border-radius: 12px; margin-bottom: 8px;">
                <div>
                    <strong style="color: var(--text-main); font-size: 1.05rem;">${i.name}</strong><br>
                    <small style="color: var(--text-light); font-weight: 500;">${dynamicAdminLabels.unit_price}: ¥${actualPrice} × ${i.quantity}${dynamicAdminLabels.pieces}</small>
                </div>
                <strong style="font-size: 1.2rem; color: var(--text-main);">¥${actualPrice * i.quantity}</strong>
            </div>
        `;
    }).join('');
}

function closeOrderDetailModal() { document.getElementById('orderDetailModal').style.display = 'none'; }
function escapeHtml(v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function toggleAdminSidebar() {
    const container = document.querySelector('.manager-container');
    if (window.innerWidth <= 768) {
        container.classList.toggle('sidebar-open');
        container.classList.remove('sidebar-closed');
    } else {
        container.classList.toggle('sidebar-closed');
        container.classList.remove('sidebar-open');
    }
}