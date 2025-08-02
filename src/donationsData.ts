import { type Donation, type DonationsData, type Org } from "./types";
import { nanoid } from "nanoid";

export const empty = (): DonationsData => ({
  orgs: [],
  donations: [],
});

export const findOrgById = (
  data: Readonly<DonationsData>,
  id: string,
): Org | undefined => data.orgs.find((org) => org.id === id);

export const findDonationById = (
  data: Readonly<DonationsData>,
  id: string,
): Donation | undefined =>
  data.donations.find((donation) => donation.id === id);

const orgExistsById = (data: Readonly<DonationsData>, id: string): boolean =>
  findOrgById(data, id) !== undefined;

const donationExistsById = (
  data: Readonly<DonationsData>,
  id: string,
): boolean => findDonationById(data, id) !== undefined;

const orgExistsByName = (
  data: Readonly<DonationsData>,
  name: string,
): boolean =>
  data.orgs.some(
    (org) => org.name.toLowerCase().trim() === name.toLowerCase().trim(),
  );

const replaceItemAtIndex = <T>(array: T[], index: number, item: T): T[] => {
  const newArray = [...array];
  newArray[index] = item;
  return newArray;
};

const removeItemById = <T extends { id: string }>(
  array: T[],
  id: string,
): T[] => array.filter((item) => item.id !== id);

export const orgAdd = (
  data: Readonly<DonationsData>,
  org: Readonly<Org>,
): DonationsData | undefined => {
  const exists = orgExistsById(data, org.id) || orgExistsByName(data, org.name);
  if (exists) {
    return undefined;
  }
  return {
    ...data,
    orgs: [...data.orgs, org],
  };
};

export const orgUpdate = (
  data: Readonly<DonationsData>,
  org: Readonly<Org>,
): DonationsData | undefined => {
  const orgIndex = data.orgs.findIndex(
    (existingOrg) => existingOrg.id === org.id,
  );
  if (orgIndex === -1) {
    return undefined;
  }
  return {
    ...data,
    orgs: replaceItemAtIndex(data.orgs, orgIndex, org),
  };
};

export const orgDelete = (
  data: Readonly<DonationsData>,
  id: string,
): DonationsData => {
  const orgExists = orgExistsById(data, id);
  const donationExists = data.donations.some(
    (donation) => donation.orgId === id,
  );
  if (!orgExists && !donationExists) {
    return data;
  }
  return {
    ...data,
    orgs: removeItemById(data.orgs, id),
    donations: data.donations.filter((donation) => donation.orgId !== id),
  };
};

export const donationAdd = (
  data: Readonly<DonationsData>,
  donation: Readonly<Donation>,
): DonationsData | undefined => {
  const orgExists = orgExistsById(data, donation.orgId);
  const donationExists = donationExistsById(data, donation.id);
  if (!orgExists || donationExists) {
    return undefined;
  }
  return {
    ...data,
    donations: [...data.donations, donation],
  };
};

export const donationUpdate = (
  data: Readonly<DonationsData>,
  donation: Readonly<Donation>,
): DonationsData | undefined => {
  const donationIndex = data.donations.findIndex((d) => d.id === donation.id);
  if (donationIndex === -1) return undefined;
  const orgExists = orgExistsById(data, donation.orgId);
  if (!orgExists) return undefined;
  return {
    ...data,
    donations: replaceItemAtIndex(data.donations, donationIndex, donation),
  };
};

export const donationDelete = (
  data: Readonly<DonationsData>,
  donationId: string,
): DonationsData => {
  const donationExists = donationExistsById(data, donationId);
  if (!donationExists) {
    return data;
  }
  return {
    ...data,
    donations: removeItemById(data.donations, donationId),
  };
};

const sampleDataArray = [
  {
    name: "Hillel",
    taxDeductible: true,
    notes: "Jewish student life on campus",
    category: "Jewish",
    donations: [
      {
        date: "2018-05-01",
        amount: 500,
        kind: "paid" as const,
        paymentMethod: "Check",
      },
      {
        date: "2019-07-03",
        amount: 1200,
        kind: "pledge" as const,
      },
    ],
  },
  {
    name: "Brothers for Life",
    taxDeductible: true,
    notes: "Helping injured IDF soldiers",
    category: "Israel",
    donations: [
      {
        date: "2023-04-06",
        amount: 2000,
        kind: "paid" as const,
        paymentMethod: "Stock",
      },
      {
        date: "2022-07-03",
        amount: 3000,
        kind: "paid" as const,
        paymentMethod: "Amex",
      },
      {
        date: "2021-07-03",
        amount: 5000,
        kind: "paid" as const,
        paymentMethod: "Wells Fargo Credit",
      },
      {
        date: "2020-07-03",
        amount: 5500,
        kind: "paid" as const,
      },
      {
        date: "2019-07-03",
        amount: 5500,
        kind: "paid" as const,
      },
      {
        date: "2019-07-03",
        amount: 6500,
        kind: "paid" as const,
      },
      {
        date: "2018-07-03",
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
    category: "Education",
    notes: "Charter school in Seattle",
  },
  {
    name: "AIPAC",
    taxDeductible: false,
    category: "Politics",
    notes: "American Israel Public Affairs Committee",
  },
];

export const sampleData = (): DonationsData | undefined => {
  let result = empty();

  for (const org of sampleDataArray) {
    const newOrg = { ...org, id: nanoid() };
    const dataWithOrg = orgAdd(result, newOrg);
    if (!dataWithOrg) return undefined;

    result = dataWithOrg;

    if (org.donations) {
      for (const donation of org.donations) {
        const newDonation = {
          ...donation,
          notes: "",
          orgId: newOrg.id,
          id: nanoid(),
          paymentMethod: donation.paymentMethod || undefined,
        };
        const donationResult = donationAdd(result, newDonation);
        if (!donationResult) return undefined;
        result = donationResult;
      }
    }
  }

  return result;
};

export const tryCreateSampleData = () => {
  const result = sampleData();
  if (result === undefined) {
    alert("Failed to load sample data; using empty data instead.");
    return empty();
  } else {
    return result;
  }
};
