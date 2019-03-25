import { GetterTree } from 'vuex';
import { State as RootState } from '../state';
import { GrammarProcessorState as State } from './state';

const getters: GetterTree<State, RootState> = {
  tokens: (state) => {
    return state.tokens;
  },
};

export default getters;
