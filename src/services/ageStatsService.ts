import { memberService } from './memberService';

function age(v: any): number | null {
  if (!v || (typeof v === 'string' && v.startsWith('0000'))) return null;
  const d = v?.toDate ? v.toDate() : new Date(v);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) a--;
  return a >= 0 && a < 120 ? a : null;
}

export const ageStatsService = {
  async getAgeStatsByDecade() {
    const members = await memberService.getMembers();   // viene de la caché: 0 lecturas extra
    const counts: Record<number, number> = {};
    let without = 0;

    members.forEach((m: any) => {
      const a = age(m.fechaNacimiento);
      if (a == null) { without++; return; }
      const start = Math.floor(a / 10) * 10;
      counts[start] = (counts[start] || 0) + 1;
    });

    const byDecade = Object.keys(counts).map(Number).sort((x, y) => x - y)
      .map((s) => ({ decade: `${s}-${s + 9}`, count: counts[s] }));

    return {
      byDecade,
      totalWithBirthdate: byDecade.reduce((s, d) => s + d.count, 0),
      totalWithoutBirthdate: without,
      generatedAt: new Date().toISOString(),
    };
  },
};