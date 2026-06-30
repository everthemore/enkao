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

export interface PlannedKnowledgeItem {
  id: string;
  layer: EducationLayer;
  knowledgeItemName: string;
  customName?: string; // Optionele naam/notitie (bijv. specifieke leidraad naam)
  startDate: string; // YYYY-MM-DD
}

export interface CalculatedAction {
  id: string;
  plannedItemId: string;
  templateId: string;
  actionName: string;
  layer: EducationLayer;
  knowledgeItemName: string;
  originalStartDate: string; // Start date of the knowledge item
  scheduledStartDate: string; // Start date of this specific action (accounting for offset, weekends, events)
  scheduledEndDate: string; // End date of this specific action (based on duration, weekends, events)
  durationDays: number;
  cost: number;
}
