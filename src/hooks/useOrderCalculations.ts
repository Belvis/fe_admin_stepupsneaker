import { useMemo } from "react";
import { IOrderDetailResponse } from "../interfaces";

const useOrderCalculations = (orderDetails: IOrderDetailResponse[]) => {
  const totalQuantity = useMemo(() => {
    return orderDetails.reduce((total, detail) => total + detail.quantity, 0);
  }, [orderDetails]);

  const totalPrice = useMemo(() => {
    return orderDetails.reduce((total, detail) => total + detail.totalPrice, 0);
  }, [orderDetails]);

  return { totalQuantity, totalPrice };
};

export default useOrderCalculations;
