package org.sleepingcats.bridgecmdr.ui.component

import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import bridgecmdr.composeapp.generated.resources.Res
import bridgecmdr.composeapp.generated.resources.alert_circle
import io.konform.validation.ValidationError
import io.konform.validation.messagesAtPath
import org.jetbrains.compose.resources.StringResource
import org.jetbrains.compose.resources.painterResource
import org.jetbrains.compose.resources.stringResource

fun firstErrorOf(
  errors: List<ValidationError>?,
  validationPath: Any,
) = errors?.messagesAtPath(validationPath)?.let {
  if (it.isEmpty()) return@let null else it[0]
}

fun isErrored(error: String?) = error != null

@Composable
fun errorIconOf(error: String?): (@Composable () -> Unit)? =
  error?.let {
    { Icon(painterResource(Res.drawable.alert_circle), contentDescription = error) }
  }

class Hints(
  private val hints: Map<String, String>,
) {
  companion object {
    @Composable
    operator fun invoke(vararg messages: StringResource) =
      Hints(
        messages.associate { it.key to stringResource(it) },
      )
  }

  operator fun get(resource: StringResource) = get(resource.key)

  operator fun get(key: String?) = hints[key]
}

@Composable
fun hintsOf(vararg messages: StringResource) =
  Hints(
    messages.associate { it.key to stringResource(it) },
  )

infix fun String?.from(hints: Hints) = hints[this]
