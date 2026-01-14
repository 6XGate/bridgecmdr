@file:OptIn(ExperimentalMaterial3Api::class)

package org.sleepingcats.bridgecmdr.ui.component

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuAnchorType
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.MenuDefaults
import androidx.compose.material3.MenuItemColors
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.ProvideTextStyle
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldColors
import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.input.pointer.PointerIcon
import androidx.compose.ui.input.pointer.pointerHoverIcon
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.action_collapse
import bridgecmdr.composeapp.generated.resources.action_expand
import bridgecmdr.composeapp.generated.resources.menu_down
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource

@Composable
fun defaultExpandTrailingIcon(
  expanded: Boolean,
  modifier: Modifier = Modifier,
) {
  // Similar to ExposedDropdownMenuDefaults.TrailingIcon(expanded), but
  // with rotation animation.
  val arrowRotation by animateFloatAsState(if (expanded) 180f else 0f)
  Icon(
    painterResource(Res.drawable.menu_down),
    modifier = modifier.rotate(arrowRotation),
    contentDescription =
      if (expanded) {
        stringResource(Res.string.action_collapse)
      } else {
        stringResource(Res.string.action_expand)
      },
  )
}

@Composable
fun <T> OutlinedSelectField(
  // Text field specific
  value: T?,
  onValueChanged: (T?) -> Unit,
  modifier: Modifier = Modifier,
  enabled: Boolean = true,
  textStyle: TextStyle = LocalTextStyle.current,
  label: @Composable ((T?) -> Unit)? = null,
  placeholder: @Composable (() -> Unit)? = null,
  leadingIcon: @Composable (() -> Unit)? = null,
  trailingIcon: @Composable (() -> Unit)? = null,
  prefix: @Composable (() -> Unit)? = null,
  suffix: @Composable (() -> Unit)? = null,
  supportingText: @Composable ((T?) -> Unit)? = null,
  isError: Boolean = false,
  colors: TextFieldColors = ExposedDropdownMenuDefaults.outlinedTextFieldColors(),
  shape: Shape = OutlinedTextFieldDefaults.shape,
  // Drop menu specific
  valueText: @Composable (T) -> String = { it.toString() },
  options: List<T>,
  optionKey: (T) -> Any = { it as Any },
  optionContent: @Composable (T) -> Unit = { Text(valueText(it)) },
  expandIcon: @Composable ((Boolean) -> Unit) = ::defaultExpandTrailingIcon,
  menuColors: MenuItemColors = MenuDefaults.itemColors(),
  menuSelectedColors: MenuItemColors =
    MenuDefaults.itemColors(
      MaterialTheme.colorScheme.onPrimaryContainer,
      MaterialTheme.colorScheme.onPrimaryContainer,
      MaterialTheme.colorScheme.onPrimaryContainer,
    ),
  menuContainerColor: Color = MenuDefaults.containerColor,
  menuSelectedContainerColor: Color = MaterialTheme.colorScheme.primaryContainer,
) {
  val (expanded, setExpanded) = remember { mutableStateOf(false) }

  fun dismiss(value: T?) {
    setExpanded(false)
    onValueChanged(value)
  }

  val interactionSource = remember { MutableInteractionSource() }
  val isFocused by interactionSource.collectIsFocusedAsState()

  // Supporting text, but won't interfere with the dropdown menu anchoring.
  val supportDecoration: @Composable (content: @Composable () -> Unit) -> Unit =
    if (supportingText == null) {
      { content -> content() }
    } else {
      { content ->
        Column {
          content()
          ProvideTextStyle(
            MaterialTheme.typography.bodySmall.copy(
              color =
                when {
                  !enabled -> colors.disabledSupportingTextColor
                  isError -> colors.errorSupportingTextColor
                  isFocused -> colors.focusedSupportingTextColor
                  else -> colors.unfocusedSupportingTextColor
                },
            ),
          ) {
            Box(modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 4.dp)) {
              supportingText(value)
            }
          }
        }
      }
    }

  supportDecoration {
    val valueText = value?.let { valueText(it) } ?: ""
    ExposedDropdownMenuBox(expanded, onExpandedChange = { setExpanded(it) }) {
      OutlinedTextField(
        value = valueText,
        onValueChange = {},
        modifier =
          modifier
            .menuAnchor(ExposedDropdownMenuAnchorType.PrimaryNotEditable)
            .pointerHoverIcon(PointerIcon.Hand, true),
        enabled = enabled,
        textStyle = textStyle,
        label = label?.let { cb -> { cb(value) } },
        placeholder = placeholder,
        leadingIcon = leadingIcon,
        prefix = prefix,
        suffix = suffix,
        colors = colors,
        shape = shape,
        readOnly = true,
        isError = isError,
        trailingIcon = trailingIcon ?: { expandIcon(expanded) },
      )
      ExposedDropdownMenu(expanded, onDismissRequest = { setExpanded(false) }) {
        for (option in options) {
          key(optionKey(option)) {
            DropdownMenuItem(
              colors = if (option == value) menuSelectedColors else menuColors,
              modifier = Modifier.background(if (option == value) menuSelectedContainerColor else menuContainerColor),
              text = { optionContent(option) },
              onClick = { dismiss(option) },
            )
          }
        }
      }
    }
  }
}

@Composable
fun <T> OutlinedSelectField(
  // Text field specific
  state: MutableState<T?>,
  modifier: Modifier = Modifier,
  enabled: Boolean = true,
  textStyle: TextStyle = LocalTextStyle.current,
  label: @Composable ((T?) -> Unit)? = null,
  placeholder: @Composable (() -> Unit)? = null,
  leadingIcon: @Composable (() -> Unit)? = null,
  trailingIcon: @Composable (() -> Unit)? = null,
  prefix: @Composable (() -> Unit)? = null,
  suffix: @Composable (() -> Unit)? = null,
  supportingText: @Composable ((T?) -> Unit)? = null,
  isError: Boolean = false,
  colors: TextFieldColors = ExposedDropdownMenuDefaults.outlinedTextFieldColors(),
  shape: Shape = OutlinedTextFieldDefaults.shape,
  // Drop menu specific
  valueText: @Composable (T) -> String = { it.toString() },
  options: List<T>,
  optionKey: (T) -> Any = { it as Any },
  optionContent: @Composable (T) -> Unit = { Text(valueText(it)) },
  expandIcon: @Composable ((Boolean) -> Unit) = ::defaultExpandTrailingIcon,
  menuColors: MenuItemColors = MenuDefaults.itemColors(),
  menuSelectedColors: MenuItemColors =
    MenuDefaults.itemColors(
      MaterialTheme.colorScheme.onPrimaryContainer,
      MaterialTheme.colorScheme.onPrimaryContainer,
      MaterialTheme.colorScheme.onPrimaryContainer,
    ),
  menuContainerColor: Color = MenuDefaults.containerColor,
  menuSelectedContainerColor: Color = MaterialTheme.colorScheme.primaryContainer,
) {
  OutlinedSelectField(
    value = state.value,
    onValueChanged = { state.value = it },
    modifier = modifier,
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
    valueText = valueText,
    options = options,
    optionContent = optionContent,
    expandIcon = expandIcon,
    menuColors = menuColors,
    menuSelectedColors = menuSelectedColors,
    menuContainerColor = menuContainerColor,
    menuSelectedContainerColor = menuSelectedContainerColor,
  )
}
