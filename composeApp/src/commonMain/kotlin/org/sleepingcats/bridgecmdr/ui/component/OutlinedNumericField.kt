package org.sleepingcats.bridgecmdr.ui.component

import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.input.InputTransformation
import androidx.compose.foundation.text.input.TextFieldBuffer
import androidx.compose.foundation.text.input.rememberTextFieldState
import androidx.compose.material3.Icon
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.TextFieldColors
import androidx.compose.material3.TextFieldLabelScope
import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEvent
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.input.pointer.PointerIcon
import androidx.compose.ui.input.pointer.pointerHoverIcon
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.KeyboardType
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.action_decrement
import bridgecmdr.composeapp.generated.resources.action_increment
import bridgecmdr.composeapp.generated.resources.minus
import bridgecmdr.composeapp.generated.resources.plus
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource

internal fun CharSequence.isDigitsOnly(): Boolean {
  for (c in this) if (!c.isDigit()) return false
  return true
}

@Composable
internal fun defaultDecrementIcon(
  colors: TextFieldColors,
  focusRequested: FocusRequester,
  isError: Boolean,
  focused: Boolean,
  enabled: Boolean,
  dec: () -> Unit,
) {
  Icon(
    painterResource(Res.drawable.minus),
    contentDescription = if (enabled) stringResource(Res.string.action_decrement) else null,
    modifier =
      Modifier
        .clip(CircleShape)
        .pointerHoverIcon(if (enabled) PointerIcon.Hand else PointerIcon.Default)
        .clickable(enabled = enabled) {
          dec()
          focusRequested.requestFocus()
        },
    tint =
      when {
        !enabled -> colors.disabledLeadingIconColor
        isError -> colors.errorLeadingIconColor
        focused -> colors.focusedLeadingIconColor
        else -> colors.unfocusedLeadingIconColor
      },
  )
}

@Composable
internal fun defaultIncrementIcon(
  colors: TextFieldColors,
  focusRequested: FocusRequester,
  isError: Boolean,
  focused: Boolean,
  enabled: Boolean,
  inc: () -> Unit,
) {
  Icon(
    painterResource(Res.drawable.plus),
    contentDescription = if (enabled) stringResource(Res.string.action_increment) else null,
    modifier =
      Modifier
        .clip(CircleShape)
        .pointerHoverIcon(if (enabled) PointerIcon.Hand else PointerIcon.Default)
        .clickable(enabled = enabled) {
          inc()
          focusRequested.requestFocus()
        },
    tint =
      when {
        !enabled -> colors.disabledTrailingIconColor
        isError -> colors.errorTrailingIconColor
        focused -> colors.focusedTrailingIconColor
        else -> colors.unfocusedTrailingIconColor
      },
  )
}

class NumericFieldInputTransform(
  private val minValue: Int,
  private val maxValue: Int,
) : InputTransformation {
  override val keyboardOptions: KeyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)

  override fun TextFieldBuffer.transformInput() {
    if (!asCharSequence().isDigitsOnly()) {
      revertAllChanges()
    }

    // Prevent leading zeros
    while (length > 1 && asCharSequence()[0] == '0') {
      replace(0, 1, "")
    }

    val currentValue = asCharSequence().toString().toIntOrNull() ?: return revertAllChanges()
    if (currentValue < minValue) return revertAllChanges()
    if (currentValue > maxValue) return revertAllChanges()
  }
}

internal fun TextFieldBuffer.setText(text: String) {
  replace(0, length, text)
}

@Composable
internal fun OutlinedNumericFieldCore(
  // Text field specific
  value: Int?,
  onValueChanged: (Int?) -> Unit,
  modifier: Modifier,
  enabled: Boolean,
  textStyle: TextStyle,
  label: @Composable (TextFieldLabelScope.() -> Unit)?,
  placeholder: @Composable (() -> Unit)?,
  leadingIcon: @Composable (() -> Unit)?,
  trailingIcon: @Composable (() -> Unit)?,
  prefix: @Composable (() -> Unit)?,
  suffix: @Composable (() -> Unit)?,
  supportingText: @Composable ((Int?) -> Unit)?,
  isError: Boolean,
  colors: TextFieldColors,
  shape: Shape,
  interactionSource: MutableInteractionSource,
  // Numeric field specific
  minValue: Int,
  maxValue: Int,
  decrementIcon: @Composable (Boolean, () -> Unit) -> Unit,
  incrementIcon: @Composable (Boolean, () -> Unit) -> Unit,
) {
  check(minValue >= 0) { "minValue must be non-negative" }
  check(minValue <= maxValue) { "minValue must be less than or equal to maxValue" }

  // Track the last value to detect external changes.
  val lastValue by produceState(value, value) { this.value = value }

  val textFieldState = rememberTextFieldState(initialText = value?.toString() ?: "")
  val inputTransformation = NumericFieldInputTransform(minValue, maxValue)
  val currentIntValue = textFieldState.text.toString().toIntOrNull()

  SideEffect {
    // If the current value and latest integer value are in sync, nothing needs to be done.
    if (value == currentIntValue) return@SideEffect

    if (lastValue != value) {
      // The external value has changed, update the text field.
      textFieldState.edit { setText(value?.toString() ?: "") }
    } else {
      // The internal value has changed, notify the external listener.
      onValueChanged(currentIntValue)
    }
  }

  fun updateIntValue(newValue: Int) {
    onValueChanged(newValue)
    val newText = newValue.toString()
    if (textFieldState.text.toString() != newText) {
      textFieldState.edit { setText(newText) }
    }
  }

  val decrementEnabled = enabled && (currentIntValue ?: minValue) > minValue
  val incrementEnabled = enabled && (currentIntValue ?: minValue) < maxValue

  fun incrementIntValue() {
    val newValue = (currentIntValue ?: minValue) + 1
    if (newValue <= maxValue) {
      updateIntValue(newValue)
    }
  }

  fun decrementIntValue() {
    val newValue = (currentIntValue ?: minValue) - 1
    if (newValue >= minValue) {
      updateIntValue(newValue)
    }
  }

  fun onKeyPress(ev: KeyEvent): Boolean {
    if (ev.type == KeyEventType.KeyDown) {
      when (ev.key) {
        Key.NumPadAdd, Key.Plus, Key.Equals, Key.DirectionUp -> {
          if (incrementEnabled) incrementIntValue()
          return true
        }

        Key.NumPadSubtract, Key.Minus, Key.DirectionDown -> {
          if (decrementEnabled) decrementIntValue()
          return true
        }

        else -> {
          return false
        }
      }
    } else {
      return false
    }
  }

  OutlinedTextField(
    state = textFieldState,
    modifier = modifier.onPreviewKeyEvent(::onKeyPress),
    enabled = enabled,
    textStyle = textStyle,
    label = label,
    placeholder = placeholder,
    leadingIcon = leadingIcon ?: { decrementIcon(decrementEnabled) { decrementIntValue() } },
    trailingIcon = trailingIcon ?: { incrementIcon(incrementEnabled) { incrementIntValue() } },
    prefix = prefix,
    suffix = suffix,
    supportingText = supportingText?.let { cb -> { cb(currentIntValue) } },
    isError = isError,
    colors = colors,
    shape = shape,
    inputTransformation = inputTransformation,
    interactionSource = interactionSource,
  )
}

@Composable
fun OutlinedNumericField(
  // Text field specific
  value: Int?,
  onValueChanged: (Int?) -> Unit,
  modifier: Modifier = Modifier,
  enabled: Boolean = true,
  textStyle: TextStyle = LocalTextStyle.current,
  label: @Composable (TextFieldLabelScope.() -> Unit)? = null,
  placeholder: @Composable (() -> Unit)? = null,
  leadingIcon: @Composable (() -> Unit)? = null,
  trailingIcon: @Composable (() -> Unit)? = null,
  prefix: @Composable (() -> Unit)? = null,
  suffix: @Composable (() -> Unit)? = null,
  supportingText: @Composable ((Int?) -> Unit)? = null,
  isError: Boolean = false,
  colors: TextFieldColors = OutlinedTextFieldDefaults.colors(),
  shape: Shape = OutlinedTextFieldDefaults.shape,
  // Numeric field specific
  minValue: Int = 0,
  maxValue: Int = Int.MAX_VALUE,
  decrementIcon: (@Composable (Boolean, () -> Unit) -> Unit)? = null,
  incrementIcon: (@Composable (Boolean, () -> Unit) -> Unit)? = null,
) {
  val interactionSource = remember { MutableInteractionSource() }
  val focusRequester = remember { FocusRequester() }
  val focused by interactionSource.collectIsFocusedAsState()
  OutlinedNumericFieldCore(
    value = value,
    onValueChanged = onValueChanged,
    modifier = modifier.focusRequester(focusRequester),
    enabled = enabled,
    textStyle = textStyle,
    label = label,
    placeholder = placeholder,
    leadingIcon = leadingIcon,
    trailingIcon = trailingIcon,
    prefix = prefix,
    suffix = suffix,
    supportingText = supportingText,
    isError = isError,
    colors = colors,
    shape = shape,
    interactionSource = interactionSource,
    minValue = minValue,
    maxValue = maxValue,
    decrementIcon =
      decrementIcon ?: { enabled, dec ->
        defaultDecrementIcon(colors, focusRequester, isError, focused, enabled, dec)
      },
    incrementIcon =
      incrementIcon ?: { enabled, inc ->
        defaultIncrementIcon(colors, focusRequester, isError, focused, enabled, inc)
      },
  )
}

@Composable
fun OutlinedNumericField(
  // Text field specific
  state: MutableState<Int?>,
  modifier: Modifier = Modifier,
  enabled: Boolean = true,
  textStyle: TextStyle = LocalTextStyle.current,
  label: @Composable (TextFieldLabelScope.() -> Unit)? = null,
  placeholder: @Composable (() -> Unit)? = null,
  leadingIcon: @Composable (() -> Unit)? = null,
  trailingIcon: @Composable (() -> Unit)? = null,
  prefix: @Composable (() -> Unit)? = null,
  suffix: @Composable (() -> Unit)? = null,
  supportingText: @Composable ((Int?) -> Unit)? = null,
  isError: Boolean = false,
  colors: TextFieldColors = OutlinedTextFieldDefaults.colors(),
  shape: Shape = OutlinedTextFieldDefaults.shape,
  // Numeric field specific
  minValue: Int = 0,
  maxValue: Int = Int.MAX_VALUE,
  decrementIcon: (@Composable (Boolean, () -> Unit) -> Unit)? = null,
  incrementIcon: (@Composable (Boolean, () -> Unit) -> Unit)? = null,
) {
  val interactionSource = remember { MutableInteractionSource() }
  val focusRequester = remember { FocusRequester() }
  val focused by interactionSource.collectIsFocusedAsState()
  OutlinedNumericFieldCore(
    value = state.value,
    onValueChanged = { state.value = it },
    modifier = modifier.focusRequester(focusRequester),
    enabled = enabled,
    textStyle = textStyle,
    label = label,
    placeholder = placeholder,
    leadingIcon = leadingIcon,
    trailingIcon = trailingIcon,
    prefix = prefix,
    suffix = suffix,
    supportingText = supportingText,
    isError = isError,
    colors = colors,
    shape = shape,
    interactionSource = interactionSource,
    minValue = minValue,
    maxValue = maxValue,
    decrementIcon =
      decrementIcon ?: { enabled, dec ->
        defaultDecrementIcon(colors, focusRequester, isError, focused, enabled, dec)
      },
    incrementIcon =
      incrementIcon ?: { enabled, inc ->
        defaultIncrementIcon(colors, focusRequester, isError, focused, enabled, inc)
      },
  )
}
