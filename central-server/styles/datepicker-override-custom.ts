import { css } from "styled-components";

export const DatePickerStyles = css`
    .PresetDateRangePicker input {
        font-family: inherit;
    }

    .PresetDateRangePicker_panel {
        padding: 0 22px 11px;
    }

    .PresetDateRangePicker_button {
        position: relative;
        height: 100%;
        text-align: center;
        background: 0 0;
        border: 2px solid ${props => props.theme.DateRangePickerTheme.primary};
        color: ${props => props.theme.DateRangePickerTheme.primary};
        padding: 4px 12px;
        margin-right: 8px;
        font: inherit;
        line-height: normal;
        overflow: visible;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        cursor: pointer;
    }

    .PresetDateRangePicker_button:active {
        outline: 0;
    }

    .PresetDateRangePicker_button__selected {
        color: ${(props) => props.theme.DateRangePickerTheme.white};
        background: ${props => props.theme.DateRangePickerTheme.primary};
    }

    .SingleDatePickerInput {
        display: inline-block;
        background-color: ${(props) => props.theme.DateRangePickerTheme.white};
    }

    .SingleDatePickerInput__rtl {
        direction: rtl;
    }

    .SingleDatePickerInput__disabled {
        background-color: ${props => props.theme.DateRangePickerTheme.grayLightest};
    }

    .SingleDatePickerInput__block {
        display: block;
    }

    .SingleDatePickerInput__showClearDate {
        padding-right: 30px;
    }

    .SingleDatePickerInput_clearDate {
        background: 0 0;
        border: 0;
        color: inherit;
        font: inherit;
        line-height: normal;
        overflow: visible;
        cursor: pointer;
        padding: 10px;
        margin: 0 10px 0 5px;
        position: absolute;
        right: 0;
        top: 50%;
        -webkit-transform: translateY(-50%);
        -ms-transform: translateY(-50%);
        transform: translateY(-50%);
    }
    .SingleDatePickerInput_clearDate__default:focus,
    .SingleDatePickerInput_clearDate__default:hover {
        background: ${props => props.theme.DateRangePickerTheme.border};
        border-radius: 50%;
    }
    .SingleDatePickerInput_clearDate__small {
        padding: 6px;
    }

    .SingleDatePickerInput_clearDate__hide {
        visibility: hidden;
    }

    .SingleDatePickerInput_clearDate_svg {
        fill: ${props => props.theme.DateRangePickerTheme.grayLight};
        height: 12px;
        width: 15px;
        vertical-align: middle;
    }

    .SingleDatePickerInput_clearDate_svg__small {
        height: 9px;
    }

    .SingleDatePickerInput_calendarIcon {
        background: 0 0;
        border: 0;
        color: inherit;
        font: inherit;
        line-height: normal;
        overflow: visible;
        cursor: pointer;
        display: inline-block;
        vertical-align: middle;
        padding: 10px;
        margin: 0 5px 0 10px;
    }

    .SingleDatePickerInput_calendarIcon_svg {
        fill: ${props => props.theme.DateRangePickerTheme.grayLight};
        height: 15px;
        width: 14px;
        vertical-align: middle;
    }
    .SingleDatePicker {
        position: relative;
        display: inline-block;
    }
    .SingleDatePicker__block {
        display: block;
    }
    .SingleDatePicker_picker {
        z-index: 1;
        background-color: ${(props) => props.theme.DateRangePickerTheme.white};
        position: absolute;
    }
    .SingleDatePicker_picker__rtl {
        direction: rtl;
    }
    .SingleDatePicker_picker__directionLeft {
        left: 0;
    }
    .SingleDatePicker_picker__directionRight {
        right: 0;
    }
    .SingleDatePicker_picker__portal {
        background-color: rgba(0, 0, 0, 0.3);
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
    }
    .SingleDatePicker_picker__fullScreenPortal {
        background-color: ${(props) => props.theme.DateRangePickerTheme.white};
    }
    .SingleDatePicker_closeButton {
        background: 0 0;
        border: 0;
        color: inherit;
        font: inherit;
        line-height: normal;
        overflow: visible;
        cursor: pointer;
        position: absolute;
        top: 0;
        right: 0;
        padding: 15px;
        z-index: 2;
    }
    .SingleDatePicker_closeButton:focus,
    .SingleDatePicker_closeButton:hover {
        color: darken(${props => props.theme.DateRangePickerTheme.grayLighter}, 10%);
        text-decoration: none;
    }
    .SingleDatePicker_closeButton_svg {
        height: 15px;
        width: 15px;
        fill: ${props => props.theme.DateRangePickerTheme.grayLighter};
    }
    .DayPickerKeyboardShortcuts_buttonReset {
        background: 0 0;
        border: 0;
        border-radius: 0;
        color: inherit;
        font: inherit;
        line-height: normal;
        overflow: visible;
        padding: 0;
        cursor: pointer;
        font-size: 14px;
    }
    .DayPickerKeyboardShortcuts_buttonReset:active {
        outline: 0;
    }
    .DayPickerKeyboardShortcuts_show {
        width: 33px;
        height: 26px;
        position: absolute;
        z-index: 2;
    }
    .DayPickerKeyboardShortcuts_show::before {
        content: "";
        display: block;
        position: absolute;
    }
    .DayPickerKeyboardShortcuts_show__bottomRight {
        bottom: 0;
        right: 0;
    }
    .DayPickerKeyboardShortcuts_show__bottomRight::before {
        border-top: 26px solid transparent;
        border-right: 33px solid ${props => props.theme.DateRangePickerTheme.primary};
        bottom: 0;
        right: 0;
    }
    .DayPickerKeyboardShortcuts_show__bottomRight:hover::before {
        border-right: 33px solid ${props => props.theme.DateRangePickerTheme.primary_dark};
    }
    .DayPickerKeyboardShortcuts_show__topRight {
        top: 0;
        right: 0;
    }
    .DayPickerKeyboardShortcuts_show__topRight::before {
        border-bottom: 26px solid transparent;
        border-right: 33px solid ${props => props.theme.DateRangePickerTheme.primary};
        top: 0;
        right: 0;
    }
    .DayPickerKeyboardShortcuts_show__topRight:hover::before {
        border-right: 33px solid ${props => props.theme.DateRangePickerTheme.primary_dark};
    }
    .DayPickerKeyboardShortcuts_show__topLeft {
        top: 0;
        left: 0;
    }
    .DayPickerKeyboardShortcuts_show__topLeft::before {
        border-bottom: 26px solid transparent;
        border-left: 33px solid ${props => props.theme.DateRangePickerTheme.primary};
        top: 0;
        left: 0;
    }
    .DayPickerKeyboardShortcuts_show__topLeft:hover::before {
        border-left: 33px solid ${props => props.theme.DateRangePickerTheme.primary_dark};
    }
    .DayPickerKeyboardShortcuts_showSpan {
        color: ${(props) => props.theme.DateRangePickerTheme.white};
        position: absolute;
    }
    .DayPickerKeyboardShortcuts_showSpan__bottomRight {
        bottom: 0;
        right: 5px;
    }
    .DayPickerKeyboardShortcuts_showSpan__topRight {
        top: 1px;
        right: 5px;
    }
    .DayPickerKeyboardShortcuts_showSpan__topLeft {
        top: 1px;
        left: 5px;
    }
    .DayPickerKeyboardShortcuts_panel {
        overflow: auto;
        background: ${(props) => props.theme.DateRangePickerTheme.white};
        border: 1px solid ${props => props.theme.DateRangePickerTheme.border};
        border-radius: 2px;
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        z-index: 2;
        padding: 22px;
        margin: 33px;
        text-align: left;
    }
    .DayPickerKeyboardShortcuts_title {
        font-size: 16px;
        font-weight: 700;
        margin: 0;
    }
    .DayPickerKeyboardShortcuts_list {
        list-style: none;
        padding: 0;
        font-size: 14px;
    }
    .DayPickerKeyboardShortcuts_close {
        position: absolute;
        right: 22px;
        top: 22px;
        z-index: 2;
    }
    .DayPickerKeyboardShortcuts_close:active {
        outline: 0;
    }
    .DayPickerKeyboardShortcuts_closeSvg {
        height: 15px;
        width: 15px;
        fill: ${props => props.theme.DateRangePickerTheme.grayLighter};
    }
    .DayPickerKeyboardShortcuts_closeSvg:focus,
    .DayPickerKeyboardShortcuts_closeSvg:hover {
        fill: ${props => props.theme.DateRangePickerTheme.grayLight};
    }
    .CalendarDay {
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        cursor: pointer;
        font-size: 14px;
        text-align: center;
    }
    .CalendarDay:active {
        outline: 0;
    }
    .CalendarDay__defaultCursor {
        cursor: default;
    }
    .CalendarDay__default {
        border: 1px solid ${props => props.theme.DateRangePickerTheme.borderLight};
        color: ${(props) => props.theme.DateRangePickerTheme.gray};
        background: ${(props) => props.theme.DateRangePickerTheme.white};
    }
    .CalendarDay__default:hover {
        background: ${props => props.theme.DateRangePickerTheme.borderLight};
        border: 1px solid ${props => props.theme.DateRangePickerTheme.borderLight};
        color: inherit;
    }
    .CalendarDay__hovered_offset {
        background: ${props => props.theme.DateRangePickerTheme.borderBright};
        border: 1px double ${props => props.theme.DateRangePickerTheme.borderLight};
        color: inherit;
    }
    .CalendarDay__outside {
        border: 0;
        background: ${(props) => props.theme.DateRangePickerTheme.white};
        color: ${(props) => props.theme.DateRangePickerTheme.gray};
    }
    .CalendarDay__outside:hover {
        border: 0;
    }
    .CalendarDay__blocked_minimum_nights {
        background: ${(props) => props.theme.DateRangePickerTheme.white};
        border: 1px solid ${props => props.theme.DateRangePickerTheme.borderLighter};
        color: ${props => props.theme.DateRangePickerTheme.grayLighter};
    }
    .CalendarDay__blocked_minimum_nights:active,
    .CalendarDay__blocked_minimum_nights:hover {
        background: ${(props) => props.theme.DateRangePickerTheme.white};
        color: ${props => props.theme.DateRangePickerTheme.grayLighter};
    }
    .CalendarDay__highlighted_calendar {
        background: ${props => props.theme.DateRangePickerTheme.yellow};
        color: ${(props) => props.theme.DateRangePickerTheme.gray};
    }
    .CalendarDay__highlighted_calendar:active,
    .CalendarDay__highlighted_calendar:hover {
        background: ${props => props.theme.DateRangePickerTheme.yellow_dark};
        color: ${(props) => props.theme.DateRangePickerTheme.gray};
    }
    .CalendarDay__selected_span {
        background: ${props => props.theme.DateRangePickerTheme.primaryShade_2};
        border: 1px double ${props => props.theme.DateRangePickerTheme.primaryShade_1};
        color: ${(props) => props.theme.DateRangePickerTheme.blue};
    }
    .CalendarDay__selected_span:active,
    .CalendarDay__selected_span:hover {
        background: ${props => props.theme.DateRangePickerTheme.primaryShade_1};
        border: 1px double ${props => props.theme.DateRangePickerTheme.primaryShade_1};
        color: ${(props) => props.theme.DateRangePickerTheme.white};
    }
    .CalendarDay__selected,
    .CalendarDay__selected:active,
    .CalendarDay__selected:hover {
        background: ${props => props.theme.DateRangePickerTheme.primary};
        border: 1px double ${props => props.theme.DateRangePickerTheme.primary};
        color: ${(props) => props.theme.DateRangePickerTheme.blue};
    }
    .CalendarDay__hovered_span,
    .CalendarDay__hovered_span:hover {
        background: ${props => props.theme.DateRangePickerTheme.primaryShade_4};
        border: 1px double ${props => props.theme.DateRangePickerTheme.primaryShade_3};
        color: ${props => props.theme.DateRangePickerTheme.secondary};
    }
    .CalendarDay__hovered_span:active {
        background: ${props => props.theme.DateRangePickerTheme.primaryShade_3};
        border: 1px double ${props => props.theme.DateRangePickerTheme.primaryShade_3};
        color: ${props => props.theme.DateRangePickerTheme.secondary};
    }
    .CalendarDay__blocked_calendar,
    .CalendarDay__blocked_calendar:active,
    .CalendarDay__blocked_calendar:hover {
        background: ${props => props.theme.DateRangePickerTheme.grayLighter};
        border: 1px solid ${props => props.theme.DateRangePickerTheme.grayLighter};
        color: ${props => props.theme.DateRangePickerTheme.grayLight};
    }
    .CalendarDay__blocked_out_of_range,
    .CalendarDay__blocked_out_of_range:active,
    .CalendarDay__blocked_out_of_range:hover {
        background: ${(props) => props.theme.DateRangePickerTheme.white};
        border: 1px solid ${props => props.theme.DateRangePickerTheme.borderLight};
        color: ${props => props.theme.DateRangePickerTheme.grayLighter};
    }
    .CalendarDay__hovered_start_first_possible_end {
        background: ${props => props.theme.DateRangePickerTheme.borderLighter};
        border: 1px double ${props => props.theme.DateRangePickerTheme.borderLighter};
    }
    .CalendarDay__hovered_start_blocked_min_nights {
        background: ${props => props.theme.DateRangePickerTheme.borderLighter};
        border: 1px double ${props => props.theme.DateRangePickerTheme.borderLight};
    }
    .CalendarMonth {
        background: ${(props) => props.theme.DateRangePickerTheme.white};
        text-align: center;
        vertical-align: top;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    .CalendarMonth_table {
        border-collapse: collapse;
        border-spacing: 0;
    }
    .CalendarMonth_verticalSpacing {
        border-collapse: separate;
    }
    .CalendarMonth_caption {
        color: ${(props) => props.theme.DateRangePickerTheme.gray};
        font-size: 18px;
        text-align: center;
        padding-top: 22px;
        padding-bottom: 37px;
        caption-side: initial;
    }
    .CalendarMonth_caption__verticalScrollable {
        padding-top: 12px;
        padding-bottom: 7px;
    }
    .CalendarMonthGrid {
        background: ${(props) => props.theme.DateRangePickerTheme.white};
        text-align: left;
        z-index: 0;
    }
    .CalendarMonthGrid__animating {
        z-index: 1;
    }
    .CalendarMonthGrid__horizontal {
        position: absolute;
        left: 9px;
    }
    .CalendarMonthGrid__vertical,
    .CalendarMonthGrid__vertical_scrollable {
        margin: 0 auto;
    }
    .CalendarMonthGrid_month__horizontal {
        display: inline-block;
        vertical-align: top;
        min-height: 100%;
    }
    .CalendarMonthGrid_month__hideForAnimation {
        position: absolute;
        z-index: -1;
        opacity: 0;
        pointer-events: none;
    }
    .CalendarMonthGrid_month__hidden {
        visibility: hidden;
    }
    .DayPickerNavigation {
        position: relative;
        z-index: 2;
    }
    .DayPickerNavigation__horizontal {
        height: 0;
    }
    .DayPickerNavigation__verticalScrollable_prevNav {
        z-index: 1;
    }
    .DayPickerNavigation__verticalDefault {
        position: absolute;
        width: 100%;
        height: 52px;
        bottom: 0;
        left: 0;
    }
    .DayPickerNavigation__verticalScrollableDefault {
        position: relative;
    }
    .DayPickerNavigation__bottom {
        height: auto;
    }
    .DayPickerNavigation__bottomDefault {
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        display: -webkit-box;
        display: -moz-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        -webkit-justify-content: space-between;
        justify-content: space-between;
    }
    .DayPickerNavigation_button {
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        border: 0;
        padding: 0;
        margin: 0;
    }
    .DayPickerNavigation_button__default {
        border: 1px solid ${props => props.theme.DateRangePickerTheme.borderLight};
        background-color: ${(props) => props.theme.DateRangePickerTheme.white};
        color: #757575;
    }
    .DayPickerNavigation_button__default:focus,
    .DayPickerNavigation_button__default:hover {
        border: 1px solid ${props => props.theme.DateRangePickerTheme.borderMedium};
    }
    .DayPickerNavigation_button__default:active {
        background: ${props => props.theme.DateRangePickerTheme.grayLightest};
    }
    .DayPickerNavigation_button__disabled {
        cursor: default;
        border: 1px solid ${props => props.theme.DateRangePickerTheme.grayLightest};
    }
    .DayPickerNavigation_button__disabled:focus,
    .DayPickerNavigation_button__disabled:hover {
        border: 1px solid ${props => props.theme.DateRangePickerTheme.grayLightest};
    }
    .DayPickerNavigation_button__disabled:active {
        background: 0 0;
    }
    .DayPickerNavigation_button__horizontalDefault {
        position: absolute;
        top: 18px;
        line-height: 0.78;
        border-radius: 3px;
        padding: 6px 9px;
    }
    .DayPickerNavigation_bottomButton__horizontalDefault {
        position: static;
        margin: -10px 22px 30px;
    }
    .DayPickerNavigation_leftButton__horizontalDefault {
        left: 22px;
    }
    .DayPickerNavigation_rightButton__horizontalDefault {
        right: 22px;
    }
    .DayPickerNavigation_button__verticalDefault {
        padding: 5px;
        background: ${(props) => props.theme.DateRangePickerTheme.white};
        box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.1);
        position: relative;
        display: inline-block;
        text-align: center;
        height: 100%;
        width: 50%;
    }
    .DayPickerNavigation_nextButton__verticalDefault {
        border-left: 0;
    }
    .DayPickerNavigation_nextButton__verticalScrollableDefault,
    .DayPickerNavigation_prevButton__verticalScrollableDefault {
        width: 100%;
    }
    .DayPickerNavigation_svg__horizontal {
        height: 19px;
        width: 19px;
        fill: ${props => props.theme.DateRangePickerTheme.grayLight};
        display: block;
    }
    .DayPickerNavigation_svg__vertical {
        height: 42px;
        width: 42px;
        fill: ${(props) => props.theme.DateRangePickerTheme.gray};
    }
    .DayPickerNavigation_svg__disabled {
        fill: ${props => props.theme.DateRangePickerTheme.grayLightest};
    }
    .DayPicker {
        background: ${(props) => props.theme.DateRangePickerTheme.white};
        position: relative;
        text-align: left;
    }
    .DayPicker__horizontal {
        background: ${(props) => props.theme.DateRangePickerTheme.white};
    }
    .DayPicker__verticalScrollable {
        height: 100%;
    }
    .DayPicker__hidden {
        visibility: hidden;
    }
    .DayPicker__withBorder {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.07);
        border-radius: 3px;
    }
    .DayPicker_portal__horizontal {
        box-shadow: none;
        position: absolute;
        left: 50%;
        top: 50%;
    }
    .DayPicker_portal__vertical {
        position: initial;
    }
    .DayPicker_focusRegion {
        outline: 0;
    }
    .DayPicker_calendarInfo__horizontal,
    .DayPicker_wrapper__horizontal {
        display: inline-block;
        vertical-align: top;
    }
    .DayPicker_weekHeaders {
        position: relative;
    }
    .DayPicker_weekHeaders__horizontal {
        margin-left: 9px;
    }
    .DayPicker_weekHeader {
        color: #757575;
        position: absolute;
        top: 62px;
        z-index: 2;
        text-align: left;
    }
    .DayPicker_weekHeader__vertical {
        left: 50%;
    }
    .DayPicker_weekHeader__verticalScrollable {
        top: 0;
        display: table-row;
        border-bottom: 1px solid ${props => props.theme.DateRangePickerTheme.border};
        background: ${(props) => props.theme.DateRangePickerTheme.white};
        margin-left: 0;
        left: 0;
        width: 100%;
        text-align: center;
    }
    .DayPicker_weekHeader_ul {
        list-style: none;
        margin: 1px 0;
        padding-left: 0;
        padding-right: 0;
        font-size: 14px;
    }
    .DayPicker_weekHeader_li {
        display: inline-block;
        text-align: center;
    }
    .DayPicker_transitionContainer {
        position: relative;
        overflow: hidden;
        border-radius: 3px;
    }
    .DayPicker_transitionContainer__horizontal {
        -webkit-transition: height 0.2s ease-in-out;
        -moz-transition: height 0.2s ease-in-out;
        transition: height 0.2s ease-in-out;
    }
    .DayPicker_transitionContainer__vertical {
        width: 100%;
    }
    .DayPicker_transitionContainer__verticalScrollable {
        padding-top: 20px;
        height: 100%;
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        overflow-y: scroll;
    }
    .DateInput {
        margin: 0;
        padding: 0;
        background: ${(props) => props.theme.DateRangePickerTheme.white};
        position: relative;
        display: inline-block;
        width: 130px;
        vertical-align: middle;
    }
    .DateInput__small {
        width: 97px;
    }
    .DateInput__block {
        width: 100%;
    }
    .DateInput__disabled {
        background: ${props => props.theme.DateRangePickerTheme.grayLightest};
        color: ${props => props.theme.DateRangePickerTheme.border};
    }
    .DateInput_input {
        line-height: 24px;
        color: ${(props) => props.theme.DateRangePickerTheme.gray};
        background-color: ${(props) => props.theme.DateRangePickerTheme.white};
        width: 100%;
        padding: 11px 11px 9px;
        border: 0;
        border-top: 0;
        border-right: 0;
        border-bottom: 2px solid transparent;
        border-left: 0;
        border-radius: 0;
    }
    .DateInput_input__small {
        font-size: 15px;
        line-height: 18px;
        letter-spacing: 0.2px;
        padding: 7px 7px 5px;
    }
    .DateInput_input__regular {
        font-weight: auto;
    }
    .DateInput_input__readOnly {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
    .DateInput_input__focused {
        outline: 0;
        background: ${props => props.theme.DateRangePickerTheme.primary};
    }

    .DateInput_input__disabled {
        background: ${props => props.theme.DateRangePickerTheme.grayLightest};
        font-style: italic;
    }

    .DateInput_screenReaderMessage {
        border: 0;
        clip: rect(0, 0, 0, 0);
        height: 1px;
        margin: -1px;
        overflow: hidden;
        padding: 0;
        position: absolute;
        width: 1px;
    }
    .DateInput_fang {
        position: absolute;
        width: 20px;
        height: 10px;
        left: 22px;
        z-index: 2;
    }
    .DateInput_fangShape {
        fill: ${(props) => props.theme.DateRangePickerTheme.white};
    }
    .DateInput_fangStroke {
        stroke: ${props => props.theme.DateRangePickerTheme.border};
        fill: transparent;
    }
    .DateRangePickerInput {
        background-color: ${(props) => props.theme.DateRangePickerTheme.white};
        display: inline-block;
    }
    .DateRangePickerInput__disabled {
        background: ${props => props.theme.DateRangePickerTheme.grayLightest};
    }
    .DateRangePickerInput__withBorder {
        border-radius: 2px;
        border: 1px solid ${props => props.theme.DateRangePickerTheme.border} !important;
    }
    .DateRangePickerInput__rtl {
        direction: rtl;
    }
    .DateRangePickerInput__block {
        display: block;
    }
    .DateRangePickerInput__showClearDates {
        padding-right: 30px;
    }
    .DateRangePickerInput_arrow {
        display: inline-block;
        vertical-align: middle;
        color: ${(props) => props.theme.DateRangePickerTheme.gray};
    }
    .DateRangePickerInput_arrow_svg {
        vertical-align: middle;
        fill: ${(props) => props.theme.DateRangePickerTheme.gray};
        height: 24px;
        width: 24px;
    }
    .DateRangePickerInput_clearDates {
        position: absolute;
        top: 0;
        right: 0;
        background: 0 0;
        border: 0;
        color: inherit;
        font: inherit;
        line-height: normal;
        overflow: visible;
        cursor: pointer;
        padding: 6px 10px;
    }

    .DateRangePickerInput_clearDates_default:focus,
    .DateRangePickerInput_clearDates_default:hover {
        background: ${props => props.theme.DateRangePickerTheme.border};
        border-radius: 50%;
    }

    .DateRangePickerInput_clearDates__hide {
        visibility: hidden;
    }

    .DateRangePickerInput_clearDates_svg {
        fill: ${props => props.theme.DateRangePickerTheme.grayLight};
        height: 12px;
        width: 15px;
        vertical-align: middle;
    }

    .DateRangePickerInput_clearDates_svg__small {
        height: 9px;
    }

    .DateRangePickerInput_calendarIcon {
        background: 0 0;
        border: 0;
        color: inherit;
        font: inherit;
        line-height: normal;
        overflow: visible;
        cursor: pointer;
        display: inline-block;
        vertical-align: middle;
        padding: 10px;
        margin: 0 5px 0 10px;
    }
    .DateRangePickerInput_calendarIcon_svg {
        fill: ${props => props.theme.DateRangePickerTheme.grayLight};
        height: 15px;
        width: 14px;
        vertical-align: middle;
    }
    .DateRangePicker {
        position: relative;
        display: inline-block;
    }
    .DateRangePicker__block {
        display: block;
    }
    .DateRangePicker_picker {
        z-index: 1;
        background-color: ${(props) => props.theme.DateRangePickerTheme.white};
        position: absolute;
    }
    .DateRangePicker_picker__rtl {
        direction: rtl;
    }
    .DateRangePicker_picker__directionLeft {
        left: 0;
    }
    .DateRangePicker_picker__directionRight {
        right: 0;
    }
    .DateRangePicker_picker__portal {
        background-color: rgba(0, 0, 0, 0.3);
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
    }
    .DateRangePicker_picker__fullScreenPortal {
        background-color: ${(props) => props.theme.DateRangePickerTheme.white};
    }
    .DateRangePicker_closeButton {
        background: 0 0;
        border: 0;
        color: inherit;
        font: inherit;
        line-height: normal;
        overflow: visible;
        cursor: pointer;
        position: absolute;
        top: 0;
        right: 0;
        padding: 15px;
        z-index: 2;
    }
    .DateRangePicker_closeButton:focus,
    .DateRangePicker_closeButton:hover {
        color: darken(${props => props.theme.DateRangePickerTheme.grayLighter}, 10%);
        text-decoration: none;
    }
    .DateRangePicker_closeButton_svg {
        height: 15px;
        width: 15px;
        fill: ${props => props.theme.DateRangePickerTheme.grayLighter};
    }
`;