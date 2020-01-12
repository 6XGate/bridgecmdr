import Vue, { VueConstructor } from "vue";

type BaseReferenceMap = { [key: string]: unknown };
type ExtendedConstructor<R extends BaseReferenceMap> = VueConstructor<Vue & { $refs: R }>;

export default function withRefs<R extends BaseReferenceMap>(): ExtendedConstructor<R> {
    return Vue.extend();
}
