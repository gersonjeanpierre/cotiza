import {
  calculateFramePrice,
  calculateLaborPrice,
  calculateTermoselladoPrice,
  getPriceGigaForTypeClient,
  getPriceVinylForTypeClient,
} from './extraOptionList';
import { DisplayCartItem, MyCart } from '@core/models/cart';
import { Product } from '@core/models/product';
import { Order } from '@core/models/order';

export function adaptOrderToMyCart(
  myCart: MyCart | Order,
  allProducts: Product[],
  igv: number = 0.18,
): DisplayCartItem[] {
  if (!myCart?.details) return [];

  const typeClient = myCart.customer?.type_client.name.includes('Final')
    ? 'final'
    : 'imprentero';
  const profitMargin = myCart.customer?.type_client?.margin ?? 0;

  return myCart.details.map((detail) => {
    const product = allProducts.find((p) => p.id === detail.product_id);
    const extraOptions = detail.extra_options.map((extra) => {
      const extraOption = product?.extra_options.find(
        (opt) => opt.id === extra.extra_option_id,
      );
      return {
        ...extra,
        // name: extraOption?.name ?? '',
        name: nameExtraOption(
          extraOption?.id ?? 0,
          extraOption?.name ?? '',
          extra.width ?? 0,
        ),
        price: Number(
          getPriceExtraOption(
            extraOption?.id ?? 0,
            detail.linear_meter,
            detail.width,
            extra.linear_meter,
            extra.width,
            extraOption?.price ?? 0,
            extra.giga_select ?? '',
            profitMargin,
            igv,
            extra.quantity,
          ).toFixed(2),
        ),
      };
    });

    let subtotalExtraOnly = Number(
      extraOptions
        .reduce((sum, extra) => {
          // Si el extra_option_id está entre 15 y 21, solo suma el precio unitario
          if (extra.extra_option_id >= 15 && extra.extra_option_id <= 21) {
            return sum + extra.price;
          }
          // Para otros, suma precio * cantidad
          return sum + (extra.price * (extra.quantity || 1) || 0);
        }, 0)
        .toFixed(2),
    );
    subtotalExtraOnly = Math.round(subtotalExtraOnly * 10) / 10; // Redondear a dos decimales

    return {
      ...detail,
      sku: product?.sku ?? '',
      name: product?.name ?? '',
      price: getProductPrice(
        product?.id ?? 0,
        product?.price ?? 0,
        typeClient,
        detail.quantity,
        detail.height,
        detail.width,
        profitMargin,
        igv,
      ),
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
  igv: number = 0, // Default IGV percentage
) => {
  let profitMarginAndIgv = (1 + profitMargin) * (1 + igv);
  let productPriceFinal = productPrice;
  let mount = 0;
  if (productId == 1) {
    if (height <= 1) {
      height = 1;
    }
    if (width <= 1) {
      width = 1;
    }
    const area = Number((height * width).toFixed(2));
    productPriceFinal =
      getPriceGigaForTypeClient(typeClient, quantity) * profitMarginAndIgv;
    productPriceFinal = Math.round(productPriceFinal * 10) / 10; //
    mount = productPriceFinal * area;
  } else if (productId >= 2 && productId <= 9) {
    productPriceFinal =
      getPriceVinylForTypeClient(productId, typeClient, productPrice) *
      profitMarginAndIgv;
    productPriceFinal = Math.round(productPriceFinal * 10) / 10; // Redondear a dos decimales
    mount = productPriceFinal * height;
  }
  mount = Math.round(mount * 10) / 10; // Redondear a dos decimales
  return mount;
};

export const getPriceExtraOption = (
  extra_option_id: number,
  linear_meter: number | null = null, // Product linear meter
  width: number | null = null, // Product width
  linear_meter_eo: number | null = null, // Extra option linear meter
  width_eo: number | null = null, // Extra option width
  price: number,
  giga_select: string | null = null,
  profitMargin: number = 0, // Default profit margin
  igv: number = 0, // Default IGV percentage
  quantity_eo: number | null = null, // Extra option quantity
) => {
  let priceExtraOption: number | void = price;
  let mount = 0;

  if (extra_option_id == 14) {
    priceExtraOption = Number(
      calculateLaborPrice(
        linear_meter_eo ?? 0,
        width_eo ?? 0,
        price ?? 0,
      ).toFixed(2),
    );
  }
  if (extra_option_id == 1) {
    priceExtraOption = Number(
      calculateTermoselladoPrice(
        price ?? 0,
        width ?? 0,
        linear_meter ?? 0,
        giga_select ?? '',
      ).toFixed(2),
    );
  }
  if (extra_option_id == 2) {
    priceExtraOption = Number(
      calculateTermoselladoPrice(
        price ?? 0,
        width ?? 0,
        linear_meter ?? 0,
        giga_select ?? '',
      ).toFixed(2),
    );
  }
  if (extra_option_id == 4) {
    priceExtraOption = calculateFramePrice(
      price ?? 0,
      width ?? 0,
      linear_meter ?? 0,
      giga_select ?? '',
    );
  }
  if (extra_option_id >= 15 && extra_option_id <= 21) {
    // Troquelado, Troquelado con Giga y Troquelado con Vinil
    priceExtraOption = calculatePriceTroquelado(
      extra_option_id,
      width_eo ?? 0,
      price ?? 0,
      quantity_eo ?? 1,
      linear_meter ?? 0,
    );
  }
  mount = Number(
    ((priceExtraOption ?? 0) * (1 + profitMargin) * (1 + igv)).toFixed(2),
  );
  mount = Math.round(mount * 10) / 10; // Redondear a dos decimales
  return mount;
};

export const nameExtraOption = (
  extra_option_id: number,
  extra_option_name: string,
  diameter: number,
): string => {
  if (extra_option_id >= 15 && extra_option_id <= 21) {
    diameter = diameter / 10;
    // Troquelado, Troquelado con Giga y Troquelado con Vinil
    switch (extra_option_id) {
      case 15:
      case 16:
      case 17:
      case 18:
      case 19:
      case 20:
        break;
      default:
        extra_option_name = `Troquelado ${diameter}cm diametro`;
    }
  }

  return extra_option_name;
};

const calculatePriceTroquelado = (
  extra_option_id: number,
  diameter: number,
  priceBase: number,
  quantity: number,
  linear_meter: number = 0,
) => {
  let calculatePrice = 0;
  const xPrint = 1440; // mm
  const yPrint = 945; // mm
  const cut = 5; // mm

  const quantityColumns = Math.floor((xPrint + cut) / (diameter + cut));
  const quantityRows = Math.floor((yPrint + cut) / (diameter + cut));

  const pricePerRow = Math.round((priceBase / quantityRows) * 100) / 100;

  const inputRows = quantity / quantityColumns;
  calculatePrice = Math.round(pricePerRow * inputRows * 100) / 100;

  calculatePrice = Math.round((linear_meter * priceBase) * 10) / 10; // 



  // console.log('calculatePriceTroquelado', calculatePrice);
  // console.log('quantityColumns', quantityColumns);
  // console.log('quantityRows', quantityRows);
  // console.log('pricePerRow', pricePerRow);
  // console.log('diameter', diameter);
  // console.log('quantity', quantity);
  // console.log('extra_option_id', extra_option_id);
  // console.log('inputRows', quantity / quantityColumns);
  // console.log('calculatePrice', calculatePrice);
  return calculatePrice;
};

export const convertNumberToText = (finalAmount: number): string => {
  const unidades: string[] = [
    '',
    'UN',
    'DOS',
    'TRES',
    'CUATRO',
    'CINCO',
    'SEIS',
    'SIETE',
    'OCHO',
    'NUEVE',
  ];
  const decenas: string[] = [
    '',
    'DIEZ',
    'VEINTE',
    'TREINTA',
    'CUARENTA',
    'CINCUENTA',
    'SESENTA',
    'SETENTA',
    'OCHENTA',
    'NOVENTA',
  ];
  const especialesDiezAVeinte: string[] = [
    'DIEZ',
    'ONCE',
    'DOCE',
    'TRECE',
    'CATORCE',
    'QUINCE',
    'DIECISÉIS',
    'DIECISIETE',
    'DIECIOCHO',
    'DIECINUEVE',
  ];
  const centenas: string[] = [
    '',
    'CIENTO',
    'DOSCIENTOS',
    'TRESCIENTOS',
    'CUATROCIENTOS',
    'QUINIENTOS',
    'SEISCIENTOS',
    'SETECIENTOS',
    'OCHOCIENTOS',
    'NOVECIENTOS',
  ];

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
      let texto = miles === 1 ? 'MIL' : unidades[miles] + ' MIL';
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
        texto =
          decenasValor === 10
            ? especialesDiezAVeinte[unidadesMil] + ' MIL'
            : decenasValor === 20
              ? 'VEINTE' +
              (unidadesMil > 0 ? ' Y ' + unidades[unidadesMil] : '') +
              ' MIL'
              : decenas[Math.floor(decenasMil / 10)] +
              (unidadesMil > 0 ? ' Y ' + unidades[unidadesMil] : '') +
              ' MIL';
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
};
