"use client";

import { useState } from "react";

// 1. Définition des types TypeScript
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  badge: string | null;
  description: string;
}

interface CartItem extends Product {
  qty: number;
}

// 2. Données
const products: Product[] = [
  { id: 1, name: "Veste Cuir Noir", price: 249, category: "Vêtements", image: "🧥", badge: "Nouveau", description: "Veste en cuir véritable, coupe slim, doublure en soie." },
  { id: 2, name: "Sneakers Blanc", price: 129, category: "Chaussures", image: "👟", badge: "Bestseller", description: "Sneakers iconiques en cuir blanc, semelle coussinée." },
  { id: 3, name: "Montre Minimaliste", price: 399, category: "Accessoires", image: "⌚", badge: "Exclusif", description: "Montre Swiss made, verre saphir, bracelet cuir." },
  { id: 4, name: "Sac Tote Premium", price: 89, category: "Accessoires", image: "👜", badge: null, description: "Tote bag en toile de coton bio, anses renforcées." },
  { id: 5, name: "Pantalon Tailoring", price: 179, category: "Vêtements", image: "👖", badge: "Soldes", description: "Pantalon de tailleur en laine mélangée, coupe droite." },
  { id: 6, name: "Parfum Signature", price: 195, category: "Beauté", image: "🧴", badge: "Nouveau", description: "Eau de parfum 100ml, notes boisées et florales." },
  { id: 7, name: "Casquette Structurée", price: 59, category: "Accessoires", image: "🧢", badge: null, description: "Casquette 6 panneaux, broderie ton sur ton." },
  { id: 8, name: "Pull Cachemire", price: 319, category: "Vêtements", image: "🧶", badge: "Luxe", description: "Pull 100% cachemire grade A, col rond, 12 coloris." },
];

const categories: string[] = ["Tous", "Vêtements", "Chaussures", "Accessoires", "Beauté"];

const badgeColor: Record<string, string> = { Nouveau: "#1a6b45", Bestseller: "#7c3aed", Exclusif: "#b45309", Soldes: "#dc2626", Luxe: "#0e4f8e" };

export default function App() {
  // 3. Typage strict des Hooks
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState<string>("Tous");
  const [search, setSearch] = useState<string>("");
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [view, setView] = useState<string>("shop");
  const [toast, setToast] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<string>("default");
  const [detail, setDetail] = useState<Product | null>(null);

  // 4. Typage des paramètres de fonctions
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.name} ajouté au panier`);
  };

  const removeFromCart = (id: number) => setCart((prev) => prev.filter((i) => i.id !== id));
  
  const changeQty = (id: number, delta: number) => setCart((prev) =>
    prev.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
  );
  
  const toggleFav = (id: number) => setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  let filtered = products.filter((p) => {
    const catMatch = category === "Tous" || p.category === category;
    const searchMatch = p.name.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });
  
  if (sortBy === "asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "desc") filtered = [...filtered].sort((a, b) => b.price - a.price);

  // Typage explicite du tableau pour le footer afin d'éviter l'erreur "string | string[]"
  const footerLinks: [string, string[]][] = [
    ["Service", ["FAQ", "Livraison", "Retours", "Contact"]],
    ["Légal", ["CGV", "Confidentialité", "Mentions légales"]]
  ];

  return (
    <div style={{ fontFamily: "'Georgia', 'Times New Roman', serif", background: "#faf9f6", minHeight: "100vh", color: "#1a1814" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #faf9f6; }
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
        .product-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .btn-primary:hover { background: #1a1814 !important; color: #faf9f6 !important; }
        .btn-primary { transition: background 0.2s, color 0.2s; }
        .nav-link:hover { opacity: 0.6; }
        .nav-link { transition: opacity 0.2s; cursor: pointer; }
        .fav-btn:hover { transform: scale(1.2); }
        .fav-btn { transition: transform 0.15s; cursor: pointer; }
        input:focus { outline: none; border-bottom-color: #1a1814 !important; }
        select:focus { outline: none; }
        .cat-btn:hover { background: #1a1814 !important; color: #faf9f6 !important; }
        .toast-enter { animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .overlay { animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .cart-panel { animation: slideIn 0.3s ease; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .detail-panel { animation: fadeUp 0.3s ease; }
        @keyframes fadeUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* HEADER */}
      <header style={{ background: "#1a1814", color: "#faf9f6", padding: "0 2rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 600, letterSpacing: "0.12em" }}>MAISON</div>
          <nav style={{ display: "flex", gap: "1.5rem" }}>
            {["shop", "about"].map((v) => (
              <span key={v} className="nav-link" onClick={() => setView(v)}
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase", opacity: view === v ? 1 : 0.5, borderBottom: view === v ? "1px solid #faf9f6" : "none", paddingBottom: 2 }}>
                {v === "shop" ? "Boutique" : "À propos"}
              </span>
            ))}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, opacity: 0.5 }}>{favorites.length} favoris</span>
          <button onClick={() => setCartOpen(true)} className="btn-primary"
            style={{ background: "transparent", border: "1px solid rgba(250,249,246,0.4)", color: "#faf9f6", padding: "8px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 8, borderRadius: 2 }}>
            Panier {cartCount > 0 && <span style={{ background: "#faf9f6", color: "#1a1814", borderRadius: "50%", width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600 }}>{cartCount}</span>}
          </button>
        </div>
      </header>

      {view === "shop" && (
        <>
          {/* HERO */}
          <section style={{ background: "#1a1814", color: "#faf9f6", padding: "5rem 2rem 4rem", textAlign: "center" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.5, marginBottom: "1rem" }}>Collection Printemps 2026</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 7vw, 6rem)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.1, marginBottom: "1.5rem" }}>L'élégance<br />au quotidien</h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, opacity: 0.6, maxWidth: 480, margin: "0 auto 2.5rem", lineHeight: 1.7, fontWeight: 300 }}>Des pièces pensées pour durer, conçues avec des matières nobles, pour un style qui transcende les saisons.</p>
            <button className="btn-primary" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              style={{ background: "transparent", border: "1px solid rgba(250,249,246,0.6)", color: "#faf9f6", padding: "14px 36px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 2 }}>
              Découvrir
            </button>
          </section>

          {/* FILTERS */}
          <section style={{ padding: "2rem 2rem 1rem", borderBottom: "1px solid #e8e4dc", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {categories.map((cat) => (
                <button key={cat} className="cat-btn"
                  onClick={() => setCategory(cat)}
                  style={{ background: category === cat ? "#1a1814" : "transparent", color: category === cat ? "#faf9f6" : "#1a1814", border: "1px solid #1a1814", padding: "7px 18px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", letterSpacing: "0.06em", borderRadius: 2, transition: "all 0.2s" }}>
                  {cat}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..."
                style={{ border: "none", borderBottom: "1px solid #c8c4ba", background: "transparent", padding: "6px 2px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, width: 160, color: "#1a1814" }} />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                style={{ border: "1px solid #c8c4ba", background: "transparent", padding: "6px 10px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#1a1814", cursor: "pointer", borderRadius: 2 }}>
                <option value="default">Trier par</option>
                <option value="asc">Prix croissant</option>
                <option value="desc">Prix décroissant</option>
              </select>
            </div>
          </section>

          {/* PRODUCTS */}
          <section id="products" style={{ padding: "2.5rem 2rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "2rem" }}>
            {filtered.map((p) => (
              <div key={p.id} className="product-card" style={{ background: "#fff", border: "1px solid #e8e4dc", borderRadius: 4, overflow: "hidden", cursor: "pointer" }} onClick={() => setDetail(p)}>
                <div style={{ background: "#f0ede6", height: 220, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, position: "relative" }}>
                  {p.image}
                  {p.badge && <span style={{ position: "absolute", top: 12, left: 12, background: badgeColor[p.badge] || "#333", color: "#fff", fontSize: 10, fontFamily: "'DM Sans', sans-serif", padding: "3px 10px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{p.badge}</span>}
                  <span className="fav-btn" onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }}
                    style={{ position: "absolute", top: 12, right: 12, fontSize: 18, opacity: favorites.includes(p.id) ? 1 : 0.3 }}>
                    {favorites.includes(p.id) ? "❤️" : "🤍"}
                  </span>
                </div>
                <div style={{ padding: "1.25rem" }}>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#8a8478", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{p.category}</p>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, marginBottom: 6 }}>{p.name}</h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#6a6460", marginBottom: "1rem", lineHeight: 1.5 }}>{p.description}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600 }}>{p.price} €</span>
                    <button className="btn-primary" onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                      style={{ background: "#1a1814", color: "#faf9f6", border: "none", padding: "9px 20px", fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 2 }}>
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem", color: "#8a8478", fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: "italic" }}>Aucun produit trouvé</div>
            )}
          </section>
        </>
      )}

      {view === "about" && (
        <section style={{ maxWidth: 720, margin: "5rem auto", padding: "0 2rem" }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8478", marginBottom: "1rem" }}>Notre histoire</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontStyle: "italic", fontWeight: 400, marginBottom: "2rem", lineHeight: 1.2 }}>Créés pour durer,<br />pensés pour vous</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.9, color: "#4a4640", fontWeight: 300, marginBottom: "1.5rem" }}>Fondée en 2018, Maison est née d'une conviction : la mode durable n'est pas synonyme de compromis sur le style. Chaque pièce est conçue en partenariat avec des artisans européens, dans le respect des traditions et de l'environnement.</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.9, color: "#4a4640", fontWeight: 300 }}>Nos matières sont sélectionnées pour leur qualité, leur traçabilité et leur impact réduit. Nous croyons en la beauté qui persiste, en l'élégance qui ne se démade pas.</p>
        </section>
      )}

      {/* CART PANEL */}
      {cartOpen && (
        <div className="overlay" style={{ position: "fixed", inset: 0, background: "rgba(26,24,20,0.5)", zIndex: 200 }} onClick={() => setCartOpen(false)}>
          <div className="cart-panel" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: Math.min(440, window.innerWidth), background: "#faf9f6", padding: "2rem", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid #e8e4dc", paddingBottom: "1rem" }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600 }}>Votre panier</h2>
              <span style={{ cursor: "pointer", fontSize: 20, opacity: 0.4 }} onClick={() => setCartOpen(false)}>✕</span>
            </div>
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 0", fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontStyle: "italic", color: "#8a8478" }}>Votre panier est vide</div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid #e8e4dc", alignItems: "center" }}>
                    <div style={{ background: "#f0ede6", width: 70, height: 70, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0, borderRadius: 2 }}>{item.image}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600, marginBottom: 4 }}>{item.name}</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#8a8478" }}>{item.price} €</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                        <button onClick={() => changeQty(item.id, -1)} style={{ width: 26, height: 26, border: "1px solid #c8c4ba", background: "transparent", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2 }}>−</button>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                        <button onClick={() => changeQty(item.id, 1)} style={{ width: 26, height: 26, border: "1px solid #c8c4ba", background: "transparent", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2 }}>+</button>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{item.price * item.qty} €</p>
                      <span onClick={() => removeFromCart(item.id)} style={{ cursor: "pointer", fontSize: 12, color: "#8a8478", fontFamily: "'DM Sans', sans-serif", textDecoration: "underline" }}>Retirer</span>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #e8e4dc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#8a8478" }}>Sous-total</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>{total} €</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#8a8478" }}>Livraison</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#1a6b45" }}>Gratuite</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600 }}>Total</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600 }}>{total} €</span>
                  </div>
                  <button className="btn-primary" onClick={() => { showToast("Commande confirmée ! Merci 🎉"); setCart([]); setCartOpen(false); }}
                    style={{ width: "100%", background: "#1a1814", color: "#faf9f6", border: "none", padding: "16px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", borderRadius: 2 }}>
                    Commander — {total} €
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detail && (
        <div className="overlay" style={{ position: "fixed", inset: 0, background: "rgba(26,24,20,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }} onClick={() => setDetail(null)}>
          <div className="detail-panel" style={{ background: "#faf9f6", borderRadius: 4, maxWidth: 560, width: "100%", overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: "#f0ede6", height: 260, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96, position: "relative" }}>
              {detail.image}
              <span style={{ position: "absolute", top: 16, right: 16, cursor: "pointer", fontSize: 20, opacity: 0.5, background: "#faf9f6", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setDetail(null)}>✕</span>
            </div>
            <div style={{ padding: "2rem" }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#8a8478", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{detail.category}</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, marginBottom: 12 }}>{detail.name}</h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#4a4640", lineHeight: 1.7, marginBottom: "1.5rem", fontWeight: 300 }}>{detail.description}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600 }}>{detail.price} €</span>
                <button className="btn-primary" onClick={() => { addToCart(detail); setDetail(null); }}
                  style={{ background: "#1a1814", color: "#faf9f6", border: "none", padding: "12px 28px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 2 }}>
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="toast-enter" style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: "#1a1814", color: "#faf9f6", padding: "12px 28px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, borderRadius: 2, zIndex: 300, whiteSpace: "nowrap", letterSpacing: "0.04em" }}>
          {toast}
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ background: "#1a1814", color: "#faf9f6", padding: "3rem 2rem", marginTop: "4rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem" }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, letterSpacing: "0.12em", marginBottom: "1rem" }}>MAISON</div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, opacity: 0.5, lineHeight: 1.7, fontWeight: 300 }}>Mode durable, matières nobles, artisanat européen.</p>
        </div>
        {footerLinks.map(([title, links]) => (
          <div key={title as string}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.4, marginBottom: "1rem" }}>{title}</p>
            {(links as string[]).map((l: string) => <p key={l} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, opacity: 0.6, marginBottom: 8, cursor: "pointer" }}>{l}</p>)}
          </div>
        ))}
        <div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.4, marginBottom: "1rem" }}>Newsletter</p>
          <div style={{ display: "flex", gap: 0 }}>
            <input placeholder="votre@email.com" style={{ flex: 1, border: "none", borderBottom: "1px solid rgba(250,249,246,0.3)", background: "transparent", color: "#faf9f6", padding: "8px 4px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none" }} />
            <button style={{ background: "transparent", border: "none", color: "#faf9f6", cursor: "pointer", fontSize: 18, paddingLeft: 12, opacity: 0.6 }}>→</button>
          </div>
        </div>
      </footer>
    </div>
  );
}