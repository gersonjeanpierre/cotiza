/**
 * Calculates the price for Celtex Foam based on vinyl dimensions.
 * @param vinylLengthMeters The length of the vinyl in meters.
 * @param vinylWidthMeters The width of the vinyl in meters.
 * @param baseSheetPrice The base price of a single Celtex Foam sheet.
 * @returns The calculated final cost in soles, or 0 if dimensions are not compatible.
 */
export function calculateCeltexFoamPrice(
  vinylLengthMeters: number,
  vinylWidthMeters: number,
  baseSheetPrice: number
): number {
  const sheetLength = 2.4; // meters
  const sheetWidth = 1.2; // meters
  const totalSheetArea = sheetLength * sheetWidth; // m²

  console.log(`Área total de la plancha: ${totalSheetArea.toFixed(2)} m²`);

  if (totalSheetArea === 0) {
    console.log('Error: Área total de la plancha es cero.');
    return 0;
  }

  if (vinylWidthMeters > 1.5) {
    console.log('El ancho del vinil es como maximo 1.5m.');
    return 0;
  }

  // --- Cases where vinyl width is less than or equal to the sheet width (<= 1.2m) ---
  if (vinylWidthMeters <= sheetWidth) {
    if (vinylWidthMeters <= 0.6) {
      if (vinylLengthMeters > 1.2 && vinylLengthMeters <= 2.4) {
        const cost = baseSheetPrice / 2;
        return cost;
      } else if (vinylLengthMeters > 2.4 && vinylLengthMeters <= 4.8) {
        const cost = baseSheetPrice;
        return cost;
      }
    }

    if (vinylLengthMeters <= 1.2 && vinylWidthMeters > 0 && vinylWidthMeters <= 1.2) {
      const cost = baseSheetPrice / 2;
      return cost;
    }

    if (vinylWidthMeters > 0.6 && vinylWidthMeters <= 1.2) {
      if (vinylLengthMeters > 1.2 && vinylLengthMeters <= 2.4) {
        const cost = baseSheetPrice;
        return cost;
      } else if (vinylLengthMeters > 2.4 && vinylLengthMeters <= 4.8) {
        const cost = baseSheetPrice * 2;
        return cost;
      }
    }
  }

  // --- Cases where vinyl width is greater than sheet width but <= 1.5m ---
  if (vinylWidthMeters > sheetWidth && vinylWidthMeters <= 1.5) {
    if (vinylLengthMeters <= 1.2) {
      const cost = baseSheetPrice * 0.625;
      return cost;
    }

    if (vinylLengthMeters > 1.2 && vinylLengthMeters <= 1.8) {
      const cost = baseSheetPrice;
      return cost;
    } else if (vinylLengthMeters > 1.8 && vinylLengthMeters <= 2.7) {
      const cost = baseSheetPrice * 1.5;
      return cost;
    } else if (vinylLengthMeters > 2.7 && vinylLengthMeters <= 3) {
      const cost = baseSheetPrice * 1.75;
      return cost;
    } else if (vinylLengthMeters > 3 && vinylLengthMeters <= 3.6) {
      const cost = baseSheetPrice * 2;
      return cost;
    }
  }
  console.log('El ancho del vinil no es compatible con las medidas de la plancha Celtex.');
  return 0;
}

/**
 * Calculates the labor price for adhesive work based on sheet dimensions and quantity.
 *
 * @param sheetWidth The width of the sheet in meters.
 * @param sheetHeight The height of the sheet in meters.
 * @param basePrice The base price for labor, which varies based on the area of the sheet.
 * @returns The calculated total labor cost.
 */
export function calculateLaborPrice(
  sheetHeight: number,
  sheetWidth: number,
  basePrice: number,
): number {
  const sheetArea = sheetWidth * sheetHeight;

  if (sheetArea >= 2.88) {
    basePrice = 10.00;
  } else if (sheetArea < 1.0) {
    basePrice = 5.00;
  } else {
    const factor = (sheetArea - 1.0) / (2.88 - 1.0);
    basePrice = (5.00 + (factor * 5.00));
  }
  return basePrice;
}