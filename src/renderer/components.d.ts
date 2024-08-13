// Minimal file that seem to make Volar happy to see
// global components from third-party libraries.
import type * as Vuetify from "vuetify/components";
declare module '@vue/runtime-core' {
  export interface GlobalComponents {
  }
}
