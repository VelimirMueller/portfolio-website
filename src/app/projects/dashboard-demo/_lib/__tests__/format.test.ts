import {
  cohortColor,
  formatCurrency,
  formatNumber,
  isTrendGood,
  openActionCount,
  pipelineTotals,
  probabilityColor,
  revenueChartGeometry,
  sparklinePoints,
  unreadCount,
} from '../format';

describe('formatNumber', () => {
  it('shortens millions and thousands and keeps prefix and suffix', () => {
    expect(formatNumber(2_400_000, '$')).toBe('$2.4M');
    expect(formatNumber(127_400, '$')).toBe('$127.4K');
    expect(formatNumber(18_000, '$')).toBe('$18K');
    expect(formatNumber(68, '', '%')).toBe('68%');
  });
});

describe('formatCurrency', () => {
  it('uses two decimals for millions and none for thousands', () => {
    expect(formatCurrency(1_530_000)).toBe('$1.53M');
    expect(formatCurrency(84_000)).toBe('$84K');
    expect(formatCurrency(950)).toBe('$950');
  });
});

describe('probabilityColor', () => {
  it('is green above 70, blue above 50, orange otherwise', () => {
    expect(probabilityColor(88)).toBe('bg-green-500');
    expect(probabilityColor(70)).toBe('bg-blue-500');
    expect(probabilityColor(51)).toBe('bg-blue-500');
    expect(probabilityColor(50)).toBe('bg-orange-500');
  });
});

describe('isTrendGood', () => {
  it('treats a rise as good, unless lower is better', () => {
    expect(isTrendGood(14.2, false)).toBe(true);
    expect(isTrendGood(-3, false)).toBe(false);
    expect(isTrendGood(-18.4, true)).toBe(true);
    expect(isTrendGood(0.4, true)).toBe(false);
  });
});

describe('pipelineTotals', () => {
  it('sums the values and weights them by probability', () => {
    expect(pipelineTotals([{ value: 100_000, probability: 50 }, { value: 20_000, probability: 10 }])).toEqual({
      total: 120_000,
      weighted: 52_000,
    });
    expect(pipelineTotals([])).toEqual({ total: 0, weighted: 0 });
  });
});

describe('cohortColor', () => {
  it('maps retention to a stronger green the higher it is', () => {
    expect(cohortColor(null)).toBe('bg-[#1a1a1a]');
    expect(cohortColor(100)).toBe('bg-green-500/80');
    expect(cohortColor(90)).toBe('bg-green-500/60');
    expect(cohortColor(85)).toBe('bg-green-500/40');
    expect(cohortColor(80)).toBe('bg-green-500/20');
    expect(cohortColor(79)).toBe('bg-green-500/10');
  });
});

describe('sparklinePoints', () => {
  it('spreads the points over 56 px and puts the maximum at the top', () => {
    expect(sparklinePoints([0, 5, 10])).toBe('0,20 28,12 56,4');
  });

  it('draws a flat series as a flat line', () => {
    expect(sparklinePoints([3, 3])).toBe('0,20 56,20');
  });
});

describe('revenueChartGeometry', () => {
  const { points, pathD, areaD } = revenueChartGeometry([50, 100], { w: 500, h: 160, padX: 0, padY: 10 });

  it('scales the values to the chart box', () => {
    expect(points).toEqual([{ x: 0, y: 80 }, { x: 500, y: 10 }]);
  });

  it('draws a curve through the points and closes the area at the bottom', () => {
    expect(pathD).toBe('M0,80 C200,80 300,10 500,10');
    expect(areaD).toBe(`${pathD} L500,160 L0,160 Z`);
  });
});

describe('counts', () => {
  it('counts unread notifications and actions that are not overdue', () => {
    expect(unreadCount([{ read: false }, { read: true }, { read: false }])).toBe(2);
    expect(openActionCount([{ overdue: true }, { overdue: false }])).toBe(1);
  });
});
