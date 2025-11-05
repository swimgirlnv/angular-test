import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: string[] = [];
  selectedCategory: string = 'All';
  currentUser: User | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe(products => {
      this.products = products;
    });
  }

  loadCategories() {
    this.productService.getCategories().subscribe(categories => {
      this.categories = ['All', ...categories];
    });
  }

  get filteredProducts(): Product[] {
    if (this.selectedCategory === 'All') {
      return this.products;
    }
    return this.products.filter(product => product.category === this.selectedCategory);
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  getPointsForProduct(product: Product): number {
    if (!this.currentUser) return Math.floor(product.price);

    const benefits = this.authService.getTierBenefits(this.currentUser.tier);
    return Math.floor(product.price * benefits.pointsMultiplier);
  }

  getDiscountedPrice(product: Product): number {
    if (!this.currentUser) return product.price;

    const benefits = this.authService.getTierBenefits(this.currentUser.tier);
    return product.price * (1 - benefits.discount);
  }
}
