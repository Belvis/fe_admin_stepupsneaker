import {
  IResourceComponentsProps,
  useGetIdentity,
  useTranslate,
} from "@refinedev/core";

import { App, Form } from "antd";
import { useContext, useEffect, useState } from "react";
import { ReturnFormContext } from "../../contexts/return";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import { returnFormDetailsToPayloadFormat } from "../../helpers/mapper";
import {
  IAddressResponse,
  IEmployeeResponse,
  ReturnType,
} from "../../interfaces";
import { ReturnForm } from "./ReturnForm";

export const ReturnInformation: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { message } = App.useApp();

  const {
    formProps,
    onFinish,
    selectedOrder,
    returnFormDetails,
    setReturnFormDetails,
  } = useContext(ReturnFormContext);

  const type: ReturnType = Form.useWatch("type", formProps.form);
  const { data } = useGetIdentity<IEmployeeResponse>();
  const [defaultAddress, setDefaultAddress] = useState<IAddressResponse>();

  useEffect(() => {
    if (selectedOrder) {
      const defaultAddress = selectedOrder?.customer?.addressList.find(
        (address) => address.isDefault
      );

      setDefaultAddress(defaultAddress);
    }
  }, [selectedOrder]);

  useEffect(() => {
    const calculateTotalMoney = () => {
      if (!returnFormDetails) {
        return 0;
      }

      let calculatedTotalMoney = 0;

      returnFormDetails.forEach(({ returnQuantity, unitPrice }) => {
        calculatedTotalMoney += returnQuantity * unitPrice;
      });

      return calculatedTotalMoney;
    };

    const totalMoney = formProps.form?.getFieldValue("amountToBePaid");
    const newTotalMoney = calculateTotalMoney();

    if (newTotalMoney !== totalMoney) {
      formProps.form?.setFieldValue("amountToBePaid", newTotalMoney);
    }
  }, [returnFormDetails]);

  useEffect(() => {
    if (defaultAddress) {
      formProps.form?.setFieldsValue({
        phoneNumber: defaultAddress.phoneNumber,
        provinceId: Number(defaultAddress.provinceId),
        districtId: Number(defaultAddress.districtId),
        wardCode: defaultAddress.wardCode,
        more: defaultAddress.more,
      });
    }
  }, [defaultAddress]);

  useEffect(() => {
    if (selectedOrder) {
      const customer =
        selectedOrder?.fullName ??
        selectedOrder?.customer?.fullName ??
        t("invoices.retailCustomer");

      formProps.form?.setFieldsValue({
        customer: {
          name: customer,
        },
        code: selectedOrder.code,
      });
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (data) {
      formProps.form?.setFieldsValue({
        employee: {
          fullName: data.fullName,
        },
      });
    }
  }, [data]);

  const handleOnFinish = (values: any) => {
    const isValid = returnFormDetails?.every((returnFormDetail) =>
      Object.values(returnFormDetail).every(
        (value) => value !== "" && value !== undefined
      )
    );

    if (!isValid && type === "OFFLINE") {
      message.warning(t("return-forms.message.emptyReturnDetails"));
      return;
    }

    const returnFormDetailsPayload =
      returnFormDetailsToPayloadFormat(returnFormDetails);

    const submitData = {
      address: {
        phoneNumber: formProps.form?.getFieldValue("phoneNumber"),
        districtId: formProps.form?.getFieldValue("districtId"),
        districtName: formProps.form?.getFieldValue("districtName"),
        provinceId: formProps.form?.getFieldValue("provinceId"),
        provinceName: formProps.form?.getFieldValue("provinceName"),
        wardCode: formProps.form?.getFieldValue("wardCode"),
        wardName: formProps.form?.getFieldValue("wardName"),
        more: formProps.form?.getFieldValue("line"),
      },
      order: selectedOrder?.id,
      paymentType: formProps.form?.getFieldValue("paymentType"),
      refundStatus: formProps.form?.getFieldValue("refundStatus"),
      returnDeliveryStatus: formProps.form?.getFieldValue(
        "returnDeliveryStatus"
      ),
      paymentInfo: formProps.form?.getFieldValue("paymentInfo") ?? "Cash",
      type: formProps.form?.getFieldValue("type"),
      amountToBePaid: formProps.form?.getFieldValue("amountToBePaid"),
      returnFormDetails: returnFormDetailsPayload,
    };
    showWarningConfirmDialog({
      options: {
        accept: () => {
          onFinish(submitData);
        },
        reject: () => {},
      },
      t: t,
    });
  };

  return (
    <>
      {returnFormDetails && (
        <ReturnForm
          action="create"
          formProps={formProps}
          handleOnFinish={handleOnFinish}
          returnFormDetails={returnFormDetails}
          setReturnFormDetails={setReturnFormDetails}
        />
      )}
    </>
  );
};
