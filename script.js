// تحميل المستخدم الحالي من localStorage
function loadCurrentUser() {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
}

// تسجيل الدخول
function login(email, password) {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = user.role === "seller" ? "seller-dashboard.html" : "buyer-dashboard.html";
  } else {
    alert("البريد أو كلمة المرور غير صحيحة");
  }
}

// تسجيل الخروج
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// تحميل بيانات المستخدم في الرأس
function loadUserHeader() {
  const user = loadCurrentUser();
  const nav = document.querySelector("nav");
  if (user && nav) {
    nav.innerHTML += `
      <span style="color: #ddd;">مرحباً، ${user.name}</span>
      <a href="#" onclick="logout()">تسجيل الخروج</a>
    `;
  }
}

// تحميل المزادات النشطة
function loadActiveAuctions() {
  const list = document.getElementById("auctionsList");
  if (!list) return;

  mockProducts.forEach(p => {
    const timeLeft = new Date(p.endTime) - new Date();
    const hours = Math.floor(timeLeft / 3600000);
    const minutes = Math.floor((timeLeft % 3600000) / 60000);

    list.innerHTML += `
      <div class="card auction-item">
        <h3>${p.name}</h3>
        <div style="display: flex; gap: 10px;">
          ${p.images.map(img => `<img src="${img}" alt="${p.name}" style="width: 100px; height: 80px; object-fit: cover; border-radius: 5px;">`).join('')}
        </div>
        <p>${p.description}</p>
        <p>السعر الحالي: <strong>${p.currentPrice} ر.س</strong></p>
        <p>الوقت المتبقي: ${hours} ساعة و ${minutes} دقيقة</p>
        <input type="number" id="bid-${p.id}" placeholder="أدخل سعرك">
        <button onclick="placeBid(${p.id})">المزايدة</button>
        <a href="product-details.html?id=${p.id}" class="btn">عرض التفاصيل</a>
      </div>
    `;
  });
}

// المزايدة على منتج
function placeBid(productId) {
  const input = document.getElementById(`bid-${productId}`);
  const amount = parseFloat(input.value);
  const product = mockProducts.find(p => p.id === productId);
  const user = loadCurrentUser();

  if (!user) {
    alert("يرجى تسجيل الدخول أولاً");
    window.location.href = "login.html";
    return;
  }

  if (amount > product.currentPrice) {
    const bidData = {
      userId: user.id,
      amount,
      timestamp: new Date().toISOString()
    };

    addMockBid(productId, bidData);
    alert("تمت المزايدة بنجاح!");
    window.location.reload();
  } else {
    alert("يجب أن يكون سعرك أعلى من السعر الحالي");
  }
}

// تحميل تفاصيل المنتج
function loadProductDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get("id"));
  const product = mockProducts.find(p => p.id === productId);
  const container = document.getElementById("productDetails");

  if (!product || !container) return;

  container.innerHTML = `
    <div class="card">
      <h2>${product.name}</h2>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        ${product.images.map(img => `<img src="${img}" alt="${product.name}" style="width: 100%; max-width: 300px; border-radius: 5px;">`).join('')}
      </div>
      <p>${product.description}</p>
      <p>السعر الحالي: <strong>${product.currentPrice} ر.س</strong></p>
      <p>الحد الأدنى للسعر: ${product.startingPrice} ر.س</p>
      <p>ينتهي في: ${new Date(product.endTime).toLocaleString()}</p>
      
      ${loadCurrentUser()?.role === "buyer" ? `
        <input type="number" id="bidAmount" placeholder="أدخل سعرك" min="${product.currentPrice + 1}">
        <button onclick="placeBid(${product.id})">المزايدة</button>
      ` : ''}
    </div>
  `;
}

// تحميل تاريخ المزايدات
function loadBidHistory() {
  const history = document.getElementById("bidHistory");
  if (!history) return;

  const user = loadCurrentUser();
  const userBids = mockProducts.flatMap(p =>
    p.bids.filter(b => b.userId === user.id).map(bid => ({
      ...bid,
      productName: p.name
    }))
  );

  if (userBids.length === 0) {
    history.innerHTML = "<p>لا يوجد مزايدات سابقة</p>";
    return;
  }

  userBids.forEach(bid => {
    history.innerHTML += `
      <tr>
        <td>${bid.productName}</td>
        <td>${bid.amount} ر.س</td>
        <td>${new Date(bid.timestamp).toLocaleString()}</td>
      </tr>
    `;
  });
}

// عرض المنتجات الخاصة بالبائع
function loadMyProducts() {
  const container = document.getElementById("myProducts");
  if (!container) return;

  const user = loadCurrentUser();
  const userProducts = mockProducts.filter(p => p.sellerId === user.id);

  if (userProducts.length === 0) {
    container.innerHTML = "<p>لا يوجد منتجات مضافة</p>";
    return;
  }

  userProducts.forEach(p => {
    container.innerHTML += `
      <div class="card">
        <h3>${p.name}</h3>
        <p>السعر الحالي: <strong>${p.currentPrice} ر.س</strong></p>
        <p>ينتهي في: ${new Date(p.endTime).toLocaleString()}</p>
        <p>عدد المزايدات: ${p.bids.length}</p>
      </div>
    `;
  });
}

// إضافة منتج جديد
function submitAddProductForm(e) {
  e.preventDefault();
  const form = document.getElementById("addProductForm");
  const formData = new FormData(form);
  
  const product = {
    name: formData.get("name"),
    description: formData.get("description"),
    startingPrice: parseFloat(formData.get("startingPrice")),
    currentPrice: parseFloat(formData.get("startingPrice")),
    endTime: formData.get("endTime"),
    images: [formData.get("image") ? URL.createObjectURL(formData.get("image")) : "https://via.placeholder.com/300"],
    sellerId: loadCurrentUser().id
  };

  addMockProduct(product);
  alert("تم إضافة المنتج بنجاح!");
  window.location.href = "seller-dashboard.html";
}

// معالجة الدفع
function processPayment() {
  alert("تم الدفع بنجاح! سيتم التوصيل خلال 3 أيام.");
  window.location.href = "review.html";
}

// إرسال التقييم
function submitReview() {
  const rating = document.querySelector('input[name="rating"]:checked')?.value;
  if (rating) {
    alert(`تم إرسال تقييمك: ${rating} نجوم`);
    window.location.href = "buyer-dashboard.html";
  } else {
    alert("يرجى اختيار التقييم");
  }
}

// تحميل بيانات المستخدمين في لوحة الإدارة
function loadAdminUsers() {
  const container = document.getElementById("userList");
  if (!container) return;

  mockUsers.forEach(user => {
    container.innerHTML += `
      <tr>
        <td>${user.name}</td>
        <td>${user.role === "seller" ? "بائع" : "مشتري"}</td>
        <td>نشط</td>
      </tr>
    `;
  });
}

// عند تحميل الصفحة
window.addEventListener("load", () => {
  loadUserHeader();
  
  if (document.getElementById("auctionsList")) {
    loadActiveAuctions();
  }
  
  if (document.getElementById("productDetails")) {
    loadProductDetails();
  }
  
  if (document.getElementById("bidHistory")) {
    loadBidHistory();
  }
  
  if (document.getElementById("myProducts")) {
    loadMyProducts();
  }
  
  if (document.getElementById("userList")) {
    loadAdminUsers();
  }
});