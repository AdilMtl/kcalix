package app.kcalix.connector

import java.time.LocalDate
import java.time.format.DateTimeParseException

data class CardioType(
    val id: String,
    val label: String,
    val kcalPerMin: Double,
)

val CARDIO_TYPES = listOf(
    CardioType("bicicleta", "Bicicleta", 7.0),
    CardioType("bicicleta_intensa", "Bicicleta (intensa)", 10.0),
    CardioType("esteira_caminhada", "Caminhada (esteira)", 4.5),
    CardioType("esteira_corrida", "Corrida (esteira)", 10.0),
    CardioType("caminhada_rua", "Caminhada ar livre", 4.0),
    CardioType("corrida_rua", "Corrida ar livre", 11.0),
    CardioType("eliptico", "Elíptico / Transport", 8.0),
    CardioType("escada", "Escada", 9.0),
    CardioType("pular_corda", "Pular corda", 12.0),
    CardioType("remo", "Remo", 8.5),
    CardioType("outro_cardio", "Outro", 6.0),
)

data class MockTransferForm(
    val date: String,
    val cardioTypeId: String = CARDIO_TYPES.first().id,
    val cardioMinutes: String = "",
    val waterMl: String = "",
    val weightKg: String = "",
    val waistCm: String = "",
    val bodyFatPct: String = "",
)

data class CardioSummary(
    val type: CardioType,
    val minutes: Int,
)

data class BodySummary(
    val weightKg: Double?,
    val waistCm: Double?,
    val bodyFatPct: Double?,
) {
    val fieldCount: Int
        get() = listOf(weightKg, waistCm, bodyFatPct).count { it != null }
}

data class MockTransferSummary(
    val date: String,
    val cardio: CardioSummary?,
    val waterMl: Int?,
    val body: BodySummary?,
) {
    val groupCount: Int
        get() = listOf(cardio, waterMl, body).count { it != null }

    val fieldCount: Int
        get() = (if (cardio != null) 2 else 0) +
            (if (waterMl != null) 1 else 0) +
            (body?.fieldCount ?: 0)
}

data class MockTransferErrors(
    val date: String? = null,
    val cardioMinutes: String? = null,
    val waterMl: String? = null,
    val weightKg: String? = null,
    val waistCm: String? = null,
    val bodyFatPct: String? = null,
    val global: String? = null,
) {
    val hasErrors: Boolean
        get() = listOf(
            date,
            cardioMinutes,
            waterMl,
            weightKg,
            waistCm,
            bodyFatPct,
            global,
        ).any { it != null }
}

data class MockTransferEvaluation(
    val summary: MockTransferSummary?,
    val errors: MockTransferErrors,
) {
    val canSubmit: Boolean
        get() = summary != null && !errors.hasErrors
}

fun evaluateMockTransfer(form: MockTransferForm): MockTransferEvaluation {
    val dateError = if (isIsoDate(form.date)) null else "Use uma data válida no formato AAAA-MM-DD"

    val cardioMinutesText = form.cardioMinutes.trim()
    val cardioMinutes = cardioMinutesText.toIntOrNull()
    val cardioError = when {
        cardioMinutesText.isBlank() -> null
        cardioMinutes == null || cardioMinutes !in 1..1_440 -> "Informe de 1 a 1.440 minutos"
        else -> null
    }
    val cardioType = CARDIO_TYPES.firstOrNull { it.id == form.cardioTypeId }
    val cardio = if (cardioMinutesText.isNotBlank() && cardioError == null && cardioType != null) {
        CardioSummary(cardioType, cardioMinutes!!)
    } else {
        null
    }

    val waterText = form.waterMl.trim()
    val water = waterText.toIntOrNull()
    val waterError = when {
        waterText.isBlank() -> null
        water == null || water !in 1..20_000 -> "Informe de 1 a 20.000 ml"
        else -> null
    }
    val validWater = water?.takeIf { waterError == null }

    val weight = parseDecimal(form.weightKg)
    val waist = parseDecimal(form.waistCm)
    val bodyFat = parseDecimal(form.bodyFatPct)
    val weightError = validatePositiveDecimal(form.weightKg, weight)
    val waistError = validatePositiveDecimal(form.waistCm, waist)
    val bodyFatError = when {
        form.bodyFatPct.isBlank() -> null
        bodyFat == null || bodyFat <= 0.0 || bodyFat > 100.0 -> "Informe um percentual entre 0 e 100"
        else -> null
    }

    val body = if (
        weightError == null && waistError == null && bodyFatError == null &&
        listOf(weight, waist, bodyFat).any { it != null }
    ) {
        BodySummary(weight, waist, bodyFat)
    } else {
        null
    }

    val hasAnyInput = cardioMinutesText.isNotBlank() ||
        waterText.isNotBlank() ||
        form.weightKg.isNotBlank() ||
        form.waistCm.isNotBlank() ||
        form.bodyFatPct.isNotBlank()
    val globalError = if (hasAnyInput) null else "Preencha pelo menos um grupo para continuar"

    val errors = MockTransferErrors(
        date = dateError,
        cardioMinutes = cardioError,
        waterMl = waterError,
        weightKg = weightError,
        waistCm = waistError,
        bodyFatPct = bodyFatError,
        global = globalError,
    )
    val summary = if (dateError == null && listOf(cardio, validWater, body).any { it != null }) {
        MockTransferSummary(form.date, cardio, validWater, body)
    } else {
        null
    }

    return MockTransferEvaluation(summary, errors)
}

private fun parseDecimal(value: String): Double? =
    value.trim().takeIf { it.isNotEmpty() }?.replace(',', '.')?.toDoubleOrNull()

private fun validatePositiveDecimal(raw: String, value: Double?): String? = when {
    raw.isBlank() -> null
    value == null || value <= 0.0 -> "Informe um número maior que zero"
    else -> null
}

private fun isIsoDate(value: String): Boolean = try {
    LocalDate.parse(value)
    true
} catch (_: DateTimeParseException) {
    false
}
