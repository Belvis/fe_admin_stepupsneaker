import { InfoCircleOutlined } from "@ant-design/icons";
import {
  Descriptions,
  Modal,
  ModalProps,
  Space,
  Tooltip,
  Typography,
} from "antd";
import React, { Fragment, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { NumberField } from "@refinedev/antd";
import {
  IAddressResponse,
  IOrderDetailResponse,
  IVoucherResponse,
  OrderStatus,
} from "../../interfaces";

interface ChangeDetailProps {
  restModalProps: ModalProps;
  callBack: any;
  close: () => void;
  changes:
    | {
        [key: string]: {
          oldValue: any;
          newValue: any;
        };
      }
    | undefined;
}

const { Title } = Typography;

const ChangeDetail: React.FC<ChangeDetailProps> = ({
  restModalProps,
  callBack,
  close,
  changes,
}) => {
  const { t } = useTranslation();

  const handleOk = () => {};

  const keys = Object.keys(changes ?? {});

  const renderChange = (key: string) => {
    if (changes) {
      switch (key) {
        case "orderDetails":
          const newODs: IOrderDetailResponse[] = changes[key].newValue;
          const oldODs: IOrderDetailResponse[] = changes[key].oldValue;

          return (
            <Descriptions
              title={t(`dashboard.timeline.changes.${key}`)}
              layout="vertical"
              size="small"
              bordered
              key={key}
            >
              <Descriptions.Item label="Cũ">
                {oldODs && oldODs.length > 0 ? (
                  oldODs.map((oldOD, index) => (
                    <Fragment key={index}>
                      <div>
                        <strong>Sản phẩm</strong>:{" "}
                        {oldOD.productDetail.product.name}
                      </div>
                      <div>
                        <strong>Số lượng</strong>: {oldOD.quantity}
                      </div>
                      <div>
                        <strong>Đơn giá</strong>: {renderValue(oldOD.price)}
                      </div>
                      <div>
                        <strong>Thành tiền</strong>:{" "}
                        {renderValue(oldOD.totalPrice)}
                      </div>
                      {index !== oldODs.length - 1 && <hr />}
                    </Fragment>
                  ))
                ) : (
                  <div>N/A</div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Mới">
                {newODs && newODs.length > 0 ? (
                  newODs.map((newOD, index) => (
                    <Fragment key={index}>
                      <div>
                        <strong>Sản phẩm</strong>:{" "}
                        {newOD.productDetail.product.name}
                      </div>
                      <div>
                        <strong>Số lượng</strong>: {newOD.quantity}
                      </div>
                      <div>
                        <strong>Đơn giá</strong>: {renderValue(newOD.price)}
                      </div>
                      <div>
                        <strong>Thành tiền</strong>:{" "}
                        {renderValue(newOD.totalPrice)}
                      </div>
                      {index !== newODs.length - 1 && <hr />}
                    </Fragment>
                  ))
                ) : (
                  <div>N/A</div>
                )}
              </Descriptions.Item>
            </Descriptions>
          );
        case "status":
          const newStatus: OrderStatus = changes[key].newValue;
          const oldStatus: OrderStatus = changes[key].oldValue;

          return (
            <Descriptions
              title={t(`dashboard.timeline.changes.${key}`)}
              layout="vertical"
              size="small"
              bordered
            >
              <Descriptions.Item label="Cũ">
                {oldStatus ? (
                  <>
                    <div>{t(`enum.orderStatuses.${oldStatus}`)}</div>
                  </>
                ) : (
                  <div>N/A</div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Mới">
                {newStatus ? (
                  <>
                    <div>{t(`enum.orderStatuses.${newStatus}`)}</div>
                  </>
                ) : (
                  <div>N/A</div>
                )}
              </Descriptions.Item>
            </Descriptions>
          );
        case "address":
          const newAddress: IAddressResponse = changes[key].newValue;
          const oldAddress: IAddressResponse = changes[key].oldValue;

          return (
            <Descriptions
              title={t(`dashboard.timeline.changes.${key}`)}
              layout="vertical"
              size="small"
              bordered
            >
              <Descriptions.Item label="Cũ">
                {oldAddress ? (
                  <>
                    <div>
                      <strong>{t("customers.fields.phone.label")}</strong>:{" "}
                      {oldAddress.phoneNumber}
                    </div>
                    <div>
                      <strong>{t("customers.fields.province.label")}</strong>:{" "}
                      {oldAddress.provinceName}
                    </div>
                    <div>
                      <strong>{t("customers.fields.district.label")}</strong>:{" "}
                      {oldAddress.districtName}
                    </div>
                    <div>
                      <strong>{t("customers.fields.ward.label")}</strong>:{" "}
                      {oldAddress.wardName}
                    </div>
                    <div>
                      <strong>{t("customers.fields.more")}</strong>:{" "}
                      {oldAddress.more}
                    </div>
                  </>
                ) : (
                  <div>N/A</div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Mới">
                {newAddress ? (
                  <>
                    <div>
                      <strong>{t("customers.fields.phone.label")}</strong>:{" "}
                      {newAddress.phoneNumber}
                    </div>
                    <div>
                      <strong>{t("customers.fields.province.label")}</strong>:{" "}
                      {newAddress.provinceName}
                    </div>
                    <div>
                      <strong>{t("customers.fields.district.label")}</strong>:{" "}
                      {newAddress.districtName}
                    </div>
                    <div>
                      <strong>{t("customers.fields.ward.label")}</strong>:{" "}
                      {newAddress.wardName}
                    </div>
                    <div>
                      <strong>{t("customers.fields.more")}</strong>:{" "}
                      {newAddress.more}
                    </div>
                  </>
                ) : (
                  <div>N/A</div>
                )}
              </Descriptions.Item>
            </Descriptions>
          );
        case "voucher":
          const newVoucher: IVoucherResponse = changes[key].newValue;
          const oldVoucher: IVoucherResponse = changes[key].oldValue;

          return (
            <Descriptions
              title={t(`dashboard.timeline.changes.${key}`)}
              layout="vertical"
              size="small"
              bordered
            >
              <Descriptions.Item label="Cũ">
                {oldVoucher ? (
                  <>
                    <div>{oldVoucher.code}</div>
                  </>
                ) : (
                  <div>N/A</div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Mới">
                {newVoucher ? (
                  <>
                    <div>{newVoucher.code}</div>
                  </>
                ) : (
                  <div>N/A</div>
                )}
              </Descriptions.Item>
            </Descriptions>
          );
        default:
          const newValue = changes[key].newValue;
          const oldValue = changes[key].oldValue;

          return (
            <Descriptions
              title={t(`dashboard.timeline.changes.${key}`)}
              layout="vertical"
              size="small"
              bordered
            >
              <Descriptions.Item label="Cũ">
                {oldValue ? <div>{renderValue(oldValue)}</div> : <div>N/A</div>}
              </Descriptions.Item>
              <Descriptions.Item label="Mới">
                {newValue ? <div>{renderValue(newValue)}</div> : <div>N/A</div>}
              </Descriptions.Item>
            </Descriptions>
          );
      }
    } else {
      return <>Chưa tính đến</>;
    }
  };

  const renderValue = (value: any) => {
    if (typeof value === "number") {
      return (
        <NumberField
          options={{ currency: "VND", style: "currency" }}
          value={value}
          locale={"vi"}
        />
      );
    } else {
      return value ? <div>{value}</div> : <div>N/A</div>;
    }
  };

  return (
    <Modal
      title={
        <Space align="baseline">
          <Title level={5}>Chi tiết thay đổi</Title>
          {/* <Tooltip title="Lê Văn Ri.">
            <InfoCircleOutlined />
          </Tooltip> */}
        </Space>
      }
      {...restModalProps}
      open={restModalProps.open}
      width="700px"
      zIndex={2000}
      centered
      onOk={handleOk}
      footer={<></>}
    >
      {changes && keys && (
        <Space direction="vertical" style={{ width: "100%" }}>
          {keys.map((key) => key !== "versionUpdate" && renderChange(key))}
        </Space>
      )}
    </Modal>
  );
};

export default ChangeDetail;
