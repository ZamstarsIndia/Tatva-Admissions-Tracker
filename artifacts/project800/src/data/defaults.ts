export type MonthData = {
  id: string; // e.g., '2026-07'
  month: string;
  theme: string;
  planAdm: number;
  actualAdm: number;
  planEnq: number;
  actualEnq: number;
  planSpend: number;
  actualSpend: number;
  notes: string;
  activities: string[];
};

export type BudgetItem = {
  id: string;
  channel: string;
  planned: number;
  actual: number;
};

export type Campaign = {
  id: string;
  name: string;
  channel: string;
  month: string;
  budget: number;
  status: 'Idea' | 'Planned' | 'Active' | 'Completed' | 'Paused';
  description: string;
};

export type EventItem = {
  id: string;
  name: string;
  type: string;
  month: string;
  date: string;
  expected: number;
  actual: number;
  venue: string;
  status: 'Planned' | 'Confirmed' | 'Completed' | 'Cancelled';
};

export type Hoarding = {
  id: string;
  creativeRound: string;
  period: string;
  sites: number;
  durationDays: number;
  status: 'Designing' | 'Printing' | 'Active' | 'Completed';
};

export type Note = {
  id: string;
  timestamp: string;
  section: string;
  text: string;
};

export const defaultMonths: MonthData[] = [
  { id: '2026-07', month: 'Jul 2026', theme: 'Foundations of Greatness', planAdm: 5, actualAdm: 0, planEnq: 200, actualEnq: 0, planSpend: 180000, actualSpend: 0, notes: '', activities: [] },
  { id: '2026-08', month: 'Aug 2026', theme: 'New Beginnings — Ganesh Festival', planAdm: 15, actualAdm: 0, planEnq: 350, actualEnq: 0, planSpend: 340000, actualSpend: 0, notes: '', activities: [] },
  { id: '2026-09', month: 'Sep 2026', theme: 'Excellence in Action', planAdm: 20, actualAdm: 0, planEnq: 300, actualEnq: 0, planSpend: 295000, actualSpend: 0, notes: '', activities: [] },
  { id: '2026-10', month: 'Oct 2026', theme: 'Victory of Learning — Vijayadasami', planAdm: 40, actualAdm: 0, planEnq: 400, actualEnq: 0, planSpend: 350000, actualSpend: 0, notes: '', activities: [] },
  { id: '2026-11', month: 'Nov 2026', theme: 'Light the Way — Diwali + TOI Ad', planAdm: 60, actualAdm: 0, planEnq: 500, actualEnq: 0, planSpend: 640000, actualSpend: 0, notes: '', activities: [] },
  { id: '2026-12', month: 'Dec 2026', theme: "Season's Greetings — New Year", planAdm: 80, actualAdm: 0, planEnq: 450, actualEnq: 0, planSpend: 345000, actualSpend: 0, notes: '', activities: [] },
  { id: '2027-01', month: 'Jan 2027', theme: "2027 Your Child's Best Year", planAdm: 120, actualAdm: 0, planEnq: 700, actualEnq: 0, planSpend: 390000, actualSpend: 0, notes: '', activities: [] },
  { id: '2027-02', month: 'Feb 2027', theme: "Don't Miss Your Spot", planAdm: 180, actualAdm: 0, planEnq: 800, actualEnq: 0, planSpend: 390000, actualSpend: 0, notes: '', activities: [] },
  { id: '2027-03', month: 'Mar 2027', theme: 'New Year New Chapter — Ugadi', planAdm: 160, actualAdm: 0, planEnq: 650, actualEnq: 0, planSpend: 390000, actualSpend: 0, notes: '', activities: [] },
  { id: '2027-04', month: 'Apr 2027', theme: 'Last Few Seats', planAdm: 100, actualAdm: 0, planEnq: 400, actualEnq: 0, planSpend: 320000, actualSpend: 0, notes: '', activities: [] },
  { id: '2027-05', month: 'May 2027', theme: 'Welcome to Tatva', planAdm: 20, actualAdm: 0, planEnq: 200, actualEnq: 0, planSpend: 240000, actualSpend: 0, notes: '', activities: [] },
];

export const defaultBudget: BudgetItem[] = [
  { id: 'b1', channel: 'Google Ads', planned: 800000, actual: 0 },
  { id: 'b2', channel: 'Meta Ads', planned: 700000, actual: 0 },
  { id: 'b3', channel: 'Content Creation', planned: 150000, actual: 0 },
  { id: 'b4', channel: 'WhatsApp Marketing', planned: 50000, actual: 0 },
  { id: 'b5', channel: 'Email Marketing', planned: 50000, actual: 0 },
  { id: 'b6', channel: 'Hoardings (15 sites)', planned: 1200000, actual: 0 },
  { id: 'b7', channel: 'TOI Full Page Ad', planned: 350000, actual: 0 },
  { id: 'b8', channel: 'Newspaper Flyers (4 drops)', planned: 200000, actual: 0 },
  { id: 'b9', channel: 'Saturday Events (22×)', planned: 200000, actual: 0 },
  { id: 'b10', channel: 'Apartment Activations', planned: 200000, actual: 0 },
  { id: 'b11', channel: 'Contingency', planned: 100000, actual: 0 },
];

export const defaultCampaigns: Campaign[] = [
  { id: 'c1', name: 'Ganesh Festival Blitz', channel: 'Meta Ads', month: 'Aug 2026', budget: 70000, status: 'Planned', description: '' },
  { id: 'c2', name: 'Vijayadasami Victory', channel: 'Google+Meta', month: 'Oct 2026', budget: 80000, status: 'Planned', description: '' },
  { id: 'c3', name: 'Diwali 2× Push', channel: 'Meta Ads', month: 'Nov 2026', budget: 90000, status: 'Planned', description: '' },
  { id: 'c4', name: 'TOI Full Page January', channel: 'Print', month: 'Jan 2027', budget: 350000, status: 'Planned', description: '' },
  { id: 'c5', name: 'Peak Season Google Max', channel: 'Google Ads', month: 'Jan 2027', budget: 100000, status: 'Planned', description: '' },
  { id: 'c6', name: 'WhatsApp Festival Greetings', channel: 'WhatsApp', month: 'Aug 2026', budget: 5000, status: 'Idea', description: '' },
  { id: 'c7', name: 'Ugadi Open House', channel: 'Meta+Events', month: 'Mar 2027', budget: 60000, status: 'Planned', description: '' },
  { id: 'c8', name: 'YouTube School Tour Series', channel: 'YouTube Ads', month: 'Sep 2026', budget: 30000, status: 'Idea', description: '' },
];

export const defaultEvents: EventItem[] = [
  { id: 'e1', name: 'Open House Introduction', type: 'Open House', month: 'Jul 2026', date: 'Jul 5 2026', expected: 50, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e2', name: 'Parent Orientation Session', type: 'Orientation', month: 'Jul 2026', date: 'Jul 19 2026', expected: 40, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e3', name: 'Photography Workshop', type: 'Workshop', month: 'Aug 2026', date: 'Aug 2 2026', expected: 60, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e4', name: 'Ganesh Festival Celebration', type: 'Cultural', month: 'Aug 2026', date: 'Aug 16 2026', expected: 100, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e5', name: 'STEM Seminar', type: 'Seminar', month: 'Sep 2026', date: 'Sep 6 2026', expected: 45, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e6', name: 'Campus Experience Day', type: 'Experience', month: 'Sep 2026', date: 'Sep 20 2026', expected: 80, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e7', name: 'Vijayadasami Open House', type: 'Open House', month: 'Oct 2026', date: 'Oct 3 2026', expected: 100, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e8', name: 'Career Counseling Talk', type: 'Talk', month: 'Oct 2026', date: 'Oct 17 2026', expected: 60, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e9', name: 'Wealth Management Talk', type: 'Talk', month: 'Nov 2026', date: 'Nov 1 2026', expected: 70, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e10', name: 'Diwali Science Fair', type: 'Cultural', month: 'Nov 2026', date: 'Nov 15 2026', expected: 90, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e11', name: 'Year-End Celebration', type: 'Celebration', month: 'Dec 2026', date: 'Dec 6 2026', expected: 80, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e12', name: 'New Year Vision Board', type: 'Workshop', month: 'Dec 2026', date: 'Dec 20 2026', expected: 50, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e13', name: 'Grand Open House', type: 'Open House', month: 'Jan 2027', date: 'Jan 10 2027', expected: 150, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e14', name: 'Academic Excellence Talk', type: 'Talk', month: 'Jan 2027', date: 'Jan 24 2027', expected: 80, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e15', name: 'Campus Experience Day 2', type: 'Experience', month: 'Feb 2027', date: 'Feb 7 2027', expected: 100, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e16', name: 'Admission Counseling', type: 'Counseling', month: 'Feb 2027', date: 'Feb 21 2027', expected: 60, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e17', name: 'Ugadi Cultural Event', type: 'Cultural', month: 'Mar 2027', date: 'Mar 6 2027', expected: 90, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e18', name: 'Final Open House', type: 'Open House', month: 'Mar 2027', date: 'Mar 20 2027', expected: 120, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e19', name: 'Last Seats Information Session', type: 'Seminar', month: 'Apr 2027', date: 'Apr 3 2027', expected: 50, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e20', name: 'Apartment Activation Event', type: 'Experience', month: 'Apr 2027', date: 'Apr 17 2027', expected: 40, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e21', name: 'Welcome to Tatva', type: 'Orientation', month: 'May 2027', date: 'May 2 2027', expected: 60, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
  { id: 'e22', name: 'New Student Orientation', type: 'Orientation', month: 'May 2027', date: 'May 16 2027', expected: 80, actual: 0, venue: 'Tatva Global School Campus', status: 'Planned' },
];

export const defaultHoardings: Hoarding[] = [
  { id: 'h1', creativeRound: 'Ganesh Festival Creative', period: 'Aug 2026', sites: 15, durationDays: 45, status: 'Designing' },
  { id: 'h2', creativeRound: 'Vijayadasami Creative', period: 'Oct 2026', sites: 15, durationDays: 30, status: 'Designing' },
  { id: 'h3', creativeRound: 'Diwali Creative', period: 'Nov 2026', sites: 15, durationDays: 25, status: 'Designing' },
  { id: 'h4', creativeRound: 'Xmas & New Year Creative', period: 'Dec 2026–Jan 2027', sites: 15, durationDays: 40, status: 'Designing' },
  { id: 'h5', creativeRound: 'Admissions Open Creative', period: 'Jan–Feb 2027', sites: 15, durationDays: 45, status: 'Designing' },
  { id: 'h6', creativeRound: 'Ugadi Creative', period: 'Mar 2027', sites: 15, durationDays: 30, status: 'Designing' },
  { id: 'h7', creativeRound: 'Last Seats & Welcome Creative', period: 'Apr–May 2027', sites: 15, durationDays: 45, status: 'Designing' },
];
