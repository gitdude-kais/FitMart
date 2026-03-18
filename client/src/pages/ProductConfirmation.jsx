import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ProductConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef(null);

  const { items = [], total = 0, paymentId = "" } = location.state || {};

  // Guard
  useEffect(() => {
    if (!items.length) navigate("/");
  }, [items, navigate]);

  // Entrance animation
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    setTimeout(() => el.classList.add("visible"), 80);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        .fade-up { opacity:0; transform:translateY(28px); transition: opacity .7s ease, transform .7s ease; }
        .fade-up.visible { opacity:1; transform:translateY(0); }
        .delay-1 { transition-delay:.1s; }
        .delay-2 { transition-delay:.25s; }
        .delay-3 { transition-delay:.4s; }
      `}</style>

      <div className="max-w-2xl mx-auto px-5 py-20">

        {/* Success badge */}
        <div ref={headerRef} className="fade-up text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16
                          bg-stone-900 rounded-full mb-6">
            <span className="text-white text-2xl">✓</span>
          </div>
          <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-2">
            Order Confirmed
          </p>
          <h1 style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-4xl md:text-5xl text-stone-900 mb-3">
            Payment Successful
          </h1>
          <p className="text-sm text-stone-500">
            Thank you for shopping with FitMart.
          </p>
          {paymentId && (
            <p className="text-xs text-stone-400 mt-2 font-mono">
              Payment ID: {paymentId}
            </p>
          )}
        </div>

        {/* Purchased items */}
        <div className="fade-up delay-1 bg-white border border-stone-200 rounded-2xl
                        overflow-hidden mb-5">
          <div className="px-7 py-5 border-b border-stone-100">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400">
              Items Purchased
            </p>
          </div>

          <div className="divide-y divide-stone-100">
            {items.map(({ product, quantity }) => (
              <div key={product.productId}
                className="flex items-center gap-5 px-7 py-5">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-xl bg-stone-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-stone-400 mb-0.5">
                    {product.brand}
                  </p>
                  <p style={{ fontFamily: "'DM Serif Display', serif" }}
                    className="text-lg text-stone-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">Qty {quantity}</p>
                </div>
                <p style={{ fontFamily: "'DM Serif Display', serif" }}
                  className="text-xl text-stone-900 flex-shrink-0">
                  ₹{(product.price * quantity).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>

          {/* Total row */}
          <div className="px-7 py-5 bg-stone-50 border-t border-stone-200
                          flex justify-between items-center">
            <span className="text-sm text-stone-500">Total Paid</span>
            <span style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-3xl text-stone-900">
              ₹{total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="fade-up delay-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-stone-900 text-white text-sm px-8 py-3.5
                       rounded-full hover:bg-stone-700 transition-colors text-center"
          >
            Go to Home
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="flex-1 border border-stone-300 text-stone-700 text-sm px-8 py-3.5
                       rounded-full hover:bg-stone-100 transition-colors text-center"
          >
            View Orders
          </button>
        </div>

        <p className="fade-up delay-3 text-xs text-stone-400 text-center mt-8">
          A confirmation email will be sent to your registered address.
        </p>
      </div>
    </div>
  );
}