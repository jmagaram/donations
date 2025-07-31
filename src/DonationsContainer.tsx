import { useState } from "react";
import { type DonationsData } from "./types";
import DonationsView, { type DonationDisplay } from "./DonationsView";

interface DonationsContainerProps {
  donationsData: DonationsData;
  setDonationsData: (data: DonationsData) => void;
}

const DonationsContainer = ({ donationsData }: DonationsContainerProps) => {
  const [filter, setFilter] = useState("");

  // Get all years from donation timestamps
  const years = donationsData.donations.map((d) =>
    new Date(d.timestamp).getFullYear()
  );
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  // Default: most recent year
  const [yearFrom, setYearFrom] = useState(maxYear);
  const [yearTo, setYearTo] = useState(maxYear);

  // Helper to get org name by id
  const getOrgName = (orgId: string) => {
    const org = donationsData.orgs.find((o) => o.id === orgId);
    return org?.name || "Unknown Organization";
  };

  // Format date and amount
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toISOString().split("T")[0];
  };
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Prepare and sort donations for display, filter by year
  const donations: DonationDisplay[] = [...donationsData.donations]
    .filter((d) => {
      const year = new Date(d.timestamp).getFullYear();
      return year >= yearFrom && year <= yearTo;
    })
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((donation) => ({
      id: donation.id,
      date: formatDate(donation.timestamp),
      amount: formatAmount(donation.amount),
      orgName: getOrgName(donation.orgId),
      kind: donation.kind,
      notes: donation.notes,
    }));

  const handleYearFilterChanged = (from: number, to: number) => {
    // Ensure from <= to
    if (from > to) {
      setYearFrom(to);
      setYearTo(from);
    } else {
      setYearFrom(from);
      setYearTo(to);
    }
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
    />
  );
};

export default DonationsContainer;

// date filter
// amount filter
// org name or notes filter
// donation notes filter

// From: 2024 to 2026
// Value: $200 to $5000
// Text: Brothers
