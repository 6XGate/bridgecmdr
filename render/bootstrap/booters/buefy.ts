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
Vue.component("BAutocomplete",   require("buefy/src/components/autocomplete/Autocomplete.vue"));
Vue.component("BButton",         require("buefy/src/components/button/Button.vue"));
Vue.component("BCheckbox",       require("buefy/src/components/checkbox/Checkbox.vue"));
Vue.component("BCheckboxButton", require("buefy/src/components/checkbox/CheckboxButton.vue"));
Vue.component("BClockpicker",    require("buefy/src/components/clockpicker/Clockpicker.vue"));
Vue.component("BCollapse",       require("buefy/src/components/collapse/Collapse.vue"));
Vue.component("BDatepicker",     require("buefy/src/components/datepicker/Datepicker.vue"));
Vue.component("BDropdown",       require("buefy/src/components/dropdown/Dropdown.vue"));
Vue.component("BDropdownItem",   require("buefy/src/components/dropdown/DropdownItem.vue"));
Vue.component("BField",          require("buefy/src/components/field/Field.vue"));
Vue.component("BIcon",           require("buefy/src/components/icon/Icon.vue"));
Vue.component("BInput",          require("buefy/src/components/input/Input.vue"));
Vue.component("BLoading",        require("buefy/src/components/loading/Loading.vue"));
Vue.component("BMenu",           require("buefy/src/components/menu/Menu.vue"));
Vue.component("BMenuList",       require("buefy/src/components/menu/MenuList.vue"));
Vue.component("BMenuItem",       require("buefy/src/components/menu/MenuItem.vue"));
Vue.component("BMessage",        require("buefy/src/components/message/Message.vue"));
Vue.component("BModal",          require("buefy/src/components/modal/Modal.vue"));
Vue.component("BNavbar",         require("buefy/src/components/navbar/Navbar.vue"));
Vue.component("BNavbarItem",     require("buefy/src/components/navbar/NavbarItem.vue"));
Vue.component("BNotification",   require("buefy/src/components/notification/Notification.vue"));
Vue.component("BNumberinput",    require("buefy/src/components/numberinput/Numberinput.vue"));
Vue.component("BPagination",     require("buefy/src/components/pagination/Pagination.vue"));
Vue.component("BProgress",       require("buefy/src/components/progress/Progress.vue"));
Vue.component("BRadio",          require("buefy/src/components/radio/Radio.vue"));
Vue.component("BRadioButton",    require("buefy/src/components/radio/RadioButton.vue"));
Vue.component("BSelect",         require("buefy/src/components/select/Select.vue"));
Vue.component("BSlider",         require("buefy/src/components/slider/Slider.vue"));
Vue.component("BSliderTick",     require("buefy/src/components/slider/SliderTick.vue"));
Vue.component("BSteps",          require("buefy/src/components/steps/Steps.vue"));
Vue.component("BStepItem",       require("buefy/src/components/steps/StepItem.vue"));
Vue.component("BSwitch",         require("buefy/src/components/switch/Switch.vue"));
Vue.component("BTable",          require("buefy/src/components/table/Table.vue"));
Vue.component("BTableColumn",    require("buefy/src/components/table/TableColumn.vue"));
Vue.component("BTabs",           require("buefy/src/components/tabs/Tabs.vue"));
Vue.component("BTabItem",        require("buefy/src/components/tabs/TabItem.vue"));
Vue.component("BTag",            require("buefy/src/components/tag/Tag.vue"));
Vue.component("BTaglist",        require("buefy/src/components/tag/Taglist.vue"));
Vue.component("BTaginput",       require("buefy/src/components/taginput/Taginput.vue"));
Vue.component("BTimepicker",     require("buefy/src/components/timepicker/Timepicker.vue"));
Vue.component("BTooltip",        require("buefy/src/components/tooltip/Tooltip.vue"));
Vue.component("BUpload",         require("buefy/src/components/upload/Upload.vue"));

// Finally, ensure Buefy is allowed to do all root initialization.
Vue.use(Buefy);

// This module is resolved once it executes.
export default Promise.resolve();
