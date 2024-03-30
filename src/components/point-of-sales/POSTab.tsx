import {
  AppstoreAddOutlined,
  QrcodeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useModal } from "@refinedev/antd";
import {
  useApiUrl,
  useCreate,
  useDelete,
  useList,
  useTranslate,
} from "@refinedev/core";
import { App, AutoComplete, Button, Input, Space, Spin, Tabs } from "antd";
import { debounce } from "lodash";
import { useContext, useEffect, useState } from "react";
import { dataProvider } from "../../providers/dataProvider";
import { POSContext, initialItems } from "../../contexts/point-of-sales";
import { IOption, IProductResponse } from "../../interfaces";
import { renderItemProduct } from "../product/shared";
import { QRScannerModal } from "../qr-scanner/QRScannerModal";
import { AdvancedAddModal } from "./AdvancedAddModal";

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;
type PositionType = "left" | "right";

export const POSTab: React.FC = () => {
  const t = useTranslate();
  const API_URL = useApiUrl();
  const { getOne } = dataProvider(API_URL);
  const { message } = App.useApp();
  const {
    productShow,
    setSelectedProduct,
    items,
    setItems,
    activeKey,
    setActiveKey,
    isLoadingOrder,
  } = useContext(POSContext);

  const [productOptions, setProductOptions] = useState<IOption[]>([]);
  const [value, setValue] = useState<string>("");

  const { mutate: mutateCreate, isLoading: isLoadingOrderCreate } = useCreate();
  const { mutate: mutateDelete, isLoading: isLoadingOrderDelete } = useDelete();

  const { refetch: refetchProducts } = useList<IProductResponse>({
    resource: "products",
    config: {
      filters: [
        { field: "q", operator: "contains", value },
        {
          field: "minQuantity",
          operator: "eq",
          value: 1,
        },
      ],
    },
    pagination: {
      pageSize: 10,
    },
    queryOptions: {
      enabled: false,
      onSuccess: (data) => {
        const productOptions = data.data.map((item) =>
          renderItemProduct(`${item.name} / #${item.code}`, item.image, item)
        );
        if (productOptions.length > 0) {
          setProductOptions(productOptions);
        }
      },
    },
  });

  const {
    show: advancedAddShow,
    close: advancedAddClose,
    modalProps: advancedAddModalProps,
  } = useModal();

  const {
    show: scanShow,
    close: scanClose,
    modalProps: scanModalProps,
  } = useModal();

  useEffect(() => {
    setProductOptions([]);
    refetchProducts();
  }, [value]);

  const handleScanSuccess = async (result: string) => {
    const { data } = await getOne({ resource: "products", id: result });
    if (data) {
      setSelectedProduct(data as IProductResponse);
      productShow();
    }
  };

  const onChange = (newActiveKey: string) => {
    setActiveKey(newActiveKey);
  };

  const onEdit = (
    targetKey: React.MouseEvent | React.KeyboardEvent | string,
    action: "add" | "remove"
  ) => {
    if (action === "add") {
      add();
    } else {
      remove(targetKey);
    }
  };

  const add = () => {
    mutateCreate(
      {
        resource: "orders",
        values: {
          status: "PENDING",
        },
        successNotification: () => {
          return false;
        },
        errorNotification: () => {
          return false;
        },
      },
      {
        onError: (error, variables, context) => {
          message.error(t("orders.notification.tab.add.error") + error.message);
        },
        onSuccess: (data, variables, context) => {
          const id = data.data?.id;
          setActiveKey(id as string);
          message.success(t("orders.notification.tab.add.success"));
        },
      }
    );
  };

  const remove = (targetKey: TargetKey) => {
    let lastIndex = -1;
    items.forEach((item, i) => {
      if (item.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    mutateDelete(
      {
        resource: "orders",
        id: targetKey as string,
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
            t("orders.notification.tab.remove.error") + error.message
          );
        },
        onSuccess: (data, variables, context) => {
          if (lastIndex == -1 && items.length == 1) {
            setItems(initialItems);
            setActiveKey("1");
          } else {
            setActiveKey(items[lastIndex].key);
          }
          message.success(t("orders.notification.tab.remove.success"));
        },
      }
    );
  };

  const handleAdvancedAddShow = () => {
    if (!activeKey || activeKey == "1") {
      message.error(t("orders.notification.tab.advancedAdd.error"));
    } else {
      advancedAddShow();
    }
  };

  const handleScanShow = () => {
    if (!activeKey || activeKey == "1") {
      message.error(t("orders.notification.tab.advancedAdd.error"));
    } else {
      scanShow();
    }
  };

  const operations: Record<PositionType, React.ReactNode> = {
    left: (
      <AutoComplete
        style={{
          width: "100%",
          minWidth: "450px",
        }}
        options={productOptions}
        onSelect={(_, option: any) => {
          setSelectedProduct(option.product);
          productShow();
        }}
        filterOption={false}
        onSearch={debounce((value: string) => setValue(value), 300)}
      >
        <Input
          placeholder={t("search.placeholder.products")}
          suffix={<SearchOutlined />}
        />
      </AutoComplete>
    ),
    right: (
      <Space>
        <Button
          icon={<AppstoreAddOutlined />}
          type="primary"
          onClick={() => handleAdvancedAddShow()}
        >
          {t("buttons.advancedAdd")}
        </Button>
        <Button
          icon={<QrcodeOutlined />}
          type="primary"
          onClick={() => {
            handleScanShow();
          }}
        >
          {t("buttons.scanQR")}
        </Button>
      </Space>
    ),
  };

  return (
    <Spin
      spinning={isLoadingOrder || isLoadingOrderCreate || isLoadingOrderDelete}
    >
      <Tabs
        className="h-100"
        tabBarExtraContent={operations}
        type="editable-card"
        onChange={onChange}
        activeKey={activeKey}
        onEdit={onEdit}
        items={items}
      />
      {scanModalProps.open && (
        <QRScannerModal
          modalProps={scanModalProps}
          close={scanClose}
          onScanSuccess={handleScanSuccess}
        />
      )}

      <AdvancedAddModal
        modalProps={advancedAddModalProps}
        close={advancedAddClose}
      />
    </Spin>
  );
};
