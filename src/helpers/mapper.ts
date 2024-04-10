import {
  IColorResponse,
  IDiscountInfo,
  IOrderDetailRequest,
  IOrderDetailResponse,
  IOrderRequest,
  IOrderResponse,
  IPaymentRequest,
  IPaymentResponse,
  IProductClient,
  IProductDetailRequest,
  IProductDetailResponse,
  IProductResponse,
  IPromotionProductDetailResponse,
  IReturnFormDetailRequest,
  IReturnFormDetailResponse,
  ISizeClient,
  IVariation,
} from "../interfaces";

export const productDetailToRequest = (
  productDetails: IProductDetailResponse[] = []
): IProductDetailRequest[] => {
  return productDetails.map(
    ({
      product,
      tradeMark,
      style,
      size,
      material,
      color,
      brand,
      sole,
      image,
      price,
      quantity,
      status,
      id,
    }) => ({
      product: product.id,
      tradeMark: tradeMark.id,
      style: style.id,
      size: size.id,
      material: material.id,
      color: color.id,
      brand: brand.id,
      sole: sole.id,
      image,
      price,
      quantity,
      status,
      id,
    })
  );
};

export const orderDetailToRequest = (
  orderDetails: IOrderDetailResponse[] = [],
  orderId: string
): IOrderDetailRequest[] => {
  return orderDetails.map(
    ({ id, order, productDetail, quantity, price, totalPrice, status }) => ({
      id,
      order: orderId,
      productDetail: productDetail.id,
      quantity,
      price,
      totalPrice,
      status,
    })
  );
};

export const orderToRequest = (order: IOrderResponse): IOrderRequest => {
  const {
    id,
    customer,
    employee,
    voucher,
    address,
    phoneNumber,
    fullName,
    totalMoney,
    shippingMoney,
    type,
    note,
    code,
    status,
  } = order;
  return {
    id,
    customer: customer?.id || "",
    employee: employee?.id || "",
    voucher: voucher?.id || "",
    address: address?.id || "",
    phoneNumber,
    fullName,
    totalMoney,
    shippingMoney,
    type,
    note,
    code,
    status,
  };
};

export const paymentToRequest = (
  payments: IPaymentResponse[] = []
): IPaymentRequest[] => {
  return payments.map(
    ({ order, paymentMethod, totalMoney, transactionCode }) => ({
      order: order.id,
      paymentMethod: paymentMethod.id,
      totalMoney,
      transactionCode,
    })
  );
};

export const productResponseToClient = (
  productResponse: IProductResponse
): IProductClient => {
  const variations: IVariation[] = [];
  const images: string[] = [productResponse.image];
  let minPrice = Number.MAX_SAFE_INTEGER;
  let maxPrice = Number.MIN_SAFE_INTEGER;
  let discountInfo = {
    value: 0,
    endDate: 0,
  } as IDiscountInfo;
  const thresholdInMilliseconds = 7 * 24 * 60 * 60 * 1000;
  const currentTime = new Date().getTime();
  const isNew =
    currentTime - productResponse.createdAt < thresholdInMilliseconds;

  productResponse.productDetails.forEach((productDetail) => {
    images.push(productDetail.image);
    const existingVariation = variations.find(
      (v) => v.color.id === productDetail.color.id
    );
    if (existingVariation) {
      existingVariation.size.push(mapSizeToSizeClient(productDetail));
      existingVariation.image.push(productDetail.image);

      minPrice = Math.min(minPrice, productDetail.price);
      maxPrice = Math.max(maxPrice, productDetail.price);
    } else {
      const newVariation: IVariation = {
        color: productDetail.color,
        image: [productDetail.image],
        size: [mapSizeToSizeClient(productDetail)],
      };
      variations.push(newVariation);

      minPrice = Math.min(minPrice, productDetail.price);
      maxPrice = Math.max(maxPrice, productDetail.price);
    }

    const currentDiscountInfo = getDiscountInfo(
      productDetail.promotionProductDetails ?? []
    );

    if (currentDiscountInfo) {
      if (!discountInfo || currentDiscountInfo.value > discountInfo.value) {
        discountInfo = currentDiscountInfo;
      }
    }
  });

  if (productResponse.productDetails.length === 0) {
    minPrice = 0;
    maxPrice = 0;
  }

  return {
    id: productResponse.id,
    code: productResponse.code,
    name: productResponse.name,
    price: {
      min: minPrice,
      max: maxPrice,
    },
    discount: discountInfo.value,
    saleCount: productResponse.saleCount,
    offerEnd: discountInfo.endDate,
    new: isNew,
    variation: variations,
    image: images,
    description: productResponse.description,
  };
};

const mapSizeToSizeClient = (detail: IProductDetailResponse): ISizeClient => {
  const discountInfo = getDiscountInfo(detail.promotionProductDetails ?? []);

  return {
    id: detail.size?.id || "",
    name: detail.size?.name || "",
    stock: detail.quantity || 0,
    price: detail.price,
    discount: discountInfo?.value ?? 0,
    offerEnd: discountInfo?.endDate ?? 0,
    saleCount: 0,
    productDetailId: detail.id,
  };
};

const getDiscountInfo = (
  promotionProductDetails: IPromotionProductDetailResponse[]
): IDiscountInfo | null => {
  if (!promotionProductDetails || promotionProductDetails.length === 0) {
    return null;
  }

  const activePromotions = promotionProductDetails
    .map((detail) => detail.promotion)
    .filter((promotion) => promotion.status === "ACTIVE");

  if (activePromotions.length === 0) {
    return null;
  }

  const maxPromotion = activePromotions.reduce((max, promotion) => {
    return promotion.value > max.value ? promotion : max;
  });

  const discountInfo: IDiscountInfo = {
    value: maxPromotion.value,
    endDate: maxPromotion.endDate,
  };

  return discountInfo;
};

export const initializeProductClient = (product: IProductResponse) => {
  const productClient = productResponseToClient(product);

  const initialSelectedColor =
    productClient.variation && productClient.variation.length > 0
      ? productClient.variation[0].color
      : ({} as IColorResponse);
  const initialSelectedSize =
    productClient.variation && productClient.variation.length > 0
      ? productClient.variation[0].size[0]
      : ({} as ISizeClient);
  const initialProductStock =
    productClient.variation && productClient.variation.length > 0
      ? productClient.variation[0].size[0].stock
      : 0;

  return {
    productClient,
    initialSelectedColor,
    initialSelectedSize,
    initialProductStock,
  };
};

export const returnFormDetailsToPayloadFormat = (
  returnFormDetails: IReturnFormDetailRequest[] | undefined
): any[] => {
  if (!returnFormDetails) return [];

  return returnFormDetails.map((detail) => {
    return {
      id: detail.id,
      orderDetail: detail.orderDetail,
      quantity: detail.returnQuantity,
      reason: detail.reason,
      feedback: detail.feedback,
      image: detail.evidence,
    };
  });
};

export const returnFormDetailResponseToRequest = (
  responseDetail: IReturnFormDetailResponse,
  orderCode: string
): IReturnFormDetailRequest => {
  return {
    id: responseDetail.id,
    orderCode: orderCode,
    orderDetail: responseDetail.orderDetail.id,
    quantity: responseDetail.orderDetail.quantity,
    returnQuantity: responseDetail.quantity,
    name: `${responseDetail.orderDetail.productDetail.product.name} | ${responseDetail.orderDetail.productDetail.color.name} -  ${responseDetail.orderDetail.productDetail.size.name}`,
    unitPrice: responseDetail.orderDetail.price,
    reason: responseDetail.reason,
    feedback: responseDetail.feedback,
    evidence: responseDetail.urlImage,
  };
};

export const returnFormDetailResponseToRequestList = (
  responseList: IReturnFormDetailResponse[],
  orderCode: string
): IReturnFormDetailRequest[] => {
  return responseList.map((responseItem) =>
    returnFormDetailResponseToRequest(responseItem, orderCode)
  );
};
