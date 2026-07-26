package app.kcalix.connector.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val EmberColorScheme = darkColorScheme(
    primary = Ember,
    onPrimary = TextPrimary,
    secondary = Magenta,
    tertiary = Energy,
    background = Background,
    onBackground = TextPrimary,
    surface = Surface,
    onSurface = TextPrimary,
    surfaceVariant = Surface2,
    onSurfaceVariant = TextSecondary,
    outline = Line,
    error = Bad,
)

@Composable
fun KcalixConnectorTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = EmberColorScheme,
        typography = Typography,
        content = content
    )
}
