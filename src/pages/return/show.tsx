import { SaveButton, Show, useForm, useModal } from "@refinedev/antd";
import {
  IResourceComponentsProps,
  useParsed,
  useShow,
  useTranslate,
} from "@refinedev/core";
import { App, Button } from "antd";
import { useEffect, useState } from "react";
import { AiOutlineFileDone } from "react-icons/ai";
import { MdHistoryEdu } from "react-icons/md";
import { TbStatusChange } from "react-icons/tb";
import { ReturnForm } from "../../components/return/ReturnForm";
import { ReturnHistoryTimeLine } from "../../components/return/ReturnHistoryTimeLine";
import { ReturnSteps } from "../../components/return/ReturnSteps";
import UpdateStatusModal from "../../components/return/UpdateStatusModal";
import { showWarningConfirmDialog } from "../../helpers/confirm";
import {
  returnFormDetailResponseToRequestList,
  returnFormDetailsToPayloadFormat,
} from "../../helpers/mapper";
import {
  DeliveryStatus,
  IOrderResponse,
  IReturnFormDetailRequest,
  IReturnFormDetailResponse,
  IReturnFormResponse,
} from "../../interfaces";

export const ReturnShow: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();
  const { message } = App.useApp();
  const { id } = useParsed();

  const {
    queryResult: { refetch, data, isLoading },
  } = useShow<IReturnFormResponse>();

  const record = data?.data;

  const { onFinish, formProps, saveButtonProps, formLoading } =
    useForm<IReturnFormResponse>({ action: "edit", id });

  const {
    show: showReason,
    close: closeReason,
    modalProps: { visible: vi2, ...restPropsReason },
  } = useModal();

  const [returnFormDetails, setReturnFormDetails] =
    useState<IReturnFormDetailRequest[]>();

  const [status, setStatus] = useState<DeliveryStatus>("PENDING");

  useEffect(() => {
    if (record?.order) {
      const customer =
        record.order?.fullName ??
        record.order?.customer?.fullName ??
        t("invoices.retailCustomer");

      formProps.form?.setFieldsValue({
        customer: {
          name: customer,
        },
        code: record.order.code,
      });
    }
  }, [record]);

  useEffect(() => {
    if (record) {
      const returnFormDetailsResponse: IReturnFormDetailResponse[] =
        record.returnFormDetails;
      const orderResponse: IOrderResponse = record.order;
      const defaultAddress = orderResponse?.customer?.addressList.find(
        (address) => address.isDefault
      );

      const returnFormDetailsRequest = returnFormDetailResponseToRequestList(
        returnFormDetailsResponse,
        orderResponse.code
      );

      if (defaultAddress) {
        formProps.form?.setFieldsValue({
          phoneNumber: defaultAddress.phoneNumber,
          provinceId: Number(defaultAddress.provinceId),
          districtId: Number(defaultAddress.districtId),
          wardCode: defaultAddress.wardCode,
          line: defaultAddress.more,
        });
      }

      setReturnFormDetails(returnFormDetailsRequest);
    }
  }, [record]);

  const handleOnFinish = (values: any) => {
    const isValid = returnFormDetails?.every((returnFormDetail) =>
      Object.values(returnFormDetail).every(
        (value) => value !== "" && value !== undefined
      )
    );

    if (!isValid) {
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
      order: record?.order?.id,
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

  const {
    show,
    close,
    modalProps: { visible: vi, ...restProps },
  } = useModal();

  return (
    <>
      <Show
        canEdit={false}
        isLoading={formLoading}
        footerButtonProps={{
          style: {
            width: "100%",
            padding: "0 24px",
            justifyContent: "end",
          },
        }}
        headerButtons={({ defaultButtons }) => (
          <>
            {defaultButtons}
            <Button icon={<MdHistoryEdu />} type="primary" onClick={show}>
              Xem lịch sử
            </Button>
            <Button
              icon={<TbStatusChange />}
              type="primary"
              disabled={record?.returnDeliveryStatus === "COMPLETED"}
              onClick={() => {
                const status = getNextStatus(
                  record?.returnDeliveryStatus ?? "PENDING"
                );
                setStatus(status ?? "PENDING");
                showReason();
              }}
            >
              Cập nhật trạng thái
            </Button>
            <Button
              icon={<AiOutlineFileDone />}
              disabled={record?.returnDeliveryStatus === "COMPLETED"}
              type="primary"
              onClick={() => {
                setStatus("COMPLETED");
                showReason();
              }}
            >
              Xác nhận hoàn thành
            </Button>
          </>
        )}
        footerButtons={
          <>
            {record?.refundStatus === "PENDING" && (
              <SaveButton {...saveButtonProps} />
            )}
          </>
        }
      >
        <ReturnSteps record={record} callBack={null} />
        {returnFormDetails && (
          <ReturnForm
            action="edit"
            formProps={formProps}
            handleOnFinish={handleOnFinish}
            returnFormDetails={returnFormDetails}
            setReturnFormDetails={setReturnFormDetails}
          />
        )}
      </Show>
      {restProps.open && (
        <ReturnHistoryTimeLine id={id} modalProps={restProps} close={close} />
      )}

      {restPropsReason.open && (
        <UpdateStatusModal
          restModalProps={restPropsReason}
          close={closeReason}
          returnForm={record ?? ({} as IReturnFormResponse)}
          callBack={refetch}
          status={status}
        />
      )}
    </>
  );
};

const getNextStatus = (
  currentStatus: DeliveryStatus
): DeliveryStatus | null => {
  const statusList: DeliveryStatus[] = [
    "PENDING",
    "RETURNING",
    "RECEIVED",
    "COMPLETED",
  ];
  const currentIndex = statusList.indexOf(currentStatus);

  if (currentIndex !== -1) {
    let nextIndex = currentIndex + 1;

    // Check if current status is COMPLETED
    if (currentStatus === "COMPLETED") {
      // If current status is COMPLETED, return to PENDING (statusList[0])
      return statusList[0];
    }

    // Otherwise, proceed normally
    if (nextIndex < statusList.length) {
      return statusList[nextIndex];
    }
  }

  return null;
};
