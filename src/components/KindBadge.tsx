import type { DonationKind } from "../donation";

interface KindBadgeProps {
  kind: DonationKind | "warning";
}

const getKindSymbol = (kind: DonationKind | "warning") => {
  switch (kind) {
    case "paid":
      return { symbol: "•", className: "kind-badge-paid" };
    case "pledge":
      return { symbol: "□", className: "kind-badge-pledge" };
    case "idea":
      return { symbol: "☆", className: "kind-badge-idea" };
    case "warning":
      return { symbol: "◆", className: "kind-badge-warning" };
  }
};

const KindBadge = ({ kind }: KindBadgeProps) => {
  const badge = getKindSymbol(kind);

  return (
    <span className={`kind-badge ${badge.className}`}>{badge.symbol}</span>
  );
};

export default KindBadge;
