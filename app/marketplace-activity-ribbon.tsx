"use client";

import { useEffect, useState } from "react";

const LIVE_SOCIAL_PROOF_UPDATES = [
  { icon: "\u{1F525}", lead: "TRENDING", accent: "AirPods Pro", tail: "Get yours sourced in ZMW" },
  { icon: "\u{1F4FA}", lead: "BIG SCREEN", accent: "Samsung Smart TVs", tail: "Ask us to source yours" },
  { icon: "\u{2708}\u{FE0F}", lead: "ON THE MOVE", accent: "Guangzhou cargo", tail: "heading to Lusaka" },
  { icon: "\u{1F6CD}\u{FE0F}", lead: "STYLE PICK", accent: "Shein fashion finds", tail: "Request a custom quote" },
  { icon: "\u{26A1}", lead: "POWER UP", accent: "Solar inverters", tail: "available to source" },
  { icon: "\u{1F3A7}", lead: "SOUND ON", accent: "Sony headphones", tail: "and audio gear" },
  { icon: "\u{1F4E6}", lead: "FROM ANYWHERE", accent: "Sourced for you", tail: "delivered across Zambia" },
  { icon: "\u{1F4AC}", lead: "CAN'T FIND IT?", accent: "Send us a photo", tail: "and we'll help source it" }
];

export default function MarketplaceActivityRibbon() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % LIVE_SOCIAL_PROOF_UPDATES.length);
    }, 4500);
    return () => window.clearInterval(interval);
  }, []);

  const update = LIVE_SOCIAL_PROOF_UPDATES[active];

  return (
    <section className="nx-ribbon" aria-label="How Nicho-Xpress helps shoppers">
      <div className="nx-ribbon-inner">
        <span className="nx-ribbon-label"><span className="nx-live-dot" aria-hidden="true" /> LIVE NOW</span>
        <div className="nx-ribbon-message" key={active}>
          <span className="nx-ribbon-icon" aria-hidden="true">{update.icon}</span>
          <span className="nx-ribbon-copy"><strong>{update.lead}</strong> <b>{update.accent}</b> <span>{update.tail}</span></span>
        </div>
        <div className="nx-ribbon-facts">
          <span><i aria-hidden="true">&#10003;</i> QUOTES IN ZMW</span>
          <span><i aria-hidden="true">&#8599;</i> SOURCING SUPPORT</span>
        </div>
      </div>
    </section>
  );
}
