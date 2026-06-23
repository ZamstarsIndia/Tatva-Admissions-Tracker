import { useState, useEffect } from 'react';
import { defaultMonths, defaultBudget, defaultCampaigns, defaultEvents, defaultHoardings, MonthData, BudgetItem, Campaign, EventItem, Hoarding, Note, WeekEntry, DayEntry } from '../data/defaults';

export function makeDefaultWeeklyData(months: MonthData[]): WeekEntry[] {
  const entries: WeekEntry[] = [];
  for (const m of months) {
    for (let w = 1; w <= 4; w++) {
      const days: DayEntry[] = Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        admissions: 0,
        enquiries: 0,
        spend: 0,
        note: '',
      }));
      entries.push({ monthId: m.id, week: w, days });
    }
  }
  return entries;
}

export const DEFAULT_TOTAL_BUDGET = 4000000;

const KEYS = {
  MONTHS: 'p800_months',
  BUDGET: 'p800_budget',
  CAMPAIGNS: 'p800_campaigns',
  EVENTS: 'p800_events',
  HOARDINGS: 'p800_hoardings',
  NOTES: 'p800_notes',
  TOTAL_BUDGET: 'p800_total_budget',
  WEEKLY: 'p800_weekly',
};

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(key);
    if (val) return JSON.parse(val);
  } catch (e) {
    console.error(e);
  }
  return defaultValue;
}

function setStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(e);
  }
}

export function initializeData() {
  if (!localStorage.getItem(KEYS.MONTHS)) {
    setStorage(KEYS.MONTHS, defaultMonths);
    setStorage(KEYS.BUDGET, defaultBudget);
    setStorage(KEYS.CAMPAIGNS, defaultCampaigns);
    setStorage(KEYS.EVENTS, defaultEvents);
    setStorage(KEYS.HOARDINGS, defaultHoardings);
    setStorage(KEYS.NOTES, []);
  }
}

export function resetData() {
  localStorage.clear();
  initializeData();
  window.dispatchEvent(new Event('actualsUpdated'));
  window.location.reload();
}

export function useAppData() {
  const [months, setMonthsState] = useState<MonthData[]>(() => getStorage(KEYS.MONTHS, defaultMonths));
  const [budget, setBudgetState] = useState<BudgetItem[]>(() => getStorage(KEYS.BUDGET, defaultBudget));
  const [campaigns, setCampaignsState] = useState<Campaign[]>(() => getStorage(KEYS.CAMPAIGNS, defaultCampaigns));
  const [events, setEventsState] = useState<EventItem[]>(() => getStorage(KEYS.EVENTS, defaultEvents));
  const [hoardings, setHoardingsState] = useState<Hoarding[]>(() => getStorage(KEYS.HOARDINGS, defaultHoardings));
  const [notes, setNotesState] = useState<Note[]>(() => getStorage(KEYS.NOTES, []));
  const [totalBudget, setTotalBudgetState] = useState<number>(() => getStorage(KEYS.TOTAL_BUDGET, DEFAULT_TOTAL_BUDGET));
  const [weeklyData, setWeeklyDataState] = useState<WeekEntry[]>(() => {
    const stored = getStorage<WeekEntry[]>(KEYS.WEEKLY, []);
    if (stored && stored.length > 0) return stored;
    return makeDefaultWeeklyData(getStorage(KEYS.MONTHS, defaultMonths));
  });

  useEffect(() => {
    const handleUpdate = () => {
      setMonthsState(getStorage(KEYS.MONTHS, defaultMonths));
      setBudgetState(getStorage(KEYS.BUDGET, defaultBudget));
      setCampaignsState(getStorage(KEYS.CAMPAIGNS, defaultCampaigns));
      setEventsState(getStorage(KEYS.EVENTS, defaultEvents));
      setHoardingsState(getStorage(KEYS.HOARDINGS, defaultHoardings));
      setNotesState(getStorage(KEYS.NOTES, []));
      setTotalBudgetState(getStorage(KEYS.TOTAL_BUDGET, DEFAULT_TOTAL_BUDGET));
      const storedW = getStorage<WeekEntry[]>(KEYS.WEEKLY, []);
      setWeeklyDataState(storedW.length > 0 ? storedW : makeDefaultWeeklyData(getStorage(KEYS.MONTHS, defaultMonths)));
    };
    window.addEventListener('actualsUpdated', handleUpdate);
    return () => window.removeEventListener('actualsUpdated', handleUpdate);
  }, []);

  const notifyUpdate = () => {
    window.dispatchEvent(new Event('actualsUpdated'));
  };

  const setMonths = (newMonths: MonthData[]) => {
    setMonthsState(newMonths);
    setStorage(KEYS.MONTHS, newMonths);
    notifyUpdate();
  };

  const setBudget = (newBudget: BudgetItem[]) => {
    setBudgetState(newBudget);
    setStorage(KEYS.BUDGET, newBudget);
    notifyUpdate();
  };

  const setCampaigns = (newCampaigns: Campaign[]) => {
    setCampaignsState(newCampaigns);
    setStorage(KEYS.CAMPAIGNS, newCampaigns);
    notifyUpdate();
  };

  const setEvents = (newEvents: EventItem[]) => {
    setEventsState(newEvents);
    setStorage(KEYS.EVENTS, newEvents);
    notifyUpdate();
  };

  const setHoardings = (newHoardings: Hoarding[]) => {
    setHoardingsState(newHoardings);
    setStorage(KEYS.HOARDINGS, newHoardings);
    notifyUpdate();
  };

  const setNotes = (newNotes: Note[]) => {
    setNotesState(newNotes);
    setStorage(KEYS.NOTES, newNotes);
    notifyUpdate();
  };

  const setTotalBudget = (amount: number) => {
    setTotalBudgetState(amount);
    setStorage(KEYS.TOTAL_BUDGET, amount);
    notifyUpdate();
  };

  const setWeeklyData = (newWeekly: WeekEntry[]) => {
    setWeeklyDataState(newWeekly);
    setStorage(KEYS.WEEKLY, newWeekly);
    notifyUpdate();
  };

  return {
    months, setMonths,
    budget, setBudget,
    campaigns, setCampaigns,
    events, setEvents,
    hoardings, setHoardings,
    notes, setNotes,
    totalBudget, setTotalBudget,
    weeklyData, setWeeklyData,
  };
}
