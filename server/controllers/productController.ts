import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Product, IProduct } from '../models/Product';
import { sendSuccess, sendError, AppError } from '../utils/apiResponse';
import { sampleProducts } from '../seeds/seedProducts';
import { getDatabaseStatus } from '../config/db';

// In-memory fallback repository when MongoDB connection is not configured
let inMemoryProducts: any[] = sampleProducts.map((p, idx) => ({
  _id: new mongoose.Types.ObjectId(`64f1a2b3c4d5e6f7a8b9c0d${idx.toString(16).padStart(1, '0')}`).toString(),
  id: `mock-${idx + 1}`,
  ...p,
  createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
}));

/**
 * GET /api/products
 * Query Parameters:
 * - category: string (e.g. 'ceramics', 'lighting', 'all')
 * - search: string (matches name, description, category, material)
 * - minPrice: number
 * - maxPrice: number
 * - sort: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular'
 * - page: number (default: 1)
 * - limit: number (default: 12)
 * - featured: boolean
 * - bestseller: boolean
 * - newArrival: boolean
 */
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = '1',
      limit = '12',
      featured,
      bestseller,
      newArrival,
      inStock,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;
    const dbStatus = getDatabaseStatus();

    // 1. MONGODB IS CONNECTED
    if (dbStatus.isConnected) {
      const filterQuery: Record<string, any> = {};

      // Category filter
      if (category && category !== 'all') {
        filterQuery.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }

      // Search filter
      if (search && typeof search === 'string' && search.trim() !== '') {
        const searchTerm = search.trim();
        filterQuery.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { category: { $regex: searchTerm, $options: 'i' } },
          { material: { $regex: searchTerm, $options: 'i' } },
        ];
      }

      // Price range
      if (minPrice !== undefined || maxPrice !== undefined) {
        filterQuery.price = {};
        if (minPrice !== undefined && !isNaN(Number(minPrice))) {
          filterQuery.price.$gte = Number(minPrice);
        }
        if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
          filterQuery.price.$lte = Number(maxPrice);
        }
      }

      // Boolean flags
      if (featured === 'true') filterQuery.featured = true;
      if (bestseller === 'true') filterQuery.bestseller = true;
      if (newArrival === 'true') filterQuery.newArrival = true;
      if (inStock === 'true') filterQuery.stock = { $gt: 0 };

      // Sorting
      let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
      switch (sort) {
        case 'price_asc':
          sortOptions = { price: 1 };
          break;
        case 'price_desc':
          sortOptions = { price: -1 };
          break;
        case 'rating':
          sortOptions = { rating: -1, reviews: -1 };
          break;
        case 'popular':
          sortOptions = { bestseller: -1, reviews: -1 };
          break;
        case 'newest':
        default:
          sortOptions = { createdAt: -1 };
          break;
      }

      const total = await Product.countDocuments(filterQuery);
      const products = await Product.find(filterQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      sendSuccess(res, 'Products retrieved successfully', {
        products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
          hasMore: skip + products.length < total,
        },
        filtersApplied: {
          category: category || 'all',
          search: search || null,
          minPrice: minPrice ? Number(minPrice) : null,
          maxPrice: maxPrice ? Number(maxPrice) : null,
          sort,
        },
        database: 'mongodb',
      });
      return;
    }

    // 2. FALLBACK IN-MEMORY (MongoDB not yet connected)
    let filtered = [...inMemoryProducts];

    // Category filter
    if (category && category !== 'all') {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === (category as string).toLowerCase()
      );
    }

    // Search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.material && p.material.toLowerCase().includes(q))
      );
    }

    // Price filter
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      filtered = filtered.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      filtered = filtered.filter((p) => p.price <= Number(maxPrice));
    }

    // Boolean flags
    if (featured === 'true') filtered = filtered.filter((p) => p.featured);
    if (bestseller === 'true') filtered = filtered.filter((p) => p.bestseller);
    if (newArrival === 'true') filtered = filtered.filter((p) => p.newArrival);
    if (inStock === 'true') filtered = filtered.filter((p) => p.stock > 0);

    // Sorting
    switch (sort) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
        break;
      case 'popular':
        filtered.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0) || b.reviews - a.reviews);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limitNum);

    sendSuccess(res, 'Products retrieved successfully (Mock/Seed Mode - Set MONGODB_URI to persist to MongoDB)', {
      products: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasMore: skip + paginated.length < total,
      },
      filtersApplied: {
        category: category || 'all',
        search: search || null,
        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
        sort,
      },
      database: 'offline_fallback',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:id
 */
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const dbStatus = getDatabaseStatus();

    if (dbStatus.isConnected) {
      let product: IProduct | null = null;

      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findById(id);
      } else {
        product = await Product.findOne({ name: new RegExp(`^${id}$`, 'i') });
      }

      if (!product) {
        throw new AppError(`Product with ID '${id}' not found`, 404);
      }

      sendSuccess(res, 'Product retrieved successfully', product);
      return;
    }

    // In-memory fallback
    const product = inMemoryProducts.find(
      (p) => p._id === id || p.id === id || p._id.toString() === id
    );

    if (!product) {
      throw new AppError(`Product with ID '${id}' not found`, 404);
    }

    sendSuccess(res, 'Product retrieved successfully (Mock/Seed Mode)', product);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products (Admin Protected)
 */
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      description,
      category,
      price,
      originalPrice,
      discount,
      images,
      colors,
      material,
      stock,
      featured,
      bestseller,
      newArrival,
    } = req.body;

    if (!name || !description || !category || price === undefined) {
      throw new AppError('Name, description, category, and price are required', 400);
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new AppError('At least one product image URL is required', 400);
    }

    const dbStatus = getDatabaseStatus();

    if (dbStatus.isConnected) {
      const newProduct = await Product.create({
        name,
        description,
        category: category.toLowerCase().trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        discount: discount !== undefined ? Number(discount) : 0,
        images,
        colors: colors || [],
        material,
        stock: stock !== undefined ? Number(stock) : 0,
        featured: Boolean(featured),
        bestseller: Boolean(bestseller),
        newArrival: Boolean(newArrival),
      });

      sendSuccess(res, 'Product created successfully', newProduct, 201);
      return;
    }

    // In-memory creation
    const mockId = new mongoose.Types.ObjectId().toString();
    const createdMock = {
      _id: mockId,
      id: mockId,
      name,
      description,
      category: category.toLowerCase().trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      discount: discount || 0,
      images,
      rating: 0,
      reviews: 0,
      colors: colors || [],
      material: material || '',
      stock: stock !== undefined ? Number(stock) : 10,
      featured: Boolean(featured),
      bestseller: Boolean(bestseller),
      newArrival: Boolean(newArrival),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryProducts.unshift(createdMock);
    sendSuccess(res, 'Product created in temporary memory (Connect MongoDB to persist)', createdMock, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/products/:id (Admin Protected)
 */
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const dbStatus = getDatabaseStatus();

    if (dbStatus.isConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(`Invalid product ID format: '${id}'`, 400);
      }

      const updated = await Product.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updated) {
        throw new AppError(`Product with ID '${id}' not found`, 404);
      }

      sendSuccess(res, 'Product updated successfully', updated);
      return;
    }

    // In-memory update
    const index = inMemoryProducts.findIndex((p) => p._id === id || p.id === id);
    if (index === -1) {
      throw new AppError(`Product with ID '${id}' not found`, 404);
    }

    inMemoryProducts[index] = {
      ...inMemoryProducts[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    sendSuccess(res, 'Product updated in temporary memory', inMemoryProducts[index]);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:id (Admin Protected)
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const dbStatus = getDatabaseStatus();

    if (dbStatus.isConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(`Invalid product ID format: '${id}'`, 400);
      }

      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) {
        throw new AppError(`Product with ID '${id}' not found`, 404);
      }

      sendSuccess(res, `Product '${deleted.name}' deleted successfully`, { id: deleted._id });
      return;
    }

    // In-memory delete
    const index = inMemoryProducts.findIndex((p) => p._id === id || p.id === id);
    if (index === -1) {
      throw new AppError(`Product with ID '${id}' not found`, 404);
    }

    const removed = inMemoryProducts.splice(index, 1)[0];
    sendSuccess(res, `Product '${removed.name}' removed from temporary memory`, { id: removed._id });
  } catch (error) {
    next(error);
  }
};
