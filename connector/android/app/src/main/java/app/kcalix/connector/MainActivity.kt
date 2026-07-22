package app.kcalix.connector

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import app.kcalix.connector.ui.theme.KcalixConnectorTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            KcalixConnectorTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    BootstrapScreen(modifier = Modifier.padding(innerPadding))
                }
            }
        }
    }
}

@Composable
private fun BootstrapScreen(modifier: Modifier = Modifier) {
    val buildType = if (BuildConfig.DEBUG) "Debug" else "Release"

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(text = "Kcalix Connector", fontWeight = FontWeight.Bold)
        Text(text = "Fase 00 · Bootstrap Android")

        HorizontalDivider(modifier = Modifier.fillMaxWidth())

        BuildMetadata(label = "Versão", value = "${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})")
        BuildMetadata(label = "Build", value = buildType)

        Text(
            text = "Este app ainda não acessa Health Connect, sua conta, internet ou dados de saúde.",
        )
        Text(
            text = "Próximo objetivo: confirmar que o APK compila, instala e abre no celular.",
        )
    }
}

@Composable
private fun BuildMetadata(label: String, value: String) {
    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Text(text = label, fontWeight = FontWeight.SemiBold)
        Text(text = value)
    }
}

@Preview(showBackground = true)
@Composable
private fun BootstrapScreenPreview() {
    KcalixConnectorTheme {
        BootstrapScreen()
    }
}
