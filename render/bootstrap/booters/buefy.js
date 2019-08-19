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
Vue.component("BAutocomplete",   require("buefy/dist/components/autocomplete").Autocomplete);
Vue.component("BButton",         require("buefy/dist/components/button").Button);
Vue.component("BCheckbox",       require("buefy/dist/components/checkbox").Checkbox);
Vue.component("BCheckboxButton", require("buefy/dist/components/checkbox").CheckboxButton);
Vue.component("BClockpicker",    require("buefy/dist/components/clockpicker").Clockpicker);
Vue.component("BCollapse",       require("buefy/dist/components/collapse").Collapse);
Vue.component("BDatepicker",     require("buefy/dist/components/datepicker").Datepicker);
Vue.component("BDropdown",       require("buefy/dist/components/dropdown").Dropdown);
Vue.component("BDropdownItem",   require("buefy/dist/components/dropdown").DropdownItem);
Vue.component("BField",          require("buefy/dist/components/field").Field);
Vue.component("BIcon",           require("buefy/dist/components/icon").Icon);
Vue.component("BInput",          require("buefy/dist/components/input").Input);
Vue.component("BLoading",        require("buefy/dist/components/loading").Loading);
Vue.component("BMenu",           require("buefy/dist/components/menu").Menu);
Vue.component("BMenuList",       require("buefy/dist/components/menu").MenuList);
Vue.component("BMenuItem",       require("buefy/dist/components/menu").MenuItem);
Vue.component("BMessage",        require("buefy/dist/components/message").Message);
Vue.component("BModal",          require("buefy/dist/components/modal").Modal);
Vue.component("BNavbar",         require("buefy/dist/components/navbar").Navbar);
Vue.component("BNavbarItem",     require("buefy/dist/components/navbar").NavbarItem);
Vue.component("BNotification",   require("buefy/dist/components/notification").Notification);
Vue.component("BNumberinput",    require("buefy/dist/components/numberinput").Numberinput);
Vue.component("BPagination",     require("buefy/dist/components/pagination").Pagination);
Vue.component("BProgress",       require("buefy/dist/components/progress").Progress);
Vue.component("BRadio",          require("buefy/dist/components/radio").Radio);
Vue.component("BRadioButton",    require("buefy/dist/components/radio").RadioButton);
Vue.component("BSelect",         require("buefy/dist/components/select").Select);
Vue.component("BSlider",         require("buefy/dist/components/slider").Slider);
Vue.component("BSliderTick",     require("buefy/dist/components/slider").SliderTick);
Vue.component("BSteps",          require("buefy/dist/components/steps").Steps);
Vue.component("BStepItem",       require("buefy/dist/components/steps").StepItem);
Vue.component("BSwitch",         require("buefy/dist/components/switch").Switch);
Vue.component("BTable",          require("buefy/dist/components/table").Table);
Vue.component("BTableColumn",    require("buefy/dist/components/table").TableColumn);
Vue.component("BTabs",           require("buefy/dist/components/tabs").Tabs);
Vue.component("BTabItem",        require("buefy/dist/components/tabs").TabItem);
Vue.component("BTag",            require("buefy/dist/components/tag").Tag);
Vue.component("BTaglist",        require("buefy/dist/components/tag").Taglist);
Vue.component("BTaginput",       require("buefy/dist/components/taginput").Taginput);
Vue.component("BTimepicker",     require("buefy/dist/components/timepicker").Timepicker);
Vue.component("BTooltip",        require("buefy/dist/components/tooltip").Tooltip);
Vue.component("BUpload",         require("buefy/dist/components/upload").Upload);

// Finally, ensure Buefy is allowed to do all root initialization.
Vue.use(Buefy);
