import { Patterns } from '@/lib/pattern';
import useState from './useState';

export default function usePatterns() {
    const state = useState();
    return new Patterns(state.rule.item);
}
