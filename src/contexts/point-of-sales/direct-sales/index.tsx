import React, { PropsWithChildren, createContext, useState } from "react";
import { IPaymentMethodResponse, IPaymentResponse } from "../../../interfaces";
import { TablePaginationConfig } from "antd";

type DirectSalesContextType = {
  discount: number;
  setDiscount: React.Dispatch<React.SetStateAction<number>>;
  payments: IPaymentResponse[] | undefined;
  setPayments: React.Dispatch<
    React.SetStateAction<IPaymentResponse[] | undefined>
  >;
  paymentMethods: IPaymentMethodResponse[] | undefined;
  setPaymentMethods: React.Dispatch<
    React.SetStateAction<IPaymentMethodResponse[] | undefined>
  >;
  pagination: TablePaginationConfig;
  setPagination: React.Dispatch<React.SetStateAction<TablePaginationConfig>>;
  pLayout: "vertical" | "horizontal";
  handleToggleLayout: () => void;
};

export const DirectSalesContext = createContext<DirectSalesContextType>(
  {} as DirectSalesContextType
);

export const DirectSalesContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [discount, setDiscount] = useState(0);
  const [payments, setPayments] = useState<IPaymentResponse[]>();
  const [paymentMethods, setPaymentMethods] =
    useState<IPaymentMethodResponse[]>();

  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  const [pLayout, setpLayout] = useState<"horizontal" | "vertical">(
    "horizontal"
  );

  const handleToggleLayout = () => {
    setpLayout((prevLayout) =>
      prevLayout === "horizontal" ? "vertical" : "horizontal"
    );
  };
  return (
    <DirectSalesContext.Provider
      value={{
        discount,
        setDiscount,
        payments,
        setPayments,
        paymentMethods,
        setPaymentMethods,
        pagination,
        setPagination,
        pLayout,
        handleToggleLayout,
      }}
    >
      {children}
    </DirectSalesContext.Provider>
  );
};
