document.addEventListener("DOMContentLoaded", function () {
    const cartItemsElement = document.getElementById("cart-items");
    const totalElement = document.getElementById("total");
  
    // Fetch cart items from localStorage or initialize an empty array
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  
    // Function to render cart items
    function renderCartItems() {
      cartItemsElement.innerHTML = "";
  
      // Loop through each item in the cart and display it
      cartItems.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.name} - $${item.price}`;
        cartItemsElement.appendChild(li);
      });
  
      // Calculate and display the total amount
      const total = cartItems.reduce((sum, item) => sum + item.price, 0);
      totalElement.textContent = total.toFixed(2);
    }
  
    // Initial rendering of cart items
    renderCartItems();
  });
  