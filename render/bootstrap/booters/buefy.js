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
import BAutocomplete   from "buefy/src/components/autocomplete/Autocomplete";
import BButton         from "buefy/src/components/button/Button";
import BCheckbox       from "buefy/src/components/checkbox/Checkbox";
import BCheckboxButton from "buefy/src/components/checkbox/CheckboxButton";
import BClockpicker    from "buefy/src/components/clockpicker/Clockpicker";
import BCollapse       from "buefy/src/components/collapse/Collapse";
import BDatepicker     from "buefy/src/components/datepicker/Datepicker";
import BDialog         from "buefy/src/components/dialog/Dialog";
import BDropdown       from "buefy/src/components/dropdown/Dropdown";
import BDropdownItem   from "buefy/src/components/dropdown/DropdownItem";
import BField          from "buefy/src/components/field/Field";
import BIcon           from "buefy/src/components/icon/Icon";
import BInput          from "buefy/src/components/input/Input";
import BLoading        from "buefy/src/components/loading/Loading";
import BMenu           from "buefy/src/components/menu/Menu";
import BMenuList       from "buefy/src/components/menu/MenuList";
import BMenuItem       from "buefy/src/components/menu/MenuItem";
import BMessage        from "buefy/src/components/message/Message";
import BModal          from "buefy/src/components/modal/Modal";
import BNavbar         from "buefy/src/components/navbar/Navbar";
import BNavbarItem     from "buefy/src/components/navbar/NavbarItem";
import BNotification   from "buefy/src/components/notification/Notification";
import BNumberinput    from "buefy/src/components/numberinput/Numberinput";
import BPagination     from "buefy/src/components/pagination/Pagination";
import BProgress       from "buefy/src/components/progress/Progress";
import BRadio          from "buefy/src/components/radio/Radio";
import BRadioButton    from "buefy/src/components/radio/RadioButton";
import BSelect         from "buefy/src/components/select/Select";
import BSlider         from "buefy/src/components/slider/Slider";
import BSliderTick     from "buefy/src/components/slider/SliderTick";
import BSnackbar       from "buefy/src/components/snackbar/Snackbar";
import BSteps          from "buefy/src/components/steps/Steps";
import BStepItem       from "buefy/src/components/steps/StepItem";
import BSwitch         from "buefy/src/components/switch/Switch";
import BTable          from "buefy/src/components/table/Table";
import BTableColumn    from "buefy/src/components/table/TableColumn";
import BTabs           from "buefy/src/components/tabs/Tabs";
import BTabItem        from "buefy/src/components/tabs/TabItem";
import BTag            from "buefy/src/components/tag/Tag";
import BTaglist        from "buefy/src/components/tag/Taglist";
import BTaginput       from "buefy/src/components/taginput/Taginput";
import BTimepicker     from "buefy/src/components/timepicker/Timepicker";
import BToast          from "buefy/src/components/toast/Toast";
import BTooltip        from "buefy/src/components/tooltip/Tooltip";
import BUpload         from "buefy/src/components/upload/Upload";

// We load the components up this way, though not necessary, to make WebStorm happy.
Vue.component("BAutocomplete",   BAutocomplete);
Vue.component("BButton",         BButton);
Vue.component("BCheckbox",       BCheckbox);
Vue.component("BCheckboxButton", BCheckboxButton);
Vue.component("BClockpicker",    BClockpicker);
Vue.component("BCollapse",       BCollapse);
Vue.component("BDatepicker",     BDatepicker);
Vue.component("BDialog",         BDialog);
Vue.component("BDropdown",       BDropdown);
Vue.component("BDropdownItem",   BDropdownItem);
Vue.component("BField",          BField);
Vue.component("BIcon",           BIcon);
Vue.component("BInput",          BInput);
Vue.component("BLoading",        BLoading);
Vue.component("BMenu",           BMenu);
Vue.component("BMenuList",       BMenuList);
Vue.component("BMenuItem",       BMenuItem);
Vue.component("BMessage",        BMessage);
Vue.component("BModal",          BModal);
Vue.component("BNavbar",         BNavbar);
Vue.component("BNavbarItem",     BNavbarItem);
Vue.component("BNotification",   BNotification);
Vue.component("BNumberinput",    BNumberinput);
Vue.component("BPagination",     BPagination);
Vue.component("BProgress",       BProgress);
Vue.component("BRadio",          BRadio);
Vue.component("BRadioButton",    BRadioButton);
Vue.component("BSelect",         BSelect);
Vue.component("BSlider",         BSlider);
Vue.component("BSliderTick",     BSliderTick);
Vue.component("BSnackbar",       BSnackbar);
Vue.component("BSteps",          BSteps);
Vue.component("BStepItem",       BStepItem);
Vue.component("BSwitch",         BSwitch);
Vue.component("BTable",          BTable);
Vue.component("BTableColumn",    BTableColumn);
Vue.component("BTabs",           BTabs);
Vue.component("BTabItem",        BTabItem);
Vue.component("BTag",            BTag);
Vue.component("BTaglist",        BTaglist);
Vue.component("BTaginput",       BTaginput);
Vue.component("BTimepicker",     BTimepicker);
Vue.component("BToast",          BToast);
Vue.component("BTooltip",        BTooltip);
Vue.component("BUpload",         BUpload);

// Finally, ensure Buefy is allowed to do all root initialization.
Vue.use(Buefy);
