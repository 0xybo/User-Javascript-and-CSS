export function variations(items: string[][]): string[] {
    if (items.length === 0) return [''];
    const [first, ...rest] = items;
    const subVariations = variations(rest);
    return first.flatMap((item) => subVariations.map((sub) => item + sub));
}
