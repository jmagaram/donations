import type { DonationKind } from "./donation";

interface KindBadgeProps {
  kind: DonationKind;
}

const getKindSymbol = (kind: DonationKind) => {
  switch (kind) {
    case "paid":
      return { symbol: "●", className: "kind-badge-paid", title: "Paid" };
    case "pledge":
      return { symbol: "▢", className: "kind-badge-pledge", title: "Pledge" };
    case "idea":
      return { symbol: "☆", className: "kind-badge-idea", title: "Idea" };
    case "unknown":
      return { symbol: "?", className: "kind-badge-unknown", title: "Unknown" };
  }
};

const KindBadge = ({ kind }: KindBadgeProps) => {
  const badge = getKindSymbol(kind);

  return (
    <span className={`kind-badge ${badge.className}`} title={badge.title}>
      {badge.symbol}
    </span>
  );
};

export default KindBadge;
