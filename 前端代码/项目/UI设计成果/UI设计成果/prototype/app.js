const categories = [
  { name: "教材资料", desc: "考研书、专业课本、四六级资料", tone: "书" },
  { name: "宿舍好物", desc: "台灯、小家电、收纳桌椅", tone: "宿" },
  { name: "骑行代步", desc: "自行车、电动车、头盔配件", tone: "行" },
  { name: "美妆衣物", desc: "衣物置换、护肤彩妆、演出服", tone: "衣" },
];

const products = [
  { id: 1, title: "软件工程导论教材", category: "教材资料", price: 28, condition: "八成新", place: "图书馆东门", seller: "林同学", credit: 98, letter: "书", tags: ["本校认证", "可验货", "当天交易"], desc: "课堂教材，重点页有少量笔记，适合软件工程课程复习。" },
  { id: 2, title: "可折叠宿舍台灯", category: "宿舍好物", price: 35, condition: "九成新", place: "北区食堂", seller: "周同学", credit: 95, letter: "灯", tags: ["亮度可调", "自提", "无损坏"], desc: "三档亮度，USB 充电，适合宿舍书桌和考研自习。" },
  { id: 3, title: "山地自行车", category: "骑行代步", price: 260, condition: "轻微使用痕迹", place: "南门停车棚", seller: "陈同学", credit: 91, letter: "车", tags: ["可试骑", "带车锁", "线下自提"], desc: "适合校内通勤，刹车正常，附赠密码锁。" },
  { id: 4, title: "面试正装外套", category: "美妆衣物", price: 48, condition: "九成新", place: "西区宿舍楼下", seller: "许同学", credit: 97, letter: "衣", tags: ["可置换", "尺码 M", "干净无污"], desc: "参加答辩和面试都合适，支持同校同学当面确认尺码。" },
  { id: 5, title: "考研英语真题套装", category: "教材资料", price: 22, condition: "八成新", place: "二教大厅", seller: "黄同学", credit: 94, letter: "题", tags: ["资料齐全", "价格低", "可自提"], desc: "2010-2025 真题，部分解析有标注，适合冲刺复习。" },
];

const wantedItems = [
  { title: "求购二手显示器", desc: "预算 180 元以内，希望 24 寸，南区交易。", match: "匹配到 2 位历史卖家" },
  { title: "求一本概率论教材", desc: "希望无缺页，能在图书馆附近自提。", match: "匹配到 1 件教材资料" },
  { title: "求宿舍收纳架", desc: "女生宿舍自提优先，价格可商量。", match: "等待匹配" },
];

const chats = [
  { title: "周同学 · 可折叠宿舍台灯", desc: "约北区食堂 18:30 当面验货。", status: "待确认" },
  { title: "林同学 · 软件工程导论教材", desc: "卖家已发送教材实拍图。", status: "可交易" },
  { title: "系统提醒", desc: "请勿脱离平台私下转账，建议当面验货后付款。", status: "安全提示" },
];

const adminItems = [
  { title: "身份审核：20231234", desc: "校园邮箱已验证，等待学号一致性确认。", status: "通过" },
  { title: "举报工单：恶意引流", desc: "商品描述命中高频引流话术，建议先下架复核。", status: "下架" },
  { title: "分类维护：骑行代步", desc: "新增头盔配件标签，便于分区风控。", status: "更新" },
];

const screenTitles = { home: "校易助", market: "分类检索", detail: "商品详情", publish: "发布闲置", wanted: "求购区", messages: "交易消息", profile: "个人中心", verify: "实名认证", report: "匿名举报", admin: "管理员审核" };

let currentCategory = "全部";
let currentProduct = products[0];
const favoriteIds = new Set([2]);

function $(s) { return document.querySelector(s); }
function $all(s) { return Array.from(document.querySelectorAll(s)); }

function showToast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); window.setTimeout(() => t.classList.remove("show"), 1800); }

function setScreen(name) {
  $all(".screen").forEach(s => s.classList.toggle("active", s.dataset.screen === name));
  $all(".tabbar button").forEach(b => b.classList.toggle("active", b.dataset.go === name));
  $("#screen-title").textContent = screenTitles[name] || "校易助";
}

function renderCategories() {
  $("#category-grid").innerHTML = categories.map(c => `<button class="category-card" type="button" data-category="${c.name}"><strong>${c.tone} · ${c.name}</strong><span>${c.desc}</span></button>`).join("");
}

function productCard(p, compact) {
  const fav = favoriteIds.has(p.id) ? "active" : "";
  const tags = p.tags.map(t => `<span class="tag">${t}</span>`).join("");
  return `<article class="product-card"><button class="product-photo" type="button" data-detail="${p.id}" aria-label="查看${p.title}">${p.letter}</button><div class="product-body"><div class="product-title-row"><h3>${p.title}</h3><button class="favorite-btn ${fav}" type="button" data-favorite="${p.id}" aria-label="收藏">♥</button></div><div class="tag-row">${tags}</div><p class="product-meta">${p.condition} · ${p.place}</p><div class="seller-row"><strong class="price">¥${p.price}</strong><span>${p.seller} · 信用 ${p.credit}</span></div>${compact ? "" : `<div class="product-actions"><button class="secondary-btn" type="button" data-detail="${p.id}">看详情</button><button class="primary-btn" type="button" data-contact="${p.id}">联系卖家</button></div>`}</div></article>`;
}

function renderProducts() {
  $("#home-products").innerHTML = products.slice(0, 4).map(p => productCard(p, true)).join("");
  renderMarketProducts();
}

function renderFilters() {
  const names = ["全部", ...categories.map(c => c.name)];
  $("#filter-bar").innerHTML = names.map(n => `<button class="chip ${n === currentCategory ? "active" : ""}" type="button" data-filter="${n}">${n}</button>`).join("");
}

function getFilteredProducts() {
  const q = ($("#market-search").value || $("#search-input").value || "").trim();
  const sort = $("#sort-select").value;
  let r = products.filter(p => currentCategory === "全部" || p.category === currentCategory);
  if (q) r = r.filter(p => [p.title, p.category, p.place, p.seller].join(" ").includes(q));
  if (sort === "price-low") r.sort((a, b) => a.price - b.price);
  if (sort === "credit") r.sort((a, b) => b.credit - a.credit);
  if (sort === "new") r.sort((a, b) => b.id - a.id);
  return r;
}

function renderMarketProducts() {
  const r = getFilteredProducts();
  $("#result-count").textContent = `${r.length} 件商品`;
  $("#market-products").innerHTML = r.length ? r.map(p => productCard(p)).join("") : `<div class="wanted-item"><h3>暂无匹配商品</h3><p>可以去求购区发布需求，系统会自动匹配历史卖家。</p></div>`;
}

function renderDetail(p) {
  currentProduct = p;
  $("#detail-view").innerHTML = `<div class="detail-image">${p.letter}</div><div class="product-title-row"><h2>${p.title}</h2><strong class="price">¥${p.price}</strong></div><p class="detail-sub">${p.condition} · ${p.category} · ${p.place}</p><div class="tag-row">${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div><p>${p.desc}</p><div class="seller-row"><span>${p.seller}</span><span class="credit-badge">信用 ${p.credit}</span></div><div class="detail-actions"><button class="secondary-btn" type="button" data-go="report">举报</button><button class="primary-btn" type="button" data-contact="${p.id}">联系卖家</button></div>`;
}

function renderWanted() {
  $("#wanted-list").innerHTML = wantedItems.map(i => `<article class="wanted-item"><h3>${i.title}</h3><p>${i.desc}</p><span class="status-pill">${i.match}</span></article>`).join("");
}

function renderChats() {
  $("#chat-list").innerHTML = chats.map(c => `<article class="chat-card"><h3>${c.title}</h3><p>${c.desc}</p><span class="status-pill">${c.status}</span></article>`).join("");
}

function renderAdmin() {
  $("#admin-list").innerHTML = adminItems.map(a => `<article class="admin-item"><h3>${a.title}</h3><p>${a.desc}</p><button class="secondary-btn" type="button" data-admin-action="${a.status}">${a.status}</button></article>`).join("");
}

document.addEventListener("click", e => {
  const go = e.target.closest("[data-go]");
  if (go) setScreen(go.dataset.go);
  const cat = e.target.closest("[data-category]");
  if (cat) { currentCategory = cat.dataset.category; renderFilters(); renderMarketProducts(); setScreen("market"); }
  const filter = e.target.closest("[data-filter]");
  if (filter) { currentCategory = filter.dataset.filter; renderFilters(); renderMarketProducts(); }
  const detail = e.target.closest("[data-detail]");
  if (detail) { const p = products.find(i => i.id === Number(detail.dataset.detail)); renderDetail(p); setScreen("detail"); }
  const fav = e.target.closest("[data-favorite]");
  if (fav) { const id = Number(fav.dataset.favorite); if (favoriteIds.has(id)) { favoriteIds.delete(id); showToast("已取消收藏"); } else { favoriteIds.add(id); showToast("已加入收藏"); } renderProducts(); }
  const contact = e.target.closest("[data-contact]");
  if (contact) { const p = products.find(i => i.id === Number(contact.dataset.contact)); showToast(`已发起与${p.seller}的安全联系`); setScreen("messages"); }
  const admin = e.target.closest("[data-admin-action]");
  if (admin) showToast(`已模拟执行：${admin.dataset.adminAction}`);
});

$("#search-btn").addEventListener("click", () => { $("#market-search").value = $("#search-input").value; setScreen("market"); renderMarketProducts(); });
$("#market-search-btn").addEventListener("click", () => { renderMarketProducts(); showToast("已按关键词和分类筛选"); });
$("#sort-select").addEventListener("change", renderMarketProducts);
$("#publish-form").addEventListener("submit", e => { e.preventDefault(); $("#publish-feedback").textContent = "发布成功：商品将进入推荐列表，并展示本校认证与信用分。"; showToast("发布成功，等待买家联系"); });
$("#verify-form").addEventListener("submit", e => { e.preventDefault(); $("#verify-feedback").textContent = "认证已提交：系统将核验学号与校园邮箱一致性。"; showToast("认证申请已提交"); });
$("#report-form").addEventListener("submit", e => { e.preventDefault(); $("#report-feedback").textContent = "举报已匿名提交：系统初筛后将进入管理员工单。"; showToast("举报已匿名提交"); });
$("#wanted-btn").addEventListener("click", () => { const input = $("#wanted-input"); if (!input.value.trim()) { showToast("请先填写求购需求"); return; } wantedItems.unshift({ title: "我的求购", desc: input.value.trim(), match: "正在智能匹配" }); input.value = ""; renderWanted(); showToast("求购已发布"); });
$("#match-btn").addEventListener("click", () => showToast("已模拟匹配历史卖家和相似商品"));
$("#notify-btn").addEventListener("click", () => showToast("你有 2 条交易提醒"));

renderCategories();
renderFilters();
renderProducts();
renderDetail(products[0]);
renderWanted();
renderChats();
renderAdmin();