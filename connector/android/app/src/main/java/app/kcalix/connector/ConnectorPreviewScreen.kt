package app.kcalix.connector

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import app.kcalix.connector.ui.theme.Ember
import app.kcalix.connector.ui.theme.Energy
import app.kcalix.connector.ui.theme.Good
import app.kcalix.connector.ui.theme.Line
import app.kcalix.connector.ui.theme.Magenta
import app.kcalix.connector.ui.theme.Surface2
import app.kcalix.connector.ui.theme.Surface3
import app.kcalix.connector.ui.theme.TextMuted
import app.kcalix.connector.ui.theme.TextSecondary
import app.kcalix.connector.ui.theme.KcalixConnectorTheme
import java.time.LocalDate

private val CardShape = RoundedCornerShape(8.dp)

@Composable
fun ConnectorPreviewScreen() {
    var form by remember {
        mutableStateOf(
            MockTransferForm(
                date = LocalDate.now().toString(),
                cardioTypeId = CARDIO_TYPES.first().id,
            )
        )
    }
    var completed by remember { mutableStateOf<MockTransferSummary?>(null) }
    val evaluation = evaluateMockTransfer(form)

    if (completed != null) {
        CompletedScreen(
            summary = completed!!,
            onReset = {
                form = MockTransferForm(
                    date = LocalDate.now().toString(),
                    cardioTypeId = CARDIO_TYPES.first().id,
                )
                completed = null
            },
        )
        return
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentPadding = PaddingValues(start = 16.dp, top = 28.dp, end = 16.dp, bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item { BrandHeader() }
        item { ConnectionPanel() }
        item {
            SectionIntro(
                eyebrow = "TRANSFERÊNCIA MANUAL",
                title = "Prepare uma simulação",
                description = "Digite somente o que deseja revisar. Nada será enviado ou salvo.",
            )
        }
        item {
            AppTextField(
                value = form.date,
                onValueChange = { form = form.copy(date = it.take(10)) },
                label = "Data dos registros",
                helper = "AAAA-MM-DD · vale para todos os grupos",
                error = evaluation.errors.date,
                keyboardType = KeyboardType.Ascii,
            )
        }
        item {
            FormCard(title = "Cardio", destination = "Destino: Treino") {
                CardioTypeSelector(
                    selectedId = form.cardioTypeId,
                    onSelected = { form = form.copy(cardioTypeId = it) },
                )
                Spacer(Modifier.height(10.dp))
                AppTextField(
                    value = form.cardioMinutes,
                    onValueChange = { form = form.copy(cardioMinutes = it.filter(Char::isDigit).take(4)) },
                    label = "Duração",
                    helper = "minutos",
                    error = evaluation.errors.cardioMinutes,
                    keyboardType = KeyboardType.Number,
                )
                val cardio = CARDIO_TYPES.first { it.id == form.cardioTypeId }
                Text(
                    text = "${cardio.id} · ${formatNumber(cardio.kcalPerMin)} kcal/min no catálogo Kcalix",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextMuted,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.padding(top = 8.dp),
                )
            }
        }
        item {
            FormCard(title = "Água", destination = "Destino: Diário") {
                AppTextField(
                    value = form.waterMl,
                    onValueChange = { form = form.copy(waterMl = it.filter(Char::isDigit).take(5)) },
                    label = "Volume do dia",
                    helper = "mililitros (ml)",
                    error = evaluation.errors.waterMl,
                    keyboardType = KeyboardType.Number,
                )
            }
        }
        item {
            FormCard(title = "Corpo", destination = "Destino: Check-in") {
                Text(
                    text = "Preencha um, dois ou os três campos.",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                )
                Spacer(Modifier.height(10.dp))
                AppTextField(
                    value = form.weightKg,
                    onValueChange = { form = form.copy(weightKg = filterDecimal(it, 6)) },
                    label = "Peso",
                    helper = "quilogramas (kg)",
                    error = evaluation.errors.weightKg,
                    keyboardType = KeyboardType.Decimal,
                )
                Spacer(Modifier.height(10.dp))
                AppTextField(
                    value = form.waistCm,
                    onValueChange = { form = form.copy(waistCm = filterDecimal(it, 6)) },
                    label = "Cintura",
                    helper = "centímetros (cm) · entrada manual",
                    error = evaluation.errors.waistCm,
                    keyboardType = KeyboardType.Decimal,
                )
                Spacer(Modifier.height(10.dp))
                AppTextField(
                    value = form.bodyFatPct,
                    onValueChange = { form = form.copy(bodyFatPct = filterDecimal(it, 5)) },
                    label = "Body fat",
                    helper = "percentual (%)",
                    error = evaluation.errors.bodyFatPct,
                    keyboardType = KeyboardType.Decimal,
                )
            }
        }
        item {
            ReviewCard(evaluation = evaluation)
        }
        item {
            Button(
                onClick = { completed = evaluation.summary },
                enabled = evaluation.canSubmit,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = CardShape,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Ember,
                    contentColor = Color.White,
                    disabledContainerColor = Surface3,
                    disabledContentColor = TextMuted,
                ),
            ) {
                Text("Simular transferência", fontWeight = FontWeight.Bold)
            }
        }
        item { BuildFooter() }
    }
}

@Composable
private fun BrandHeader() {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Image(
            painter = painterResource(R.drawable.kcalix_connector_icon),
            contentDescription = "Ícone Kcalix Connector",
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(58.dp)
                .clip(RoundedCornerShape(14.dp)),
        )
        Spacer(Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = "Kcalix Connector",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.ExtraBold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = "Ponte local para seus dados",
                style = MaterialTheme.typography.bodySmall,
                color = TextSecondary,
            )
        }
        Surface(
            color = Ember.copy(alpha = 0.12f),
            shape = RoundedCornerShape(6.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, Ember.copy(alpha = 0.45f)),
        ) {
            Text(
                text = "DEMONSTRAÇÃO\nLOCAL",
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 5.dp),
                color = Ember,
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
                textAlign = TextAlign.Center,
            )
        }
    }
}

@Composable
private fun ConnectionPanel() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Surface2, CardShape)
            .border(1.dp, Line, CardShape)
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Conexões", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
        ConnectionRow("Conta Kcalix", "Não conectada")
        ConnectionRow("Health Connect", "Não configurado")
        Text(
            text = "As conexões serão ativadas em uma etapa posterior.",
            style = MaterialTheme.typography.bodySmall,
            color = TextMuted,
        )
    }
}

@Composable
private fun ConnectionRow(label: String, state: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(8.dp).background(Energy, CircleShape))
        Spacer(Modifier.width(9.dp))
        Text(label, modifier = Modifier.weight(1f), color = TextSecondary)
        Text(state, style = MaterialTheme.typography.labelMedium, fontFamily = FontFamily.Monospace)
    }
}

@Composable
private fun SectionIntro(eyebrow: String, title: String, description: String) {
    Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
        Text(
            eyebrow,
            color = Ember,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            fontFamily = FontFamily.Monospace,
        )
        Text(title, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold)
        Text(description, style = MaterialTheme.typography.bodyMedium, color = TextSecondary)
    }
}

@Composable
private fun FormCard(
    title: String,
    destination: String,
    content: @Composable ColumnScope.() -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface, CardShape)
            .border(1.dp, Line, CardShape)
            .padding(14.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier
                    .width(4.dp)
                    .height(26.dp)
                    .background(
                        Brush.verticalGradient(listOf(Ember, Magenta)),
                        RoundedCornerShape(2.dp),
                    )
            )
            Spacer(Modifier.width(10.dp))
            Column {
                Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text(destination, style = MaterialTheme.typography.labelSmall, color = TextMuted)
            }
        }
        Spacer(Modifier.height(14.dp))
        content()
    }
}

@Composable
private fun CardioTypeSelector(selectedId: String, onSelected: (String) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    val selected = CARDIO_TYPES.first { it.id == selectedId }
    Box {
        OutlinedButton(
            onClick = { expanded = true },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            shape = CardShape,
            border = androidx.compose.foundation.BorderStroke(1.dp, Line),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.onSurface),
        ) {
            Text(selected.label, modifier = Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text("▾", color = Ember)
        }
        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
            modifier = Modifier.background(Surface2),
        ) {
            CARDIO_TYPES.forEach { type ->
                DropdownMenuItem(
                    text = {
                        Column {
                            Text(type.label)
                            Text(
                                type.id,
                                style = MaterialTheme.typography.labelSmall,
                                color = TextMuted,
                                fontFamily = FontFamily.Monospace,
                            )
                        }
                    },
                    onClick = {
                        onSelected(type.id)
                        expanded = false
                    },
                )
            }
        }
    }
}

@Composable
private fun AppTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    helper: String,
    error: String?,
    keyboardType: KeyboardType,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier.fillMaxWidth(),
        label = { Text(label) },
        supportingText = { Text(error ?: helper) },
        isError = error != null,
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        shape = CardShape,
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = Ember,
            focusedLabelColor = Ember,
            cursorColor = Ember,
            unfocusedBorderColor = Line,
            focusedContainerColor = Surface2,
            unfocusedContainerColor = Surface2,
        ),
    )
}

@Composable
private fun ReviewCard(evaluation: MockTransferEvaluation) {
    val summary = evaluation.summary
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Surface2, CardShape)
            .border(1.dp, if (evaluation.canSubmit) Good.copy(alpha = 0.55f) else Line, CardShape)
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Revisão", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(Modifier.weight(1f))
            Text(
                if (evaluation.canSubmit) "PRONTO" else "RASCUNHO",
                color = if (evaluation.canSubmit) Good else TextMuted,
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace,
            )
        }
        if (summary == null) {
            Text(evaluation.errors.global ?: "Corrija os campos para continuar.", color = TextSecondary)
        } else {
            Text(summary.date, color = TextMuted, fontFamily = FontFamily.Monospace)
            summary.cardio?.let {
                ReviewLine("Cardio", "${it.type.label} · ${it.minutes} min")
            }
            summary.waterMl?.let { ReviewLine("Água", "$it ml") }
            summary.body?.weightKg?.let { ReviewLine("Peso", "${formatNumber(it)} kg") }
            summary.body?.waistCm?.let { ReviewLine("Cintura", "${formatNumber(it)} cm") }
            summary.body?.bodyFatPct?.let { ReviewLine("Body fat", "${formatNumber(it)} %") }
            Text(
                "${summary.groupCount} grupo(s) · ${summary.fieldCount} campo(s)",
                color = TextMuted,
                style = MaterialTheme.typography.labelSmall,
                fontFamily = FontFamily.Monospace,
            )
        }
    }
}

@Composable
private fun ReviewLine(label: String, value: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(label, color = TextSecondary, modifier = Modifier.weight(1f))
        Text(value, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun CompletedScreen(summary: MockTransferSummary, onReset: () -> Unit) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentPadding = PaddingValues(20.dp, 42.dp, 20.dp, 32.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        item {
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .background(
                        Brush.linearGradient(listOf(Ember, Magenta)),
                        RoundedCornerShape(18.dp),
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Text("✓", color = Color.White, style = MaterialTheme.typography.headlineLarge, fontWeight = FontWeight.Bold)
            }
        }
        item {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Simulação concluída", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold)
                Text(
                    "A jornada foi concluída somente neste aparelho.",
                    color = TextSecondary,
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
        }
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Surface2, CardShape)
                    .border(1.dp, Line, CardShape)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Text(summary.date, color = Ember, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Bold)
                summary.cardio?.let { ReviewLine("Cardio", "${it.type.label} · ${it.minutes} min") }
                summary.waterMl?.let { ReviewLine("Água", "$it ml") }
                summary.body?.weightKg?.let { ReviewLine("Peso", "${formatNumber(it)} kg") }
                summary.body?.waistCm?.let { ReviewLine("Cintura", "${formatNumber(it)} cm") }
                summary.body?.bodyFatPct?.let { ReviewLine("Body fat", "${formatNumber(it)} %") }
            }
        }
        item {
            Surface(
                color = Good.copy(alpha = 0.1f),
                shape = CardShape,
                border = androidx.compose.foundation.BorderStroke(1.dp, Good.copy(alpha = 0.42f)),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(
                    "Nada foi gravado no Kcalix. Os valores serão apagados ao iniciar uma nova simulação ou fechar o app.",
                    modifier = Modifier.padding(14.dp),
                    color = Good,
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
        }
        item {
            Button(
                onClick = onReset,
                modifier = Modifier.fillMaxWidth().height(52.dp),
                shape = CardShape,
                colors = ButtonDefaults.buttonColors(containerColor = Ember),
            ) {
                Text("Nova simulação", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun BuildFooter() {
    val buildType = if (BuildConfig.DEBUG) "DEBUG" else "RELEASE"
    Column(
        modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            "${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE}) · $buildType",
            color = TextMuted,
            style = MaterialTheme.typography.labelSmall,
            fontFamily = FontFamily.Monospace,
        )
        Text("Sem conexão · Sem persistência", color = TextMuted, style = MaterialTheme.typography.labelSmall)
    }
}

private fun filterDecimal(value: String, maxLength: Int): String = value
    .filter { it.isDigit() || it == ',' || it == '.' }
    .fold("") { acc, char ->
        if ((char == ',' || char == '.') && (acc.contains(',') || acc.contains('.'))) acc else acc + char
    }
    .take(maxLength)

private fun formatNumber(value: Double): String =
    if (value % 1.0 == 0.0) value.toInt().toString() else value.toString().replace('.', ',')

@Preview(name = "Compacta", showBackground = true, widthDp = 360, heightDp = 800)
@Preview(name = "Referência", showBackground = true, widthDp = 390, heightDp = 844)
@Preview(name = "Ampla", showBackground = true, widthDp = 430, heightDp = 932)
@Composable
private fun ConnectorPreview() {
    KcalixConnectorTheme {
        ConnectorPreviewScreen()
    }
}
