import React, { ChangeEvent, FormEvent, useState } from "react";
import {
  createProductSchema,
  toFieldErrors,
  type CreateProductInput,
  type FieldErrors,
} from "@inventory/shared";
import Header from "@/app/(components)/Header";

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: CreateProductInput) => Promise<void>;
};

// Inputs hold raw strings, converted to numbers only on submit, so an empty
// field shows a validation message instead of silently becoming NaN or 0.
type FormValues = {
  name: string;
  price: string;
  stockQuantity: string;
  rating: string;
};

const emptyForm: FormValues = {
  name: "",
  price: "",
  stockQuantity: "",
  rating: "",
};

const toNumber = (value: string) => (value.trim() === "" ? NaN : Number(value));

// Pull the server's { message, details.fieldErrors } out of an RTK Query error.
const readApiError = (
  error: unknown
): { message: string; fieldErrors: FieldErrors } => {
  const data = (error as { data?: unknown })?.data as
    | { message?: string; details?: { fieldErrors?: FieldErrors } }
    | undefined;
  return {
    message: data?.message ?? "Could not create product. Please try again.",
    fieldErrors: data?.details?.fieldErrors ?? {},
  };
};

const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateProductModalProps) => {
  const [formData, setFormData] = useState<FormValues>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      const { [name]: _cleared, ...rest } = fieldErrors;
      setFieldErrors(rest);
    }
  };

  const handleClose = () => {
    setFormData(emptyForm);
    setFieldErrors({});
    setFormError(null);
    onClose();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const parsed = createProductSchema.safeParse({
      name: formData.name,
      price: toNumber(formData.price),
      stockQuantity: toNumber(formData.stockQuantity),
      rating:
        formData.rating.trim() === "" ? undefined : toNumber(formData.rating),
    });
    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error.issues));
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(parsed.data);
      handleClose();
    } catch (error) {
      const apiError = readApiError(error);
      setFieldErrors(apiError.fieldErrors);
      setFormError(apiError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputCssStyles = (field: keyof FormValues) =>
    `block w-full p-2 border-2 rounded-md ${
      fieldErrors[field] ? "border-red-500" : "border-gray-500"
    }`;

  const labelCssStyles = "block text-sm font-medium text-gray-700";

  const fieldError = (field: keyof FormValues) =>
    fieldErrors[field] ? (
      <p id={`${field}-error`} className="mt-1 text-sm text-red-600">
        {fieldErrors[field][0]}
      </p>
    ) : null;

  const fieldProps = (field: keyof FormValues) => ({
    id: field,
    name: field,
    value: formData[field],
    onChange: handleChange,
    className: inputCssStyles(field),
    "aria-invalid": Boolean(fieldErrors[field]),
    "aria-describedby": fieldErrors[field] ? `${field}-error` : undefined,
  });

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name="Create New Product" />
        <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
          {formError && (
            <div
              role="alert"
              className="p-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md"
            >
              {formError}
            </div>
          )}

          {/* PRODUCT NAME */}
          <div>
            <label htmlFor="name" className={labelCssStyles}>
              Product Name
            </label>
            <input type="text" placeholder="Name" {...fieldProps("name")} />
            {fieldError("name")}
          </div>

          {/* PRODUCT PRICE */}
          <div>
            <label htmlFor="price" className={labelCssStyles}>
              Product Price
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Price"
              {...fieldProps("price")}
            />
            {fieldError("price")}
          </div>

          {/* PRODUCT STOCK QUANTITY */}
          <div>
            <label htmlFor="stockQuantity" className={labelCssStyles}>
              Stock Quantity
            </label>
            <input
              type="number"
              step="1"
              min="0"
              placeholder="Stock Quantity"
              {...fieldProps("stockQuantity")}
            />
            {fieldError("stockQuantity")}
          </div>

          {/* RATING */}
          <div>
            <label htmlFor="rating" className={labelCssStyles}>
              Rating (optional, 0–5)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              placeholder="Rating"
              {...fieldProps("rating")}
            />
            {fieldError("rating")}
          </div>

          {/* CREATE ACTIONS */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>

            <button
              onClick={handleClose}
              type="button"
              className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;
