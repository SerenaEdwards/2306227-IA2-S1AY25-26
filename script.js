console.log("JavaScript is running..."); //make sure java is connected

// ---------------- Registration Script ----------------
const registerForm = document.getElementById("registerForm");  //gets the form and saves it as a variable

if (registerForm) {  //only runs on register page
  registerForm.addEventListener("submit", function(event) { //listens for the user to press 'register'
    event.preventDefault(); //prevents the form from refreshing the page automatically and allows us to do a validation check on the values

    // Get input values
    const name = document.getElementById("name").value.trim();
    const dob = document.getElementById("dob").value.trim();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validate inputs
    if (!name || !dob || !email || !username || !password) {  //ensures all fields are populated and displays an error message
      alert("All fields are required!");
      return;  
    }

    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/; //regex expression for email
    if (!email.match(emailPattern)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    // Load existing users
    let users = JSON.parse(localStorage.getItem("users")) || [];  //gets already saved users, turns them from text to JS array, if nothing is saved create an empty file

    // Check if username exists
    if (users.some(u => u.username === username)) {
      alert("Username already taken. Please choose another.");
      return;
    }

    // Create new user if they pass all other validation checks
    const newUser = { name, dob, email, username, password };
    users.push(newUser);   //adds new user to the array users

    // Save users
    localStorage.setItem("users", JSON.stringify(users)); //convert array to text(string) before it is stored in local storage

    console.log("User registered successfully!");
    console.log("DEBUG — value of users:", users);
    console.table(users);  //view users

    alert("Registration successful! Please log in.");

    setTimeout(() => {
    window.location.href = "login.html";
    }, 6000); // 6 seconds delay
  
  });
}

// ---------------- Login ----------------
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const enteredUsername = document.getElementById("loginUsername").value.trim();
    const enteredPassword = document.getElementById("loginPassword").value.trim();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(u => u.username === enteredUsername && u.password === enteredPassword); //search for a user that matches the log in info

    if (user) {
      console.log("Login successful:", user);
      alert("Welcome, " + user.name + "! Redirecting to About Us...");

      localStorage.setItem("loggedInUser", JSON.stringify(user)); //allows other pages to know what user is logged in
      window.location.href = "aboutUs.html";  
    } else {
      console.log("Login failed!");
      alert("Invalid username or password.");
    }
  });
}

// ---------------- Navigation Buttons ----------------
const goToSignupBTN = document.getElementById("goToSignupBTN");
if (goToSignupBTN) {
  goToSignupBTN.addEventListener("click", function() {
    window.location.href = "index.html";
  });
}

const goTologinBTN = document.getElementById("goTologinBTN");
if (goTologinBTN) {
  goTologinBTN.addEventListener("click", function() {
    window.location.href = "login.html";
  });
}

// logout button on the side bar
 const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        alert("You have been logged out.");
        window.location.href = "login.html";
    });
}

// 1. Add items to cart (products.html)
// 2. Display, remove, and clear items (cart.html)
// 3. Data stored using localStorage (browser-based)

// WHEN PAGE LOADS
document.addEventListener("DOMContentLoaded", () => {

  // PRODUCTS PAGE: Add to Cart Functionality
  if (window.location.pathname.includes("products.html")) {
    const addToCartButtons = document.querySelectorAll(".product-card button"); //all button elements inside .product-card section 

    addToCartButtons.forEach(button => {
      button.addEventListener("click", () => {  //when a button is clicked get the product's information
        const card = button.parentElement;

        const name = card.querySelector("h3").textContent;
        const price = parseFloat(card.querySelector("p").textContent.replace("$", "").trim());
        const quantity = parseInt(card.querySelector("input").value);
        const img = card.querySelector("img").src;

        // Check if this product has a size dropdown (clothes only)
        const sizeDropdown = card.querySelector(".size");
        let size = null; // default for jewelry / non-sized items
        
        if (sizeDropdown) {
          size = sizeDropdown.value; // get selected size
        }

        // Build product object
        const product = {
          name: name,
          price: parseFloat(price),
          size: size,
          quantity: quantity,
          img: img,
        };

        saveToCart(product);  //saves the object, the function is defined below
      });
    });
  }

  // CART PAGE: Display Cart + Clear Cart Button
  if (window.location.pathname.includes("cart.html")) {
    displayCart();

    const clearButton = document.getElementById("clear-cart");
    if (clearButton) {
      clearButton.addEventListener("click", clearCart);
    }
  }
});

// -------------------------------------------------------------------
// SAVE TO CART (Shared between both pages)
function saveToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Normalize size to null for non-clothes
  if (product.size === undefined || product.size === "") {
    product.size = null;
  }

  // Check if same name + size combo already exists
  const existingItem = cart.find(
    i => i.name === product.name && (i.size ?? null) === (product.size ?? null)  
  );

  if (existingItem) { //if it does increase quantity
    existingItem.quantity += product.quantity;
  } else {
    cart.push(product);  //if it doesnt exits add new product
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  alert(`${product.name}${product.size ? " (" + product.size + ")" : ""} has been added to your cart 🛍️`);
}

// -------------------------------------------------------------------
// Normalize cart (ensure size always has a consistent format) 
// Make sure all products have a size for clothes its s,m etc but for jewelry its null, helps when checking for duplicates
function normalizeCartInStorage() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let changed = false;

  cart = cart.map(it => {  //creates a new array with updated items
    if (it.size === undefined || it.size === "") {
      changed = true;
      return { ...it, size: null }; //replace it with size null, copies all other data and changes size
    }
    return it; //if size is fine return the orginal 
  });

  if (changed) localStorage.setItem("cart", JSON.stringify(cart)); //only save to ls if something was changed

}

// -------------------------------------------------------------------
// DISPLAY CART
function displayCart() {
  normalizeCartInStorage();

  const cartContainer = document.getElementById("cart-container");
  const subtotalElement = document.getElementById("subtotal");
  const discountElement = document.getElementById("discount");
  const taxElement = document.getElementById("tax");
  const totalElement = document.getElementById("total");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty 🛍️</p>";
    subtotalElement.textContent = "Subtotal: $0.00";
    discountElement.textContent = "Discount: -$0.00";
    taxElement.textContent = "Tax (15%): $0.00";
    totalElement.textContent = "Final Total: $0.00";
    return;
  }

  let subtotal = 0;

  cart.forEach(item => {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    const card = document.createElement("div"); //dynamically creates a div
    card.classList.add("cart-item");

    //add product info to the div
    card.innerHTML = `
     <img src="${item.img}" alt="${item.name}">
      <div class="product-info">
        <h3>${item.name}</h3>
        <p>Price: $${item.price.toFixed(2)}</p>
        ${item.size ? `<p>Size: ${item.size}</p>` : ""} <!-- Only shows for clothes -->
        <p>Quantity: ${item.quantity}</p>
        <p><strong>Subtotal: $${itemSubtotal.toFixed(2)}</strong></p>
      </div>
      <div class="product-actions">
        <button class="remove-btn">Remove</button>
      </div>
    `;

    // Normalize size before attaching remove event
    const normalizedSize = (item.size === undefined || item.size === "") ? null : item.size;

    //Deletes the exact item and its size eg Blue Blouse(M) and Blue Blouse(S) are in the cart I can delete just the small and leave the medium
    card.querySelector(".remove-btn")
      .addEventListener("click", () => removeItem(item.name, normalizedSize)); //calls remove item function that is defined below

    cartContainer.appendChild(card);  //after deletion place the new cart into the cart container div
  });

  // Apply discount and tax
  let discount = 0;
  const taxRate = 0.15; // 15%

  if (subtotal >= 6000) {
    discount = subtotal * 0.10; // 10% off orders $6000 or more
  }

  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + tax;

  // Update totals
  subtotalElement.textContent = `Subtotal: $${subtotal.toFixed(2)}`;
  discountElement.textContent = `Discount: -$${discount.toFixed(2)}`;
  taxElement.textContent = `Tax (15%): $${tax.toFixed(2)}`;
  totalElement.textContent = `Final Total: $${total.toFixed(2)}`;
}

// -------------------------------------------------------------------
// REMOVE SINGLE ITEM FROM CART
function removeItem(name, size) {
  const targetSize = (size === undefined || size === "") ? null : size;
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Keep all items except the one being removed
  cart = cart.filter(it => {  //filter creates new array of items you want to keep
    const itemSize = (it.size === undefined || it.size === "") ? null : it.size;
    return !(it.name === name && itemSize === targetSize);
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();  //refreshes and the new cart with deleted items gone
}

// -------------------------------------------------------------------
// CLEAR ENTIRE CART
function clearCart() {
  localStorage.removeItem("cart");

  const cartContainer = document.getElementById("cart-container");
  const subtotalElement = document.getElementById("subtotal");
  const discountElement = document.getElementById("discount");
  const taxElement = document.getElementById("tax");
  const totalElement = document.getElementById("total");

  if (cartContainer) {
    cartContainer.innerHTML = "<p>Your cart is empty 🛍️</p>";
  }

  if (subtotalElement) subtotalElement.textContent = "Subtotal: $0.00";
  if (discountElement) discountElement.textContent = "Discount: -$0.00";
  if (taxElement) taxElement.textContent = "Tax (15%): $0.00";
  if (totalElement) totalElement.textContent = "Final Total: $0.00";

  alert("Your cart has been cleared 🧺");
}

// Redirect to checkout page
if (window.location.pathname.includes("cart.html")) {
  const checkoutBtn = document.getElementById("check-out");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      // Go to checkout page
      window.location.href = "checkout.html";
    });
  }
}

// -------------------------------------------------------------------
// CHECKOUT PAGE FUNCTIONALITY
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("checkout.html")) {

    const checkoutItems = document.getElementById("checkout-items");
    const subtotalElement = document.getElementById("subtotal");
    const discountElement = document.getElementById("discount");
    const taxElement = document.getElementById("tax");
    const totalElement = document.getElementById("total");
    const amountPaidField = document.getElementById("amountPaid");
    const paymentSelect = document.getElementById("payment");
    const cardInfo = document.getElementById("cardInfo");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function displayCheckoutItems() {
      checkoutItems.innerHTML = "";

      if (cart.length === 0) {
        checkoutItems.innerHTML = "<p>Your cart is empty 🛍️</p>";
        subtotalElement.textContent = "$0.00";
        discountElement.textContent = "-$0.00";
        taxElement.textContent = "$0.00";
        totalElement.textContent = "$0.00";
        amountPaidField.value = "";
        return;
      }

      let subtotal = 0;
      cart.forEach(item => {
        const itemSubtotal = item.price * item.quantity;
        subtotal += itemSubtotal;

        const div = document.createElement("div");
        div.classList.add("checkout-item"); //dynamically creates a div
        div.innerHTML = `
         <img src="${item.img}" alt="${item.name}" class="checkout-img">
          <div class="checkout-info">
            <h4>${item.name}</h4>
            ${item.size ? `<p>Size: ${item.size}</p>` : ""}
            <p>Quantity: ${item.quantity}</p>
            <p>Price: $${item.price.toFixed(2)}</p>
            <p><strong>Subtotal: $${itemSubtotal.toFixed(2)}</strong></p>
          </div>
        `;
        checkoutItems.appendChild(div);
      });

      let discount = 0;
      const taxRate = 0.15;
      if (subtotal >= 6000) discount = subtotal * 0.10;

      const tax = (subtotal - discount) * taxRate;
      const total = subtotal - discount + tax;

      subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
      discountElement.textContent = `- $${discount.toFixed(2)}`;
      taxElement.textContent = `$${tax.toFixed(2)}`;
      totalElement.textContent = `$${total.toFixed(2)}`;

      amountPaidField.value = total.toFixed(2);
    }

    displayCheckoutItems();

   // If user picks Card: show card details, If user picks PayPal or Venmo: hide card fields
    paymentSelect.addEventListener("change", () => {
      cardInfo.style.display = paymentSelect.value === "card" ? "block" : "none";
    });

    document.getElementById("confirm").addEventListener("click", () => {
      const name = document.getElementById("name").value.trim();
      const address = document.getElementById("address").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const email = document.getElementById("email").value.trim();
      const payment = paymentSelect.value;
      const amountPaid = parseFloat(amountPaidField.value);
      const total = parseFloat(totalElement.textContent.replace("$", ""));

      if (!name || !address || !phone || !email || !payment) {
        alert("⚠️ Please fill in all required fields.");
        return;
      }

      if (payment === "paypal") {
        window.open("https://www.paypal.com/paypalme/StitchAndThreadCo", "_blank");
      } 
      else if (payment === "venmo") {
        window.open("https://venmo.com/YourVenmoUsername", "_blank");
      } 
      else if (payment === "card") {
        const cardNumber = document.getElementById("cardNumber").value.trim();
        if (cardNumber.length < 16) {
          alert("💳 Please enter a valid 16-digit card number.");
          return;
        }
      }

      if (amountPaid < total) {
        alert("💰 The amount paid is less than the total due.");
        return;
      }
      if (amountPaid > total) {
        alert("⚠️ Please pay the exact total amount.");
        return;
      }

      // Get logged in user
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

      if (!loggedInUser) {
        alert("⚠️ Please log in before checking out.");
        window.location.href = "login.html";
        return;
      }

      // Save full order details (order object)
      const order = {
        id: Date.now(),
        user: loggedInUser.username,   // identifies which user owns this order
        customerName: name,
        address: address,
        phone: phone,
        email: email,
        paymentMethod: payment,
        date: new Date().toLocaleString(),
        items: cart,
        subtotal: parseFloat(subtotalElement.textContent.replace("$", "")),
        discount: parseFloat(discountElement.textContent.replace("- $", "")),
        tax: parseFloat(taxElement.textContent.replace("$", "")),
        total: total
      };

      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      orders.push(order);
      localStorage.setItem("orders", JSON.stringify(orders));

      alert(`✅ Order Confirmed!
Thank you, ${name}!
Total: $${total.toFixed(2)}
Shipping to: ${address}`);

      localStorage.removeItem("cart");
      document.getElementById("shippingForm").reset();
      document.getElementById("paymentForm").reset();

      setTimeout(() => {
        window.location.href = "orders.html";
      }, 400);
    });

    // Cancel / Clear / Close Buttons
    document.getElementById("cancel").addEventListener("click", () => {
      if (confirm("Cancel this order?")) {
        document.getElementById("shippingForm").reset();
        document.getElementById("paymentForm").reset();
      }
    });

    document.getElementById("clear").addEventListener("click", () => {
      if (confirm("Clear all checkout information?")) {
        localStorage.removeItem("cart");
        displayCheckoutItems();
        document.getElementById("shippingForm").reset();
        document.getElementById("paymentForm").reset();
      }
    });

   document.getElementById("close").addEventListener("click", () => {
   alert("Thank you for shopping at Stitch & Thread Co!");
   window.location.href = "login.html"; //redirects to login page
   }); 
  }
});

// -------------------------------------------------------------------
// ORDERS PAGE — DISPLAY SAVED ORDERS (User-specific)
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("orders.html")) {

    const orderList = document.getElementById("orderList");
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
      alert("⚠️ Please log in to view your orders.");
      window.location.href = "login.html";
      return;
    }

    // Filter only orders that belong to this user
    const userOrders = orders.filter(order => order.user === loggedInUser.username);

    if (userOrders.length === 0) {
      orderList.innerHTML = "<p>No orders found for your account.</p>";
      return;
    }

    userOrders.forEach(order => {
      const div = document.createElement("div");
      div.classList.add("order-card");

      const itemsHTML = order.items.map(item => `
        <li>${item.name} (x${item.quantity}) - $${item.price.toFixed(2)}</li>
      `).join("");

      div.innerHTML = `
        <h3>Order #${order.id}</h3>
        <p><strong>Date:</strong> ${order.date}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod}</p>
        <ul>${itemsHTML}</ul>
        <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
        <button class="cancelOrderBtn" data-id="${order.id}">❌ Cancel Order</button>
      `;

      orderList.appendChild(div);
    });

    // === Handle Cancel Order Buttons ===
    orderList.addEventListener("click", e => {
      if (e.target.classList.contains("cancelOrderBtn")) {
        const orderId = parseInt(e.target.dataset.id);
        if (confirm("Are you sure you want to cancel this order?")) {
          // Remove this order from localStorage
          const updatedOrders = orders.filter(o => o.id !== orderId);
          localStorage.setItem("orders", JSON.stringify(updatedOrders));
          alert("🗑️ Order cancelled successfully.");
          location.reload(); // refresh the page to update list
        }
      }
    });
  }
});

// -------------------------------------------------------------------
// CONTACT PAGE
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("contactUs.html")) {
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
      contactForm.addEventListener("submit", function (event) {
        event.preventDefault();
        alert("✅ Message sent! We'll contact you soon.");
        contactForm.reset();
      });
    }
  }
});


// -------------------------------------------------------------------
// PROFILE PAGE
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("profile.html")) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      alert("⚠️ Please log in to view your profile.");
      window.location.href = "login.html";
      return;
    }

    document.getElementById("userName").textContent = loggedInUser.name;
    document.getElementById("userDOB").textContent = loggedInUser.dob;
    document.getElementById("userEmail").textContent = loggedInUser.email;
    document.getElementById("userUsername").textContent = loggedInUser.username;
  }
});

//=== Saving the Confirmed Carts from the Check out page
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("checkout.html")) {
    const confirmButton = document.getElementById("confirm");

    confirmButton.addEventListener("click", () => {
      // Get current cart from localStorage
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }

      // Create a new order object
      const order = {
        id: Date.now(), // unique order ID
        date: new Date().toLocaleString(),
        items: cart,
      };

      // Get previous orders (if any)
      const orders = JSON.parse(localStorage.getItem("orders")) || [];

      // Add this new order
      orders.push(order);

      // Save back to localStorage
      localStorage.setItem("orders", JSON.stringify(orders));

      // Clear the cart after confirming
      localStorage.removeItem("cart");

      alert("✅ Order confirmed and saved!");
      window.location.href = "orders.html"; // redirect to orders page
    });
  }
});
