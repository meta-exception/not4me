
import { IToken } from '@/utils/token';

// tslint:disable-next-line: interface-name
export interface GrammarProcessorState {
  input: string;
  tokens: IToken[];
}
