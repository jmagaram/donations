import { create } from "./organization";
import type { DonationsData, Organization } from "./types";

export const empty = () => ({
  organizations: [],
});

export const addOrg = (
  data: DonationsData,
  organization: Organization
): DonationsData => {
  return {
    ...data,
    organizations: [...data.organizations, organization],
  };
};

export const updateOrg = (
  data: DonationsData,
  updatedOrg: Organization
): DonationsData | undefined => {
  const organizationIndex = data.organizations.findIndex(
    (org) => org.id === updatedOrg.id
  );

  if (organizationIndex === -1) {
    return undefined;
  }

  const organizations = [...data.organizations];
  organizations[organizationIndex] = updatedOrg;

  return {
    ...data,
    organizations,
  };
};

export const deleteOrg = (data: DonationsData, id: string): DonationsData => {
  const organizationIndex = data.organizations.findIndex(
    (org) => org.id === id
  );

  if (organizationIndex === -1) {
    throw new Error(`Organization with id "${id}" not found`);
  }

  return {
    ...data,
    organizations: data.organizations.filter((org) => org.id !== id),
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
    (data, org) => addOrg(data, create(org)),
    empty()
  );
};
