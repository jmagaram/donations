import React from "react";
import { formatUSD } from "../amount";
import KindBadge from "./KindBadge";
import type { DonationKind } from "../donation";

type AmountViewProps =
  | {
      type: "single";
      amount: number;
      showPennies: boolean;
      showWarning: boolean;
      badge: DonationKind | undefined;
    }
  | {
      type: "aggregate";
      amount: number;
      showPennies: boolean;
      showWarning: boolean;
      paidBadge: boolean;
      pledgeBadge: boolean;
      ideaBadge: boolean;
    };

const AmountView: React.FC<AmountViewProps> = (props) => {
  const amount = props.amount;
  const showPennies = props.showPennies;
  const isZero = Math.abs(amount) < 0.005;
  const badges: Array<DonationKind | "warning"> = [];
  if (props.showWarning) badges.push("warning");
  if (!isZero) {
    if (props.type === "single") {
      if (props.badge) badges.push(props.badge);
    } else if (props.type === "aggregate") {
      if (props.paidBadge) badges.push("paid");
      if (props.pledgeBadge) badges.push("pledge");
      if (props.ideaBadge) badges.push("idea");
    }
  }
  return (
    <span className={"amount-view"}>
      {badges.map((kind, idx) => (
        <KindBadge key={idx} kind={kind} />
      ))}
      <span className={`${isZero ? " zero" : ""}`}>
        {formatUSD(amount, showPennies ? "showPennies" : "hidePennies")}
      </span>
    </span>
  );
};

export default AmountView;
