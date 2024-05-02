 

 function removeFromCart( productId) {
  const cartItemContainer = document.querySelector(`.js-cart-item-container-${productId}`);
  if (cartItemContainer) {
    cartItemContainer.remove();
  }
  // Send a request to the server to delete the product from the cart
  fetch('/delete-product', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productId })
  })
  .then(response => {
    if (response.ok) {
     
      // Product deleted successfully, you can update the UI if needed
      console.log(`Product with ID ${productId} deleted from the cart`);
      
      
    } else {
      // Handle error
      console.error('Failed to delete product from cart');
      
    }
  })
  .catch(error => {
    console.error('Error deleting product from cart:', error);
  });
}
const deleteBtns = document.querySelectorAll('.js-delete-link');
deleteBtns.forEach((link) => {
  link.addEventListener('click', async () => {
    const productId = parseInt(link.dataset.productId);
    await removeFromCart(productId);
  });
});
 
 