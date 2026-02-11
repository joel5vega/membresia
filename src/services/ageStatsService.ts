import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const ageStatsByDecadeFn = httpsCallable(functions, "ageStatsByDecade");

export const ageStatsService = {
  async getAgeStatsByDecade() {
    const result = await ageStatsByDecadeFn({});
    return result.data as {
      byDecade: { decade: string; count: number }[];
      totalWithBirthdate: number;
      totalWithoutBirthdate: number;
      generatedAt: string;
    };
  },
};
