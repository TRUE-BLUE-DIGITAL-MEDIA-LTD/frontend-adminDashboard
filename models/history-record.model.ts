import { ActionKey, ModelKey } from "./actions.model";

export type HistoryRecord = {
  id: string;
  createAt: string;
  updateAt: string;
  userId: string;
  action: ActionKey;
  data: string;
  refId?: string | null;
  refModel?: ModelKey | null;
};
