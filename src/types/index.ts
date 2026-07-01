export type EducationLayer = 'PO' | 'VO' | 'MBO' | 'HO';

export interface ActionTemplate {
  id: string;
  layer: EducationLayer;
  knowledgeItemName: string;
  actionName: string;
  dayOffset: number;
  durationDays: number;
  cost: number;
}

export interface AppEvent {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  date?: string; // DEPRECATED: for backwards compatibility
  description: string;
  layers: EducationLayer[];
}

export interface PlannedAction {
  id: string;
  actionName: string;
  dayOffset: number;
  durationDays: number;
  cost: number;
}

export interface PlannedKnowledgeItem {
  id: string;
  layer: EducationLayer;
  knowledgeItemName: string;
  customName?: string; // Optionele naam/notitie (bijv. specifieke leidraad naam)
  startDate: string; // YYYY-MM-DD
  actions?: PlannedAction[]; // Eigen lijst met acties, gekopieerd vanuit sjabloon of handmatig toegevoegd
}

export interface CalculatedAction {
  id: string;
  plannedItemId: string;
  plannedActionId: string;
  templateId?: string; // Optional for backwards compatibility with old items
  actionName: string;
  layer: EducationLayer;
  knowledgeItemName: string;
  originalStartDate: string; // Start date of the knowledge item
  scheduledStartDate: string; // Start date of this specific action (accounting for offset, weekends, events)
  scheduledEndDate: string; // End date of this specific action (based on duration, weekends, events)
  dayOffset: number; // The offset used for this calculation
  shiftedDays: number; // How many days the action shifted due to weekends/events
  durationDays: number;
  cost: number;
}
