import { create } from "./organization";
import { type Donation, type DonationsData, type Org } from "./types";
import { createDonation } from "./donation";

export const empty = (): DonationsData => ({
  orgs: [],
  donations: [],
});

export const orgAdd = (data: DonationsData, org: Org): DonationsData => {
  const exists = data.orgs.some(
    (o) =>
      o.id === org.id ||
      o.name.toLowerCase().trim() === org.name.toLowerCase().trim()
  );
  if (exists) {
    return data;
  }
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

export const donationAdd = (
  data: DonationsData,
  donation: Donation
): DonationsData | undefined => {
  const orgExists = data.orgs.some((org) => org.id === donation.orgId);
  if (!orgExists) {
    return undefined;
  }
  return {
    ...data,
    donations: [...data.donations, donation],
  };
};

const sampleDataArray = [
  {
    name: "Hillel",
    taxDeductible: true,
    notes: "Jewish student life on campus",
    donations: [
      {
        timestamp: "1999-05-01",
        amount: 500,
        kind: "paid" as const,
      },
      {
        timestamp: "2012-07-03",
        amount: 1200,
        kind: "pledge" as const,
      },
    ],
  },
  {
    name: "Brothers for Life",
    taxDeductible: true,
    notes: "Helping injured IDF soldiers",
    donations: [
      {
        timestamp: "2013-04-06",
        amount: 2000,
        kind: "paid" as const,
      },
      {
        timestamp: "2014-07-03",
        amount: 3000,
        kind: "paid" as const,
      },
      {
        timestamp: "2015-07-03",
        amount: 5000,
        kind: "paid" as const,
      },
      {
        timestamp: "2018-07-03",
        amount: 5500,
        kind: "paid" as const,
      },
      {
        timestamp: "2019-07-03",
        amount: 5500,
        kind: "paid" as const,
      },
      {
        timestamp: "2020-07-03",
        amount: 6500,
        kind: "paid" as const,
      },
      {
        timestamp: "2021-07-03",
        amount: 6500,
        kind: "pledge" as const,
      },
    ],
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
  return sampleDataArray.reduce<DonationsData>((data, org) => {
    const newOrg = create(org);
    const result = orgAdd(data, newOrg);
    if (org.donations) {
      org.donations.forEach((donation) => {
        const newDonation = createDonation({
          ...donation,
          timestamp: new Date(donation.timestamp).getTime(),
          notes: "",
          orgId: newOrg.id,
        });
        result.donations.push(newDonation);
      });
    }
    return result;
  }, empty());
};
