import { useState, useEffect } from 'react';
import { defaultMonths, defaultBudget, defaultCampaigns, defaultEvents, defaultHoardings, MonthData, BudgetItem, Campaign, EventItem, Hoarding, Note } from '../data/defaults';

const KEYS = {
  MONTHS: 'p800_months',
  BUDGET: 'p800_budget',
  CAMPAIGNS: 'p800_campaigns',
  EVENTS: 'p800_events',
  HOARDINGS: 'p800_hoardings',
  NOTES: 'p800_notes',
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

  useEffect(() => {
    const handleUpdate = () => {
      setMonthsState(getStorage(KEYS.MONTHS, defaultMonths));
      setBudgetState(getStorage(KEYS.BUDGET, defaultBudget));
      setCampaignsState(getStorage(KEYS.CAMPAIGNS, defaultCampaigns));
      setEventsState(getStorage(KEYS.EVENTS, defaultEvents));
      setHoardingsState(getStorage(KEYS.HOARDINGS, defaultHoardings));
      setNotesState(getStorage(KEYS.NOTES, []));
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

  return {
    months, setMonths,
    budget, setBudget,
    campaigns, setCampaigns,
    events, setEvents,
    hoardings, setHoardings,
    notes, setNotes
  };
}
