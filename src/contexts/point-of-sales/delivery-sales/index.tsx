import { HttpError, useList, useTranslate } from "@refinedev/core";
import React, {
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";
import {
  IPaymentMethodResponse,
  IPaymentResponse,
  ITransportAddress,
} from "../../../interfaces";
import { Form, FormInstance } from "antd";

type DeliverySalesContextType = {
  shippingMoney: number;
  setShippingMoney: React.Dispatch<React.SetStateAction<number>>;
  discount: number;
  setDiscount: React.Dispatch<React.SetStateAction<number>>;
  payments: IPaymentResponse[] | undefined;
  setPayments: React.Dispatch<
    React.SetStateAction<IPaymentResponse[] | undefined>
  >;
  form: FormInstance;
  paymentMethods: IPaymentMethodResponse[] | undefined;
  setPaymentMethods: React.Dispatch<
    React.SetStateAction<IPaymentMethodResponse[] | undefined>
  >;
};

export const DeliverySalesContext = createContext<DeliverySalesContextType>(
  {} as DeliverySalesContextType
);

export const DeliverySalesContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [shippingMoney, setShippingMoney] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [payments, setPayments] = useState<IPaymentResponse[]>();
  const [paymentMethods, setPaymentMethods] =
    useState<IPaymentMethodResponse[]>();

  const [form] = Form.useForm<ITransportAddress>();

  return (
    <DeliverySalesContext.Provider
      value={{
        shippingMoney,
        setShippingMoney,
        discount,
        setDiscount,
        payments,
        setPayments,
        form,
        paymentMethods,
        setPaymentMethods,
      }}
    >
      {children}
    </DeliverySalesContext.Provider>
  );
};
