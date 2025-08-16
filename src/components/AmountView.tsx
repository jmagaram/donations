import React from "react";
import { formatUSD } from "../amount";
import KindBadge from "./KindBadge";

interface AmountViewProps {
  amount: number;
  showPennies: boolean;
  isPledge?: boolean;
  isIdea?: boolean;
  isWarning?: boolean;
}

const AmountView: React.FC<AmountViewProps> = ({
  amount,
  showPennies,
  isPledge,
  isIdea,
  isWarning,
}) => {
  const badges: Array<"pledge" | "idea" | "warning"> = [];
  if (isPledge) badges.push("pledge");
  if (isIdea) badges.push("idea");
  if (isWarning) badges.push("warning");
  const isZero = Math.abs(amount) < 0.005;
  return (
    <span className={`amount-view${isZero ? " zero" : ""}`}>
      {badges.map((kind, idx) => (
        <KindBadge key={idx} kind={kind} />
      ))}
      <span>
        {formatUSD(amount, showPennies ? "showPennies" : "hidePennies")}
      </span>
    </span>
  );
};

export default AmountView;
