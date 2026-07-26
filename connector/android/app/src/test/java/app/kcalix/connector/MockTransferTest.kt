package app.kcalix.connector

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class MockTransferTest {
    @Test
    fun `catalog matches Kcalix cardio ids and calories`() {
        assertEquals(
            listOf(
                "bicicleta",
                "bicicleta_intensa",
                "esteira_caminhada",
                "esteira_corrida",
                "caminhada_rua",
                "corrida_rua",
                "eliptico",
                "escada",
                "pular_corda",
                "remo",
                "outro_cardio",
            ),
            CARDIO_TYPES.map { it.id },
        )
        assertEquals(4.5, CARDIO_TYPES.first { it.id == "esteira_caminhada" }.kcalPerMin, 0.0)
        assertEquals(8.5, CARDIO_TYPES.first { it.id == "remo" }.kcalPerMin, 0.0)
    }

    @Test
    fun `empty form cannot submit`() {
        val result = evaluateMockTransfer(MockTransferForm(date = "2026-07-22"))

        assertFalse(result.canSubmit)
        assertNull(result.summary)
        assertEquals("Preencha pelo menos um grupo para continuar", result.errors.global)
    }

    @Test
    fun `cardio builds valid summary with derived catalog type`() {
        val result = evaluateMockTransfer(
            MockTransferForm(
                date = "2026-07-22",
                cardioTypeId = "corrida_rua",
                cardioMinutes = "35",
            )
        )

        assertTrue(result.canSubmit)
        assertEquals("corrida_rua", result.summary?.cardio?.type?.id)
        assertEquals(11.0, result.summary?.cardio?.type?.kcalPerMin ?: 0.0, 0.0)
        assertEquals(35, result.summary?.cardio?.minutes)
    }

    @Test
    fun `water and partial body accept comma decimals`() {
        val result = evaluateMockTransfer(
            MockTransferForm(
                date = "2026-07-22",
                waterMl = "750",
                weightKg = "81,5",
                bodyFatPct = "18,2",
            )
        )

        assertTrue(result.canSubmit)
        assertEquals(750, result.summary?.waterMl)
        assertEquals(81.5, result.summary?.body?.weightKg ?: 0.0, 0.0)
        assertNull(result.summary?.body?.waistCm)
        assertEquals(18.2, result.summary?.body?.bodyFatPct ?: 0.0, 0.0)
    }

    @Test
    fun `invalid date and limits block simulation`() {
        val result = evaluateMockTransfer(
            MockTransferForm(
                date = "2026-02-31",
                cardioMinutes = "1441",
                waterMl = "20001",
                waistCm = "0",
                bodyFatPct = "101",
            )
        )

        assertFalse(result.canSubmit)
        assertTrue(result.errors.hasErrors)
        assertNull(result.summary)
    }
}
