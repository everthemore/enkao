import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { ActionTemplate, AppEvent, PlannedKnowledgeItem, CalculatedAction, ActionOverride } from '../types';
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
  updatePlannedItemActionOverride: (plannedItemId: string, templateId: string, override: ActionOverride) => void;
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
      updatePlannedItemActionOverride: (plannedItemId, templateId, override) => set((state) => ({
        plannedItems: state.plannedItems.map(item => {
          if (item.id === plannedItemId) {
            return {
              ...item,
              actionOverrides: {
                ...(item.actionOverrides || {}),
                [templateId]: {
                  ...(item.actionOverrides?.[templateId] || {}),
                  ...override
                }
              }
            };
          }
          return item;
        })
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
            const override = plannedItem.actionOverrides?.[template.id];
            
            const actionName = override?.actionName ?? template.actionName;
            const dayOffset = override?.dayOffset ?? template.dayOffset;
            const durationDays = override?.durationDays ?? template.durationDays;
            const cost = override?.cost ?? template.cost;

            const scheduledStartDate = calculateValidDate(plannedItem.startDate, dayOffset, events, template.layer);
            const scheduledEndDate = calculateValidDate(scheduledStartDate, durationDays - 1, events, template.layer);

            calculatedActions.push({
              id: uuidv4(), // Generate a unique ID per calculation (acceptable for derived state)
              plannedItemId: plannedItem.id,
              templateId: template.id,
              actionName,
              layer: template.layer,
              knowledgeItemName: template.knowledgeItemName,
              originalStartDate: plannedItem.startDate,
              scheduledStartDate,
              scheduledEndDate,
              dayOffset,
              durationDays,
              cost
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
