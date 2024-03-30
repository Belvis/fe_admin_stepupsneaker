import { useForm } from "@refinedev/antd";
import { CreateResponse, UpdateResponse } from "@refinedev/core";
import { ButtonProps, FormProps } from "antd";
import React, { PropsWithChildren, createContext, useState } from "react";
import {
  IOrderResponse,
  IReturnFormDetailRequest,
  IReturnFormResponse,
} from "../../interfaces";

type ReturnFormContextType = {
  returnFormDetails: IReturnFormDetailRequest[] | undefined;
  setReturnFormDetails: React.Dispatch<
    React.SetStateAction<IReturnFormDetailRequest[] | undefined>
  >;
  formProps: FormProps<{}>;
  saveButtonProps: ButtonProps & {
    onClick: () => void;
  };
  formLoading: boolean;
  onFinish: (
    values: any
  ) => Promise<
    | void
    | CreateResponse<IReturnFormResponse>
    | UpdateResponse<IReturnFormResponse>
  >;
  currentStep: number;
  next: () => void;
  prev: () => void;
  selectedOrder: IOrderResponse | undefined;
  setSelectedOrder: React.Dispatch<
    React.SetStateAction<IOrderResponse | undefined>
  >;
};

export const ReturnFormContext = createContext<ReturnFormContextType>(
  {} as ReturnFormContextType
);

export const ReturnFormContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [returnFormDetails, setReturnFormDetails] =
    useState<IReturnFormDetailRequest[]>();
  const [selectedOrder, setSelectedOrder] = useState<IOrderResponse>();

  const { onFinish, formProps, saveButtonProps, formLoading } =
    useForm<IReturnFormResponse>();

  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <ReturnFormContext.Provider
      value={{
        returnFormDetails,
        setReturnFormDetails,
        onFinish,
        formProps,
        saveButtonProps,
        formLoading,
        currentStep,
        next,
        prev,
        selectedOrder,
        setSelectedOrder,
      }}
    >
      {children}
    </ReturnFormContext.Provider>
  );
};
