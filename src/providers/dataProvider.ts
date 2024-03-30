/**
 * @fileoverview Data provider định nghĩa các hàm cho việc tương tác với API bằng cách sử dụng Axios và các phương thức utils để nối chuỗi api url.
 * Data provider là core cho các hook của thư viện refine.
 * Supported hooks:
 * [useList]{@link https://refine.dev/docs/data/hooks/use-list/} sẽ sử dụng phương thức {@link DataProvider.getList}
 * [useOne]{@link https://refine.dev/docs/data/hooks/use-one/} sẽ sử dụng phương thức {@link DataProvider.getOne}
 * [useCreate]{@link https://refine.dev/docs/data/hooks/use-create-many/} sẽ sử dụng phương thức {@link DataProvider.create}
 * [useCreateMany]{@link https://refine.dev/docs/data/hooks/use-create-many/} sẽ sử dụng phương thức {@link DataProvider.createMany}
 * [useUpdate]{@link https://refine.dev/docs/data/hooks/use-update/} sẽ sử dụng phương thức {@link DataProvider.update}
 * [useDelete]{@link https://refine.dev/docs/data/hooks/use-delete/} sẽ sử dụng phương thức {@link DataProvider.deleteOne}
 * [useApiUrl]{@link https://refine.dev/docs/data/hooks/use-api-url/} sẽ sử dụng phương thức {@link DataProvider.getApiUrl}
 * [useCustom]{@link https://refine.dev/docs/data/hooks/use-custom/} sẽ sử dụng phương thức {@link DataProvider.custom}
 * @see {@link https://refine.dev/docs/data/data-provider/ | Data Provider - Refine}
 * @see {@link https://www.typescriptlang.org/docs/handbook/utility-types.html | Typescript utility types}
 * @param {string} apiUrl - URL của API.
 * @param {AxiosInstance} httpClient - Axios instance được sử dụng cho các request.
 * @returns {Omit<Required<DataProvider>, "updateMany" | "deleteMany">} - Một đối tượng DataProvider.
 */

import { AxiosInstance } from "axios";
import {
  CreateManyParams,
  CreateManyResponse,
  CreateParams,
  CreateResponse,
  CustomParams,
  CustomResponse,
  DataProvider,
  DeleteOneParams,
  DeleteOneResponse,
  GetListParams,
  GetListResponse,
  GetManyParams,
  GetManyResponse,
  GetOneParams,
  GetOneResponse,
  UpdateParams,
  UpdateResponse,
} from "@refinedev/core";
import { axiosInstance } from "../utils/data-provider/axios";
import { generateFilter } from "../utils/data-provider/generateFilter";
import { generateSort } from "../utils/data-provider/generateSort";
import { stringify } from "@refinedev/simple-rest";

type MethodTypes = "get" | "delete" | "head" | "options";
type MethodTypesWithBody = "post" | "put" | "patch";

export const dataProvider = (
  apiUrl: string,
  httpClient: AxiosInstance = axiosInstance
): Omit<Required<DataProvider>, "updateMany" | "deleteMany"> => ({
  /**
   * Lấy danh sách dữ liệu từ API.
   * @param {GetListParams} params - Các tham số cho request.
   * @param {string} params.resource - Tên của tài nguyên (resource) cần lấy dữ liệu.
   * @param {Object} params.pagination - Thông tin về phân trang.
   * @param {Object} params.filters - Các bộ lọc dữ liệu.
   * @param {Array} params.sorters - Thông tin về cách sắp xếp dữ liệu.
   * @param {Object} params.meta - Thông tin meta cho request.
   * @returns {Promise<GetListResponse<TData>>} - Dữ liệu lấy được từ API.
   * @template TData - Kiểu dữ liệu của dữ liệu được trả về.
   */
  getList: async <TData>({
    resource,
    pagination,
    filters,
    sorters,
    meta,
  }: GetListParams): Promise<GetListResponse<TData>> => {
    const url = `${apiUrl}/${resource}`;

    const { current = 1, pageSize, mode = "server" } = pagination ?? {};

    const { headers: headersFromMeta, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";

    const queryFilters = generateFilter(filters);

    const query: {
      page?: number;
      pageSize?: number;
      sortBy?: string;
      orderBy?: string;
    } = {
      sortBy: "updatedAt",
    };

    if (mode === "server") {
      query.page = current - 1;
      query.pageSize = pageSize;
    }

    const generatedSort = generateSort(sorters);
    if (generatedSort) {
      const { sortBy, orderBy } = generatedSort;
      query.sortBy = sortBy.join(",");
      query.orderBy = orderBy.join(",");
    }

    const response = await httpClient[requestMethod](
      `${url}?${stringify(query)}&${stringify(queryFilters)}`,
      {
        headers: headersFromMeta,
      }
    );

    const { content } = response.data;

    const data = content.data;
    const totalElements = content.totalElements;
    const startIndex =
      pageSize !== undefined && current !== undefined
        ? (current + 1) * pageSize
        : 0;

    return {
      data: data,
      total: totalElements,
      startIndex,
    };
  },

  /**
   * Lấy nhiều bản ghi từ API dựa trên các IDs được cung cấp.
   * @param {GetManyParams} params - Các tham số cho request.
   * @param {string} params.resource - Tên của tài nguyên (resource) cần lấy dữ liệu.
   * @param {string[]} params.ids - Mảng các IDs của các bản ghi cần lấy.
   * @param {Object} params.meta - Thông tin meta cho request.
   * @returns {Promise<GetManyResponse<TData>>} - Dữ liệu lấy được từ API.
   * @template TData - Kiểu dữ liệu của dữ liệu được trả về.
   */
  getMany: async <TData>({
    resource,
    ids,
    meta,
  }: GetManyParams): Promise<GetManyResponse<TData>> => {
    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";

    const { data } = await httpClient[requestMethod](
      `${apiUrl}/${resource}?${stringify({ id: ids })}`,
      { headers }
    );

    return {
      data,
    };
  },

  /**
   * Tạo một bản ghi mới trên API.
   * @param {CreateParams<TVariables>} params - Tham số cho request tạo bản ghi mới.
   * @param {string} params.resource - Tên của tài nguyên (resource) cần tạo bản ghi.
   * @param {Object} params.variables - Các biến dữ liệu cần tạo bản ghi.
   * @param {Object} params.meta - Thông tin meta cho request.
   * @returns {Promise<CreateResponse<TData>>} - Dữ liệu của bản ghi đã được tạo.
   * @template TData - Kiểu dữ liệu của dữ liệu của bản ghi đã được tạo.
   * @template TVariables - Kiểu dữ liệu của các biến dữ liệu cần tạo bản ghi.
   */
  create: async <TData, TVariables = {}>({
    resource,
    variables,
    meta,
  }: CreateParams<TVariables>): Promise<CreateResponse<TData>> => {
    const url = `${apiUrl}/${resource}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "post";

    const response = await httpClient[requestMethod](url, variables, {
      headers,
    });

    const data = response.data.content;

    return {
      data,
    };
  },

  /**
   * Tạo nhiều bản ghi mới trên API.
   * @param {CreateManyParams<TVariables>} params - Tham số cho request tạo nhiều bản ghi mới.
   * @param {string} params.resource - Tên của tài nguyên (resource) cần tạo bản ghi.
   * @param {Object} params.variables - Các biến dữ liệu cần tạo bản ghi.
   * @param {Object} params.meta - Thông tin meta cho request.
   * @returns {Promise<CreateManyResponse<TData>>} - Dữ liệu của các bản ghi đã được tạo.
   * @template TData - Kiểu dữ liệu của dữ liệu của bản ghi đã được tạo.
   * @template TVariables - Kiểu dữ liệu của các biến dữ liệu cần tạo bản ghi.
   */
  createMany: async <TData, TVariables>({
    resource,
    variables,
    meta,
  }: CreateManyParams<TVariables>): Promise<CreateManyResponse<TData>> => {
    const url = `${apiUrl}/${resource}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "post";

    const response = await httpClient[requestMethod](url, variables, {
      headers,
    });

    const { content } = response.data;
    const data = content;

    return {
      data,
    };
  },

  /**
   * Cập nhật một bản ghi trên API.
   * @param {UpdateParams<TVariables>} params - Tham số cho request cập nhật bản ghi.
   * @param {string} params.resource - Tên của tài nguyên (resource) cần tạo bản ghi.
   * @param {Object} params.variables - Id của bản ghi.
   * @param {Object} params.variables - Các biến dữ liệu cần tạo bản ghi.
   * @param {Object} params.meta - Thông tin meta cho request.
   * @returns {Promise<UpdateResponse<TData>>} - Dữ liệu của bản ghi đã được cập nhật.
   * @template TData - Kiểu dữ liệu của dữ liệu của bản ghi đã được cập nhật.
   * @template TVariables - Kiểu dữ liệu của các biến dữ liệu cần cập nhật bản ghi.
   */
  update: async <TData, TVariables>({
    resource,
    id,
    variables,
    meta,
  }: UpdateParams<TVariables>): Promise<UpdateResponse<TData>> => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "put";

    const { data } = await httpClient[requestMethod](url, variables, {
      headers,
    });

    return {
      data,
    };
  },

  /**
   * Lấy một bản ghi từ API dựa trên id.
   * @param {GetOneParams} params - Tham số cho request lấy một bản ghi.
   * @returns {Promise<GetOneResponse<TData>>} - Dữ liệu của bản ghi đã được lấy.
   * @template TData - Kiểu dữ liệu của dữ liệu của bản ghi đã được lấy.
   */
  getOne: async <TData>({
    resource,
    id,
    meta,
  }: GetOneParams): Promise<GetOneResponse<TData>> => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};

    const requestMethod = (method as MethodTypes) ?? "get";

    const response = await httpClient[requestMethod](url, { headers });

    const { content } = response.data;

    const data = content;

    return {
      data,
    };
  },

  /**
   * Xóa một bản ghi từ API dựa trên id.
   * @param {DeleteOneParams<TVariables>} params - Tham số cho request xóa một bản ghi.
   * @returns {Promise<DeleteOneResponse<TData>>} - Dữ liệu của bản ghi đã được xóa.
   * @template TData - Kiểu dữ liệu của dữ liệu của bản ghi đã được xóa.
   * @template TVariables - Kiểu dữ liệu của các biến dữ liệu cần xóa bản ghi.
   */
  deleteOne: async <TData, TVariables>({
    resource,
    id,
    variables,
    meta,
  }: DeleteOneParams<TVariables>): Promise<DeleteOneResponse<TData>> => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "delete";

    const response = await httpClient[requestMethod](url, {
      data: variables,
      headers,
    });

    const { content } = response.data;

    const data = content;

    return {
      data,
    };
  },

  /**
   * Lấy URL của API.
   * @returns {string} - URL của API.
   */
  getApiUrl: (): string => {
    return apiUrl;
  },

  /**
   * Thực hiện một request tùy chỉnh đến API.
   * @param {CustomParams<TQuery, TPayload>} params - Tham số cho request tùy chỉnh.
   * @returns {Promise<CustomResponse<TData>>} - Dữ liệu phản hồi từ request tùy chỉnh.
   * @template TData - Kiểu dữ liệu của dữ liệu phản hồi từ request tùy chỉnh.
   * @template TQuery - Kiểu dữ liệu của tham số truy vấn (query) trong request tùy chỉnh.
   * @template TPayload - Kiểu dữ liệu của dữ liệu truyền vào trong request tùy chỉnh.
   */
  custom: async <TData, TQuery, TPayload>({
    url,
    method,
    filters,
    sorters,
    payload,
    query,
    headers,
  }: CustomParams<TQuery, TPayload>): Promise<CustomResponse<TData>> => {
    let requestUrl = `${url}?`;

    if (sorters) {
      const generatedSort = generateSort(sorters);
      if (generatedSort) {
        const { sortBy, orderBy } = generatedSort;
        const sortQuery = {
          sortBy: sortBy.join(","),
          orderBy: orderBy.join(","),
        };
        requestUrl = `${requestUrl}&${stringify(sortQuery)}`;
      }
    }

    if (filters) {
      const filterQuery = generateFilter(filters);
      requestUrl = `${requestUrl}&${stringify(filterQuery)}`;
    }

    if (query) {
      requestUrl = `${requestUrl}&${stringify(query)}`;
    }

    let axiosResponse;
    switch (method) {
      case "put":
      case "post":
      case "patch":
        axiosResponse = await httpClient[method](url, payload, {
          headers,
        });
        break;
      case "delete":
        axiosResponse = await httpClient.delete(url, {
          data: payload,
          headers: headers,
        });
        break;
      default:
        axiosResponse = await httpClient.get(requestUrl, {
          headers,
        });
        break;
    }

    const data = axiosResponse.data.content;
    const response = axiosResponse.data;

    return Promise.resolve({ data, response });
  },
});
