import { type DonationsData } from "./donationsData";
import { makeId } from "./nanoId";
import { empty, orgAdd, donationAdd } from "./donationsData";
import type { DonationKind } from "./donation";

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDate = (): string => {
  const year = randomInt(2010, 2025);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
};

const randomAmount = (): number => randomInt(10, 10000);

const randomKind = (): DonationKind => {
  const rand = Math.random();
  if (rand < 0.8) return "paid";
  if (rand < 0.9) return "pledge";
  if (rand < 0.95) return "idea";
  return "unknown";
};

const randomPaymentMethod = (): string | undefined => {
  const methods = ["", "Check", "Credit card", "Stock", "Transfer"];
  return methods[randomInt(0, methods.length - 1)] || undefined;
};

const randomNotes = (): string => {
  const notes = ["Luncheon", "Auction", "", "Recommended by friend"];
  return notes[randomInt(0, notes.length - 1)];
};

const orgsArray = [
  {
    name: "Fidelity Charitable",
    category: "Donor-advised funds",
    taxDeductible: true,
    webSite: "https://www.fidelitycharitable.org/",
    notes: "Largest US charity",
  },
  {
    name: "Donor Advised Charitable Giving",
    category: "Donor-advised funds",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Mass General Brigham",
    category: "Healthcare",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Feeding America",
    category: "Food/Hunger",
    taxDeductible: true,
    webSite: "https://www.feedingamerica.org",
    notes: "Nation's largest hunger-relief organization",
  },
  {
    name: "National Christian Charitable Foundation",
    category: "Religion",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Astrazeneca Patient Assistance Organization",
    category: "Healthcare",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Good360",
    category: "Product Philanthropy",
    taxDeductible: true,
    webSite: "https://good360.org",
    notes: "Global leader in product philanthropy and purposeful giving",
  },
  {
    name: "BCFS Health and Human Services",
    category: "Social Services",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Silicon Valley Community Foundation",
    category: "Community",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "St. Jude Children's Research Hospital",
    category: "Healthcare/Research",
    taxDeductible: true,
    webSite: "https://www.stjude.org",
    notes: "Leading pediatric treatment and research facility",
  },
  {
    name: "Direct Relief",
    category: "Healthcare/Disaster Relief",
    taxDeductible: true,
    webSite: "https://www.directrelief.org",
    notes: "Humanitarian aid organization providing medical assistance",
  },
  {
    name: "American Online Giving Foundation",
    category: "Donor-advised funds",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Goldman Sachs Philanthropy Fund",
    category: "Donor-advised funds",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Chicago Community Trust",
    category: "Community",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Smithsonian Institution",
    category: "Arts/Culture",
    taxDeductible: true,
    webSite: "https://www.si.edu/",
    notes: "World's largest museum and research complex",
  },
  {
    name: "World Vision United States",
    category: "International/Development",
    taxDeductible: true,
    webSite: "https://www.worldvision.org/",
    notes: "",
  },
  {
    name: "Holdfast Tr",
    category: "",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "AmeriCares",
    category: "Healthcare/Disaster Relief",
    taxDeductible: true,
    webSite: "https://www.americares.org/",
    notes: "",
  },
  {
    name: "International Rescue Committee",
    category: "International/Refugees",
    taxDeductible: true,
    webSite: "https://www.rescue.org/",
    notes: "",
  },
  {
    name: "American Endowment Foundation",
    category: "Donor-advised funds",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Samaritan's Purse",
    category: "Religion",
    taxDeductible: true,
    webSite: "https://www.samaritanspurse.org/",
    notes: "",
  },
  {
    name: "Gothic Corporation",
    category: "",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Morgan Stanley Global Impact Funding Trust Inc",
    category: "Donor-advised funds",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "American Red Cross",
    category: "Disaster Relief",
    taxDeductible: true,
    webSite: "https://www.redcross.org",
    notes: "Humanitarian organization providing emergency assistance",
  },
  {
    name: "UNICEF USA",
    category: "Children/International",
    taxDeductible: true,
    webSite: "https://www.unicefusa.org/",
    notes: "",
  },
  {
    name: "Save the Children USA",
    category: "Children/International",
    taxDeductible: true,
    webSite: "https://www.savethechildren.org/",
    notes: "",
  },
  {
    name: "University of Southern California",
    category: "Education",
    taxDeductible: true,
    webSite: "https://www.usc.edu/",
    notes: "",
  },
  {
    name: "Bank Of America Charitable Gift Fund",
    category: "Donor-advised funds",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Compassion International",
    category: "Children/Poverty",
    taxDeductible: true,
    webSite: "https://www.compassion.com",
    notes: "Christian child sponsorship organization",
  },
  {
    name: "The Nature Conservancy",
    category: "Environment",
    taxDeductible: true,
    webSite: "https://www.nature.org/en-us/",
    notes: "",
  },
  {
    name: "Renaissance Charitable Foundation Inc",
    category: "Donor-advised funds",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Foundation For The Carolinas",
    category: "Community",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Chancellor Masters & Scholars Of The University Of Oxford",
    category: "Education",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Step Up For Students",
    category: "Education",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Navigate Affordable Housing Partners Inc",
    category: "Housing",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Southwest Key",
    category: "Social Services",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Charities Aid Foundation America",
    category: "International",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "New Venture Fund",
    category: "",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Dana–Farber Cancer Institute",
    category: "Health/Research",
    taxDeductible: true,
    webSite: "https://www.dana-farber.org/",
    notes: "",
  },
  {
    name: "HealthWell Foundation",
    category: "Healthcare",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Doctors Without Borders, USA",
    category: "Healthcare/International",
    taxDeductible: true,
    webSite: "https://www.doctorswithoutborders.org/",
    notes: "",
  },
  {
    name: "Rockefeller Philanthropy Advisors",
    category: "Philanthropy",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "The Blackbaud Giving Fund",
    category: "Donor-advised funds",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "American Cancer Society",
    category: "Health/Research",
    taxDeductible: true,
    webSite: "https://www.cancer.org",
    notes: "Nationwide organization fighting cancer",
  },
  {
    name: "Global Health Solutions Inc",
    category: "Healthcare",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "MAP International",
    category: "Healthcare/International",
    taxDeductible: true,
    webSite: "https://www.map.org/",
    notes: "",
  },
  {
    name: "Mayo Clinic Group Return",
    category: "Healthcare",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Tides Foundation",
    category: "Philanthropy",
    taxDeductible: true,
    webSite: "",
    notes: "",
  },
  {
    name: "Shriners Hospitals for Children",
    category: "Healthcare/Children",
    taxDeductible: true,
    webSite: "https://www.shrinerschildrens.org/en",
    notes: "",
  },
  {
    name: "Corporation for Public Broadcasting",
    category: "Media",
    taxDeductible: true,
    webSite: "https://www.cpb.org/",
    notes: "",
  },
  {
    name: "National Rifle Association",
    category: "Advocacy",
    taxDeductible: false,
    webSite: "https://home.nra.org/",
    notes: "501(c)(4)",
  },
  {
    name: "AARP",
    category: "Advocacy",
    taxDeductible: false,
    webSite: "https://www.aarp.org/",
    notes: "501(c)(4)",
  },
  {
    name: "American Civil Liberties Union",
    category: "Advocacy",
    taxDeductible: false,
    webSite: "https://www.aclu.org/",
    notes: "501(c)(4)",
  },
  {
    name: "Planned Parenthood Action Fund",
    category: "Advocacy",
    taxDeductible: false,
    webSite: "https://www.plannedparenthoodaction.org/",
    notes: "501(c)(4)",
  },
  {
    name: "Americans for Prosperity",
    category: "Advocacy",
    taxDeductible: false,
    webSite: "https://americansforprosperity.org/",
    notes: "501(c)(4)",
  },
];

export const sampleData = (): DonationsData | undefined => {
  let result = empty();

  for (const org of orgsArray) {
    const newOrg = { ...org, id: makeId() };
    const dataWithOrg = orgAdd(result, newOrg);
    if (!dataWithOrg) return undefined;

    result = dataWithOrg;

    const numDonations = randomInt(0, 450);
    for (let i = 0; i < numDonations; i++) {
      const newDonation = {
        id: makeId(),
        orgId: newOrg.id,
        date: randomDate(),
        amount: randomAmount(),
        kind: randomKind(),
        notes: randomNotes(),
        paymentMethod: randomPaymentMethod(),
      };
      const donationResult = donationAdd(result, newDonation);
      if (!donationResult) return undefined;
      result = donationResult;
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
