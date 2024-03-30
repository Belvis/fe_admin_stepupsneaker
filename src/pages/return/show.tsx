import { useForm } from "@refinedev/antd";
import {
  IResourceComponentsProps,
  useShow,
  useTranslate,
} from "@refinedev/core";
import { IReturnFormResponse } from "../../interfaces";

export const ReturnShow: React.FC<IResourceComponentsProps> = () => {
  const t = useTranslate();

  const { onFinish, formProps, saveButtonProps, formLoading } =
    useForm<IReturnFormResponse>({
      action: "edit",
    });

  return <></>;
};
