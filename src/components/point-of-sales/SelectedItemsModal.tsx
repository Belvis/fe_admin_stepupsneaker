import { useCreateMany, useTranslate } from "@refinedev/core";
import {
  App,
  Button,
  Col,
  Empty,
  Grid,
  Modal,
  ModalProps,
  Row,
  Space,
} from "antd";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { POSContext } from "../../contexts/point-of-sales";
import { getPriceProductFinal } from "../../helpers/money";
import { IOrderDetailRequest, IProductDetailResponse } from "../../interfaces";
import { ProductDetailItem } from "./ProductDetailItem";
import ShoppingCartHeader from "./ShoppingCartHeader";

type SelectedItemsModalProps = {
  modalProps: ModalProps;
  close: () => void;
  parentClose: () => void;
  setSelectedProductDetails: Dispatch<SetStateAction<IProductDetailResponse[]>>;
  items: IProductDetailResponse[];
  showAddAndGoButton: boolean;
};

export const SelectedItemsModal: React.FC<SelectedItemsModalProps> = ({
  modalProps,
  close,
  setSelectedProductDetails,
  items,
  showAddAndGoButton,
  parentClose,
}) => {
  const t = useTranslate();
  const { mutate } = useCreateMany();
  const { message } = App.useApp();
  const breakpoint = Grid.useBreakpoint();
  const { refetchOrder, activeKey } = useContext(POSContext);

  const [copiedItems, setCopiedItems] =
    useState<IProductDetailResponse[]>(items);

  useEffect(() => {
    if (items) setCopiedItems([...items]);
  }, [modalProps.open]);

  const handleOk = async () => {
    setSelectedProductDetails(copiedItems);
    close();
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setCopiedItems((prev) =>
      prev.map((detail) =>
        detail.id === productId ? { ...detail, quantity: newQuantity } : detail
      )
    );
  };

  const removeProductDetails = (productId: string) => {
    setCopiedItems((prev) => {
      return prev
        .map((detail) =>
          detail.id === productId
            ? { ...detail, quantity: detail.quantity - 1 }
            : detail
        )
        .filter((detail) => detail.quantity > 0);
    });
  };

  const addAndGo = async () => {
    await handleOk();
    handleSubmit();
  };

  const handleSubmit = async () => {
    const payLoad = orderDetailToPayload(items, activeKey);

    try {
      mutate(
        {
          resource: "order-details",
          values: payLoad,
          successNotification: () => {
            return false;
          },
          errorNotification: () => {
            return false;
          },
        },
        {
          onError: (error, variables, context) => {
            message.error(
              t("orders.notification.tab.add.error") + error.message
            );
          },
          onSuccess: () => {
            message.success(t("orders.notification.tab.add.success"));
            refetchOrder();
            parentClose();
          },
        }
      );
    } catch (error) {
      console.error("Creation failed", error);
    }
  };

  return (
    <Modal
      title={t("products.titles.add")}
      {...modalProps}
      width={breakpoint.sm ? "800px" : "100%"}
      zIndex={1002}
      onOk={handleOk}
      okText={t("buttons.addAndContinue")}
      footer={(_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <Button type="primary" onClick={addAndGo}>
            {showAddAndGoButton ? t("buttons.go") : t("buttons.addAndGo")}
          </Button>
          <OkBtn />
        </>
      )}
    >
      <Row>
        <Col span={24}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <ShoppingCartHeader />
            {copiedItems.length > 0 ? (
              <div
                style={{
                  maxHeight: "300px",
                  overflow: "auto",
                }}
              >
                {copiedItems.map((item, index) => (
                  <ProductDetailItem
                    key={item.id}
                    productDetail={item}
                    callBack={updateQuantity}
                    onRemove={() => removeProductDetails(item.id)}
                    count={index}
                  />
                ))}
              </div>
            ) : (
              <Empty />
            )}
          </Space>
        </Col>
      </Row>
    </Modal>
  );
};

const orderDetailToPayload = (
  productDetails: IProductDetailResponse[],
  orderId: string
): IOrderDetailRequest[] => {
  return productDetails.map((detail) => ({
    order: orderId,
    productDetail: detail.id,
    quantity: detail.quantity,
    price: getPriceProductFinal(detail),
    totalPrice: getPriceProductFinal(detail) * detail.quantity,
    status: "COMPLETED",
  }));
};
