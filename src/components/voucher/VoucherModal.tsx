import { List as AntdList, Modal, ModalProps } from "antd";
import React from "react";
import { IOrderResponse, IVoucherListResponse } from "../../interfaces";
import Voucher from "./Voucher";

interface VoucherModalProps {
  restModalProps: ModalProps;
  close: () => void;
  vouchers: IVoucherListResponse[];
  type?: "apply" | "copy";
  setViewOrder?: React.Dispatch<React.SetStateAction<IOrderResponse>>;
}

const VoucherModal: React.FC<VoucherModalProps> = ({
  restModalProps,
  vouchers,
  type,
  setViewOrder,
  close,
}) => {
  function renderItem(item: IVoucherListResponse) {
    return (
      <AntdList.Item actions={[]}>
        <AntdList.Item.Meta title={""} description={""} />
        <Voucher
          item={item.voucher}
          type={type}
          setViewOrder={setViewOrder}
          close={close}
        />
      </AntdList.Item>
    );
  }
  return (
    <Modal
      title="Danh sách phiếu giảm giá còn hoạt động"
      {...restModalProps}
      open={restModalProps.open}
      width="700px"
      centered
      footer={<></>}
    >
      <AntdList
        itemLayout="horizontal"
        dataSource={vouchers}
        renderItem={renderItem}
      />
    </Modal>
  );
};

export default VoucherModal;
