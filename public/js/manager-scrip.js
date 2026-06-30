const API_BASE_URL = 'http://localhost:8081';
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
    fetch(`${API_BASE_URL}/api/products`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Server returned status ${res.status}`);
            }
            return res.json();
        })
        .then(products => {
            globalProductsCache = products || [];
            
            const tbody = document.querySelector('#productsTable tbody');
            if (!tbody) return;
            
            if (globalProductsCache.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#64748b;">No products found. Add your first item!</td></tr>';
                return;
            }
            
            tbody.innerHTML = globalProductsCache.map(p => `
                <tr>
                <td><img src="${API_BASE_URL}/${p.ImageURL || 'uploads/no-image.png'}" class="product-img" style="width:50px; height:50px; object-fit:cover; border-radius:6px;" onerror="this.onerror=null; this.src='';"></td>
                    <td><strong>${escapeHtml(p.Name || '')}</strong></td>
                    <td>${escapeHtml(p.Category || '')}</td>
                    <td>¥${p.Price || 0}</td>
                    <td><span class="badge ${p.IsAvailable ? 'badge-success' : 'badge-danger'}">${p.IsAvailable ? 'Available' : 'No'}</span></td>
                    <td>
                        <button class="action-btn action-btn-edit" onclick="editProduct(${p.MenuID})"><i class="fas fa-edit"></i> Edit</button>
                        <button class="action-btn action-btn-delete" onclick="deleteProduct(${p.MenuID})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        })
        .catch(err => {
            console.error("Error loading products:", err);
            const tbody = document.querySelector('#productsTable tbody');
            if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Failed to connect to backend server.</td></tr>';
        });
}

function editProduct(menuId) {
    const product = globalProductsCache.find(p => parseInt(p.MenuID) === parseInt(menuId));
    if (!product) return;

    currentEditingProductId = product.MenuID; 
    document.getElementById('formTitle').textContent = 'Edit Product';
    
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
            alert(data.message);
            toggleProductForm();
            loadProducts();
        } else { alert('更新に失敗しました。もう一度お試しください。'); }
    }).catch(err => alert('ネットワークエラー: ' + err));
}

function deleteProduct(menuId) {
    if (!confirm('本当にこのアイテムを完全に削除しますか？')) return;
    
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('menu_id', menuId);

    fetch(`${API_BASE_URL}/api/manage_products`, {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => { 
        alert(data.message); 
        loadProducts(); 
    })
    .catch(err => alert('Network error: ' + err));
}

function loadPromos() {
    fetch(`${API_BASE_URL}/api/get_promos`)
        .then(res => res.json())
        .then(promos => {
            globalPromosCache = promos || [];
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
    fetch(`${API_BASE_URL}/api/manage_promos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    .then(res => res.json())
    .then(data => {
        if (data.success) { alert(data.message); togglePromoForm(); loadPromos(); } 
        else { alert('エラー: ' + data.message); }
    });
}

function deletePromo(promoId) {
    if (!confirm('このプロモーションコードを削除しますか？')) return;
    fetch(`${API_BASE_URL}/api/manage_promos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', promo_id: promoId }) })
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
    localStorage.setItem('custom_promo_banner_text', text);
    alert('ユーザー画面の設定を更新しました！ (Store banner updated successfully)');
}

function loadOrders() {
    fetch(`${API_BASE_URL}/api/get_orders`)
        .then(res => res.json())
        .then(data => {
            globalOrdersCache = data.orders || []; 

            if (document.getElementById('statsTotalEarnings')) { 
                const earnings = data.total_earnings || 0;
                document.getElementById('statsTotalEarnings').textContent = `¥${earnings.toLocaleString()}`; 
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
    fetch(`${API_BASE_URL}/api/update_order_status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: orderId, status: newStatus }) })
    .then(res => res.json()).then(data => { if (data.success) { loadOrders(); } }); 
}

function viewOrderDetails(orderId) {
    const order = globalOrdersCache.find(o => parseInt(o.order_id) === parseInt(orderId));
    if (!order) {
        alert('注文データが見つかりません。');
        return;
    }

    document.getElementById('orderDetailTitle').textContent = order.order_code || order.order_id;
    
    document.getElementById('orderDetailMeta').innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.95rem; margin-bottom: 20px;">
            <div><span style="color: #64748b;">ご利用方法:</span> <strong style="color: #334155;">${order.order_type === "Eat-in" ? "店内飲食" : "テイクアウト"}</strong></div>
            <div><span style="color: #64748b;">席番号:</span> <strong style="color: #334155;">${order.seat_number ? 'テーブル ' + order.seat_number : "なし"}</strong></div>
            <div><span style="color: #64748b;">注文日時:</span> <strong style="color: #334155;">${new Date(order.created_at).toLocaleString()}</strong></div>
            <div><span style="color: #64748b;">合計金額:</span> <strong style="color: #FFC0CB; font-size: 1.1rem;">¥${order.total_price}</strong></div>
        </div>
    `;

    document.getElementById('orderDetailModal').style.display = 'block';
    const itemsContainer = document.getElementById('orderDetailItems');

    if (order.items && Array.isArray(order.items)) {
        renderOrderItemsList(order.items, itemsContainer);
    } else {
        itemsContainer.innerHTML = '<p style="color: #64748b; text-align: center;"><i class="fas fa-spinner fa-spin"></i> 読み込み中...</p>';
        
        fetch(`api/get_order_details.php?order_id=${orderId}`)
            .then(res => res.json())
            .then(data => {
                if (data.items && data.items.length > 0) {
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

function renderOrderItemsList(items, container) {
    container.innerHTML = items.map(i => {
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

function escapeHtml(v) { 
    return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); 
}
