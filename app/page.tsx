import ProductSearch from "./product-search";
import CatalogNav from "./catalog-nav";
import FeaturedProducts from "./featured-products";
import MarketplaceOverlays, { MarketplaceHeaderActions, MarketplaceRequestButton } from "./marketplace-overlays";
import MarketplaceActivityRibbon from "./marketplace-activity-ribbon";

const steps = [
  {
    number: "1",
    title: "Search or share a link",
    copy: "Browse a few finds or send us the exact item you have in mind.",
  },
  {
    number: "2",
    title: "We check the details",
    copy: "We review availability, sourcing options and delivery for your item.",
  },
  {
    number: "3",
    title: "Review your kwacha quote",
    copy: "See the full price before you decide whether to go ahead.",
  },
];

export default function Home() {
  return (
    <div className="nx-marketplace" id="top">
      <div className="nx-announcement">
        <div className="nx-announcement-inner">
          <div className="nx-announcement-location">
            <span className="nx-country-tag">🇿🇲 Nationwide Zambia</span>
            <span className="nx-announcement-cities">Local delivery and sourcing support across Zambia</span>
          </div>
          <div className="nx-announcement-actions">
            <span className="nx-verified"><span aria-hidden="true">✓</span> Local help, clear quotes</span>
            <a className="nx-admin-link" href="/admin/login">Admin Portal <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </div>

      <header className="nx-header">
        <div className="nx-header-inner">
          <a className="nx-brand" href="#top" aria-label="Nicho-Xpress home">
            <span className="nx-brand-mark">N<span>🇿🇲</span></span>
            <span className="nx-brand-copy">
              <strong>Nicho<span>-Xpress</span></strong>
              <small>Zambia&apos;s Anything Store</small>
            </span>
          </a>
          <div className="nx-global-search"><ProductSearch /></div>
          <MarketplaceHeaderActions />
        </div>
      </header>

      <CatalogNav />
      <MarketplaceActivityRibbon />

      <section className="nx-process" aria-labelledby="process-title">
        <div className="nx-content-width">
          <div className="nx-process-heading">
            <span className="nx-eyebrow">HOW NICHO-XPRESS WORKS</span>
            <h1 id="process-title">If it exists anywhere, <span>we&apos;ll help you find it.</span></h1>
          </div>
          <div className="nx-process-steps">
            {steps.map((step) => (
              <article className="nx-process-card" key={step.number}>
                <span className="nx-process-number">{step.number}</span>
                <div><h2>{step.title}</h2><p>{step.copy}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <main className="nx-content-width nx-catalog" id="shop">
        <div className="nx-catalog-heading">
          <div>
            <span className="nx-eyebrow">A FEW PLACES TO START</span>
            <h2>Shop our <span>featured finds.</span></h2>
          </div>
          <p>Browse items we can help with. Your quote will confirm availability and the full delivered price.</p>
        </div>
        <FeaturedProducts />
        <p className="nx-catalog-note"><span aria-hidden="true">✳</span> Listed item prices do not include delivery unless your quote says otherwise.</p>
      </main>

      <footer className="nx-footer">
        <div className="nx-content-width nx-footer-grid">
          <div className="nx-footer-brand">
            <a className="nx-brand nx-brand-footer" href="#top" aria-label="Nicho-Xpress home">
              <span className="nx-brand-mark">N</span>
              <span className="nx-brand-copy"><strong>Nicho<span>-Xpress</span></strong></span>
            </a>
            <p>Your local point of contact for sourcing, quotes and delivery updates.</p>
          </div>
          <div>
            <h2>How we help</h2>
            <p>Share a product link or description. We&apos;ll check whether we can source it and send you the details in Zambian kwacha.</p>
          </div>
          <div>
            <h2>Delivery</h2>
            <p>Delivery and collection options depend on the item and route. We&apos;ll confirm the available options in your quote.</p>
          </div>
          <div className="nx-footer-cta">
            <h2>Looking for something else?</h2>
            <p>Tell us what you need and our team will take a look.</p>
            <MarketplaceRequestButton />
          </div>
        </div>
        <div className="nx-content-width nx-footer-bottom">
          <span>© {new Date().getFullYear()} Nicho-Xpress Zambia</span>
          <span>Quotes and prices are shown in Zambian kwacha (ZMW).</span>
        </div>
      </footer>

      <MarketplaceOverlays />
    </div>
  );
}
