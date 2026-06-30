import { v4 as uuidv4 } from 'uuid';
import type { ActionTemplate, EducationLayer } from '../types';

const KNOWLEDGE_ITEMS = [
  'Leidraad',
  'Handreiking',
  'Kennisrotonde Antwoord',
  'Overzichtsstudie',
  'Praktijkkaart',
  'Inspiratiedocument',
];

const LAYERS: EducationLayer[] = ['PO', 'VO', 'MBO', 'HO'];

export const generateMockActionTemplates = (): ActionTemplate[] => {
  const templates: ActionTemplate[] = [];

  for (const knowledgeItem of KNOWLEDGE_ITEMS) {
    for (const layer of LAYERS) {
      for (let i = 1; i <= 10; i++) {
        // Random cost between 100 and 10000
        const cost = Math.floor(Math.random() * (10000 - 100 + 1)) + 100;
        // Random duration between 1 and 10
        const durationDays = Math.floor(Math.random() * 10) + 1;
        // Day offset sequential to make some sense, spaced by roughly 2 to 5 days
        const dayOffset = (i - 1) * (Math.floor(Math.random() * 4) + 2);

        templates.push({
          id: uuidv4(),
          layer,
          knowledgeItemName: knowledgeItem,
          actionName: `Actie ${i}`,
          dayOffset,
          durationDays,
          cost,
        });
      }
    }
  }

  return templates;
};

export const getKnowledgeItemNames = () => KNOWLEDGE_ITEMS;
export const getLayers = () => LAYERS;
