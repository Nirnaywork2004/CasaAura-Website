import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IColor {
  name: string;
  hex: string;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  rating: number;
  reviews: number;
  colors: IColor[];
  material?: string;
  stock: number;
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ColorSchema = new Schema<IColor>(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive number'],
      index: true,
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price must be positive'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage cannot be less than 0'],
      max: [100, 'Discount percentage cannot exceed 100'],
    },
    images: {
      type: [String],
      required: [true, 'At least one product image is required'],
      validate: {
        validator: function (v: string[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A product must have at least one image URL',
      },
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be greater than 5'],
      index: true,
    },
    reviews: {
      type: Number,
      default: 0,
      min: [0, 'Reviews count cannot be negative'],
    },
    colors: {
      type: [ColorSchema],
      default: [],
    },
    material: {
      type: String,
      trim: true,
      maxlength: [100, 'Material name cannot exceed 100 characters'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    bestseller: {
      type: Boolean,
      default: false,
      index: true,
    },
    newArrival: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: any) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound text index for text search
ProductSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  material: 'text',
});

// Auto-calculate discount if originalPrice > price and discount not explicitly set
ProductSchema.pre('save', function () {
  if (this.originalPrice && this.originalPrice > this.price && (!this.discount || this.discount === 0)) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
});

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
