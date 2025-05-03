// بيانات مستخدمين وهمية
const mockUsers = [
  { id: 1, email: "seller@example.com", password: "123", role: "seller", name: "أحمد البائع" },
  { id: 2, email: "buyer@example.com", password: "123", role: "buyer", name: "خالد المشتري" }
];

// بيانات منتجات وهمية
const mockProducts = [
  {
    id: 1,
    name: "سيارة تويوتا 2018",
    description: "حالة ممتازة، صيانة منتظمة، كيلومترات قليلة",
    startingPrice: 50000,
    currentPrice: 60000,
    endTime: new Date(Date.now() + 3600000).toISOString(), // بعد ساعة
    images: ["images/download.jpeg"],
    bids: []
  },
  {
    id: 2,
    name: "تابلت سامسونج",
    description: "شاشة 10 إنش، ذاكرة 64 جيجا، حالة ممتازة",
    startingPrice: 1500,
    currentPrice: 2000,
    endTime: new Date(Date.now() + 7200000).toISOString(), // بعد ساعتين
    images: ["images/shopping.webp"],
    bids: []
  }
];

// بيانات المزايدات
const mockBids = [];

// بيانات التقييمات
const mockRatings = [];

// مستخدم مسجل دخوله
let currentUser = null;

// إضافة منتج جديد
function addMockProduct(product) {
  product.id = mockProducts.length ? Math.max(...mockProducts.map(p => p.id)) + 1 : 1;
  product.bids = [];
  mockProducts.push(product);
}

// إضافة مزايدة
function addMockBid(productId, bidData) {
  const product = mockProducts.find(p => p.id === productId);
  if (product) {
    product.bids.push(bidData);
    product.currentPrice = bidData.amount;
  }
}