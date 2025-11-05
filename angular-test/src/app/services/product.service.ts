import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
    {
      id: 1,
      name: 'Organic Bananas',
      price: 2.99,
      image: '🍌',
      category: 'Fruits',
      description: 'Fresh organic bananas, perfect for snacking',
      inStock: true
    },
    {
      id: 2,
      name: 'Fresh Apples',
      price: 3.49,
      image: '🍎',
      category: 'Fruits',
      description: 'Crisp red apples, great for cooking or eating',
      inStock: true
    },
    {
      id: 3,
      name: 'Whole Milk',
      price: 4.29,
      image: '🥛',
      category: 'Dairy',
      description: 'Fresh whole milk, 1 gallon',
      inStock: true
    },
    {
      id: 4,
      name: 'Sourdough Bread',
      price: 3.99,
      image: '🍞',
      category: 'Bakery',
      description: 'Artisan sourdough bread, freshly baked',
      inStock: true
    },
    {
      id: 5,
      name: 'Fresh Carrots',
      price: 1.99,
      image: '🥕',
      category: 'Vegetables',
      description: 'Organic carrots, 2 lb bag',
      inStock: true
    },
    {
      id: 6,
      name: 'Free Range Eggs',
      price: 5.49,
      image: '🥚',
      category: 'Dairy',
      description: 'Farm fresh free range eggs, dozen',
      inStock: true
    },
    {
      id: 7,
      name: 'Fresh Broccoli',
      price: 2.79,
      image: '🥦',
      category: 'Vegetables',
      description: 'Fresh broccoli crowns',
      inStock: true
    },
    {
      id: 8,
      name: 'Strawberries',
      price: 4.99,
      image: '🍓',
      category: 'Fruits',
      description: 'Sweet strawberries, 1 lb container',
      inStock: true
    },
    {
      id: 9,
      name: 'Cheddar Cheese',
      price: 6.99,
      image: '🧀',
      category: 'Dairy',
      description: 'Sharp cheddar cheese block',
      inStock: false
    },
    {
      id: 10,
      name: 'Pasta',
      price: 1.49,
      image: '🍝',
      category: 'Pantry',
      description: 'Italian pasta, 1 lb box',
      inStock: true
    }
  ];

  getProducts(): Observable<Product[]> {
    return of(this.products);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    const filtered = this.products.filter(product => product.category === category);
    return of(filtered);
  }

  getCategories(): Observable<string[]> {
    const categories = [...new Set(this.products.map(product => product.category))];
    return of(categories);
  }
}
