//  G I G A N T O G R A F I A
export function getPriceForTypeClient(
  tipo_cliente: 'final' | 'imprentero', cantidad: number
): number {
  let precio = 0;

  if (tipo_cliente === 'final') {
    if (cantidad > 0 && cantidad <= 6) {
      precio = 17.00;
    } else if (cantidad > 6 && cantidad <= 18) {
      precio = 15.00;
    } else if (cantidad > 18 && cantidad <= 500) {
      precio = 13.00;
    }
  }

  if (tipo_cliente === 'imprentero') {
    if (cantidad > 0 && cantidad <= 6) {
      precio = 13.00;
    } else if (cantidad > 6 && cantidad <= 18) {
      precio = 12.00;
    } else if (cantidad > 18 && cantidad <= 500) {
      precio = 10.00;
    }
  }

  return precio;
}
/**
5,Termosellado,1,2.00,final
6,Pita y Tubo,1,5.00,final
7,Ojales,1,1.00,final
8,Marco,1,2.50,final
12,Termosellado,1,1.00,imprentero
13,Pita y Tubo,1,2.50,imprentero
14,Ojales,1,0.50,imprentero
15,Marco,1,2.50,imprentero
 */


/**
 * Calcula el precio de termosellado según los parámetros dados.
 * @param priceBase Precio base de la opción extra
 * @param width Ancho en metros
 * @param height Largo en metros
 * @param optionDimension 'Ancho' | 'Largo' | 'Ambos'
 * @param cantidad Cantidad de productos
 */
export function calculateTermoselladoPrice(
  priceBase: number,
  width: number,
  height: number,
  optionDimension: string,
  // cantidad: number,
): number {

  let additionalValue = 0;
  if (optionDimension === 'Ancho') {
    additionalValue = 2 * width * priceBase;
  } else if (optionDimension === 'Largo') {
    additionalValue = 2 * height * priceBase;
  } else if (optionDimension === 'Ambos') {
    additionalValue = 2 * (width + height) * priceBase;
  }

  return additionalValue;
}


/**
 * Calcula el precio de Pita y Tubo según los parámetros dados.
 * @param priceBase Precio base de la opción extra
 * @param width Ancho en metros
 * @param height Largo en metros
 * @param optionDimension 'Ancho' | 'Largo' | 'Ambos'
 * @param cantidad Cantidad de productos
 * @param tipoCliente Tipo de cliente ('final', 'imprentero', etc)
 * @param obtenerPrecioOpcion Función para obtener el precio base de la opción (debe ser async si consulta IndexedDB)
 */
export function calculatePitaTubePrice(
  priceBase: number,
  width: number,
  height: number,
  optionDimension: string,
  // cantidad: number,
): number {

  let additionalValue = 0;
  if (optionDimension === 'Ancho') {
    additionalValue = 2 * width * priceBase;
  } else if (optionDimension === 'Largo') {
    additionalValue = 2 * height * priceBase;
  } else if (optionDimension === 'Ambos') {
    additionalValue = 2 * (width + height) * priceBase;
  }

  return additionalValue;
}


/**
 * Calcula el precio total del marco según los parámetros dados.
 * @param priceBase Precio base del marco
 * @param width Ancho en metros
 * @param height Largo en metros
 * @param cantidad Cantidad de productos
 */
export function calculateFramePrice(
  priceBase: number,
  width: number,
  height: number,
  isApply: string,
  // cantidad: number
): number | void {

  if (isApply === 'Aplicar') {
    // El marco siempre se aplica a todo el perímetro (ambos)
    const perimetro = 2 * (width + height);
    const interno = 0.6 * (perimetro * priceBase);
    const costoFuera = perimetro * priceBase;
    const costoMaterial = costoFuera + interno;

    // Mano de obra interna (75% del costo material)
    const manoObraInterna = costoMaterial * 0.75;
    return (costoMaterial + manoObraInterna);
  }
}


/**
 * Calculates the price for Celtex Foam based on vinyl dimensions.
 * @param vinylLengthMeters The length of the vinyl in meters.
 * @param vinylWidthMeters The width of the vinyl in meters.
 * @param baseSheetPrice The base price of a single Celtex Foam sheet.
 * @returns The calculated final cost in soles, or 0 if dimensions are not compatible.
 */
export function calculateCeltexFoamPriceAndSheets(
  vinylLengthMeters: number,
  vinylWidthMeters: number,
  baseSheetPrice: number
): { cost: number; sheetsUsed: number } {
  const sheetLength = 2.4; // meters
  const sheetWidth = 1.2; // meters
  const totalSheetArea = sheetLength * sheetWidth; // m²

  if (totalSheetArea === 0) {
    return { cost: 0, sheetsUsed: 0 };
  }

  if (vinylWidthMeters > 1.5) {
    return { cost: 0, sheetsUsed: 0 };
  }

  let cost = 0;
  let sheetsUsed = 0;

  // --- Cases where vinyl width is less than or equal to the sheet width (<= 1.2m) ---
  if (vinylWidthMeters <= sheetWidth) {
    if (vinylWidthMeters <= 0.6) {
      if (vinylLengthMeters > 1.2 && vinylLengthMeters <= 2.4) {
        cost = baseSheetPrice / 2;
        sheetsUsed = 0.5;
        return { cost, sheetsUsed };
      } else if (vinylLengthMeters > 2.4 && vinylLengthMeters <= 4.8) {
        cost = baseSheetPrice;
        sheetsUsed = 1;
        return { cost, sheetsUsed };
      }
    }

    if (vinylLengthMeters <= 1.2 && vinylWidthMeters > 0 && vinylWidthMeters <= 1.2) {
      cost = baseSheetPrice / 2;
      sheetsUsed = 0.5;
      return { cost, sheetsUsed };
    }

    if (vinylWidthMeters > 0.6 && vinylWidthMeters <= 1.2) {
      if (vinylLengthMeters > 1.2 && vinylLengthMeters <= 2.4) {
        cost = baseSheetPrice;
        sheetsUsed = 1;
        return { cost, sheetsUsed };
      } else if (vinylLengthMeters > 2.4 && vinylLengthMeters <= 4.8) {
        cost = baseSheetPrice * 2;
        sheetsUsed = 2;
        return { cost, sheetsUsed };
      }
    }
  }

  // --- Cases where vinyl width is greater than sheet width but <= 1.5m ---
  if (vinylWidthMeters > sheetWidth && vinylWidthMeters <= 1.5) {
    if (vinylLengthMeters <= 1.2) {
      cost = baseSheetPrice;
      sheetsUsed = 1;
      return { cost, sheetsUsed };
    }

    if (vinylLengthMeters > 1.2 && vinylLengthMeters <= 1.8) {
      cost = baseSheetPrice;
      sheetsUsed = 1;
      return { cost, sheetsUsed };
    } else if (vinylLengthMeters > 1.8 && vinylLengthMeters <= 2.7) {
      cost = baseSheetPrice * 1.5;
      sheetsUsed = 1.5;
      return { cost, sheetsUsed };
    } else if (vinylLengthMeters > 2.7 && vinylLengthMeters <= 3) {
      cost = baseSheetPrice * 2;
      sheetsUsed = 2;
      return { cost, sheetsUsed };
    } else if (vinylLengthMeters > 3 && vinylLengthMeters <= 3.6) {
      cost = baseSheetPrice * 2;
      sheetsUsed = 2;
      return { cost, sheetsUsed };
    }
  }

  return { cost: 0, sheetsUsed: 0 };
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