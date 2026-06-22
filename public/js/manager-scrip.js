let currentEditingProductId = null;
let currentEditingPromoId = null;
let globalProductsCache = [];
let globalPromosCache = [];
let globalOrdersCache = [];
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    loadPromos();
    loadOrders();
    setupImageUpload();
    loadPromoBanner(); 
});

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
        document.getElementById('formTitle').textContent = 'Add New Product';
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
        document.getElementById('promoFormTitle').textContent = 'Add New Promo';
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
    fetch('api/get_products.php')
        .then(res => res.json())
        .then(products => {
            globalProductsCache = products;
            const tbody = document.querySelector('#productsTable tbody');
            if (!tbody) return;
            tbody.innerHTML = products.map(p => `
                <tr>
                    <td><img src="${p.image_url}" class="product-img" style="width:50px; height:50px; object-fit:cover; border-radius:6px;" onerror="this.src='uploads/no-image.png'"></td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.category}</td>
                    <td>¥${p.price}</td>
                    <td><span class="badge ${p.is_available ? 'badge-success' : 'badge-danger'}">${p.is_available ? 'Available' : 'No'}</span></td>
                    <td>
                        <button class="action-btn action-btn-edit" onclick="editProduct(${p.menu_id})"><i class="fas fa-edit"></i> Edit</button>
                        <button class="action-btn action-btn-delete" onclick="deleteProduct(${p.menu_id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        });
}

function editProduct(menuId) {
    const product = globalProductsCache.find(p => parseInt(p.menu_id) === parseInt(menuId));
    if (!product) return;

    currentEditingProductId = product.menu_id;
    document.getElementById('formTitle').textContent = 'Edit Product';
    
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productCategory').value = product.category || 'Ice';
    document.getElementById('productAvailable').value = product.is_available ? "1" : "0";
    
    if (product.image_url) { document.getElementById('imagePreview').innerHTML = `<img src="${product.image_url}" style="max-width:100%; border-radius:8px; max-height:200px;">`; } 
    else { document.getElementById('imagePreview').innerHTML = ''; }

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

    fetch('api/manage_products.php', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            toggleProductForm();
            loadProducts();
        } else { alert('更新に失敗しました。もう一度お試しください。'); }
    }).catch(err => alert('ネットワークエラー: ' + err));
}

function deleteProduct(menuId) {
    if (!confirm('本当にこのアイテムを完全に削除しますか？')) return;
    fetch('api/manage_products.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', menu_id: menuId })
    }).then(res => res.json()).then(data => { alert(data.message); loadProducts(); });
}

function loadPromos() {
    fetch('api/get_promos.php')
        .then(res => res.json())
        .then(promos => {
            globalPromosCache = promos;
            const tbody = document.querySelector('#promosTable tbody');
            if (!tbody) return;
            if (!promos || promos.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">プロモーションコードはありません。「追加」ボタンから作成してください。</td></tr>'; return; }
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
    document.getElementById('promoFormTitle').textContent = 'Edit Promo Code';
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
    fetch('api/manage_promos.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then(res => res.json())
    .then(data => {
        if (data.success) { alert(data.message); togglePromoForm(); loadPromos(); } 
        else { alert('エラー: ' + data.message); }
    });
}

function deletePromo(promoId) {
    if (!confirm('このプロモーションコードを削除しますか？')) return;
    fetch('api/manage_promos.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', promo_id: promoId }) })
    .then(res => res.json()).then(data => { alert(data.message); loadPromos(); });
}

function loadPromoBanner() {
    fetch('api/get_settings.php')
    .then(res => res.json())
    .then(data => { if(document.getElementById('promoBannerInput')) { document.getElementById('promoBannerInput').value = data.promo_banner || ''; } });
}

function submitPromoBanner(e) {
    e.preventDefault();
    const text = document.getElementById('promoBannerInput').value;
    fetch('api/manage_settings.php', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ promo_banner: text }) })
    .then(res => res.json())
    .then(data => { alert(data.message); }).catch(err => alert('Network error: ' + err));
}

function loadOrders() {
    fetch('get_orders.php')
        .then(res => res.json())
        .then(data => {
            // Save the fetched orders to your cache variable so the View button can use them
            globalOrdersCache = data.orders || []; 

            if (document.getElementById('statsTotalEarnings')) { 
                document.getElementById('statsTotalEarnings').textContent = `¥${data.total_earnings.toLocaleString()}`; 
            }
            const tbody = document.querySelector('#ordersTable tbody');
            if (!tbody) return;
            if (!data.orders || data.orders.length === 0) { 
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">注文はありません。</td></tr>'; 
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
                    <td>${o.order_type === "Eat-in" ? "店内飲食" : "テイクアウト"}</td>
                    <td>${o.seat_number ? 'テーブル ' + o.seat_number : "-"}</td>
                    <td>¥${o.total_price}</td>
                    <td><select class="badge ${statusClass}" onchange="updateOrderStatus(${o.order_id}, this.value)" style="border:none; outline:none; cursor:pointer;"><option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>Pending</option><option value="making" ${currentStatus === 'making' ? 'selected' : ''}>Making</option><option value="served" ${currentStatus === 'served' ? 'selected' : ''}>Served</option></select></td>
                    <td>${new Date(o.created_at).toLocaleString()}</td>
                    <td><button class="action-btn action-btn-edit" onclick="viewOrderDetails(${o.order_id})"><i class="fas fa-eye"></i> View</button></td>
                </tr>
            `;}).join('');
        });
}

function updateOrderStatus(orderId, newStatus) { 
    fetch('api/update_order_status.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderId, status: newStatus }) })
    .then(res => res.json()).then(data => { if (data.success) { loadOrders(); } }); 
}

function viewOrderDetails(orderId) {
    // 1. Find the specific order from the cache
    const order = globalOrdersCache.find(o => parseInt(o.order_id) === parseInt(orderId));
    if (!order) {
        alert('注文データが見つかりません。');
        return;
    }

    // 2. Populate the Meta Information (Header of the modal)
    document.getElementById('orderDetailTitle').textContent = order.order_code || order.order_id;
    
    document.getElementById('orderDetailMeta').innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.95rem; margin-bottom: 20px;">
            <div><span style="color: #64748b;">ご利用方法:</span> <strong style="color: #334155;">${order.order_type === "Eat-in" ? "店内飲食" : "テイクアウト"}</strong></div>
            <div><span style="color: #64748b;">席番号:</span> <strong style="color: #334155;">${order.seat_number ? 'テーブル ' + order.seat_number : "なし"}</strong></div>
            <div><span style="color: #64748b;">注文日時:</span> <strong style="color: #334155;">${new Date(order.created_at).toLocaleString()}</strong></div>
            <div><span style="color: #64748b;">合計金額:</span> <strong style="color: #FFC0CB; font-size: 1.1rem;">¥${order.total_price}</strong></div>
        </div>
    `;

    // 3. Open the Modal
    document.getElementById('orderDetailModal').style.display = 'block';
    const itemsContainer = document.getElementById('orderDetailItems');

    // 4. Render Items
    if (order.items && Array.isArray(order.items)) {
        // If your get_orders.php already includes the items array
        renderOrderItemsList(order.items, itemsContainer);
    } else {
        // Fallback: Fetch items dynamically if they aren't in the initial cache
        itemsContainer.innerHTML = '<p style="color: #64748b; text-align: center;"><i class="fas fa-spinner fa-spin"></i> 読み込み中...</p>';
        
        fetch(`api/get_order_details.php?order_id=${orderId}`)
            .then(res => res.json())
            .then(data => {
                if (data.items && data.items.length > 0) {
                    // Update cache for next time
                    order.items = data.items;
                    renderOrderItemsList(data.items, itemsContainer);
                } else {
                    itemsContainer.innerHTML = '<p style="text-align: center; color: #64748b;">アイテムが見つかりません。</p>';
                }
            })
            .catch(() => {
                itemsContainer.innerHTML = '<p style="text-align: center; color: red;">アイテムの取得に失敗しました。</p>';
            });
    }
}

// Helper function to build the HTML for the ordered items list
function renderOrderItemsList(items, container) {
    container.innerHTML = items.map(i => {
        // Fallback safety shield: use i.price. If it's missing, use i.unit_price
        const actualPrice = i.price !== undefined ? i.price : i.unit_price;
        
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: white; border: 1px solid var(--border); border-radius: 12px; margin-bottom: 8px;">
                <div>
                    <strong style="color: var(--text-main); font-size: 1.05rem;">${i.name}</strong><br>
                    <small style="color: var(--text-light); font-weight: 500;">単価: ¥${actualPrice} × ${i.quantity}個</small>
                </div>
                <strong style="font-size: 1.2rem; color: var(--text-main);">¥${actualPrice * i.quantity}</strong>
            </div>
        `;
    }).join('');
}

function closeOrderDetailModal() { 
    document.getElementById('orderDetailModal').style.display = 'none'; 
}
function closeOrderDetailModal() { document.getElementById('orderDetailModal').style.display = 'none'; }
