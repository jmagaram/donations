import { type DonationsData } from "./donationsData";
import { nanoid } from "nanoid";
import { empty, orgAdd, donationAdd } from "./donationsData";

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDate = (): string => {
  const year = randomInt(2010, 2025);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28);
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
};

const randomAmount = (): number => randomInt(10, 10000);

const randomKind = (): "paid" | "pledge" | "idea" => {
  const rand = Math.random();
  if (rand < 0.8) return "paid";
  if (rand < 0.9) return "pledge";
  return "idea";
};

const randomPaymentMethod = (): string | undefined => {
  const methods = ["", "Check", "Credit card", "Stock"];
  return methods[randomInt(0, methods.length - 1)] || undefined;
};

const randomNotes = (): string => {
  const notes = ["Luncheon", "Auction", "", "Recommended by friend"];
  return notes[randomInt(0, notes.length - 1)];
};

const orgsArray = [
  {
    name: "Feeding America",
    category: "Food/Hunger",
    taxDeductible: true,
    webSite: "https://www.feedingamerica.org",
    notes: "Nation's largest hunger-relief organization",
  },
  {
    name: "SUGI",
    category: "",
    taxDeductible: true,
    webSite: "",
    notes: "A charity without a category",
  },
  {
    name: "Good360",
    category: "Product Philanthropy",
    taxDeductible: true,
    webSite: "https://good360.org",
    notes: "Global leader in product philanthropy and purposeful giving",
  },
  {
    name: "United Way",
    category: "Community Development",
    taxDeductible: true,
    webSite: "https://www.unitedway.org",
    notes:
      "Community-based organization focused on education, income and health",
  },
  {
    name: "The Salvation Army",
    category: "Social Services",
    taxDeductible: true,
    webSite: "https://www.salvationarmyusa.org",
    notes:
      "International movement providing social services and disaster relief",
  },
  {
    name: "Direct Relief",
    category: "Healthcare/Disaster Relief",
    taxDeductible: true,
    webSite: "https://www.directrelief.org",
    notes: "Humanitarian aid organization providing medical assistance",
  },
  {
    name: "St. Jude Children's Research Hospital",
    category: "Healthcare/Research",
    taxDeductible: true,
    webSite: "https://www.stjude.org",
    notes: "Leading pediatric treatment and research facility",
  },
  {
    name: "Habitat for Humanity",
    category: "Housing",
    taxDeductible: true,
    webSite: "https://www.habitat.org",
    notes: "Global nonprofit helping families build and improve homes",
  },
  {
    name: "Americares",
    category: "Healthcare/Disaster Relief",
    taxDeductible: true,
    webSite: "https://www.americares.org",
    notes: "Emergency response and global health organization",
  },
  {
    name: "YMCA of the USA",
    category: "Community/Youth",
    taxDeductible: true,
    webSite: "https://www.ymca.net",
    notes:
      "Community organization focused on youth development and healthy living",
  },
  {
    name: "Boys & Girls Clubs of America",
    category: "Youth Development",
    taxDeductible: true,
    webSite: "https://www.bgca.org",
    notes: "Youth organization providing after-school programs",
  },
  {
    name: "Compassion International",
    category: "Children/Poverty",
    taxDeductible: true,
    webSite: "https://www.compassion.com",
    notes: "Christian child sponsorship organization",
  },
  {
    name: "American Red Cross",
    category: "Disaster Relief",
    taxDeductible: true,
    webSite: "https://www.redcross.org",
    notes: "Humanitarian organization providing emergency assistance",
  },
  {
    name: "Goodwill Industries International",
    category: "Employment/Training",
    taxDeductible: true,
    webSite: "https://www.goodwill.org",
    notes: "Nonprofit providing job training and employment services",
  },
  {
    name: "World Vision",
    category: "Children/Development",
    taxDeductible: true,
    webSite: "https://www.worldvision.org",
    notes: "Christian humanitarian organization focused on children",
  },
  {
    name: "Catholic Charities USA",
    category: "Social Services",
    taxDeductible: true,
    webSite: "https://www.catholiccharitiesusa.org",
    notes: "Network of charities providing social services",
  },
  {
    name: "United Jewish Appeal",
    category: "Jewish/Community",
    taxDeductible: true,
    webSite: "https://www.ujafedny.org",
    notes: "Jewish philanthropic organization",
  },
  {
    name: "American Cancer Society",
    category: "Health/Research",
    taxDeductible: true,
    webSite: "https://www.cancer.org",
    notes: "Nationwide organization fighting cancer",
  },
  {
    name: "March of Dimes",
    category: "Health/Babies",
    taxDeductible: true,
    webSite: "https://www.marchofdimes.org",
    notes: "Organization working to improve health of mothers and babies",
  },
  {
    name: "Make-A-Wish Foundation",
    category: "Children/Wishes",
    taxDeductible: true,
    webSite: "https://wish.org",
    notes: "Granting wishes for children with critical illnesses",
  },
  {
    name: "Doctors Without Borders",
    category: "Healthcare/International",
    taxDeductible: true,
    webSite: "https://www.doctorswithoutborders.org",
    notes: "International medical humanitarian organization",
  },
];

export const sampleData = (): DonationsData | undefined => {
  let result = empty();

  for (const org of orgsArray) {
    const newOrg = { ...org, id: nanoid() };
    const dataWithOrg = orgAdd(result, newOrg);
    if (!dataWithOrg) return undefined;

    result = dataWithOrg;

    const numDonations = randomInt(0, 30);
    for (let i = 0; i < numDonations; i++) {
      const newDonation = {
        id: nanoid(),
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
