import { create } from "./organization";
import type { DonationsData, Organization } from "./types";

export const empty = () => ({
  organizations: [],
});

export const addOrganization = (
  data: DonationsData,
  organization: Organization
): DonationsData => {
  return {
    ...data,
    organizations: [...data.organizations, organization],
  };
};

export const deleteOrganization = (
  data: DonationsData,
  id: string
): DonationsData => {
  const organizationIndex = data.organizations.findIndex(org => org.id === id);
  
  if (organizationIndex === -1) {
    throw new Error(`Organization with id "${id}" not found`);
  }
  
  return {
    ...data,
    organizations: data.organizations.filter(org => org.id !== id),
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
    taxdeductible: true,
    notes: "Families with special needs children",
  },
  {
    name: "Rainier Prep",
    taxdeductible: true,
    notes: "Charter school in Seattle",
  },
  {
    name: "AIPAC",
    taxdeductible: false,
    notes: "American Israel Public Affairs Committee",
  },
];

export const sampleData = (): DonationsData => {
  return sampleDataArray.reduce<DonationsData>(
    (data, org) => addOrganization(data, create(org)),
    empty()
  );
};
