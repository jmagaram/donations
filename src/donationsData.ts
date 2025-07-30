import { create } from "./organization";
import type { DonationsData, Org } from "./types";

export const empty = (): DonationsData => ({
  orgs: [],
});

export const orgAdd = (data: DonationsData, org: Org): DonationsData => {
  return {
    ...data,
    orgs: [...data.orgs, org],
  };
};

export const orgUpdate = (
  data: DonationsData,
  org: Org
): DonationsData | undefined => {
  const orgIndex = data.orgs.findIndex((org) => org.id === org.id);
  if (orgIndex === -1) {
    return undefined;
  }
  const orgs = [...data.orgs];
  orgs[orgIndex] = org;
  return {
    ...data,
    orgs: orgs,
  };
};

export const orgDelete = (data: DonationsData, id: string): DonationsData => {
  const orgIndex = data.orgs.findIndex((org) => org.id === id);
  if (orgIndex === -1) {
    return data;
  }
  return {
    ...data,
    orgs: data.orgs.filter((org) => org.id !== id),
  };
};

const sampleDataArray = [
  {
    name: "Hillel",
    taxDeductible: true,
    notes: "Jewish student life on campus",
  },
  {
    name: "Brothers for Life",
    taxDeductible: true,
    notes: "Helping injured IDF soldiers",
  },
  {
    name: "Friendship Circle",
    taxDeductible: true,
    notes: "Families with special needs children",
  },
  {
    name: "Rainier Prep",
    taxDeductible: true,
    notes: "Charter school in Seattle",
  },
  {
    name: "AIPAC",
    taxDeductible: false,
    notes: "American Israel Public Affairs Committee",
  },
];

export const sampleData = (): DonationsData => {
  return sampleDataArray.reduce<DonationsData>(
    (data, org) => orgAdd(data, create(org)),
    empty()
  );
};
