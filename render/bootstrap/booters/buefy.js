/*
BridgeCmdr - A/V switch and monitor controller
Copyright (C) 2019 Matthew Holder

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import Vue             from "vue";
import Buefy           from "buefy";

// We load the components up this way, though not necessary, to make WebStorm happy.
Vue.component("BAutocomplete",   require("buefy/src/components/autocomplete/Autocomplete"));
Vue.component("BButton",         require("buefy/src/components/button/Button"));
Vue.component("BCheckbox",       require("buefy/src/components/checkbox/Checkbox"));
Vue.component("BCheckboxButton", require("buefy/src/components/checkbox/CheckboxButton"));
Vue.component("BClockpicker",    require("buefy/src/components/clockpicker/Clockpicker"));
Vue.component("BCollapse",       require("buefy/src/components/collapse/Collapse"));
Vue.component("BDatepicker",     require("buefy/src/components/datepicker/Datepicker"));
Vue.component("BDropdown",       require("buefy/src/components/dropdown/Dropdown"));
Vue.component("BDropdownItem",   require("buefy/src/components/dropdown/DropdownItem"));
Vue.component("BField",          require("buefy/src/components/field/Field"));
Vue.component("BIcon",           require("buefy/src/components/icon/Icon"));
Vue.component("BInput",          require("buefy/src/components/input/Input"));
Vue.component("BLoading",        require("buefy/src/components/loading/Loading"));
Vue.component("BMenu",           require("buefy/src/components/menu/Menu"));
Vue.component("BMenuList",       require("buefy/src/components/menu/MenuList"));
Vue.component("BMenuItem",       require("buefy/src/components/menu/MenuItem"));
Vue.component("BMessage",        require("buefy/src/components/message/Message"));
Vue.component("BModal",          require("buefy/src/components/modal/Modal"));
Vue.component("BNavbar",         require("buefy/src/components/navbar/Navbar"));
Vue.component("BNavbarItem",     require("buefy/src/components/navbar/NavbarItem"));
Vue.component("BNotification",   require("buefy/src/components/notification/Notification"));
Vue.component("BNumberinput",    require("buefy/src/components/numberinput/Numberinput"));
Vue.component("BPagination",     require("buefy/src/components/pagination/Pagination"));
Vue.component("BProgress",       require("buefy/src/components/progress/Progress"));
Vue.component("BRadio",          require("buefy/src/components/radio/Radio"));
Vue.component("BRadioButton",    require("buefy/src/components/radio/RadioButton"));
Vue.component("BSelect",         require("buefy/src/components/select/Select"));
Vue.component("BSlider",         require("buefy/src/components/slider/Slider"));
Vue.component("BSliderTick",     require("buefy/src/components/slider/SliderTick"));
Vue.component("BSteps",          require("buefy/src/components/steps/Steps"));
Vue.component("BStepItem",       require("buefy/src/components/steps/StepItem"));
Vue.component("BSwitch",         require("buefy/src/components/switch/Switch"));
Vue.component("BTable",          require("buefy/src/components/table/Table"));
Vue.component("BTableColumn",    require("buefy/src/components/table/TableColumn"));
Vue.component("BTabs",           require("buefy/src/components/tabs/Tabs"));
Vue.component("BTabItem",        require("buefy/src/components/tabs/TabItem"));
Vue.component("BTag",            require("buefy/src/components/tag/Tag"));
Vue.component("BTaglist",        require("buefy/src/components/tag/Taglist"));
Vue.component("BTaginput",       require("buefy/src/components/taginput/Taginput"));
Vue.component("BTimepicker",     require("buefy/src/components/timepicker/Timepicker"));
Vue.component("BTooltip",        require("buefy/src/components/tooltip/Tooltip"));
Vue.component("BUpload",         require("buefy/src/components/upload/Upload"));

// Finally, ensure Buefy is allowed to do all root initialization.
Vue.use(Buefy);

// This module is resolved once it executes.
export default Promise.resolve();
