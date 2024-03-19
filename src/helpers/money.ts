import { IProductDetailResponse } from "../interfaces";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    notation: "standard",
    currency: "VND",
    currencyDisplay: "symbol",
  }).format(value);
}

export const getPriceProductFinal = (
  productDetail: IProductDetailResponse
): number => {
  const promotionProductDetailsActive = (
    productDetail.promotionProductDetails ?? []
  ).filter((productDetail) => productDetail.promotion.status == "ACTIVE");

  const maxPromotionProductDetail = promotionProductDetailsActive.reduce(
    (maxProduct, currentProduct) => {
      return currentProduct.promotion.value > maxProduct.promotion.value
        ? currentProduct
        : maxProduct;
    },
    promotionProductDetailsActive[0]
  );

  const discount =
    promotionProductDetailsActive.length > 0
      ? maxPromotionProductDetail.promotion.value
      : 0;

  const discountedPrice = getDiscountPrice(productDetail.price, discount);

  const finalProductPrice = +(productDetail.price * 1);
  const finalDiscountedPrice = +((discountedPrice ?? discount) * 1);
  return discountedPrice !== null ? finalDiscountedPrice : finalProductPrice;
};

export const getDiscountPrice = (price: number, discount: number) => {
  return discount && discount > 0 ? price - price * (discount / 100) : null;
};
