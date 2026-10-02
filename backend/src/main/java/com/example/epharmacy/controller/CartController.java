package com.example.epharmacy.controller;

import com.example.epharmacy.dto.CartItemRequest;
import com.example.epharmacy.entity.Cart;
import com.example.epharmacy.entity.User;
import com.example.epharmacy.service.CartService;
import com.example.epharmacy.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("hasRole('USER')")
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    public CartController(CartService cartService, UserService userService) {
        this.cartService = cartService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<Cart> getCart(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(cartService.getCartByUserId(user.getId()));
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addItem(Authentication authentication, @Valid @RequestBody CartItemRequest request) {
        User user = userService.getUserByEmail(authentication.getName());
        Cart cart = cartService.addItemToCart(user.getId(), request);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<Cart> updateItemQuantity(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        User user = userService.getUserByEmail(authentication.getName());
        Cart cart = cartService.updateItemQuantity(user.getId(), id, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Cart> removeItem(Authentication authentication, @PathVariable Long id) {
        User user = userService.getUserByEmail(authentication.getName());
        Cart cart = cartService.removeItemFromCart(user.getId(), id);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }
}
