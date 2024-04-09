/**
 * @fileoverview Định nghĩa các kiểu dữ liệu dùng trong dự án
 * Quy ước:
 * I<Entity><Type>: IProductRequest, IProductResponse, ...
 */

/* Start Types */
export type QueryObserverResult<TData = unknown, TError = unknown> =
  | DefinedQueryObserverResult<TData, TError>
  | QueryObserverLoadingErrorResult<TData, TError>
  | QueryObserverLoadingResult<TData, TError>;
export type ColSpanType = number | string;
export type ReviewStatus = "WAITING" | "ACCEPTED" | "REJECTED";
export type ProductStatus = "ACTIVE" | "IN_ACTIVE";
export type PaymentStatus = "PENDING" | "COMPLETED";
export type VoucherStatus =
  | "IN_ACTIVE"
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED"
  | "UP_COMING";
export type OrderStatus =
  | "PENDING"
  | "PLACE_ORDER"
  | "WAIT_FOR_CONFIRMATION"
  | "WAIT_FOR_DELIVERY"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELED"
  | "EXPIRED"
  | "RETURNED"
  | "EXCHANGED";
export type UserStatus = "ACTIVE" | "IN_ACTIVE" | "BLOCKED";
export type PromotionStatus =
  | "IN_ACTIVE"
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED"
  | "UP_COMING";
export type VoucherType = "PERCENTAGE" | "CASH";
export type OrderType = "ONLINE" | "OFFLINE";
export type RevisionType = "UNKNOWN" | "INSERT" | "UPDATE" | "DELETE";
export type ReturnType = "ONLINE" | "OFFLINE";
export type PaymentType = "Cash" | "Transfer";
export type RefundStatus = "PENDING" | "COMPLETED";
export type InspectionStatus = "PASSED" | "FAILED" | undefined;
export type DeliveryStatus = "PENDING" | "RETURNING" | "RECEIVED" | "COMPLETED";
/* End Types */

/* Start Intefaces */
export interface IFile {
  name: string;
  percent: number;
  size: number;
  status: "error" | "success" | "done" | "uploading" | "removed";
  type: string;
  uid: string;
  url: string;
}
export interface ISalesChart {
  date: string;
  title: "Order Count" | "Order Amount";
  value: number;
}
export interface IEvent {
  date: number | undefined;
  status: OrderStatus;
  loading?: boolean;
  note?: string;
}
export interface IReturnEvent {
  date: number | undefined;
  status: DeliveryStatus;
  loading?: boolean;
  note?: string;
}

export interface IUserSelected {
  product: IProductResponse;
  tradeMark: IProdAttributeResponse;
  style: IProdAttributeResponse;
  size: IProdAttributeResponse[];
  material: IProdAttributeResponse;
  color: IColorResponse[];
  brand: IProdAttributeResponse;
  sole: IProdAttributeResponse;
  image: string;
  price: number;
  quantity: number;
  status: ProductStatus;
}
export interface IProductClient {
  id: string;
  code: string;
  name: string;
  price: {
    min: number;
    max: number;
  };
  discount: number;
  saleCount: number;
  offerEnd: number;
  new: boolean;
  variation: IVariation[];
  image: string[];
  description: string;
}
export interface IVariation {
  color: IColorResponse;
  image: string[];
  size: ISizeClient[];
}
export interface ISizeClient {
  id: string;
  name: string;
  stock: number;
  price: number;
  discount: number;
  saleCount: number;
  offerEnd: number;
  productDetailId: string;
}
export interface IProductData {
  productClient: IProductClient;
  initialSelectedColor: IColorResponse;
  initialSelectedSize: ISizeClient;
  initialProductStock: number;
}
export interface ITransportAddress {
  more: string;
  fullName: string;
  phoneNumber: string;
  districtId: number;
  provinceId: number;
  wardCode: string;
  height: number;
  length: number;
  weight: number;
  width: number;
  insuranceValue: number;
  codFailedAmount: number;
  coupon: string;
}
export interface IDiscountInfo {
  value: number;
  endDate: number;
}
export interface IOption {
  value: string;
  label: string | React.ReactNode;
}

export interface IConfirmDialogOptions {
  message?: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  acceptClassName?: string;
  accept: any;
  reject: any;
}

export interface IQRCodeData {
  cicNumber: string;
  idcNumber: string;
  fullName: string;
  dob: string;
  gender: string;
  address: string;
  issueDate: string;
}
export interface ITab {
  label: string;
  children: React.ReactNode;
  key: string;
}
/* Dữ liệu database */

/* Start Response */
export interface IColorResponse {
  id: string;
  code: string;
  name: string;
  status: ProductStatus;
  createdAt: number;
}

export interface IProdAttributeResponse {
  id: string;
  name: string;
  status: ProductStatus;
}

export interface IVoucherResponse {
  id: string;
  code: string;
  name: string;
  status: VoucherStatus;
  type: VoucherType;
  value: number;
  constraint: number;
  quantity: number;
  startDate: number;
  endDate: number;
  image: string;
}

export interface IVoucherListResponse {
  id: string;
  voucher: IVoucherResponse;
}
export interface IPromotionResponse {
  id: string;
  code: string;
  name: string;
  status: PromotionStatus;
  value: number;
  startDate: number;
  endDate: number;
  image: string;
}

export interface IVoucherHistoryResponse {
  id: string;
  voucher: IVoucherResponse;
  order: IOrderResponse;
  moneyBeforeReduction: number;
  moneyAfterReduction: number;
  moneyReduction: number;
  createdAt: number;
  updatedAt: number;
}

export interface ICustomerResponse {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: number;
  password: string;
  status: UserStatus;
  gender: string;
  image: string;
  addressList: IAddressResponse[];
  customerVoucherList: IVoucherListResponse[];
}

export interface IEmployeeResponse {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phoneNumber;
  status: UserStatus;
  gender: string;
  image: string;
  role: IRoleResponse;
  address: string;
}

export interface IRoleResponse {
  id: string;
  name: string;
}

export interface IAddressResponse {
  id: string;
  phoneNumber: string;
  isDefault: boolean;
  districtId: number;
  districtName: string;
  provinceId: number;
  provinceName: string;
  wardCode: string;
  wardName: string;
  more: string;
  customerResponse: ICustomerResponse;
}

export interface IProvinceResponse {
  ProvinceName: any;
  ProvinceID: number;
}

export interface IDistrictResponse {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
}

export interface IWardResponse {
  DistrictID: number;
  WardName: string;
  WardCode: number;
}
export interface IProductResponse {
  id: string;
  name: string;
  code: string;
  description: string;
  image: string;
  status: ProductStatus;
  productDetails: IProductDetailResponse[];
  saleCount: number;
  createdAt: number;
}

export interface IPromotionProductDetailResponse {
  id: string;
  promotion: IPromotionResponse;
}
export interface IPromotionResponse {
  id: string;
  code: string;
  name: string;
  status: VoucherStatus;
  value: number;
  startDate: number;
  endDate: number;
}
export interface IProductDetailResponse {
  id: string;
  tradeMark: IProdAttributeResponse;
  style: IProdAttributeResponse;
  size: IProdAttributeResponse;
  product: IProductResponse;
  material: IProdAttributeResponse;
  color: IColorResponse;
  brand: IProdAttributeResponse;
  sole: IProdAttributeResponse;
  image: string;
  price: number;
  quantity: number;
  saleCount: number;
  status: ProductStatus;
  promotionProductDetails?: IPromotionProductDetailResponse[];
}
export interface IOrderResponse {
  id: string;
  customer: ICustomerResponse;
  employee: IEmployeeResponse;
  voucher?: IVoucherResponse;
  address: IAddressResponse;
  phoneNumber: string;
  fullName: string;
  totalMoney: number;
  shippingMoney: number;
  totalMoney: number;
  originMoney: number;
  reduceMoney: number;
  confirmationDate: number;
  expectedDeliveryDate: number;
  deliveryStartDate: number;
  receivedDate: number;
  createdAt: number;
  type: OrderType;
  note: string;
  code: string;
  orderDetails: IOrderDetailResponse[];
  orderHistories: IOrderHistoryResponse[];
  payments: IPaymentResponse[];
  status: OrderStatus;
}
export interface IOrderDetailResponse {
  id: string;
  order: IOrderResponse;
  productDetail: IProductDetailResponse;
  quantity: number;
  price: number;
  totalPrice: number;
  status: OrderStatus;
}
export interface IOrderHistoryResponse {
  id: string;
  orderId: String;
  orderCode: String;
  actionDescription: string;
  actionStatus: OrderStatus;
  note: string;
  createdAt: number;
}
export interface IPaymentResponse {
  id: string;
  order: IOrderResponse;
  paymentMethod: IPaymentMethodResponse;
  paymentStatus: PaymentStatus;
  transactionCode: string;
  totalMoney: number;
  description: string;
  createdAt: number;
  updatedAt: number;
}
export interface IPaymentMethodResponse {
  id: string;
  name: string;
}
export interface INotificationResponse {
  id: string;
  content: string;
  employee: IEmployee;
  customer: ICustomer;
  href: string;
  notificationType:
    | "ORDER_PLACED"
    | "ORDER_PENDING"
    | "ORDER_CHANGED"
    | "PRODUCT_LOW_STOCK";
  read: boolean;
  delivered: boolean;
  createdAt: number;
  loading: boolean;
}
export interface IOrderNotificationResponse {
  status: OrderStatus;
  count: number;
}
export interface IOrderAuditResponse {
  revisionType: RevisionType;
  revisionNumber: number;
  entity: IOrderResponse;
  changes: {
    [key: string]: {
      oldValue: any;
      newValue: any;
    };
  };
  creator: string;
  at: number;
}
export interface IReturnFormResponse {
  id: string;
  order: IOrderResponse;
  code: string;
  employee: IEmployeeResponse;
  address: IAddressResponse;
  returnFormDetails: IReturnFormDetailResponse[];
  amountToBePaid: number;
  type: ReturnType;
  returnDeliveryStatus: DeliveryStatus;
  paymentType: PaymentType;
  paymentInfo: string;
  refundStatus: RefundStatus;
  createdBy: string;
  createdAt: number;
  returnFormHistories: IReturnFormHistoryResponse[];
}
export interface IReturnFormDetailResponse {
  id: string;
  orderDetail: IOrderDetailResponse;
  quantity: number;
  reason: string;
  feedback: string;
  returnInspectionStatus: InspectionStatus;
  returnInspectionReason: string;
  urlImage: string;
  resellable: boolean;
  createdAt?: number;
}
export interface IReturnFormHistoryResponse {
  id: string;
  returnForm: IReturnFormResponse;
  actionStatus: DeliveryStatus;
  note: string;
  createdAt: number;
  createdBy: string;
}
export interface IReviewResponse {
  id: string;
  customer: ICustomerResponse;
  productDetail: IProductDetailResponse;
  comment: string;
  rating: int;
  urlImage: string;
  status: ReviewStatus;
}
/* End Response */

/* Start Request */
export interface IProdAttributeRequest {
  name: string;
  status: ProductStatus;
}
export interface IProductDetailRequest {
  product: string;
  tradeMark: string;
  style: string;
  size: string;
  material: string;
  color: string;
  brand: string;
  sole: string;
  image: string;
  price: number;
  quantity: number;
  status: string;
}
export interface IOrderDetailRequest {
  id?: string;
  order: string;
  productDetail: string;
  quantity: number;
  price: number;
  totalPrice: number;
  status: OrderStatus;
}
export interface IOrderRequest {
  id: string;
  customer?: string;
  employee?: string;
  voucher?: string;
  address?: string;
  phoneNumber: string;
  fullName: string;
  totalMoney: number;
  shippingMoney: number;
  type: OrderType;
  note: string;
  code: string;
  status: OrderStatus;
}
export interface IPaymentRequest {
  order: string;
  paymentMethod: string;
  totalMoney: number;
  transactionCode: string;
}
export interface IReturnFormRequest {
  code: string;
  employee: string;
  address: IAddressResponse;
  returnDetails: IReturnFormDetailRequest[];
  amountToBePaid: number;
  type: ReturnType;
  returnDeliveryStatus: DeliveryStatus;
  paymentType: PaymentType;
  paymentInfo: string;
  refundStatus: RefundStatus;
}
export interface IReturnFormDetailRequest {
  id?: string;
  orderCode: string;
  orderDetail: string;
  quantity: number;
  returnQuantity: number;
  name: string;
  unitPrice: number;
  reason: string;
  feedback: string;
  returnInspectionStatus: InspectionStatus;
  returnInspectionReason: string;
  evidence: string;
  resellable: boolean;
}
/* End Request */
/* Start Filter Variables */
export interface IProdAttributeFilterVariables {
  q?: string;
  status: ProductStatus;
}

export interface IVoucherFilterVariables {
  q?: string;
  status: VoucherStatus;
  customer: string;
  type: VoucherType;
  value: number;
  constraint: number;
  quantity: number;
  startDate: number;
  endDate: number;
}

export interface IPromotionFilterVariables {
  q?: string;
  status: PromotionStatus;
  value: number;
  startDate: number;
  endDate: number;
}

export interface IProductDetailFilterVariables {
  q?: string;
  tradeMark: string;
  style: string;
  size: string;
  material: string;
  color: string;
  brand: string;
  sole: string;
  priceMin: number;
  priceMax: number;
  quantity: number;
  status: ProductStatus;
}

export interface IOrderFilterVariables {
  q?: string;
  customer: string;
  employee: string;
  voucher: string;
  address: string;
  phoneNumber: string;
  fullName: string;
  type: OrderType;
  code: string;
  status: OrderStatus;
  priceMin: string;
  priceMax: string;
  startDate: number;
  endDate: number;
}

export interface ICustomerFilterVariables {
  q?: string;
  dateOfBirth: number;
  status: UserStatus;
  gender: string;
}

export interface IEmployeeFilterVariables {
  q?: string;
  dateOfBirth: number;
  status: UserStatus;
  gender: string;
}

export interface IRoleFilterVariables {
  q?: string;
}

export interface IPaymentMethodFilterVariables {
  q?: string;
}

export interface IPaymentFilterVariables {
  q?: string;
}

export interface IAddressFilterVariables {
  q?: string;
  phoneNumber: string;
  isDefault: boolean;
  city: string;
  province: string;
}
export interface IProductFilterVariables {
  q?: string;
  status: ProductStatus;
}
export interface IReturnFormFilterVariables {
  q?: string;
  deliveryStatus: string;
  refundStatus: string;
  type: string;
  paymentType: string;
}
/* End Filter Variables */
