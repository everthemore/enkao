import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { ActionTemplate, AppEvent, PlannedKnowledgeItem, CalculatedAction, PlannedAction } from '../types';
import { generateMockActionTemplates } from '../utils/dataGenerator';
import { calculateValidDate } from '../utils/dateLogic';
import { differenceInDays, addDays, parseISO } from 'date-fns';

interface AppState {
  actionTemplates: ActionTemplate[];
  events: AppEvent[];
  plannedItems: PlannedKnowledgeItem[];
  addEvent: (event: Omit<AppEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
  addPlannedItem: (item: Omit<PlannedKnowledgeItem, 'id' | 'actions'>) => void;
  removePlannedItem: (id: string) => void;
  updatePlannedItemAction: (plannedItemId: string, actionId: string, updates: Partial<PlannedAction>) => void;
  addPlannedItemAction: (plannedItemId: string, action: Omit<PlannedAction, 'id'>) => void;
  removePlannedItemAction: (plannedItemId: string, actionId: string) => void;
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
      addPlannedItem: (item) => set((state) => {
        // Copy current action templates matching layer and knowledge item
        const matchingTemplates = state.actionTemplates.filter(
          t => t.layer === item.layer && t.knowledgeItemName === item.knowledgeItemName
        );
        const copiedActions: PlannedAction[] = matchingTemplates.map(t => ({
          id: uuidv4(),
          actionName: t.actionName,
          dayOffset: t.dayOffset,
          durationDays: t.durationDays,
          cost: t.cost
        }));

        return {
          plannedItems: [
            ...state.plannedItems, 
            { ...item, id: uuidv4(), actions: copiedActions }
          ]
        };
      }),
      removePlannedItem: (id) => set((state) => ({
        plannedItems: state.plannedItems.filter(i => i.id !== id)
      })),
      updatePlannedItemAction: (plannedItemId, actionId, updates) => set((state) => ({
        plannedItems: state.plannedItems.map(item => {
          if (item.id === plannedItemId) {
            return {
              ...item,
              actions: (item.actions || []).map(action => 
                action.id === actionId ? { ...action, ...updates } : action
              )
            };
          }
          return item;
        })
      })),
      addPlannedItemAction: (plannedItemId, action) => set((state) => ({
        plannedItems: state.plannedItems.map(item => {
          if (item.id === plannedItemId) {
            return {
              ...item,
              actions: [...(item.actions || []), { ...action, id: uuidv4() }]
            };
          }
          return item;
        })
      })),
      removePlannedItemAction: (plannedItemId, actionId) => set((state) => ({
        plannedItems: state.plannedItems.map(item => {
          if (item.id === plannedItemId) {
            return {
              ...item,
              actions: (item.actions || []).filter(a => a.id !== actionId)
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
          // If item has its own actions list, use it. Otherwise fallback to actionTemplates (backwards compatibility)
          let actionsToProcess: PlannedAction[] = plannedItem.actions || [];
          if (!plannedItem.actions || plannedItem.actions.length === 0) {
            const templates = actionTemplates.filter(
              t => t.layer === plannedItem.layer && t.knowledgeItemName === plannedItem.knowledgeItemName
            );
            actionsToProcess = templates.map(t => ({
              id: t.id, // fallback id
              actionName: t.actionName,
              dayOffset: t.dayOffset,
              durationDays: t.durationDays,
              cost: t.cost
            }));
          }

          actionsToProcess.forEach(action => {
            const scheduledStartDate = calculateValidDate(plannedItem.startDate, action.dayOffset, events, plannedItem.layer);
            const scheduledEndDate = calculateValidDate(scheduledStartDate, action.durationDays - 1, events, plannedItem.layer);

            // Calculate shiftedDays: how many days did it shift from originalStartDate + dayOffset?
            const theoreticalStartDate = addDays(parseISO(plannedItem.startDate), action.dayOffset);
            const shiftedDays = differenceInDays(parseISO(scheduledStartDate), theoreticalStartDate);

            calculatedActions.push({
              id: uuidv4(), // Unique ID per derivation
              plannedItemId: plannedItem.id,
              plannedActionId: action.id,
              actionName: action.actionName,
              layer: plannedItem.layer,
              knowledgeItemName: plannedItem.knowledgeItemName,
              originalStartDate: plannedItem.startDate,
              scheduledStartDate,
              scheduledEndDate,
              dayOffset: action.dayOffset,
              shiftedDays: Math.max(0, shiftedDays), // Never negative unless offset changed strangely
              durationDays: action.durationDays,
              cost: action.cost
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
