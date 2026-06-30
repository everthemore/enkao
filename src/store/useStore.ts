import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { ActionTemplate, AppEvent, PlannedKnowledgeItem, CalculatedAction } from '../types';
import { generateMockActionTemplates } from '../utils/dataGenerator';
import { calculateValidDate } from '../utils/dateLogic';

interface AppState {
  actionTemplates: ActionTemplate[];
  events: AppEvent[];
  plannedItems: PlannedKnowledgeItem[];
  addEvent: (event: Omit<AppEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
  addPlannedItem: (item: Omit<PlannedKnowledgeItem, 'id'>) => void;
  removePlannedItem: (id: string) => void;
  updateActionTemplate: (id: string, updates: Partial<ActionTemplate>) => void;
  addActionTemplate: (template: Omit<ActionTemplate, 'id'>) => void;
  removeActionTemplate: (id: string) => void;
  getCalculatedActions: () => CalculatedAction[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      actionTemplates: generateMockActionTemplates(),
      events: [],
      plannedItems: [],
      addEvent: (event) => set((state) => ({
        events: [...state.events, { ...event, id: uuidv4() }]
      })),
      removeEvent: (id) => set((state) => ({
        events: state.events.filter(e => e.id !== id)
      })),
      addPlannedItem: (item) => set((state) => ({
        plannedItems: [...state.plannedItems, { ...item, id: uuidv4() }]
      })),
      removePlannedItem: (id) => set((state) => ({
        plannedItems: state.plannedItems.filter(i => i.id !== id)
      })),
      updateActionTemplate: (id, updates) => set((state) => ({
        actionTemplates: state.actionTemplates.map(t => 
          t.id === id ? { ...t, ...updates } : t
        )
      })),
      addActionTemplate: (template) => set((state) => ({
        actionTemplates: [...state.actionTemplates, { ...template, id: uuidv4() }]
      })),
      removeActionTemplate: (id) => set((state) => ({
        actionTemplates: state.actionTemplates.filter(t => t.id !== id)
      })),
      getCalculatedActions: () => {
        const { actionTemplates, plannedItems, events } = get();
        const calculatedActions: CalculatedAction[] = [];

        plannedItems.forEach(plannedItem => {
          const templates = actionTemplates.filter(
            t => t.layer === plannedItem.layer && t.knowledgeItemName === plannedItem.knowledgeItemName
          );

          templates.forEach(template => {
            const scheduledStartDate = calculateValidDate(plannedItem.startDate, template.dayOffset, events);
            const scheduledEndDate = calculateValidDate(scheduledStartDate, template.durationDays - 1, events);

            calculatedActions.push({
              id: uuidv4(),
              plannedItemId: plannedItem.id,
              templateId: template.id,
              actionName: template.actionName,
              layer: template.layer,
              knowledgeItemName: template.knowledgeItemName,
              originalStartDate: plannedItem.startDate,
              scheduledStartDate,
              scheduledEndDate,
              durationDays: template.durationDays,
              cost: template.cost
            });
          });
        });

        return calculatedActions.sort((a, b) => new Date(a.scheduledStartDate).getTime() - new Date(b.scheduledStartDate).getTime());
      }
    }),
    {
      name: 'nro-planner-storage',
    }
  )
);
