import { z } from "zod";
import { isSafeProductImageUrl } from "@/lib/security";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
});

export const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters.")
    .max(128)
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[0-9]/, "Password must include a number."),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters.").max(160),
  tibetan_name: z.string().trim().max(120).optional().default(""),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens.")
    .max(120),
  sku: z
    .string()
    .trim()
    .regex(/^[A-Z0-9-]{3,40}$/, "SKU must be 3-40 uppercase letters, numbers, or hyphens."),
  category_id: z.string().uuid("Select a valid Tibetan clothing category."),
  description: z.string().trim().min(10, "Description must be at least 10 characters.").max(3000),
  fabric: z.string().trim().min(2, "Specify fabric details.").max(160),
  care_instructions: z.string().trim().max(400).optional().default("Dry clean recommended."),
  price_rupees: z.coerce
    .number()
    .min(1, "Price must be at least ₹1.")
    .max(500000, "Price exceeds maximum allowed limit."),
  compare_at_rupees: z
    .union([z.literal(""), z.null(), z.undefined(), z.coerce.number().min(2).max(600000)])
    .optional(),
  stock_quantity: z.coerce.number().int().min(0).max(10000),
  sizes: z
    .array(z.string().trim().min(1).max(24))
    .min(1, "Select at least one size.")
    .max(12),
  allow_custom_tailoring: z.boolean().default(true),
  lead_time_days: z.coerce.number().int().min(1).max(90).default(7),
  image_url: z
    .string()
    .trim()
    .refine(isSafeProductImageUrl, "Image must be uploaded through S.S Tailors secure media storage."),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required.").max(100),
  tibetan_name: z.string().trim().max(100).optional().default(""),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format.")
    .max(80),
  description: z.string().trim().max(500).optional().default(""),
  sort_order: z.coerce.number().int().min(0).max(1000).default(10),
});

export const checkoutOrderSchema = z
  .object({
    customer_name: z.string().trim().min(2, "Full name is required.").max(120),
    customer_phone: z
      .string()
      .trim()
      .regex(/^[+0-9\s()-]{7,24}$/, "Enter a valid contact phone number."),
    fulfillment_method: z.enum(["delivery", "studio_pickup"]),
    shipping_address: z
      .object({
        line1: z.string().trim().max(200).optional().default(""),
        line2: z.string().trim().max(200).optional().default(""),
        city: z.string().trim().max(100).optional().default(""),
        state: z.string().trim().max(100).optional().default(""),
        postalCode: z.string().trim().max(20).optional().default(""),
      })
      .optional()
      .default({ line1: "", line2: "", city: "", state: "", postalCode: "" }),
    custom_measurements: z
      .object({
        chestInches: z.string().trim().max(24).optional(),
        waistInches: z.string().trim().max(24).optional(),
        hipInches: z.string().trim().max(24).optional(),
        shoulderInches: z.string().trim().max(24).optional(),
        sleeveInches: z.string().trim().max(24).optional(),
        lengthInches: z.string().trim().max(24).optional(),
      })
      .optional()
      .default({}),
    notes: z.string().trim().max(1000).optional().default(""),
    items: z
      .array(
        z.object({
          product_id: z.string().uuid(),
          size: z.string().trim().min(1).max(32),
          quantity: z.number().int().min(1).max(20),
          is_custom_tailored: z.boolean().default(false),
        })
      )
      .min(1, "Your bag is empty.")
      .max(25, "Maximum 25 distinct items per order."),
  })
  .superRefine((data, ctx) => {
    if (data.fulfillment_method === "delivery") {
      if (!data.shipping_address.line1 || data.shipping_address.line1.length < 4) {
        ctx.addIssue({
          code: "custom",
          path: ["shipping_address", "line1"],
          message: "Street address is required for courier delivery.",
        });
      }
      if (!data.shipping_address.city || data.shipping_address.city.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["shipping_address", "city"],
          message: "City is required for courier delivery.",
        });
      }
      if (!data.shipping_address.postalCode || data.shipping_address.postalCode.length < 4) {
        ctx.addIssue({
          code: "custom",
          path: ["shipping_address", "postalCode"],
          message: "PIN / Postal code is required for courier delivery.",
        });
      }
    }
  });

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "tailoring",
    "ready",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

export const tailoringInquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  phone: z
    .string()
    .trim()
    .regex(/^[+0-9\s()-]{7,24}$/, "Please enter a valid phone number."),
  garment_type: z.string().trim().min(2, "Select a garment type.").max(120),
  preferred_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format.")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(1500).optional().default(""),
});
