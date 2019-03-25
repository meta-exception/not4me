import { MutationTree } from 'vuex';
import * as mutate from '../shared-mutations';
import { GrammarProcessorState as State } from './state';

const mutations: MutationTree<State> = {
  [mutate.SET_INPUT]: (state, input) => {
    state.input = input;
  },
  [mutate.SET_TOKENS]: (state, tokens) => {
    state.tokens = tokens;
  },
};

export default mutations;
