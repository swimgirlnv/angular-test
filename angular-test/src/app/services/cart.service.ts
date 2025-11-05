import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product, CartItem } from '../models/product.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor(private authService: AuthService) {}

  addToCart(product: Product, quantity: number = 1) {
    const existingItem = this.cartItems.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ product, quantity });
    }

    this.cartSubject.next([...this.cartItems]);
  }

  removeFromCart(productId: number) {
    this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
    this.cartSubject.next([...this.cartItems]);
  }

  updateQuantity(productId: number, quantity: number) {
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.cartSubject.next([...this.cartItems]);
      }
    }
  }

  clearCart() {
    this.cartItems = [];
    this.cartSubject.next([]);
  }

  getCartTotal(applyDiscount: boolean = true): number {
    const baseTotal = this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);

    if (applyDiscount && this.authService.isLoggedIn) {
      const user = this.authService.currentUser;
      if (user) {
        const benefits = this.authService.getTierBenefits(user.tier);
        return baseTotal * (1 - benefits.discount);
      }
    }

    return baseTotal;
  }

  getCartItemCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  getDiscountAmount(): number {
    const baseTotal = this.cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
    return baseTotal - this.getCartTotal();
  }

  calculatePointsEarned(): number {
    if (!this.authService.isLoggedIn) return 0;

    const user = this.authService.currentUser;
    if (!user) return 0;

    const benefits = this.authService.getTierBenefits(user.tier);
    const total = this.getCartTotal(false); // Get total without discount for points calculation
    return Math.floor(total * benefits.pointsMultiplier);
  }
}
