import { calculateFramePrice, calculateLaborPrice, calculateTermoselladoPrice, getPriceGigaForTypeClient, getPriceVinylForTypeClient } from "./extraOptionList";
import { DisplayCartItem, MyCart } from '@core/models/cart';
import { Product } from '@core/models/product';
import { Order } from "@core/models/order";

export function convertMyCartToDisplayCartItems(
  myCart: MyCart | Order,
  allProducts: Product[],
  igv: number = 0.18
): DisplayCartItem[] {
  if (!myCart?.details) return [];

  const typeClient = myCart.customer?.type_client.name.includes('Final')
    ? 'final'
    : 'imprentero';
  const profitMargin = myCart.customer?.type_client?.margin ?? 0;

  return myCart.details.map((detail) => {
    const product = allProducts.find(p => p.id === detail.product_id);

    const extraOptions = detail.extra_options.map((extra) => {
      const extraOption = product?.extra_options.find(opt => opt.id === extra.extra_option_id);
      return {
        ...extra,
        name: extraOption?.name ?? '',
        price: Number(getPriceExtraOption(
          extraOption?.id ?? 0,
          detail.linear_meter,
          detail.width,
          extra.linear_meter,
          extra.width,
          extraOption?.price ?? 0,
          extra.giga_select,
          profitMargin,
          igv
        ).toFixed(2)),
      };
    });

    const subtotalExtraOnly = Number(extraOptions.reduce(
      (sum, extra) => sum + ((extra.price) * (extra.quantity || 1) || 0),
      0
    ).toFixed(2));

    return {
      ...detail,
      sku: product?.sku ?? '',
      name: product?.name ?? '',
      price: Number(getProductPrice(
        product?.id ?? 0,
        product?.price ?? 0,
        typeClient,
        detail.quantity,
        detail.height,
        detail.width,
        profitMargin,
        igv
      ).toFixed(2)),
      image: product?.image_url ?? '',
      total_extra_options: subtotalExtraOnly,
      extra_options: extraOptions,
    } as DisplayCartItem;
  });
}

export const getProductPrice = (
  productId: number,
  productPrice: number,
  typeClient: string,
  quantity: number,
  height: number = 1, // Default height
  width: number = 1, // Default width
  profitMargin: number = 0, // Default profit margin
  igv: number = 0 // Default IGV percentage
) => {
  let profitMarginAndIgv = (1 + profitMargin) * (1 + igv);
  let productPriceFinal = productPrice
  if (productId == 1) {
    if (height <= 1) {
      height = 1;
    }
    if (width <= 1) {
      width = 1;
    }
    const area = Number((height * width).toFixed(2));
    productPriceFinal = getPriceGigaForTypeClient(typeClient, quantity) * area;
  } else if (productId >= 2 && productId <= 9) {
    productPriceFinal = getPriceVinylForTypeClient(productId, typeClient, productPrice) * height;
  }
  return Number((profitMarginAndIgv * productPriceFinal).toFixed(2));
}

export const getPriceExtraOption = (
  extra_option_id: number,
  linear_meter: number | null = null, // Product linear meter
  width: number | null = null, // Product width
  linear_meter_eo: number | null = null, // Extra option linear meter
  width_eo: number | null = null, // Extra option width
  price: number,
  giga_select: string | null = null,
  profitMargin: number = 0, // Default profit margin
  igv: number = 0 // Default IGV percentage
) => {
  let priceExtraOption: number | void = price

  if (extra_option_id == 14) {
    priceExtraOption = Number(calculateLaborPrice(linear_meter_eo ?? 0, width_eo ?? 0, price ?? 0).toFixed(2));
  }
  if (extra_option_id == 1) {
    priceExtraOption = Number(calculateTermoselladoPrice(price ?? 0, width ?? 0, linear_meter ?? 0, giga_select ?? '').toFixed(2));
  }
  if (extra_option_id == 2) {
    priceExtraOption = Number(calculateTermoselladoPrice(price ?? 0, width ?? 0, linear_meter ?? 0, giga_select ?? '').toFixed(2));
  }
  if (extra_option_id == 4) {
    priceExtraOption = calculateFramePrice(price ?? 0, width ?? 0, linear_meter ?? 0, giga_select ?? '');
  }

  return (priceExtraOption ?? 0) * (1 + profitMargin) * (1 + igv);

}

export const convertNumberToText = (finalAmount: number): string => {
  const unidades: string[] = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas: string[] = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const especialesDiezAVeinte: string[] = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const centenas: string[] = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  function numberToShortText(num: number): string {
    if (num === 0) return '';
    if (num < 10) return unidades[num];
    if (num >= 10 && num < 20) return especialesDiezAVeinte[num - 10];
    if (num >= 20 && num < 100) {
      let texto = decenas[Math.floor(num / 10)];
      if (num % 10 !== 0) {
        texto += ' Y ' + unidades[num % 10];
      }
      return texto;
    }
    if (num >= 100 && num < 1000) {
      let texto = '';
      const centena = Math.floor(num / 100);
      const resto = num % 100;
      if (centena === 1 && resto === 0) {
        texto = 'CIEN';
      } else {
        texto = centenas[centena];
        if (resto > 0) {
          texto += ' ' + numberToShortText(resto);
        }
      }
      return texto;
    }
    return '';
  }

  // Nueva función para miles y decenas de mil
  function numberToTextMiles(num: number): string {
    if (num < 1000) {
      return numberToShortText(num);
    }
    if (num < 10000) {
      const miles = Math.floor(num / 1000);
      const resto = num % 1000;
      let texto = (miles === 1 ? 'MIL' : unidades[miles] + ' MIL');
      if (resto > 0) {
        texto += ' ' + numberToShortText(resto);
      }
      return texto;
    }
    if (num < 100000) {
      const decenasMil = Math.floor(num / 1000);
      const resto = num % 1000;
      let texto = '';
      if (decenasMil < 20) {
        texto = numberToShortText(decenasMil) + ' MIL';
      } else {
        const decenasValor = Math.floor(decenasMil / 10) * 10;
        const unidadesMil = decenasMil % 10;
        texto = decenasValor === 10
          ? especialesDiezAVeinte[unidadesMil] + ' MIL'
          : decenasValor === 20
            ? 'VEINTE' + (unidadesMil > 0 ? ' Y ' + unidades[unidadesMil] : '') + ' MIL'
            : decenas[Math.floor(decenasMil / 10)] + (unidadesMil > 0 ? ' Y ' + unidades[unidadesMil] : '') + ' MIL';
      }
      if (resto > 0) {
        texto += ' ' + numberToShortText(resto);
      }
      return texto;
    }
    return '';
  }

  if (finalAmount < 0) {
    return 'El monto debe ser un número positivo.';
  }

  finalAmount = Math.round(finalAmount * 100) / 100;
  const parteEntera = Math.floor(finalAmount);
  const parteDecimal = Math.round((finalAmount - parteEntera) * 100);

  let textoEntero = '';

  if (parteEntera === 0) {
    textoEntero = 'CERO';
  } else if (parteEntera < 100000) {
    textoEntero = numberToTextMiles(parteEntera);
  } else {
    textoEntero = 'CANTIDAD FUERA DE RANGO';
  }

  textoEntero = textoEntero.toUpperCase();

  return `${textoEntero} CON ${parteDecimal < 10 ? '0' + parteDecimal : parteDecimal}/100 SOLES`;
}