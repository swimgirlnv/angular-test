import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../models/product.model';
import { User } from '../models/user.model';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.css'
})
export class ShoppingCartComponent implements OnInit {
  cartItems: CartItem[] = [];
  isOpen = false;
  currentUser: User | null = null;

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleCart() {
    this.isOpen = !this.isOpen;
  }

  updateQuantity(productId: number, quantity: number) {
    this.cartService.updateQuantity(productId, quantity);
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  get cartTotal(): number {
    return this.cartService.getCartTotal();
  }

  get baseTotal(): number {
    return this.cartService.getCartTotal(false);
  }

  get discountAmount(): number {
    return this.cartService.getDiscountAmount();
  }

  get pointsToEarn(): number {
    return this.cartService.calculatePointsEarned();
  }

  get itemCount(): number {
    return this.cartService.getCartItemCount();
  }

  get userTier(): string {
    return this.currentUser?.tier || 'Bronze';
  }

  get tierDiscount(): number {
    if (this.currentUser) {
      return this.authService.getTierBenefits(this.currentUser.tier).discount * 100;
    }
    return 0;
  }

  checkout() {
    if (this.cartItems.length > 0) {
      const pointsEarned = this.pointsToEarn;
      let message = `Thank you for your order! Total: $${this.cartTotal.toFixed(2)}`;

      if (this.currentUser && pointsEarned > 0) {
        this.authService.addRewardsPoints(pointsEarned);
        message += `\n\nYou earned ${pointsEarned} rewards points!`;
        message += `\nYour new balance: ${this.currentUser.rewardsPoints + pointsEarned} points`;
      }

      alert(message);
      this.clearCart();
      this.isOpen = false;
    }
  }
}
