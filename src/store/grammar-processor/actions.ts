import { ActionTree } from 'vuex';
import * as mutate from '../shared-mutations';
import { State as RootState } from '../state';
import { GrammarProcessorState as State } from './state';

import { Lexer } from '@/utils/lexer';
import { INode, INodeError } from '@/utils/model';
import { Parser } from '@/utils/parser';

const actions: ActionTree<State, RootState> = {
  process: ({ commit, state }, input) => {
    commit(mutate.SET_INPUT, input);
    console.log('input:', state.input);

    const lex = new Lexer(state.input);
    const tokens = lex.getTokens();
    commit(mutate.SET_TOKENS, tokens);
    console.log('tokens:', state.tokens);

    const par = new Parser(state.tokens);
    const astOrErr = par.getAST();
    if (astOrErr) {
      const { error } = (astOrErr as INodeError);
      if (error) {
        commit(mutate.SET_ERROR, error);
        console.error(state.error);
      } else {
        commit(mutate.SET_AST, astOrErr);
        console.log('AST:', state.ast);
        const output = (state.ast as INode).value;
        commit(mutate.SET_OUTPUT, output);
      }
    }
  },
};

export default actions;
