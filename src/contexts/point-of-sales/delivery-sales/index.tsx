import { Form, FormInstance } from "antd";
import React, { PropsWithChildren, createContext, useState } from "react";
import { ITransportAddress } from "../../../interfaces";

type DeliverySalesContextType = {
  shippingMoney: number;
  setShippingMoney: React.Dispatch<React.SetStateAction<number>>;
  discount: number;
  setDiscount: React.Dispatch<React.SetStateAction<number>>;
  form: FormInstance;
  isCOD: boolean;
  setIsCOD: React.Dispatch<React.SetStateAction<boolean>>;
};

export const DeliverySalesContext = createContext<DeliverySalesContextType>(
  {} as DeliverySalesContextType
);

export const DeliverySalesContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [shippingMoney, setShippingMoney] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [isCOD, setIsCOD] = useState<boolean>(false);

  const [form] = Form.useForm<ITransportAddress>();

  return (
    <DeliverySalesContext.Provider
      value={{
        shippingMoney,
        setShippingMoney,
        discount,
        setDiscount,
        form,
        isCOD,
        setIsCOD,
      }}
    >
      {children}
    </DeliverySalesContext.Provider>
  );
};
