import { useState, useEffect } from "react";
import { donationTextMatch } from "./donation";
import { getCurrentYear, extractYear, compareDatesDesc } from "./date";
import { type DonationsData } from "./types";
import DonationsView, { type DonationDisplay } from "./DonationsView";

interface DonationsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const DonationsContainer = ({ donationsData }: DonationsContainerProps) => {
  const [filter, setFilter] = useState("");

  const currentYear = getCurrentYear();

  const years = donationsData.donations.map((d) => extractYear(d.date));
  const minYear = years.length > 0 ? Math.min(...years) : currentYear;
  const maxYear = years.length > 0 ? Math.max(...years) : currentYear;
  const [yearFrom, setYearFrom] = useState(currentYear - 5);
  const [yearTo, setYearTo] = useState(maxYear);

  useEffect(() => {
    setYearTo(maxYear);
  }, [maxYear]);

  const getOrgName = (orgId: string) => {
    const org = donationsData.orgs.find((o) => o.id === orgId);
    return org?.name || "Unknown Organization";
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const [amountMin, setAmountMin] = useState(0);
  const [amountMax, setAmountMax] = useState(Number.POSITIVE_INFINITY);

  const donations: DonationDisplay[] = [...donationsData.donations]
    .filter((d) => {
      const year = extractYear(d.date);
      const amt = d.amount;
      const matchesYear = year >= yearFrom && year <= yearTo;
      const matchesAmount =
        amt >= amountMin &&
        (amountMax === Number.POSITIVE_INFINITY || amt <= amountMax);
      const org = donationsData.orgs.find((o) => o.id === d.orgId) || {
        name: "",
        notes: "",
      };
      const matchesText =
        filter.trim() === "" || donationTextMatch(filter, d, org);
      return matchesYear && matchesAmount && matchesText;
    })
    .sort((a, b) => compareDatesDesc(a.date, b.date))
    .map((donation) => ({
      id: donation.id,
      date: donation.date,
      amount: formatAmount(donation.amount),
      orgId: donation.orgId,
      orgName: getOrgName(donation.orgId),
      kind: donation.kind,
      notes: donation.notes,
    }));

  const handleYearFilterChanged = (from: number, to: number) => {
    if (from > to) {
      setYearFrom(to);
      setYearTo(from);
    } else {
      setYearFrom(from);
      setYearTo(to);
    }
  };

  const handleAmountFilterChanged = (min: number, max: number) => {
    if (min > max) {
      setAmountMin(max);
      setAmountMax(min);
    } else {
      setAmountMin(min);
      setAmountMax(max);
    }
  };

  const handleClearFilters = () => {
    setFilter("");
    setYearFrom(getCurrentYear() - 5);
    setYearTo(maxYear);
    setAmountMin(0);
    setAmountMax(Number.POSITIVE_INFINITY);
  };

  return (
    <DonationsView
      donations={donations}
      currentFilter={filter}
      textFilterChanged={setFilter}
      yearFrom={yearFrom}
      yearTo={yearTo}
      minYear={minYear}
      maxYear={maxYear}
      yearFilterChanged={handleYearFilterChanged}
      amountMin={amountMin}
      amountMax={amountMax}
      amountFilterChanged={handleAmountFilterChanged}
      onClearFilters={handleClearFilters}
    />
  );
};

export default DonationsContainer;
